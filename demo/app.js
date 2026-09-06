import { auditLedger, estimateCostUsd, isPerImage } from "./ledger.js";

const $ = (s) => document.querySelector(s);
const usd = (v) => `$${v.toFixed(6)}`;
const int = (v) => v.toLocaleString("en");
const secs = (ms) => `${(ms / 1000).toFixed(1)}s`;

// The whole trace took 173 seconds of real model time. Replaying that literally would be
// a page nobody watches, so it is compressed to about fifteen — and the durations printed
// on each step stay the recorded ones.
const REPLAY_SECONDS = 15;

let DATA = null, audit = null, replaying = false;

init();

async function init() {
  DATA = await (await fetch("./data.json")).json();
  audit = auditLedger(DATA);

  const created = new Date(DATA.article.created_at);
  $("#status").textContent =
    `${DATA.brand.name} · ${DATA.steps.length} pipeline steps · ` +
    `generated ${created.toISOString().slice(0, 10)} · replayed from the cost ledger`;
  $("#prov").innerHTML =
    `Trace exported ${DATA.generated_at.slice(0, 10)} · models ` +
    [...new Set(DATA.steps.map((s) => s.model_id))].map((m) => `<code>${m}</code>`).join(" ");

  renderTiles();
  renderBrief();
  renderProfile();
  renderSteps();
  renderVerdict();
  renderOutput();

  $("#speed").textContent = `real time ${secs(audit.ms)}, replayed in ~${REPLAY_SECONDS}s`;
  $("#run").onclick = replay;
  $("#skip").onclick = () => { revealAll(); };
}

function renderTiles() {
  const words = (DATA.body?.body_markdown || "").split(/\s+/).filter(Boolean).length;
  const tiles = [
    [usd(audit.total), "cost of this article"],
    [int(words), "words produced"],
    [secs(audit.ms), "model time"],
    [`${int(audit.tokensIn + audit.tokensOut)}`, "tokens in + out"],
  ];
  $("#tiles").innerHTML = tiles
    .map(([n, l]) => `<div class="tile"><div class="n">${n}</div><div class="l">${l}</div></div>`)
    .join("");
}

function renderBrief() {
  const a = DATA.article;
  $("#brief").innerHTML = row("objective", esc(a.objective || "—"))
    + row("keywords", (a.keywords || []).length
      ? `<div class="chips">${a.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>`
      : "—")
    + row("target length", a.target_words ? `${a.target_words} words` : "—")
    + row("model", `<code>${esc(a.provider)} · ${esc(a.model_id)}</code>`)
    + row("status", esc(a.status));
}

function renderProfile() {
  const p = DATA.brand.profile || {};
  const fields = [
    ["tone of voice", p.tone_of_voice], ["audience", p.audience],
    ["key messages", p.key_messages], ["do", p.dos], ["don't", p.donts],
    ["CTAs", p.ctas], ["banned words", (p.banned_words || []).join(", ")],
  ];
  $("#profile").innerHTML = fields
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => row(k, esc(String(v)).replace(/\r?\n/g, "<br>")))
    .join("");
}

const row = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;

function renderSteps() {
  const wrap = $("#steps");
  wrap.innerHTML = "";
  DATA.steps.forEach((s, i) => {
    const el = document.createElement("details");
    el.className = "step";
    el.dataset.index = String(i);
    const expected = estimateCostUsd(DATA.pricing, s.model_id, s.tokens_in, s.tokens_out);
    const perImage = isPerImage(s);
    // The first row is the retrieval that precedes the outline, and several rows share the
    // step name "draft" — one per section. The payload's own kind is what tells them apart.
    const kind = s.payload?.kind && s.payload.kind !== s.step ? s.payload.kind : null;
    const label = s.payload?.heading ? `${s.step} · ${s.payload.heading}` : s.step;
    el.innerHTML =
      `<summary><span class="sname">${esc(label)}</span>` +
      (kind ? `<span class="tag">${esc(kind)}</span>` : "") +
      `<span class="tag">${esc(s.model_id)}</span>` +
      `<span class="num">${int(s.tokens_in)} in · ${int(s.tokens_out)} out</span>` +
      `<span class="num">${s.duration_ms ? secs(s.duration_ms) : "—"}</span>` +
      `<span class="num">${usd(s.cost_usd)}</span></summary>` +
      `<div class="body">${payloadView(s.payload)}` +
      `<div class="num" style="margin-top:9px">ledger ${usd(s.cost_usd)} · ` +
      (perImage
        ? "billed per image, not per token — no token estimate applies"
        : expected === null
          ? "model not in the pricing table"
          : `recomputed ${usd(expected)} ${Math.abs(expected - s.cost_usd) < 5e-7 ? "✓" : "✗"}`) +
      `</div></div>`;
    wrap.appendChild(el);
  });
}

function payloadView(payload) {
  if (!payload) return `<div class="num">no payload recorded for this step</div>`;
  if (payload.kind === "outline" && Array.isArray(payload.sections)) {
    return `<div><b>${esc(payload.title || "outline")}</b></div><ol>` +
      payload.sections.map((s) =>
        `<li>${esc(s.heading)}<ul>${(s.keyPoints || []).map((p) => `<li class="num">${esc(p)}</li>`).join("")}</ul></li>`)
        .join("") + `</ol>`;
  }
  if (payload.kind === "brand-context") {
    return `<div>Retrieval over the brand's corpus before a single word is written.</div>` +
      `<div class="num" style="margin-top:6px">` +
      `${payload.chunks?.length ?? 0} chunks retrieved · ${payload.contextChars ?? 0} characters of context · ` +
      `profile fields used: ${(payload.profileFields || []).join(", ") || "—"}</div>`;
  }
  return `<pre>${esc(JSON.stringify(payload, null, 2))}</pre>`;
}

function renderVerdict() {
  const el = $("#verdict");
  const ok = audit.agree === audit.checked;
  el.classList.toggle("bad", !ok);
  el.innerHTML = ok
    ? `<span class="pass">✓</span><span><b>${audit.agree}/${audit.checked}</b> ledger rows recomputed in this
       browser match what the pipeline charged, from tokens × the app's own pricing table.
       ${audit.perImage} row${audit.perImage === 1 ? " is" : "s are"} billed per image rather than per token and
       cannot be verified that way — counted in the total, excluded from the comparison.</span>`
    : `<span class="fail">✗</span><span>${audit.checked - audit.agree} of ${audit.checked} ledger rows do not match
       the recomputed cost. Do not trust the total on this page.</span>`;
}

function renderOutput() {
  const b = DATA.body || {};
  $("#seo").innerHTML = row("title tag", esc(b.title_tag || "—"))
    + row("meta description", esc(b.meta_description || "—"))
    + row("slug", `<code>${esc(b.slug || "—")}</code>`)
    + row("JSON-LD", b.jsonld ? `<code>${esc(b.jsonld["@type"] || "present")}</code>` : "—");
  $("#article").innerHTML = sanitise(b.body_html || "<p>(no body)</p>");
}

// The body is HTML a model wrote. It is rendered, so it goes through a scrub first:
// scripts, styles, frames and event handlers never reach the page.
function sanitise(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta,form").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((n) => {
    for (const attr of [...n.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || (["href", "src"].includes(name) && value.startsWith("javascript:"))) {
        n.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

function revealAll() {
  document.querySelectorAll(".step").forEach((el) => {
    el.classList.remove("active");
    el.classList.add("done");
  });
  setLedger(DATA.steps.length);
}

function setLedger(upTo) {
  const slice = DATA.steps.slice(0, upTo);
  $("#cost").textContent = usd(slice.reduce((a, s) => a + s.cost_usd, 0));
  $("#tin").textContent = int(slice.reduce((a, s) => a + s.tokens_in, 0));
  $("#tout").textContent = int(slice.reduce((a, s) => a + s.tokens_out, 0));
  $("#wall").textContent = secs(slice.reduce((a, s) => a + (s.duration_ms || 0), 0));
}

async function replay() {
  if (replaying) return;
  replaying = true;
  $("#run").disabled = true;
  document.querySelectorAll(".step").forEach((el) => el.classList.remove("done", "active"));
  setLedger(0);

  // Each step keeps its share of the real timeline; the whole thing is just compressed.
  const scale = (REPLAY_SECONDS * 1000) / Math.max(1, audit.ms);
  const nodes = [...document.querySelectorAll(".step")];
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].classList.add("active");
    nodes[i].scrollIntoView({ block: "center", behavior: "smooth" });
    await sleep(Math.max(240, (DATA.steps[i].duration_ms || 0) * scale));
    nodes[i].classList.remove("active");
    nodes[i].classList.add("done");
    setLedger(i + 1);
  }
  $("#run").disabled = false;
  $("#run").textContent = "Replay again";
  replaying = false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
