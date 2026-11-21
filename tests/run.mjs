/* Раннер тестов: подключает все *.test.mjs в одном процессе.
   Не запускает дочерние процессы, поэтому работает и в ограниченных средах. */
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DIRS = ["tests/unit", "functions/test"];
const root = resolve(".");
let loaded = 0;

for (const dir of DIRS) {
  let files = [];
  try {
    files = readdirSync(join(root, dir)).filter(name => name.endsWith(".test.mjs")).sort();
  } catch {
    continue;
  }
  for (const file of files) {
    await import(pathToFileURL(join(root, dir, file)).href);
    loaded++;
  }
}

if (!loaded) {
  console.error("Не найдено ни одного файла тестов");
  process.exit(1);
}
console.log(`\nПодключено файлов тестов: ${loaded}`);
