/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — АНАЛИЗ МАТЧА (v3)
   ═══════════════════════════════════════════════════════════════════ */

const RANK_NAMES = {0:"Uncalibrated",1:"Herald",2:"Guardian",3:"Crusader",4:"Archon",
                    5:"Legend",6:"Ancient",7:"Divine",8:"Immortal"};
const RANK_COLORS = {0:"#6b7280",1:"#6b7280",2:"#9ca3af",3:"#22c55e",4:"#eab308",
                     5:"#f59e0b",6:"#f97316",7:"#d946ef",8:"#ef4444"};
const MODE_NAMES = {1:"All Pick",2:"Captains Mode",3:"Random Draft",4:"Single Draft",
                    5:"All Random",22:"Ranked All Pick",23:"Turbo"};
const LOBBY_NAMES = {0:"Normal",1:"Practice",2:"Tournament",5:"Team",6:"Solo",7:"Ranked",9:"Solo Mid"};
const REGION_NAMES = {1:"US West",2:"US East",3:"Europe West",5:"Singapore",6:"Dubai",
                      7:"Australia",8:"Stockholm",9:"Austria",10:"Brazil",11:"South Africa",
                      12:"China",13:"China",14:"Chile",15:"Peru",16:"India",17:"Europe East",
                      18:"Europe",19:"US East",20:"US West",21:"Korea",22:"Japan",25:"China",37:"China"};
const POSITION_NAMES = {1:"Pos 1 · Керри",2:"Pos 2 · Мид",3:"Pos 3 · Оффлейн",
                        4:"Pos 4 · Роум",5:"Pos 5 · Саппорт"};
const POSITION_COLORS = {1:"#fbbf24",2:"#d946ef",3:"#ef4444",4:"#60a5fa",5:"#4ade80"};

let lastAnalysis = null;

async function fetchWithRetry(path, params, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await apiGet(path, params);
        } catch (e) {
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, 800 * (i + 1)));
        }
    }
}

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

    const match = await fetchWithRetry(`/matches/${matchId}`);
    if (!match || !match.players || !Array.isArray(match.players)) {
        throw new Error("Матч не найден или недоступен");
    }
    if (match.duration === undefined) {
        throw new Error("Матч не распарсен (duration отсутствует)");
    }

    const player = match.players.find(p => p.hero_id === hero.id);
    if (!player) throw new Error(`${hero.name} не играл в этом матче`);

    let bench = {};
    try { bench = await fetchWithRetry("/benchmarks", { hero_id: hero.id }) || {}; }
    catch (e) { console.warn("benchmarks недоступны", e); }

    let items = {};
    try { items = await getItemCatalog(); }
    catch (e) { console.warn("items catalog недоступен", e); }

    const isRadiant = player.player_slot < 128;
    const won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
    const durMin = match.duration / 60;

    return {
        match, player, hero, bench, items, heroes, won, durMin,
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

/* ─── ЗАГОЛОВОК ─── */
function buildHeader(r) {
    const p = r.player;
    const m = r.match;

    const head = el("div", { class: "card", style: "background:linear-gradient(135deg,rgba(139,92,246,0.35),var(--bg-card));border-color:rgba(139,92,246,0.5);" });
    const headInner = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });

    headInner.appendChild(heroImgEl(r.hero, 96));

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
    return head;
}

/* ─── ИНФОРМАЦИЯ О МАТЧЕ ─── */
function buildMatchInfoCard(r) {
    const m = r.match;
    const card = UI.card("ℹ️ Информация о матче");
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;" });

    function info(label, value) {
        const w = el("div");
        w.appendChild(el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;" }, label));
        w.appendChild(el("div", { style: "font-size:13px;font-weight:600;color:var(--text);word-break:break-word;" }, String(value)));
        return w;
    }

    grid.appendChild(info("Match ID", m.match_id));
    if (m.start_time) {
        const d = new Date(m.start_time * 1000);
        grid.appendChild(info("Дата", d.toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })));
    }
    if (m.region !== undefined) grid.appendChild(info("Регион", REGION_NAMES[m.region] || ("#" + m.region)));
    if (m.patch) grid.appendChild(info("Патч", m.patch));
    if (m.radiant_score !== undefined && m.dire_score !== undefined) {
        grid.appendChild(info("Счёт", m.radiant_score + " : " + m.dire_score));
    }
    if (m.game_mode) grid.appendChild(info("Режим", MODE_NAMES[m.game_mode] || ("#" + m.game_mode)));
    if (m.lobby_type !== undefined) grid.appendChild(info("Лобби", LOBBY_NAMES[m.lobby_type] || ("#" + m.lobby_type)));
    if (m.radiant_win !== undefined) grid.appendChild(info("Победитель", m.radiant_win ? "Radiant" : "Dire"));
    if (m.version) grid.appendChild(info("Версия парса", m.version ? "да" : "нет"));

    card.appendChild(grid);
    return card;
}

/* ─── ИНВЕНТАРЬ ─── */
function buildInventoryCard(r) {
    const p = r.player;
    const items = r.items || {};
    const slots = [];
    for (let i = 0; i < 6; i++) slots.push(p["item_" + i] || 0);
    const hasAny = slots.some(id => id > 0);
    if (!hasAny) return null;

    const card = UI.card("🎒 Финальный инвентарь");
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:420px;" });
    for (const id of slots) {
        const item = id > 0 ? items[id] : null;
        const cell = itemImgEl(item);
        if (item) cell.title = item.name;
        grid.appendChild(cell);
    }
    card.appendChild(grid);

    const extras = el("div", { class: "row", style: "margin-top:12px;flex-wrap:wrap;gap:8px;" });
    if (p.aghanims_scepter) extras.appendChild(UI.badge("Aghanim's Scepter", "var(--gold)", "var(--gold-bg)"));
    if (p.aghanims_shard) extras.appendChild(UI.badge("Aghanim's Shard", "var(--gold)", "var(--gold-bg)"));
    if (p.item_neutral && items[p.item_neutral]) {
        const n = el("div", { style: "display:flex;align-items:center;gap:6px;" });
        const box = el("div", { style: "width:40px;height:40px;border-radius:8px;background:var(--bg-elev);border:1px solid var(--border);overflow:hidden;" });
        box.appendChild(itemImgEl(items[p.item_neutral]));
        // вставляем img внутрь box
        while (box.firstChild) box.replaceChild(box.firstChild, box.firstChild);
        // проще — просто создаём box через itemImgEl:
        n.innerHTML = "";
        const ni = itemImgEl(items[p.item_neutral]);
        ni.style.width = "40px";
        n.appendChild(ni);
        n.appendChild(el("span", { class: "dim", style: "font-size:11px;" }, "Нейтральный: " + items[p.item_neutral].name));
        extras.appendChild(n);
    }
    if (extras.children.length) card.appendChild(extras);
    return card;
}

/* ─── МЕТРИКИ ─── */
function buildMetricsCard(r) {
    const card = UI.card("📊 Статистика");
    const metrics = [
        { icon: "💰", color: "var(--gold)", label: "GPM", value: Math.round(r.player.gold_per_min || 0) },
        { icon: "⚡", color: "var(--cyan)", label: "XPM", value: Math.round(r.player.xp_per_min || 0) },
        { icon: "🎯", color: "var(--green)", label: "Ластхиты", value: r.player.last_hits || 0 },
        { icon: "🌾", color: "var(--accent-light)", label: "Денаи", value: r.player.denies || 0 },
        { icon: "⚔️", color: "var(--red)", label: "Урон героям", value: Math.round(r.player.hero_damage || 0).toLocaleString() },
        { icon: "🏰", color: "var(--orange)", label: "Урон строениям", value: Math.round(r.player.tower_damage || 0).toLocaleString() },
        { icon: "❤️", color: "var(--green)", label: "Хил", value: Math.round(r.player.hero_healing || 0).toLocaleString() },
        { icon: "💎", color: "var(--yellow)", label: "Нетфорс", value: Math.round(r.player.net_worth || 0).toLocaleString() },
        { icon: "💀", color: "var(--red)", label: "Смертей/мин", value: (r.player.deaths / Math.max(r.durMin, 1)).toFixed(2) },
        { icon: "🎬", color: "var(--accent-light)", label: "Длительность", value: r.durMin.toFixed(0) + " мин" },
    ];
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
    for (const m of metrics) {
        const tile = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:12px;" });
        tile.appendChild(el("div", { style: "display:flex;align-items:center;justify-content:space-between;" },
            el("span", { class: "muted", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;" }, m.label),
            el("span", { style: `color:${m.color};font-size:14px;` }, m.icon)
        ));
        tile.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);margin-top:6px;" }, String(m.value)));
        grid.appendChild(tile);
    }
    card.appendChild(grid);
    return card;
}

/* ─── ТАЙМЛАЙН ─── */
function buildTimelineCard(r) {
    const m = r.match;
    const objectives = Array.isArray(m.objectives) ? m.objectives : [];
    if (!objectives.length) return null;
    const dur = m.duration || 1;

    const card = UI.card("⏱ Таймлайн матча");
    const wrap = el("div", { style: "position:relative;height:80px;margin:22px 8px 26px;padding:0 4px;" });

    wrap.appendChild(el("div", {
        style: "position:absolute;left:0;right:0;top:50%;height:4px;background:linear-gradient(90deg,#22c55e 0%,#22c55e 50%,#ef4444 50%,#ef4444 100%);border-radius:2px;transform:translateY(-50%);opacity:0.5;"
    }));

    const minutes = Math.floor(dur / 60);
    for (let mm = 0; mm <= minutes; mm += 10) {
        const pct = (mm * 60 / dur) * 100;
        if (pct > 100) break;
        wrap.appendChild(el("div", {
            style: `position:absolute;left:${pct}%;top:calc(50% + 10px);transform:translateX(-50%);font-size:9px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;`
        }, mm + "'"));
    }

    for (const o of objectives) {
        if (!o || !o.time) continue;
        const pct = Math.min(100, (o.time / dur) * 100);
        let icon = "•";
        let color = "var(--yellow)";
        let label = "";
        if (o.type === "CHAT_MESSAGE_ROSHAN_KILL") { icon = "🐉"; color = "#a78bfa"; label = "Roshan убит"; }
        else if (o.type === "CHAT_MESSAGE_FIRSTBLOOD") { icon = "🩸"; color = "#ef4444"; label = "First Blood"; }
        else if (o.type === "building_kill") {
            icon = "🏰";
            color = (o.team === 2) ? "#22c55e" : "#ef4444";
            const unit = o.unit || "";
            if (unit.includes("tower1")) label = "Tower T1";
            else if (unit.includes("tower2")) label = "Tower T2";
            else if (unit.includes("tower3")) label = "Tower T3";
            else if (unit.includes("tower4")) label = "Tower T4";
            else if (unit.includes("fort")) label = "Barracks";
            else label = unit.replace("npc_dota_", "");
        }
        else if (o.type === "CHAT_MESSAGE_AEGIS") { icon = "🛡"; color = "#67e8f9"; label = "Aegis взят"; }
        else continue;

        const t = Math.floor(o.time / 60) + ":" + String(o.time % 60).padStart(2, "0");
        wrap.appendChild(el("div", {
            title: t + " — " + label,
            style: `position:absolute;left:${pct}%;top:50%;transform:translate(-50%,-50%);font-size:16px;cursor:help;filter:drop-shadow(0 0 6px ${color});z-index:2;`
        }, icon));
    }

    card.appendChild(wrap);
    const legend = el("div", { class: "row", style: "gap:16px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);" });
    legend.appendChild(el("div", {}, "🩸 First Blood"));
    legend.appendChild(el("div", {}, "🏰 Башни"));
    legend.appendChild(el("div", {}, "🐉 Roshan"));
    legend.appendChild(el("div", {}, "🛡 Aegis"));
    card.appendChild(legend);
    return card;
}

/* ─── СОСТАВ КОМАНД ─── */
function buildTeamCompositionCard(r) {
    const m = r.match;
    const heroesList = r.heroes || [];
    if (!Array.isArray(m.players) || m.players.length < 2) return null;

    const card = UI.card("👥 Состав команд");
    const radiant = m.players.filter(p => p.player_slot < 128);
    const dire = m.players.filter(p => p.player_slot >= 128);

    function renderTeam(list, label, color, isWin) {
        const row = el("div", { style: "margin-bottom:16px;" });
        row.appendChild(el("div", {
            style: `font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:8px;`
        }, label + " · " + (isWin ? "ПОБЕДА" : "ПОРАЖЕНИЕ")));

        const grid = el("div", { style: "display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:520px;" });
        for (const p of list) {
            const h = heroesList.find(x => x.id === p.hero_id);
            const isMe = p.hero_id === r.hero.id;
            grid.appendChild(heroTileEl(h, {
                borderColor: isMe ? "var(--accent)" : "transparent",
                kda: p.kills + "/" + p.deaths + "/" + p.assists,
            }));
        }
        row.appendChild(grid);
        return row;
    }

    card.appendChild(renderTeam(radiant, "Radiant", "#22c55e", !!m.radiant_win));
    card.appendChild(renderTeam(dire, "Dire", "#ef4444", !m.radiant_win));
    return card;
}

/* ─── СМЕРТИ ─── */
function buildDeathsCard(r) {
    const p = r.player;
    const deaths = p.deaths || 0;
    const card = UI.card("💀 Смерти");
    if (deaths === 0) {
        card.appendChild(el("div", { style: "font-size:14px;color:var(--green);font-weight:bold;" }, "Ни одной смерти — идеальная игра!"));
        return card;
    }
    const row = el("div", { style: "display:flex;flex-wrap:wrap;gap:4px;align-items:center;" });
    for (let i = 0; i < deaths; i++) row.appendChild(el("span", { style: "font-size:20px;" }, "💀"));
    card.appendChild(row);
    card.appendChild(el("div", {
        class: "dim",
        style: "font-size:11px;margin-top:10px;line-height:1.5;"
    }, "Позиции и тайминги смертей доступны только для полностью распарсенных матчей. " +
       "Открой матч на OpenDota и нажми «Request Parse» — после разбора появятся данные."));
    return card;
}

/* ─── ПЕРЦЕНТИЛИ ─── */
function buildPercentilesCard(r) {
    if (!r.bench || !Object.keys(r.bench).length) return null;
    const p = r.player;
    const items = [
        ["GPM", "gold_per_min", p.gold_per_min],
        ["XPM", "xp_per_min", p.xp_per_min],
        ["Ластхиты/мин", "last_hits_per_min", (p.last_hits || 0) / Math.max(r.durMin, 1)],
        ["Денаи/мин", "denies_per_min", (p.denies || 0) / Math.max(r.durMin, 1)],
        ["Урон/мин", "hero_damage_per_min", (p.hero_damage || 0) / Math.max(r.durMin, 1)],
        ["Хил/мин", "hero_healing_per_min", (p.hero_healing || 0) / Math.max(r.durMin, 1)],
    ];
    const valid = [];
    for (const [label, key, val] of items) {
        const pct = percentileOf(r.bench, key, val);
        if (pct !== null) valid.push([label, pct]);
    }
    if (!valid.length) return null;

    const card = UI.card("📈 Перцентили (против других игроков на этом герое)");
    for (const [label, pct] of valid) card.appendChild(pctBar(label, pct));
    return card;
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

/* ─── ГЛАВНЫЙ ОТЧЁТ ─── */
function buildReport(r) {
    const frag = document.createDocumentFragment();
    frag.appendChild(buildHeader(r));
    frag.appendChild(buildMatchInfoCard(r));

    const inv = buildInventoryCard(r);
    if (inv) frag.appendChild(inv);

    frag.appendChild(buildMetricsCard(r));

    const timeline = buildTimelineCard(r);
    if (timeline) frag.appendChild(timeline);

    const team = buildTeamCompositionCard(r);
    if (team) frag.appendChild(team);

    frag.appendChild(buildDeathsCard(r));

    const pct = buildPercentilesCard(r);
    if (pct) frag.appendChild(pct);

    const linkCard = el("div", { style: "text-align:center;padding:14px;" });
    linkCard.appendChild(el("a", {
        href: `https://www.opendota.com/matches/${r.match.match_id}`,
        target: "_blank",
        rel: "noopener noreferrer",
        style: "color:var(--cyan);font-size:12px;"
    }, "🔗 Открыть матч на OpenDota"));
    frag.appendChild(linkCard);

    return frag;
}
