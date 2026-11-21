import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.config);
  sandbox.load("js/analyze.js");
  return sandbox;
}

const GREAT = {
  kills: 15, deaths: 1, assists: 10,
  gold_per_min: 700, last_hits: 300, hero_damage: 40000,
  lane_role: 1
};

const BAD = {
  kills: 0, deaths: 15, assists: 0,
  gold_per_min: 150, last_hits: 10, hero_damage: 2000,
  lane_role: 1
};

test("сильная игра получает высокую оценку", () => {
  const { ctx } = boot();
  const result = ctx.calcPerformance(GREAT, 40, true);

  assert.equal(result.grade, "S");
  assert.ok(result.score >= 90, `score=${result.score}`);
  assert.ok(result.reasons.length > 0, "причины указаны");
});

test("слабая игра получает низкую оценку", () => {
  const { ctx } = boot();
  const result = ctx.calcPerformance(BAD, 40, false);

  assert.equal(result.grade, "D");
  assert.ok(result.score < 40, `score=${result.score}`);
});

test("победа ценится выше поражения при тех же цифрах", () => {
  const { ctx } = boot();
  const win = ctx.calcPerformance(GREAT, 40, true);
  const loss = ctx.calcPerformance(GREAT, 40, false);

  assert.equal(win.score - loss.score, 10);
});

test("оценка не выходит за границы 0..100", () => {
  const { ctx } = boot();
  const extremeGood = ctx.calcPerformance({ ...GREAT, kills: 60, assists: 60, hero_damage: 200000, gold_per_min: 1500 }, 20, true);
  const extremeBad = ctx.calcPerformance({ kills: 0, deaths: 60, assists: 0, gold_per_min: 0, last_hits: 0, hero_damage: 0, lane_role: 1 }, 60, false);

  assert.ok(extremeGood.score <= 100);
  assert.ok(extremeBad.score >= 0);
});

test("позиция определяется по lane_role", () => {
  const { ctx } = boot();
  assert.equal(ctx.detectPos({ lane_role: 2 }), 2);
  assert.equal(ctx.detectPos({ lane_role: 1 }), 1);
  assert.equal(ctx.detectPos({ lane_role: 3 }), 3);
  assert.equal(ctx.detectPos({}), null);
});

test("анализ смертей различает спокойную и рискованную игру", () => {
  const { ctx } = boot();
  assert.equal(ctx.analyzeDeaths({ deaths: 0 }, 30).count, 0);
  assert.match(ctx.analyzeDeaths({ deaths: 0 }, 30).advice, /Ни одной смерти/);
  assert.match(ctx.analyzeDeaths({ deaths: 12 }, 30).advice, /Слишком много/);
});

test("рекомендации предметов реагируют на врагов", () => {
  const { ctx } = boot();
  const player = { player_slot: 0, lane_role: 1 };
  const match = {
    players: [
      { player_slot: 0, hero_id: 1 },
      { player_slot: 128, hero_id: 17 },
      { player_slot: 129, hero_id: 1 }
    ]
  };
  const allHeroes = [
    { id: 1, name: "Anti-Mage" },
    { id: 17, name: "Storm Spirit" }
  ];

  const recs = ctx.getItemRecs(player, { name: "Pudge" }, match, allHeroes);
  const items = recs.map(r => r.item);

  assert.ok(items.includes("Scythe of Vyse"), "хекс против мобильных героев");
  assert.ok(items.includes("Black King Bar"), "BKB против магии");
  assert.equal(new Set(items).size, items.length, "без дублей");
  assert.ok(items.length <= 6, "не больше шести рекомендаций");
  assert.ok(recs.every(r => typeof r.reason === "string" && r.reason.length > 0));
});
