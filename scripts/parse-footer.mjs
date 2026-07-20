import fs from "fs";

const html = fs.readFileSync("123/NodeMeta - Decentralized Mining Ecosystem.html", "utf8");
const foot = html.slice(html.lastIndexOf("<footer"), html.indexOf("</footer>") + 9);

const ecosystem = [];
const company = [];
let section = "";

for (const line of foot.split("<li>")) {
  if (line.includes(">Ecosystem<")) section = "ecosystem";
  if (line.includes(">Company<")) section = "company";
  const href = line.match(/href="([^"]+)"/)?.[1];
  const label = line.match(/<span>([^<]+)<\/span>/)?.[1];
  if (!href || !label || label === "Subscribe Now") continue;
  const item = { href, label };
  if (section === "ecosystem") ecosystem.push(item);
  if (section === "company") company.push(item);
}

const social = [...foot.matchAll(/aria-label="([^"]+)"[\s\S]*?href="([^"]+)"/g)].map((m) => ({
  label: m[1],
  href: m[2],
}));

console.log(JSON.stringify({ ecosystem, company, social }, null, 2));
