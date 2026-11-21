import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.sync);
  sandbox.load(FILES.config);
  sandbox.load(FILES.achievements);
  return sandbox;
}

function byId(ctx, id) {
  const found = ctx.ACHIEVEMENTS.find(a => a.id === id);
  assert.ok(found, `достижение ${id} должно существовать`);
  return found;
}

test("идентификаторы достижений уникальны", () => {
  const { ctx } = boot();
  const ids = ctx.ACHIEVEMENTS.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("базовые условия срабатывают только при достижении порога", () => {
  const { ctx } = boot();
  const firstAnalyze = byId(ctx, "a1");

  assert.equal(firstAnalyze.check({ analyzed: 0 }), false);
  assert.equal(firstAnalyze.check({ analyzed: 1 }), true);

  const heroVariety = byId(ctx, "a5");
  assert.equal(heroVariety.check({ uniqueHeroes: 4 }), false);
  assert.equal(heroVariety.check({ uniqueHeroes: 5 }), true);
});

test("позднее достижение считается по числу открытых", () => {
  const { ctx } = boot();
  const master = byId(ctx, "a24");

  assert.equal(master.late, true);
  assert.equal(master.check({ unlockedCount: 19 }), false);
  assert.equal(master.check({ unlockedCount: 20 }), true);
});

test("статистика достижений читается из хранилища", () => {
  const { ctx } = boot();
  ctx.Store.set("analyzedcount", 7);
  ctx.Store.set("uniqueheroes", [1, 2, 3]);
  ctx.Store.set("diarynotes", [{ id: "1" }, { id: "2" }]);

  const stats = ctx.Achievements.stats();
  assert.equal(stats.analyzed, 7);
  assert.equal(stats.uniqueHeroes, 3);
  assert.equal(stats.diaryNotes, 2);
});

test("проверка достижений открывает нужные и не дублирует их", () => {
  const { ctx } = boot();
  // Тост — это UI; здесь проверяем только логику открытия
  ctx.Achievements.toast = () => {};
  ctx.Store.set("analyzedcount", 1);

  const unlockedOnce = ctx.Achievements.check();
  const unlockedTwice = ctx.Achievements.check();

  assert.ok(unlockedOnce.some(a => a.id === "a1"), "первый анализ открывает a1");
  assert.equal(unlockedTwice.length, 0, "повторная проверка ничего не открывает");
  assert.ok(ctx.Achievements.unlocked().includes("a1"));
});
