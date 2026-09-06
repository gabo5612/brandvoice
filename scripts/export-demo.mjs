// Exports one real generation — brief, brand context, every pipeline step, the cost
// ledger and the finished article — so the demo can replay it with no backend.
//
//   node scripts/export-demo.mjs
//
// What travels and what does NOT:
//   YES  the trace as the pipeline wrote it: step, model, tokens, cost, duration, payload
//   YES  the brand profile that shaped the prompts, and the finished article
//   YES  the pricing table, read out of lib/ai/cost.ts so the demo cannot drift from it
//   NO   Supabase, Inngest, the model calls, anyone's credentials
//
// The client's name is replaced with a placeholder. Everything measured — tokens, cost,
// duration, the order of the steps — is left exactly as recorded; only the proper noun
// changes, so the page never reads as content published by a real company.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTAINER = process.env.SUPABASE_DB_CONTAINER || "supabase_db_brandvoice";
const REPLACEMENTS = [[/Swift Insurance/g, "Northwind Insurance"], [/\bSwift\b/g, "Northwind"]];

const sql = (query) =>
  JSON.parse(execFileSync("docker", [
    "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-tAc",
    `select coalesce(json_agg(t), '[]'::json)::text from (${query}) t`,
  ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim());

const anonymise = (value) => {
  if (typeof value === "string") return REPLACEMENTS.reduce((s, [re, to]) => s.replace(re, to), value);
  if (Array.isArray(value)) return value.map(anonymise);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, anonymise(v)]));
  return value;
};

// The pricing table is the source of truth for the ledger, so read it rather than repeat
// it: a demo that quotes stale prices would "verify" a cost the app never charged.
function pricing() {
  const src = readFileSync(join(ROOT, "lib/ai/cost.ts"), "utf8");
  const block = src.match(/MODEL_PRICING[^=]*=\s*{([\s\S]*?)\n}/);
  if (!block) throw new Error("could not find MODEL_PRICING in lib/ai/cost.ts");
  const out = {};
  for (const m of block[1].matchAll(/'([^']+)':\s*{\s*input:\s*([\d.]+),\s*output:\s*([\d.]+)/g)) {
    out[m[1]] = { input: Number(m[2]), output: Number(m[3]) };
  }
  if (!Object.keys(out).length) throw new Error("MODEL_PRICING parsed empty");
  return out;
}

// The article with a full trace: the one worth replaying.
const [article] = sql(`
  select a.id, a.title, a.objective, a.keywords, a.target_words, a.status,
         a.model_provider::text as model_provider, a.model_id, a.created_at,
         b.name as brand_name
    from app.articles a join app.brands b on b.id = a.brand_id
   where (select count(*) from app.generations g where g.article_id = a.id) > 1
   order by a.created_at desc limit 1`);

if (!article) throw new Error("no article with a recorded trace — run a generation first");

const [body] = sql(`
  select body_markdown, body_html, title_tag, meta_description, slug, jsonld
    from app.article_body where article_id = '${article.id}'`);

const [profile] = sql(`
  select tone_of_voice, audience, key_messages, dos, donts, copy_examples, ctas,
         banned_words
    from app.brand_profiles where brand_id =
      (select brand_id from app.articles where id = '${article.id}')`);

const steps = sql(`
  select step, provider::text as provider, model_id, tokens_in, tokens_out,
         cost_usd::float8 as cost_usd, duration_ms, status, payload, created_at
    from app.generations where article_id = '${article.id}' order by created_at`);

const models = sql(`select model_id, label, provider::text as provider, capabilities, active
                      from app.ai_models order by provider, model_id`);

const data = anonymise({
  generated_at: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  brand: { name: article.brand_name, profile },
  article: {
    title: article.title, objective: article.objective, keywords: article.keywords,
    target_words: article.target_words, status: article.status,
    provider: article.model_provider, model_id: article.model_id, created_at: article.created_at,
  },
  body,
  steps,
  models,
  pricing: pricing(),
});

mkdirSync(join(ROOT, "demo"), { recursive: true });
writeFileSync(join(ROOT, "demo/data.json"), JSON.stringify(data), "utf8");

const total = steps.reduce((a, s) => a + s.cost_usd, 0);
console.log({
  steps: steps.length,
  words: (body?.body_markdown || "").split(/\s+/).filter(Boolean).length,
  cost_usd: Number(total.toFixed(6)),
  seconds: Math.round(steps.reduce((a, s) => a + (s.duration_ms || 0), 0) / 1000),
  kb: Math.round(Buffer.byteLength(JSON.stringify(data)) / 1024),
});
