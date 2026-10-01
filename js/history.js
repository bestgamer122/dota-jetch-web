/* DOTA JETCH — HISTORY v2.0
   - Убрана кнопка «Очистить» (пользователь не управляет данными)
   - Удаление отдельного матча через крестик оставлено */

var History = {
  add: function (r) {
    if (!r || !r.match || !r.hero || !r.player) return;
    var list = Store.get("recentmatches", []) || [];
    var entry = {
      matchId: r.match.match_id, heroId: r.hero.id, heroName: r.hero.name,
      kills: r.player.kills, deaths: r.player.deaths, assists: r.player.assists,
      won: !!r.won, durMin: r.durMin, ts: Date.now()
    };
    var filtered = list.filter(function (x) { return x.matchId !== entry.matchId; });
    filtered.unshift(entry);
    Store.set("recentmatches", filtered.slice(0, 50));
  },
  all: function () {
    var list = Store.get("recentmatches", []);
    return Array.isArray(list) ? list : [];
  },
  remove: function (id) {
    var list = this.all().filter(function (x) { return x.matchId !== id; });
    Store.set("recentmatches", list);
  },
  clear: function () { Store.set("recentmatches", []); }
};

function renderHistory() {
  var frag = document.createDocumentFragment();
  var list = History.all();

  var head = UI.card("История матчей");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
    list.length ? "Сохранено: " + list.length + " матчей" : "Пока пусто. Разбери первый матч на вкладке «Анализ матча»."));
  frag.appendChild(head);

  if (!list.length) return frag;

  var card = UI.card("Список");
  for (var i = 0; i < list.length; i++) {
    (function (m) {
      var item = el("div", { style: "display:flex;align-items:center;gap:14px;padding:10px;border-bottom:1px solid var(--border);" });
      var heroRef = { id: m.heroId, name: m.heroName };
      item.appendChild(heroImgEl(heroRef, 48));
      var info = el("div", { style: "flex:1;" });
      info.appendChild(el("div", { style: "font-size:14px;font-weight:bold;" }, m.heroName));
      info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:3px;" },
        m.kills + "/" + m.deaths + "/" + m.assists + " — " + (m.won ? "победа" : "поражение") + " — " + (m.durMin || 0).toFixed(0) + " мин"));
      item.appendChild(info);

      /* Удаление отдельного матча (крестик) — оставлено */
      var del = UI.btn("✕", { variant: "ghost" });
      del.title = "Удалить матч";
      del.addEventListener("click", function () {
        History.remove(m.matchId);
        switchPage("history");
      });
      item.appendChild(del);

      card.appendChild(item);
    })(list[i]);
  }
  frag.appendChild(card);
  return frag;
}
