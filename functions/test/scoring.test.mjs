import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const scoring = require("../src/scoring.js");

test("неизвестная игра отклоняется", () => {
  const result = scoring.validateSubmission({ game: "hack", score: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_GAME");
});

test("некорректный результат отклоняется", () => {
  for (const score of ["1000", null, undefined, Number.NaN, Infinity, -5, 12.5]) {
    const result = scoring.validateSubmission({ game: "lockpick", score });
    assert.equal(result.ok, false, `score=${String(score)} должен быть отклонён`);
    assert.equal(result.code, "INVALID_SCORE");
  }
});

test("завышенный результат отклоняется", () => {
  const result = scoring.validateSubmission({ game: "direjumper", score: 1000000 });
  assert.equal(result.ok, false);
  assert.equal(result.code, "SCORE_TOO_HIGH");
});

test("корректный результат нормализуется", () => {
  const result = scoring.validateSubmission({ game: "lockpick", score: 12000 });
  assert.equal(result.ok, true);
  assert.equal(result.score, 12000);
  assert.equal(result.rated, true);
});

test("MMR считается на сервере и совпадает с клиентской формулой", () => {
  assert.equal(scoring.computeMMRDelta("lockpick", 10000), 11);
  assert.equal(scoring.computeMMRDelta("automaton", 5000), 9);
  assert.equal(scoring.computeMMRDelta("direjumper", 2000), 5);
  assert.equal(scoring.computeMMRDelta("quiz", 10), 0);
  assert.equal(scoring.computeMMRDelta("lockpick", 0), 0);
});

test("победа определяется по порогу игры", () => {
  assert.equal(scoring.isWin("lockpick", 6000), true);
  assert.equal(scoring.isWin("lockpick", 5999), false);
  assert.equal(scoring.isWin("automaton", 5000), null);
});

test("состояние обновляется последовательно", () => {
  const first = scoring.applySubmission({ mmr: 0, games: 0, wins: 0, calibrationGames: 0, calibrated: false },
    { game: "lockpick", score: 20000 });
  assert.equal(first.ok, true);
  assert.equal(first.won, true);
  assert.equal(first.state.games, 1);
  assert.equal(first.state.wins, 1);
  assert.equal(first.state.calibrationGames, 1);
  assert.equal(first.state.calibrated, false);

  const second = scoring.applySubmission(first.state, { game: "automaton", score: 0 });
  assert.equal(second.state.games, 2);
  assert.equal(second.state.wins, 1, "нулевой результат не даёт победу");
  assert.equal(second.state.mmr, first.state.mmr, "нулевой результат не даёт MMR");
});

test("калибровка включается после десятой игры", () => {
  let state = { mmr: 0, games: 0, wins: 0, calibrationGames: 9, calibrated: false };
  const result = scoring.applySubmission(state, { game: "lockpick", score: 1000 });
  assert.equal(result.state.calibrationGames, 10);
  assert.equal(result.state.calibrated, true);
});

test("MMR не уходит в отрицательные значения и в бесконечность", () => {
  assert.equal(scoring.clampMMR(-100), 0);
  assert.equal(scoring.clampMMR(Number.NaN), 0);
  assert.equal(scoring.clampMMR(1e9), scoring.MAX_MMR);
});

test("хранится только лучший результат", () => {
  assert.equal(scoring.pickBestScore(5000, 4000), 5000);
  assert.equal(scoring.pickBestScore(5000, 7000), 7000);
  assert.equal(scoring.pickBestScore(undefined, 7000), 7000);
});

test("ограничение частоты отправок срабатывает", () => {
  const now = 1_000_000;
  const fresh = scoring.isRateLimited([], now);
  assert.equal(fresh.limited, false);

  const many = Array.from({ length: 20 }, (_, i) => now - i * 100);
  assert.equal(scoring.isRateLimited(many, now).limited, true);

  const old = Array.from({ length: 20 }, (_, i) => now - 60_000 - i);
  assert.equal(scoring.isRateLimited(old, now).limited, false, "старые отправки не считаются");
});

test("запись лидерборда проверяется перед сохранением", () => {
  assert.equal(scoring.validateLeaderboardEntry({ game: "quiz", score: 10 }).ok, false);
  assert.equal(scoring.validateLeaderboardEntry({ game: "lockpick", score: -1 }).ok, false);

  const ok = scoring.validateLeaderboardEntry({ game: "lockpick", score: 58000.7, nickname: "x".repeat(40) });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.score, 58000);
  assert.equal(ok.value.nickname.length, 20);
});
