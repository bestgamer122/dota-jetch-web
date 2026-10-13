/* DOTA JETCH — PROFILE ANALYZER v2.0 (JETCH+ only, Steam OpenID login) */

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

  /* ═══════════════ STEAM ID ═══════════════ */
  getSavedId: function () {
    var id = Store.get("steam_account_id", null);
    return id ? String(id) : null;
  },

  saveId: function (id) {
    Store.set("steam_account_id", String(id));
  },

  clearId: function () {
    Store.set("steam_account_id", null);
    this.cache = null;
    this.cacheTime = 0;
  },

  /* ═══════════════ STEAM LOGIN (OpenID redirect) ═══════════════ */
  getBaseUrl: function () {
    var loc = window.location;
    return loc.origin + loc.pathname;
  },

  loginViaSteam: function () {
    var base = this.getBaseUrl();
    var realm = window.location.origin;
    var params = [
      "openid.ns=" + encodeURIComponent("http://specs.openid.net/auth/2.0"),
      "openid.mode=checkid_setup",
      "openid.return_to=" + encodeURIComponent(base),
      "openid.realm=" + encodeURIComponent(realm),
      "openid.identity=" + encodeURIComponent("http://specs.openid.net/auth/2.0/identifier_select"),
      "openid.claimed_id=" + encodeURIComponent("http://specs.openid.net/auth/2.0/identifier_select")
    ];
    window.location.href = this.STEAM_OPENID_URL + "?" + params.join("&");
  },

  /* Проверяем URL — не вернулись ли мы из Steam */
  checkSteamCallback: function () {
    var search = window.location.search;
    if (!search || search.indexOf("openid.mode=id_res") < 0) return null;

    var params = {};
    search.slice(1).split("&").forEach(function (pair) {
      var idx = pair.indexOf("=");
      if (idx < 0) return;
      var k = decodeURIComponent(pair.slice(0, idx));
      var v = decodeURIComponent(pair.slice(idx + 1));
      params[k] = v;
    });

    if (params["openid.mode"] !== "id_res") return null;
    var claimed = params["openid.claimed_id"];
    if (!claimed) return null;

    var m = claimed.match(/steamcommunity\.com\/openid\/id\/(\d+)/);
    if (!m) return null;

    var steam64 = m[1];
    var accountId = this.steam64ToAccountId(steam64);
    return { steam64: steam64, accountId: accountId };
  },

  steam64ToAccountId: function (steam64) {
    try {
      return (BigInt(steam64) - BigInt("76561197960265728")).toString();
    } catch (e) { return null; }
  },

  cleanUrlAfterLogin: function () {
    try {
      var url = window.location.origin + window.location.pathname + "#profile";
      window.history.replaceState({}, document.title, url);
    } catch (e) {}
  },

  /* ═══════════════ ПАРСЕР РУЧНОГО ВВОДА ═══════════════ */
  parseSteamId: function (raw) {
    var s = String(raw || "").trim();
    if (!s) return { ok: false, msg: "Пусто" };

    var linkMatch = s.match(/steamcommunity\.com\/profiles\/(\d+)/i);
    if (linkMatch) s = linkMatch[1];

    if (/steamcommunity\.com\/id\//i.test(s)) {
      return { ok: false, msg: "Vanity-ссылка не поддерживается — используй кнопку «Войти через Steam»" };
    }

    if (!/^\d+$/.test(s)) {
      return { ok: false, msg: "ID должен содержать только цифры" };
    }

    var num = s;

    if (num.length === 17 && num.indexOf("7656119") === 0) {
      var accountId = this.steam64ToAccountId(num);
      return { ok: true, accountId: accountId, original: num, type: "steam64" };
    }

    if (num.length >= 4 && num.length <= 11) {
      return { ok: true, accountId: num, original: num, type: "steam32" };
    }

    return { ok: false, msg: "Неизвестный формат ID" };
  },

  /* ═══════════════ ЗАГРУЗКА ДАННЫХ ═══════════════ */
  loadProfile: async function (accountId) {
    try {
      var player = await apiGet("/players/" + accountId);
      if (!player || !player.profile) return { ok: false, reason: "hidden" };
      return { ok: true, player: player };
    } catch (e) {
      return { ok: false, reason: "error", msg: e.message || String(e) };
    }
  },

  loadRecentMatches: async function (accountId, limit) {
    try {
      var matches = await apiGet("/players/" + accountId + "/matches", { limit: limit || 20 });
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

  loadAll: async function (accountId) {
    if (this.cache && this.cache.accountId === accountId && (Date.now() - this.cacheTime) < this.CACHE_TTL) {
      return this.cache;
    }

    this.loading = true;

    var results = await Promise.all([
      this.loadProfile(accountId),
      this.loadRecentMatches(accountId, 20),
      this.loadHeroes(accountId),
      this.loadTotals(accountId),
      this.loadCounts(accountId)
    ]);

    this.loading = false;

    var profileRes = results[0];
    if (!profileRes.ok) {
      return { ok: false, reason: profileRes.reason, msg: profileRes.msg };
    }

    var data = {
      ok: true,
      accountId: accountId,
      player: profileRes.player,
      matches: results[1] || [],
      heroes: results[2] || [],
      totals: results[3] || [],
      counts: results[4] || {}
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

    var stats = {
      totalMatches: 0, wins: 0, losses: 0, winrate: 0,
      avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKDA: 0,
      avgGPM: 0, avgXPM: 0, avgLH: 0, avgDuration: 0,
      roleCounts: {}, favoriteRole: null,
      topHeroes: [], bestHero: null,
      recentForm: [], longestWinStreak: 0
    };

    if (!matches.length) return stats;

    var wins = 0, losses = 0;
    var sumK = 0, sumD = 0, sumA = 0, sumDur = 0;
    var roles = {}, form = [], longestW = 0, curW = 0;

    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var isRadiant = m.player_slot < 128;
      var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
      if (won) { wins++; curW++; if (curW > longestW) longestW = curW; }
      else { losses++; curW = 0; }
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

    var gpmTotal = 0, xpmTotal = 0, lhTotal = 0;
    for (var t = 0; t < totals.length; t++) {
      if (totals[t].field === "gold_per_min") gpmTotal = totals[t].sum / Math.max(totals[t].n, 1);
      if (totals[t].field === "xp_per_min") xpmTotal = totals[t].sum / Math.max(totals[t].n, 1);
      if (totals[t].field === "last_hits") lhTotal = totals[t].sum / Math.max(totals[t].n, 1);
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
    stats.avgGPM = Math.round(gpmTotal);
    stats.avgXPM = Math.round(xpmTotal);
    stats.avgLH = Math.round(lhTotal);
    stats.avgDuration = Math.round(sumDur / n / 60);
    stats.roleCounts = roles;
    stats.recentForm = form;
    stats.longestWinStreak = longestW;

    var bestRole = null, bestCount = 0;
    for (var r in roles) if (roles[r] > bestCount) { bestCount = roles[r]; bestRole = r; }
    stats.favoriteRole = bestRole;

    var bestHero = null, bestWR = 0;
    for (var h = 0; h < heroes.length; h++) {
      var hero = heroes[h];
      if (hero.games < 3) continue;
      var wr = hero.win / hero.games;
      if (wr > bestWR) { bestWR = wr; bestHero = hero; }
    }
    stats.bestHero = bestHero ? { heroId: bestHero.hero_id, games: bestHero.games, winrate: Math.round(bestWR * 100) } : null;

    var sortedHeroes = heroes.slice().sort(function (a, b) { return b.games - a.games; });
    stats.topHeroes = sortedHeroes.slice(0, 5).map(function (h) {
      return { heroId: h.hero_id, games: h.games, winrate: h.games ? Math.round((h.win / h.games) * 100) : 0 };
    });

    return stats;
  },

  /* ═══════════════ ОТРИСОВКА ═══════════════ */
  renderLockedCard: function () {
    var card = UI.card("🎮 Анализатор профиля");
    card.style.cssText = "text-align:center;padding:50px 30px;";
    card.appendChild(el("div", { style: "font-size:64px;margin-bottom:20px;opacity:0.5;" }, "🔒"));
    card.appendChild(el("div", { style: "font-size:18px;font-weight:800;color:var(--text);margin-bottom:8px;" }, "Только в JETCH+"));
    card.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.6;max-width:440px;margin:0 auto 20px;" },
      "Детальный анализ твоего профиля: винрейт, последние 20 матчей, избранная роль, любимые герои и средние метрики."));
    var btn = UI.btn("⚡ Активировать JETCH+");
    btn.addEventListener("click", function () { switchPage("settings"); });
    card.appendChild(btn);
    return card;
  },

  renderSetupCard: function () {
    var frag = document.createDocumentFragment();

    // ─── Заголовок ───
    var head = UI.card("🎮 Подключи Steam-аккаунт");
    head.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.6;margin-bottom:18px;" },
      "Чтобы видеть свою статистику — войди через Steam. Мы возьмём твой Steam ID и подтянем матчи из OpenDota."));

    // ─── Основная кнопка Steam ───
    var steamBtn = el("button", { type: "button" });
    steamBtn.style.cssText = "display:flex;align-items:center;justify-content:center;gap:14px;width:100%;padding:18px 24px;border-radius:14px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid rgba(102,192,244,0.6);background:linear-gradient(135deg,#1b2838,#2a475e);color:#fff;transition:transform 0.2s ease, filter 0.2s ease;box-shadow:0 12px 34px -14px rgba(102,192,244,0.9);";
    steamBtn.appendChild(el("div", { style: "font-size:26px;line-height:1;" }, "🎮"));
    steamBtn.appendChild(el("div", {}, "Войти через Steam"));
    steamBtn.addEventListener("mouseenter", function () { steamBtn.style.transform = "translateY(-2px)"; steamBtn.style.filter = "brightness(1.15)"; });
    steamBtn.addEventListener("mouseleave", function () { steamBtn.style.transform = "translateY(0)"; steamBtn.style.filter = "brightness(1)"; });
    steamBtn.addEventListener("click", function () { ProfileAnalyzer.loginViaSteam(); });
    head.appendChild(steamBtn);

    var note1 = el("div", { class: "dim", style: "font-size:10.5px;margin-top:12px;text-align:center;line-height:1.5;" },
      "Откроется страница Steam. Если ты уже залогинен — подтверди вход.");
    head.appendChild(note1);
    frag.appendChild(head);

    // ─── Ручной ввод (сворачиваемый) ───
    var manualWrap = UI.card("");
    var manualBtn = el("button", { type: "button" });
    manualBtn.style.cssText = "width:100%;padding:12px;border-radius:10px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text-muted);";
    manualBtn.textContent = "⌨️ Или ввести Steam ID вручную";
    manualWrap.appendChild(manualBtn);

    var manualForm = el("div", { style: "display:none;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);" });
    manualForm.appendChild(el("div", { class: "dim", style: "font-size:11.5px;line-height:1.6;margin-bottom:10px;" },
      "Steam64 ID (17 цифр, начинается с 7656119...) или Steam32 ID (короткий, 6-10 цифр). Найти можно в URL своего профиля на steamcommunity.com"));

    var inp = UI.input("76561198123456789");
    inp.id = "steamIdInput";
    inp.style.marginBottom = "8px";
    manualForm.appendChild(inp);

    var msgEl = el("div", { style: "font-size:11.5px;min-height:16px;margin-bottom:10px;line-height:1.5;" });
    manualForm.appendChild(msgEl);

    var saveBtn = UI.btn("🔗 Подключить");
    saveBtn.style.width = "100%";
    saveBtn.addEventListener("click", function () {
      var parsed = ProfileAnalyzer.parseSteamId(inp.value);
      if (!parsed.ok) { msgEl.textContent = "✕ " + parsed.msg; msgEl.style.color = "var(--red)"; return; }
      ProfileAnalyzer.saveId(parsed.accountId);
      msgEl.textContent = "✓ Подключено. Загружаю...";
      msgEl.style.color = "var(--green)";
      setTimeout(function () { switchPage("profile"); }, 400);
    });
    manualForm.appendChild(saveBtn);

    manualBtn.addEventListener("click", function () {
      var shown = manualForm.style.display === "block";
      manualForm.style.display = shown ? "none" : "block";
      manualBtn.textContent = shown ? "⌨️ Или ввести Steam ID вручную" : "▲ Скрыть ручной ввод";
    });

    manualWrap.appendChild(manualForm);
    frag.appendChild(manualWrap);

    // ─── Инфо-блок ───
    var infoCard = UI.card("💡 Полезно знать");
    var infoList = [
      "Публичные матчи должны быть включены (Dota 2 → Настройки → Соц. → «Публичные данные о матчах»).",
      "Если матчи не отображаются — включи и подожди 5-10 минут.",
      "Данные подтягиваются из OpenDota — обновление раз в 10 минут.",
      "Steam ID привязан к твоему аккаунту DOTA JETCH — никто другой его не увидит."
    ];
    for (var i = 0; i < infoList.length; i++) {
      infoCard.appendChild(el("div", { class: "dim", style: "font-size:11.5px;line-height:1.6;padding:3px 0;" }, "• " + infoList[i]));
    }
    frag.appendChild(infoCard);

    return frag;
  },

  renderPublicDataWarning: function () {
    var card = UI.card("");
    card.style.cssText = "background:linear-gradient(135deg,rgba(251,191,36,0.10),var(--bg-card));border-color:var(--gold);";
    var row = el("div", { style: "display:flex;align-items:flex-start;gap:14px;" });
    row.appendChild(el("div", { style: "font-size:28px;flex-shrink:0;" }, "⚠️"));
    var info = el("div", { style: "flex:1;" });
    info.appendChild(el("div", { style: "font-size:14px;font-weight:800;color:var(--gold);margin-bottom:6px;" }, "Публичные матчи отключены"));
    info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
      "Мы не можем найти твои матчи. Чтобы включить: Dota 2 → Настройки → Соц. → галочка «Публичные данные о матчах». После этого подожди 5-10 минут и нажми «Обновить»."));
    row.appendChild(info);
    card.appendChild(row);

    var btnRow = el("div", { style: "display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;" });

    var refreshBtn = UI.btn("🔄 Обновить", { variant: "ghost" });
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
      safelane: "Керри (Safe Lane)",
      mid: "Мид (Mid Lane)",
      offlane: "Оффлейн (Off Lane)",
      roam: "Роум (Roaming)",
      jungle: "Лес (Jungle)",
      unknown: "Неизвестно"
    }[key] || key;
  },

  metricTile: function (icon, label, value, sub, color) {
    var tile = el("div", { style: "background:linear-gradient(160deg,rgba(22,24,31,0.95),rgba(18,20,26,0.95));border:1px solid var(--border);border-radius:14px;padding:16px 18px;position:relative;overflow:hidden;" });
    tile.appendChild(el("div", { style: "position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg," + color + ",transparent);" }));

    var topRow = el("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:10px;" });
    topRow.appendChild(el("div", { style: "font-size:20px;" }, icon));
    topRow.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.14em;color:var(--text-muted);text-transform:uppercase;" }, label));
    tile.appendChild(topRow);

    tile.appendChild(el("div", { style: "font-size:26px;font-weight:900;color:" + color + ";font-variant-numeric:tabular-nums;line-height:1;" }, String(value)));
    if (sub) tile.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-top:6px;" }, sub));

    return tile;
  },

  /* ═══════════════ ГЛАВНЫЙ РЕНДЕР ═══════════════ */
  render: function () {
    var frag = document.createDocumentFragment();

    if (!this.hasAccess()) {
      frag.appendChild(this.renderLockedCard());
      return frag;
    }

    var accountId = this.getSavedId();

    if (!accountId) {
      var setupFrag = this.renderSetupCard();
      frag.appendChild(setupFrag);
      return frag;
    }

    // Скелет загрузки
    var loadingCard = UI.card("");
    loadingCard.style.cssText = "text-align:center;padding:50px 30px;";
    loadingCard.appendChild(el("div", { style: "font-size:48px;margin-bottom:14px;opacity:0.6;" }, "⏳"));
    loadingCard.appendChild(el("div", { class: "dim", style: "font-size:13px;" }, "Загружаю данные из OpenDota..."));
    frag.appendChild(loadingCard);

    setTimeout(async function () {
      var data = await ProfileAnalyzer.loadAll(accountId);

      // Ищем контейнер и заменяем содержимое
      var container = document.getElementById("pageContent");
      if (!container) return;
      container.innerHTML = "";

      if (!data.ok) {
        if (data.reason === "hidden") {
          container.appendChild(ProfileAnalyzer.renderPublicDataWarning());
        } else {
          var errCard = UI.card("Ошибка");
          errCard.appendChild(el("div", { style: "color:var(--red);font-size:12.5px;line-height:1.6;" },
            "Не удалось загрузить профиль: " + (data.msg || "неизвестная ошибка") + ". Проверь Steam ID или попробуй позже."));
          var resetBtn = UI.btn("Сменить Steam ID", { variant: "ghost" });
          resetBtn.style.marginTop = "12px";
          resetBtn.addEventListener("click", function () {
            ProfileAnalyzer.clearId();
            switchPage("profile");
          });
          errCard.appendChild(resetBtn);
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

    /* ─── Заголовок профиля ─── */
    var head = UI.card("");
    head.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.30),var(--bg-card));border-color:var(--accent);";
    var headRow = el("div", { style: "display:flex;align-items:center;gap:18px;flex-wrap:wrap;" });

    var av = el("div", { style: "width:96px;height:96px;border-radius:20px;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;border:2px solid rgba(167,139,250,0.6);display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:#fff;font-family:'JetBrains Mono',monospace;" });
    if (prof.avatarfull) av.style.backgroundImage = "url(" + prof.avatarfull + ")";
    else av.textContent = String(prof.personaname || "?").charAt(0).toUpperCase();
    headRow.appendChild(av);

    var info = el("div", { style: "flex:1;min-width:220px;" });
    info.appendChild(el("div", { style: "font-size:26px;font-weight:900;color:var(--text);line-height:1.15;" }, prof.personaname || "Неизвестный"));

    var badges = el("div", { class: "row", style: "margin-top:10px;flex-wrap:wrap;" });
    if (rank) {
      var rankNames = ["", "Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
      var rankName = rankNames[Math.floor(rank / 10)] || "?";
      badges.appendChild(UI.badge("🏆 " + rankName, "var(--gold)", "var(--gold-bg)"));
    }
    if (prof.loccountrycode) badges.appendChild(UI.badge("🌍 " + prof.loccountrycode, "var(--cyan)", "var(--cyan-bg)"));
    badges.appendChild(UI.badge("🆔 " + data.accountId, "var(--text-muted)", "var(--bg-elev)"));
    info.appendChild(badges);

    if (prof.profileurl) {
      var link = el("a", { href: prof.profileurl, target: "_blank", rel: "noopener", style: "display:inline-block;margin-top:10px;font-size:11.5px;color:var(--cyan);text-decoration:none;" }, "Открыть в Steam ↗");
      info.appendChild(link);
    }

    headRow.appendChild(info);

    var actions = el("div", { style: "display:flex;flex-direction:column;gap:8px;align-self:flex-start;" });
    var refreshBtn = UI.btn("🔄", { variant: "ghost" });
    refreshBtn.style.cssText = "padding:8px 14px;font-size:12px;";
    refreshBtn.title = "Обновить данные";
    refreshBtn.addEventListener("click", function () {
      ProfileAnalyzer.cache = null;
      ProfileAnalyzer.cacheTime = 0;
      switchPage("profile");
    });
    actions.appendChild(refreshBtn);

    var changeBtn = UI.btn("Сменить ID", { variant: "ghost" });
    changeBtn.style.cssText = "padding:8px 14px;font-size:12px;";
    changeBtn.addEventListener("click", function () {
      if (!confirm("Отключить текущий Steam ID?")) return;
      ProfileAnalyzer.clearId();
      switchPage("profile");
    });
    actions.appendChild(changeBtn);
    headRow.appendChild(actions);

    head.appendChild(headRow);
    frag.appendChild(head);

    /* ─── 6 метрик ─── */
    var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;" });
    grid.appendChild(this.metricTile("🏆", "Винрейт", s.winrate + "%", s.wins + "W · " + s.losses + "L",
      s.winrate >= 55 ? "var(--green)" : s.winrate >= 45 ? "var(--yellow)" : "var(--red)"));
    grid.appendChild(this.metricTile("📊", "KDA", s.avgKDA, s.avgKills + " / " + s.avgDeaths + " / " + s.avgAssists, "var(--cyan)"));
    grid.appendChild(this.metricTile("💰", "GPM", s.avgGPM, "средний", "var(--gold)"));
    grid.appendChild(this.metricTile("⚡", "XPM", s.avgXPM, "средний", "var(--accent-light)"));
    grid.appendChild(this.metricTile("⚔️", "Ластхиты", s.avgLH, "средние", "var(--cyan)"));
    grid.appendChild(this.metricTile("⏱️", "Длит. матча", s.avgDuration + " мин", "средняя", "var(--text-muted)"));
    frag.appendChild(grid);

    /* ─── Форма последних матчей ─── */
    if (s.recentForm && s.recentForm.length) {
      var formCard = UI.card("📈 Форма за последние " + s.recentForm.length + " матчей");
      var formRow = el("div", { style: "display:flex;gap:4px;flex-wrap:wrap;" });
      for (var fi = 0; fi < s.recentForm.length; fi++) {
        var isWin = s.recentForm[fi] === 1;
        formRow.appendChild(el("div", {
          style: "width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;font-family:'JetBrains Mono',monospace;" +
            (isWin ? "background:var(--green-bg);color:var(--green);border:1px solid var(--green);" : "background:var(--red-bg);color:var(--red);border:1px solid var(--red);")
        }, isWin ? "W" : "L"));
      }
      formCard.appendChild(formRow);

      var streakInfo = el("div", { class: "dim", style: "font-size:11.5px;margin-top:12px;" });
      streakInfo.textContent = "Лучшая серия побед за период: " + s.longestWinStreak + " подряд";
      formCard.appendChild(streakInfo);
      frag.appendChild(formCard);
    }

    /* ─── Избранная роль ─── */
    if (s.favoriteRole) {
      var roleCard = UI.card("🎯 Избранная роль");
      var roleRow = el("div", { style: "display:flex;align-items:center;gap:16px;flex-wrap:wrap;" });
      roleRow.appendChild(el("div", { style: "width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;" }, "🎮"));

      var roleInfo = el("div", { style: "flex:1;min-width:200px;" });
      roleInfo.appendChild(el("div", { style: "font-size:18px;font-weight:800;color:var(--text);" }, this.roleName(s.favoriteRole)));
      roleInfo.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:4px;" },
        "Матчей на роли: " + (s.roleCounts[s.favoriteRole] || 0) + " из " + s.totalMatches));
      roleRow.appendChild(roleInfo);
      roleCard.appendChild(roleRow);

      var roleBars = el("div", { style: "width:100%;margin-top:16px;" });
      var roleEntries = Object.keys(s.roleCounts).sort(function (a, b) { return s.roleCounts[b] - s.roleCounts[a]; });
      for (var ri = 0; ri < roleEntries.length; ri++) {
        var rk = roleEntries[ri];
        if (rk === "unknown" || s.roleCounts[rk] < 1) continue;
        var pct = Math.round((s.roleCounts[rk] / s.totalMatches) * 100);
        var barRow = el("div", { style: "margin-bottom:10px;" });
        barRow.appendChild(el("div", { style: "display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-bottom:4px;" },
          el("span", {}, this.roleName(rk)), el("span", { style: "font-family:'JetBrains Mono',monospace;" }, pct + "%")));
        var barBg = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;" });
        var barFill = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));border-radius:3px;transition:width 0.6s ease;" });
        barBg.appendChild(barFill);
        barRow.appendChild(barBg);
        roleBars.appendChild(barRow);
      }
      roleCard.appendChild(roleBars);
      frag.appendChild(roleCard);
    }

    /* ─── Топ-5 героев ─── */
    if (s.topHeroes && s.topHeroes.length) {
      var heroesCard = UI.card("🔥 Топ-5 героев");
      var heroesList = el("div", { style: "display:flex;flex-direction:column;gap:8px;" });
      for (var hi = 0; hi < s.topHeroes.length; hi++) {
        (function (h, idx) {
          var hRow = el("div", { style: "display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;" });
          hRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:var(--text-muted);width:24px;flex-shrink:0;" }, "#" + (idx + 1)));

          var heroImgWrap = el("div", { style: "flex-shrink:0;" });
          heroImgWrap.appendChild(heroImgEl({ id: h.heroId, name: "" }, 40));
          hRow.appendChild(heroImgWrap);

          var hInfo = el("div", { style: "flex:1;min-width:0;" });
          hInfo.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);" }, "Герой #" + h.heroId));
          hInfo.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-top:2px;" }, h.games + " матчей"));
          hRow.appendChild(hInfo);

          var wrColor = h.winrate >= 55 ? "var(--green)" : h.winrate >= 45 ? "var(--yellow)" : "var(--red)";
          hRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:" + wrColor + ";" }, h.winrate + "%"));
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

          var mRow = el("div", { style: "display:flex;align-items:center;gap:10px;padding:9px 11px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color 0.15s ease;" });
          mRow.addEventListener("mouseenter", function () { mRow.style.borderColor = "var(--accent)"; });
          mRow.addEventListener("mouseleave", function () { mRow.style.borderColor = "var(--border)"; });

          mRow.appendChild(el("div", { style: "width:8px;height:8px;border-radius:50%;flex-shrink:0;background:" + (won ? "var(--green)" : "var(--red)") + ";box-shadow:0 0 8px " + (won ? "var(--green)" : "var(--red)") + ";" }));

          var heroImg = el("div", { style: "flex-shrink:0;" });
          heroImg.appendChild(heroImgEl({ id: m.hero_id, name: "" }, 32));
          mRow.appendChild(heroImg);

          var mInfo = el("div", { style: "flex:1;min-width:0;" });
          mInfo.appendChild(el("div", { style: "font-size:12.5px;font-weight:700;color:var(--text);" }, "Матч #" + m.match_id));
          mInfo.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:2px;" }, durMin + " мин · " + (m.game_mode === 22 ? "Ranked" : "Игра")));
          mRow.appendChild(mInfo);

          var kda = (m.kills || 0) + "/" + (m.deaths || 0) + "/" + (m.assists || 0);
          mRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;color:" + (won ? "var(--green)" : "var(--red)") + ";" }, kda));

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
      console.log("🎮 Steam OpenID callback: steam64=" + callback.steam64 + " → account_id=" + callback.accountId);
      this.saveId(callback.accountId);
      this.cleanUrlAfterLogin();
      // Перезагружаемся чтобы SPA подхватил и показал страницу profile
      setTimeout(function () { location.reload(); }, 100);
    }
  }
};

/* Автозапуск при загрузке скрипта */
ProfileAnalyzer.init();

console.log("profile-analyzer v2.0 ready (Steam OpenID)");
