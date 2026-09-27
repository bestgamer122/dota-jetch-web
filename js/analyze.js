/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — АНАЛИЗ МАТЧА (v2, расширенный)
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

/* ─── Retry обёртка ─── */
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
    try {
        bench = await fetchWithRetry("/benchmarks", { hero_id: hero.id }) || {};
    } catch (e) {
        console.warn("benchmarks недоступны, перцентили пропущены", e);
    }

    let items = {};
    try {
        items = await getItemCatalog();
    } catch (e) {
        console.warn("items catalog недоступен", e);
    }

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

/* ─── HERO IMG с fallback ─── */
function heroImgEl(hero, size, extraStyle) {
    const wrap = el("div", {
        style: `width:${size}px;height:${size}px;border-radius:12px;border:2px solid var(--accent);flex-shrink:0;overflow:hidden;background:linear-gradient(135deg,var(--accent-dark),var(--bg-elev));display:flex;align-items:center;justify-content:center;${extraStyle || ""}`
    });
    if (hero && hero.img) {
        const img = el("img", {
            src: hero.img,
            alt: hero.name || "",
            loading: "lazy",
            style: "width:100%;height:100%;object-fit:cover;display:block;",
            onerror: function(e) {
                e.target.style.display = "none";
                if (e.target.parentNode && !e.target.parentNode.querySelector(".fallback-letter")) {
                    const fb = el("div", {
                        class: "fallback-letter",
                        style: "font-size:" + Math.round(size * 0.4) + "px;font-weight:800;color:rgba(255,255,255,0.6);font-family:'JetBrains Mono',monospace;"
                    }, (hero.name || "?").slice(0, 2).toUpperCase());
                    e.target.parentNode.appendChild(fb);
                }
            }
        });
        wrap.appendChild(img);
    }
    return wrap;
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

/* ─── ИНВЕНТАРЬ ─── */
function buildInventoryCard(r) {
    const p = r.player;
    const items = r.items || {};
    const slots = [];
    for (let i = 0; i < 6; i++) {
        const id = p["item_" + i] || 0;
        slots.push(id);
    }
    // есть ли хоть один предмет?
    const hasAny = slots.some(id => id > 0);
    if (!hasAny) return null;

    const card = UI.card("🎒 Финальный инвентарь");
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:520px;" });

    for (const id of slots) {
        const slot = el("div", {
            style: "aspect-ratio:1/1;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;",
            title: id > 0 && items[id] ? items[id].name : ""
        });
        if (id > 0 && items[id] && items[id].img) {
            const img = el("img", {
                src: items[id].img,
                alt: items[id].name,
                loading: "lazy",
                style: "width:100%;height:100%;object-fit:contain;padding:4px;",
                onerror: function(e) { e.target.style.opacity = 0.2; }
            });
            slot.appendChild(img);
        } else if (id > 0) {
            slot.appendChild(el("div", { style: "font-size:9px;color:var(--text-dim);text-align:center;padding:4px;" }, "#" + id));
        }
        grid.appendChild(slot);
    }
    card.appendChild(grid);

    const aghs = [];
    if (p.aghanims_scepter) aghs.push("Aghanim's Scepter");
    if (p.aghanims_shard) aghs.push("Aghanim's Shard");
    if (aghs.length) {
        const row = el("div", { class: "row", style: "margin-top:10px;flex-wrap:wrap;" });
        for (const a of aghs) {
            row.appendChild(UI.badge(a, "var(--gold)", "var(--gold-bg)"));
        }
        card.appendChild(row);
    }

    // Нейтральный предмет
    if (p.item_neutral) {
        const neutral = el("div", { style: "margin-top:10px;display:flex;align-items:center;gap:10px;" });
        neutral.appendChild(el("div", { class: "dim", style: "font-size:11px;letter-spacing:1px;text-transform:uppercase;" }, "НЕЙТРАЛЬНЫЙ"));
        if (items[p.item_neutral] && items[p.item_neutral].img) {
            const box = el("div", { style: "width:40px;height:40px;border-radius:8px;background:var(--bg-elev);border:1px solid var(--border);overflow:hidden;" });
            box.appendChild(el("img", { src: items[p.item_neutral].img, style: "width:100%;height:100%;object-fit:contain;padding:3px;", onerror: function(e) { e.target.style.opacity = 0.2; } }));
            neutral.appendChild(box);
        }
        card.appendChild(neutral);
    }

    return card;
}

/* ─── СТАТИСТИКА (метрики) ─── */
function buildMetricsCard(r) {
    const card = UI.card("📊 Статистика");
    const metrics = buildMetrics(r);
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
    for (const mtr of metrics) grid.appendChild(metricTile(mtr));
    card.appendChild(grid);
    return card;
}

function buildMetrics(r) {
    const p = r.player; const dur = Math.max(r.durMin, 1);
    return [
        { icon: "💰", color: "var(--gold)", label: "GPM", value: Math.round(p.gold_per_min || 0) },
        { icon: "⚡", color: "var(--cyan)", label: "XPM", value: Math.round(p.xp_per_min || 0) },
        { icon: "🎯", color: "var(--green)", label: "Ластхиты", value: p.last_hits || 0 },
        { icon: "🌾", color: "var(--accent-light)", label: "Денаи", value: p.denies || 0 },
        { icon: "⚔️", color: "var(--red)", label: "Урон героям", value: Math.round(p.hero_damage || 0).toLocaleString() },
        { icon: "🏰", color: "var(--orange)", label: "Урон строениям", value: Math.round(p.tower_damage || 0).toLocaleString() },
        { icon: "❤️", color: "var(--green)", label: "Хил", value: Math.round(p.hero_healing || 0).toLocaleString() },
        { icon: "💎", color: "var(--yellow)", label: "Нетфорс", value: Math.round(p.net_worth || 0).toLocaleString() },
        { icon: "💀", color: "var(--red)", label: "Смертей/мин", value: (p.deaths / dur).toFixed(2) },
        { icon: "🎬", color: "var(--accent-light)", label: "Длительность", value: dur.toFixed(0) + " мин" },
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

/* ─── ТАЙМЛАЙН МАТЧА (objective events) ─── */
function buildTimelineCard(r) {
    const m = r.match;
    const objectives = Array.isArray(m.objectives) ? m.objectives : [];
    if (!objectives.length) return null;

    const card = UI.card("⏱ Таймлайн матча");
    const dur = m.duration || 1;

    const wrap = el("div", { style: "position:relative;height:70px;margin:22px 8px 26px;padding:0 4px;" });

    // Базовая дорожка (зелёная для Radiant / красная для Dire)
    wrap.appendChild(el("div", {
        style: "position:absolute;left:0;right:0;top:50%;height:4px;background:linear-gradient(90deg,#22c55e 0%,#22c55e 50%,#ef4444 50%,#ef4444 100%);border-radius:2px;transform:translateY(-50%);opacity:0.5;"
    }));

    // Отметки каждые 10 минут
    const minutes = Math.floor(dur / 60);
    for (let mm = 0; mm <= minutes; mm += 10) {
        const pct = (mm * 60 / dur) * 100;
        if (pct > 100) break;
        wrap.appendChild(el("div", {
            style: `position:absolute;left:${pct}%;top:calc(50% + 10px);transform:translateX(-50%);font-size:9px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;`
        }, mm + "'"));
    }

    // Ивенты
    for (const o of objectives) {
        if (!o || !o.time) continue;
        const pct = Math.min(100, (o.time / dur) * 100);
        let icon = "•";
        let color = "var(--yellow)";
        let label = "";

        if (o.type === "CHAT_MESSAGE_ROSHAN_KILL") {
            icon = "🐉"; color = "#a78bfa"; label = "Roshan убит";
        } else if (o.type === "CHAT_MESSAGE_FIRSTBLOOD") {
            icon = "🩸"; color = "#ef4444"; label = "First Blood";
        } else if (o.type === "building_kill") {
            icon = "🏰";
            color = (o.team === 2) ? "#22c55e" : "#ef4444";
            const unit = o.unit || "";
            if (unit.includes("tower1")) label = "Tower T1";
            else if (unit.includes("tower2")) label = "Tower T2";
            else if (unit.includes("tower3")) label = "Tower T3";
            else if (unit.includes("tower4")) label = "Tower T4";
            else if (unit.includes("fort")) label = "Barracks";
            else if (unit.includes("roshan")) label = "Roshan";
            else label = unit.replace("npc_dota_", "");
        } else if (o.type === "CHAT_MESSAGE_AEGIS") {
            icon = "🛡"; color = "#67e8f9"; label = "Aegis взят";
        } else {
            continue;
        }

        const marker = el("div", {
            title: `${Math.floor(o.time / 60)}:${String(o.time % 60).padStart(2, "0")} — ${label}`,
            style: `position:absolute;left:${pct}%;top:50%;transform:translate(-50%,-50%);font-size:14px;cursor:help;filter:drop-shadow(0 0 6px ${color});z-index:2;`
        }, icon);
        wrap.appendChild(marker);
    }

    card.appendChild(wrap);

    // Легенда
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

    function renderTeam(list, label, color) {
        const row = el("div", { style: "margin-bottom:14px;" });
        const label_el = el("div", {
            style: `font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:8px;`
        }, label + (m.radiant_win === (label === "Radiant") ? " · ПОБЕДА" : " · ПОРАЖЕНИЕ"));
        row.appendChild(label_el);

        const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:6px;" });
        for (const p of list) {
            const h = heroesList.find(x => x.id === p.hero_id);
            const isMe = p.hero_id === r.hero.id;
            const tile = el("div", {
                style: `position:relative;aspect-ratio:1/1;border-radius:10px;overflow:hidden;border:2px solid ${isMe ? "var(--accent)" : "transparent"};background:var(--bg-elev);`,
                title: h ? h.name : "?"
            });
            if (h && h.img) {
                tile.appendChild(el("img", {
                    src: h.img, alt: h.name, loading: "lazy",
                    style: "width:100%;height:100%;object-fit:cover;",
                    onerror: function(e) { e.target.style.opacity = 0.3; }
                }));
            }
            // KDA снизу
            const kdaEl = el("div", {
                style: "position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(0,0,0,0.85),transparent);padding:3px 4px;font-size:9px;font-weight:700;color:#fff;text-align:center;font-family:'JetBrains Mono',monospace;"
            }, p.kills + "/" + p.deaths + "/" + p.assists);
            tile.appendChild(kdaEl);
            grid.appendChild(tile);
        }
        row.appendChild(grid);
        return row;
    }

    card.appendChild(renderTeam(radiant, "Radiant", "#22c55e"));
    card.appendChild(renderTeam(dire, "Dire", "#ef4444"));
    return card;
}

/* ─── СВОДКА СМЕРТЕЙ ─── */
function buildDeathsCard(r) {
    const p = r.player;
    const deaths = p.deaths || 0;
    if (deaths === 0) {
        const card = UI.card("💀 Смерти");
        card.appendChild(el("div", { style: "font-size:14px;color:var(--green);font-weight:bold;" }, "Ни одной смерти — идеальная игра!"));
        return card;
    }

    const card = UI.card("💀 Смерти");
    const row = el("div", { style: "display:flex;flex-wrap:wrap;gap:6px;align-items:center;" });
    for (let i = 0; i < deaths; i++) {
        row.appendChild(el("span", { style: "font-size:20px;" }, "💀"));
    }
    card.appendChild(row);
    card.appendChild(el("div", {
        class: "dim",
        style: "font-size:11px;margin-top:10px;line-height:1.5;"
    }, "Позиции смертей и тайминги доступны только для полностью распарсенных матчей. ID матча: " + r.match.match_id));
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

    // Проверяем есть ли хоть одна валидная перцентиль
    const valid = [];
    for (const [label, key, val] of items) {
        const pct = percentileOf(r.bench, key, val);
        if (pct !== null) valid.push([label, pct]);
    }
    if (!valid.length) return null;

    const card = UI.card("📈 Перцентили (против других игроков на этом герое)");
    for (const [label, pct] of valid) {
        card.appendChild(pctBar(label, pct));
    }
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

/* ─── ГЛАВНЫЙ РЕНДЕР ОТЧЁТА ─── */
function buildReport(r) {
    const frag = document.createDocumentFragment();

    frag.appendChild(buildHeader(r));

    const inv = buildInventoryCard(r);
    if (inv) frag.appendChild(inv);

    frag.appendChild(buildMetricsCard(r));

    const timeline = buildTimelineCard(r);
    if (timeline) frag.appendChild(timeline);

    const team = buildTeamCompositionCard(r);
    if (team) frag.appendChild(team);

    const deaths = buildDeathsCard(r);
    if (deaths) frag.appendChild(deaths);

    const pct = buildPercentilesCard(r);
    if (pct) frag.appendChild(pct);

    // Ссылка на OpenDota
    const linkCard = el("div", { style: "text-align:center;padding:14px;" });
    const link = el("a", {
        href: `https://www.opendota.com/matches/${r.match.match_id}`,
        target: "_blank",
        rel: "noopener noreferrer",
        style: "color:var(--cyan);font-size:12px;"
    }, "🔗 Открыть матч на OpenDota");
    linkCard.appendChild(link);
    frag.appendChild(linkCard);

    return frag;
}
