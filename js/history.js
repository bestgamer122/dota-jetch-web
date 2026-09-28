/* DOTA JETCH — ИСТОРИЯ v3.4.0 */

var History = {
  add: function (result) {
    if (!result || !result.match || !result.hero || !result.player) return;
    var list = Store.get("recentmatches", []) || [];
    var entry = {
      matchId: result.match.match_id,
      heroId: result.hero.id,
      heroName: result.hero.name,
      kills: result.player.kills,
      deaths: result.player.deaths,
      assists: result.player.assists,
      won: !!result.won,
      durMin: result.durMin,
      ts: Date.now()
    };
    var filtered = list.filter(function (x) { return x.matchId !== entry.matchId; });
    filtered.unshift(entry);
    Store.set("recentmatches", filtered.slice(0, 50));
  },
  all: function () {
    var list = Store.get("recentmatches", []);
    return Array.isArray(list) ? list : [];
  },
  remove: function (matchId) {
    var list = this.all().filter(function (x) { return x.matchId !== matchId; });
    Store.set("recentmatches", list);
  },
  clear: function () { Store.set("recentmatches", []); }
};

function renderHistory() {
  var frag = document.createDocumentFragment();
  var head = UI.card("История матчей");
  var list = History.all();
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
    list.length ? "Сохранено: " + list.length : "Пока пусто. Разбери матч во вкладке «Анализ матча»."));
  if (list.length) {
    var row = el("div", { class: "row", style: "margin-top:10px;" });
    var clr = UI.btn("Очистить всё", { variant: "danger" });
    clr.addEventListener("click", function () {
      if (confirm("Удалить всю историю?")) { History.clear(); switchPage("history"); }
    });
    row.appendChild(clr);
    head.appendChild(row);
  }
  frag.appendChild(head);
  if (!list.length) return frag;

  var card = UI.card("Список");
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    var item = el("div", { style: "display:flex;align-items:center;gap:14px;padding:10px;border-bottom:1px solid var(--border);" });
    var heroRef = { id: m.heroId, name: m.heroName };
    item.appendChild(heroImgEl(heroRef, 48));
    var info = el("div", { style: "flex:1;min-width:0;" });
    info.appendChild(el("div", { style: "font-size:14px;font-weight:bold;" }, m.heroName));
    info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:3px;" },
      m.kills + "/" + m.deaths + "/" + m.assists + " · " + (m.won ? "🏆 победа" : "❌ поражение") + " · " + (m.durMin || 0).toFixed(0) + " мин"));
    item.appendChild(info);
    var reBtn = UI.btn("↻", { variant: "ghost" });
    reBtn.addEventListener("click", function (matchId, heroName) {
      return function () {
        switchPage("analyze");
        setTimeout(function () {
          var inp = qs("#matchIdInput"), h = qs("#heroInput");
          if (inp) inp.value = matchId;
          if (h) h.value = heroName;
        }, 50);
      };
    }(m.matchId, m.heroName));
    item.appendChild(reBtn);
    card.appendChild(item);
  }
  frag.appendChild(card);
  return frag;
}