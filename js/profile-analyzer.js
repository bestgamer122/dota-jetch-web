/* DOTA JETCH — PROFILE ANALYZER v21.0 (Role Detector + DNA + Impact) */

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
    if (json.errors && json.errors.length) throw new Error("STRATZ GraphQL: " + json.errors[0].message);
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
    if (this.cache && this.cache.accountId === accountId && (Date.now() - this.cacheTime) < this.CACHE_TTL) return this.cache;
    this.loading = true;

    var query = `
      query Player($id: Long!) {
        player(steamAccountId: $id) {
          steamAccountId
          matchCount
          winCount
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
              heroDamage
              towerDamage
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
        start_time: m.startDateTime || 0,
        hero_damage: me ? me.heroDamage : 0,
        tower_damage: me ? me.towerDamage : 0
      };
    });

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
        }
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

  // Role Detector v6 — умная классификация на основе относительного фарма
  classifyRole: function (match, allMatches) {
    var lane = match.position || 0;

    var teamGPM = allMatches.map(function (x) { return x.gold_per_min || 0; });
    var teamXPM = allMatches.map(function (x) { return x.xp_per_min || 0; });
    var teamLH = allMatches.map(function (x) { return x.last_hits || 0; });

    function rank(val, arr) {
      if (!arr.length) return 0.5;
      var sorted = arr.slice().sort(function (a, b) { return a - b; });
      var idx = sorted.indexOf(val);
      return idx < 0 ? 0.5 : idx / (sorted.length - 1 || 1);
    }

    var g = rank(match.gold_per_min, teamGPM);
    var x = rank(match.xp_per_min, teamXPM);
    var lh = rank(match.last_hits, teamLH);

    var coreRank = g * 0.45 + x * 0.25 + lh * 0.30;

    if (lane === 2) return (coreRank < 0.35) ? 4 : 2;
    if (lane === 1) return coreRank >= 0.56 ? 1 : 5;
    if (lane === 3) return coreRank >= 0.52 ? 3 : 4;
    if (lane === 4 || lane === 0) {
      if (coreRank >= 0.70) return 1;
      if (coreRank >= 0.52) return 3;
      return 5;
    }
    return lane;
  },

  computeStats: function (data) {
    var matches = data.matches || [];
    var heroes = data.heroes || [];
    var wl = data.wl || {};

    var stats = {
      totalMatches: 0, wins: 0, losses: 0, winrate: 0,
      avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKDA: 0,
      avgGPM: 0, avgXPM: 0, avgLH: 0, avgDuration: 0,
      roleCounts: {}, favoriteRole: null, roleWinrates: {},
      topHeroes: [], bestHero: null, worstHero: null,
      recentForm: [], longestWinStreak: 0, longestLoseStreak: 0,
      totalLifetime: 0, lifetimeWinrate: 0, lifetimeGames: 0,
      rankedCount: 0, turboCount: 0,
      bestWorstThreshold: 10
    };

    if (wl.win !== undefined && wl.lose !== undefined) {
      stats.totalLifetime = wl.win + wl.lose;
      stats.lifetimeWinrate = stats.totalLifetime > 0 ? Math.round((wl.win / stats.totalLifetime) * 100) : 0;
      stats.lifetimeGames = stats.totalLifetime;
    }

    /* Best/worst — умный fallback по порогу игр */
    var thresholds = [10, 5, 3, 2];
    var bestHero = null, worstHero = null;
    var usedThreshold = 10;
    for (var ti = 0; ti < thresholds.length; ti++) {
      var th = thresholds[ti];
      var pool = heroes.filter(function (h) { return h.games >= th; });
      if (pool.length < 2) continue;
      var b = pool[0], w = pool[0];
      for (var pi = 1; pi < pool.length; pi++) {
        var wrb = b.win / b.games, wrw = w.win / w.games, wrx = pool[pi].win / pool[pi].games;
        if (wrx > wrb) b = pool[pi];
        if (wrx < wrw) w = pool[pi];
      }
      if (b !== w) {
        bestHero = b;
        worstHero = w;
        usedThreshold = th;
        break;
      }
    }
    stats.bestHero = bestHero ? { heroId: bestHero.hero_id, games: bestHero.games, winrate: Math.round((bestHero.win / bestHero.games) * 100) } : null;
    stats.worstHero = worstHero ? { heroId: worstHero.hero_id, games: worstHero.games, winrate: Math.round((worstHero.win / worstHero.games) * 100) } : null;
    stats.bestWorstThreshold = usedThreshold;

    /* Топ-5 по винрейту */
    var heroesForTop = heroes.filter(function (h) { return h.games >= 3; });
    var sortedByWinrate = heroesForTop.slice().sort(function (a, b) {
      var wa = a.win / a.games, wb = b.win / b.games;
      if (wa !== wb) return wb - wa;
      return b.games - a.games;
    });
    stats.topHeroes = sortedByWinrate.slice(0, 5).map(function (h) {
      return { heroId: h.hero_id, games: h.games, winrate: Math.round((h.win / h.games) * 100) };
    });

    if (!matches.length) return stats;

    var wins = 0, losses = 0;
    var sumK = 0, sumD = 0, sumA = 0, sumGPM = 0, sumXPM = 0, sumLH = 0, sumDur = 0;
    var roles = {}, roleWins = {}, form = [];
    var longestW = 0, longestL = 0, curW = 0, curL = 0;
    var ranked = 0, turbo = 0;

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

      if (m.game_mode === 22) ranked++;
      else if (m.game_mode === 23) turbo++;

      var detectedRole = this.classifyRole(m, matches);
      if (detectedRole >= 1 && detectedRole <= 5) {
        roles[detectedRole] = (roles[detectedRole] || 0) + 1;
        if (won) roleWins[detectedRole] = (roleWins[detectedRole] || 0) + 1;
      }
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
    stats.rankedCount = ranked;
    stats.turboCount = turbo;

    for (var rk in roles) {
      if (roles[rk] >= 2) {
        stats.roleWinrates[rk] = Math.round((roleWins[rk] || 0) / roles[rk] * 100);
      }
    }

    var bestPos = 0, bestCount = 0;
    for (var rp in roles) if (roles[rp] > bestCount) { bestCount = roles[rp]; bestPos = parseInt(rp, 10); }
    stats.favoriteRole = bestPos > 0 ? bestPos : null;

    return stats;
  },

  // Player DNA — определение игрового стиля
  computePlayerDNA: function (stats) {
    var gpm = parseFloat(stats.avgGPM) || 0;
    var xpm = parseFloat(stats.avgXPM) || 0;
    var lh = parseFloat(stats.avgLH) || 0;
    var deaths = parseFloat(stats.avgDeaths) || 0;
    var kda = parseFloat(stats.avgKDA) || 0;

    function score(value, low, high) {
      if (!isFinite(value)) return null;
      return Math.max(0, Math.min(100, ((value - low) / (high - low)) * 100));
    }

    var farm = (score(gpm, 300, 700) + score(lh, 2, 8) + score(xpm, 300, 700)) / 3;
    var fight = (score(kda, 2, 12) + score(stats.avgAssists || 0, 3, 15)) / 2;
    var survival = score(deaths, 10, 2);

    var role = stats.favoriteRole || 1;
    var dna = [];

    if (role === 1) {
      if (farm >= 70 && survival >= 60) dna.push({ label: "RESOURCE CARRY", desc: "Ты раскрываешься через фарм и поздние тайминги." });
      else if (fight >= 65) dna.push({ label: "FIGHTING CARRY", desc: "Ты не ждёшь лейта, а конвертируешь фарм в драки." });
      else dna.push({ label: "BALANCED CARRY", desc: "Смешанный керри-профиль." });
    } else if (role === 2) {
      if (farm >= 70 && fight >= 65) dna.push({ label: "TEMPO MID", desc: "Ты создаёшь преимущество через темп и драки." });
      else dna.push({ label: "FLEX MID", desc: "Мид-профиль смешанный." });
    } else if (role === 3) {
      if (fight >= 70 && survival >= 60) dna.push({ label: "FRONTLINE INITIATOR", desc: "Твой стиль — начинать драки." });
      else dna.push({ label: "UTILITY OFFLANER", desc: "Ты играешь от пользы для команды." });
    } else if (role === 4 || role === 5) {
      if (fight >= 65) dna.push({ label: "TEMPO SUPPORT", desc: "Раннее давление через ганги и драки." });
      else dna.push({ label: "UTILITY SUPPORT", desc: "Стабильная помощь команде и карте." });
    }

    return dna;
  },

  // Impact Score — оценка влияния на игру
  computeImpactScore: function (match) {
    var kda = (match.kills + match.assists) / Math.max(match.deaths, 1);
    var dur = Math.max(match.duration / 60, 1);
    var hd = (match.hero_damage || 0) / dur;
    var td = (match.tower_damage || 0) / dur;

    function score(v, lo, hi) {
      return Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
    }

    var impact = (score(kda, 1, 6) * 0.35 + score(hd, 150, 650) * 0.40 + score(td, 0, 180) * 0.25);
    return Math.round(impact);
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
      "Получим твой Steam ID и загрузим статистику."));
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
    var m = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;padding:9px 11px;position:relative;overflow:hidden;" });
    m.appendChild(el("div", { style: "position:absolute;top:0;left:0;width:3px;height:100%;background:" + color + ";" }));
    var top = el("div", { style: "display:flex;align-items:center;gap:6px;margin-bottom:3px;" });
    top.appendChild(el("span", { style: "font-size:12px;" }, icon));
    top.appendChild(el("span", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:var(--text-muted);text-transform:uppercase;" }, label));
    m.appendChild(top);
    m.appendChild(el("div", { style: "font-size:18px;font-weight:900;color:" + color + ";font-variant-numeric:tabular-nums;line-height:1.1;" }, String(value)));
    if (sub) m.appendChild(el("div", { class: "dim", style: "font-size:9.5px;margin-top:2px;" }, sub));
    return m;
  },

  heroCard: function (heroId, games, winrate, label, color, bg) {
    var box = el("div", { style: "display:flex;align-items:center;gap:10px;padding:10px 12px;background:" + bg + ";border:1px solid " + color + ";border-radius:10px;position:relative;overflow:hidden;" });
    box.appendChild(heroImgEl({ id: heroId, name: ProfileAnalyzer.heroNameById(heroId) }, 42));
    var info = el("div", { style: "min-width:0;flex:1;" });
    info.appendChild(el("div", { style: "font-size:9px;font-weight:800;letter-spacing:0.08em;color:" + color + ";text-transform:uppercase;" }, label));
    info.appendChild(el("div", { style: "font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.15;" }, ProfileAnalyzer.heroNameById(heroId)));
    info.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:1px;" }, games + " игр"));
    box.appendChild(info);
    box.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:900;color:" + color + ";" }, winrate + "%"));
    return box;
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
        if (data.reason === "hidden") {
          container.appendChild(ProfileAnalyzer.renderHiddenCard());
        } else {
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
        if (typeof window.processNode === "function") {
          setTimeout(function () { window.processNode(container); }, 20);
        }
        return;
      }

      var dash = ProfileAnalyzer.renderDashboard(data);
      container.appendChild(dash);

      if (typeof window.processNode === "function") {
        setTimeout(function () { window.processNode(container); }, 20);
      }
    }, 30);

    return frag;
  },

  renderDashboard: function (data) {
    var frag = document.createDocumentFragment();
    var s = data.stats;
    var p = data.player;
    var prof = p.profile || {};

    /* ═══════ ШАПКА ═══════ */
    var head = el("div", { style: "position:relative;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:linear-gradient(135deg,rgba(139,92,246,0.22),rgba(34,211,238,0.08),var(--bg-card));border:1px solid var(--accent);border-radius:14px;padding:14px 18px;margin-bottom:12px;" });

    var av = el("div", { style: "width:64px;height:64px;border-radius:16px;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;border:2px solid rgba(167,139,250,0.7);" });
    if (prof.avatarfull) av.style.backgroundImage = "url(" + prof.avatarfull + ")";
    head.appendChild(av);

    var info = el("div", { style: "flex:1;min-width:180px;" });
    info.appendChild(el("div", { style: "font-size:19px;font-weight:900;color:var(--text);line-height:1.15;" }, prof.personaname || "Игрок"));

    var metaRow = el("div", { style: "display:flex;gap:10px;margin-top:5px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);" });
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

    /* ═══════ МЕТРИКИ ═══════ */
    var metricsGrid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px;" });
    if (s.totalMatches > 0) {
      metricsGrid.appendChild(this.metric("🏆", "Винрейт", s.winrate + "%", s.wins + "W / " + s.losses + "L",
        s.winrate >= 55 ? "var(--green)" : s.winrate >= 45 ? "var(--yellow)" : "var(--red)"));
      metricsGrid.appendChild(this.metric("⚔️", "KDA", s.avgKDA, s.avgKills + "/" + s.avgDeaths + "/" + s.avgAssists, "var(--cyan)"));
      metricsGrid.appendChild(this.metric("💰", "GPM", s.avgGPM, "средн.", "var(--gold)"));
      metricsGrid.appendChild(this.metric("⚡", "XPM", s.avgXPM, "средн.", "var(--accent-light)"));
      metricsGrid.appendChild(this.metric("🎯", "ЛХ", s.avgLH, "средн.", "var(--cyan)"));
      metricsGrid.appendChild(this.metric("⏱️", "Длит.", s.avgDuration + "м", "средн.", "var(--text-muted)"));
    }
    frag.appendChild(metricsGrid);

    /* ═══════ PLAYER DNA ═══════ */
    if (s.totalMatches > 0) {
      var dna = this.computePlayerDNA(s);
      if (dna.length) {
        var dnaCard = UI.card("🧬 Твой игровой стиль");
        dnaCard.style.cssText += "padding:14px 16px;margin-bottom:12px;";
        dna.forEach(function (item) {
          var row = el("div", { style: "display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;" });
          row.appendChild(el("div", { style: "padding:4px 10px;background:var(--accent-bg);border:1px solid var(--accent);border-radius:8px;font-size:11px;font-weight:900;color:var(--accent-light);white-space:nowrap;" }, item.label));
          row.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);line-height:1.5;" }, item.desc));
          dnaCard.appendChild(row);
        });
        frag.appendChild(dnaCard);
      }
    }

    /* ═══════ BEST/WORST + ТОП-5 ═══════ */
    var twoCol = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
    if (window.innerWidth < 700) twoCol.style.gridTemplateColumns = "1fr";

    var bwCard = UI.card("⚔️ Лучший / Худший" + (s.bestWorstThreshold && s.bestWorstThreshold !== 10 ? " (" + s.bestWorstThreshold + "+ игр)" : ""));
    bwCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
    var bwCol = el("div", { style: "display:flex;flex-direction:column;gap:8px;" });
    if (s.bestHero) {
      bwCol.appendChild(this.heroCard(s.bestHero.heroId, s.bestHero.games, s.bestHero.winrate, "Лучший", "var(--green)", "var(--green-bg)"));
    }
    if (s.worstHero) {
      bwCol.appendChild(this.heroCard(s.worstHero.heroId, s.worstHero.games, s.worstHero.winrate, "Слабый", "var(--red)", "var(--red-bg)"));
    }
    if (!s.bestHero && !s.worstHero) {
      bwCol.appendChild(el("div", { class: "dim", style: "text-align:center;font-size:11.5px;padding:16px 0;" }, "Мало данных — сыграй больше игр на одном герое"));
    }
    bwCard.appendChild(bwCol);
    twoCol.appendChild(bwCard);

    var topCard = UI.card("🏆 Топ-5 по винрейту");
    topCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
    if (s.topHeroes && s.topHeroes.length) {
      var topList = el("div", { style: "display:flex;flex-direction:column;gap:5px;" });
      for (var hi = 0; hi < s.topHeroes.length; hi++) {
        (function (h, idx) {
          var r = el("div", { style: "display:flex;align-items:center;gap:9px;padding:5px 7px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;" });
          var badgeColor = idx === 0 ? "linear-gradient(135deg,#fbbf24,#d97706)" : idx === 1 ? "linear-gradient(135deg,#d1d5db,#6b7280)" : idx === 2 ? "linear-gradient(135deg,#d97706,#7c2d12)" : "var(--bg-card)";
          var badgeText = idx < 3 ? "#0b0c10" : "var(--text-muted)";
          var b = el("div", { style: "width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;font-family:'JetBrains Mono',monospace;flex-shrink:0;background:" + badgeColor + ";color:" + badgeText + (idx >= 3 ? ";border:1px solid var(--border);" : ";") }, String(idx + 1));
          r.appendChild(b);
          r.appendChild(heroImgEl({ id: h.heroId, name: ProfileAnalyzer.heroNameById(h.heroId) }, 26));
          var info = el("div", { style: "flex:1;min-width:0;" });
          info.appendChild(el("div", { style: "font-size:11.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" }, ProfileAnalyzer.heroNameById(h.heroId)));
          info.appendChild(el("div", { class: "dim", style: "font-size:9px;" }, h.games + " игр"));
          r.appendChild(info);
          var wrColor = h.winrate >= 55 ? "var(--green)" : h.winrate >= 45 ? "var(--yellow)" : "var(--red)";
          r.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:900;color:" + wrColor + ";" }, h.winrate + "%"));
          topList.appendChild(r);
        })(s.topHeroes[hi], hi);
      }
      topCard.appendChild(topList);
    } else {
      topCard.appendChild(el("div", { class: "dim", style: "text-align:center;font-size:11.5px;padding:16px 0;" }, "Нет данных"));
    }
    twoCol.appendChild(topCard);
    frag.appendChild(twoCol);

    /* ═══════ ФОРМА + ПОЗИЦИИ ═══════ */
    var twoCol2 = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;" });
    if (window.innerWidth < 700) twoCol2.style.gridTemplateColumns = "1fr";

    if (s.recentForm && s.recentForm.length) {
      var formCard = UI.card("📈 Форма");
      formCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
      var formRow = el("div", { style: "display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px;" });
      for (var fi = 0; fi < s.recentForm.length; fi++) {
        var isWin = s.recentForm[fi] === 1;
        formRow.appendChild(el("div", {
          style: "width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;font-family:'JetBrains Mono',monospace;" +
            (isWin ? "background:var(--green-bg);color:var(--green);border:1px solid var(--green);" : "background:var(--red-bg);color:var(--red);border:1px solid var(--red);")
        }, isWin ? "W" : "L"));
      }
      formCard.appendChild(formRow);
      var ss = el("div", { style: "display:flex;gap:14px;font-size:11px;" });
      ss.appendChild(el("span", { style: "color:var(--green);font-weight:700;" }, "🔥 " + s.longestWinStreak + " W"));
      ss.appendChild(el("span", { style: "color:var(--red);font-weight:700;" }, "❄ " + s.longestLoseStreak + " L"));
      if (s.rankedCount > 0) ss.appendChild(el("span", { class: "dim" }, "🏅 Ranked: " + s.rankedCount));
      if (s.turboCount > 0) ss.appendChild(el("span", { class: "dim" }, "⚡ Turbo: " + s.turboCount));
      formCard.appendChild(ss);
      twoCol2.appendChild(formCard);
    }

    if (s.favoriteRole) {
      var roleCard = UI.card("🎯 Позиции");
      roleCard.style.cssText += "padding:12px 14px;margin-bottom:0;";
      var bars = el("div", { style: "display:flex;flex-direction:column;gap:5px;" });
      var roleEntries = Object.keys(s.roleCounts).sort(function (a, b) { return s.roleCounts[b] - s.roleCounts[a]; });
      for (var rj = 0; rj < roleEntries.length; rj++) {
        var rk = parseInt(roleEntries[rj], 10);
        var cnt = s.roleCounts[roleEntries[rj]];
        var pct = Math.round((cnt / s.totalMatches) * 100);
        var wr = s.roleWinrates[rk];
        var isFav = rk === s.favoriteRole;
        var row = el("div", { style: "display:flex;align-items:center;gap:8px;font-size:11px;" });
        row.appendChild(el("span", { style: "width:16px;font-size:13px;" }, this.roleIcon(rk)));
        var nameEl = el("span", { style: "flex:1;font-weight:" + (isFav ? "800" : "500") + ";color:" + (isFav ? "var(--text)" : "var(--text-muted)") + ";" }, this.roleName(rk));
        row.appendChild(nameEl);
        var bg = el("div", { style: "width:56px;height:5px;background:var(--bg-elev);border-radius:3px;overflow:hidden;" });
        var fl = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));" });
        bg.appendChild(fl);
        row.appendChild(bg);
        row.appendChild(el("span", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--text);width:30px;text-align:right;" }, pct + "%"));
        if (wr !== undefined) {
          var wrColor = wr >= 55 ? "var(--green)" : wr >= 45 ? "var(--yellow)" : "var(--red)";
          row.appendChild(el("span", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:" + wrColor + ";width:32px;text-align:right;" }, "WR " + wr + "%"));
        }
        bars.appendChild(row);
      }
      roleCard.appendChild(bars);
      twoCol2.appendChild(roleCard);
    }
    frag.appendChild(twoCol2);

    /* ═══════ МАТЧИ ═══════ */
    if (data.matches && data.matches.length) {
      var matchesCard = UI.card("📜 Последние " + data.matches.length + " матчей");
      matchesCard.style.cssText += "padding:12px 14px;";
      matchesCard.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-bottom:8px;" }, "Кликни «Анализ» — откроется разбор матча."));

      var list = el("div", { style: "display:flex;flex-direction:column;gap:4px;" });
      for (var mi = 0; mi < data.matches.length; mi++) {
        (function (m) {
          var isRadiant = m.player_slot < 128;
          var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
          var durMin = Math.round(m.duration / 60);

          var mRow = el("div", { style: "display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;transition:border-color 0.12s ease;" });
          mRow.addEventListener("mouseenter", function () { mRow.style.borderColor = "var(--accent)"; });
          mRow.addEventListener("mouseleave", function () { mRow.style.borderColor = "var(--border)"; });

          mRow.appendChild(el("div", { style: "width:3px;height:26px;border-radius:2px;flex-shrink:0;background:" + (won ? "var(--green)" : "var(--red)") + ";" }));
          mRow.appendChild(heroImgEl({ id: m.hero_id, name: ProfileAnalyzer.heroNameById(m.hero_id) }, 26));

          var info = el("div", { style: "flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;" });
          info.appendChild(el("div", { style: "font-size:11px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" }, ProfileAnalyzer.heroNameById(m.hero_id)));
          info.appendChild(el("div", { class: "dim", style: "font-size:9px;" }, durMin + "м · " + (m.position ? "Поз. " + m.position : "—")));
          mRow.appendChild(info);

          var kdaColor = won ? "var(--green)" : "var(--red)";
          mRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:800;color:" + kdaColor + ";text-align:right;min-width:50px;" }, m.kills + "/" + m.deaths + "/" + m.assists));

          var impact = ProfileAnalyzer.computeImpactScore(m);
          var impactColor = impact >= 70 ? "var(--green)" : impact >= 40 ? "var(--yellow)" : "var(--red)";
          mRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:800;color:" + impactColor + ";min-width:36px;text-align:center;", title: "Impact Score" }, String(impact)));

          var aBtn = el("button", { type: "button" });
          aBtn.style.cssText = "padding:4px 9px;border-radius:6px;font-size:10px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--accent);background:rgba(139,92,246,0.10);color:var(--accent-light);white-space:nowrap;";
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

console.log("profile-analyzer v21.0 ready (Role Detector + DNA + Impact)");
