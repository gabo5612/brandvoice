# AI context

> **quill — multi-tenant RAG editorial platform**
>
> Retrieval-augmented article generation with a human review step. Multi-tenant with RLS, per-brand corpora, an audit trail and a per-generation cost ledger.

This file exists so an AI assistant — or a person in a hurry — can understand the project
**in full** without reading files at random. The reading order below is not arbitrary: each
file assumes the previous one.

## 🔗 Open with the context already loaded

**[▸ Open in ChatGPT with this project explained](https://chatgpt.com/?q=I%20want%20you%20to%20understand%20the%20public%20repository%20https%3A%2F%2Fgithub.com%2Fgabo5612%2Fquill%20thoroughly.%0A%0Aquill%20%E2%80%94%20multi-tenant%20RAG%20editorial%20platform%0ARetrieval-augmented%20article%20generation%20with%20a%20human%20review%20step.%20Multi-tenant%20with%20RLS%2C%20per-brand%20corpora%2C%20an%20audit%20trail%20and%20a%20per-generation%20cost%20ledger.%0A%0ARead%20these%20files%20IN%20THIS%20ORDER%2C%20because%20each%20assumes%20the%20previous%20one%3A%0A1.%20%60README.md%60%20%E2%80%94%20the%20stack%20and%20how%20ingestion%2C%20retrieval%20and%20generation%20work%0A2.%20%60lib%2Frag%2F%60%20%E2%80%94%20why%20the%20model%20and%20the%20dimension%20are%20imported%20from%20the%20same%20module%0A3.%20%60lib%2Fingestion%2F%60%20%E2%80%94%20the%20pipeline%20and%20why%20embedding%20happens%20in%20batches%20of%20100%0A4.%20%60scripts%2Fqa%2FREADME.md%60%20%E2%80%94%20the%20harness%20that%20drives%20the%20real%20UI%20and%20verifies%20in%20the%20database%0A%0APay%20particular%20attention%20to%20the%20code%20comments%3A%20they%20explain%20WHY%20something%20is%20done%20one%20way%20and%20not%20another%2C%20and%20there%20is%20almost%20always%20a%20real%20bug%20behind%20it.%0A%0AWhen%20you%27re%20done%2C%20answer%20these%20questions%20with%20evidence%20from%20the%20code%3A%0A-%20Why%20does%20cosine%20distance%20stop%20meaning%20anything%20if%20ingestion%20and%20retrieval%20diverge%3F%0A-%20Which%20defects%20were%20invisible%20from%20the%20outside%2C%20and%20how%20were%20they%20found%3F%0A%0ADon%27t%20just%20summarise%20the%20README.%20I%20want%20you%20to%20be%20able%20to%20discuss%20the%20design%20decisions.)**

That link carries the prompt pre-loaded. If you'd rather assemble it yourself, paste this:

```text
I want you to understand the public repository https://github.com/gabo5612/quill thoroughly.

quill — multi-tenant RAG editorial platform
Retrieval-augmented article generation with a human review step. Multi-tenant with RLS, per-brand corpora, an audit trail and a per-generation cost ledger.

Read these files IN THIS ORDER, because each assumes the previous one:
1. `README.md` — the stack and how ingestion, retrieval and generation work
2. `lib/rag/` — why the model and the dimension are imported from the same module
3. `lib/ingestion/` — the pipeline and why embedding happens in batches of 100
4. `scripts/qa/README.md` — the harness that drives the real UI and verifies in the database

Pay particular attention to the code comments: they explain WHY something is done one way and not another, and there is almost always a real bug behind it.

When you're done, answer these questions with evidence from the code:
- Why does cosine distance stop meaning anything if ingestion and retrieval diverge?
- Which defects were invisible from the outside, and how were they found?

Don't just summarise the README. I want you to be able to discuss the design decisions.
```

## Reading order

| # | File | Why |
|---|---|---|
| 1 | `README.md` | the stack and how ingestion, retrieval and generation work |
| 2 | `lib/rag/` | why the model and the dimension are imported from the same module |
| 3 | `lib/ingestion/` | the pipeline and why embedding happens in batches of 100 |
| 4 | `scripts/qa/README.md` | the harness that drives the real UI and verifies in the database |

## The questions this project answers

- Why does cosine distance stop meaning anything if ingestion and retrieval diverge?
- Which defects were invisible from the outside, and how were they found?

## How this code is written

Three things that repeat throughout the repository and are worth knowing before reading it:

1. **Comments explain the *why*, not the *what*.** If a comment says something is done in an
   odd way, there is a real bug behind it — almost always a silent one.
2. **What could not be measured is stated, not filled in.** An `n/a` is an answer; a filler
   zero is a lie that later gets copied into a README.
3. **The tests that matter are the ones proving the verification works** — not just that the
   code passes. Look for the ones that inject a failure on purpose and require it to be
   caught.

---
*Generated 2026-09-06. If the project has moved on, this file may be stale: the code wins.*
