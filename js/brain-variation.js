/* DOTA JETCH — BRAIN VARIATION v1.0 */

var BrainVariation = {
  key: "brainvariation",
  maxRecent: 5,
  load: function () {
    var r = Store.get(this.key, []);
    return Array.isArray(r) ? r : [];
  },
  save: function (r) {
    if (r.length > this.maxRecent) r = r.slice(-this.maxRecent);
    Store.set(this.key, r);
  },
  remember: function (kind, text) {
    var r = this.load();
    r.push({ kind: kind, hash: this.hash(text), ts: Date.now() });
    this.save(r);
  },
  isRepeat: function (text) {
    var h = this.hash(text);
    var r = this.load();
    for (var i = 0; i < r.length; i++) if (r[i].hash === h) return true;
    return false;
  },
  hash: function (s) {
    var h = 0;
    s = String(s || "");
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h;
  },
  pick: function (arr) {
    if (!arr || !arr.length) return null;
    var r = this.load();
    var candidates = arr.slice();
    for (var i = 0; i < candidates.length; i++) {
      var h = this.hash(candidates[i]);
      var used = false;
      for (var j = 0; j < r.length; j++) if (r[j].hash === h) { used = true; break; }
      if (!used) return candidates[i];
    }
    return arr[Math.floor(Math.random() * arr.length)];
  },
  clear: function () { Store.set(this.key, []); }
};