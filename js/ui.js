/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — UI KIT
   el(), qs(), qsa(), UI.* и showDialog().
   ═══════════════════════════════════════════════════════════════════ */

/* ─── DOM-хелперы ─── */
function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs && typeof attrs === "object") {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "style") node.style.cssText = v;
      else if (k === "id") node.id = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v === true) {
        node.setAttribute(k, "");
      } else {
        node.setAttribute(k, String(v));
      }
    }
  }
  const append = (c) => {
    if (c == null || c === false || c === true) return;
    if (Array.isArray(c)) { c.forEach(append); return; }
    if (c instanceof Node) { node.appendChild(c); return; }
    node.appendChild(document.createTextNode(String(c)));
  };
  children.forEach(append);
  return node;
}

function qs(selector, root) {
  return (root || document).querySelector(selector);
}
function qsa(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

/* ─── UI kit ─── */
const UI = {
  card(title) {
    const c = el("div", { class: "card" });
    if (title) c.appendChild(el("div", { class: "card-title" }, title));
    return c;
  },

  input(placeholder) {
    return el("input", {
      class: "input",
      type: "text",
      placeholder: placeholder || "",
    });
  },

  btn(text, opts = {}) {
    const classes = "btn" + (opts.variant ? " btn-" + opts.variant : "");
    const b = el("button", { class: classes, type: "button" }, text);
    if (opts.id) b.id = opts.id;
    if (opts.onclick) b.addEventListener("click", opts.onclick);
    if (opts.disabled) b.disabled = true;
    return b;
  },

  badge(text, color, bg) {
    const b = el("span", { class: "badge" }, text);
    if (color) { b.style.color = color; b.style.borderColor = color; }
    if (bg) b.style.background = bg;
    return b;
  },

  statCard(icon, color, bg, label, value, sub) {
    const c = el("div", { class: "stat-card" });
    const top = el("div", { class: "stat-top" });
    const ic = el("div", { class: "stat-icon" }, icon);
    if (color) ic.style.color = color;
    if (bg) ic.style.background = bg;
    top.appendChild(ic);
    top.appendChild(el("div", { class: "stat-label" }, label));
    c.appendChild(top);
    c.appendChild(el("div", { class: "stat-value" }, String(value)));
    if (sub) c.appendChild(el("div", { class: "stat-sub" }, sub));
    return c;
  },

  heroBanner(title, subtitle, buttons) {
    const b = el("div", { class: "hero-banner" });
    b.appendChild(el("div", { class: "hero-title" }, title));
    b.appendChild(el("div", { class: "hero-sub" }, subtitle));
    if (buttons && buttons.length) {
      const row = el("div", { class: "hero-buttons" });
      for (const btn of buttons) row.appendChild(btn);
      b.appendChild(row);
    }
    return b;
  },

  placeholder(text) {
    const c = el("div", { class: "card" });
    c.appendChild(el("div", {
      class: "dim",
      style: "text-align:center;padding:40px;font-size:13px;",
    }, "🚧 " + text + " — в разработке"));
    return c;
  },
};

/* ─── Модалка ─── */
function showDialog(title, msg, type) {
  const overlay = el("div", { class: "dialog-overlay" });
  const d = el("div", { class: "dialog" });
  const color =
    type === "success" ? "var(--green)" :
    type === "error"   ? "var(--red)"   :
                         "var(--accent)";
  d.appendChild(el("div", {
    style: `color:${color};font-weight:700;font-size:14px;margin-bottom:8px;`,
  }, title));
  d.appendChild(el("div", {
    class: "dim",
    style: "font-size:12px;line-height:1.5;",
  }, msg));
  const ok = UI.btn("OK");
  ok.style.marginTop = "14px";
  ok.addEventListener("click", () => overlay.remove());
  d.appendChild(ok);
  overlay.appendChild(d);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  setTimeout(() => ok.focus(), 30);
}
