/* DOTA JETCH — PROFILE ANALYZER v4.0 (fix: пустые матчи = замочек, больше данных) */

var ProfileAnalyzer = {
  cache: null,
  cacheTime: 0,
  CACHE_TTL: 10 * 60 * 1000,
  loading: false,

  STEAM_OPENID_URL: "https://steamcommunity.com/openid/login",

  /* ═══════════════ ДОСТУП ═══════════════ */
  hasAccess: function () {
    if (typeof checkLicense === "function") {
      try { return checkLicense() === true; } catch (e) {}
    }
    if (Store.get("license.forever", false) === true) return true;
    var exp = Store.get("license.expires", null);
    if (!exp) return Store.get("license.active", false) === true;
    try { return new Date(exp) > new Date(); } catch (e) { return false; }
  },

  getSavedId: function () {
    var id = Store.get("steam_account_id", null);
    return id ? String(id) : null;
  },

  saveId: function (id) { Store.set("steam_account_id", String(id)); },

  clearId: function () {
    Store.set("steam_account_id", null);
    this.cache = null;
    this.cacheTime = 0;
  },

  /* ═══════════════ STEAM LOGIN ═══════════════ */
  loginViaSteam: function () {
    var base = window.location.origin + window.location.pathname;
    var params = [
      "openid.ns=" + encodeURIComponent("http://specs.openid.net/auth/2.0"),
      "openid.mode=checkid_setup",
      "openid.return_to=" + encodeURIComponent(base),
      "openid.realm=" + encodeURIComponent(window.location.origin),
      "openid.identity=" + encodeURIComponent("http://specs.openid.net/auth/2.0/identifier_select"),
      "openid.claimed_id=" + encodeURIComponent("http://specs.openid.net/auth/2.0/identifier_select")
    ];
    window.location.href = this.STEAM_OPENID_URL + "?" + params.join("&");
  },

  checkSteamCallback: function () {
    var search = window.location.search;
    if (!search || search.indexOf("openid.mode=id_res") < 0) return null;
    var params = {};
    search.slice(1).split("&").forEach(function (pair) {
      var idx = pair.indexOf("=");
      if (idx < 0) return;
      params[decodeURIComponent(pair.slice(0, idx))] = decodeURIComponent(pair.slice(idx + 1));
    });
    if (params["openid.mode"] !== "id_res") return null;
    var claimed = params["openid.claimed_id"];
    if (!claimed) return null;
    var m = claimed.match(/steamcommunity\.com\/openid\/id\/(\d+)/);
    if (!m) return null;
    var steam64 = m[1];
    return { steam64: steam64, accountId: this.steam64ToAccountId(steam64) };
  },

  steam64ToAccountId: function (steam64) {
    try { return (BigInt(steam64) - BigInt("76561197960265728")).toString(); }
    catch (e) { return null; }
  },

  cleanUrlAfterLogin: function () {
    try {
      window.history.replaceState({}, document.title,
        window.location.origin + window.location.pathname + "#profile");
    } catch (e) {}
  },

  /* ═══════════════ ЗАГРУЗКА ═══════════════ */
  loadProfile: async function (accountId) {
    try {
      var player = await apiGet("/players/" + accountId);
      return player || null;
    } catch (e) { return null; }
  },

  loadRecentMatches: async function (accountId, limit) {
    try {
      var matches = await apiGet("/players/" + accountId + "/matches", { limit: limit || 30 });
      return Array.isArray(matches) ? matches : [];
    } catch (e) { return []; }
  },

  loadHeroes: async function (accountId) {
    try {
      var heroes = await apiGet("/players/" + accountId + "/heroes");
      return Array.isArray(heroes) ? heroes : [];
    } catch (e) { return []; }
  },

  loadTotals: async function (accountId) {
    try {
      var totals = await apiGet("/players/" + accountId + "/totals");
      return Array.isArray(totals) ? totals : [];
    } catch (e) { return []; }
  },

  loadCounts: async function (accountId) {
    try {
      var counts = await apiGet("/players/" + accountId + "/counts");
      return counts || {};
    } catch (e) { return {}; }
  },

  loadWinLoss: async function (accountId) {
    try {
      var wl = await apiGet("/players/" + accountId + "/wl");
      return wl || {};
    } catch (e) { return {}; }
  },

  loadAll: async function (accountId) {
    if (this.cache && this.cache.accountId === accountId && (Date.now() - this.cacheTime) < this.CACHE_TTL) {
      return this.cache;
    }

    this.loading = true;

    var player = await this.loadProfile(accountId);

    /* Защита: если profile пуст — значит скрыт */
    if (!player || !player.profile || !player.profile.personaname) {
      this.loading = false;
      return { ok: false, reason: "hidden", accountId: accountId };
    }

    /* Параллельная загрузка всего */
    var results = await Promise.all([
      this.loadRecentMatches(accountId, 30),
      this.loadHeroes(accountId),
      this.loadTotals(accountId),
      this.loadCounts(accountId),
      this.loadWinLoss(accountId)
    ]);

    var matches = results[0] || [];
    var heroes = results[1] || [];
    var totals = results[2] || [];
    var counts = results[3] || {};
    var wl = results[4] || {};

    this.loading = false;

    /* ⚠️ ФИКС: если матчей 0 — значит публичные данные ВЫКЛЮЧЕНЫ */
    if (matches.length === 0 && heroes.length === 0 && (!wl.win || wl.win === 0)) {
      return { ok: false, reason: "hidden", accountId: accountId, player: player };
    }

    var data = {
      ok: true,
      accountId: accountId,
      player: player,
      matches: matches,
      heroes: heroes,
      totals: totals,
      counts: counts,
      wl: wl
    };

    data.stats = this.computeStats(data);

    this.cache = data;
    this.cacheTime = Date.now();
    return data;
  },

  /* ═══════════════ МЕТРИКИ ═══════════════ */
  computeStats: function (data) {
    var matches = data.matches || [];
    var heroes = data.heroes || [];
    var totals = data.totals || [];
    var wl = data.wl || {};

    var stats = {
      totalMatches: 0, wins: 0, losses: 0, winrate: 0,
      avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKDA: 0,
      avgGPM: 0, avgXPM: 0, avgLH: 0, avgDuration: 0,
      roleCounts: {}, favoriteRole: null,
      topHeroes: [], bestHero: null, worstHero: null,
      recentForm: [], longestWinStreak: 0, longestLoseStreak: 0,
      totalLifetime: 0, lifetimeWins: 0, lifetimeWinrate: 0
    };

    /* Общий WL за все время */
    if (wl.win !== undefined && wl.lose !== undefined) {
      stats.lifetimeWins = wl.win;
      stats.totalLifetime = wl.win + wl.lose;
      stats.lifetimeWinrate = stats.totalLifetime > 0 ? Math.round((wl.win / stats.totalLifetime) * 100) : 0;
    }

    if (!matches.length) return stats;

    var wins = 0, losses = 0;
    var sumK = 0, sumD = 0, sumA = 0, sumDur = 0;
    var roles = {}, form = [];
    var longestW = 0, longestL = 0, curW = 0, curL = 0;

    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var isRadiant = m.player_slot < 128;
      var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
      if (won) { wins++; curW++; curL = 0; if (curW > longestW) longestW = curW; }
      else { losses++; curL++; curW = 0; if (curL > longestL) longestL = curL; }
      form.push(won ? 1 : 0);

      sumK += (m.kills || 0);
      sumD += (m.deaths || 0);
      sumA += (m.assists || 0);
      sumDur += (m.duration || 0);

      var roleKey = "unknown";
      if (m.is_roaming) roleKey = "roam";
      else if (m.lane_role === 1) roleKey = "safelane";
      else if (m.lane_role === 2) roleKey = "mid";
      else if (m.lane_role === 3) roleKey = "offlane";
      else if (m.lane_role === 4) roleKey = "jungle";
      roles[roleKey] = (roles[roleKey] || 0) + 1;
    }

    /* Средние метрики из totals (за всю жизнь) */
    var gpmTotal = 0, xpmTotal = 0, lhTotal = 0, durationTotal = 0;
    for (var t = 0; t < totals.length; t++) {
      if (totals[t].field === "gold_per_min") gpmTotal = totals[t].sum / Math.max(totals[t].n, 1);
      if (totals[t].field === "xp_per_min") xpmTotal = totals[t].sum / Math.max(totals[t].n, 1);
      if (totals[t].field === "last_hits") lhTotal = totals[t].sum / Math.max(totals[t].n, 1);
      if (totals[t].field === "duration") durationTotal = totals[t].sum / Math.max(totals[t].n, 1);
    }

    var n = matches.length;
    stats.totalMatches = n;
    stats.wins = wins;
    stats.losses = losses;
    stats.winrate = Math.round((wins / n) * 100);
    stats.avgKills = (sumK / n).toFixed(1);
    stats.avgDeaths = (sumD / n).toFixed(1);
    stats.avgAssists = (sumA / n).toFixed(1);
    stats.avgKDA = ((sumK + sumA) / Math.max(sumD, 1)).toFixed(2);
    stats.avgGPM = Math.round(gpmTotal || 0);
    stats.avgXPM = Math.round(xpmTotal || 0);
    stats.avgLH = Math.round(lhTotal || 0);
    stats.avgDuration = Math.round((durationTotal || sumDur / n) / 60);
    stats.roleCounts = roles;
    stats.recentForm = form;
    stats.longestWinStreak = longestW;
    stats.longestLoseStreak = longestL;

    /* Избранная роль */
    var bestRole = null, bestCount = 0;
    for (var r in roles) if (roles[r] > bestCount) { bestCount = roles[r]; bestRole = r; }
    stats.favoriteRole = bestRole;

    /* Лучший и худший герой (минимум 3 игры) */
    var bestHero = null, bestWR = 0;
    var worstHero = null, worstWR = 1;
    for (var h = 0; h < heroes.length; h++) {
      var hero = heroes[h];
      if (hero.games < 3) continue;
      var wr = hero.win / hero.games;
      if (wr > bestWR) { bestWR = wr; bestHero = hero; }
      if (wr < worstWR) { worstWR = wr; worstHero = hero; }
    }
    stats.bestHero = bestHero ? { heroId: bestHero.hero_id, games: bestHero.games, winrate: Math.round(bestWR * 100) } : null;
    stats.worstHero = worstHero ? { heroId: worstHero.hero_id, games: worstHero.games, winrate: Math.round(worstWR * 100) } : null;

    /* Топ-5 героев по количеству игр */
    var sortedHeroes = heroes.slice().sort(function (a, b) { return b.games - a.games; });
    stats.topHeroes = sortedHeroes.slice(0, 5).map(function (h) {
      return { heroId: h.hero_id, games: h.games, winrate: h.games ? Math.round((h.win / h.games) * 100) : 0 };
    });

    return stats;
  },

  /* ═══════════════ ОТРИСОВКА ═══════════════ */
  renderLockedCard: function () {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:60px 30px;";
    card.appendChild(el("div", { style: "font-size:80px;line-height:1;margin-bottom:24px;opacity:0.85;" }, "🔒"));
    card.appendChild(el("div", { style: "font-size:22px;font-weight:900;color:var(--text);margin-bottom:10px;" }, "Только в JETCH+"));
    card.appendChild(el("div", { class: "dim", style: "font-size:13px;line-height:1.6;max-width:440px;margin:0 auto 24px;" },
      "Детальный анализ профиля с полной статистикой матчей, пикрейтом героев и метриками за всё время."));
    var btn = UI.btn("⚡ Активировать JETCH+");
    btn.addEventListener("click", function () { switchPage("settings"); });
    card.appendChild(btn);
    return card;
  },

  renderLoginCard: function () {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:60px 30px;";
    card.appendChild(el("div", { style: "font-size:80px;line-height:1;margin-bottom:24px;" }, "🎮"));
    card.appendChild(el("div", { style: "font-size:22px;font-weight:900;color:var(--text);margin-bottom:10px;" }, "Войди через Steam"));
    card.appendChild(el("div", { class: "dim", style: "font-size:13px;line-height:1.6;max-width:400px;margin:0 auto 28px;" },
      "Получим твой Steam ID и загрузим статистику матчей из OpenDota."));

    var steamBtn = el("button", { type: "button" });
    steamBtn.style.cssText = "display:inline-flex;align-items:center;justify-content:center;gap:14px;padding:18px 36px;border-radius:14px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid rgba(102,192,244,0.6);background:linear-gradient(135deg,#1b2838,#2a475e);color:#fff;transition:transform 0.2s ease, filter 0.2s ease;box-shadow:0 12px 34px -14px rgba(102,192,244,0.9);";
    steamBtn.appendChild(el("div", { style: "font-size:26px;line-height:1;" }, "🎮"));
    steamBtn.appendChild(el("div", {}, "Войти через Steam"));
    steamBtn.addEventListener("mouseenter", function () { steamBtn.style.transform = "translateY(-2px)"; steamBtn.style.filter = "brightness(1.15)"; });
    steamBtn.addEventListener("mouseleave", function () { steamBtn.style.transform = "translateY(0)"; steamBtn.style.filter = "brightness(1)"; });
    steamBtn.addEventListener("click", function () { ProfileAnalyzer.loginViaSteam(); });
    card.appendChild(steamBtn);
    return card;
  },

  renderHiddenCard: function (data) {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:50px 30px;";

    card.appendChild(el("div", { style: "font-size:80px;line-height:1;margin-bottom:20px;" }, "🔒"));
    card.appendChild(el("div", { style: "font-size:22px;font-weight:900;color:var(--gold);margin-bottom:10px;" }, "Публичные матчи выключены"));
    card.appendChild(el("div", { class: "dim", style: "font-size:13.5px;line-height:1.7;max-width:460px;margin:0 auto 24px;" },
      "OpenDota не видит твои матчи — потому что в Dota 2 отключена опция показа публичных данных."));

    var steps = el("div", { style: "max-width:420px;margin:0 auto 24px;text-align:left;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:18px 22px;" });
    var stepsList = [
      "Открой Dota 2",
      "Настройки → Социальные",
      "Поставь галочку «Публичные данные о матчах»",
      "Запусти хотя бы 1 матч, чтобы сервер увидел",
      "Вернись и нажми «Обновить»"
    ];
    for (var i = 0; i < stepsList.length; i++) {
      var step = el("div", { style: "display:flex;gap:12px;align-items:flex-start;padding:7px 0;font-size:13px;color:var(--text-muted);line-height:1.5;" });
      step.appendChild(el("div", { style: "width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold);font-family:'JetBrains Mono',monospace;" }, String(i + 1)));
      step.appendChild(el("div", {}, stepsList[i]));
      steps.appendChild(step);
    }
    card.appendChild(steps);

    /* Если профиль загрузился — показываем ник для проверки */
    if (data && data.player && data.player.profile) {
      var info = el("div", { style: "max-width:420px;margin:0 auto 20px;padding:12px 16px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;font-size:12px;color:var(--text-muted);text-align:left;" });
      info.appendChild(el("div", { style: "font-weight:700;color:var(--text);margin-bottom:4px;" }, "Аккаунт:"));
      info.appendChild(el("div", {}, data.player.profile.personaname + " · ID " + data.accountId));
      card.appendChild(info);
    }

    var btnRow = el("div", { style: "display:flex;gap:10px;justify-content:center;flex-wrap:wrap;" });

    var refreshBtn = UI.btn("🔄 Я включил, обновить");
    refreshBtn.addEventListener("click", function () {
      ProfileAnalyzer.cache = null;
      ProfileAnalyzer.cacheTime = 0;
      switchPage("profile");
    });
    btnRow.appendChild(refreshBtn);

    var changeBtn = UI.btn("Сменить аккаунт", { variant: "ghost" });
    changeBtn.addEventListener("click", function () {
      if (!confirm("Отключить текущий Steam ID?")) return;
      ProfileAnalyzer.clearId();
      switchPage("profile");
    });
    btnRow.appendChild(changeBtn);

    card.appendChild(btnRow);
    return card;
  },

  roleName: function (key) {
    return {
      safelane: "Керри",
      mid: "Мид",
      offlane: "Оффлейн",
      roam: "Роум",
      jungle: "Лес",
      unknown: "Другое"
    }[key] || key;
  },

  roleIcon: function (key) {
    return { safelane: "🗡️", mid: "🔮", offlane: "🛡️", roam: "🏃", jungle: "🌲", unknown: "🎮" }[key] || "🎮";
  },

  /* Красивая метрика — карточка */
  metricTile: function (icon, label, value, sub, color) {
    var tile = el("div", { style: "background:linear-gradient(160deg,rgba(22,24,31,0.95),rgba(18,20,26,0.95));border:1px solid var(--border);border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;transition:transform 0.25s ease, border-color 0.25s ease;" });
    tile.appendChild(el("div", { style: "position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg," + color + ",transparent);" }));

    var topRow = el("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:14px;" });
    var icoBox = el("div", { style: "width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;background:" + color.replace("var(", "rgba(").replace(")", ", 0.12)") + ";border:1px solid " + color + ";" }, icon);
    topRow.appendChild(icoBox);
    topRow.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.14em;color:var(--text-muted);text-transform:uppercase;" }, label));
    tile.appendChild(topRow);

    tile.appendChild(el("div", { style: "font-size:32px;font-weight:900;color:" + color + ";font-variant-numeric:tabular-nums;line-height:1;letter-spacing:-0.02em;" }, String(value)));
    if (sub) tile.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:8px;line-height:1.4;" }, sub));

    tile.addEventListener("mouseenter", function () { tile.style.transform = "translateY(-3px)"; tile.style.borderColor = color; });
    tile.addEventListener("mouseleave", function () { tile.style.transform = "translateY(0)"; tile.style.borderColor = "var(--border)"; });

    return tile;
  },

  /* ═══════════════ ГЛАВНЫЙ РЕНДЕР ═══════════════ */
  render: function () {
    var frag = document.createDocumentFragment();

    if (!this.hasAccess()) { frag.appendChild(this.renderLockedCard()); return frag; }

    var accountId = this.getSavedId();
    if (!accountId) { frag.appendChild(this.renderLoginCard()); return frag; }

    var loadingCard = UI.card("");
    loadingCard.style.cssText = "text-align:center;padding:60px 30px;";
    loadingCard.appendChild(el("div", { style: "font-size:48px;margin-bottom:14px;opacity:0.6;" }, "⏳"));
    loadingCard.appendChild(el("div", { class: "dim", style: "font-size:13px;" }, "Загружаю данные из OpenDota..."));
    frag.appendChild(loadingCard);

    setTimeout(async function () {
      var data = await ProfileAnalyzer.loadAll(accountId);
      var container = document.getElementById("pageContent");
      if (!container) return;
      container.innerHTML = "";

      if (!data.ok) {
        if (data.reason === "hidden") {
          container.appendChild(ProfileAnalyzer.renderHiddenCard(data));
        } else {
          var errCard = UI.card("Ошибка");
          errCard.appendChild(el("div", { style: "color:var(--red);font-size:12.5px;line-height:1.6;" },
            "Не удалось загрузить профиль: " + (data.msg || "неизвестная ошибка")));
          var retryBtn = UI.btn("🔄 Повторить", { variant: "ghost" });
          retryBtn.style.marginTop = "14px";
          retryBtn.addEventListener("click", function () {
            ProfileAnalyzer.cache = null;
            ProfileAnalyzer.cacheTime = 0;
            switchPage("profile");
          });
          errCard.appendChild(retryBtn);
          container.appendChild(errCard);
        }
        return;
      }

      container.appendChild(ProfileAnalyzer.renderDashboard(data));
    }, 50);

    return frag;
  },

  renderDashboard: function (data) {
    var frag = document.createDocumentFragment();
    var s = data.stats;
    var p = data.player;
    var prof = p.profile || {};
    var rank = p.rank_tier || 0;

    /* ─── Красивая шапка ─── */
    var head = el("div", { style: "position:relative;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,rgba(139,92,246,0.35),rgba(34,211,238,0.15),var(--bg-card));border:1px solid var(--accent);padding:28px;margin-bottom:18px;" });
    var headRow = el("div", { style: "position:relative;display:flex;align-items:center;gap:22px;flex-wrap:wrap;" });

    var avWrap = el("div", { style: "position:relative;flex-shrink:0;" });
    var av = el("div", { style: "width:110px;height:110px;border-radius:24px;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;border:3px solid rgba(167,139,250,0.7);box-shadow:0 10px 40px -10px rgba(139,92,246,0.7);" });
    if (prof.avatarfull) av.style.backgroundImage = "url(" + prof.avatarfull + ")";
    avWrap.appendChild(av);
    headRow.appendChild(avWrap);

    var info = el("div", { style: "flex:1;min-width:220px;" });
    var nameRow = el("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap;" });
    nameRow.appendChild(el("div", { style: "font-size:30px;font-weight:900;color:var(--text);line-height:1.1;letter-spacing:-0.02em;" }, prof.personaname || "Игрок"));
    if (rank) {
      var rankNames = ["", "Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
      nameRow.appendChild(el("div", { style: "padding:5px 12px;border-radius:9px;font-size:11px;font-weight:800;letter-spacing:0.06em;background:var(--gold-bg);border:1px solid var(--gold);color:var(--gold);text-transform:uppercase;" }, rankNames[Math.floor(rank / 10)] || "?"));
    }
    info.appendChild(nameRow);

    var metaRow = el("div", { style: "display:flex;gap:14px;margin-top:12px;flex-wrap:wrap;font-size:12px;color:var(--text-muted);" });
    metaRow.appendChild(el("span", {}, "🆔 " + data.accountId));
    if (prof.loccountrycode) metaRow.appendChild(el("span", {}, "🌍 " + prof.loccountrycode));
    if (prof.profileurl) {
      var link = el("a", { href: prof.profileurl, target: "_blank", rel: "noopener", style: "color:var(--cyan);text-decoration:none;font-weight:600;" }, "Steam ↗");
      metaRow.appendChild(link);
    }
    info.appendChild(metaRow);

    if (s.totalLifetime > 0) {
      var lifetime = el("div", { style: "margin-top:14px;font-size:13px;color:var(--text-muted);" });
      lifetime.innerHTML = "Всего матчей за всё время: <b style='color:var(--text);'>" + s.totalLifetime + "</b> · Винрейт: <b style='color:" + (s.lifetimeWinrate >= 55 ? "var(--green)" : s.lifetimeWinrate >= 45 ? "var(--yellow)" : "var(--red)") + ";'>" + s.lifetimeWinrate + "%</b>";
      info.appendChild(lifetime);
    }

    headRow.appendChild(info);

    var actions = el("div", { style: "display:flex;flex-direction:column;gap:8px;align-self:flex-start;" });
    var refreshBtn = UI.btn("🔄 Обновить", { variant: "ghost" });
    refreshBtn.style.cssText = "padding:9px 16px;font-size:12px;";
    refreshBtn.addEventListener("click", function () {
      ProfileAnalyzer.cache = null;
      ProfileAnalyzer.cacheTime = 0;
      switchPage("profile");
    });
    actions.appendChild(refreshBtn);

    var changeBtn = UI.btn("Сменить аккаунт", { variant: "ghost" });
    changeBtn.style.cssText = "padding:9px 16px;font-size:12px;";
    changeBtn.addEventListener("click", function () {
      if (!confirm("Отключить текущий Steam ID?")) return;
      ProfileAnalyzer.clearId();
      switchPage("profile");
    });
    actions.appendChild(changeBtn);
    headRow.appendChild(actions);

    head.appendChild(headRow);
    frag.appendChild(head);

    /* ─── 6 ключевых метрик ─── */
    var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:18px;" });
    grid.appendChild(this.metricTile("🏆", "Винрейт", s.winrate + "%", s.wins + "W · " + s.losses + "L за 30 матчей",
      s.winrate >= 55 ? "var(--green)" : s.winrate >= 45 ? "var(--yellow)" : "var(--red)"));
    grid.appendChild(this.metricTile("⚔️", "KDA", s.avgKDA, s.avgKills + " / " + s.avgDeaths + " / " + s.avgAssists, "var(--cyan)"));
    grid.appendChild(this.metricTile("💰", "GPM", s.avgGPM, "средний за всё время", "var(--gold)"));
    grid.appendChild(this.metricTile("⚡", "XPM", s.avgXPM, "средний за всё время", "var(--accent-light)"));
    grid.appendChild(this.metricTile("🎯", "Ластхиты", s.avgLH, "средние за матч", "var(--cyan)"));
    grid.appendChild(this.metricTile("⏱️", "Длительность", s.avgDuration + " мин", "средняя за матч", "var(--text-muted)"));
    frag.appendChild(grid);

    /* ─── Форма + серии ─── */
    if (s.recentForm && s.recentForm.length) {
      var formCard = UI.card("📈 Форма и серии");
      formCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:10px;" }, "Последние " + s.recentForm.length + " матчей (свежие слева):"));
      var formRow = el("div", { style: "display:flex;gap:5px;flex-wrap:wrap;margin-bottom:16px;" });
      for (var fi = 0; fi < s.recentForm.length; fi++) {
        var isWin = s.recentForm[fi] === 1;
        formRow.appendChild(el("div", {
          style: "width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;font-family:'JetBrains Mono',monospace;" +
            (isWin ? "background:var(--green-bg);color:var(--green);border:1px solid var(--green);" : "background:var(--red-bg);color:var(--red);border:1px solid var(--red);")
        }, isWin ? "W" : "L"));
      }
      formCard.appendChild(formRow);

      var streakGrid = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;" });
      var winStreakBox = el("div", { style: "padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:12px;" });
      winStreakBox.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.12em;color:var(--green);text-transform:uppercase;margin-bottom:6px;" }, "Лучшая серия побед"));
      winStreakBox.appendChild(el("div", { style: "font-size:24px;font-weight:900;color:var(--green);font-family:'JetBrains Mono',monospace;" }, s.longestWinStreak + " W"));
      streakGrid.appendChild(winStreakBox);

      var loseStreakBox = el("div", { style: "padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:12px;" });
      loseStreakBox.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.12em;color:var(--red);text-transform:uppercase;margin-bottom:6px;" }, "Худшая серия"));
      loseStreakBox.appendChild(el("div", { style: "font-size:24px;font-weight:900;color:var(--red);font-family:'JetBrains Mono',monospace;" }, s.longestLoseStreak + " L"));
      streakGrid.appendChild(loseStreakBox);
      formCard.appendChild(streakGrid);

      frag.appendChild(formCard);
    }

    /* ─── Роли ─── */
    if (s.favoriteRole) {
      var roleCard = UI.card("🎯 Роли за последние 30 матчей");
      var roleRow = el("div", { style: "display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;" });
      var roleIconBig = el("div", { style: "width:70px;height:70px;border-radius:18px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;" }, this.roleIcon(s.favoriteRole));
      roleRow.appendChild(roleIconBig);

      var roleInfo = el("div", { style: "flex:1;min-width:200px;" });
      roleInfo.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.14em;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;" }, "Избранная роль"));
      roleInfo.appendChild(el("div", { style: "font-size:22px;font-weight:900;color:var(--text);" }, this.roleName(s.favoriteRole)));
      roleInfo.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:4px;" },
        (s.roleCounts[s.favoriteRole] || 0) + " матчей из " + s.totalMatches));
      roleRow.appendChild(roleInfo);
      roleCard.appendChild(roleRow);

      var roleBars = el("div", { style: "width:100%;" });
      var roleEntries = Object.keys(s.roleCounts).sort(function (a, b) { return s.roleCounts[b] - s.roleCounts[a]; });
      for (var ri = 0; ri < roleEntries.length; ri++) {
        var rk = roleEntries[ri];
        if (rk === "unknown" || s.roleCounts[rk] < 1) continue;
        var pct = Math.round((s.roleCounts[rk] / s.totalMatches) * 100);
        var barRow = el("div", { style: "margin-bottom:10px;" });
        barRow.appendChild(el("div", { style: "display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:5px;" },
          el("span", {}, this.roleIcon(rk) + " " + this.roleName(rk)),
          el("span", { style: "font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--text);" }, pct + "%")));
        var barBg = el("div", { style: "height:8px;background:var(--bg-elev);border-radius:4px;overflow:hidden;" });
        var barFill = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));border-radius:4px;transition:width 0.6s ease;" });
        barBg.appendChild(barFill);
        barRow.appendChild(barBg);
        roleBars.appendChild(barRow);
      }
      roleCard.appendChild(roleBars);
      frag.appendChild(roleCard);
    }

    /* ─── Лучший / худший герой ─── */
    if (s.bestHero || s.worstHero) {
      var hlCard = UI.card("⚔️ Сильные и слабые герои");
      var hlRow = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:14px;" });

      if (s.bestHero) {
        var bestBox = el("div", { style: "padding:16px;background:var(--green-bg);border:1px solid var(--green);border-radius:14px;" });
        bestBox.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.12em;color:var(--green);text-transform:uppercase;margin-bottom:10px;" }, "🔥 Лучший герой"));
        var bHeroImg = el("div", { style: "display:flex;align-items:center;gap:12px;margin-bottom:8px;" });
        bHeroImg.appendChild(heroImgEl({ id: s.bestHero.heroId, name: "" }, 48));
        var bInfo = el("div", { style: "flex:1;" });
        bInfo.appendChild(el("div", { style: "font-size:16px;font-weight:900;color:var(--green);font-family:'JetBrains Mono',monospace;" }, s.bestHero.winrate + "%"));
        bInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:2px;" }, s.bestHero.games + " матчей"));
        bHeroImg.appendChild(bInfo);
        bestBox.appendChild(bHeroImg);
        hlRow.appendChild(bestBox);
      }

      if (s.worstHero) {
        var worstBox = el("div", { style: "padding:16px;background:var(--red-bg);border:1px solid var(--red);border-radius:14px;" });
        worstBox.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.12em;color:var(--red);text-transform:uppercase;margin-bottom:10px;" }, "❌ Слабый герой"));
        var wHeroImg = el("div", { style: "display:flex;align-items:center;gap:12px;margin-bottom:8px;" });
        wHeroImg.appendChild(heroImgEl({ id: s.worstHero.heroId, name: "" }, 48));
        var wInfo = el("div", { style: "flex:1;" });
        wInfo.appendChild(el("div", { style: "font-size:16px;font-weight:900;color:var(--red);font-family:'JetBrains Mono',monospace;" }, s.worstHero.winrate + "%"));
        wInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:2px;" }, s.worstHero.games + " матчей"));
        wHeroImg.appendChild(wInfo);
        worstBox.appendChild(wHeroImg);
        hlRow.appendChild(worstBox);
      }

      hlCard.appendChild(hlRow);
      frag.appendChild(hlCard);
    }

    /* ─── Топ-5 героев ─── */
    if (s.topHeroes && s.topHeroes.length) {
      var heroesCard = UI.card("🎮 Топ-5 героев по количеству игр");
      var heroesList = el("div", { style: "display:flex;flex-direction:column;gap:10px;" });
      for (var hi = 0; hi < s.topHeroes.length; hi++) {
        (function (h, idx) {
          var hRow = el("div", { style: "display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;transition:border-color 0.15s ease;" });
          hRow.addEventListener("mouseenter", function () { hRow.style.borderColor = "var(--accent)"; });
          hRow.addEventListener("mouseleave", function () { hRow.style.borderColor = "var(--border)"; });

          var rankBadge = el("div", { style: "width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;flex-shrink:0;" +
            (idx === 0 ? "background:linear-gradient(135deg,#fbbf24,#d97706);color:#0b0c10;box-shadow:0 0 18px -6px #fbbf24;" :
             idx === 1 ? "background:linear-gradient(135deg,#d1d5db,#6b7280);color:#0b0c10;" :
             idx === 2 ? "background:linear-gradient(135deg,#d97706,#7c2d12);color:#fff;" :
             "background:var(--bg-card);border:1px solid var(--border);color:var(--text-muted);") }, "#" + (idx + 1));
          hRow.appendChild(rankBadge);

          hRow.appendChild(heroImgEl({ id: h.heroId, name: "" }, 44));

          var hInfo = el("div", { style: "flex:1;min-width:0;" });
          hInfo.appendChild(el("div", { style: "font-size:14px;font-weight:700;color:var(--text);" }, "Герой #" + h.heroId));
          hInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:3px;" }, h.games + " матчей"));
          hRow.appendChild(hInfo);

          var wrColor = h.winrate >= 55 ? "var(--green)" : h.winrate >= 45 ? "var(--yellow)" : "var(--red)";
          hRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:900;color:" + wrColor + ";" }, h.winrate + "%"));

          heroesList.appendChild(hRow);
        })(s.topHeroes[hi], hi);
      }
      heroesCard.appendChild(heroesList);
      frag.appendChild(heroesCard);
    }

    /* ─── Последние матчи ─── */
    if (data.matches && data.matches.length) {
      var matchesCard = UI.card("📜 Последние " + data.matches.length + " матчей");
      var list = el("div", { style: "display:flex;flex-direction:column;gap:6px;" });

      for (var mi = 0; mi < data.matches.length; mi++) {
        (function (m) {
          var isRadiant = m.player_slot < 128;
          var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
          var durMin = Math.round((m.duration || 0) / 60);

          var mRow = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:border-color 0.15s ease, transform 0.15s ease;" });
          mRow.addEventListener("mouseenter", function () { mRow.style.borderColor = "var(--accent)"; mRow.style.transform = "translateX(3px)"; });
          mRow.addEventListener("mouseleave", function () { mRow.style.borderColor = "var(--border)"; mRow.style.transform = "translateX(0)"; });

          mRow.appendChild(el("div", { style: "width:4px;height:36px;border-radius:2px;flex-shrink:0;background:" + (won ? "var(--green)" : "var(--red)") + ";box-shadow:0 0 10px " + (won ? "var(--green)" : "var(--red)") + ";" }));

          mRow.appendChild(heroImgEl({ id: m.hero_id, name: "" }, 36));

          var mInfo = el("div", { style: "flex:1;min-width:0;" });
          mInfo.appendChild(el("div", { style: "font-size:12.5px;font-weight:700;color:var(--text);" }, "Матч #" + m.match_id));
          mInfo.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-top:3px;" }, durMin + " мин · " + (m.game_mode === 22 ? "Ranked" : "Обычный")));
          mRow.appendChild(mInfo);

          var kdaColor = won ? "var(--green)" : "var(--red)";
          var kdaBox = el("div", { style: "text-align:right;" });
          kdaBox.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:" + kdaColor + ";" }, (m.kills || 0) + "/" + (m.deaths || 0) + "/" + (m.assists || 0)));
          kdaBox.appendChild(el("div", { style: "font-size:10px;font-weight:700;color:" + kdaColor + ";margin-top:2px;" }, won ? "ПОБЕДА" : "ПОРАЖЕНИЕ"));
          mRow.appendChild(kdaBox);

          mRow.addEventListener("click", function () {
            window.open("https://www.opendota.com/matches/" + m.match_id, "_blank");
          });
          list.appendChild(mRow);
        })(data.matches[mi]);
      }
      matchesCard.appendChild(list);
      frag.appendChild(matchesCard);
    }

    return frag;
  },

  /* ═══════════════ ИНИЦИАЛИЗАЦИЯ ═══════════════ */
  init: function () {
    var callback = this.checkSteamCallback();
    if (callback && callback.accountId) {
      console.log("🎮 Steam OpenID: account_id=" + callback.accountId);
      this.saveId(callback.accountId);
      this.cleanUrlAfterLogin();
      setTimeout(function () { location.reload(); }, 100);
    }
  }
};

ProfileAnalyzer.init();

console.log("profile-analyzer v4.0 ready (hidden-match fix + more data)");
