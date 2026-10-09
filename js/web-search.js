/* DOTA JETCH — WEB SEARCH v1.0
   Поиск в интернете без API-ключа: Wikipedia + DuckDuckGo via CORS proxy. */

var WebSearch = {
  proxies: [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest="
  ],

  searchWikipedia: function (query, lang) {
    lang = lang || "ru";
    var url = "https://" + lang + ".wikipedia.org/w/api.php?" +
      "action=query&format=json&list=search&srsearch=" +
      encodeURIComponent(query) + "&srlimit=3&origin=*";
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.query || !data.query.search || !data.query.search.length) return null;
        var results = [];
        for (var i = 0; i < Math.min(data.query.search.length, 3); i++) {
          var s = data.query.search[i];
          results.push({
            title: s.title,
            snippet: s.snippet ? s.snippet.replace(/<[^>]+>/g, "") : "",
            url: "https://" + lang + ".wikipedia.org/wiki/" + encodeURIComponent(s.title),
            source: "Wikipedia (" + lang + ")"
          });
        }
        return results;
      })
      .catch(function () { return null; });
  },

  fetchWikipediaPage: function (title, lang) {
    lang = lang || "ru";
    var url = "https://" + lang + ".wikipedia.org/w/api.php?" +
      "action=query&format=json&prop=extracts&exintro=1&explaintext=1&titles=" +
      encodeURIComponent(title) + "&origin=*";
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.query || !data.query.pages) return null;
        for (var id in data.query.pages) {
          if (data.query.pages.hasOwnProperty(id)) {
            var page = data.query.pages[id];
            if (page.extract) return page.extract.slice(0, 1500);
          }
        }
        return null;
      })
      .catch(function () { return null; });
  },

  searchDuckDuckGo: function (query) {
    var self = this;
    var ddgUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    for (var i = 0; i < self.proxies.length; i++) {
      var proxiedUrl = self.proxies[i] + encodeURIComponent(ddgUrl);
      var result = self._tryDDG(proxiedUrl);
      if (result) return result;
    }
    return Promise.resolve(null);
  },

  _tryDDG: function (url) {
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var results = [];
        var rx = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        var snipRx = /<a[^>]*class="result__snippet"[^>]*>([^<]+)<\/a>/g;
        var match, snippets = [], sm;
        while ((sm = snipRx.exec(html)) !== null) snippets.push(sm[1].replace(/&[^;]+;/g, " ").trim());
        var idx = 0;
        while ((match = rx.exec(html)) !== null && idx < 3) {
          results.push({ title: match[2].trim(), snippet: snippets[idx] || "", url: match[1], source: "DuckDuckGo" });
          idx++;
        }
        return results.length ? results : null;
      })
      .catch(function () { return null; });
  },

  search: async function (query) {
    console.log("[WebSearch] Ищу: " + query);
    var all = [];
    var wikiRu = await this.searchWikipedia(query, "ru");
    if (wikiRu && wikiRu.length) all = all.concat(wikiRu);
    if (all.length < 2) {
      var wikiEn = await this.searchWikipedia(query, "en");
      if (wikiEn && wikiEn.length) all = all.concat(wikiEn);
    }
    if (all.length === 0) {
      var ddg = await this.searchDuckDuckGo(query);
      if (ddg && ddg.length) all = all.concat(ddg);
    }
    if (!all.length) return null;
    all = all.slice(0, 4);
    var detailed = null;
    if (wikiRu && wikiRu.length > 0) detailed = await this.fetchWikipediaPage(wikiRu[0].title, "ru");
    return { results: all, detailed: detailed };
  },

  formatForPrompt: function (searchData) {
    if (!searchData || !searchData.results || !searchData.results.length) return null;
    var lines = ["📚 НАЙДЕННАЯ ИНФОРМАЦИЯ ИЗ ИНТЕРНЕТА:"];
    for (var i = 0; i < searchData.results.length; i++) {
      var r = searchData.results[i];
      lines.push("");
      lines.push("[" + (i + 1) + "] " + r.title + " (источник: " + r.source + ")");
      if (r.snippet) lines.push(r.snippet);
      if (r.url) lines.push("URL: " + r.url);
    }
    if (searchData.detailed) {
      lines.push("");
      lines.push("=== ДОПОЛНИТЕЛЬНО ===");
      lines.push(searchData.detailed);
    }
    return lines.join("\n");
  }
};

console.log("web-search v1.0 ready");
