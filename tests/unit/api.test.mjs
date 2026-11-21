import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function bootWithFetch(fetchImpl) {
  const sandbox = createSandbox({ quiet: true, fetchImpl });
  sandbox.load(FILES.config);
  return sandbox;
}

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

test("404 не повторяется через прокси", async () => {
  const calls = [];
  const { ctx } = bootWithFetch(async (url) => {
    calls.push(url);
    return response(404, {});
  });

  await assert.rejects(() => ctx.apiGet("/matches/1"), /HTTP 404/);
  assert.equal(calls.length, 1, "на 404 должен быть ровно один запрос");
  assert.ok(!calls[0].includes("allorigins"), "прокси не используется");
});

test("ошибка сервера уходит через CORS-прокси", async () => {
  const calls = [];
  const { ctx } = bootWithFetch(async (url) => {
    calls.push(url);
    if (url.includes("allorigins")) return response(200, { proxied: true });
    return response(503, {});
  });

  const data = await ctx.apiGet("/matches/2");
  assert.deepEqual(data, { proxied: true });
  assert.equal(calls.length, 2);
  assert.ok(calls[1].startsWith("https://api.allorigins.win/raw?url="));
});

test("сетевая ошибка тоже уходит через прокси", async () => {
  const calls = [];
  const { ctx } = bootWithFetch(async (url) => {
    calls.push(url);
    if (url.includes("allorigins")) return response(200, { ok: true });
    throw new TypeError("network down");
  });

  const data = await ctx.apiGet("/heroes");
  assert.deepEqual(data, { ok: true });
  assert.equal(calls.length, 2);
});

test("если недоступны и API, и прокси — понятная ошибка", async () => {
  const { ctx } = bootWithFetch(async () => {
    throw new TypeError("network down");
  });

  await assert.rejects(() => ctx.apiGet("/heroes"), /API недоступно/);
});

test("параметры запроса попадают в URL", async () => {
  let requested = "";
  const { ctx } = bootWithFetch(async (url) => {
    requested = url;
    return response(200, {});
  });

  await ctx.apiGet("/benchmarks", { hero_id: 14 });
  assert.ok(requested.includes("hero_id=14"));
});

test("apiGet не делает лишних повторов на 400 и 401", async () => {
  for (const status of [400, 401, 403]) {
    const calls = [];
    const { ctx } = bootWithFetch(async (url) => {
      calls.push(url);
      return response(status, {});
    });
    await assert.rejects(() => ctx.apiGet("/x"));
    assert.equal(calls.length, 1, `для ${status} должен быть один запрос`);
  }
});
