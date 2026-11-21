/* DOTA JETCH — HISTORY v2.0
   - Убрана кнопка «Очистить» (пользователь не управляет данными)
   - Удаление отдельного матча через крестик оставлено */

var MatchHistory = {
  add: function (r) {
    if (!r || !r.match || !r.hero || !r.player) return;
    var list = Store.get("recentmatches", []) || [];
    var entry = {
      matchId: r.match.match_id, heroId: r.hero.id, heroName: r.hero.name, heroSlug: r.hero.slug,
      kills: r.player.kills, deaths: r.player.deaths, assists: r.player.assists,
      won: !!r.won, durMin: r.durMin, ts: Date.now()
    };
    var filtered = list.filter(function (x) { return String(x.matchId) !== String(entry.matchId); });
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
  var list = MatchHistory.all();

  var card = UI.card("История матчей");
  card.appendChild(el("div", { class: "progress-caption", style: "margin:-8px 0 12px;" },
    list.length ? "Сохранено " + list.length + " " + (list.length === 1 ? "матч" : (list.length < 5 ? "матча" : "матчей")) : "Пока пусто"));

  if (!list.length) {
    var empty = el("div", { class: "empty-state" });
    empty.appendChild(el("div", { class: "empty-title" }, "Здесь появятся разобранные матчи"));
    empty.appendChild(el("div", { class: "empty-sub" }, "Открой «Анализ матча», укажи ID и героя — разбор сохранится автоматически."));
    var go = UI.btn("Перейти к анализу", { variant: "ghost", onclick: function () { switchPage("analyze"); } });
    empty.appendChild(go);
    card.appendChild(empty);
    frag.appendChild(card);
    return frag;
  }

  var rows = el("div", { class: "match-list" });
  for (var i = 0; i < list.length; i++) {
    (function (m) {
      var row = el("div", { class: "match-row" });
      row.appendChild(heroImgEl({ id: m.heroId, name: m.heroName, slug: m.heroSlug }, 32));

      var info = el("div", { class: "match-info" });
      info.appendChild(el("div", { class: "match-hero" }, m.heroName || "Герой"));
      info.appendChild(el("div", { class: "match-meta" },
        (m.kills || 0) + " / " + (m.deaths || 0) + " / " + (m.assists || 0) +
        " · " + Math.round(m.durMin || 0) + " мин"));
      row.appendChild(info);

      row.appendChild(el("span", { class: "badge " + (m.won ? "badge-win" : "badge-loss") }, m.won ? "W" : "L"));

      var del = el("button", { class: "icon-btn", type: "button", title: "Удалить матч", "aria-label": "Удалить матч" });
      del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      del.addEventListener("click", function () {
        MatchHistory.remove(m.matchId);
        switchPage("history");
      });
      row.appendChild(del);

      rows.appendChild(row);
    })(list[i]);
  }
  card.appendChild(rows);
  frag.appendChild(card);
  return frag;
}
