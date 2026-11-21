import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.sync);
  sandbox.load(FILES.config);
  sandbox.load(FILES.rating);
  return sandbox;
}

test("MMR не начисляется за неизвестную игру и нулевой результат", () => {
  const { ctx } = boot();
  assert.equal(ctx.getMMRFromGame("unknown-game", 100), null);
  assert.equal(ctx.getMMRFromGame("lockpick", 0), 0);
  assert.equal(ctx.getMMRFromGame("lockpick", -50), null);
  assert.equal(ctx.getMMRFromGame("lockpick", Number.NaN), null);
});

test("MMR за результат считается по формуле игры", () => {
  const { ctx } = boot();
  assert.equal(ctx.getMMRFromGame("lockpick", 10000), 11);
  assert.equal(ctx.getMMRFromGame("automaton", 5000), 9);
  assert.equal(ctx.getMMRFromGame("direjumper", 2000), 5);
});

test("медаль определяется по MMR с правильными звёздами", () => {
  const { ctx } = boot();
  const herald = ctx.getMedalForMMR(0);
  assert.equal(herald.medal.rankIdx, 0);
  assert.equal(herald.stars, 1);

  const crusader = ctx.getMedalForMMR(1545);
  assert.equal(crusader.medal.rankIdx, 2);
  assert.equal(crusader.stars, 1);

  const immortal = ctx.getMedalForMMR(6500);
  assert.equal(immortal.medal.rankIdx, 7);
  assert.equal(immortal.stars, 5);
});

test("викторина не влияет на рейтинг", () => {
  const { ctx } = boot();
  const before = ctx.window.getRatingData();
  const result = ctx.window.submitGameScore("quiz", 10, true);
  const after = ctx.window.getRatingData();

  assert.equal(result.gained, 0);
  assert.equal(after.gamesPlayed, before.gamesPlayed);
  assert.equal(after.mmr, before.mmr);
});

test("неизвестная игра не меняет счётчики", () => {
  const { ctx } = boot();
  const before = ctx.window.getRatingData();
  const result = ctx.window.submitGameScore("не-игра", 500, true);
  const after = ctx.window.getRatingData();

  assert.equal(result.gained, 0);
  assert.equal(after.gamesPlayed, before.gamesPlayed);
  assert.equal(after.calibrationGames, before.calibrationGames);
});

test("нулевой результат считается игрой, но не даёт MMR и побед", () => {
  const { ctx } = boot();
  const before = ctx.window.getRatingData();
  ctx.window.submitGameScore("lockpick", 0, false);
  const after = ctx.window.getRatingData();

  assert.equal(after.gamesPlayed, before.gamesPlayed + 1);
  assert.equal(after.mmr, before.mmr);
  assert.equal(after.wins, before.wins);
  assert.equal(after.calibrationGames, before.calibrationGames + 1);
});

test("победа увеличивает счётчик побед, поражение — нет", () => {
  const { ctx } = boot();
  ctx.window.submitGameScore("lockpick", 2000, true);
  assert.equal(ctx.window.getRatingData().wins, 1);

  ctx.window.submitGameScore("automaton", 2000, false);
  assert.equal(ctx.window.getRatingData().wins, 1);
});
