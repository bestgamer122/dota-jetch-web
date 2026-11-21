/* DOTA JETCH — статический сервер для локальной разработки.
   Без зависимостей: node tools/serve.mjs [port] */
import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.argv[2] || 8080);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const target = normalize(join(root, url === "/" ? "index.html" : url));
  if (!target.startsWith(root)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  let file = target;
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    statSync(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }
  res.writeHead(200, {
    "content-type": MIME[extname(file)] || "application/octet-stream",
    "cache-control": "no-cache"
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`DOTA JETCH → http://127.0.0.1:${port}/`);
});
