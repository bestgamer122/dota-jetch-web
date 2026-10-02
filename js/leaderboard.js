/* DOTA JETCH — LEADERBOARD v1.2
   - Убран таб «Викторина» (нет смысла в рейтинге)
   - Ленивое получение db/auth */

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

window.submitToLeaderboard = async function (game, rawScore, mmr) {
  /* Викторина не отправляется в лидерборд */
  if (game === "quiz") return;
  var ctx = getCtx();
  if (!ctx) { console.warn("leaderboard: не готов (auth)"); return; }
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
    console.log("🏅 Лидерборд обновлён: " + game + " = " + rawScore);
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
    list.sort(function (a, b) { return b.score - a.score; });
    return list;
  } catch (e) {
    console.warn("fetchLeaderboard:", e);
    return [];
  }
};

window.renderLeaderboard = async function (game) {
  var card = UI.card("🏅 Лидерборд");
  var tabsRow = el("div", { style: "display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;" });
  var games = [
    { id: "lockpick", label: "🔓 Взлом" },
    { id: "automaton", label: "⌨️ Автоматоны" }
  ];
  var currentLbGame = game || "lockpick";
  var contentWrap = el("div", { id: "lbContent" });
  contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));

  for (var g = 0; g < games.length; g++) {
    (function (gm) {
      var b = UI.btn(gm.label, { variant: gm.id === currentLbGame ? undefined : "ghost" });
      b.style.fontSize = "12px";
      b.addEventListener("click", function () {
        currentLbGame = gm.id;
        var allBtns = tabsRow.querySelectorAll("button");
        for (var k = 0; k < allBtns.length; k++) {
          allBtns[k].classList.remove("active");
          allBtns[k].classList.add("btn-ghost");
        }
        b.classList.add("active");
        b.classList.remove("btn-ghost");
        loadLb(gm.id);
      });
      tabsRow.appendChild(b);
    })(games[g]);
  }
  card.appendChild(tabsRow);
  card.appendChild(contentWrap);

  async function loadLb(gameId) {
    contentWrap.innerHTML = "";
    contentWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));

    var list = await window.fetchLeaderboard(gameId, 20);

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

      var av = el("div", { style: "width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;font-family:'JetBrains Mono',monospace;flex-shrink:0;" });
      av.textContent = String(r.nickname || "?").charAt(0).toUpperCase() || "?";
      row.appendChild(av);

      var info = el("div", { style: "flex:1;min-width:0;" });
      info.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, r.nickname || "Аноним"));
      info.appendChild(el("div", { class: "dim", style: "font-size:10px;" }, r.mmr + " MMR"));
      row.appendChild(info);

      var sc = el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--gold);" });
      sc.textContent = (r.score || 0).toLocaleString();
      row.appendChild(sc);

      contentWrap.appendChild(row);
    }
  }

  setTimeout(function () { loadLb(currentLbGame); }, 50
