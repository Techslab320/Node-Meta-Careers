import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    if (statSync(filePath).isDirectory()) {
      walk(filePath);
      continue;
    }

    if (entry !== "route.ts") continue;

    const source = readFileSync(filePath, "utf8");
    if (source.includes("export const runtime")) continue;

    const lines = source.split(/\r?\n/);
    let insertAt = 0;
    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].startsWith("import ")) {
        insertAt = index + 1;
      } else if (insertAt > 0 && lines[index].trim() === "") {
        insertAt = index + 1;
        break;
      }
    }

    lines.splice(insertAt, 0, "", 'export const runtime = "nodejs";');
    writeFileSync(filePath, lines.join("\n"));
    console.log("updated", filePath);
  }
}

walk("src/app/api");
