/* DOTA JETCH — LEADERBOARD v1.6
   - Сохраняет ТОЛЬКО лучший результат
   - Показывает всех, откалиброванных с рангом, неоткалиброванных с "?"
   - Анимации появления */

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

function ensureLbStyle() {
  if (document.getElementById("lbAnimStyle")) return;
  var s = document.createElement("style");
  s.id = "lbAnimStyle";
  s.textContent = `
    @keyframes lbFadeIn {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .lb-card-anim { animation: lbFadeIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    @keyframes lbRowIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(s);
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
    await update(ref1, {
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
    for (var i = 0; i < list.length; i++) {
      try {
        var prof = await get(ref(ctx.db, "publicProfiles/" + list[i].uid));
        if (prof.exists()) {
          var pv = prof.val();
          if (pv.avatar && typeof pv.avatar === "string" && pv.avatar.indexOf("data:image") === 0) {
            list[i].avatar = pv.avatar;
          }
          if (typeof pv.mmr === "number") list[i].mmr = pv.mmr;
          if (pv.nickname) list[i].nickname = pv.nickname;
          list[i].calibrated = pv.calibrated === true;
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
      if (p.calibrated !== true) continue;
      if (typeof p.mmr !== "number") continue;
      list.push({
        uid: uid,
        nickname: p.nickname || "Anon",
        mmr: p.mmr,
        avatar: p.avatar || null,
        calibrated: true
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
  ensureLbStyle();

  var card = UI.card("🏅 Лидерборд");
  card.classList.add("lb-card-anim");

  var tabsRow = el("div", { style: "display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;" });
  var tabs = [
    { id: "lockpick", label: "🔓 Взлом", type: "game" },
    { id: "automaton", label: "⌨️ Автоматоны", type: "game" },
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
    var av = el("div", { style: "width:" + size + "px;height:" + size + "px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;font-family:monospace;flex-shrink:0;background-size:cover;background-position:center;" });
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
        contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока пусто. Будь первым!"));
        return;
      }

      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        var row = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border);" });
        row.style.animation = "lbRowIn 0.3s ease both";
        row.style.animationDelay = (i * 30) + "ms";

        var place = el("div", { style: "width:30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;flex-shrink:0;" });
        if (i === 0) { place.textContent = "🥇"; place.style.fontSize = "20px"; }
        else if (i === 1) { place.textContent = "🥈"; place.style.fontSize = "20px"; }
        else if (i === 2) { place.textContent = "🥉"; place.style.fontSize = "20px"; }
        else { place.textContent = "#" + (i + 1); place.style.color = "var(--text-dim)"; }
        row.appendChild(place);
        row.appendChild(buildAvatar(r, 32));

        var info = el("div", { style: "flex:1;min-width:0;" });
        info.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, r.nickname || "Аноним"));

        /* Ранг или "Калибровка" */
        var rankLabel = el("div", { style: "font-size:10px;margin-top:2px;" });
        if (r.calibrated && typeof window.getMedalForMMR === "function") {
          try {
            var md = window.getMedalForMMR(r.mmr);
            if (md) {
              rankLabel.textContent = md.medal.ru + " · " + md.stars + "★";
              rankLabel.style.color = md.medal.accent;
            }
          } catch (e) {}
        } else {
          rankLabel.textContent = "Калибровка · ?";
          rankLabel.style.color = "var(--text-dim)";
          rankLabel.style.fontStyle = "italic";
        }
        info.appendChild(rankLabel);
        row.appendChild(info);

        var sc = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);" });
        sc.textContent = (r.score || 0).toLocaleString();
        row.appendChild(sc);
        contentWrap.appendChild(row);
      }
    } else {
      var topList = await window.fetchTopByMMR(30);
      contentWrap.innerHTML = "";
      if (topList.length === 0) {
        contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Пока никого нет. Сыграй 10 игр, чтобы попасть сюда."));
        return;
      }
      for (var j = 0; j < topList.length; j++) {
        var r2 = topList[j];
        var row2 = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border);" });
        row2.style.animation = "lbRowIn 0.3s ease both";
        row2.style.animationDelay = (j * 30) + "ms";

        var place2 = el("div", { style: "width:30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;flex-shrink:0;" });
        if (j === 0) { place2.textContent = "🥇"; place2.style.fontSize = "20px"; }
        else if (j === 1) { place2.textContent = "🥈"; place2.style.fontSize = "20px"; }
        else if (j === 2) { place2.textContent = "🥉"; place2.style.fontSize = "20px"; }
        else { place2.textContent = "#" + (j + 1); place2.style.color = "var(--text-dim)"; }
        row2.appendChild(place2);
        row2.appendChild(buildAvatar(r2, 32));

        var info2 = el("div", { style: "flex:1;min-width:0;" });
        info2.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, r2.nickname || "Аноним"));
        var rankLabel2 = el("div", { style: "font-size:10px;color:var(--text-muted);margin-top:2px;" });
        if (typeof window.getMedalForMMR === "function") {
          try {
            var md2 = window.getMedalForMMR(r2.mmr);
            if (md2) {
              rankLabel2.textContent = md2.medal.ru + " · " + md2.stars + "★";
              rankLabel2.style.color = md2.medal.accent;
            }
          } catch (e) {}
        }
        info2.appendChild(rankLabel2);
        row2.appendChild(info2);

        var mmrVal = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);" });
        mmrVal.textContent = r2.mmr.toLocaleString();
        row2.appendChild(mmrVal);
        contentWrap.appendChild(row2);
      }
    }
  }

  setTimeout(function () {
    var t = null;
    for (var k = 0; k < tabs.length; k++) if (tabs[k].id === currentTab) t = tabs[k];
    if (t) loadTab(t);
  }, 50);

  return card;
};

console.log("leaderboard v1.6 ready");
