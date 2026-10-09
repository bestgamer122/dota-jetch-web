/* DOTA JETCH — ANALYZE v3.5
   Кнопка "Обсудить с ИИ" вместо встроенного AI-блока */

var MODE_NAMES = {
  1: "All Pick", 2: "Captains Mode", 3: "Random Draft", 4: "Single Draft",
  5: "All Random", 11: "Mid Only", 12: "Least Played", 13: "Limited Heroes",
  16: "Captains Draft", 18: "Ability Draft", 20: "All Random Death Match",
  21: "1v1 Mid", 22: "Ranked All Pick", 23: "Turbo", 24: "Mutation"
};

var POS_NAMES = { 1:"Pos 1 Керри", 2:"Pos 2 Мид", 3:"Pos 3 Оффлейн", 4:"Pos 4 Роум", 5:"Pos 5 Саппорт" };
var ANALYZE_FREE_LIMIT = 5;
var lastAnalysis = null;

function analyzeTodayKey() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
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
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  if (plus) return Infinity;
  var q = analyzeQuota();
  return Math.max(0, ANALYZE_FREE_LIMIT - q.count);
}

function analyzeQuotaInc() {
  var q = analyzeQuota();
  q.count++;
  Store.set("analyzequota", q);
  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
}

async function fetchRetry(path, params, retries) {
  retries = retries === undefined ? 2 : retries;
  for (var i = 0; i <= retries; i++) {
    try { return await apiGet(path, params); }
    catch (e) { if (i === retries) throw e; await new Promise(function(r){ setTimeout(r, 800*(i+1)); }); }
  }
}

function detectPos(player) {
  var l = player.lane_role;
  if (l === 2) return 2;
  if (l === 1) return 1;
  if (l === 3) return 3;
  return null;
}

async function runAnalysis(mid, heroName) {
  var heroes = await getHeroes();
  if (!heroes || !heroes.length) throw new Error("Не удалось загрузить список героев");
  var hero = await findHeroId(heroName);
  if (!hero) throw new Error("Герой не найден: " + heroName);
  var match = await fetchRetry("/matches/" + mid);
  if (!match || !match.players) throw new Error("Матч не найден");
  if (match.duration === undefined) throw new Error("Матч не распарсен");
  var player = match.players.find(function(p){ return p.hero_id === hero.id; });
  if (!player) throw new Error(hero.name + " не играл в матче");
  var bench = {};
  try { bench = await fetchRetry("/benchmarks", { hero_id: hero.id }) || {}; } catch(e){}
  var items = {};
  try { items = await getItemCatalog(); } catch(e){}
  var isRadiant = player.player_slot < 128;
  var won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
  var durMin = (match.duration || 0) / 60;
  var perf = calcPerformance(player, durMin, won);
  return {
    match: match, player: player, hero: hero, bench: bench, items: items,
    heroes: heroes, won: won, durMin: durMin, position: detectPos(player),
    performance: perf, rankTier: match.rank_tier || 0
  };
}

function calcPerformance(p, durMin, won) {
  var score = 50; var reasons = [];
  var kills = p.kills || 0;
  var deaths = p.deaths || 0;
  var assists = p.assists || 0;
  var kda = (kills + assists) / Math.max(deaths, 1);
  if (kda >= 5) { score += 15; reasons.push("Отличный KDA " + kda.toFixed(2)); }
  else if (kda >= 3) { score += 8; reasons.push("Хороший KDA " + kda.toFixed(2)); }
  else if (kda < 1.5) { score -= 10; reasons.push("Низкий KDA " + kda.toFixed(2)); }
  var gpm = p.gold_per_min || 0;
  if (gpm >= 600) { score += 10; reasons.push("Высокий GPM " + Math.round(gpm)); }
  else if (gpm < 250) { score -= 8; reasons.push("Низкий GPM " + Math.round(gpm)); }
  var lhPerMin = (p.last_hits || 0) / Math.max(durMin, 1);
  if (lhPerMin >= 8) { score += 8; reasons.push("Отличный фарм"); }
  else if (lhPerMin < 2 && p.lane_role !== 4 && p.lane_role !== 5) { score -= 8; reasons.push("Слабый фарм"); }
  var hdPerMin = (p.hero_damage || 0) / Math.max(durMin, 1);
  if (hdPerMin >= 800) { score += 8; reasons.push("Высокий урон"); }
  else if (hdPerMin < 300) { score -= 6; reasons.push("Низкий урон"); }
  var dpm = deaths / Math.max(durMin, 1);
  if (dpm > 0.3) { score -= 10; reasons.push("Много смертей"); }
  else if (dpm < 0.1) { score += 5; reasons.push("Мало смертей"); }
  if (won) score += 5; else score -= 5;
  score = Math.max(0, Math.min(100, score));
  var grade = "D";
  if (score >= 90) grade = "S";
  else if (score >= 75) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";
  return { score: score, grade: grade, reasons: reasons };
}

function analyzeDeaths(p, durMin) {
  var d = p.deaths || 0;
  if (d === 0) return { count: 0, advice: "Ни одной смерти — идеальная игра!" };
  var dpm = d / Math.max(durMin, 1);
  var advice;
  if (dpm > 0.3) advice = "Слишком много смертей. Играй безопаснее.";
  else if (dpm > 0.15) advice = "Умеренно. Обрати внимание на позиционирование.";
  else advice = "Хорошая выживаемость!";
  return { count: d, advice: advice };
}

function getItemRecs(p, hero, match, allHeroes) {
  var recs = []; var role = detectPos(p);
  var enemyNames = []; var isRadiant = p.player_slot < 128;
  for (var i = 0; i < match.players.length; i++) {
    var ep = match.players[i]; var eR = ep.player_slot < 128;
    if (isRadiant === eR) continue;
    for (var j = 0; j < allHeroes.length; j++) {
      if (allHeroes[j].id === ep.hero_id) { enemyNames.push(allHeroes[j].name); break; }
    }
  }
  function has(n){ return enemyNames.indexOf(n) >= 0; }
  if (has("Anti-Mage") || has("Storm Spirit") || has("Medusa")) recs.push({ item: "Scythe of Vyse", reason: "Хекс против мобильных" });
  if (has("Phantom Assassin") || has("Juggernaut")) recs.push({ item: "Blade Mail", reason: "Отражает бурст" });
  if (has("Tinker") || has("Zeus") || has("Storm Spirit")) recs.push({ item: "Black King Bar", reason: "Иммунитет против магии" });
  if (has("Bristleback") || has("Phantom Assassin")) recs.push({ item: "Silver Edge", reason: "Break отключает пассивки" });
  if (has("Medusa") || has("Anti-Mage")) recs.push({ item: "Diffusal Blade", reason: "Сжигает ману" });
  if (role === 1) { recs.push({ item: "Black King Bar", reason: "Обязателен к 20 мин" }); recs.push({ item: "Satanic", reason: "Выживание в лейте" }); }
  else if (role === 2) { recs.push({ item: "Aghanim's Scepter", reason: "Улучшение ульты" }); recs.push({ item: "Black King Bar", reason: "Для агрессии" }); }
  else if (role === 3) { recs.push({ item: "Blink Dagger", reason: "Инициация" }); recs.push({ item: "Pipe of Insight", reason: "Командный магрезист" }); }
  else if (role === 4 || role === 5) { recs.push({ item: "Glimmer Cape", reason: "Спасение союзников" }); recs.push({ item: "Force Staff", reason: "Позиционный сейв" }); }
  var seen = {}; var out = [];
  for (var k = 0; k < recs.length; k++) { if (!seen[recs[k].item]) { seen[recs[k].item] = 1; out.push(recs[k]); } }
  return out.slice(0, 6);
}

/* Кнопка "Обсудить с ИИ" */
function buildChatButton(res) {
  if (!res || !res.match || !res.hero) return null;
  var card = el("div", { class: "card" });
  card.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.15),var(--bg-card));border-color:var(--accent);text-align:center;";
  card.appendChild(el("div", { style: "font-size:32px;margin-bottom:8px;" }, "💬"));
  card.appendChild(el("div", { style: "font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;" }, "Обсудить с ИИ"));
  card.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.5;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto;" },
    "Спроси почему проиграл, кто руинер, что надо было собрать — ИИ ответит с учётом ЭТОГО матча."));
  var btn = UI.btn("Открыть чат с ИИ");
  btn.style.cssText = "width:100%;padding:14px;font-size:14px;font-weight:800;";
  btn.addEventListener("click", function () {
    Store.set("chatselectedmatch", { matchId: res.match.match_id, heroName: res.hero.name });
    switchPage("chat");
  });
  card.appendChild(btn);
  return card;
}

function renderAnalyze() {
  var frag = document.createDocumentFragment();
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);

  if (lastAnalysis && lastAnalysis.match) {
    var resetBtn = UI.btn("🔄 Новый анализ", { variant: "ghost" });
    resetBtn.style.marginBottom = "14px";
    resetBtn.addEventListener("click", function () { lastAnalysis = null; switchPage("analyze"); });
    frag.appendChild(resetBtn);
    var report = el("div", { id: "analyzeReport" });
    report.appendChild(buildReport(lastAnalysis));
    var chatBtn = buildChatButton(lastAnalysis);
    if (chatBtn) report.appendChild(chatBtn);
    frag.appendChild(report);
    return frag;
  }

  var left = analyzeQuotaRemaining();
  var form = UI.card("Новый анализ");
  var qt = el("div", { style: "font-size:12px;font-weight:600;margin-bottom:14px;color:" + (plus ? "var(--gold)" : (left > 0 ? "var(--text-muted)" : "var(--red)")) + ";" },
    plus ? "JETCH+ безлимит" : "FREE осталось " + left + " / " + ANALYZE_FREE_LIMIT);
  form.appendChild(qt);

  var row = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
  var idW = el("div");
  idW.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;" }, "ID МАТЧА"));
  var idInp = UI.input("8123456789"); idInp.id = "matchIdInput"; idInp.type = "number";
  idW.appendChild(idInp);
  var hW = el("div");
  hW.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;" }, "ГЕРОЙ"));
  var hInp = UI.input("Juggernaut / пудж / ам"); hInp.id = "heroInput";
  hW.appendChild(hInp);
  row.appendChild(idW); row.appendChild(hW); form.appendChild(row);

  var btnRow = el("div", { class: "row" });
  var btn = UI.btn("Анализировать", { id: "analyzeBtn" });
  if (!plus && left <= 0) { btn.disabled = true; btn.textContent = "Лимит исчерпан"; }
  btn.addEventListener("click", onAnalyzeClick);
  btnRow.appendChild(btn);
  var hint = el("span", { class: "dim", style: "font-size:11px;" });
  hint.id = "analyzeHint"; btnRow.appendChild(hint);
  form.appendChild(btnRow);
  frag.appendChild(form);

  var report2 = el("div", { id: "analyzeReport" });
  frag.appendChild(report2);
  return frag;
}

async function onAnalyzeClick() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  if (!plus && analyzeQuotaRemaining() <= 0) {
    var h = qs("#analyzeHint");
    if (h) { h.textContent = "Лимит исчерпан. Активируй JETCH+ в настройках."; h.style.color = "var(--red)"; }
    return;
  }
  var idInp = qs("#matchIdInput"), hInp = qs("#heroInput");
  var hint = qs("#analyzeHint"), btn = qs("#analyzeBtn"), report = qs("#analyzeReport");
  var mid = (idInp.value || "").trim();
  var hero = (hInp.value || "").trim();
  if (!mid || !hero) { hint.textContent = "Заполни оба поля"; hint.style.color = "var(--red)"; return; }
  if (!/^\d+$/.test(mid)) { hint.textContent = "ID должен быть числом"; hint.style.color = "var(--red)"; return; }
  btn.disabled = true; btn.textContent = "Загрузка...";
  hint.textContent = "Загружаю..."; hint.style.color = "var(--accent-light)";
  report.innerHTML = "";
  var lc = UI.card("");
  lc.appendChild(el("div", { style: "text-align:center;padding:30px;" }, "Загружаю матч..."));
  report.appendChild(lc);
  try {
    var res = await runAnalysis(parseInt(mid, 10), hero);
    if (!plus) analyzeQuotaInc();
    report.innerHTML = "";
    report.appendChild(buildReport(res));
    var chatBtn = buildChatButton(res);
    if (chatBtn) report.appendChild(chatBtn);
    lastAnalysis = res;
    if (typeof History !== "undefined") History.add(res);
    if (typeof Achievements !== "undefined") Achievements.onAnalyze(res);
    if (typeof Daily !== "undefined") Daily.bump("analyze");
    hint.textContent = "Готово!"; hint.style.color = "var(--green)";
    if (typeof updateSidebarPlan === "function") updateSidebarPlan();
  } catch (e) {
    report.innerHTML = "";
    var ec = UI.card("");
    ec.appendChild(el("div", { style: "color:var(--red);font-size:13px;" }, "Ошибка: " + (e.message || e)));
    report.appendChild(ec);
    hint.textContent = e.message || "Ошибка"; hint.style.color = "var(--red)";
  } finally {
    btn.disabled = false; btn.textContent = "Анализировать";
  }
}

function buildReport(r) {
  var frag = document.createDocumentFragment();
  var p = r.player, m = r.match;
  var head = UI.card("");
  head.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.35),var(--bg-card));border-color:var(--accent);";
  var hInner = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });
  hInner.appendChild(heroImgEl(r.hero, 96));
  var info = el("div", { style: "flex:1;min-width:200px;" });
  info.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" }, r.hero.name));
  var badges = el("div", { class: "row", style: "margin-top:8px;flex-wrap:wrap;" });
  if (r.position) badges.appendChild(UI.badge(POS_NAMES[r.position], "var(--accent-light)", "var(--accent-bg)"));
  badges.appendChild(UI.badge(MODE_NAMES[m.game_mode] || "-", "var(--text-muted)", "var(--bg-elev)"));
  badges.appendChild(UI.badge(r.durMin.toFixed(1) + " мин", "var(--text-muted)", "var(--bg-elev)"));
  if (r.performance) badges.appendChild(UI.badge("Оценка " + r.performance.grade, "var(--gold)", "var(--gold-bg)"));
  info.appendChild(badges);
  var kda = el("div", { style: "margin-top:14px;display:flex;align-items:baseline;gap:12px;" });
  kda.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" }, (p.kills||0) + " / " + (p.deaths||0) + " / " + (p.assists||0)));
  kda.appendChild(el("div", { class: "muted", style: "font-size:12px;" }, "KDA " + (((p.kills||0) + (p.assists||0)) / Math.max(p.deaths||0, 1)).toFixed(2)));
  info.appendChild(kda);
  hInner.appendChild(info);
  var wl = el("div", { style: "text-align:right;" });
  var wb = r.won ? UI.badge("ПОБЕДА", "var(--green)", "var(--green-bg)") : UI.badge("ПОРАЖЕНИЕ", "var(--red)", "var(--red-bg)");
  wl.appendChild(wb); hInner.appendChild(wl);
  head.appendChild(hInner);
  frag.appendChild(head);

  if (r.performance) {
    var pc = UI.card("Оценка производительности");
    var pr = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });
    var gc = el("div", { style: "width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;font-family:monospace;border:3px solid;" });
    var gColor = r.performance.grade === "S" ? "var(--gold)" : r.performance.grade === "A" ? "var(--green)" : r.performance.grade === "B" ? "var(--cyan)" : r.performance.grade === "C" ? "var(--orange)" : "var(--red)";
    gc.style.color = gColor; gc.style.borderColor = gColor;
    gc.textContent = r.performance.grade;
    pr.appendChild(gc);
    var pi = el("div", { style: "flex:1;min-width:200px;" });
    pi.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);" }, r.performance.score + " / 100"));
    var rl = el("div", { style: "margin-top:8px;font-size:12px;line-height:1.6;color:var(--text-muted);" });
    for (var i = 0; i < r.performance.reasons.length; i++) rl.appendChild(el("div", {}, "• " + r.performance.reasons[i]));
    pi.appendChild(rl); pr.appendChild(pi);
    pc.appendChild(pr); frag.appendChild(pc);
  }

  var da = analyzeDeaths(r.player, r.durMin);
  var dc = UI.card("Анализ смертей");
  dc.appendChild(el("div", { style: "font-size:14px;font-weight:600;margin-bottom:8px;" }, "Смертей: " + da.count));
  dc.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" }, da.advice));
  frag.appendChild(dc);

  var recs = getItemRecs(r.player, r.hero, r.match, r.heroes);
  if (recs.length) {
    var rc = UI.card("Рекомендации по предметам");
    for (var j = 0; j < recs.length; j++) {
      var rr = el("div", { style: "display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);" });
      rr.appendChild(el("div", { style: "color:var(--cyan);font-size:16px;" }, "+"));
      var ri = el("div", { style: "flex:1;" });
      ri.appendChild(el("div", { style: "font-size:13px;font-weight:600;color:var(--text);" }, recs[j].item));
      ri.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:2px;" }, recs[j].reason));
      rr.appendChild(ri); rc.appendChild(rr);
    }
    frag.appendChild(rc);
  }

  var inv = buildInventoryCard(r);
  if (inv) frag.appendChild(inv);
  frag.appendChild(buildMetrics(r));

  var lc2 = el("div", { style: "text-align:center;padding:14px;" });
  lc2.appendChild(el("a", { href: "https://www.opendota.com/matches/" + m.match_id, target: "_blank", rel: "noopener", style: "color:var(--cyan);font-size:12px;" }, "Открыть на OpenDota"));
  frag.appendChild(lc2);
  return frag;
}

function buildInventoryCard(r) {
  var p = r.player; var items = r.items || {};
  var slots = [];
  for (var i = 0; i < 6; i++) slots.push(p["item_" + i] || 0);
  var hasAny = false;
  for (var j = 0; j < slots.length; j++) if (slots[j] > 0) hasAny = true;
  if (!hasAny) return null;
  var card = UI.card("Финальный инвентарь");
  var grid = el("div", { style: "display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:420px;" });
  for (var k = 0; k < slots.length; k++) {
    var id = slots[k];
    var item = id > 0 ? (items[id] || null) : null;
    grid.appendChild(itemImgEl(item));
  }
  card.appendChild(grid);
  return card;
}

function buildMetrics(r) {
  var card = UI.card("Статистика");
  var p = r.player;
  var ms = [
    { label: "GPM", value: Math.round(p.gold_per_min || 0) },
    { label: "XPM", value: Math.round(p.xp_per_min || 0) },
    { label: "Ластхиты", value: p.last_hits || 0 },
    { label: "Денаи", value: p.denies || 0 },
    { label: "Урон героям", value: Math.round(p.hero_damage || 0) },
    { label: "Урон строениям", value: Math.round(p.tower_damage || 0) },
    { label: "Хил", value: Math.round(p.hero_healing || 0) },
    { label: "Нетфорс", value: Math.round(p.net_worth || 0) },
    { label: "Смертей/мин", value: ((p.deaths || 0) / Math.max(r.durMin, 1)).toFixed(2) },
    { label: "Длительность", value: r.durMin.toFixed(0) + " мин" }
  ];
  var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
  for (var i = 0; i < ms.length; i++) {
    var t = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:12px;" });
    t.appendChild(el("div", { class: "muted", style: "font-size:10px;text-transform:uppercase;" }, ms[i].label));
    t.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);margin-top:6px;" }, String(ms[i].value)));
    grid.appendChild(t);
  }
  card.appendChild(grid);
  return card;
}

console.log("analyze v3.5 ready (chat button instead of AI block)");
