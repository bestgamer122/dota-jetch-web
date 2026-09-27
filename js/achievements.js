/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — ДОСТИЖЕНИЯ
   24 ачивки. Проверяются при каждом событии.
   ═══════════════════════════════════════════════════════════════════ */

const ACHIEVEMENTS = [
  { id: "a1",  cat: "Анализ",      icon: "🎯", title: "Первый анализ",     desc: "Разобрать 1 матч",            check: s => s.analyzed >= 1 },
  { id: "a2",  cat: "Анализ",      icon: "📊", title: "Аналитик",          desc: "Разобрать 5 матчей",          check: s => s.analyzed >= 5 },
  { id: "a3",  cat: "Анализ",      icon: "🔬", title: "Профи",             desc: "Разобрать 25 матчей",         check: s => s.analyzed >= 25 },
  { id: "a4",  cat: "Анализ",      icon: "🧠", title: "Гуру",              desc: "Разобрать 100 матчей",        check: s => s.analyzed >= 100 },
  { id: "a5",  cat: "Герои",       icon: "🎭", title: "Разнообразие",      desc: "5 разных героев",             check: s => s.uniqueHeroes >= 5 },
  { id: "a6",  cat: "Герои",       icon: "🎪", title: "Коллекционер",      desc: "15 разных героев",            check: s => s.uniqueHeroes >= 15 },
  { id: "a7",  cat: "Герои",       icon: "👑", title: "Все герои",         desc: "50 разных героев",            check: s => s.uniqueHeroes >= 50 },
  { id: "a8",  cat: "Ассистент",   icon: "💬", title: "Первый вопрос",     desc: "Задать 1 вопрос ИИ",          check: s => s.aiQuestions >= 1 },
  { id: "a9",  cat: "Ассистент",   icon: "❓", title: "Любознательный",    desc: "Задать 10 вопросов",          check: s => s.aiQuestions >= 10 },
  { id: "a10", cat: "Ассистент",   icon: "🗣", title: "Болтун",            desc: "Задать 50 вопросов",          check: s => s.aiQuestions >= 50 },
  { id: "a11", cat: "Дневник",     icon: "📝", title: "Первая запись",     desc: "1 запись в дневнике",         check: s => s.diaryNotes >= 1 },
  { id: "a12", cat: "Дневник",     icon: "📔", title: "Хроникёр",          desc: "10 записей",                  check: s => s.diaryNotes >= 10 },
  { id: "a13", cat: "Дневник",     icon: "📚", title: "Автор",             desc: "50 записей",                  check: s => s.diaryNotes >= 50 },
  { id: "a14", cat: "Мини-игры",   icon: "🎮", title: "Игрок",             desc: "Сыграть в любую игру",        check: s => s.gamesPlayed >= 1 },
  { id: "a15", cat: "Мини-игры",   icon: "⚡", title: "Молниеносный",      desc: "Реакция < 250 мс",            check: s => s.reactionBest > 0 && s.reactionBest < 250 },
  { id: "a16", cat: "Мини-игры",   icon: "🥷", title: "Ниндзя",            desc: "Реакция < 200 мс",            check: s => s.reactionBest > 0 && s.reactionBest < 200 },
  { id: "a17", cat: "Мини-игры",   icon: "🎓", title: "Викторина",         desc: "Идеально 10/10",              check: s => s.quizBest >= 10 },
  { id: "a18", cat: "Мини-игры",   icon: "🕵️", title: "Детектив",          desc: "10 героев подряд",            check: s => s.guessBest >= 10 },
  { id: "a19", cat: "Активность",  icon: "🔥", title: "Регулярный",        desc: "5 сессий",                    check: s => s.sessions >= 5 },
  { id: "a20", cat: "Активность",  icon: "💎", title: "Постоянный",        desc: "25 сессий",                   check: s => s.sessions >= 25 },
  { id: "a21", cat: "Активность",  icon: "🌟", title: "Верный",            desc: "100 сессий",                  check: s => s.sessions >= 100 },
  { id: "a22", cat: "Особые",      icon: "🎨", title: "Стилист",           desc: "Сменить тему",                check: s => s.themeChanged === true },
  { id: "a23", cat: "Особые",      icon: "🧹", title: "Чистюля",           desc: "Сбросить данные",             check: s => s.dataReset === true },
  { id: "a24", cat: "Особые",      icon: "🏆", title: "Мастер",            desc: "Открыть 20 других ачивок",    check: s => s.unlockedCount >= 20, late: true },
];

const Achievements = {
  _stats() {
    const unique = Store.get("unique_heroes", []);
    return {
      analyzed:      Store.get("analyzed_count", 0) || 0,
      uniqueHeroes:  Array.isArray(unique) ? unique.length : 0,
      aiQuestions:   Store.get("ai_questions", 0) || 0,
      diaryNotes:    (Store.get("diary_notes", []) || []).length,
      gamesPlayed:   Store.get("games_played", 0) || 0,
      reactionBest:  Store.get("reaction_best", 0) || 0,
      quizBest:      Store.get("quiz_best", 0) || 0,
      guessBest:     Store.get("guess_best_streak", 0) || 0,
      sessions:      Store.get("sessions", 0) || 0,
      themeChanged:  Store.get("theme_changed", false),
      dataReset:     Store.get("data_reset", false),
      unlockedCount: (Store.get("achievements_unlocked", []) || []).length,
    };
  },

  unlocked() {
    const u = Store.get("achievements_unlocked", []);
    return Array.isArray(u) ? u : [];
  },

  isUnlocked(id) { return this.unlocked().includes(id); },

  check() {
    const s = this._stats();
    const unlocked = this.unlocked();
    const newly = [];
    for (const a of ACHIEVEMENTS) {
      if (a.late) continue;
      if (unlocked.includes(a.id)) continue;
      let ok = false;
      try { ok = a.check(s); } catch (e) { ok = false; }
      if (ok) { unlocked.push(a.id); newly.push(a); }
    }
    s.unlockedCount = unlocked.length;
    for (const a of ACHIEVEMENTS) {
      if (!a.late) continue;
      if (unlocked.includes(a.id)) continue;
      let ok = false;
      try { ok = a.check(s); } catch (e) { ok = false; }
      if (ok) { unlocked.push(a.id); newly.push(a); }
    }
    if (newly.length) {
      Store.set("achievements_unlocked", unlocked);
      for (const a of newly) this._toast(a);
    }
    return newly;
  },

  _toast(a) {
    let container = qs("#achToast");
    if (!container) {
      container = el("div", {
        id: "achToast",
        style: "position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;"
      });
      document.body.appendChild(container);
    }
    const t = el("div", {
      style: "background:var(--bg-card);border:1px solid var(--gold);border-radius:12px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:flex;gap:12px;align-items:center;min-width:260px;opacity:0;transform:translateY(20px);transition:opacity 0.3s ease,transform 0.3s ease;"
    });
    t.appendChild(el("div", { style: "font-size:26px;" }, a.icon));
    const info = el("div", { style: "flex:1;" });
    info.appendChild(el("div", { style: "color:var(--gold);font-size:10px;letter-spacing:1.5px;font-weight:bold;" }, "🏆 ДОСТИЖЕНИЕ"));
    info.appendChild(el("div", { style: "font-size:13px;font-weight:bold;color:var(--text);margin-top:2px;" }, a.title));
    info.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, a.desc));
    t.appendChild(info);
    container.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = 1; t.style.transform = "translateY(0)"; });
    setTimeout(() => {
      t.style.opacity = 0;
      t.style.transform = "translateY(20px)";
      setTimeout(() => t.remove(), 300);
    }, 3800);
  },

  onAnalyze(result) {
    if (!result || !result.hero) return;
    Store.set("analyzed_count", (Store.get("analyzed_count", 0) || 0) + 1);
    const unique = Store.get("unique_heroes", []) || [];
    if (!unique.includes(result.hero.id)) {
      unique.push(result.hero.id);
      Store.set("unique_heroes", unique);
    }
    this.check();
  },

  onThemeChange() {
    Store.set("theme_changed", true);
    this.check();
  },
};

/* ─── Страница достижений ─── */
function renderAchievements() {
  const frag = document.createDocumentFragment();
  const unlocked = Achievements.unlocked();

  const head = UI.card("🏆  Достижения");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
    `Открыто ${unlocked.length} из ${ACHIEVEMENTS.length}`));
  const bar = el("div", { style: "height:10px;background:var(--bg-elev);border-radius:5px;overflow:hidden;margin-top:10px;" });
  bar.appendChild(el("div", {
    style: `height:100%;width:${(unlocked.length / ACHIEVEMENTS.length * 100).toFixed(0)}%;background:linear-gradient(90deg,var(--accent),var(--gold));transition:width 0.4s ease;`
  }));
  head.appendChild(bar);
  frag.appendChild(head);

  const cats = {};
  for (const a of ACHIEVEMENTS) {
    if (!cats[a.cat]) cats[a.cat] = [];
    cats[a.cat].push(a);
  }

  for (const [cat, list] of Object.entries(cats)) {
    const card = UI.card("◆  " + cat);
    const grid = el("div", {
      style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;"
    });
    for (const a of list) {
      const isOn = unlocked.includes(a.id);
      const tile = el("div", {
        style: `background:${isOn ? "var(--gold-bg)" : "var(--bg-elev)"};border:1px solid ${isOn ? "var(--gold)" : "var(--border)"};border-radius:12px;padding:12px;text-align:center;opacity:${isOn ? 1 : 0.55};`
      });
      tile.appendChild(el("div", { style: "font-size:32px;filter:" + (isOn ? "none" : "grayscale(1)") + ";" }, a.icon));
      tile.appendChild(el("div", { style: "font-size:12px;font-weight:bold;color:" + (isOn ? "var(--gold)" : "var(--text-muted)") + ";margin-top:6px;" }, a.title));
      tile.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:4px;" }, a.desc));
      if (isOn) tile.appendChild(el("div", { style: "font-size:10px;color:var(--green);margin-top:6px;" }, "✓ Открыто"));
      grid.appendChild(tile);
    }
    card.appendChild(grid);
    frag.appendChild(card);
  }

  return frag;
}
