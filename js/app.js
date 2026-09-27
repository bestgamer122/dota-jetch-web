/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — APP
   Роутинг, инициализация.
   ═══════════════════════════════════════════════════════════════════ */

const PAGES = {
    dashboard:    { title: "Главная",         render: renderDashboard },
    analyze:      { title: "Анализ матча",    render: renderAnalyze },
    chat:         { title: "ИИ-ассистент",    render: renderChat },
    history:      { title: "История",         render: renderHistory },
    diary:        { title: "Дневник",         render: renderDiary },
    games:        { title: "Мини-игры",       render: renderGames },
    achievements: { title: "Достижения",      render: renderAchievements },
    settings:     { title: "Настройки",       render: renderSettings },
    about:        { title: "О программе",     render: renderAbout },
};

let currentPage = "dashboard";

function switchPage(name) {
    if (!PAGES[name]) return;
    currentPage = name;
    qsa(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === name));
    const titleEl = qs("#pageTitle");
    if (titleEl) titleEl.textContent = PAGES[name].title;
    const content = qs("#pageContent");
    if (!content) return;
    content.innerHTML = "";
    content.appendChild(PAGES[name].render());
    content.style.opacity = 0;
    requestAnimationFrame(() => {
        content.style.transition = "opacity 0.25s ease";
        content.style.opacity = 1;
    });
    const scroller = qs(".page-scroll");
    if (scroller) scroller.scrollTop = 0;
    location.hash = name;
}

/* ─── DASHBOARD ─── */
function renderDashboard() {
    const frag = document.createDocumentFragment();
    const plus = Store.get("license_active", false);

    frag.appendChild(UI.heroBanner(
        "DOTA JETCH",
        plus ? "AI 2.0 активен" : "Веб-версия · 5 анализов в день",
        [
            UI.btn("▶  Анализ матча", { onclick: () => switchPage("analyze") }),
            UI.btn("✦  ИИ-ассистент", { onclick: () => switchPage("chat"), variant: "ghost" }),
            UI.btn("🎮  Мини-игры", { onclick: () => switchPage("games"), variant: "ghost" }),
        ]
    ));

    const stats = el("div", { class: "stat-grid" });
    const sessions = Store.get("sessions", 0);
    const analyzed = Store.get("analyzed_count", 0) || 0;
    stats.appendChild(UI.statCard("◆", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(sessions), "Всего"));
    stats.appendChild(UI.statCard("⚡", "var(--accent-light)", "var(--accent-bg)", "Осталось", plus ? "15 / 15" : "5 / 5", "Лимит 24ч"));
    stats.appendChild(UI.statCard("🎯", "var(--green)", "var(--green-bg)", "Анализов", String(analyzed), "Всего"));
    frag.appendChild(stats);

    const stats2 = el("div", { class: "stat-grid" });
    const aiQ = Store.get("ai_questions", 0);
    const unlocked = (Store.get("achievements_unlocked", []) || []).length;
    const diaryCount = (Store.get("diary_notes", []) || []).length;
    stats2.appendChild(UI.statCard("🤖", "var(--accent-light)", "var(--accent-bg)", "ИИ вопросы", String(aiQ), "AI 2.0"));
    stats2.appendChild(UI.statCard("🏆", "var(--yellow)", "var(--yellow-bg)", "Ачивки", unlocked + " / 24", "Открыто"));
    stats2.appendChild(UI.statCard("📔", "var(--cyan)", "var(--cyan-bg)", "Дневник", String(diaryCount), "Записей"));
    frag.appendChild(stats2);

    if (lastAnalysis) {
        const last = UI.card("🕐 Последний разобранный матч");
        const row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
        row.appendChild(el("img", {
            src: lastAnalysis.hero.img,
            style: "width:56px;height:56px;border-radius:10px;border:1px solid var(--border-hl);"
        }));
        const info = el("div", { style: "flex:1;" });
        info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
        const p = lastAnalysis.player;
        info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
            `${p.kills}/${p.deaths}/${p.assists} · ${lastAnalysis.won ? "🏆 победа" : "❌ поражение"} · ${lastAnalysis.durMin.toFixed(0)} мин`));
        row.appendChild(info);
        row.appendChild(UI.btn("Открыть", { variant: "ghost", onclick: () => switchPage("analyze") }));
        last.appendChild(row);
        frag.appendChild(last);
    }

    const info = UI.card("✦ DOTA JETCH WEB · Milestone 3");
    info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.7;" },
        "✅ Анализ матчей (OpenDota API)",
        el("br"),
        "✅ ИИ-ассистент (локальная база знаний)",
        el("br"),
        "✅ История, дневник, достижения, мини-игры"
    ));
    frag.appendChild(info);

    return frag;
}

/* ─── SETTINGS ─── */
function renderSettings() {
    const frag = document.createDocumentFragment();

    const themeCard = UI.card("🎨 Тема оформления");
    const sel = el("select", { class: "input" });
    for (const [key, t] of Object.entries(THEMES)) {
        sel.appendChild(el("option", { value: key }, t.label));
    }
    sel.value = loadTheme();
    sel.addEventListener("change", () => {
        applyTheme(sel.value);
        if (typeof Achievements !== "undefined") Achievements.onThemeChange();
        showDialog("Тема применена", "Выбрана: " + THEMES[sel.value].label, "success");
    });
    themeCard.appendChild(sel);
    frag.appendChild(themeCard);

    const dataCard = UI.card("💾 Данные");
    dataCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
        "Все данные хранятся в localStorage браузера."));
    dataCard.appendChild(UI.btn("🗑  Сбросить все данные", {
        variant: "danger",
        onclick: () => {
            if (confirm("Точно удалить всё?")) {
                Store.clear();
                Store.set("data_reset", true);
                if (typeof Achievements !== "undefined") Achievements.check();
                showDialog("Готово", "Данные удалены. Перезагрузи страницу.", "success");
            }
        }
    }));
    frag.appendChild(dataCard);

    const planCard = UI.card("✦  JETCH+");
    planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.6;" },
        "Активация подписки — демо-режим."));
    planCard.appendChild(UI.btn("Активировать JETCH+", {
        onclick: () => {
            Store.set("license_active", true);
            showDialog("Готово", "JETCH+ активирован (демо)", "success");
            setTimeout(() => location.reload(), 800);
        }
    }));
    frag.appendChild(planCard);

    return frag;
}

/* ─── ABOUT ─── */
function renderAbout() {
    const frag = document.createDocumentFragment();
    const head = el("div", { class: "card", style: "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);" });
    head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;letter-spacing:2px;color:var(--accent-light);" },
        "DOTA JETCH · AI 2.0 · WEB"));
    head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" },
        "Match Analyzer · Neural Assistant · Веб-версия"));
    frag.appendChild(head);

    const feat = UI.card("Что работает");
    const list = [
        ["✅ Анализ матчей", "KDA, GPM, XPM, ластхиты, урон, перцентили (OpenDota)"],
        ["✅ ИИ-ассистент", "Локальная база: герои, предметы, механики"],
        ["✅ История", "Сохранённые матчи, повторный разбор"],
        ["✅ Дневник", "Записи с тегами, фильтр"],
        ["✅ Достижения", "24 ачивки, автоматическая разблокировка"],
        ["✅ Мини-игры", "Реакция, викторина, угадай героя"],
    ];
    for (const [t, d] of list) {
        feat.appendChild(el("div", { style: "display:flex;gap:14px;padding:6px 0;" },
            el("div", { style: "width:180px;font-weight:bold;color:var(--gold);font-size:12px;" }, t),
            el("div", { class: "muted", style: "flex:1;font-size:11px;" }, d)));
    }
    frag.appendChild(feat);

    const data = UI.card("Источник данных");
    data.appendChild(el("div", { style: "color:var(--cyan);font-size:11px;" }, "OpenDota API · api.opendota.com"));
    frag.appendChild(data);

    const ver = UI.card("Версия");
    ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "APP_VERSION: " + APP_VERSION));
    frag.appendChild(ver);

    return frag;
}

/* ─── INIT ─── */
function init() {
    applyTheme(loadTheme());

    qsa(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => switchPage(btn.dataset.page));
    });

    Store.set("sessions", (Store.get("sessions", 0) || 0) + 1);

    const hash = (location.hash || "#dashboard").slice(1);
    switchPage(PAGES[hash] ? hash : "dashboard");

    const plus = Store.get("license_active", false);
    const planTitle = qs("#planTitle");
    const planInfo = qs("#planInfo");
    const planValue = qs("#planValue");
    if (planTitle) planTitle.textContent = plus ? "✦ JETCH+" : "FREE";
    if (planInfo) planInfo.textContent = plus ? "AI 2.0 активен" : "5 анализов/день · без ИИ";
    if (planValue) planValue.textContent = plus ? "15 / 15" : "5 / 5";

    if (typeof Achievements !== "undefined") Achievements.check();

    console.log("DOTA JETCH WEB — init OK, version", APP_VERSION);
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", () => {
    const h = (location.hash || "#dashboard
