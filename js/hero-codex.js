/* DOTA JETCH — HERO CODEX v1.0
   Замена ИИ-чата. Справочник героев с билдами и контрпиками из OpenDota. */

var CODEX_STATE = {
  view: "list",         /* "list" | "hero" */
  heroId: null,
  filterAttr: "all",    /* all|str|agi|int|all */
  filterRole: "all",    /* all|carry|mid|offlane|roam|support */
  search: ""
};

var ATTR_RU = { str: "Сила", agi: "Ловкость", int: "Интеллект", all: "Универсал" };
var ROLE_RU = { carry: "Керри", mid: "Мид", offlane: "Оффлейн", roam: "Роум", support: "Саппорт", flex: "Универсал" };

var HeroCodex = {
  heroes: [],
  items: {},
  heroStats: null,
  loaded: false,
  cache: {},

  init: async function () {
    if (this.loaded) return;
    try {
      this.heroes = await getHeroes();
      this.items = await getItemCatalog();
    } catch (e) { console.warn("Codex init:", e); }
    try {
      this.heroStats = await apiGet("/heroStats");
    } catch (e) { this.heroStats = null; }
    this.loaded = true;
  },

  getStat: function (heroId) {
    if (!this.heroStats) return null;
    for (var i = 0; i < this.heroStats.length; i++) {
      if (this.heroStats[i].id === heroId) return this.heroStats[i];
    }
    return null;
  },

  computeWinrate: function (stat) {
    if (!stat) return null;
    var picks = 0, wins = 0;
    for (var i = 1; i <= 8; i++) {
      var p = stat[i + "_pick"] || 0;
      var w = stat[i + "_win"] || 0;
      picks += p; wins += w;
    }
    if (!picks) return null;
    return { picks: picks, wins: wins, winrate: (wins / picks * 100) };
  },

  getBrainHero: function (heroId) {
    if (typeof BRAIN_HEROES === "undefined") return null;
    for (var i = 0; i < BRAIN_HEROES.length; i++) {
      if (BRAIN_HEROES[i].id === heroId) return BRAIN_HEROES[i];
    }
    return null;
  },

  getRole: function (heroName) {
    if (typeof BrainDraft !== "undefined" && BrainDraft.roleMap && BrainDraft.roleMap[heroName]) {
      return BrainDraft.roleMap[heroName];
    }
    return null;
  },

  loadHeroData: async function (heroId) {
    if (this.cache[heroId] && !this.cache[heroId].loading) return this.cache[heroId];
    var data = { loading: true, matchups: null, items: null };
    this.cache[heroId] = data;
    try {
      var r = await Promise.all([
        apiGet("/heroes/" + heroId + "/matchups").catch(function () { return null; }),
        apiGet("/heroes/" + heroId + "/itemPopularity").catch(function () { return null; })
      ]);
      data.matchups = r[0];
      data.items = r[1];
    } catch (e) { console.warn("Codex hero load:", e); }
    data.loading = false;
    return data;
  },

  getHeroById: function (id) {
    for (var i = 0; i < this.heroes.length; i++) {
      if (this.heroes[i].id === id) return this.heroes[i];
    }
    return null;
  },

  getItemName: function (id) {
    var it = this.items[id];
    return it ? it.name : null;
  },

  filterHeroes: function () {
    var out = [];
    for (var i = 0; i < this.heroes.length; i++) {
      var h = this.heroes[i];
      var brain = this.getBrainHero(h.id);
      /* Attr filter */
      if (CODEX_STATE.filterAttr !== "all") {
        if (!brain || brain.attr !== CODEX_STATE.filterAttr) continue;
      }
      /* Role filter */
      if (CODEX_STATE.filterRole !== "all") {
        var r = this.getRole(h.name);
        if (r !== CODEX_STATE.filterRole) continue;
      }
      /* Search */
      if (CODEX_STATE.search) {
        var q = CODEX_STATE.search.toLowerCase();
        if (h.name.toLowerCase().indexOf(q) < 0) continue;
      }
      out.push(h);
    }
    return out;
  }
};

window.HeroCodex = HeroCodex;

/* ═══ RENDERING ═══ */

function renderCodex() {
  var frag = document.createDocumentFragment();
  var wrapper = el("div", { id: "codexWrapper" });
  frag.appendChild(wrapper);
  setTimeout(function () { renderCodexAsync(wrapper); }, 0);
  return frag;
}

async function renderCodexAsync(wrapper) {
  if (!wrapper) return;
  wrapper.innerHTML = "";
  var loader = el("div", { class: "dim", style: "font-size:12px;padding:20px;text-align:center;" }, "Загрузка кодекса...");
  wrapper.appendChild(loader);

  await HeroCodex.init();

  wrapper.innerHTML = "";
  if (CODEX_STATE.view === "hero" && CODEX_STATE.heroId) {
    wrapper.appendChild(renderCodexHeroDetail());
  } else {
    wrapper.appendChild(renderCodexList());
  }
}

function renderCodexList() {
  var frag = document.createDocumentFragment();

  var head = UI.card("Кодекс героев");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;" },
    "Справочник всех героев Dota 2. Тыкни героя — увидишь билды и контрпики с OpenDota."));

  /* Фильтры */
  var filters = el("div", { style: "display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;" });

  var searchInp = UI.input("Поиск героя...");
  searchInp.value = CODEX_STATE.search;
  searchInp.style.flex = "1";
  searchInp.style.minWidth = "180px";
  searchInp.addEventListener("input", function () {
    CODEX_STATE.search = searchInp.value;
    refreshCodexList();
  });
  filters.appendChild(searchInp);

  /* Кнопки атрибутов */
  var attrRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;width:100%;" });
  var attrs = [
    { v: "all", label: "Все" },
    { v: "str", label: "Сила" },
    { v: "agi", label: "Ловкость" },
    { v: "int", label: "Интеллект" },
    { v: "all2", label: "Универсал" }
  ];
  var attrDefs = [
    { v: "all", label: "Все" },
    { v: "str", label: "Сила" },
    { v: "agi", label: "Ловкость" },
    { v: "int", label: "Интеллект" }
  ];
  for (var a = 0; a < attrDefs.length; a++) {
    (function (d) {
      var btn = el("button", { type: "button", "data-attr": d.v });
      var active = CODEX_STATE.filterAttr === d.v;
      btn.textContent = d.label;
      btn.style.cssText = "padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.15s ease;border:1px solid " + (active ? "var(--accent)" : "var(--border)") + ";background:" + (active ? "var(--accent-bg)" : "var(--bg-elev)") + ";color:" + (active ? "var(--accent-light)" : "var(--text-muted)") + ";";
      btn.addEventListener("click", function () {
        CODEX_STATE.filterAttr = d.v;
        refreshCodexList();
      });
      attrRow.appendChild(btn);
    })(attrDefs[a]);
  }
  filters.appendChild(attrRow);

  /* Кнопки ролей */
  var roleRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;width:100%;" });
  var roleDefs = [
    { v: "all", label: "Все роли" },
    { v: "carry", label: "Керри" },
    { v: "mid", label: "Мид" },
    { v: "offlane", label: "Оффлейн" },
    { v: "roam", label: "Роум" },
    { v: "support", label: "Саппорт" }
  ];
  for (var r = 0; r < roleDefs.length; r++) {
    (function (d) {
      var btn = el("button", { type: "button", "data-role": d.v });
      var active = CODEX_STATE.filterRole === d.v;
      btn.textContent = d.label;
      btn.style.cssText = "padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.15s ease;border:1px solid " + (active ? "var(--cyan)" : "var(--border)") + ";background:" + (active ? "var(--cyan-bg)" : "var(--bg-elev)") + ";color:" + (active ? "var(--cyan)" : "var(--text-muted)") + ";";
      btn.addEventListener("click", function () {
        CODEX_STATE.filterRole = d.v;
        refreshCodexList();
      });
      roleRow.appendChild(btn);
    })(roleDefs[r]);
  }
  filters.appendChild(roleRow);

  head.appendChild(filters);
  frag.appendChild(head);

  /* Контейнер для сетки */
  var grid = el("div", { id: "codexGrid" });
  frag.appendChild(grid);

  setTimeout(refreshCodexList, 0);
  return frag;
}

function refreshCodexList() {
  var grid = qs("#codexGrid");
  if (!grid) return;
  grid.innerHTML = "";

  /* Перерисовка фильтров (для подсветки active) */
  var head = grid.parentNode ? grid.parentNode.querySelector(".card") : null;
  if (head) {
    var attrBtns = head.querySelectorAll("[data-attr]");
    for (var i = 0; i < attrBtns.length; i++) {
      var b = attrBtns[i];
      var act = b.getAttribute("data-attr") === CODEX_STATE.filterAttr;
      b.style.borderColor = act ? "var(--accent)" : "var(--border)";
      b.style.background = act ? "var(--accent-bg)" : "var(--bg-elev)";
      b.style.color = act ? "var(--accent-light)" : "var(--text-muted)";
    }
    var roleBtns = head.querySelectorAll("[data-role]");
    for (var j = 0; j < roleBtns.length; j++) {
      var rb = roleBtns[j];
      var ract = rb.getAttribute("data-role") === CODEX_STATE.filterRole;
      rb.style.borderColor = ract ? "var(--cyan)" : "var(--border)";
      rb.style.background = ract ? "var(--cyan-bg)" : "var(--bg-elev)";
      rb.style.color = ract ? "var(--cyan)" : "var(--text-muted)";
    }
  }

  var list = HeroCodex.filterHeroes();
  if (!list.length) {
    grid.appendChild(el("div", { class: "card", style: "text-align:center;padding:30px;" },
      el("div", { class: "dim", style: "font-size:12px;" }, "Ничего не найдено")));
    return;
  }

  var card = UI.card("Герои (" + list.length + ")");
  var g = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px;" });
  for (var k = 0; k < list.length; k++) {
    (function (hero) {
      var tile = el("button", { type: "button" });
      tile.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.15s ease;font-family:inherit;color:var(--text);";
      tile.addEventListener("mouseenter", function () { tile.style.borderColor = "var(--accent)"; tile.style.transform = "translateY(-2px)"; });
      tile.addEventListener("mouseleave", function () { tile.style.borderColor = "var(--border)"; tile.style.transform = "translateY(0)"; });
      tile.appendChild(heroImgEl(hero, 64));
      tile.appendChild(el("div", { style: "font-size:11px;font-weight:600;text-align:center;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;" }, hero.name));
      tile.addEventListener("click", function () {
        CODEX_STATE.view = "hero";
        CODEX_STATE.heroId = hero.id;
        switchPage("codex");
      });
      g.appendChild(tile);
    })(list[k]);
  }
  card.appendChild(g);
  grid.appendChild(card);
}

function renderCodexHeroDetail() {
  var frag = document.createDocumentFragment();
  var hero = HeroCodex.getHeroById(CODEX_STATE.heroId);
  if (!hero) {
    frag.appendChild(UI.card("Герой не найден"));
    return frag;
  }

  var brain = HeroCodex.getBrainHero(hero.id);
  var stat = HeroCodex.getStat(hero.id);
  var wr = HeroCodex.computeWinrate(stat);

  /* Кнопка назад */
  var backBtn = UI.btn("← Все герои", { variant: "ghost" });
  backBtn.style.marginBottom = "14px";
  backBtn.addEventListener("click", function () {
    CODEX_STATE.view = "list";
    CODEX_STATE.heroId = null;
    switchPage("codex");
  });
  frag.appendChild(backBtn);

  /* Header */
  var head = UI.card("");
  head.style.cssText = "background:linear-gradient(135deg,rgba(139,92,246,0.35),var(--bg-card));border-color:var(--accent);";
  var hRow = el("div", { style: "display:flex;align-items:center;gap:20px;flex-wrap:wrap;" });
  hRow.appendChild(heroImgEl(hero, 96));
  var info = el("div", { style: "flex:1;min-width:200px;" });
  info.appendChild(el("div", { style: "font-size:26px;font-weight:bold;color:var(--text);" }, hero.name));
  var badges = el("div", { class: "row", style: "margin-top:8px;flex-wrap:wrap;" });
  if (brain) badges.appendChild(UI.badge(ATTR_RU[brain.attr] || brain.attr, "var(--accent-light)", "var(--accent-bg)"));
  var role = HeroCodex.getRole(hero.name);
  if (role) badges.appendChild(UI.badge(ROLE_RU[role] || role, "var(--cyan)", "var(--cyan-bg)"));
  if (brain && brain.roles && brain.roles.length) {
    for (var r = 0; r < Math.min(brain.roles.length, 3); r++) {
      badges.appendChild(UI.badge(brain.roles[r], "var(--text-muted)", "var(--bg-elev)"));
    }
  }
  info.appendChild(badges);
  if (wr) {
    info.appendChild(el("div", { style: "margin-top:14px;font-size:13px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;" },
      "Винрейт: " + wr.winrate.toFixed(1) + "% · Пикрейт: " + (wr.picks / 1000).toFixed(1) + "k игр"));
  }
  hRow.appendChild(info);
  head.appendChild(hRow);
  frag.appendChild(head);

  /* Placeholder для данных с OpenDota */
  var dataCard = el("div", { id: "codexHeroData" });
  dataCard.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:20px;text-align:center;" }, "Загрузка данных с OpenDota..."));
  frag.appendChild(dataCard);

  /* Контрпики из локальной базы */
  if (typeof BrainCounters !== "undefined") {
    var cInfo = BrainCounters.getCountersFor(hero.name);
    if (cInfo) {
      var cc = UI.card("Контрпики");
      if (cInfo.counters && cInfo.counters.length) {
        cc.appendChild(el("div", { style: "font-size:13px;font-weight:600;margin-bottom:8px;color:var(--red);" }, "🛡 Кто контрит " + hero.name));
        var cl = el("div", { style: "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;" });
        for (var ci = 0; ci < cInfo.counters.length; ci++) {
          cl.appendChild(UI.badge(cInfo.counters[ci], "var(--red)", "var(--red-bg)"));
        }
        cc.appendChild(cl);
      }
      if (cInfo.goodAgainst && cInfo.goodAgainst.length) {
        cc.appendChild(el("div", { style: "font-size:13px;font-weight:600;margin-bottom:8px;color:var(--green);" }, "✅ Против кого хорош"));
        var gl = el("div", { style: "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;" });
        for (var gi = 0; gi < cInfo.goodAgainst.length; gi++) {
          gl.appendChild(UI.badge(cInfo.goodAgainst[gi], "var(--green)", "var(--green-bg)"));
        }
        cc.appendChild(gl);
      }
      if (cInfo.tips) {
        cc.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;margin-top:8px;" }, "💡 " + cInfo.tips));
      }
      frag.appendChild(cc);
    }
  }

  /* Async загрузка OpenDota */
  setTimeout(function () { loadHeroDetailData(hero); }, 0);

  return frag;
}

async function loadHeroDetailData(hero) {
  var container = qs("#codexHeroData");
  if (!container) return;
  var data = await HeroCodex.loadHeroData(hero.id);
  if (!container.parentNode) return;
  container.innerHTML = "";

  /* Билды */
  if (data.items) {
    var buildCard = UI.card("Билды (OpenDota)");
    var phases = [
      { key: "start_game_items", label: "🛒 Старт", color: "var(--cyan)" },
      { key: "early_game_items", label: "⚔ Ранняя игра", color: "var(--green)" },
      { key: "mid_game_items", label: "🛡 Мид", color: "var(--accent-light)" },
      { key: "late_game_items", label: "🏆 Лейт", color: "var(--gold)" }
    ];
    var anyItems = false;
    for (var p = 0; p < phases.length; p++) {
      var ph = phases[p];
      var pData = data.items[ph.key];
      if (!pData) continue;
      var arr = [];
      for (var id in pData) {
        if (pData.hasOwnProperty(id)) arr.push({ id: id, count: pData[id] });
      }
      arr.sort(function (a, b) { return b.count - a.count; });
      arr = arr.slice(0, 6);
      if (!arr.length) continue;
      anyItems = true;
      buildCard.appendChild(el("div", { style: "font-size:13px;font-weight:600;margin-top:" + (p > 0 ? "12px" : "0") + ";margin-bottom:8px;color:" + ph.color + ";" }, ph.label));
      var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px;max-width:420px;" });
      for (var i = 0; i < arr.length; i++) {
        var itemName = HeroCodex.getItemName(arr[i].id) || ("Item " + arr[i].id);
        var itemSlug = HeroCodex.items[arr[i].id] ? HeroCodex.items[arr[i].id].slug : null;
        var itemWrap = el("div", { style: "position:relative;" });
        itemWrap.appendChild(itemImgEl({ id: parseInt(arr[i].id, 10), name: itemName, slug: itemSlug }));
        itemWrap.title = itemName + " — " + arr[i].count + " раз";
        grid.appendChild(itemWrap);
      }
      buildCard.appendChild(grid);
    }
    if (anyItems) container.appendChild(buildCard);
    else {
      var emptyBuild = UI.card("Билды (OpenDota)");
      emptyBuild.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "OpenDota не отдала данные по билдам для этого героя."));
      container.appendChild(emptyBuild);
    }
  }

  /* Матчапы */
  if (data.matchups && data.matchups.length) {
    /* Найдём хорошие/плохие матчапы (минимум 100 игр) */
    var valid = [];
    for (var m = 0; m < data.matchups.length; m++) {
      var mm = data.matchups[m];
      if (mm.games_played >= 100) {
        valid.push({
          hero_id: mm.hero_id,
          games: mm.games_played,
          wins: mm.wins,
          wr: mm.wins / mm.games_played * 100
        });
      }
    }
    valid.sort(function (a, b) { return b.wr - a.wr; });

    var good = valid.slice(0, 6); /* Лучшие матчапы */
    var bad = valid.slice(-6).reverse(); /* Худшие матчапы */

    if (good.length) {
      var gc = UI.card("✅ Лучше всего против");
      var gList = el("div", { style: "display:flex;flex-direction:column;gap:6px;" });
      for (var gi = 0; gi < good.length; gi++) {
        var gh = HeroCodex.getHeroById(good[gi].hero_id);
        if (!gh) continue;
        var gRow = el("div", { style: "display:flex;align-items:center;gap:10px;padding:6px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;cursor:pointer;" });
        gRow.appendChild(heroImgEl(gh, 36));
        gRow.appendChild(el("div", { style: "flex:1;font-size:13px;font-weight:600;" }, gh.name));
        gRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green);" }, good[gi].wr.toFixed(1) + "%"));
        gRow.addEventListener("click", function () {
          CODEX_STATE.heroId = gh.id;
          switchPage("codex");
        });
        gList.appendChild(gRow);
      }
      gc.appendChild(gList);
      container.appendChild(gc);
    }

    if (bad.length) {
      var bc = UI.card("🔴 Хуже всего против");
      var bList = el("div", { style: "display:flex;flex-direction:column;gap:6px;" });
      for (var bi = 0; bi < bad.length; bi++) {
        var bh = HeroCodex.getHeroById(bad[bi].hero_id);
        if (!bh) continue;
        var bRow = el("div", { style: "display:flex;align-items:center;gap:10px;padding:6px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;cursor:pointer;" });
        bRow.appendChild(heroImgEl(bh, 36));
        bRow.appendChild(el("div", { style: "flex:1;font-size:13px;font-weight:600;" }, bh.name));
        bRow.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--red);" }, bad[bi].wr.toFixed(1) + "%"));
        bRow.addEventListener("click", function () {
          CODEX_STATE.heroId = bh.id;
          switchPage("codex");
        });
        bList.appendChild(bRow);
      }
      bc.appendChild(bList);
      container.appendChild(bc);
    }
  }

  if (!container.children.length) {
    container.appendChild(UI.card("Данные").appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Не удалось загрузить данные с OpenDota. Попробуй позже.")).parentNode);
  }
}

console.log("hero-codex v1.0 ready");
