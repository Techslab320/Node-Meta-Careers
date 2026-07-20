import fs from "fs";

const html = fs.readFileSync("123/NodeMeta - Decentralized Mining Ecosystem.html", "utf8");
const css = fs.readFileSync(
  "123/NodeMeta - Decentralized Mining Ecosystem_files/2zamdn8k7kew0.css",
  "utf8",
);

const lf = css.match(/@keyframes link-flow[\s\S]*?\}/);
console.log("LINK FLOW", lf?.[0]);

const ft = [...html.matchAll(/class="hero-float-tag ft-\d"[\s\S]*?<\/div><\/div>/g)];
ft.forEach((m, i) => console.log("\nFT", i, m[0]));

const si = html.indexOf("hero-stats");
console.log("\nSTATS", html.slice(si, si + 500));

const hi = html.indexOf("The Future of");
console.log("\nH1+CTA", html.slice(hi, hi + 1200));

const pi = html.indexOf("heroGlobeWrap");
console.log("\nPARALLAX", html.slice(pi - 200, pi + 1200));

const ai = html.indexOf("Notice");
console.log("\nANN OUTER", html.slice(ai - 900, ai + 200));

const ni = html.indexOf('id="navbar"');
console.log("\nNAVBAR", html.slice(ni - 50, ni + 4200));
