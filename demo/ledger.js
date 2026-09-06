// Port of lib/ai/cost.ts. The demo recomputes what each step cost from its tokens and
// the app's pricing table, and diffs that against the ledger row Postgres stored. Both
// the page and `verify.mjs` use this, so the badge on screen and the check in the
// terminal cannot disagree.

export function estimateCostUsd(pricing, modelId, tokensIn, tokensOut) {
  const price = pricing[modelId];
  if (!price) return null;            // unpriced model: the app records 0 and says so
  const cost = (tokensIn / 1e6) * price.input + (tokensOut / 1e6) * price.output;
  return Math.round(cost * 1e6) / 1e6;   // cost_usd is NUMERIC(10,6)
}

// Image generation is billed per image, not per token, so a token-based estimate cannot
// verify it. Saying so is the honest move: the row is counted in the total and excluded
// from the comparison.
export const isPerImage = (step) => step.tokens_in === 0 && step.tokens_out === 0 && step.cost_usd > 0;

export function auditLedger(data) {
  const rows = [];
  for (const step of data.steps) {
    const expected = estimateCostUsd(data.pricing, step.model_id, step.tokens_in, step.tokens_out);
    const perImage = isPerImage(step);
    rows.push({
      step: step.step,
      model: step.model_id,
      recorded: step.cost_usd,
      expected,
      perImage,
      agrees: perImage || expected === null
        ? null
        : Math.abs(expected - step.cost_usd) < 5e-7,
    });
  }
  const checked = rows.filter((r) => r.agrees !== null);
  return {
    rows,
    checked: checked.length,
    agree: checked.filter((r) => r.agrees).length,
    perImage: rows.filter((r) => r.perImage).length,
    total: data.steps.reduce((a, s) => a + s.cost_usd, 0),
    tokensIn: data.steps.reduce((a, s) => a + s.tokens_in, 0),
    tokensOut: data.steps.reduce((a, s) => a + s.tokens_out, 0),
    ms: data.steps.reduce((a, s) => a + (s.duration_ms || 0), 0),
  };
}
