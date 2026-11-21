import test from "node:test";
import assert from "node:assert/strict";
import { createSandbox, FILES } from "../helpers/sandbox.mjs";

function boot() {
  const sandbox = createSandbox({ quiet: true });
  sandbox.load(FILES.config);
  sandbox.load("js/profile-analyzer.js");
  return sandbox.ctx.ProfileAnalyzer;
}

function teammates(myGpm, myXpm, myLh) {
  return [
    { goldPerMinute: myGpm, experiencePerMinute: myXpm, numLastHits: myLh },
    { goldPerMinute: 100, experiencePerMinute: 100, numLastHits: 10 },
    { goldPerMinute: 200, experiencePerMinute: 200, numLastHits: 20 },
    { goldPerMinute: 300, experiencePerMinute: 300, numLastHits: 30 },
    { goldPerMinute: 400, experiencePerMinute: 400, numLastHits: 40 }
  ];
}

function match(overrides = {}) {
  return {
    position: 1,
    gold_per_min: 100,
    xp_per_min: 100,
    last_hits: 10,
    kills: 5,
    deaths: 2,
    assists: 10,
    duration: 2400,
    game_mode: 22,
    player_slot: 0,
    radiant_win: true,
    hero_id: 1,
    hero_damage: 20000,
    tower_damage: 1000,
    teammates: teammates(100, 100, 10),
    ...overrides
  };
}

test("режимы STRATZ переводятся в коды Dota", () => {
  const pa = boot();
  assert.equal(pa._stratzModeToDota("GAME_MODE_RANKED"), 22);
  assert.equal(pa._stratzModeToDota("TURBO"), 23);
  assert.equal(pa._stratzModeToDota("ALL_PICK"), 1);
  assert.equal(pa._stratzModeToDota("CAPTAINS_MODE"), 2);
  assert.equal(pa._stratzModeToDota("UNKNOWN_MODE_ZZZ"), 0);
  assert.equal(pa._stratzModeToDota(null), 0);
});

test("роль керри определяется по фарму среди союзников", () => {
  const pa = boot();
  const core = match({ position: 1, gold_per_min: 700, xp_per_min: 800, last_hits: 100, teammates: teammates(700, 800, 100) });
  assert.equal(pa.classifyRole(core, [core]), 1);
});

test("роль саппорта определяется по низкому фарму", () => {
  const pa = boot();
  const support = match({ position: 1, gold_per_min: 50, xp_per_min: 50, last_hits: 2, teammates: teammates(50, 50, 2) });
  assert.equal(pa.classifyRole(support, [support]), 5);
});

test("impact score остаётся в пределах 0..100", () => {
  const pa = boot();
  const strong = pa.computeImpactScore(match({ kills: 20, assists: 20, deaths: 0, hero_damage: 60000, tower_damage: 20000 }));
  const weak = pa.computeImpactScore(match({ kills: 0, assists: 0, deaths: 12, hero_damage: 0, tower_damage: 0 }));

  assert.ok(Number.isInteger(strong) && strong >= 0 && strong <= 100);
  assert.ok(Number.isInteger(weak) && weak >= 0 && weak <= 100);
  assert.ok(strong > weak);
});

test("статистика профиля считается по матчам", () => {
  const pa = boot();
  const win = match({ radiant_win: true });
  const loss = match({ radiant_win: false, kills: 1, deaths: 8, assists: 2 });

  const stats = pa.computeStats({ matches: [win, loss], heroes: [], wl: { win: 1, lose: 1 } });

  assert.equal(stats.totalMatches, 2);
  assert.equal(stats.wins, 1);
  assert.equal(stats.losses, 1);
  assert.equal(stats.winrate, 50);
  assert.ok(!Number.isNaN(Number(stats.avgKDA)));
  assert.equal(stats.lifetimeGames, 2);
});

test("пустой профиль не ломает статистику", () => {
  const pa = boot();
  const stats = pa.computeStats({ matches: [], heroes: [], wl: {} });

  assert.equal(stats.totalMatches, 0);
  assert.equal(stats.winrate, 0);
  /* Массив приходит из vm-песочницы: deepStrictEqual сравнивает прототипы,
     поэтому проверяем форму и длину, а не ссылочное равенство. */
  assert.ok(Array.isArray(stats.recentForm), "recentForm должен быть массивом");
  assert.equal(stats.recentForm.length, 0);
  assert.equal(stats.favoriteRole, null);
  assert.equal(Object.keys(stats.roleCounts).length, 0);
});

test("игровой стиль определяется по статистике", () => {
  const pa = boot();
  const stats = pa.computeStats({ matches: [match(), match({ radiant_win: false })], heroes: [], wl: {} });
  const dna = pa.computePlayerDNA(stats);

  assert.ok(Array.isArray(dna));
  assert.ok(dna.length > 0);
  assert.ok(dna[0].label && dna[0].desc);
});
