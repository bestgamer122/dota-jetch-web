import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.config);
  sandbox.load("js/fallback.js");
  return sandbox;
}

test("каталог героев доступен без API", async () => {
  const { ctx } = boot();
  const heroes = await ctx.window.getHeroes();
  assert.ok(heroes.length > 100, `ожидалось больше 100 героев, получено ${heroes.length}`);
  assert.ok(heroes.every(h => h.id && h.name && h.slug));
});

test("поиск героя понимает английские имена и регистр", async () => {
  const { ctx } = boot();
  assert.equal((await ctx.window.findHeroId("Pudge")).name, "Pudge");
  assert.equal((await ctx.window.findHeroId("antimage")).name, "Anti-Mage");
  assert.equal((await ctx.window.findHeroId("JUGGERNAUT")).name, "Juggernaut");
});

test("поиск героя понимает русские прозвища", async () => {
  const { ctx } = boot();
  assert.equal((await ctx.window.findHeroId("пудж")).name, "Pudge");
  assert.equal((await ctx.window.findHeroId("ам")).name, "Anti-Mage");
  assert.equal((await ctx.window.findHeroId("инвокер")).name, "Invoker");
  assert.equal((await ctx.window.findHeroId("шторм")).name, "Storm Spirit");
});

test("Dawnbreaker и Ringmaster не перепутаны", async () => {
  const { ctx } = boot();
  const dawn = await ctx.window.findHeroId("Dawnbreaker");
  const ring = await ctx.window.findHeroId("Ringmaster");
  assert.equal(dawn.id, 135);
  assert.equal(ring.id, 131);
});

test("несуществующий герой возвращает null", async () => {
  const { ctx } = boot();
  assert.equal(await ctx.window.findHeroId("нетакого-героя-zzz"), null);
  assert.equal(await ctx.window.findHeroId(""), null);
});

test("перцентиль интерполируется между значениями", () => {
  const { ctx } = boot();
  const bench = { gold_per_min: [{ percentile: 0.5, value: 100 }, { percentile: 0.9, value: 200 }] };

  assert.equal(ctx.window.percentileOf(bench, "gold_per_min", 150), 70);
  assert.equal(ctx.window.percentileOf(bench, "gold_per_min", 50), 50, "ниже минимума — нижний перцентиль");
  assert.equal(ctx.window.percentileOf(bench, "gold_per_min", 500), 90, "выше максимума — верхний перцентиль");
  assert.equal(ctx.window.percentileOf({}, "gold_per_min", 100), null);
  assert.equal(ctx.window.percentileOf(bench, "missing", 100), null);
});

test("оценки и цвета перцентилей соответствуют порогам", () => {
  const { ctx } = boot();
  assert.equal(ctx.window.pctGrade(95), "S");
  assert.equal(ctx.window.pctGrade(80), "A");
  assert.equal(ctx.window.pctGrade(60), "B");
  assert.equal(ctx.window.pctGrade(30), "C");
  assert.equal(ctx.window.pctGrade(10), "D");
  assert.equal(ctx.window.pctGrade(null), "-");

  assert.equal(ctx.window.pctColor(90), "var(--green)");
  assert.equal(ctx.window.pctColor(60), "var(--yellow)");
  assert.equal(ctx.window.pctColor(30), "var(--orange)");
  assert.equal(ctx.window.pctColor(5), "var(--red)");
});
