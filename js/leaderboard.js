/* DOTA JETCH — LEADERBOARD v2.2 (Dire Jumper tab) */

import { getDatabase, ref, get, update, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

function getCtx() {
  if (!window.__fbAuth) return null;
  try { return { auth: window.__fbAuth, db: getDatabase(window.__fbAuth.app) }; }
  catch (e) { return null; }
}

function ensureLbStyle() {
  if (document.getElementById("lbAnimStyle")) return;
  var s = document.createElement("style");
  s.id = "lbAnimStyle";
  s.textContent = "@keyframes lbFadeIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}.lb-card-anim{animation:lbFadeIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;}@keyframes lbRowIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}";
  document.head.appendChild(s);
}

function miniMedal(rankIdx, size) {
  size = size || 36;
  var wrap = el("div", { style: "flex-shrink:0;display:flex;align-items:center;justify-content:center;" });
  if (typeof window.buildMedalSVG === "function") {
    try { wrap.appendChild(window.buildMedalSVG(rankIdx, size, false)); } catch (e) {}
  }
  return wrap;
}

window.submitToLeaderboard = async function (game, rawScore, mmr) {
  if (game === "quiz") return;
  var ctx = getCtx();
  if (!ctx) return;
  var user = ctx.auth.currentUser;
  if (!user) return;
  var nick = (window.Store && Store.get("nickname", "")) || "Anon";
  var ref1 = ref(ctx.db, "leaderboards/" + game + "/" + user.uid);
  try {
    var snap = await get(ref1);
    var existing = snap.val();
    if (existing && typeof existing.score === "number" && existing.score >= rawScore) {
      await update(ref1, { mmr: mmr, nickname: nick, ts: Date.now() });
      return;
    }
    await update(ref1, { nickname: nick, score: rawScore, mmr: mmr, ts: Date.now() });
  } catch (e) { console.warn("submitToLeaderboard:", e); }
};

window.fetchLeaderboard = async function (game, limit) {
  limit = limit || 20;
  var ctx = getCtx();
  if (!ctx) return [];
  try {
    var q = query(ref(ctx.db, "leaderboards/" + game), orderByChild("score"), limitToLast(limit));
    var snap = await get(q);
    var data = snap.val() || {};
    var list = [];
    for (var uid in data) {
      if (Object.prototype.hasOwnProperty.call(data, uid)) {
        list.push({ uid: uid, nickname: data[uid].nickname, score: data[uid].score, mmr: data[uid].mmr });
      }
    }
    var profilesSnap = await get(ref(ctx.db, "publicProfiles"));
    var profiles = profilesSnap.val() || {};
    for (var i = 0; i < list.length; i++) {
      var pv = profiles[list[i].uid];
      if (pv) {
        if (pv.avatar && typeof pv.avatar === "string" && pv.avatar.indexOf("data:image") === 0) list[i].avatar = pv.avatar;
        if (typeof pv.mmr === "number") list[i].mmr = pv.mmr;
        if (pv.nickname) list[i].nickname = pv.nickname;
        list[i].calibrated = pv.calibrated === true;
      }
    }
    list.sort(function (a, b) { return b.score - a.score; });
    return list;
  } catch (e) { console.warn("fetchLeaderboard:", e); return []; }
};

window.fetchTopByMMR = async function (limit) {
  limit = limit || 30;
  var ctx = getCtx();
  if (!ctx) return [];
  try {
    var snap = await get(ref(ctx.db, "publicProfiles"));
    var data = snap.val() || {};
    var list = [];
    for (var uid in data) {
      if (!Object.prototype.hasOwnProperty.call(data, uid)) continue;
      var p = data[uid] || {};
      if (p.calibrated !== true || typeof p.mmr !== "number") continue;
      list.push({ uid: uid, nickname: p.nickname || "Anon", mmr: p.mmr, avatar: p.avatar || null, calibrated: true });
    }
    list.sort(function (a, b) { return b.mmr - a.mmr; });
    return list.slice(0, limit);
  } catch (e) { console.warn("fetchTopByMMR:", e); return []; }
};

window.renderLeaderboard = async function (game) {
  ensureLbStyle();
  var card = UI.card("🏅 Лидерборд");
  card.classList.add("lb-card-anim");
  var tabsRow = el("div", { style: "display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;" });
  var tabs = [
    { id: "lockpick", label: "🔓 Взлом", type: "game" },
    { id: "automaton", label: "⌨️ Автоматоны", type: "game" },
    { id: "direjumper", label: "🎪 Дири-Джампер", type: "game" },
    { id: "mmr", label: "🏆 Топ по MMR", type: "mmr" }
  ];
  var currentTab = "lockpick";
  var contentWrap = el("div", { id: "lbContent" });
  contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));

  for (var g = 0; g < tabs.length; g++) {
    (function (tab) {
      var b = UI.btn(tab.label, { variant: tab.id === currentTab ? undefined : "ghost" });
      b.style.fontSize = "12px";
      b.addEventListener("click", function () {
        currentTab = tab.id;
        var allBtns = tabsRow.querySelectorAll("button");
        for (var k = 0; k < allBtns.length; k++) { allBtns[k].classList.remove("active"); allBtns[k].classList.add("btn-ghost"); }
        b.classList.add("active"); b.classList.remove("btn-ghost");
        loadTab(tab);
      });
      tabsRow.appendChild(b);
    })(tabs[g]);
  }
  card.appendChild(tabsRow);
  card.appendChild(contentWrap);

  function buildAvatar(profile, size) {
    size = size || 32;
    var av = el("div", { style: "width:" + size + "px;height:" + size + "px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;font-family:monospace;flex-shrink:0;background-size:cover;background-position:center;" });
    if (profile && profile.avatar) { av.style.backgroundImage = "url(" + profile.avatar + ")"; av.textContent = ""; }
    else { av.textContent = String((profile && profile.nickname) || "?").charAt(0).toUpperCase() || "?"; }
    return av;
  }

  function addRow(container, rank, data, isMMR) {
    var row = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border);" });
    row.style.animation = "lbRowIn 0.3s ease both";
    row.style.animationDelay = (rank * 30) + "ms";
    var place = el("div", { style: "width:30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;flex-shrink:0;" });
    if (rank === 0) { place.textContent = "🥇"; place.style.fontSize = "20px"; }
    else if (rank === 1) { place.textContent = "🥈"; place.style.fontSize = "20px"; }
    else if (rank === 2) { place.textContent = "🥉"; place.style.fontSize = "20px"; }
    else { place.textContent = "#" + (rank + 1); place.style.color = "var(--text-dim)"; }
    row.appendChild(place);
    row.appendChild(buildAvatar(data, 32));
    var info = el("div", { style: "flex:1;min-width:0;" });
    info.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, data.nickname || "Аноним"));
    var rankLabel = el("div", { style: "font-size:10px;margin-top:2px;" });
    var md = null;
    if (data.calibrated && typeof window.getMedalForMMR === "function") {
      try { md = window.getMedalForMMR(data.mmr); } catch (e) {}
    }
    if (md) {
      rankLabel.textContent = md.medal.ru + " · " + md.stars + "★";
      rankLabel.style.color = md.medal.a;
    } else {
      rankLabel.textContent = "Калибровка";
      rankLabel.style.color = "var(--text-dim)";
      rankLabel.style.fontStyle = "italic";
    }
    info.appendChild(rankLabel);
    row.appendChild(info);
    if (md) {
      var medalBox = miniMedal(md.medal.rankIdx, 36);
      medalBox.style.marginRight = "2px";
      row.appendChild(medalBox);
    }
    var val = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);flex-shrink:0;" });
    val.textContent = isMMR ? data.mmr.toLocaleString() : (data.score || 0).toLocaleString();
    row.appendChild(val);
    container.appendChild(row);
  }

  async function loadTab(tab) {
    contentWrap.innerHTML = "";
    contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));
    if (tab.type === "game") {
      var list = await window.fetchLeaderboard(tab.id, 20);
      contentWrap.innerHTML = "";
      if (list.length === 0) { contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока пусто. Будь первым!")); return; }
      for (var i = 0; i < list.length; i++) addRow(contentWrap, i, list[i], false);
    } else {
      var topList = await window.fetchTopByMMR(30);
      contentWrap.innerHTML = "";
      if (topList.length === 0) { contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока никого нет.")); return; }
      for (var j = 0; j < topList.length; j++) addRow(contentWrap, j, topList[j], true);
    }
  }

  setTimeout(function () {
    var t = null;
    for (var k = 0; k < tabs.length; k++) if (tabs[k].id === currentTab) t = tabs[k];
    if (t) loadTab(t);
  }, 50);
  return card;
};

console.log("leaderboard v2.2 ready");
