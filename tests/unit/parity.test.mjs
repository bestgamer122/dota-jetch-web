import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

const require = createRequire(import.meta.url);
const server = require("../../functions/src/scoring.js");

function client() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.config);
  sandbox.load(FILES.rating);
  return sandbox.ctx;
}

const SAMPLES = [0, 1, 500, 1000, 6000, 10000, 25000, 50000];

test("клиент и сервер считают одинаковую прибавку MMR", () => {
  const ctx = client();
  const games = Object.keys(server.GAMES).filter(game => server.isRatedGame(game));

  for (const game of games) {
    const cap = server.GAMES[game].maxScore;
    for (const score of SAMPLES) {
      if (score > cap) continue;
      const clientDelta = ctx.getMMRFromGame(game, score);
      const serverDelta = server.computeMMRDelta(game, score);
      assert.equal(clientDelta, serverDelta, `${game}/${score}: клиент ${clientDelta}, сервер ${serverDelta}`);
    }
  }
});

test("викторина не начисляет MMR ни в клиенте, ни на сервере", () => {
  const ctx = client();
  assert.equal(ctx.getMMRFromGame("quiz", 10), null);
  assert.equal(server.computeMMRDelta("quiz", 10), 0);
});

test("неизвестная игра отклоняется сервером и клиентом", () => {
  const ctx = client();
  assert.equal(ctx.getMMRFromGame("unknown", 100), null);
  assert.equal(server.validateSubmission({ game: "unknown", score: 100 }).ok, false);
});

test("порог победы во «Взломе замка» совпадает с кодом игры", () => {
  const source = readFileSync("js/games.js", "utf8");
  const found = source.match(/var passed = state\.score >= (\d+)/);
  assert.ok(found, "в games.js должен быть порог победы");
  assert.equal(Number(found[1]), server.GAMES.lockpick.winThreshold);
});

test("лимиты результатов заданы для всех рейтинговых игр", () => {
  for (const [game, config] of Object.entries(server.GAMES)) {
    assert.ok(Number.isFinite(config.maxScore) && config.maxScore > 0, `${game}: нужен maxScore`);
  }
});

test("сервер принимает результат, который клиент считает победным", () => {
  const threshold = server.GAMES.lockpick.winThreshold;
  const validated = server.validateSubmission({ game: "lockpick", score: threshold });
  assert.equal(validated.ok, true);
  assert.equal(server.isWin("lockpick", threshold), true);
});
