/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — ИСТОРИЯ МАТЧЕЙ
   ═══════════════════════════════════════════════════════════════════ */

const History = {
  add(result) {
    if (!result || !result.match || !result.hero || !result.player) return;
    const list = Store.get("recent_matches", []) || [];
    const entry = {
      matchId: result.match.match_id,
      heroId: result.hero.id,
      heroName: result.hero.name,
      heroImg: result.hero.img,
      kills: result.player.kills,
      deaths: result.player.deaths,
      assists: result.player.assists,
      won: !!result.won,
      durMin: result.durMin,
      ts: Date.now(),
    };
    const filtered = list.filter(x => x.matchId !== entry.matchId);
    filtered.unshift(entry);
    Store.set("recent_matches", filtered.slice(0, 50));
  },

  all() {
    const list = Store.get("recent_matches", []);
    return Array.isArray(list) ? list : [];
  },

  remove(matchId) {
    const list = History.all().filter(x => x.matchId !== matchId);
    Store.set("recent_matches", list);
  },

  clear() {
    Store.set("recent_matches", []);
  },
};

function renderHistory() {
  const frag = document.createDocumentFragment();

  const head = UI.card("☰  История матчей");
  const list = History.all();
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
    list.length ? `Сохранено матчей: ${list.length}` : "Пока ничего нет. Разбери матч во вкладке «Анализ матча»."));

  if (list.length) {
    const row = el("div", { class: "row", style: "margin-top:10px;" });
    const clr = UI.btn("🗑  Очистить всё", { variant: "danger" });
    clr.addEventListener("click", () => {
      if (confirm("Удалить всю историю?")) {
        History.clear();
        switchPage("history");
      }
    });
    row.appendChild(clr);
    head.appendChild(row);
  }
  frag.appendChild(head);

  if (!list.length) return frag;

  const stat = el("div", { class: "stat-grid" });
  const wins = list.filter(x => x.won).length;
  stat.appendChild(UI.statCard("🏆", "var(--green)", "var(--green-bg)", "Побед", String(wins), list.length ? Math.round(wins / list.length * 100) + "%" : "—"));
  stat.appendChild(UI.statCard("❌", "var(--red)", "var(--red-bg)", "Поражений", String(list.length - wins), "—"));
  const avgKda = list.length ? (list.reduce((a, x) => a + (x.kills + x.assists) / Math.max(x.deaths, 1), 0) / list.length) : 0;
  stat.appendChild(UI.statCard("📊", "var(--cyan)", "var(--cyan-bg)", "Средний КДА", avgKda.toFixed(2), "—"));
  frag.appendChild(stat);

  const card = UI.card("📋  Список");
  for (const m of list) {
    const item = el("div", {
      style: "display:flex;align-items:center;gap:14px;padding:10px;border-bottom:1px solid var(--border);"
    });
    if (m.heroImg) item.appendChild(el("img", {
      src: m.heroImg,
      style: "width:48px;height:48px;border-radius:8px;border:1px solid var(--border-hl);flex-shrink:0;"
    }));
    const info = el("div", { style: "flex:1;min-width:0;" });
    info.appendChild(el("div", { style: "font-size:14px;font-weight:bold;" }, m.heroName));
    const line = el("div", { class: "muted", style: "font-size:11px;margin-top:3px;" });
    line.textContent = `${m.kills}/${m.deaths}/${m.assists} · ${m.won ? "🏆 победа" : "❌ поражение"} · ${(m.durMin || 0).toFixed(0)} мин · матч ${m.matchId}`;
    info.appendChild(line);
    item.appendChild(info);

    const btn = UI.btn("↻", { variant: "ghost" });
    btn.title = "Разобрать снова";
    btn.addEventListener("click", () => {
      switchPage("analyze");
      setTimeout(() => {
        const inp = qs("#matchIdInput");
        const h = qs("#heroInput");
        if (inp) inp.value = m.matchId;
        if (h) h.value = m.heroName;
      }, 50);
    });
    item.appendChild(btn);

    const del = UI.btn("✕", { variant: "ghost" });
    del.addEventListener("click", () => {
      History.remove(m.matchId);
      switchPage("history");
    });
    item.appendChild(del);

    card.appendChild(item);
  }
  frag.appendChild(card);
  return frag;
}
