// Recomputes the cost ledger from tokens and the app's pricing table and diffs it against
// what Postgres stored for that generation.
//
//   node verify.mjs
//
// Same computation the page performs, in the terminal, exit code 1 on any disagreement.

import { readFileSync } from "node:fs";
import { auditLedger } from "./ledger.js";

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const audit = auditLedger(data);

for (const r of audit.rows) {
  if (r.agrees === false) {
    console.error(`✗ ${r.step} (${r.model}): ledger $${r.recorded}, recomputed $${r.expected}`);
  }
}

const failed = audit.checked - audit.agree;
console.log(
  `${audit.agree}/${audit.checked} ledger rows agree with tokens × pricing` +
  ` · ${audit.perImage} billed per image (not token-verifiable)` +
  ` · total $${audit.total.toFixed(6)}`
);
process.exit(failed ? 1 : 0);
