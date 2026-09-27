/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — АНАЛИЗ МАТЧА
   ═══════════════════════════════════════════════════════════════════ */

const RANK_NAMES = {0:"Uncalibrated",1:"Herald",2:"Guardian",3:"Crusader",4:"Archon",
                    5:"Legend",6:"Ancient",7:"Divine",8:"Immortal"};
const RANK_COLORS = {0:"#6b7280",1:"#6b7280",2:"#9ca3af",3:"#22c55e",4:"#eab308",
                     5:"#f59e0b",6:"#f97316",7:"#d946ef",8:"#ef4444"};
const MODE_NAMES = {1:"All Pick",2:"Captains Mode",3:"Random Draft",4:"Single Draft",
                    5:"All Random",22:"Ranked All Pick",23:"Turbo"};
const POSITION_NAMES = {1:"Pos 1 · Керри",2:"Pos 2 · Мид",3:"Pos 3 · Оффлейн",
                        4:"Pos 4 · Роум",5:"Pos 5 · Саппорт"};
const POSITION_COLORS = {1:"#fbbf24",2:"#d946ef",3:"#ef4444",4:"#60a5fa",5:"#4ade80"};

let lastAnalysis = null;

function detectPosition(player, match) {
    const lane = player.lane_role;
    if (lane === 2) return 2;
    if (lane === 1) return 1;
    if (lane === 3) return 3;
    return null;
}

async function runAnalysis(matchId, heroName) {
    const heroes = await getHeroes();
    if (!heroes.length) throw new Error("Не удалось загрузить список героев. Проверь интернет.");

    const hero = await findHeroId(heroName);
    if (!hero) throw new Error(`Герой «${heroName}» не найден`);

    const match = await apiGet(`/matches/${matchId}`);
    if (!match || !match.players) throw new Error("Матч не найден или недоступен");
    if (match.duration === undefined) throw new Error("Матч не распарсен (duration отсутствует)");

    const player = match.players.find(p => p.hero_id === hero.id);
    if (!player) throw new Error(`${hero.name} не играл в этом матче`);

    const bench = await apiGet("/benchmarks", { hero_id: hero.id }) || {};

    const isRadiant = player.player_slot < 128;
    const won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
    const durMin = match.duration / 60;

    return {
        match, player, hero, bench, won, durMin,
        position: detectPosition(player, match),
        rankTier: player.rank_tier || null,
    };
}

function renderAnalyze() {
    const frag = document.createDocumentFragment();

    const form = UI.card("▶  Новый анализ");
    form.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:12px;" },
        "Введи ID матча и имя героя. Данные берутся из OpenDota API."));

    const row = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
    const idWrap = el("div");
    idWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;letter-spacing:1px;" }, "ID МАТЧА"));
    const idInput = UI.input("8123456789");
    idInput.id = "matchIdInput";
    idInput.type = "number";
    idWrap.appendChild(idInput);
    const heroWrap = el("div");
    heroWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;letter-spacing:1px;" }, "ГЕРОЙ"));
    const heroInput = UI.input("Juggernaut / пудж / ам");
    heroInput.id = "heroInput";
    heroWrap.appendChild(heroInput);
    row.appendChild(idWrap);
    row.appendChild(heroWrap);
    form.appendChild(row);

    const btnRow = el("div", { class: "row" });
    const btn = UI.btn("▶  Анализировать", { id: "analyzeBtn" });
    btn.addEventListener("click", () => onAnalyzeClick());
    btnRow.appendChild(btn);
    const hint = el("span", { class: "dim", style: "font-size:11px;" });
    hint.id = "analyzeHint";
    btnRow.appendChild(hint);
    form.appendChild(btnRow);
    frag.appendChild(form);

    const report = el("div", { id: "analyzeReport" });
    frag.appendChild(report);

    return frag;
}

async function onAnalyzeClick() {
    const idInput = qs("#matchIdInput");
    const heroInput = qs("#heroInput");
    const hint = qs("#analyzeHint");
    const btn = qs("#analyzeBtn");
    const report = qs("#analyzeReport");

    const mid = (idInput.value || "").trim();
    const hero = (heroInput.value || "").trim();

    if (!mid || !hero) { setHint(hint, "Заполни оба поля", "var(--red)"); return; }
    if (!/^\d+$/.test(mid)) { setHint(hint, "ID матча должен быть числом", "var(--red)"); return; }

    btn.disabled = true;
    btn.textContent = "⏳ Загрузка...";
    setHint(hint, "Загружаю матч...", "var(--accent-light)");
    report.innerHTML = "";
    report.appendChild(loadingCard("Загружаю матч из OpenDota..."));

    try {
        const result = await runAnalysis(parseInt(mid, 10), hero);
        report.innerHTML = "";
        report.appendChild(buildReport(result));
        lastAnalysis = result;
        Store.set("last_match_id", mid);
        Store.set("last_hero", hero);
        if (typeof History !== "undefined") History.add(result);
        if (typeof Achievements !== "undefined") Achievements.onAnalyze(result);
        setHint(hint, "Готово!", "var(--green)");
    } catch (e) {
        report.innerHTML = "";
        report.appendChild(errorCard(e.message || String(e)));
        setHint(hint, e.message || "Ошибка", "var(--red)");
    } finally {
        btn.disabled = false;
        btn.textContent = "▶  Анализировать";
    }
}

function setHint(el, text, color) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color || "var(--text-muted)";
}

function loadingCard(text) {
    const c = UI.card("");
    c.appendChild(el("div", { style: "text-align:center;padding:30px;" },
        el("div", { style: "font-size:24px;margin-bottom:8px;" }, "⏳"),
        el("div", { class: "muted", style: "font-size:12px;" }, text)
    ));
    return c;
}

function errorCard(text) {
    const c = UI.card("");
    c.style.borderColor = "var(--red)";
    c.appendChild(el("div", { class: "muted", style: "font-size:13px;color:var(--red);" }, "❌ " + text));
    return c;
}

function buildReport(r) {
    const frag = document.createDocumentFragment();
    const p = r.player;
    const m = r.match;

    const head = el("div", { class: "card", style: "background:linear-gradient(135deg,var(--accent-dark),var(--bg-card));border-color:var(--accent);" });
    const headInner = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });

    headInner.appendChild(el("img", {
        src: r.hero.img,
        alt: r.hero.name,
        style: "width:96px;height:96px;border-radius:12px;border:2px solid var(--accent);flex-shrink:0;"
    }));

    const headInfo = el("div", { style: "flex:1;min-width:200px;" });
    headInfo.appendChild(el("div", { style: "font-size:26px;font-weight:bold;letter-spacing:1px;color:var(--text);" }, r.hero.name));

    const badges = el("div", { class: "row", style: "margin-top:8px;flex-wrap:wrap;" });
    if (r.position) badges.appendChild(UI.badge(POSITION_NAMES[r.position], POSITION_COLORS[r.position], "var(--bg-elev)"));
    if (r.rankTier) {
        const medal = Math.floor(r.rankTier / 10);
        const star = r.rankTier % 10;
        const stars = star ? " " + "★".repeat(star) : "";
        badges.appendChild(UI.badge((RANK_NAMES[medal] || "?") + stars, RANK_COLORS[medal] || "var(--text-muted)", "var(--bg-elev)"));
    }
    badges.appendChild(UI.badge(r.durMin.toFixed(1) + " мин", "var(--text-muted)", "var(--bg-elev)"));
    badges.appendChild(UI.badge(MODE_NAMES[m.game_mode] || "—", "var(--text-muted)", "var(--bg-elev)"));
    headInfo.appendChild(badges);

    const kda = el("div", { style: "margin-top:14px;display:flex;align-items:baseline;gap:12px;" });
    kda.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" },
        `${p.kills} / ${p.deaths} / ${p.assists}`));
    kda.appendChild(el("div", { class: "muted", style: "font-size:12px;" },
        `КДА ${((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2)}`));
    headInfo.appendChild(kda);
    headInner.appendChild(headInfo);

    const wl = el("div", { style: "text-align:right;" });
    const wlBadge = r.won
        ? UI.badge("ПОБЕДА", "var(--green)", "var(--green-bg)")
        : UI.badge("ПОРАЖЕНИЕ", "var(--red)", "var(--red-bg)");
    wlBadge.style.fontSize = "14px";
    wlBadge.style.padding = "8px 16px";
    wl.appendChild(wlBadge);
    headInner.appendChild(wl);

    head.appendChild(headInner);
    frag.appendChild(head);

    const metricsCard = UI.card("📊 Статистика");
    const metrics = buildMetrics(r);
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
    for (const mtr of metrics) grid.appendChild(metricTile(mtr));
    metricsCard.appendChild(grid);
    frag.appendChild(metricsCard);

    if (Object.keys(r.bench).length) {
        const pctCard = UI.card("📈 Перцентили (против других игроков на этом герое)");
        const pctItems = [
            ["GPM", "gold_per_min", p.gold_per_min],
            ["XPM", "xp_per_min", p.xp_per_min],
            ["Ластхиты/мин", "last_hits_per_min", p.last_hits / Math.max(r.durMin, 1)],
            ["Денаи/мин", "denies_per_min", p.denies / Math.max(r.durMin, 1)],
            ["Урон/мин", "hero_damage_per_min", p.hero_damage / Math.max(r.durMin, 1)],
            ["Хил/мин", "hero_healing_per_min", p.hero_healing / Math.max(r.durMin, 1)],
        ];
        for (const [label, key, val] of pctItems) {
            const pct = percentileOf(r.bench, key, val);
            if (pct === null) continue;
            pctCard.appendChild(pctBar(label, pct));
        }
        frag.appendChild(pctCard);
    }

    const linkCard = el("div", { style: "text-align:center;padding:14px;" });
    const link = el("a", {
        href: `https://www.opendota.com/matches/${m.match_id}`,
        target: "_blank",
        style: "color:var(--cyan);font-size:12px;"
    }, "🔗 Открыть матч на OpenDota");
    linkCard.appendChild(link);
    frag.appendChild(linkCard);

    return frag;
}

function buildMetrics(r) {
    const p = r.player; const dur = Math.max(r.durMin, 1);
    return [
        { icon: "💰", color: "var(--gold)", bg: "var(--gold-bg)", label: "GPM", value: Math.round(p.gold_per_min) },
        { icon: "⚡", color: "var(--cyan)", bg: "var(--cyan-bg)", label: "XPM", value: Math.round(p.xp_per_min) },
        { icon: "🎯", color: "var(--green)", bg: "var(--green-bg)", label: "Ластхиты", value: p.last_hits },
        { icon: "🌾", color: "var(--accent-light)", bg: "var(--accent-bg)", label: "Денаи", value: p.denies },
        { icon: "⚔️", color: "var(--red)", bg: "var(--red-bg)", label: "Урон героям", value: Math.round(p.hero_damage).toLocaleString() },
        { icon: "🏰", color: "var(--orange)", bg: "var(--orange-bg)", label: "Урон строениям", value: Math.round(p.tower_damage || 0).toLocaleString() },
        { icon: "❤️", color: "var(--green)", bg: "var(--green-bg)", label: "Хил", value: Math.round(p.hero_healing || 0).toLocaleString() },
        { icon: "💎", color: "var(--yellow)", bg: "var(--yellow-bg)", label: "Нетфорс", value: Math.round(p.net_worth || 0).toLocaleString() },
        { icon: "💀", color: "var(--red)", bg: "var(--red-bg)", label: "Смертей/мин", value: (p.deaths / dur).toFixed(2) },
        { icon: "🎬", color: "var(--accent-light)", bg: "var(--accent-bg)", label: "Длительность", value: dur.toFixed(0) + " мин" },
    ];
}

function metricTile(m) {
    const tile = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:12px;" });
    tile.appendChild(el("div", { style: "display:flex;align-items:center;justify-content:space-between;" },
        el("span", { class: "muted", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;" }, m.label),
        el("span", { style: `color:${m.color};font-size:14px;` }, m.icon)
    ));
    tile.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);margin-top:6px;" }, String(m.value)));
    return tile;
}

function pctBar(label, pct) {
    const color = pctColor(pct);
    const grade = pctGrade(pct);
    const row = el("div", { style: "display:flex;align-items:center;gap:12px;padding:6px 0;" });
    row.appendChild(el("div", { style: "width:120px;font-size:12px;color:var(--text-muted);" }, label));
    const barWrap = el("div", { style: "flex:1;height:8px;background:var(--bg-elev);border-radius:4px;overflow:hidden;" });
    barWrap.appendChild(el("div", { style: `height:100%;width:${pct.toFixed(0)}%;background:${color};border-radius:4px;transition:width 0.4s ease;` }));
    row.appendChild(barWrap);
    row.appendChild(el("div", { style: `width:60px;text-align:right;font-size:12px;font-weight:bold;color:${color};` },
        `${pct.toFixed(0)}% · ${grade}`));
    return row;
}
