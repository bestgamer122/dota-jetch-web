/* DOTA JETCH — UI KIT v3.4.0 */

function el(tag, attrs) {
var node = document.createElement(tag);
if (attrs && typeof attrs === "object") {
for (var k in attrs) {
if (!attrs.hasOwnProperty(k)) continue;
var v = attrs[k];
if (v == null || v === false) continue;
if (k === "class") node.className = v;
else if (k === "style") node.style.cssText = v;
else if (k === "id") node.id = v;
else if (k === "text") node.textContent = v;
else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
else node.setAttribute(k, String(v));
}
}
for (var i = 2; i < arguments.length; i++) {
var c = arguments[i];
if (c == null || c === false || c === true) continue;
if (Array.isArray(c)) { for (var j = 0; j < c.length; j++) appendChild(node, c[j]); }
else appendChild(node, c);
}
return node;
}

function appendChild(node, c) {
if (c == null || c === false || c === true) return;
if (c instanceof Node) node.appendChild(c);
else node.appendChild(document.createTextNode(String(c)));
}

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

var UI = {
card: function (title) {
var c = el("div", { class: "card" });
if (title) c.appendChild(el("div", { class: "card-title" }, title));
return c;
},
input: function (placeholder) {
return el("input", { class: "input", type: "text", placeholder: placeholder || "" });
},
btn: function (text, opts) {
opts = opts || {};
var classes = "btn" + (opts.variant ? " btn-" + opts.variant : "");
var b = el("button", { class: classes, type: "button" }, text);
if (opts.id) b.id = opts.id;
if (opts.onclick) b.addEventListener("click", opts.onclick);
if (opts.disabled) b.disabled = true;
return b;
},
badge: function (text, color, bg) {
var b = el("span", { class: "badge" }, text);
if (color) { b.style.color = color; b.style.borderColor = color; }
if (bg) b.style.background = bg;
return b;
},
statCard: function (icon, color, bg, label, value, sub) {
var c = el("div", { class: "stat-card" });
var top = el("div", { class: "stat-top" });
var ic = el("div", { class: "stat-icon" }, icon);
if (color) ic.style.color = color;
if (bg) ic.style.background = bg;
top.appendChild(ic);
top.appendChild(el("div", { class: "stat-label" }, label));
c.appendChild(top);
c.appendChild(el("div", { class: "stat-value" }, String(value)));
if (sub) c.appendChild(el("div", { class: "stat-sub" }, sub));
return c;
},
heroBanner: function (title, subtitle, buttons) {
var b = el("div", { class: "hero-banner" });
b.appendChild(el("div", { class: "hero-title" }, title));
b.appendChild(el("div", { class: "hero-sub" }, subtitle));
if (buttons && buttons.length) {
var row = el("div", { class: "hero-buttons" });
for (var i = 0; i < buttons.length; i++) row.appendChild(buttons[i]);
b.appendChild(row);
}
return b;
}
};

function showDialog(title, msg, type) {
var overlay = el("div", { class: "dialog-overlay" });
var d = el("div", { class: "dialog" });
var color = type === "success" ? "var(--green)" : type === "error" ? "var(--red)" : "var(--accent)";
d.appendChild(el("div", { style: "color:" + color + ";font-weight:700;font-size:14px;margin-bottom:8px;" }, title));
d.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.5;" }, msg));
var ok = UI.btn("OK");
ok.style.marginTop = "14px";
ok.addEventListener("click", function () { overlay.remove(); });
d.appendChild(ok);
overlay.appendChild(d);
document.body.appendChild(overlay);
overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
}