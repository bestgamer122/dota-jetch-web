/* DOTA JETCH — АНАЛИЗ МАТЧА v4.0.0
   Расширенный анализ: оценка производительности, анализ смертей,
   рекомендации по предметам, интеграция с ИИ.
   5 анализов в день на FREE, безлимит на JETCH+. */

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

async function fetchWithRetry(path, params, retries) {
  retries = retries === undefined ? 2 : retries;
  for (var i = 0; i <= retries; i++) {
    try { return await apiGet(path, params); }
    catch (e) {
      if (i === retries) throw e;
      await new Promise(function (r) { setTimeout(r, 800 * (i + 1)); });
    }
  }
}

function detectPosition(player) {
  var lane = player.lane_role;
  if (lane === 2) return 2;
  if (lane === 1) return 1;
  if (lane === 3) return 3;
  return null;
}

/* ─── Расширенный анализ ─── */
async function runAnalysis(matchId, heroName) {
  var heroes = await getHeroes();
  if (!heroes.length) throw new Error("Не удалось загрузить героев");
  var hero = await findHeroId(heroName);
  if (!hero) throw new Error("Герой «" + heroName + "» не найден");

  var match = await fetchWithRetry("/matches/" + matchId);
  if (!match || !match.players || !Array.isArray(match.players)) {
    throw new Error("Матч не найден или недоступен");
  }
  if (match.duration === undefined) {
    throw new Error("Матч не распарсен (duration отсутствует)");
  }

  var player = match.players.find(function (p) { return p.hero_id === hero.id; });
  if (!player) throw new Error(hero.name + " не играл в этом матче");

  var bench = {};
  try { bench = await fetchWithRetry("/benchmarks", { hero_id: hero.id }) || {}; }
  catch (e) { console.warn("benchmarks недоступны", e); }

  var items = {};
  try { items = await getItemCatalog(); }
  catch (e) { console.warn("items недоступны", e); }

  var isRadiant = player.player_slot < 128;
  var won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
  var durMin = match.duration / 60;

  /* Расчёт оценки производительности */
  var performance = calculatePerformance(player, bench, durMin, won);

  return {
    match: match, player: player, hero: hero, bench: bench, items: items, heroes: heroes,
    won: won, durMin: durMin,
    position: detectPosition(player),
    rankTier: player.rank_tier || null,
    performance: performance
  };
}

/* ─── Оценка производительности ─── */
function calculatePerformance(player, bench, durMin, won) {
  var score = 50; /* Базовая оценка */
  var reasons = [];

  /* KDA */
  var kda = (player.kills + player.assists) / Math.max(player.deaths, 1);
  if (kda >= 5) { score += 15; reasons.push("Отличный KDA (" + kda.toFixed(2) + ")"); }
  else if (kda >= 3) { score += 8; reasons.push("Хороший KDA (" + kda.toFixed(2) + ")"); }
  else if (kda < 1.5) { score -= 10; reasons.push("Низкий KDA (" + kda.toFixed(2) + ")"); }

  /* GPM */
  var gpm = player.gold_per_min || 0;
  if (gpm >= 600) { score += 10; reasons.push("Высокий GPM (" + Math.round(gpm) + ")"); }
  else if (gpm >= 400) { score += 5; }
  else if (gpm < 250) { score -= 8; reasons.push("Низкий GPM (" + Math.round(gpm) + ")"); }

  /* XPM */
  var xpm = player.xp_per_min || 0;
  if (xpm >= 700) { score += 8; reasons.push("Высокий XPM (" + Math.round(xpm) + ")"); }
  else if (xpm < 300) { score -= 6; reasons.push("Низкий XPM (" + Math.round(xpm) + ")"); }

  /* Ластхиты */
  var lhPerMin = (player.last_hits || 0) / Math.max(durMin, 1);
  if (lhPerMin >= 8) { score += 8; reasons.push("Отличный фарм (" + lhPerMin.toFixed(1) + " LH/мин)"); }
  else if (lhPerMin >= 5) { score += 4; }
  else if (lhPerMin < 2 && player.lane_role !== 4 && player.lane_role !== 5) { score -= 8; reasons.push("Слабый фарм (" + lhPerMin.toFixed(1) + " LH/мин)"); }

  /* Урон */
  var hdPerMin = (player.hero_damage || 0) / Math.max(durMin, 1);
  if (hdPerMin >= 800) { score += 8; reasons.push("Высокий урон (" + Math.round(hdPerMin) + "/мин)"); }
  else if (hdPerMin < 300) { score -= 6; reasons.push("Низкий урон (" + Math.round(hdPerMin) + "/мин)"); }

  /* Смерти */
  var deathsPerMin = (player.deaths || 0) / Math.max(durMin, 1);
  if (deathsPerMin > 0.3) { score -= 10; reasons.push("Много смертей (" + deathsPerMin.toFixed(2) + "/мин)"); }
  else if (deathsPerMin < 0.1) { score += 5; reasons.push("Мало смертей"); }

  /* Результат */
  if (won) score += 5;
  else score -= 5;

  /* Ограничение */
  score = Math.max(0, Math.min(100, score));

  var grade = "D";
  if (score >= 90) grade = "S";
  else if (score >= 75) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";

  return { score: score, grade: grade, reasons: reasons };
}

/* ─── Анализ смертей ─── */
function analyzeDeaths(player, match, durMin) {
  var deaths = player.deaths || 0;
  if (deaths === 0) return { count: 0, timeline: [], advice: "Ни одной смерти — идеальная игра!" };

  var timeline = [];
  var advice = "";

  /* Оценка частоты смертей */
  var deathsPerMin = deaths / Math.max(durMin, 1);
  if (deathsPerMin > 0.3) {
    advice = "Слишком много смертей. Старайся играть безопаснее: не заходи без вижена, следи за картой, не фарми в опасных зонах.";
  } else if (deathsPerMin > 0.15) {
    advice = "Умеренное количество смертей. Обрати внимание на позиционирование в замесах.";
  } else {
    advice = "Хорошая выживаемость! Продолжай в том же духе.";
  }

  return { count: deaths, timeline: timeline, advice: advice };
}

/* ─── Рекомендации по предметам ─── */
function getItemRecommendations(player, hero, match) {
  var recommendations = [];
  var items = [];

  /* Текущие предметы */
  for (var i = 0; i < 6; i++) {
    var id = player["item_" + i];
    if (id && id > 0) items.push(id);
  }

  /* Базовые рекомендации для ролей */
  var role = detectPosition(player);
  if (role === 1) {
    recommendations.push({ item: "Black King Bar", reason: "Обязателен против маго-контроля в замесах" });
    recommendations.push({ item: "Satanic", reason: "Для выживания в позднем гейме" });
  } else if (role === 2) {
    recommendations.push({ item: "Black King Bar", reason: "Для агрессивных действий в мидгейме" });
    recommendations.push({ item: "Aghanim's Scepter", reason: "Улучшение ульты для командных файтов" });
  } else if (role === 3) {
    recommendations.push({ item: "Blink Dagger", reason: "Для инициации и контроля карты" });
    recommendations.push({ item: "Pipe of Insight", reason: "Командный магрезист против AoE-магии" });
  } else if (role === 4 || role === 5) {
    recommendations.push({ item: "Glimmer Cape", reason: "Спасение союзников от фокуса" });
    recommendations.push({ item: "Force Staff", reason: "Позиционный сейв и диспел" });
  }

  /* Против конкретных героев */
  var enemyHeroes = match.players.filter(function (p) {
    var isRadiant = player.player_slot < 128;
    var enemyRadiant = p.player_slot < 128;
    return isRadiant !== enemyRadiant;
  });

  for (var j = 0; j < enemyHeroes.length; j++) {
    var enemy = enemyHeroes[j];
    var enemyHero = KB_HEROES[enemy.hero_id] || null;
    /* Проверка на мана-зависимых */
    if (enemyHero && enemyHero.tags && enemyHero.tags.indexOf("mana") >= 0) {
      recommendations.push({ item: "Diffusal Blade", reason: "Сжигает ману против " + (enemyHero.name || "врага") });
    }
  }

  return recommendations;
}

/* ─── Рендер страницы ─── */
function renderAnalyze() {
  var frag = document.createDocumentFragment();
  var plus = Store.get("license.active", false) === true;
  var left = analyzeQuotaRemaining();

  var form = UI.card("Новый анализ");
  var quotaText = el("div", {
    style: "font-size:12px;font-weight:600;margin-bottom:14px;color:" +
      (plus ? "var(--gold)" : (left > 0 ? "var(--text-muted)" : "var(--red)")) + ";"
  }, plus ? "JETCH+ · безлимит" : "FREE · осталось " + left + " / " + ANALYZE_FREE_LIMIT);
  form.appendChild(quotaText);

  form.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:12px;" },
    "Введи ID матча и имя героя. Данные берутся из OpenDota API."));

  var row = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
  var idWrap = el("div");
  idWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;letter-spacing:1px;" }, "ID МАТЧА"));
  var idInput = UI.input("8123456789");
  idInput.id = "matchIdInput";
  idInput.type = "number";
  idWrap.appendChild(idInput);

  var heroWrap = el("div");
  heroWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;letter-spacing:1px;" }, "ГЕРОЙ"));
  var heroInput = UI.input("Juggernaut / пудж / ам");
  heroInput.id = "heroInput";
  heroWrap.appendChild(heroInput);

  row.appendChild(idWrap);
  row.appendChild(heroWrap);
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
    var upsell = el("div", { style: "margin-top:12px;font-size:11px;color:var(--text-muted);" },
      "Активируй JETCH+ в настройках — анализы станут безлимитными.");
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

  var idInput = qs("#matchIdInput");
  var heroInput = qs("#heroInput");
  var hint = qs("#analyzeHint");
  var btn = qs("#analyzeBtn");
  var report = qs("#analyzeReport");

  var mid = (idInput.value || "").trim();
  var hero = (heroInput.value || "").trim();

  if (!mid || !hero) { hint.textContent = "Заполни оба поля"; hint.style.color = "var(--red)"; return; }
  if (!/^\d+$/.test(mid)) { hint.textContent = "ID должен быть числом"; hint.style.color = "var(--red)"; return; }

  btn.disabled = true;
  btn.textContent = "Загрузка...";
  hint.textContent = "Загружаю...";
  report.innerHTML = "";

  var loadCard = UI.card("");
  loadCard.appendChild(el("div", { style: "text-align:center;padding:30px;" }, "⏳ Загружаю матч из OpenDota..."));
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
    if (!plus && analyzeQuotaRemaining() <= 0) {
      setTimeout(function () { switchPage("analyze"); }, 1500);
    }
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

/* ─── Отчёт ─── */
function buildReport(r) {
  var frag = document.createDocumentFragment();

  /* Header */
  var head = UI.card("");
  head.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.35),var(--bg-card));border-color:var(--accent);";
  var headInner = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });
  headInner.appendChild(heroImgEl(r.hero, 96));

  var info = el("div", { style: "flex:1;min-width:200px;" });
  info.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" }, r.hero.name));

  var badges = el("div", { class: "row", style: "margin-top:8px;flex-wrap:wrap;" });
  if (r.position) badges.appendChild(UI.badge(POSITION_NAMES[r.position], "var(--accent-light)", "var(--accent-bg)"));
  badges.appendChild(UI.badge(MODE_NAMES[r.match.game_mode] || "—", "var(--text-muted)", "var(--bg-elev)"));
  badges.appendChild(UI.badge(r.durMin.toFixed(1) + " мин", "var(--text-muted)", "var(--bg-elev)"));
  if (r.performance) badges.appendChild(UI.badge("Оценка: " + r.performance.grade, "var(--gold)", "var(--gold-bg)"));
  info.appendChild(badges);

  var kda = el("div", { style: "margin-top:14px;display:flex;align-items:baseline;gap:12px;" });
  kda.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" },
    r.player.kills + " / " + r.player.deaths + " / " + r.player.assists));
  kda.appendChild(el("div", { class: "muted", style: "font-size:12px;" },
    "КДА " + ((r.player.kills + r.player.assists) / Math.max(r.player.deaths, 1)).toFixed(2)));
  info.appendChild(kda);
  headInner.appendChild(info);

  var wl = el("div", { style: "text-align:right;" });
  var wlBadge = r.won
    ? UI.badge("ПОБЕДА", "var(--green)", "var(--green-bg)")
    : UI.badge("ПОРАЖЕНИЕ", "var(--red)", "var(--red-bg)");
  wlBadge.style.fontSize = "14px";
  wlBadge.style.padding = "8px 16px";
  wl.appendChild(wlBadge);
  headInner.appendChild(wl);

  head.appendChild(headInner);
  frag.appendChild(head);

  /* Performance card */
  if (r.performance) {
    var perfCard = UI.card("Оценка производительности");
    var perfRow = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });

    var gradeCircle = el("div", {
      style: "width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;font-family:'JetBrains Mono',monospace;border:3px solid;flex-shrink:0;"
    });
    var gradeColor = r.performance.grade === "S" ? "var(--gold)" : r.performance.grade === "A" ? "var(--green)" : r.performance.grade === "B" ? "var(--cyan)" : r.performance.grade === "C" ? "var(--orange)" : "var(--red)";
    gradeCircle.style.color = gradeColor;
    gradeCircle.style.borderColor = gradeColor;
    gradeCircle.textContent = r.performance.grade;
    perfRow.appendChild(gradeCircle);

    var perfInfo = el("div", { style: "flex:1;min-width:200px;" });
    perfInfo.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);" },
      r.performance.score + " / 100"));
    var reasonsList = el("div", { style: "margin-top:8px;font-size:12px;line-height:1.6;color:var(--text-muted);" });
    for (var i = 0; i < r.performance.reasons.length; i++) {
      reasonsList.appendChild(el("div", {}, "• " + r.performance.reasons[i]));
    }
    perfInfo.appendChild(reasonsList);
    perfRow.appendChild(perfInfo);
    perfCard.appendChild(perfRow);
    frag.appendChild(perfCard);
  }

  /* Death analysis */
  var deathAnalysis = analyzeDeaths(r.player, r.match, r.durMin);
  var deathCard = UI.card("💀 Анализ смертей");
  deathCard.appendChild(el("div", { style: "font-size:14px;font-weight:600;margin-bottom:8px;" },
    "Смертей: " + deathAnalysis.count));
  deathCard.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" }, deathAnalysis.advice));
  frag.appendChild(deathCard);

  /* Item recommendations */
  var itemRecs = getItemRecommendations(r.player, r.hero, r.match);
  if (itemRecs.length) {
    var recCard = UI.card("🛡 Рекомендации по предметам");
    for (var j = 0; j < itemRecs.length; j++) {
      var rec = itemRecs[j];
      var recRow = el("div", { style: "display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);" });
      recRow.appendChild(el("div", { style: "color:var(--cyan);font-size:16px;flex-shrink:0;" }, "◆"));
      var recInfo = el("div", { style: "flex:1;" });
      recInfo.appendChild(el("div", { style: "font-size:13px;font-weight:600;color:var(--text);" }, rec.item));
      recInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:2px;" }, rec.reason));
      recRow.appendChild(recInfo);
      recCard.appendChild(recRow);
    }
    frag.appendChild(recCard);
  }

  /* Inventory */
  var invCard = buildInventoryCard(r);
  if (invCard) frag.appendChild(invCard);

  /* Metrics */
  frag.appendChild(buildMetricsCard(r));

  /* Timeline */
  var timeline = buildTimelineCard(r);
  if (timeline) frag.appendChild(timeline);

  /* Team composition */
  var team = buildTeamCompositionCard(r);
  if (team) frag.appendChild(team);

  /* Percentiles */
  var pct = buildPercentilesCard(r);
  if (pct) frag.appendChild(pct);

  /* OpenDota link */
  var linkCard = el("div", { style: "text-align:center;padding:14px;" });
  linkCard.appendChild(el("a", {
    href: "https://www.opendota.com/matches/" + r.match.match_id,
    target: "_blank", rel: "noopener noreferrer",
    style: "color:var(--cyan);font-size:12px;"
  }, "🔗 Открыть матч на OpenDota"));
  frag.appendChild(linkCard);

  return frag;
}

function buildInventoryCard(r) {
  var p = r.player;
  var items = r.items || {};
  var slots = [];
  for (var i = 0; i < 6; i++) slots.push(p["item_" + i] || 0);
  var hasAny = false;
  for (var j = 0; j < slots.length; j++) if (slots[j] > 0) hasAny = true;
  if (!hasAny) return null;

  var card = UI.card("🎒 Финальный инвентарь");
  var grid = el("div", { style: "display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:420px;" });
  for (var k = 0; k < slots.length; k++) {
    var id = slots[k];
    var item = id > 0 ? items[id] : null;
    var cell = itemImgEl(item);
    if (item) cell.title = item.name;
    grid.appendChild(cell);
  }
  card.appendChild(grid);

  var extras = el("div", { class: "row", style: "margin-top:12px;flex-wrap:wrap;gap:8px;" });
  if (p.aghanims_scepter) extras.appendChild(UI.badge("Aghanim's Scepter", "var(--gold)", "var(--gold-bg)"));
  if (p.aghanims_shard) extras.appendChild(UI.badge("Aghanim's Shard", "var(--gold)", "var(--gold-bg)"));
  if (extras.children.length) card.appendChild(extras);
  return card;
}

function buildMetricsCard(r) {
  var card = UI.card("📊 Статистика");
  var p = r.player;
  var metrics = [
    { icon: "💰", color: "var(--gold)", label: "GPM", value: Math.round(p.gold_per_min || 0) },
    { icon: "⚡", color: "var(--cyan)", label: "XPM", value: Math.round(p.xp_per_min || 0) },
    { icon: "🎯", color: "var(--green)", label: "Ластхиты", value: p.last_hits || 0 },
    { icon: "🌾", color: "var(--accent-light)", label: "Денаи", value: p.denies || 0 },
    { icon: "⚔️", color: "var(--red)", label: "Урон героям", value: Math.round(p.hero_damage || 0).toLocaleString() },
    { icon: "🏰", color: "var(--orange)", label: "Урон строениям", value: Math.round(p.tower_damage || 0).toLocaleString() },
    { icon: "❤️", color: "var(--green)", label: "Хил", value: Math.round(p.hero_healing || 0).toLocaleString() },
    { icon: "💎", color: "var(--yellow)", label: "Нетфорс", value: Math.round(p.net_worth || 0).toLocaleString() },
    { icon: "💀", color: "var(--red)", label: "Смертей/мин", value: (p.deaths / Math.max(r.durMin, 1)).toFixed(2) },
    { icon: "🎬", color: "var(--accent-light)", label: "Длительность", value: r.durMin.toFixed(0) + " мин" }
  ];
  var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;" });
  for (var i = 0; i < metrics.length; i++) {
    var m = metrics[i];
    var tile = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:12px;" });
    tile.appendChild(el("div", { style: "display:flex;align-items:center;justify-content:space-between;" },
      el("span", { class: "muted", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;" }, m.label),
      el("span", { style: "color:" + m.color + ";font-size:14px;" }, m.icon)));
    tile.appendChild(el("div", { style: "font-size:18px;font-weight:bold;color:var(--text);margin-top:6px;" }, String(m.value)));
    grid.appendChild(tile);
  }
  card.appendChild(grid);
  return card;
}

function buildTimelineCard(r) {
  var m = r.match;
  var objectives = Array.isArray(m.objectives) ? m.objectives : [];
  if (!objectives.length) return null;
  var dur = m.duration || 1;

  var card = UI.card("⏱ Таймлайн матча");
  var wrap = el("div", { style: "position:relative;height:80px;margin:22px 8px 26px;padding:0 4px;" });
  wrap.appendChild(el("div", {
    style: "position:absolute;left:0;right:0;top:50%;height:4px;background:linear-gradient(90deg,#22c55e 0%,#22c55e 50%,#ef4444 50%,#ef4444 100%);border-radius:2px;transform:translateY(-50%);opacity:0.5;"
  }));

  var minutes = Math.floor(dur / 60);
  for (var mm = 0; mm <= minutes; mm += 10) {
    var pct = (mm * 60 / dur) * 100;
    if (pct > 100) break;
    wrap.appendChild(el("div", {
      style: "position:absolute;left:" + pct + "%;top:calc(50% + 10px);transform:translateX(-50%);font-size:9px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;"
    }, mm + "'"));
  }

  for (var i = 0; i < objectives.length; i++) {
    var o = objectives[i];
    if (!o || !o.time) continue;
    var pctO = Math.min(100, (o.time / dur) * 100);
    var icon = "•", color = "var(--yellow)", label = "";
    if (o.type === "CHAT_MESSAGE_ROSHAN_KILL") { icon = "🐉"; color = "#a78bfa"; label = "Roshan убит"; }
    else if (o.type === "CHAT_MESSAGE_FIRSTBLOOD") { icon = "🩸"; color = "#ef4444"; label = "First Blood"; }
    else if (o.type === "building_kill") {
      icon = "🏰";
      color = (o.team === 2) ? "#22c55e" : "#ef4444";
      var unit = o.unit || "";
      if (unit.indexOf("tower1") >= 0) label = "Tower T1";
      else if (unit.indexOf("tower2") >= 0) label = "Tower T2";
      else if (unit.indexOf("tower3") >= 0) label = "Tower T3";
      else if (unit.indexOf("fort") >= 0) label = "Barracks";
      else label = unit.replace("npc_dota_", "");
    }
    else if (o.type === "CHAT_MESSAGE_AEGIS") { icon = "🛡"; color = "#67e8f9"; label = "Aegis взят"; }
    else continue;

    var t = Math.floor(o.time / 60) + ":" + String(o.time % 60).padStart(2, "0");
    wrap.appendChild(el("div", {
      title: t + " — " + label,
      style: "position:absolute;left:" + pctO + "%;top:50%;transform:translate(-50%,-50%);font-size:16px;cursor:help;filter:drop-shadow(0 0 6px " + color + ");z-index:2;"
    }, icon));
  }

  card.appendChild(wrap);
  var legend = el("div", { class: "row", style: "gap:16px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);" });
  legend.appendChild(el("div", {}, "🩸 First Blood"));
  legend.appendChild(el("div", {}, "🏰 Башни"));
  legend.appendChild(el("div", {}, "🐉 Roshan"));
  legend.appendChild(el("div", {}, "🛡 Aegis"));
  card.appendChild(legend);
  return card;
}

function buildTeamCompositionCard(r) {
  var m = r.match;
  var heroesList = r.heroes || [];
  if (!Array.isArray(m.players) || m.players.length < 2) return null;

  var card = UI.card("👥 Состав команд");
  var radiant = m.players.filter(function (p) { return p.player_slot < 128; });
  var dire = m.players.filter(function (p) { return p.player_slot >= 128; });

  function renderTeam(list, label, color, isWin) {
    var row = el("div", { style: "margin-bottom:16px;" });
    row.appendChild(el("div", {
      style: "font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:" + color + ";margin-bottom:8px;"
    }, label + " · " + (isWin ? "ПОБЕДА" : "ПОРАЖЕНИЕ")));

    var grid = el("div", { style: "display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:520px;" });
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var h = heroesList.find(function (x) { return x.id === p.hero_id; });
      var isMe = p.hero_id === r.hero.id;
      grid.appendChild(heroTileEl(h, {
        borderColor: isMe ? "var(--accent)" : "transparent",
        kda: p.kills + "/" + p.deaths + "/" + p.assists
      }));
    }
    row.appendChild(grid);
    return row;
  }

  card.appendChild(renderTeam(radiant, "Radiant", "#22c55e", !!m.radiant_win));
  card.appendChild(renderTeam(dire, "Dire", "#ef4444", !m.radiant_win));
  return card;
}

function buildPercentilesCard(r) {
  if (!r.bench || !Object.keys(r.bench).length) return null;
  var p = r.player;
  var items = [
    ["GPM", "gold_per_min", p.gold_per_min],
    ["XPM", "xp_per_min", p.xp_per_min],
    ["Ластхиты/мин", "last_hits_per_min", (p.last_hits || 0) / Math.max(r.durMin, 1)],
    ["Денаи/мин", "denies_per_min", (p.denies || 0) / Math.max(r.durMin, 1)],
    ["Урон/мин", "hero_damage_per_min", (p.hero_damage || 0) / Math.max(r.durMin, 1)],
    ["Хил/мин", "hero_healing_per_min", (p.hero_healing || 0) / Math.max(r.durMin, 1)]
  ];
  var valid = [];
  for (var i = 0; i < items.length; i++) {
    var pct = percentileOf(r.bench, items[i][1], items[i][2]);
    if (pct !== null) valid.push([items[i][0], pct]);
  }
  if (!valid.length) return null;

  var card = UI.card("📈 Перцентили (против других игроков на этом герое)");
  for (var j = 0; j < valid.length; j++) {
    card.appendChild(pctBar(valid[j][0], valid[j][1]));
  }
  return card;
}

function pctBar(label, pct) {
  var color = pctColor(pct);
  var grade = pctGrade(pct);
  var row = el("div", { style: "display:flex;align-items:center;gap:12px;padding:6px 0;" });
  row.appendChild(el("div", { style: "width:120px;font-size:12px;color:var(--text-muted);" }, label));
  var barWrap = el("div", { style: "flex:1;height:8px;background:var(--bg-elev);border-radius:4px;overflow:hidden;" });
  barWrap.appendChild(el("div", { style: "height:100%;width:" + pct.toFixed(0) + "%;background:" + color + ";border-radius:4px;transition:width 0.4s ease;" }));
  row.appendChild(barWrap);
  row.appendChild(el("div", { style: "width:60px;text-align:right;font-size:12px;font-weight:bold;color:" + color + ";" },
    pct.toFixed(0) + "% · " + grade));
  return row;
}