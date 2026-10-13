/* DOTA JETCH — PROFILE ANALYZER v17.0 (winrate-based heroes + rank display) */

var ProfileAnalyzer = {
  cache: null,
  cacheTime: 0,
  CACHE_TTL: 10 * 60 * 1000,
  loading: false,
  heroesById: null,

  STRATZ_ENDPOINT: "https://api.stratz.com/graphql",
  STRATZ_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiMDU0OGI4YWQtN2ZmOC00YzczLTljODAtNDM2NDNiYTdmYWUwIiwiU3RlYW1JZCI6IjExMzUyNTQ1MDEiLCJBUElVc2VyIjoidHJ1ZSIsIm5iZiI6MTc5MTkwMDg4OCwiZXhwIjoxODIzNDM2ODg4LCJpYXQiOjE3OTE5MDA4ODgsImlzcyI6Imh0dHBzOi8vYXBpLnN0cmF0ei5jb20ifQ.BA03Klw7gTTzsi6NvVahT85LjqJtl9wi0sOm_fCI6KU",
  STEAM_OPENID_URL: "https://steamcommunity.com/openid/login",

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
    return { steam64: m[1], accountId: this.steam64ToAccountId(m[1]) };
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

  stratzQuery: async function (query, variables) {
    var res = await fetch(this.STRATZ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.STRATZ_TOKEN,
        "User-Agent": "STRATZ_API"
      },
      body: JSON.stringify({ query: query, variables: variables || {} })
    });
    if (!res.ok) {
      var txt = "";
      try { txt = await res.text(); } catch (e) {}
      throw new Error("STRATZ HTTP " + res.status + ": " + txt.slice(0, 300));
    }
    var json = await res.json();
    if (json.errors && json.errors.length) {
      throw new Error("STRATZ GraphQL: " + json.errors[0].message);
    }
    return json.data;
  },

  loadHeroes: async function () {
    if (this.heroesById) return this.heroesById;
    try {
      var heroes = await getHeroes();
      var map = {};
      for (var i = 0; i < heroes.length; i++) map[heroes[i].id] = heroes[i];
      this.heroesById = map;
      return map;
    } catch (e) { return {}; }
  },

  heroNameById: function (id) {
    if (!this.heroesById || !this.heroesById[id]) return "Герой #" + id;
    return this.heroesById[id].name || "Герой #" + id;
  },

  loadAll: async function (accountId) {
    if (this.cache && this.cache.accountId === accountId && (Date.now() - this.cacheTime) < this.CACHE_TTL) {
      return this.cache;
    }
    this.loading = true;
    console.log("[PA-STRATZ] ЗАГРУЗКА account_id=" + accountId);

    var query = `
      query Player($id: Long!) {
        player(steamAccountId: $id) {
          steamAccountId
          matchCount
          winCount
          rank
          behaviorScore
          steamAccount {
            name
            avatar
            profileUri
            countryCode
            isAnonymous
          }
          matches(request: { take: 50 }) {
            id
            startDateTime
            durationSeconds
            didRadiantWin
            gameMode
            players(steamAccountId: $id) {
              heroId
              isRadiant
              kills
              deaths
              assists
              goldPerMinute
              experiencePerMinute
              numLastHits
              position
            }
          }
        }
      }
    `;

    var data;
    try {
      data = await this.stratzQuery(query, { id: Number(accountId) });
    } catch (e) {
      this.loading = false;
      console.warn("[PA-STRATZ] error:", e);
      return { ok: false, reason: "error", msg: e.message || String(e), accountId: accountId };
    }
    this.loading = false;

    if (!data || !data.player) return { ok: false, reason: "hidden", accountId: accountId };
    var p = data.player;
    var steamAccount = p.steamAccount || {};

    if (steamAccount.isAnonymous || (!steamAccount.name && !p.matchCount)) {
      return { ok: false, reason: "hidden", accountId: accountId, player: { profile: { personaname: steamAccount.name } } };
    }

    await this.loadHeroes();
    var self = this;

    var matches = (p.matches || []).map(function (m) {
      var me = (m.players && m.players.length) ? m.players[0] : null;
      return {
        match_id: m.id,
        duration: m.durationSeconds || 0,
        radiant_win: !!m.didRadiantWin,
        game_mode: self._stratzModeToDota(m.gameMode),
        player_slot: me ? (me.isRadiant ? 0 : 128) : 0,
        hero_id: me ? me.heroId : 0,
        kills: me ? me.kills : 0,
        deaths: me ? me.deaths : 0,
        assists: me ? me.assists : 0,
        gold_per_min: me ? me.goldPerMinute : 0,
        xp_per_min: me ? me.experiencePerMinute : 0,
        last_hits: me ? me.numLastHits : 0,
        position: me ? self._parsePosition(me.position) : 0,
        start_time: m.startDateTime || 0
      };
    });

    /* Строим статистику по героям из matches */
    var heroMap = {};
    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      if (!m.hero_id) continue;
      var isRadiant = m.player_slot < 128;
      var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
      if (!heroMap[m.hero_id]) heroMap[m.hero_id] = { hero_id: m.hero_id, games: 0, win: 0 };
      heroMap[m.hero_id].games++;
      if (won) heroMap[m.hero_id].win++;
    }
    var heroes = [];
    for (var k in heroMap) if (heroMap.hasOwnProperty(k)) heroes.push(heroMap[k]);

    var result = {
      ok: true,
      accountId: accountId,
      player: {
        profile: {
          personaname: steamAccount.name || "Игрок",
          avatarfull: steamAccount.avatar || null,
          profileurl: steamAccount.profileUri || null,
          loccountrycode: steamAccount.countryCode || null
        },
        rank_tier: p.rank || 0
      },
      behavior: p.behaviorScore || 0,
      heroes: heroes,
      matches: matches
    };
    result.wl = { win: p.winCount || 0, lose: (p.matchCount || 0) - (p.winCount || 0) };
    result.stats = this.computeStats(result);

    this.cache = result;
    this.cacheTime = Date.now();
    return result;
  },

  _parsePosition: function (pos) {
    if (!pos) return 0;
    if (typeof pos === "number") return pos;
    var s = String(pos).toUpperCase();
    var m = s.match(/POSITION_?(\d)/);
    if (m) return parseInt(m[1], 10);
    m = s.match(/[1-5]/);
    if (m) return parseInt(m[0], 10);
    return 0;
  },

  _stratzModeToDota: function (stratzMode) {
    if (!stratzMode) return 22;
    var m = String(stratzMode).toUpperCase();
    if (m.indexOf("RANKED") >= 0) return 22;
    if (m.indexOf("TURBO") >= 0) return 23;
    if (m.indexOf("SINGLE") >= 0) return 4;
    if (m.indexOf("RANDOM") >= 0) return 3;
    if (m.indexOf("CAPTAINS") >= 0) return 2;
    return 22;
  },

  rankName: function (rank) {
    if (!rank) return null;
    var names = ["", "Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
    var tier = Math.floor(rank / 10);
    if (tier < 1) tier = 1;
    if (tier > 8) tier = 8;
    return names[tier] || null;
  },

  computeStats: function (data) {
    var matches = data.matches || [];
    var heroes = data.heroes || [];
    var wl = data.wl || {};

    var stats = {
      totalMatches: 0, wins: 0, losses: 0, winrate: 0,
      avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKDA: 0,
      avgGPM: 0, avgXPM: 0, avgLH: 0, avgDuration: 0,
      roleCounts: {}, favoriteRole: null,
      topHeroes: [], bestHero: null, worstHero: null,
      recentForm: [], longestWinStreak: 0, longestLoseStreak: 0,
      totalLifetime: 0, lifetimeWinrate: 0, lifetimeGames: 0
    };

    if (wl.win !== undefined && wl.lose !== undefined) {
      stats.totalLifetime = wl.win + wl.lose;
      stats.lifetimeWinrate = stats.totalLifetime > 0 ? Math.round((wl.win / stats.totalLifetime) * 100) : 0;
      stats.lifetimeGames = stats.totalLifetime;
    }

    /* Best/worst — по винрейту, минимум 10 игр */
    var minGames = 10;
    var heroesForPick = heroes.filter(function (h) { return h.games >= minGames; });
    /* Если меньше 2 героев с 10+ играми — снижаем порог до 5 */
    if (heroesForPick.length < 2) {
      minGames = 5;
      heroesForPick = heroes.filter(function (h) { return h.games >= minGames; });
    }
    var bestHero = null, bestWR = -1;
    var worstHero = null, worstWR = 2;
    for (var i = 0; i < heroesForPick.length; i++) {
      var h = heroesForPick[i];
      var wr = h.win / h.games;
      if (wr > bestWR) { bestWR = wr; bestHero = h; }
      if (wr < worstWR) { worstWR = wr; worstHero = h; }
    }
    stats.bestHero = bestHero ? { heroId: bestHero.hero_id, games: bestHero.games, winrate: Math.round(bestWR * 100) } : null;
    stats.worstHero = worstHero && worstHero !== bestHero ? { heroId: worstHero.hero_id, games: worstHero.games, winrate: Math.round(worstWR * 100) } : null;

    /* Топ-5 героев — по винрейту (минимум 5 игр) */
    var heroesForTop = heroes.filter(function (h) { return h.games >= 5; });
    var sortedByWinrate = heroesForTop.slice().sort(function (a, b) {
      return (b.win / b.games) - (a.win / a.games);
    });
    stats.topHeroes = sortedByWinrate.slice(0, 5).map(function (h) {
      return { heroId: h.hero_id, games: h.games, winrate: h.games ? Math.round((h.win / h.games) * 100) : 0 };
    });

    if (!matches.length) return stats;

    var wins = 0, losses = 0;
    var sumK = 0, sumD = 0, sumA = 0, sumGPM = 0, sumXPM = 0, sumLH = 0, sumDur = 0;
    var roles = {}, form = [];
    var longestW = 0, longestL = 0, curW = 0, curL = 0;

    for (var j = 0; j < matches.length; j++) {
      var m = matches[j];
      var isRadiant = m.player_slot < 128;
      var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
      if (won) { wins++; curW++; curL = 0; if (curW > longestW) longestW = curW; }
      else { losses++; curL++; curW = 0; if (curL > longestL) longestL = curL; }
      form.push(won ? 1 : 0);

      sumK += m.kills;
      sumD += m.deaths;
      sumA += m.assists;
      sumGPM += m.gold_per_min;
      sumXPM += m.xp_per_min;
      sumLH += m.last_hits;
      sumDur += m.duration;

      var p = m.position || 0;
      if (p >= 1 && p <= 5) roles[p] = (roles[p] || 0) + 1;
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
    stats.avgGPM = Math.round(sumGPM / n);
    stats.avgXPM = Math.round(sumXPM / n);
    stats.avgLH = Math.round(sumLH / n);
    stats.avgDuration = Math.round(sumDur / n / 60);
    stats.roleCounts = roles;
    stats.recentForm = form;
    stats.longestWinStreak = longestW;
    stats.longestLoseStreak = longestL;

    var bestPos = 0, bestCount = 0;
    for (var rk in roles) if (roles[rk] > bestCount) { bestCount = roles[rk]; bestPos = parseInt(rk, 10); }
    stats.favoriteRole = bestPos > 0 ? bestPos : null;

    return stats;
  },

  renderLockedCard: function () {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:60px 30px;";
    card.appendChild(el("div", { style: "font-size:72px;line-height:1;margin-bottom:20px;opacity:0.85;" }, "🔒"));
    card.appendChild(el("div", { style: "font-size:20px;font-weight:900;color:var(--text);margin-bottom:8px;" }, "Только в JETCH+"));
    card.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.6;max-width:400px;margin:0 auto 20px;" },
      "Детальный анализ профиля с полной статистикой за 50 матчей."));
    var btn = UI.btn("⚡ Активировать JETCH+");
    btn.addEventListener("click", function () { switchPage("settings"); });
    card.appendChild(btn);
    return card;
  },

  renderLoginCard: function () {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:60px 30px;";
    card.appendChild(el("div", { style: "font-size:72px;line-height:1;margin-bottom:20px;" }, "🎮"));
    card.appendChild(el("div", { style: "font-size:20px;font-weight:900;color:var(--text);margin-bottom:8px;" }, "Войди через Steam"));
    card.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.6;max-width:380px;margin:0 auto 24px;" },
      "Получим твой Steam ID и загрузим статистику через STRATZ."));
    var steamBtn = el("button", { type: "button" });
    steamBtn.style.cssText = "display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:16px 32px;border-radius:12px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid rgba(102,192,244,0.6);background:linear-gradient(135deg,#1b2838,#2a475e);color:#fff;box-shadow:0 10px 30px -12px rgba(102,192,244,0.9);";
    steamBtn.appendChild(el("div", { style: "font-size:22px;line-height:1;" }, "🎮"));
    steamBtn.appendChild(el("div", {}, "Войти через Steam"));
    steamBtn.addEventListener("click", function () { ProfileAnalyzer.loginViaSteam(); });
    card.appendChild(steamBtn);
    return card;
  },

  renderHiddenCard: function () {
    var card = UI.card("");
    card.style.cssText = "text-align:center;padding:44px 26px;";
    card.appendChild(el("div", { style: "font-size:72px;line-height:1;margin-bottom:16px;" }, "🔒"));
    card.appendChild(el("div", { style: "font-size:20px;font-weight:900;color:var(--gold);margin-bottom:8px;" }, "Публичные матчи выключены"));
    card.appendChild(el("div", { class: "dim", style: "font-size:13px;line-height:1.6;max-width:420px;margin:0 auto 20px;" },
      "Включи в Dota 2 → Настройки → Соц. → «Публичные данные о матчах», сыграй 1 матч, подожди 10 мин."));
    var btnRow = el("div", { style: "display:flex;gap:8px;justify-content:center;flex-wrap:wrap;" });
    var refreshBtn = UI.btn("🔄 Обновить");
    refreshBtn.addEventListener("click", function () {
      ProfileAnalyzer.cache = null;
      ProfileAnalyzer.cacheTime = 0;
      switchPage("profile");
    });
    btnRow.appendChild(refreshBtn);
    var changeBtn = UI.btn("Сменить аккаунт", { variant: "ghost" });
    changeBtn.addEventListener("click", function () {
      if (!confirm("Отключить Steam ID?")) return;
      ProfileAnalyzer.clearId();
      switchPage("profile");
    });
    btnRow.appendChild(changeBtn);
    card.appendChild(btnRow);
    return card;
  },

  roleName: function (p) {
    return { 1: "Керри", 2: "Мид", 3: "Оффлейн", 4: "Роум", 5: "Сапорт" }[p] || "—";
  },
  roleIcon: function (p) {
    return { 1: "🗡️", 2: "🔮", 3: "🛡️", 4: "🏃", 5: "💚" }[p] || "🎮";
  },

  formatBehavior: function (b) {
    if (!b) return null;
    if (b >= 10000) return "10k+";
    if (b >= 1000) return (b / 1000).toFixed(1) + "k";
    return String(b);
  },

  metric: function (icon, label, value, sub, color) {
    var m = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;padding:10px 12px;position:relative;overflow:hidden;" });
    m.appendChild(el("div", { style: "position:absolute;top:0;left:0;width:3px;height:100%;background:" + color + ";" }));
    var top = el("div", { style: "display:flex;align-items:center;gap:6px;margin-bottom:4px;" });
    top.appendChild(el("span", { style: "font-size:13px;" }, icon));
    top.appendChild(el("span", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:var(--text-muted);text-transform:uppercase;" }, label));
    m.appendChild(top);
    m.appendChild(el("div", { style: "font-size:19px;font-weight:900;color:" + color + ";font-variant-numeric:tabular-nums;line-height:1.1;" }, String(value)));
    if (sub) m.appendChild(el("div", { class: "dim", style: "font-size:9.5px;margin-top:2px;" }, sub));
    return m;
  },

  goToAnalyze: function (matchId, heroId) {
    switchPage("analyze");
    setTimeout(function () {
      var idInp = qs("#matchIdInput");
      var hInp = qs("#heroInput");
      var heroName = ProfileAnalyzer.heroNameById(heroId);
      if (idInp) idInp.value = String(matchId);
      if (hInp) hInp.value = heroName;
      var btn = qs("#analyzeBtn");
      if (btn && !btn.disabled) btn.click();
    }, 150);
  },

  render: function () {
    var frag = document.createDocumentFragment();
    if (!this.hasAccess()) { frag.appendChild(this.renderLockedCard()); return frag; }
    var accountId = this.getSavedId();
    if (!accountId) { frag.appendChild(this.renderLoginCard()); return frag; }

    var loadingCard = UI.card("");
    loadingCard.style.cssText = "text-align:center;padding:50px 26px;";
    loadingCard.appendChild(el("div", { style: "font-size:42px;margin-bottom:10px;opacity:0.6;" }, "⏳"));
    loadingCard.appendChild(el("div", { class: "dim", style: "font-size:12.5px;" }, "Загружаю профиль..."));
    frag.appendChild(loadingCard);

    setTimeout(async function () {
      var data = await ProfileAnalyzer.loadAll(accountId);
      var container = document.getElementById("pageContent");
      if (!container) return;
      container.innerHTML = "";

      if (!data.ok) {
        if (data.reason === "hidden") container.appendChild(ProfileAnalyzer.renderHiddenCard());
        else {
          var errCard = UI.card("Ошибка");
          errCard.appendChild(el("div", { style: "color:var(--red);font-size:12.5px;line-height:1.6;" },
            "Не удалось загрузить: " + (data.msg || "неизвестная ошибка")));
          var retryBtn = UI.btn("🔄 Повторить", { variant: "ghost" });
          retryBtn.style.marginTop = "10px";
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
    }, 30);

    return frag;
  },

  renderDashboard: function (data) {
    var frag = document.createDocumentFragment();
    var s = data.stats;
    var p = data.player;
    var prof = p.profile || {};

    /* ═══════ КОМПАКТНАЯ ШАПКА ═══════ */
    var head = el("div", { style: "position:relative;display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(34,211,238,0.10),var(--bg-card));border:1px solid var(--accent);border-radius:16px;padding:16px 20px;margin-bottom:14px;" });

    var av = el("div", { style: "width:72px;height:72px;border-radius:18px;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;border:2px solid rgba(167,139,250,0.7);box-shadow:0 6px 20px -6px rgba(139,92,246,0.7);" });
    if (prof.avatarfull) av.style.backgroundImage = "url(" + prof.avatarfull + ")";
    head.appendChild(av);

    var info = el("div", { style: "flex:1;min-width:180px;" });
    var nameRow = el("div", { style: "display:flex;align-items:center;gap:10px;flex-wrap:wrap;" });
    nameRow.appendChild(el("div", { style: "font-size:20px;font-weight:900;color:var(--text);line-height:1.15;letter-spacing:-0.01em;" }, prof.personaname || "Игрок"));
    var rankName = this.rankName(p.rank_tier);
    if (rankName) {
      nameRow.appendChild(el("div", { style: "padding:3px 9px;border-radius:7px;font-size:10px;font-weight:800;letter-spacing:0.06em;background:var(--gold-bg);border:1px solid var(--gold);color:var(--gold);text-transform:uppercase;" }, rankName));
    }
    info.appendChild(nameRow);

    var metaRow = el("div", { style: "display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);" });
    metaRow.appendChild(el("span", {}, "🆔 " + data.accountId));
    if (prof.loccountrycode) metaRow.appendChild(el("span", {}, "🌍 " + prof.loccountrycode));
    if (s.lifetimeGames > 0) metaRow.appendChild(el("span", {}, "🎮 " + s.lifetimeGames + " игр"));
    var behStr = this.formatBehavior(data.behavior);
    if (behStr) metaRow.appendChild(el("span", { style: "color:var(--green);font-weight:700;" }, "🎭 " + behStr));
    if (s.lifetimeWinrate > 0) metaRow.appendChild(el("span", {}, "🏆 WR " + s.lifetimeWinrate + "%"));
    if (prof.profileurl) {
      var link = el("a", { href: prof.profileurl, target: "_blank", rel: "noopener", style: "color:var(--cyan);text-decoration:none;font-weight:600;" }, "Steam ↗");
      metaRow.appendChild(link);
    }
    info.appendChild(metaRow);
    head.appendChild(info);

    var actions = el("div", { style: "display:flex;gap:6px;align-self:flex-start;" });
    var refreshBtn = UI.btn("🔄", { variant: "ghost" });
    refreshBtn.style.cssText = "padding:7px 12px;font-size:12px;";
    refreshBtn.title = "Обновить";
    refreshBtn.addEventListener("click", function () {
      ProfileAnalyzer.cache = null;
      ProfileAnalyzer.cacheTime = 0;
      switchPage("profile");
    });
    actions.appendChild(refreshBtn);
    var changeBtn = UI.btn("Сменить", { variant: "ghost" });
    changeBtn.style.cssText = "padding:7px 12px;font-size:11.5px;";
    changeBtn.addEventListener("click", function () {
      if (!confirm("Отключить текущий Steam ID?")) return;
      ProfileAnalyzer.clearId();
      switchPage("profile");
    });
    actions.appendChild(changeBtn);
    head.appendChild(actions);
    frag.appendChild(head);

    /* ═══════ СЕТКА МЕТРИК ═══════ */
    var metricsGrid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:12px;" });
    if (s.totalMatches > 0) {
      metricsGrid.appendChild(this.metric("🏆", "Винрейт", s.winrate + "%", s.wins + "W / " + s.losses + "L",
        s.winrate >= 55 ? "var(--green)" : s.winrate >= 45 ? "var(--yellow)" : "var(--red)"));
      metricsGrid.appendChild(this.metric("⚔️", "KDA", s.avgKDA, s.avgKills + "/" + s.avgDeaths + "/" + s.avgAssists, "var(--cyan)"));
    }
    if (s.avgGPM > 0) metricsGrid.appendChild(this.metric("💰", "GPM", s.avgGPM, "средн.", "var(--gold)"));
    if (s.avgXPM > 0) metricsGrid.appendChild(this.metric("⚡", "XPM", s.avgXPM, "средн.", "var(--accent-light)"));
    if (s.avgLH > 0) metricsGrid.appendChild(this.metric("🎯", "ЛХ", s.avgLH, "средн.", "var(--cyan)"));
    if (s.avgDuration > 0) metricsGrid.appendChild(this.metric("⏱️", "Длит.", s.avgDuration + "м", "средн.", "var(--text-muted)"));
    frag.appendChild(metricsGrid);

    /* ═══════ 2 КОЛОНКИ: СИЛЬНЫЕ/СЛАБЫЕ + ТОП ГЕРОЕВ ═══════ */
    var twoCol = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
    if (window.innerWidth < 700) twoCol.style.gridTemplateColumns = "1fr";

    /* Сильные / слабые */
    var bwCard = UI.card("⚔️ Лучший / Худший герой (10+ игр)");
    bwCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
    var bwRow = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:8px;" });

    if (s.bestHero) {
      var bb = el("div", { style: "display:flex;align-items:center;gap:10px;padding:10px;background:var(--green-bg);border:1px solid var(--green);border-radius:10px;" });
      bb.appendChild(heroImgEl({ id: s.bestHero.heroId, name: "" }, 40));
      var bbI = el("div", { style: "min-width:0;flex:1;" });
      bbI.appendChild(el("div", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:var(--green);text-transform:uppercase;" }, "Лучший"));
      bbI.appendChild(el("div", { style: "font-size:15px;font-weight:900;color:var(--green);font-family:'JetBrains Mono',monospace;line-height:1.1;" }, s.bestHero.winrate + "%"));
      bbI.appendChild(el("div", { class: "dim", style: "font-size:10px;" }, s.bestHero.games + " игр"));
      bb.appendChild(bbI);
      bwRow.appendChild(bb);
    }
    if (s.worstHero) {
      var wb = el("div", { style: "display:flex;align-items:center;gap:10px;padding:10px;background:var(--red-bg);border:1px solid var(--red);border-radius:10px;" });
      wb.appendChild(heroImgEl({ id: s.worstHero.heroId, name: "" }, 40));
      var wbI = el("div", { style: "min-width:0;flex:1;" });
      wbI.appendChild(el("div", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:var(--red);text-transform:uppercase;" }, "Слабый"));
      wbI.appendChild(el("div", { style: "font-size:15px;font-weight:900;color:var(--red);font-family:'JetBrains Mono',monospace;line-height:1.1;" }, s.worstHero.winrate + "%"));
      wbI.appendChild(el("div", { class: "dim", style: "font-size:10px;" }, s.worstHero.games + " игр"));
      wb.appendChild(wbI);
      bwRow.appendChild(wb);
    } else {
      bwRow.appendChild(el("div", { class: "dim", style: "grid-column:span 2;text-align:center;font-size:11px;padding:12px 0;" }, "Слабых героев не найдено"));
    }
    bwCard.appendChild(bwRow);
    twoCol.appendChild(bwCard);

    /* Топ героев — по винрейту */
    var topCard = UI.card("🏆 Топ-5 героев по винрейту");
    topCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
    if (s.topHeroes && s.topHeroes.length) {
      var topList = el("div", { style: "display:flex;flex-direction:column;gap:5px;" });
      for (var hi = 0; hi < s.topHeroes.length; hi++) {
        (function (h, idx) {
          var r = el("div", { style: "display:flex;align-items:center;gap:10px;padding:6px 8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;" });
          var badgeColor = idx === 0 ? "linear-gradient(135deg,#fbbf24,#d97706)" : idx === 1 ? "linear-gradient(135deg,#d1d5db,#6b7280)" : idx === 2 ? "linear-gradient(135deg,#d97706,#7c2d12)" : "var(--bg-card)";
          var badgeText = idx < 3 ? "#0b0c10" : "var(--text-muted)";
          var b = el("div", { style: "width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;font-family:'JetBrains Mono',monospace;flex-shrink:0;background:" + badgeColor + ";color:" + badgeText + (idx >= 3 ? ";border:1px solid var(--border);" : ";") }, String(idx + 1));
          r.appendChild(b);
          r.appendChild(heroImgEl({ id: h.heroId, name: "" }, 28));
          var info = el("div", { style: "flex:1;min-width:0;" });
          info.appendChild(el("div", { style: "font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" }, ProfileAnalyzer.heroNameById(h.heroId)));
          info.appendChild(el("div", { class: "dim", style: "font-size:9.5px;" }, h.games + " игр"));
          r.appendChild(info);
          var wrColor = h.winrate >= 55 ? "var(--green)" : h.winrate >= 45 ? "var(--yellow)" : "var(--red)";
          r.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:900;color:" + wrColor + ";" }, h.winrate + "%"));
          topList.appendChild(r);
        })(s.topHeroes[hi], hi);
      }
      topCard.appendChild(topList);
    } else {
      topCard.appendChild(el("div", { class: "dim", style: "text-align:center;font-size:11px;padding:12px 0;" }, "Нет данных"));
    }
    twoCol.appendChild(topCard);
    frag.appendChild(twoCol);

    /* ═══════ ФОРМА + РОЛИ ═══════ */
    var twoCol2 = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
    if (window.innerWidth < 700) twoCol2.style.gridTemplateColumns = "1fr";

    if (s.recentForm && s.recentForm.length) {
      var formCard = UI.card("📈 Форма");
      formCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
      var formRow = el("div", { style: "display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px;" });
      for (var fi = 0; fi < s.recentForm.length; fi++) {
        var isWin = s.recentForm[fi] === 1;
        formRow.appendChild(el("div", {
          style: "width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;font-family:'JetBrains Mono',monospace;" +
            (isWin ? "background:var(--green-bg);color:var(--green);border:1px solid var(--green);" : "background:var(--red-bg);color:var(--red);border:1px solid var(--red);")
        }, isWin ? "W" : "L"));
      }
      formCard.appendChild(formRow);
      var ss = el("div", { style: "display:flex;gap:12px;font-size:11px;" });
      ss.appendChild(el("span", { style: "color:var(--green);" }, "🔥 Серия побед: " + s.longestWinStreak));
      ss.appendChild(el("span", { style: "color:var(--red);" }, "❄ Серия лузов: " + s.longestLoseStreak));
      formCard.appendChild(ss);
      twoCol2.appendChild(formCard);
    }

    if (s.favoriteRole) {
      var roleCard = UI.card("🎯 Позиции");
      roleCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
      var roleRow = el("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:8px;" });
      roleRow.appendChild(el("div", { style: "width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:18px;" }, this.roleIcon(s.favoriteRole)));
      var ri = el("div", { style: "flex:1;" });
      ri.appendChild(el("div", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:var(--text-muted);text-transform:uppercase;" }, "Избранная"));
      ri.appendChild(el("div", { style: "font-size:15px;font-weight:900;color:var(--text);" }, this.roleName(s.favoriteRole)));
      roleRow.appendChild(ri);
      roleCard.appendChild(roleRow);

      var bars = el("div", { style: "display:flex;flex-direction:column;gap:4px;" });
      var roleEntries = Object.keys(s.roleCounts).sort(function (a, b) { return s.roleCounts[b] - s.roleCounts[a]; });
      for (var rj = 0; rj < roleEntries.length; rj++) {
        var rk = parseInt(roleEntries[rj], 10);
        var cnt = s.roleCounts[roleEntries[rj]];
        var pct = Math.round((cnt / s.totalMatches) * 100);
        var row = el("div", { style: "display:flex;align-items:center;gap:8px;font-size:11px;" });
        row.appendChild(el("span", { style: "width:16px;" }, this.roleIcon(rk)));
        row.appendChild(el("span", { style: "flex:1;color:var(--text-muted);" }, this.roleName(rk)));
        var bg = el("div", { style: "width:60px;height:5px;background:var(--bg-elev);border-radius:3px;overflow:hidden;" });
        var fl = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));" });
        bg.appendChild(fl);
        row.appendChild(bg);
        row.appendChild(el("span", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--text);width:32px;text-align:right;" }, pct + "%"));
        bars.appendChild(row);
      }
      roleCard.appendChild(bars);
      twoCol2.appendChild(roleCard);
    }
    frag.appendChild(twoCol2);

    /* ═══════ ПОСЛЕДНИЕ 50 МАТЧЕЙ ═══════ */
    if (data.matches && data.matches.length) {
      var matchesCard = UI.card("📜 Последние " + data.matches.length + " матчей");
      matchesCard.style.cssText += "padding:12px 14px;";
      matchesCard.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-bottom:8px;" }, "Кликни «Анализировать» — сразу откроется разбор матча."));

      var list = el("div", { style: "display:flex;flex-direction:column;gap:4px;" });
      for (var mi = 0; mi < data.matches.length; mi++) {
        (function (m) {
          var isRadiant = m.player_slot < 128;
          var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
          var durMin = Math.round(m.duration / 60);

          var mRow = el("div", { style: "display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;transition:border-color 0.12s ease;" });
          mRow.addEventListener("mouseenter", function () { mRow.style.borderColor = "var(--accent)"; });
          mRow.addEventListener("mouseleave", function () { mRow.style.borderColor = "var(--border)"; });

          mRow.appendChild(el("div", { style: "width:3px;height:28px;border-radius:2px;flex-shrink:0;background:" + (won ? "var(--green)" : "var(--red)") + ";" }));
          mRow.appendChild(heroImgEl({ id: m.hero_id, name: "" }, 28));

          var info = el("div", { style: "flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;" });
          info.appendChild(el("div", { style: "font-size:11.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" }, ProfileAnalyzer.heroNameById(m.hero_id)));
          info.appendChild(el("div", { class: "dim", style: "font-size:9.5px;" }, durMin + "м · " + (m.position ? "Поз. " + m.position : "—")));
          mRow.appendChild(info);

          var kdaColor = won ? "var(--green)" : "var(--red)";
          mRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;color:" + kdaColor + ";text-align:right;min-width:52px;" }, m.kills + "/" + m.deaths + "/" + m.assists));

          var aBtn = el("button", { type: "button" });
          aBtn.style.cssText = "padding:5px 10px;border-radius:6px;font-size:10.5px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--accent);background:rgba(139,92,246,0.10);color:var(--accent-light);white-space:nowrap;";
          aBtn.textContent = "Анализ";
          aBtn.addEventListener("mouseenter", function () { aBtn.style.background = "var(--accent)"; aBtn.style.color = "#fff"; });
          aBtn.addEventListener("mouseleave", function () { aBtn.style.background = "rgba(139,92,246,0.10)"; aBtn.style.color = "var(--accent-light)"; });
          aBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            ProfileAnalyzer.goToAnalyze(m.match_id, m.hero_id);
          });
          mRow.appendChild(aBtn);

          list.appendChild(mRow);
        })(data.matches[mi]);
      }
      matchesCard.appendChild(list);
      frag.appendChild(matchesCard);
    }

    return frag;
  },

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

console.log("profile-analyzer v17.0 ready (winrate heroes + rank)");
