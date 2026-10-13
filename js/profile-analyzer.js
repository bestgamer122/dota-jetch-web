/* DOTA JETCH — PROFILE ANALYZER v13.0 (STRATZ: heroPerformance + правильные поля) */

var ProfileAnalyzer = {
  cache: null,
  cacheTime: 0,
  CACHE_TTL: 10 * 60 * 1000,
  loading: false,

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
          behaviorScore
          steamAccount {
            name
            avatar
            profileUri
            countryCode
            isAnonymous
          }
          heroPerformance(take: 30) {
            heroId
            matchCount
            winCount
            kills
            deaths
            assists
            goldPerMinute
            experiencePerMinute
            numLastHits
            numDenies
          }
          matches(request: { take: 30 }) {
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

    if (!data || !data.player) {
      return { ok: false, reason: "hidden", accountId: accountId };
    }

    var p = data.player;
    var steamAccount = p.steamAccount || {};

    if (steamAccount.isAnonymous || (!steamAccount.name && !p.matchCount)) {
      return { ok: false, reason: "hidden", accountId: accountId, player: { profile: { personaname: steamAccount.name } } };
    }

    var self = this;

    var result = {
      ok: true,
      accountId: accountId,
      player: {
        profile: {
          personaname: steamAccount.name || "Игрок",
          avatarfull: steamAccount.avatar || null,
          profileurl: steamAccount.profileUri || ("https://steamcommunity.com/profiles/" + (BigInt(accountId) + BigInt("76561197960265728")).toString()),
          loccountrycode: steamAccount.countryCode || null
        },
        rank_tier: 0
      },
      behavior: p.behaviorScore || 0,
      leaderboardRank: 0,
      heroes: (p.heroPerformance || []).map(function (h) {
        return {
          hero_id: h.heroId,
          games: h.matchCount || 0,
          win: h.winCount || 0,
          avgKills: h.kills || 0,
          avgDeaths: h.deaths || 0,
          avgAssists: h.assists || 0,
          avgGPM: h.goldPerMinute || 0,
          avgXPM: h.experiencePerMinute || 0,
          avgLH: h.numLastHits || 0
        };
      }),
      matches: (p.matches || []).map(function (m) {
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
          position: me ? me.position : null,
          start_time: m.startDateTime || 0
        };
      })
    };

    result.wl = { win: p.winCount || 0, lose: (p.matchCount || 0) - (p.winCount || 0) };
    result.totals = [];

    result.stats = this.computeStats(result);

    this.cache = result;
    this.cacheTime = Date.now();
    return result;
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
      totalLifetime: 0, lifetimeWins: 0, lifetimeWinrate: 0,
      lifetimeGames: 0
    };

    if (wl.win !== undefined && wl.lose !== undefined) {
      stats.lifetimeWins = wl.win;
      stats.totalLifetime = wl.win + wl.lose;
      stats.lifetimeWinrate = stats.totalLifetime > 0 ? Math.round((wl.win / stats.totalLifetime) * 100) : 0;
      stats.lifetimeGames = stats.totalLifetime;
    }

    var sumG = 0, sumX = 0, sumL = 0, sumK = 0, sumD = 0, sumA = 0, tot = 0;
    for (var hg = 0; hg < heroes.length; hg++) {
      var hero = heroes[hg];
      var games = hero.games || 0;
      if (games === 0) continue;
      sumG += (hero.avgGPM || 0) * games;
      sumX += (hero.avgXPM || 0) * games;
      sumL += (hero.avgLH || 0) * games;
      sumK += (hero.avgKills || 0) * games;
      sumD += (hero.avgDeaths || 0) * games;
      sumA += (hero.avgAssists || 0) * games;
      tot += games;
    }
    if (tot > 0) {
      stats.avgGPM = Math.round(sumG / tot);
      stats.avgXPM = Math.round(sumX / tot);
      stats.avgLH = Math.round(sumL / tot);
      stats.avgKills = (sumK / tot).toFixed(1);
      stats.avgDeaths = (sumD / tot).toFixed(1);
      stats.avgAssists = (sumA / tot).toFixed(1);
      stats.avgKDA = ((sumK + sumA) / Math.max(sumD, 1)).toFixed(2);
    }

    if (!matches.length) {
      stats.topHeroes = heroes.slice().sort(function (a, b) { return b.games - a.games; }).slice(0, 8).map(function (h) {
        return { heroId: h.hero_id, games: h.games, winrate: h.games ? Math.round((h.win / h.games) * 100) : 0 };
      });
      var bestH = null, bestWR = 0, worstH = null, worstWR = 1;
      for (var hh = 0; hh < heroes.length; hh++) {
        if (heroes[hh].games < 3) continue;
        var w = heroes[hh].win / heroes[hh].games;
        if (w > bestWR) { bestWR = w; bestH = heroes[hh]; }
        if (w < worstWR) { worstWR = w; worstH = heroes[hh]; }
      }
      stats.bestHero = bestH ? { heroId: bestH.hero_id, games: bestH.games, winrate: Math.round(bestWR * 100) } : null;
      stats.worstHero = worstH ? { heroId: worstH.hero_id, games: worstH.games, winrate: Math.round(worstWR * 100) } : null;
      return stats;
    }

    var wins = 0, losses = 0;
    var sumDur = 0;
    var roles = {}, form = [];
    var longestW = 0, longestL = 0, curW = 0, curL = 0;

    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var isRadiant = m.player_slot < 128;
      var won = (m.radiant_win && isRadiant) || (!m.radiant_win && !isRadiant);
      if (won) { wins++; curW++; curL = 0; if (curW > longestW) longestW = curW; }
      else { losses++; curL++; curW = 0; if (curL > longestL) longestL = curL; }
      form.push(won ? 1 : 0);

      sumDur += (m.duration || 0);

      var roleKey = "unknown";
      if (m.position === 1) roleKey = "safelane";
      else if (m.position === 2) roleKey = "mid";
      else if (m.position === 3) roleKey = "offlane";
      else if (m.position === 4) roleKey = "roam";
      else if (m.position === 5) roleKey = "safelane5";
      roles[roleKey] = (roles[roleKey] || 0) + 1;
    }

    var n = matches.length;
    stats.totalMatches = n;
    stats.wins = wins;
    stats.losses = losses;
    stats.winrate = n > 0 ? Math.round((wins / n) * 100) : 0;
    stats.avgDuration = Math.round(sumDur / n / 60);
    stats.roleCounts = roles;
    stats.recentForm = form;
    stats.longestWinStreak = longestW;
    stats.longestLoseStreak = longestL;

    var merged = {};
    for (var r in roles) {
      var k = r;
      if (r === "safelane5") k = "roam";
      merged[k] = (merged[k] || 0) + roles[r];
    }
    stats.roleCounts = merged;
    var bestRole = null, bestCount = 0;
    for (var r2 in merged) if (merged[r2] > bestCount) { bestCount = merged[r2]; bestRole = r2; }
    stats.favoriteRole = bestRole;

    var bestHero = null, bestWR = 0;
    var worstHero = null, worstWR = 1;
    for (var h = 0; h < heroes.length; h++) {
      var hero2 = heroes[h];
      if (hero2.games < 3) continue;
      var wr = hero2.win / hero2.games;
      if (wr > bestWR) { bestWR = wr; bestHero = hero2; }
      if (wr < worstWR) { worstWR = wr; worstHero = hero2; }
    }
    stats.bestHero = bestHero ? { heroId: bestHero.hero_id, games: bestHero.games, winrate: Math.round(bestWR * 100) } : null;
    stats.worstHero = worstHero ? { heroId: worstHero.hero_id, games: worstHero.games, winrate: Math.round(worstWR * 100) } : null;

    var sortedHeroes = heroes.slice().sort(function (a, b) { return b.games - a.games; });
    stats.topHeroes = sortedHeroes.slice(0, 8).map(function (h) {
      return { heroId: h.hero_id, games: h.games, winrate: h.games ? Math.round((h.win / h.games) * 100) : 0 };
    });

    return stats;
  },

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
      "Получим твой Steam ID и загрузим полную статистику через STRATZ."));

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
      "STRATZ не видит твои матчи. Чтобы включить — нужно:"));

    var steps = el("div", { style: "max-width:440px;margin:0 auto 24px;text-align:left;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:18px 22px;" });
    var stepsList = [
      "Открой Dota 2 → Настройки → Социальные",
      "Поставь галочку «Публичные данные о матчах»",
      "Сыграй 1 любой матч — чтобы сервер увидел",
      "Подожди 10-15 минут и нажми «Обновить»"
    ];
    for (var i = 0; i < stepsList.length; i++) {
      var step = el("div", { style: "display:flex;gap:12px;align-items:flex-start;padding:7px 0;font-size:13px;color:var(--text-muted);line-height:1.5;" });
      step.appendChild(el("div", { style: "width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold);font-family:'JetBrains Mono',monospace;" }, String(i + 1)));
      step.appendChild(el("div", {}, stepsList[i]));
      steps.appendChild(step);
    }
    card.appendChild(steps);

    var btnRow = el("div", { style: "display:flex;gap:10px;justify-content:center;flex-wrap:wrap;" });

    var refreshBtn = UI.btn("🔄 Обновить");
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
    return { safelane: "Керри", mid: "Мид", offlane: "Оффлейн", roam: "Роум / Сапорт", jungle: "Лес", unknown: "Другое" }[key] || key;
  },

  roleIcon: function (key) {
    return { safelane: "🗡️", mid: "🔮", offlane: "🛡️", roam: "🏃", jungle: "🌲", unknown: "🎮" }[key] || "🎮";
  },

  metricTile: function (icon, label, value, sub, color) {
    var tile = el("div", { style: "background:linear-gradient(160deg,rgba(22,24,31,0.95),rgba(18,20,26,0.95));border:1px solid var(--border);border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;transition:transform 0.25s ease, border-color 0.25s ease;" });
    tile.appendChild(el("div", { style: "position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg," + color + ",transparent);" }));

    var topRow = el("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:14px;" });
    var icoBox = el("div", { style: "width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(139,92,246,0.12);border:1px solid " + color + ";" }, icon);
    topRow.appendChild(icoBox);
    topRow.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.14em;color:var(--text-muted);text-transform:uppercase;" }, label));
    tile.appendChild(topRow);

    tile.appendChild(el("div", { style: "font-size:32px;font-weight:900;color:" + color + ";font-variant-numeric:tabular-nums;line-height:1;letter-spacing:-0.02em;" }, String(value)));
    if (sub) tile.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:8px;line-height:1.4;" }, sub));

    tile.addEventListener("mouseenter", function () { tile.style.transform = "translateY(-3px)"; tile.style.borderColor = color; });
    tile.addEventListener("mouseleave", function () { tile.style.transform = "translateY(0)"; tile.style.borderColor = "var(--border)"; });

    return tile;
  },

  render: function () {
    var frag = document.createDocumentFragment();

    if (!this.hasAccess()) { frag.appendChild(this.renderLockedCard()); return frag; }

    var accountId = this.getSavedId();
    if (!accountId) { frag.appendChild(this.renderLoginCard()); return frag; }

    var loadingCard = UI.card("");
    loadingCard.style.cssText = "text-align:center;padding:60px 30px;";
    loadingCard.appendChild(el("div", { style: "font-size:48px;margin-bottom:14px;opacity:0.6;" }, "⏳"));
    loadingCard.appendChild(el("div", { class: "dim", style: "font-size:13px;" }, "Загружаю данные из STRATZ..."));
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

    var head = el("div", { style: "position:relative;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,rgba(139,92,246,0.35),rgba(34,211,238,0.15),var(--bg-card));border:1px solid var(--accent);padding:28px;margin-bottom:18px;" });
    var headRow = el("div", { style: "position:relative;display:flex;align-items:center;gap:22px;flex-wrap:wrap;" });

    var av = el("div", { style: "width:110px;height:110px;border-radius:24px;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;border:3px solid rgba(167,139,250,0.7);box-shadow:0 10px 40px -10px rgba(139,92,246,0.7);flex-shrink:0;" });
    if (prof.avatarfull) av.style.backgroundImage = "url(" + prof.avatarfull + ")";
    headRow.appendChild(av);

    var info = el("div", { style: "flex:1;min-width:220px;" });
    var nameRow = el("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap;" });
    nameRow.appendChild(el("div", { style: "font-size:30px;font-weight:900;color:var(--text);line-height:1.1;letter-spacing:-0.02em;" }, prof.personaname || "Игрок"));
    info.appendChild(nameRow);

    var metaRow = el("div", { style: "display:flex;gap:14px;margin-top:12px;flex-wrap:wrap;font-size:12px;color:var(--text-muted);" });
    metaRow.appendChild(el("span", {}, "🆔 " + data.accountId));
    if (prof.loccountrycode) metaRow.appendChild(el("span", {}, "🌍 " + prof.loccountrycode));
    if (s.lifetimeGames > 0) metaRow.appendChild(el("span", {}, "🎮 " + s.lifetimeGames + " матчей"));
    if (data.behavior > 0) metaRow.appendChild(el("span", {}, "🎭 поведение " + data.behavior));
    if (prof.profileurl) {
      var link = el("a", { href: prof.profileurl, target: "_blank", rel: "noopener", style: "color:var(--cyan);text-decoration:none;font-weight:600;" }, "Steam ↗");
      metaRow.appendChild(link);
    }
    info.appendChild(metaRow);

    if (s.totalLifetime > 0) {
      var lifetime = el("div", { style: "margin-top:14px;font-size:13px;color:var(--text-muted);" });
      lifetime.innerHTML = "Всего WL: <b style='color:var(--text);'>" + s.totalLifetime + "</b> · Общий винрейт: <b style='color:" + (s.lifetimeWinrate >= 55 ? "var(--green)" : s.lifetimeWinrate >= 45 ? "var(--yellow)" : "var(--red)") + ";'>" + s.lifetimeWinrate + "%</b>";
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

    var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:18px;" });
    if (s.totalMatches > 0) {
      grid.appendChild(this.metricTile("🏆", "Винрейт (30 матчей)", s.winrate + "%", s.wins + "W · " + s.losses + "L",
        s.winrate >= 55 ? "var(--green)" : s.winrate >= 45 ? "var(--yellow)" : "var(--red)"));
    }
    if (s.avgKDA > 0) {
      grid.appendChild(this.metricTile("⚔️", "KDA", s.avgKDA, s.avgKills + " / " + s.avgDeaths + " / " + s.avgAssists, "var(--cyan)"));
    }
    if (s.avgGPM > 0) grid.appendChild(this.metricTile("💰", "GPM", s.avgGPM, "средний за всё время", "var(--gold)"));
    if (s.avgXPM > 0) grid.appendChild(this.metricTile("⚡", "XPM", s.avgXPM, "средний за всё время", "var(--accent-light)"));
    if (s.avgLH > 0) grid.appendChild(this.metricTile("🎯", "Ластхиты", s.avgLH, "средние за матч", "var(--cyan)"));
    if (s.avgDuration > 0) grid.appendChild(this.metricTile("⏱️", "Длительность", s.avgDuration + " мин", "средняя за матч", "var(--text-muted)"));
    frag.appendChild(grid);

    if (s.totalMatches === 0) {
      var noMatchesCard = UI.card("📜 Последние матчи");
      noMatchesCard.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.6;padding:10px 0;" },
        "STRATZ отдал статистику по героям, но список последних матчей пуст. Попробуй «Обновить» через 5-10 минут."));
      frag.appendChild(noMatchesCard);
    }

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

    if (s.favoriteRole && s.totalMatches > 0) {
      var roleCard = UI.card("🎯 Роли");
      var roleRow = el("div", { style: "display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;" });
      roleRow.appendChild(el("div", { style: "width:70px;height:70px;border-radius:18px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;" }, this.roleIcon(s.favoriteRole)));

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

    if (s.bestHero || s.worstHero) {
      var hlCard = UI.card("⚔️ Сильные и слабые герои");
      var hlRow = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:14px;" });

      if (s.bestHero) {
        var bestBox = el("div", { style: "padding:16px;background:var(--green-bg);border:1px solid var(--green);border-radius:14px;" });
        bestBox.appendChild(el("div", { style: "font-size:10px;font-weight:800;letter-spacing:0.12em;color:var(--green);text-transform:uppercase;margin-bottom:10px;" }, "🔥 Лучший герой"));
        var bHeroImg = el("div", { style: "display:flex;align-items:center;gap:12px;" });
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
        var wHeroImg = el("div", { style: "display:flex;align-items:center;gap:12px;" });
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

    if (s.topHeroes && s.topHeroes.length) {
      var heroesCard = UI.card("🎮 Топ-" + s.topHeroes.length + " героев по количеству игр");
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
          mInfo.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-top:3px;" }, durMin + " мин · " + (m.position ? "Поз. " + m.position : "—")));
          mRow.appendChild(mInfo);

          var kdaColor = won ? "var(--green)" : "var(--red)";
          var kdaBox = el("div", { style: "text-align:right;" });
          kdaBox.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:" + kdaColor + ";" }, (m.kills || 0) + "/" + (m.deaths || 0) + "/" + (m.assists || 0)));
          kdaBox.appendChild(el("div", { style: "font-size:10px;font-weight:700;color:" + kdaColor + ";margin-top:2px;" }, won ? "ПОБЕДА" : "ПОРАЖЕНИЕ"));
          mRow.appendChild(kdaBox);

          mRow.addEventListener("click", function () {
            window.open("https://stratz.com/matches/" + m.match_id, "_blank");
          });
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

console.log("profile-analyzer v13.0 ready (STRATZ: heroPerformance)");
