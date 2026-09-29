/* DOTA JETCH — BRAIN CONTEXT v1.0 */

var BrainContext = {
  key: "braincontext",
  maxHistory: 20,

  load: function () {
    var c = Store.get(this.key, null);
    if (!c || typeof c !== "object") c = { history: [], lastTopic: null, lastKind: null };
    if (!Array.isArray(c.history)) c.history = [];
    return c;
  },

  save: function (c) {
    if (c.history.length > this.maxHistory) c.history = c.history.slice(-this.maxHistory);
    Store.set(this.key, c);
  },

  remember: function (query, answer, kind) {
    var c = this.load();
    c.history.push({ q: query, a: answer, kind: kind, ts: Date.now() });
    c.lastTopic = query;
    c.lastKind = kind;
    this.save(c);
  },

  last: function () {
    var c = this.load();
    if (!c.history.length) return null;
    return c.history[c.history.length - 1];
  },

  recentTopics: function (n) {
    var c = this.load();
    n = n || 3;
    var out = [];
    for (var i = c.history.length - 1; i >= 0 && out.length < n; i--) {
      if (c.history[i].kind && c.history[i].kind !== "none") out.push(c.history[i].kind);
    }
    return out;
  },

  clear: function () { Store.set(this.key, null); }
};
