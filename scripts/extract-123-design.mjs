import fs from "fs";

const html = fs.readFileSync(
  "123/NodeMeta - Decentralized Mining Ecosystem.html",
  "utf8",
);
const css = fs.readFileSync(
  "123/NodeMeta - Decentralized Mining Ecosystem_files/2zamdn8k7kew0.css",
  "utf8",
);

const patterns = [
  "hero-visual",
  "hero-float-tag",
  "hero-feature-row",
  "hero-stats",
  "eyebrow",
  "btn-primary",
  "hero-medallion",
  "hero-globe",
  "hero-orbit",
  "hero-glow",
  ".ft-1",
  ":root{",
];

for (const p of patterns) {
  const idx = css.indexOf(p);
  if (idx >= 0) console.log("\n=== CSS", p, "===\n", css.slice(idx, idx + 600));
}

const texts = [
  "Official Announcement",
  "AI-Powered",
  "The Future of",
  "Web3 Utility",
  "Explore Ecosystem",
  "View Roadmap",
  "TOOLS HUB",
  "GLOBAL COMMUNITY",
];
for (const t of texts) {
  const idx = html.indexOf(t);
  if (idx >= 0) console.log("\n=== HTML", t, "===\n", html.slice(Math.max(0, idx - 120), idx + 200));
}
