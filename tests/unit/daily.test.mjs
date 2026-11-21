import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.sync);
  sandbox.load(FILES.config);
  sandbox.load(FILES.daily);
  return sandbox;
}

test("на день выдаётся три задания без повторов", () => {
  const { ctx } = boot();
  const tasks = ctx.Daily.tasks();

  assert.equal(tasks.length, 3);
  assert.equal(new Set(tasks.map(t => t.id)).size, 3);
});

test("задания дня не меняются в течение дня", () => {
  const { ctx } = boot();
  const first = ctx.Daily.tasks().map(t => t.id).join(",");
  const second = ctx.Daily.tasks().map(t => t.id).join(",");
  assert.equal(first, second);
});

test("прогресс задания накапливается", () => {
  const { ctx } = boot();
  ctx.Daily.bump("chart");
  ctx.Daily.bump("chart");

  assert.equal(ctx.Store.get("dailyprogress.chart", 0), 2);
  assert.equal(ctx.Store.get("dailydate", ""), ctx.Daily.todayKey());
});

test("новый день обнуляет прогресс перед начислением", () => {
  const { ctx } = boot();
  ctx.Store.set("dailydate", "2000-01-01");
  ctx.Store.set("dailyprogress.chart", 5);
  ctx.Store.set("dailystreakclaimed", true);

  ctx.Daily.bump("chart");

  assert.equal(ctx.Store.get("dailyprogress.chart", 0), 1);
  assert.equal(ctx.Store.get("dailystreakclaimed", true), false);
});

test("награду нельзя забрать при невыполненных заданиях", () => {
  const { ctx } = boot();
  ctx.Daily.bump("chart");

  assert.equal(ctx.Daily.allDone(), false);
  assert.equal(ctx.Daily.claim(), false);
});

test("награду нельзя забрать второй раз", () => {
  const { ctx } = boot();
  const tasks = ctx.Daily.tasks();
  tasks.forEach(task => {
    for (let i = 0; i < task.goal; i++) ctx.Daily.bump(task.id);
  });

  assert.equal(ctx.Daily.allDone(), true);
  assert.equal(ctx.Daily.claim(), true);
  assert.equal(ctx.Daily.claim(), false);
});
