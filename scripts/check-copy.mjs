// Pre-launch content check (run with `npm run check`, after a build).
//
// Verifies the built site against the approved handoff copy in
// tests/approved-copy.json:
//   - every approved paragraph and heading appears verbatim on its page
//   - the main navigation labels and order match the handoff
//   - no numbering is shown before the Areas of Expertise titles
//   - developer-only notes and non-approved terms do not appear
//   - every page has exactly one <h1> and every image has alt text
// With --launch it also fails while the contact placeholders are still in use.
import fs from "node:fs";
import path from "node:path";

const SITE = "_site";
const launch = process.argv.includes("--launch");
const approved = JSON.parse(fs.readFileSync("tests/approved-copy.json", "utf8"));
const errors = [];
const warnings = [];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

// Visible text: drop scripts, styles and SVG; inline tags vanish, block tags become spaces.
const toText = (html) =>
  decode(
    html
      .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/?(span|a|em|strong|b|i|abbr)\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const read = (url) => {
  const file = path.join(SITE, url.endsWith("/") ? url + "index.html" : url);
  if (!fs.existsSync(file)) {
    errors.push(`Missing page ${url} (${file}). Run "npm run build" first.`);
    return null;
  }
  return fs.readFileSync(file, "utf8");
};

const mainOf = (html) => html.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? "";

// 1. Approved copy, verbatim, on the right page.
for (const [url, paragraphs] of Object.entries(approved.pages)) {
  const html = read(url);
  if (!html) continue;
  const text = toText(mainOf(html));
  for (const p of paragraphs) {
    // "Email: [Insert …]" is satisfied by the placeholder or by the real details once supplied.
    const [before, after] = p.split(/\[Insert [^\]]+\]/);
    const found =
      after === undefined
        ? text.includes(p)
        : new RegExp(escapeRegExp(before) + "\\S.*?" + escapeRegExp(after)).test(text);
    if (!found) errors.push(`${url}: approved copy not found verbatim:\n    "${p}"`);
  }
}

// 2. Navigation labels and order.
const home = read("/");
if (home) {
  const nav = home.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const labels = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((m) => toText(m[1]));
  if (JSON.stringify(labels) !== JSON.stringify(approved.navigation)) {
    errors.push(`Main navigation is [${labels.join(" · ")}], expected [${approved.navigation.join(" · ")}]`);
  }
}

// 3. Site-wide rules.
const htmlFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "admin") walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
};
if (fs.existsSync(SITE)) walk(SITE);

const forbidden = [
  "PART 2",
  "PART 1",
  "DEVELOPER",
  "Do not publish",
  "implementation notes",
  "Verbal Behavior",
  "use this exact order",
];
const areaTitles = approved.pages["/areas-of-expertise/"].filter((t) => /^[A-Z]/.test(t));
let placeholders = false;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const text = toText(html);
  const rel = path.relative(SITE, file);
  for (const phrase of forbidden) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) errors.push(`${rel}: contains non-website text "${phrase}"`);
  }
  for (const title of areaTitles) {
    if (new RegExp(`\\d+\\.\\s*${escapeRegExp(title)}`).test(text)) {
      errors.push(`${rel}: numbering shown before "${title}"`);
    }
  }
  if (/\bIBA\b/.test(text.replace("International Behavior Analyst (IBA)", ""))) {
    errors.push(`${rel}: "IBA" used outside the approved sentence`);
  }
  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) errors.push(`${rel}: has ${h1s} <h1> elements (expected 1)`);
  for (const img of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\balt="[^"]+"/.test(img)) errors.push(`${rel}: image without alt text: ${img.slice(0, 80)}…`);
  }
  if (/\[Insert [^\]]+\]/.test(text)) placeholders = true;
}

if (placeholders) {
  const msg = "Contact placeholders ([Insert …]) are still shown — replace them once Jessy supplies her details.";
  (launch ? errors : warnings).push(msg);
}

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
const count = Object.values(approved.pages).flat().length;
console.log(`✓ ${count} approved paragraphs and headings found verbatim across ${Object.keys(approved.pages).length} pages.`);
console.log("✓ Navigation order, numbering, headings, image alt text and excluded content all check out.");
