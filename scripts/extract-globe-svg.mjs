import fs from "fs";

const html = fs.readFileSync(
  "123/NodeMeta - Decentralized Mining Ecosystem.html",
  "utf8",
);

const start = html.indexOf('viewBox="0 0 520 520"');
if (start === -1) {
  console.log("not found");
  process.exit(1);
}

const svgStart = html.lastIndexOf("<svg", start);
const svgEnd = html.indexOf("</svg>", start) + 6;
const svg = html.slice(svgStart, svgEnd);
fs.writeFileSync("src/components/home/hero-globe.svg", svg);
console.log("wrote svg", svg.length);
