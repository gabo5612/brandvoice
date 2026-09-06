# brandvoice — static demo

One real generation, replayed: the brief, the brand context that shaped the prompts, all
thirteen pipeline steps with their models, tokens, durations and costs, and the article
that came out.

## What runs here and what does not

| Component | In the demo | Why |
|---|---|---|
| The pipeline trace (outline → draft ×7 → images → QA → SEO) | ✅ replayed | Recorded by the cost ledger as it ran |
| Cost ledger | ✅ recomputed | tokens × the app's own pricing table, diffed against what Postgres stored |
| Brand profile and retrieval summary | ✅ replayed | The inputs that made the draft sound like that brand |
| Finished article, title tag, meta, slug, JSON-LD | ✅ rendered | The real output, sanitised before it is inserted |
| Model calls, Supabase, Inngest, auth | ❌ | They need keys and a database; none of that belongs in a public demo |

## Honesty notes

- **The client's name is replaced with a placeholder.** Tokens, costs, durations, the order
  of the steps and the text itself are untouched — only the proper noun changes, so the
  page cannot read as content published by a real company.
- **The replay is compressed.** The pipeline took 173 seconds of real model time; the page
  plays it in about fifteen, keeping each step's share of the timeline. Every duration
  printed is the recorded one.
- **One ledger row is billed per image, not per token**, so a token-based estimate cannot
  verify it. It is counted in the total and excluded from the comparison, and the page
  says so rather than quietly folding it in.

## Verifying the ledger

```bash
node verify.mjs      # 12/12 ledger rows agree with tokens × pricing · total $0.153691
```

The pricing table is read out of `lib/ai/cost.ts` at export time, so the demo cannot
"verify" a price the app never charged.

## Deploying

```bash
cd demo
vercel --prod
```

Static files only — no environment variables, no build step, no Next.js.

## Regenerating

```bash
supabase start
node scripts/export-demo.mjs
```

Picks the most recent article that has a full trace.
