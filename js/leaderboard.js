/* DOTA JETCH — LEADERBOARD v1.4
   - 3 таба: Взлом, Автоматоны, Топ по рангу
   - Актуальный MMR (из publicProfiles, а не из записи лидерборда)
   - Аватарки */

import { getDatabase, ref, get, update, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

function getCtx() {
  if (!window.__fbAuth) return null;
  try {
    return {
      auth: window.__fbAuth,
      db: getDatabase(window.__fbAuth.app)
    };
  } catch (e) {
    console.warn("leaderboard getCtx:", e);
    return null;
  }
}

window.submitToLeaderboard = async function (game, rawScore, mmr) {  if (game === "quiz") return;
  var ctx = getCtx();
  if (!ctx) return;
  var user = ctx.auth.currentUser;
  if (!user) return;
  var nick = (window.Store && Store.get("nickname", "")) || "Аноним";
  try {
    await update(ref(ctx.db, "leaderboards/" + game + "/" + user.uid), {
      nickname: nick,
      score: rawScore,
      mmr: mmr,
      ts: Date.now()
    });
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
        list.push({
          uid: uid,
          nickname: data[uid].nickname,
          score: data[uid].score,
          mmr: data[uid].mmr
        });
      }
    }

    /* Обогащаем: аватарка + актуальный MMR из publicProfiles */
    for (var i = 0; i < list.length; i++) {
      try {
        var prof = await get(ref(ctx.db, "publicProfiles/" + list[i].uid));
        if (prof.exists()) {
          var pv = prof.val();
          if (pv.avatar && typeof pv.avatar === "string" && pv.avatar.indexOf("data:image") === 0) {
            list[i].avatar = pv.avatar;
          }
          if (typeof pv.mmr === "number") {
            list[i].mmr = pv.mmr;
          }
          if (pv.nickname) {
            list[i].nickname = pv.nickname;
          }
        }
      } catch (e) {}
    }

    list.sort(function (a, b) { return b.score - a.score; });
    return list;
  } catch (e) {
    console.warn("fetchLeaderboard:", e);
    return [];
  }
};

/* Топ по рангу: собираем все publicProfiles с откалиброванным MMR */
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
      if (typeof p.mmr !== "number" || !p.calibrated) continue;
      list.push({
        uid: uid,
        nickname: p.nickname || "Аноним",
        mmr: p.mmr,
        avatar: p.avatar || null
      });
    }
    list.sort(function (a, b) { return b.mmr - a.mmr; });
    return list.slice(0, limit);
  } catch (e) {
    console.warn("fetchTopByMMR:", e);
    return [];
  }
};

window.renderLeaderboard = async function (game) {
  var card = UI.card("🏅 Лидерборд");
  var tabsRow = el("div", { style: "display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;" });
  var tabs = [
    { id: "lockpick", label: "🔓 Взлом", type: "game" },
    { id: "automaton", label: "⌨️ Автоматоны", type: "game" },
    { id: "mmr", label: "🏆 Топ по рангу", type: "mmr" }
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
        for (var k = 0; k < allBtns.length; k++) {
          allBtns[k].classList.remove("active");
          allBtns[k].classList.add("btn-ghost");
        }
        b.classList.add("active");
        b.classList.remove("btn-ghost");
        loadTab(tab);
      });
      tabsRow.appendChild(b);
    })(tabs[g]);
  }
  card.appendChild(tabsRow);
  card.appendChild(contentWrap);

  function buildAvatar(profile, size) {
    size = size || 32;
    var av = el("div", { style: "width:" + size + "px;height:" + size + "px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;font-family:'JetBrains Mono',monospace;flex-shrink:0;background-size:cover;background-position:center;" });
    if (profile && profile.avatar) {
      av.style.backgroundImage = "url(" + profile.avatar + ")";
      av.textContent = "";
    } else {
      av.textContent = String((profile && profile.nickname) || "?").charAt(0).toUpperCase() || "?";
    }
    return av;
  }

  async function loadTab(tab) {
    contentWrap.innerHTML = "";
    contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));

    if (tab.type === "game") {
      var list = await window.fetchLeaderboard(tab.id, 20);
      contentWrap.innerHTML = "";
      if (list.length === 0) {
        contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока никто не играл. Будь первым!"));
        return;
      }
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        var row = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border);" });

        var place = el("div", { style: "width:30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;flex-shrink:0;" });
        if (i === 0) { place.textContent = "🥇"; place.style.fontSize = "20px"; }
        else if (i === 1) { place.textContent = "🥈"; place.style.fontSize = "20px"; }
        else if (i === 2) { place.textContent = "🥉"; place.style.fontSize = "20px"; }
        else { place.textContent = "#" + (i + 1); place.style.color = "var(--text-dim)"; }
        row.appendChild(place);

        row.appendChild(buildAvatar(r, 32));

        var info = el("div", { style: "flex:1;min-width:0;" });
        info.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, r.nickname || "Аноним"));
        info.appendChild(el("div", { class: "dim", style: "font-size:10px;font-family:'JetBrains Mono', monospace;" }, (r.mmr || 0) + " MMR"));
        row.appendChild(info);

        var sc = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);" });
        sc.textContent = (r.score || 0).toLocaleString();
        row.appendChild(sc);

        contentWrap.appendChild(row);
      }
    } else {
      /* Топ по рангу */
      var topList = await window.fetchTopByMMR(30);
      contentWrap.innerHTML = "";
      if (topList.length === 0) {
        contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока никого нет. Сыграй 10 игр, чтобы попасть в топ."));
        return;
      }
      for (var j = 0; j < topList.length; j++) {
        var r2 = topList[j];
        var row2 = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border);" });

        var place2 = el("div", { style: "width:30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;flex-shrink:0;" });
        if (j === 0) { place2.textContent = "🥇"; place2.style.fontSize = "20px"; }
        else if (j === 1) { place2.textContent = "🥈"; place2.style.fontSize = "20px"; }
        else if (j === 2) { place2.textContent = "🥉"; place2.style.fontSize = "20px"; }
        else { place2.textContent = "#" + (j + 1); place2.style.color = "var(--text-dim)"; }
        row2.appendChild(place2);

        row2.appendChild(buildAvatar(r2, 32));

        var info2 = el("div", { style: "flex:1;min-width:0;" });
        info2.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, r2.nickname || "Аноним"));
        /* Ранг */
        var rankLabel = el("div", { style: "font-size:10px;color:var(--text-muted);margin-top:2px;" });
        var medalData = null;
        try {
          /* Используем функцию из rating.js */
          if (typeof window !== "undefined" && typeof window.getMedalForMMR === "function") {
            medalData = window.getMedalForMMR(r2.mmr);
          }
        } catch (e) {}
        if (medalData) {
          rankLabel.textContent = medalData.medal.ru + " · " + medalData.stars + "★";
          rankLabel.style.color = medalData.medal.accent;
        } else {
          rankLabel.textContent = "—";
        }
        info2.appendChild(rankLabel);
        row2.appendChild(info2);

        var mmrVal = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);" });
        mmrVal.textContent = r2.mmr.toLocaleString();
        row2.appendChild(mmrVal);

        contentWrap.appendChild(row2);
      }
    }
  }

  setTimeout(function () {
    var currentTabObj = null;
    for (var k = 0; k < tabs.length; k++) if (tabs[k].id === currentTab) currentTabObj = tabs[k];
    if (currentTabObj) loadTab(currentTabObj);
  }, 50);

  return card
