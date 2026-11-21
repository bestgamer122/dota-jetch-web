/* DOTA JETCH — Cloud Functions (Node 20, CommonJS).
   Здесь только серверная часть: клиент не может подделать рейтинг,
   а токены OpenDota/STRATZ не попадают в браузер.

   Развёртывание:
     cd functions && npm i
     firebase functions:config:set opendota.key="..." stratz.token="..."
     firebase deploy --only functions
*/

"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const scoring = require("./src/scoring");

admin.initializeApp();
const db = admin.database();

const REGION = "europe-west1";

/* ─── Отправка результата мини-игры ─────────────────────────── */
exports.submitScore = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Нужен вход в аккаунт.");
  }
  const uid = context.auth.uid;
  const validated = scoring.validateSubmission(data);
  if (!validated.ok) {
    throw new functions.https.HttpsError("invalid-argument", validated.message);
  }
  if (!validated.rated) {
    return { ok: true, rated: false };
  }

  const userRef = db.ref(`users/${uid}`);
  const logRef = db.ref(`users/${uid}/scoreLog`);
  const now = Date.now();

  const logSnap = await logRef.get();
  const timestamps = logSnap.exists() ? Object.values(logSnap.val()) : [];
  const rate = scoring.isRateLimited(timestamps, now);
  if (rate.limited) {
    throw new functions.https.HttpsError("resource-exhausted", "Слишком много отправок, подожди минуту.");
  }

  const result = await userRef.transaction(current => {
    const state = current || {};
    const applied = scoring.applySubmission({
      mmr: state.minigames_mmr,
      games: state.minigames_games,
      wins: state.minigames_wins,
      calibrationGames: state.minigames_calibration_games,
      calibrated: state.minigames_calibrated
    }, { game: validated.game, score: validated.score }, { won: data && data.won });

    if (!applied.ok) return current;

    state.minigames_mmr = applied.state.mmr;
    state.minigames_games = applied.state.games;
    state.minigames_wins = applied.state.wins;
    state.minigames_calibration_games = applied.state.calibrationGames;
    state.minigames_calibrated = applied.state.calibrated;

    const bestKey = `${validated.game}best`;
    state[bestKey] = scoring.pickBestScore(state[bestKey], validated.score);
    return state;
  });

  if (!result.committed) {
    throw new functions.https.HttpsError("aborted", "Не удалось сохранить результат.");
  }

  const state = result.snapshot.val() || {};

  await Promise.all([
    db.ref(`leaderboards/${validated.game}/${uid}`).update({
      score: scoring.pickBestScore(undefined, validated.score),
      nickname: (state.nickname || "Anon").slice(0, 20),
      mmr: state.minigames_mmr || 0,
      ts: now
    }),
    db.ref(`publicProfiles/${uid}`).update({
      mmr: state.minigames_mmr || 0,
      calibrated: state.minigames_calibrated === true,
      ts: now
    }),
    logRef.set([...rate.recent, now].reduce((acc, ts, i) => { acc[i] = ts; return acc; }, {}))
  ]);

  return {
    ok: true,
    delta: scoring.computeMMRDelta(validated.game, validated.score),
    mmr: state.minigames_mmr || 0,
    calibrated: state.minigames_calibrated === true
  };
});

/* ─── Прокси OpenDota: ключ хранится только на сервере ──────── */
exports.opendota = functions.region(REGION).https.onRequest(async (req, res) => {
  const path = String(req.query.path || "").replace(/^\/+/, "");
  if (!/^(matches|heroes|benchmarks|constants)\//.test(path) && !/^(heroes|constants\/items)$/.test(path)) {
    res.status(400).json({ error: "Недопустимый путь" });
    return;
  }
  const key = (functions.config().opendota && functions.config().opendota.key) || process.env.OPENDOTA_KEY || "";
  const url = `https://api.opendota.com/api/${path}${key ? `?api_key=${key}` : ""}`;
  try {
    const upstream = await fetch(url);
    const body = await upstream.text();
    res.set("cache-control", "public, max-age=120");
    res.status(upstream.status).type("application/json").send(body);
  } catch (error) {
    res.status(502).json({ error: "OpenDota недоступен" });
  }
});

/* ─── Прокси STRATZ: токен не уходит в браузер ──────────────── */
exports.stratz = functions.region(REGION).https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Только POST" });
    return;
  }
  const token = (functions.config().stratz && functions.config().stratz.token) || process.env.STRATZ_TOKEN || "";
  if (!token) {
    res.status(500).json({ error: "Токен STRATZ не настроен" });
    return;
  }
  try {
    const upstream = await fetch("https://api.stratz.com/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "user-agent": "STRATZ_API"
      },
      body: JSON.stringify({ query: req.body && req.body.query, variables: req.body && req.body.variables })
    });
    const body = await upstream.text();
    res.status(upstream.status).type("application/json").send(body);
  } catch (error) {
    res.status(502).json({ error: "STRATZ недоступен" });
  }
});
