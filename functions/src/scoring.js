/* DOTA JETCH — правила подсчёта и проверки результатов мини-игр.
   Чистый модуль без зависимостей: используется и в Cloud Function,
   и в тестах. Сервер считает MMR сам и не доверяет клиенту. */

"use strict";

const GAMES = Object.freeze({
  lockpick: Object.freeze({
    label: "Взлом замка",
    maxScore: 100000,
    base: 4,
    perPoint: 0.0007,
    winThreshold: 6000,
    rated: true
  }),
  automaton: Object.freeze({
    label: "Атака автоматонов",
    maxScore: 100000,
    base: 4,
    perPoint: 0.001,
    winThreshold: null,
    rated: true
  }),
  direjumper: Object.freeze({
    label: "Дири-Джампер",
    maxScore: 50000,
    base: 4,
    perPoint: 0.0005,
    winThreshold: null,
    rated: true
  }),
  quiz: Object.freeze({
    label: "Викторина",
    maxScore: 10,
    base: 0,
    perPoint: 0,
    winThreshold: 7,
    rated: false
  })
});

const CALIBRATION_GAMES = 10;
const MAX_MMR = 100000;
const RATE_LIMIT = Object.freeze({ limit: 20, windowMs: 60 * 1000 });

function isKnownGame(game) {
  return Object.prototype.hasOwnProperty.call(GAMES, game);
}

function isRatedGame(game) {
  return isKnownGame(game) && GAMES[game].rated === true;
}

function gameConfig(game) {
  return isKnownGame(game) ? GAMES[game] : null;
}

/** Проверяет присланный клиентом результат. Возвращает нормализованное значение. */
function validateSubmission(submission) {
  const payload = submission || {};
  const game = payload.game;

  if (!isKnownGame(game)) {
    return { ok: false, code: "INVALID_GAME", message: "Неизвестная игра." };
  }

  const score = payload.score;
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return { ok: false, code: "INVALID_SCORE", message: "Результат должен быть числом." };
  }
  if (!Number.isInteger(score)) {
    return { ok: false, code: "INVALID_SCORE", message: "Результат должен быть целым числом." };
  }
  if (score < 0) {
    return { ok: false, code: "INVALID_SCORE", message: "Результат не может быть отрицательным." };
  }

  const config = GAMES[game];
  if (score > config.maxScore) {
    return { ok: false, code: "SCORE_TOO_HIGH", message: "Результат превышает допустимый предел." };
  }

  return { ok: true, game, score, rated: config.rated === true, config };
}

/** Прибавка MMR по серверной формуле. */
function computeMMRDelta(game, score) {
  if (!isRatedGame(game)) return 0;
  if (!Number.isFinite(score) || score <= 0) return 0;
  const config = GAMES[game];
  return Math.round(config.base + score * config.perPoint);
}

/** Поражение или победа по порогу игры (если порог задан). */
function isWin(game, score) {
  const config = gameConfig(game);
  if (!config || config.winThreshold === null) return null;
  return score >= config.winThreshold;
}

/**
 * Чистое применение результата к состоянию пользователя.
 * @param {{mmr?:number,games?:number,wins?:number,calibrationGames?:number,calibrated?:boolean}} state
 */
function applySubmission(state, submission, hand) {
  const current = state || {};
  const validated = validateSubmission(submission);
  if (!validated.ok) return { ok: false, code: validated.code, message: validated.message };

  const mmr = clampMMR(Number(current.mmr) || 0);
  const games = Math.max(0, Math.floor(Number(current.games) || 0));
  const wins = Math.max(0, Math.floor(Number(current.wins) || 0));
  let calibrationGames = Math.max(0, Math.floor(Number(current.calibrationGames) || 0));
  let calibrated = current.calibrated === true;

  const delta = computeMMRDelta(validated.game, validated.score);
  const won = typeof hand?.won === "boolean" ? hand.won : isWin(validated.game, validated.score);

  const nextMMR = clampMMR(mmr + delta);
  const nextGames = games + 1;
  const nextWins = won === true ? wins + 1 : wins;

  if (!calibrated) {
    calibrationGames += 1;
    if (calibrationGames >= CALIBRATION_GAMES) calibrated = true;
  }

  return {
    ok: true,
    game: validated.game,
    score: validated.score,
    delta,
    won,
    state: {
      mmr: nextMMR,
      games: nextGames,
      wins: nextWins,
      calibrationGames,
      calibrated
    }
  };
}

function clampMMR(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_MMR, Math.round(value)));
}

/** Лучший результат: храним только улучшение. */
function pickBestScore(previous, candidate) {
  const prev = Number.isFinite(previous) ? previous : -1;
  const next = Number.isFinite(candidate) ? candidate : -1;
  return Math.max(prev, next);
}

/**
 * Ограничение частоты отправок.
 * @param {number[]} timestamps прошлые отправки (мс)
 * @param {number} now текущее время (мс)
 */
function isRateLimited(timestamps, now, options) {
  const limit = (options && options.limit) || RATE_LIMIT.limit;
  const windowMs = (options && options.windowMs) || RATE_LIMIT.windowMs;
  const list = Array.isArray(timestamps) ? timestamps : [];
  const recent = list.filter(ts => typeof ts === "number" && now - ts < windowMs);
  return { limited: recent.length >= limit, recent };
}

/** Проверка записи лидерборда перед записью. */
function validateLeaderboardEntry(entry) {
  const value = entry || {};
  if (!isRatedGame(value.game)) {
    return { ok: false, code: "INVALID_GAME", message: "Игра не участвует в рейтинге." };
  }
  if (!Number.isFinite(value.score) || value.score < 0) {
    return { ok: false, code: "INVALID_SCORE", message: "Некорректный результат." };
  }
  return {
    ok: true,
    value: {
      game: value.game,
      score: Math.floor(value.score),
      nickname: typeof value.nickname === "string" ? value.nickname.slice(0, 20) : "Anon"
    }
  };
}

module.exports = {
  GAMES,
  CALIBRATION_GAMES,
  MAX_MMR,
  RATE_LIMIT,
  gameConfig,
  isKnownGame,
  isRatedGame,
  isWin,
  validateSubmission,
  computeMMRDelta,
  applySubmission,
  clampMMR,
  pickBestScore,
  isRateLimited,
  validateLeaderboardEntry
};
