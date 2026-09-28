/* DOTA JETCH — АНАЛИЗ МАТЧА v3.4.0 — 5/день на FREE */

var MODE_NAMES = { 1: "All Pick", 2: "Captains Mode", 3: "Random Draft", 4: "Single Draft", 5: "All Random", 22: "Ranked All Pick", 23: "Turbo" };
var POSITION_NAMES = { 1: "Pos 1 · Керри", 2: "Pos 2 · Мид", 3: "Pos 3 · Оффлейн", 4: "Pos 4 · Роум", 5: "Pos 5 · Саппорт" };

var ANALYZE_FREE_LIMIT = 5;

var lastAnalysis = null;

function analyzeTodayKey() {
var d = new Date();
return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function analyzeQuota() {
var today = analyzeTodayKey();
var q = Store.get("analyzequota", null);
if (!q || typeof q !== "object" || q.date !== today) {
q = { date: today, count: 0 };
Store.set("analyzequota", q);
}
return q;
}

function analyzeQuotaRemaining() {
var plus = Store.get("license.active", false) === true;
if (plus) return Infinity;
var q = analyzeQuota();
return Math.max(0, ANALYZE_FREE_LIMIT - q.count);
}

function analyzeQuotaInc() {
var q = analyzeQuota();
q.count++;
Store.set("analyzequota", q);
}

async function runAnalysis(matchId, heroName) {
var heroes = await getHeroes();
if (!heroes.length) throw new Error("Не удалось загрузить героев");
var hero = await findHeroId(heroName);
if (!hero) throw new Error("Герой «" + heroName + "» не найден");
var match = await apiGet("/matches/" + matchId);
if (!match || !match.players) throw new Error("Матч не найден");
if (match.duration === undefined) throw new Error("Матч не распарсен");
var player = match.players.find(function (p) { return p.hero_id === hero.id; });
if (!player) throw new Error(hero.name + " не играл в этом матче");
var bench = {};
try { bench = await apiGet("/benchmarks", { hero_id: hero.id }) || {}; } catch (e) {}
var isRadiant = player.player_slot < 128;
var won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
return { match: match, player: player, hero: hero, bench: bench, heroes: heroes, won: won, durMin: match.duration / 60 };
}

function renderAnalyze() {
var frag = document.createDocumentFragment();
var plus = Store.get("license.active", false) === true;
var left = analyzeQuotaRemaining();
var form = UI.card("Новый анализ");
var quotaText = el("div", { style: "font-size:12px;font-weight:600;margin-bottom:14px;color:" + (plus ? "var(--gold)" : (left > 0 ? "var(--text-muted)" : "var(--red)")) + ";" },
plus ? "JETCH+ · безлимит" : "FREE · осталось " + left + " / " + ANALYZE_FREE_LIMIT);
form.appendChild(quotaText);
var row = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
var idW = el("div");
idW.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;" }, "ID МАТЧА"));
var idInp = UI.input("8123456789");
idInp.id = "matchIdInput";
idInp.type = "number";
idW.appendChild(idInp);
var heroW = el("div");
heroW.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;" }, "ГЕРОЙ"));
var heroInp = UI.input("Juggernaut / пудж / ам");
heroInp.id = "heroInput";
heroW.appendChild(heroInp);
row.appendChild(idW);
row.appendChild(heroW);
form.appendChild(row);
var btnRow = el("div", { class: "row" });
var btn = UI.btn("Анализировать", { id: "analyzeBtn" });
if (!plus && left <= 0) { btn.disabled = true; btn.textContent = "Лимит исчерпан"; }
btn.addEventListener("click", onAnalyzeClick);
btnRow.appendChild(btn);
var hint = el("span", { class: "dim", style: "font-size:11px;" });
hint.id = "analyzeHint";
btnRow.appendChild(hint);
form.appendChild(btnRow);
if (!plus && left <= 0) {
var upsell = el("div", { style: "margin-top:12px;font-size:11px;color:var(--text-muted);" }, "Активируй JETCH+ в настройках — анализы станут безлимитными.");
form.appendChild(upsell);
}
frag.appendChild(form);
var report = el("div", { id: "analyzeReport" });
frag.appendChild(report);
return frag;
}

async function onAnalyzeClick() {
var plus = Store.get("license.active", false) === true;
if (!plus && analyzeQuotaRemaining() <= 0) return;
var idInp = qs("#matchIdInput"), heroInp = qs("#heroInput");
var hint = qs("#analyzeHint"), btn = qs("#analyzeBtn"), report = qs("#analyzeReport");
var mid = (idInp.value || "").trim();
var hero = (heroInp.value || "").trim();
if (!mid || !hero) { hint.textContent = "Заполни оба поля"; hint.style.color = "var(--red)"; return; }
if (!/^\d+$/.test(mid)) { hint.textContent = "ID должен быть числом"; hint.style.color = "var(--red)"; return; }
btn.disabled = true;
btn.textContent = "Загрузка...";
hint.textContent = "Загружаю...";
report.innerHTML = "";
var loadCard = UI.card("");
loadCard.appendChild(el("div", { style: "text-align:center;padding:30px;" }, "Загружаю..."));
report.appendChild(loadCard);
try {
var result = await runAnalysis(parseInt(mid, 10), hero);
if (!plus) analyzeQuotaInc();
report.innerHTML = "";
report.appendChild(buildReport(result));
lastAnalysis = result;
if (typeof History !== "undefined") History.add(result);
if (typeof Achievements !== "undefined") Achievements.onAnalyze(result);
if (typeof Daily !== "undefined") Daily.bump("analyze");
hint.textContent = "Готово!";
hint.style.color = "var(--green)";
if (!plus && analyzeQuotaRemaining() <= 0) setTimeout(function () { switchPage("analyze"); }, 1500);
} catch (e) {
report.innerHTML = "";
var errCard = UI.card("");
errCard.appendChild(el("div", { style: "color:var(--red);font-size:13px;" }, "❌ " + (e.message || e)));
report.appendChild(errCard);
hint.textContent = e.message || "Ошибка";
hint.style.color = "var(--red)";
} finally {
btn.disabled = false;
btn.textContent = "Анализировать";
}
}

function buildReport(r) {
var frag = document.createDocumentFragment();
var p = r.player, m = r.match;
var head = UI.card("");
head.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.35),var(--bg-card));border-color:var(--accent);";
var headInner = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });
headInner.appendChild(heroImgEl(r.hero, 96));
var info = el("div", { style: "flex:1;min-width:200px;" });
info.appendChild(el("div", { style: "font-size:26px;font-weight:bold;" }, r.hero.name));
var badges = el("div", { class: "row", style: "margin-top:8px;flex-wrap:wrap;" });
badges.appendChild(UI.badge(MODE_NAMES[m.game_mode] || "—", "var(--text-muted)", "var(--bg-elev)"));
badges.appendChild(UI.badge(r.durMin.toFixed(1) + " мин", "var(--text-muted)", "var(--bg-elev)"));
info.appendChild(badges);
var kda = el("div", { style: "margin-top:14px;font-size:26px;font-weight:bold;" }, p.kills + " / " + p.deaths + " / " + p.assists);
info.appendChild(kda);
headInner.appendChild(info);
var wl = el("div", { style: "text-align:right;" });
var wlBadge = r.won ? UI.badge("ПОБЕДА", "var(--green)", "var(--green-bg)") : UI.badge("ПОРАЖЕНИЕ", "var(--red)", "var(--red-bg)");
wl.appendChild(wlBadge);
headInner.appendChild(wl);
head.appendChild(headInner);
frag.appendChild(head);

var metrics = UI.card("Статистика");
var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
var metricList = [
{ label: "GPM", value: Math.round(p.gold_per_min || 0) },
{ label: "XPM", value: Math.round(p.xp_per_min || 0) },
{ label: "Ластхиты", value: p.last_hits || 0 },
{ label: "Денаи", value: p.denies || 0 },
{ label: "Урон героям", value: Math.round(p.hero_damage || 0).toLocaleString() },
{ label: "Урон строениям", value: Math.round(p.tower_damage || 0).toLocaleString() },
{ label: "Хил", value: Math.round(p.hero_healing || 0).toLocaleString() },
{ label: "Нетфорс", value: Math.round(p.net_worth || 0).toLocaleString() },
{ label: "Смертей/мин", value: (p.deaths / Math.max(r.durMin, 1)).toFixed(2) },
{ label: "Длительность", value: r.durMin.toFixed(0) + " мин" }
];
for (var i = 0; i < metricList.length; i++) {
var tile = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:12px;" });
tile.appendChild(el("div", { class: "muted", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;" }, metricList[i].label));
tile.appendChild(el("div", { style: "font-size:18px;font-weight:bold;margin-top:6px;" }, String(metricList[i].value)));
grid.appendChild(tile);
}
metrics.appendChild(grid);
frag.appendChild(metrics);

var link = el("div", { style: "text-align:center;padding:14px;" });
link.appendChild(el("a", { href: "https://www.opendota.com/matches/" + m.match_id, target: "_blank", style: "color:var(--cyan);font-size:12px;" }, "Открыть на OpenDota"));
frag.appendChild(link);
return frag;
}