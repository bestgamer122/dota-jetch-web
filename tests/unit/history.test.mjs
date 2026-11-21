import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.sync);
  sandbox.load(FILES.config);
  sandbox.load(FILES.history);
  return sandbox;
}

function matchResult(matchId, heroId = 1) {
  return {
    match: { match_id: matchId },
    hero: { id: heroId, name: "Axe", slug: "axe" },
    player: { kills: 1, deaths: 2, assists: 3 },
    won: true,
    durMin: 30
  };
}

test("повторный разбор того же матча не дублирует запись", () => {
  const { ctx } = boot();
  ctx.MatchHistory.add(matchResult(111));
  ctx.MatchHistory.add(matchResult(111));

  const list = ctx.MatchHistory.all();
  assert.equal(list.length, 1);
  assert.equal(String(list[0].matchId), "111");
});

test("числовой и строковый ID матча считаются одним матчем", () => {
  const { ctx } = boot();
  ctx.MatchHistory.add(matchResult(222));
  const stored = ctx.MatchHistory.all();
  stored[0].matchId = "222";
  ctx.Store.set("recentmatches", stored);

  ctx.MatchHistory.add(matchResult(222));
  assert.equal(ctx.MatchHistory.all().length, 1);
});

test("история хранит не больше 50 матчей и свежие сверху", () => {
  const { ctx } = boot();
  for (let i = 1; i <= 55; i++) ctx.MatchHistory.add(matchResult(1000 + i));

  const list = ctx.MatchHistory.all();
  assert.equal(list.length, 50);
  assert.equal(String(list[0].matchId), "1055");
});

test("удаление убирает только выбранный матч", () => {
  const { ctx } = boot();
  ctx.MatchHistory.add(matchResult(1));
  ctx.MatchHistory.add(matchResult(2));

  ctx.MatchHistory.remove(1);
  const ids = ctx.MatchHistory.all().map(m => String(m.matchId));
  assert.deepEqual(ids, ["2"]);
});

test("запись сохраняет slug героя для картинок", () => {
  const { ctx } = boot();
  ctx.MatchHistory.add(matchResult(333));
  assert.equal(ctx.MatchHistory.all()[0].heroSlug, "axe");
});
