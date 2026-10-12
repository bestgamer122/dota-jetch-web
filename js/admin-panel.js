/* DOTA JETCH — ADMIN PANEL v3.0 (clean maintenance + full user editor) */

/* ─── ХАРДКОД: только эти ники всегда админы ─── */
var ADMIN_NICKNAMES = ["owner"];

/* ═══════════════════════════════════════════════════════════════
   ИНЖЕКТ СТИЛЕЙ
   ═══════════════════════════════════════════════════════════════ */
(function injectAdminStyles() {
  if (document.getElementById("adminPanelStyles")) return;
  var s = document.createElement("style");
  s.id = "adminPanelStyles";
  s.textContent = `
    /* ── ФИКС КУРСОРА в модалках ── */
    .cursor-dot, .cursor-ring { z-index: 2147483647 !important; }

    /* ══════════════════════════════════════════════
       CLEAN MAINTENANCE SCREEN v2
       ══════════════════════════════════════════════ */
    @keyframes mntFadeIn { from{opacity:0} to{opacity:1} }
    @keyframes mntCardIn { 0%{opacity:0;transform:translateY(24px) scale(0.98)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes mntIconPulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.5), 0 0 40px -8px rgba(139,92,246,0.9)} 50%{box-shadow:0 0 0 16px rgba(139,92,246,0), 0 0 60px -8px rgba(139,92,246,1)} }
    @keyframes mntSpin { to{transform:rotate(360deg)} }
    @keyframes mntShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
    @keyframes mntDot { 0%,100%{opacity:0.3} 50%{opacity:1} }

    .mnt-overlay-v2 {
      position: fixed; inset: 0; z-index: 2147483646;
      background: #0b0c10;
      display: flex; align-items: center; justify-content: center;
      padding: 24px; overflow-y: auto;
      font-family: 'Inter', system-ui, sans-serif;
      animation: mntFadeIn 0.3s ease;
    }
    .mnt-overlay-v2::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(60% 45% at 50% 0%, rgba(139,92,246,0.22), transparent 70%),
        radial-gradient(50% 40% at 50% 100%, rgba(34,211,238,0.12), transparent 70%);
      pointer-events: none;
    }
    .mnt-overlay-v2::after {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(139,92,246,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.035) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(70% 60% at 50% 45%, #000 30%, transparent 80%);
      -webkit-mask-image: radial-gradient(70% 60% at 50% 45%, #000 30%, transparent 80%);
      pointer-events: none;
    }

    .mnt-card-v2 {
      position: relative; z-index: 2;
      max-width: 520px; width: 100%;
      padding: 48px 42px 36px;
      text-align: center;
      animation: mntCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Иконка */
    .mnt-ico-v2 {
      width: 96px; height: 96px;
      margin: 0 auto 28px;
      border-radius: 26px;
      display: flex; align-items: center; justify-content: center;
      font-size: 42px;
      background: linear-gradient(135deg, rgba(139,92,246,0.22), rgba(34,211,238,0.12));
      border: 1.5px solid rgba(139,92,246,0.55);
      animation: mntIconPulse 2.8s ease-in-out infinite;
      position: relative;
    }
    .mnt-ico-v2::after {
      content: ''; position: absolute; inset: -22px;
      border: 1px dashed rgba(139,92,246,0.25);
      border-radius: 50%;
      animation: mntSpin 24s linear infinite;
    }

    /* Бренд */
    .mnt-brand-v2 {
      font-size: 11px; font-weight: 800; letter-spacing: 0.4em;
      color: #8b5cf6; text-transform: uppercase;
      margin-bottom: 18px;
      opacity: 0.85;
    }

    /* Заголовок */
    .mnt-title-v2 {
      font-size: 40px; font-weight: 900; letter-spacing: -0.025em;
      line-height: 1.05;
      background: linear-gradient(110deg, #fff 0%, #c4b5fd 35%, #67e8f9 65%, #fff 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      animation: mntShimmer 8s linear infinite;
      margin-bottom: 16px;
    }

    /* Сообщение */
    .mnt-msg-v2 {
      font-size: 15px; color: #9ba0ad;
      line-height: 1.7;
      max-width: 400px; margin: 0 auto 32px;
    }

    /* Countdown */
    .mnt-timer-v2 {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 12px 20px;
      border-radius: 14px;
      background: rgba(139,92,246,0.08);
      border: 1px solid rgba(139,92,246,0.28);
      margin-bottom: 32px;
    }
    .mnt-timer-dot-v2 {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22d3ee;
      box-shadow: 0 0 12px #22d3ee;
      animation: mntDot 1.4s ease-in-out infinite;
    }
    .mnt-timer-label-v2 {
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em;
      color: #9ba0ad; text-transform: uppercase;
    }
    .mnt-timer-value-v2 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px; font-weight: 800;
      color: #c4b5fd;
      font-variant-numeric: tabular-nums;
    }

    /* Кнопка */
    .mnt-btn-v2 {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      padding: 14px 30px;
      border-radius: 13px;
      font-size: 14px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      border: 1px solid rgba(196,181,253,0.55);
      background: linear-gradient(135deg, #8b5cf6, #6d28d9 60%, #22d3ee 140%);
      color: #fff;
      box-shadow: 0 12px 34px -14px rgba(139,92,246,1);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }
    .mnt-btn-v2:hover {
      transform: translateY(-2px);
      filter: brightness(1.08);
      box-shadow: 0 18px 44px -16px rgba(139,92,246,1);
    }
    .mnt-btn-v2:active { transform: translateY(0); }

    /* Футер */
    .mnt-footer-v2 {
      margin-top: 36px;
      padding-top: 22px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 11.5px; color: #6b7280;
      line-height: 1.55;
    }

    /* ══════════════════════════════════════════════
       ADMIN PANEL UI
       ══════════════════════════════════════════════ */
    @keyframes admFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes admSlideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
    @keyframes admShimmer { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
    @keyframes admPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes admFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

    .adm-wrapper { animation: admFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

    .adm-hero {
      position: relative;
      padding: 24px 26px;
      border-radius: 18px;
      overflow: hidden;
      background:
        radial-gradient(120% 100% at 0% 0%, rgba(251,191,36,0.14), transparent 55%),
        radial-gradient(80% 90% at 100% 100%, rgba(139,92,246,0.18), transparent 55%),
        linear-gradient(135deg, rgba(20,22,30,1), rgba(12,14,20,1));
      border: 1px solid rgba(251,191,36,0.32);
      margin-bottom: 16px;
      box-shadow: 0 20px 60px -30px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .adm-hero::before {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(251,191,36,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(251,191,36,0.05) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(100% 80% at 50% 30%, #000 20%, transparent 80%);
      -webkit-mask-image: radial-gradient(100% 80% at 50% 30%, #000 20%, transparent 80%);
      pointer-events: none;
    }
    .adm-hero-inner { position: relative; z-index: 2; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .adm-hero-icon {
      width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px;
      background: linear-gradient(135deg, rgba(251,191,36,0.20), rgba(139,92,246,0.20));
      border: 1px solid rgba(251,191,36,0.5);
      box-shadow: 0 0 26px -8px rgba(251,191,36,0.7);
      animation: admFloat 3.5s ease-in-out infinite;
    }
    .adm-hero-title {
      font-size: 22px; font-weight: 900; letter-spacing: -0.01em;
      background: linear-gradient(120deg, #fff 0%, #fbbf24 50%, #f8d478 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      animation: admShimmer 6s linear infinite;
      margin-bottom: 3px;
    }
    .adm-hero-sub { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }

    .adm-tabs {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;
      padding: 5px; border-radius: 13px;
      background: rgba(20,22,30,0.5);
      border: 1px solid var(--border);
    }
    .adm-tab {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 15px; border-radius: 9px;
      font-size: 12.5px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent; color: var(--text-muted);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .adm-tab:hover { color: var(--text); background: rgba(139,92,246,0.08); }
    .adm-tab.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(251,191,36,0.22), rgba(139,92,246,0.22));
      border-color: rgba(251,191,36,0.55);
      box-shadow: 0 4px 20px -8px rgba(251,191,36,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .adm-tab-icon { font-size: 14px; line-height: 1; }

    .adm-section { animation: admFadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
    .adm-section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 11.5px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--text-muted); text-transform: uppercase;
      margin: 20px 0 10px;
    }
    .adm-section-title::before {
      content: ''; width: 4px; height: 13px; border-radius: 2px;
      background: linear-gradient(180deg, #fbbf24, #8b5cf6);
      box-shadow: 0 0 12px rgba(251,191,36,0.7);
    }

    .adm-card {
      background: linear-gradient(160deg, rgba(22,24,31,0.95), rgba(18,20,26,0.95));
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 12px;
      transition: border-color 0.25s ease;
    }
    .adm-card:hover { border-color: rgba(139,92,246,0.30); }

    .adm-metric {
      position: relative;
      padding: 18px 20px;
      border-radius: 14px;
      overflow: hidden;
      background: linear-gradient(160deg, rgba(22,24,31,1), rgba(16,18,24,1));
      border: 1px solid var(--border);
      transition: all 0.25s ease;
    }
    .adm-metric::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--metric-color, #8b5cf6), transparent);
    }
    .adm-metric:hover {
      transform: translateY(-3px);
      border-color: var(--metric-color, #8b5cf6);
      box-shadow: 0 20px 40px -25px var(--metric-color, #8b5cf6);
    }
    .adm-metric-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .adm-metric-icon {
      width: 38px; height: 38px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      background: var(--metric-bg, rgba(139,92,246,0.15));
      border: 1px solid var(--metric-color, #8b5cf6);
      box-shadow: 0 0 18px -6px var(--metric-color, #8b5cf6);
    }
    .adm-metric-label {
      font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--text-muted); text-transform: uppercase;
    }
    .adm-metric-value {
      font-size: 28px; font-weight: 900; line-height: 1; color: var(--text);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .adm-metric-sub {
      font-size: 10.5px; color: var(--text-dim); margin-top: 5px;
      letter-spacing: 0.04em;
    }

    .adm-top-row, .adm-user-card, .adm-adm-card {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 13px;
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 7px;
      transition: all 0.2s ease;
    }
    .adm-top-row:hover, .adm-user-card:hover {
      border-color: rgba(139,92,246,0.4);
      background: rgba(30,33,41,0.85);
      transform: translateX(2px);
    }
    .adm-user-card { cursor: pointer; animation: admSlideIn 0.3s ease both; }

    .adm-rank-badge {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(139,92,246,0.12);
      border: 1px solid rgba(139,92,246,0.4);
      color: var(--accent-light);
      flex-shrink: 0;
    }
    .adm-rank-badge.gold { background: linear-gradient(135deg, #fbbf24, #d97706); border-color: #fbbf24; color: #0b0c10; box-shadow: 0 0 18px -6px #fbbf24; }
    .adm-rank-badge.silver { background: linear-gradient(135deg, #d1d5db, #6b7280); border-color: #d1d5db; color: #0b0c10; }
    .adm-rank-badge.bronze { background: linear-gradient(135deg, #d97706, #7c2d12); border-color: #d97706; color: #fff; }

    .adm-avatar {
      width: 40px; height: 40px; border-radius: 11px;
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), var(--cyan));
      background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 900; font-size: 15px;
      border: 1px solid rgba(139,92,246,0.5);
    }
    .adm-user-info { flex: 1; min-width: 0; }
    .adm-user-nick {
      font-size: 13px; font-weight: 700; color: var(--text);
      display: flex; align-items: center; gap: 6px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .adm-user-uid {
      font-size: 10px; color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      margin-top: 3px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .adm-user-arrow {
      color: var(--text-dim); font-size: 18px; flex-shrink: 0;
      transition: transform 0.2s ease, color 0.2s ease;
    }
    .adm-user-card:hover .adm-user-arrow {
      color: var(--accent-light); transform: translateX(3px);
    }

    .adm-chip {
      padding: 6px 12px; border-radius: 8px;
      font-size: 11px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      border: 1px solid var(--border);
      background: rgba(30,33,41,0.5);
      color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .adm-chip:hover { color: var(--text); border-color: var(--accent); }
    .adm-chip.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(251,191,36,0.22), rgba(139,92,246,0.22));
      border-color: rgba(251,191,36,0.55);
    }

    .adm-log-row {
      display: flex; gap: 12px; padding: 11px 13px;
      background: rgba(30,33,41,0.45);
      border: 1px solid var(--border);
      border-left: 3px solid var(--log-color, #8b5cf6);
      border-radius: 11px;
      margin-bottom: 7px;
      animation: admFadeUp 0.35s ease both;
    }
    .adm-log-icon {
      width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      background: rgba(139,92,246,0.10);
      border: 1px solid var(--log-color, #8b5cf6);
    }
    .adm-log-body { flex: 1; min-width: 0; }
    .adm-log-title { font-size: 12.5px; font-weight: 700; color: var(--text); }
    .adm-log-detail { font-size: 11px; color: var(--text-muted); margin-top: 3px; line-height: 1.4; }
    .adm-log-time {
      font-size: 10.5px; color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }

    .adm-toggle {
      width: 46px; height: 25px; border-radius: 13px;
      border: none; cursor: pointer; position: relative;
      transition: background 0.25s ease;
      flex-shrink: 0;
      padding: 0;
    }
    .adm-toggle::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 19px; height: 19px; border-radius: 50%;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .adm-toggle.on { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 0 18px -6px #22c55e; }
    .adm-toggle.off { background: rgba(255,255,255,0.10); }
    .adm-toggle.on::after { transform: translateX(21px); }

    .adm-set-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
      border-radius: 11px;
      margin-bottom: 7px;
    }
    .adm-set-row-title { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); }
    .adm-set-row-desc { font-size: 10.5px; color: var(--text-dim); margin-top: 2px; line-height: 1.4; }

    .adm-adm-card.hardcoded {
      background: linear-gradient(135deg, rgba(251,191,36,0.14), rgba(139,92,246,0.14));
      border: 1px solid rgba(251,191,36,0.5);
      box-shadow: 0 4px 20px -10px rgba(251,191,36,0.5);
    }
    .adm-adm-crown {
      width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      background: rgba(251,191,36,0.15);
      border: 1px solid rgba(251,191,36,0.6);
      box-shadow: 0 0 16px -6px rgba(251,191,36,0.7);
    }
    .adm-adm-crown.regular {
      background: rgba(139,92,246,0.12);
      border-color: rgba(139,92,246,0.5);
      box-shadow: 0 0 16px -6px rgba(139,92,246,0.6);
    }

    .adm-empty {
      text-align: center; padding: 34px 20px;
      color: var(--text-dim);
    }
    .adm-empty-icon { font-size: 38px; opacity: 0.35; margin-bottom: 8px; }
    .adm-empty-text { font-size: 12.5px; }

    /* Кнопки в модалке юзера */
    .adm-action-btn {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 11px 14px; margin-bottom: 7px;
      border-radius: 11px;
      font-size: 13px; font-weight: 600; font-family: inherit;
      cursor: pointer;
      border: 1px solid;
      text-align: left;
      transition: all 0.2s ease;
    }
    .adm-action-btn:hover { transform: translateX(3px); filter: brightness(1.15); }

    /* Инпуты в модалке */
    .adm-input-mini {
      width: 100%; padding: 9px 12px;
      background: rgba(15,18,28,0.9);
      border: 1px solid var(--border);
      border-radius: 9px;
      color: var(--text);
      font-size: 12.5px; font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .adm-input-mini:focus { border-color: var(--accent); }
    .adm-input-mono { font-family: 'JetBrains Mono', monospace; }

    /* Вкладки в модалке юзера */
    .adm-modal-tabs {
      display: flex; gap: 4px; margin-bottom: 16px;
      padding: 4px; border-radius: 11px;
      background: rgba(20,22,30,0.6);
      border: 1px solid var(--border);
    }
    .adm-modal-tab {
      flex: 1;
      padding: 9px 10px;
      border-radius: 8px;
      font-size: 12px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      border: none;
      background: transparent; color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .adm-modal-tab:hover { color: var(--text); }
    .adm-modal-tab.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(139,92,246,0.30), rgba(34,211,238,0.20));
      box-shadow: 0 4px 16px -6px rgba(139,92,246,0.6);
    }

    /* Поле-редактор */
    .adm-field {
      display: grid; grid-template-columns: 1fr auto;
      gap: 8px; align-items: center;
      margin-bottom: 8px;
    }
    .adm-field-label {
      grid-column: 1 / -1;
      font-size: 10.5px; font-weight: 700;
      color: var(--text-dim); text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }
    .adm-field-row {
      display: grid; grid-template-columns: 1fr auto;
      gap: 8px; align-items: center;
    }

    @media (max-width: 520px) {
      .mnt-card-v2 { padding: 32px 22px 26px; }
      .mnt-title-v2 { font-size: 30px; }
      .adm-hero { padding: 18px; }
      .adm-hero-title { font-size: 19px; }
    }
  `;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL CORE
   ═══════════════════════════════════════════════════════════════ */
var AdminPanel = {
  isAdmin: false,
  cache: { users: null, config: null, logs: null, activeTab: "dashboard", userFilter: "all" },

  checkAdmin: async function () {
    try {
      var nick = "";
      try { if (window.Store) nick = String(Store.get("nickname", "") || "").toLowerCase(); } catch (e) {}
      if (nick && ADMIN_NICKNAMES.indexOf(nick) >= 0) { this.isAdmin = true; return true; }
      var auth = window.__fbAuth;
      var dbHelpers = window.__fbDB;
      if (!auth || !auth.currentUser || !dbHelpers) { this.isAdmin = false; return false; }
      var snap = await dbHelpers.get(dbHelpers.ref(dbHelpers.db, "admins/" + auth.currentUser.uid));
      this.isAdmin = snap.exists() && snap.val() === true;
      return this.isAdmin;
    } catch (e) { this.isAdmin = false; return false; }
  },

  log: async function (action, details) {
    try {
      var auth = window.__fbAuth;
      var dbHelpers = window.__fbDB;
      if (!auth || !auth.currentUser || !dbHelpers) return;
      var logId = "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      await dbHelpers.set(dbHelpers.ref(dbHelpers.db, "adminLogs/" + logId), {
        action: action, details: details || "",
        adminUid: auth.currentUser.uid,
        adminEmail: auth.currentUser.email || "",
        ts: Date.now()
      });
    } catch (e) {}
  },

  loadUsers: async function () {
    try {
      var dbHelpers = window.__fbDB;
      var snap = await dbHelpers.get(dbHelpers.ref(dbHelpers.db, "users"));
      var data = snap.val() || {};
      var list = [];
      for (var uid in data) {
        if (!data.hasOwnProperty(uid)) continue;
        var u = data[uid] || {};
        var nickname = "";
        var avatar = null;
        var license = { active: false, forever: false, expires: null };
        var blocked = false;
        var analyzed = 0;
        try {
          if (u.nickname) nickname = typeof u.nickname === "string" ? u.nickname : "";
          if (u.avatar) avatar = typeof u.avatar === "string" ? u.avatar : null;
          if (u["license__DOT__active"] !== undefined) license.active = u["license__DOT__active"] === true;
          if (u["license__DOT__forever"] !== undefined) license.forever = u["license__DOT__forever"] === true;
          if (u["license__DOT__expires"] !== undefined) license.expires = u["license__DOT__expires"];
          if (u.blocked !== undefined) blocked = u.blocked === true;
          if (u.analyzedcount !== undefined) analyzed = parseInt(u.analyzedcount, 10) || 0;
        } catch (e) {}
        list.push({ uid: uid, nickname: nickname || "(без ника)", avatar: avatar, license: license, blocked: blocked, analyzed: analyzed, raw: u });
      }
      list.sort(function (a, b) { return a.nickname.localeCompare(b.nickname); });
      this.cache.users = list;
      return list;
    } catch (e) { return []; }
  },

  getUserRaw: async function (uid) {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "users/" + uid));
      return snap.val() || {};
    } catch (e) { return {}; }
  },

  updateUser: async function (uid, patch) {
    try { var db = window.__fbDB; await db.update(db.ref(db.db, "users/" + uid), patch); return true; }
    catch (e) { return false; }
  },

  deleteUser: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.remove(db.ref(db.db, "users/" + uid));
      await db.remove(db.ref(db.db, "publicProfiles/" + uid));
      return true;
    } catch (e) { return false; }
  },

  loadConfig: async function () {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "config"));
      var data = snap.val() || {};
      this.cache.config = {
        maintenance: data.maintenance || { enabled: false, message: "", until: null },
        notification: data.notification || { enabled: false, text: "" },
        minigames: data.minigames || { lockpick: true, automaton: true, direjumper: true, quiz: true }
      };
      return this.cache.config;
    } catch (e) { return null; }
  },

  updateConfig: async function (patch) {
    try { var db = window.__fbDB; await db.update(db.ref(db.db, "config"), patch); return true; }
    catch (e) { return false; }
  },

  loadLogs: async function (limit) {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "adminLogs"));
      var data = snap.val() || {};
      var list = [];
      for (var id in data) if (data.hasOwnProperty(id)) list.push(data[id]);
      list.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
      return list.slice(0, limit || 100);
    } catch (e) { return []; }
  },

  loadAdmins: async function () {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "admins"));
      return snap.val() || {};
    } catch (e) { return {}; }
  },

  resolveInput: async function (input) {
    var s = String(input || "").trim();
    if (!s) return null;
    if (s.length >= 25 && /^[A-Za-z0-9]+$/.test(s)) return { uid: s, nickname: null, source: "uid" };
    var lower = s.toLowerCase();
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "nicknames/" + lower));
      if (snap.exists()) return { uid: snap.val(), nickname: s, source: "nickname" };
    } catch (e) {}
    return null;
  },

  getNicknamesForUids: async function (uids) {
    var out = {};
    if (!uids || !uids.length) return out;
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "publicProfiles"));
      var profiles = snap.val() || {};
      var missing = [];
      for (var i = 0; i < uids.length; i++) {
        var u = uids[i];
        if (profiles[u] && profiles[u].nickname) out[u] = profiles[u].nickname;
        else missing.push(u);
      }
      if (missing.length) {
        var snap2 = await db.get(db.ref(db.db, "users"));
        var users = snap2.val() || {};
        for (var j = 0; j < missing.length; j++) {
          var m = missing[j];
          if (users[m] && users[m].nickname) out[m] = users[m].nickname;
        }
      }
    } catch (e) {}
    return out;
  },

  addAdmin: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.set(db.ref(db.db, "admins/" + uid), true);
      await this.log("add_admin", "Добавлен админ: " + uid);
      return true;
    } catch (e) { return false; }
  },

  removeAdmin: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.remove(db.ref(db.db, "admins/" + uid));
      await this.log("remove_admin", "Удалён админ: " + uid);
      return true;
    } catch (e) { return false; }
  },

  isAdminUid: async function (uid) {
    var admins = await this.loadAdmins();
    return admins[uid] === true;
  },

  /* Смена ника пользователя (и в users, и в nicknames, и в publicProfiles) */
  changeUserNick: async function (uid, oldNick, newNick) {
    try {
      newNick = String(newNick || "").trim();
      if (!/^[A-Za-z0-9_]{3,20}$/.test(newNick)) return { ok: false, msg: "Ник: 3-20 символов, латиница, цифры, _" };
      var db = window.__fbDB;
      var lower = newNick.toLowerCase();

      /* Проверяем что новый ник не занят */
      var taken = await db.get(db.ref(db.db, "nicknames/" + lower));
      if (taken.exists() && taken.val() !== uid) return { ok: false, msg: "Ник занят другим игроком" };

      /* Освобождаем старый */
      if (oldNick) {
        var oldLower = oldNick.toLowerCase();
        try { await db.remove(db.ref(db.db, "nicknames/" + oldLower)); } catch (e) {}
      }

      /* Занимаем новый */
      var patch = {};
      patch[lower] = uid;
      await db.update(db.ref(db.db, "nicknames"), patch);

      /* Обновляем данные юзера */
      await db.update(db.ref(db.db, "users/" + uid), { nickname: newNick });
      try { await db.update(db.ref(db.db, "publicProfiles/" + uid), { nickname: newNick }); } catch (e) {}

      await this.log("change_nick", oldNick + " → " + newNick);
      return { ok: true, msg: "Ник изменён на " + newNick };
    } catch (e) { return { ok: false, msg: "Ошибка: " + (e.message || e) }; }
  }
};
window.AdminPanel = AdminPanel;

/* ═══════════════════════════════════════════════════════════════
   MAINTENANCE
   ═══════════════════════════════════════════════════════════════ */
window.checkMaintenance = async function () {
  try {
    var db = window.__fbDB;
    if (!db) return false;
    var snap = await db.get(db.ref(db.db, "config/maintenance"));
    var m = snap.val();
    if (!m || !m.enabled) return false;
    var isAdmin = await AdminPanel.checkAdmin();
    if (isAdmin) return false;
    showMaintenanceScreen(m);
    return true;
  } catch (e) { return false; }
};

function showMaintenanceScreen(m) {
  if (document.getElementById("maintenanceOverlay")) return;

  var ov = document.createElement("div");
  ov.id = "maintenanceOverlay";
  ov.className = "mnt-overlay-v2";

  var card = document.createElement("div");
  card.className = "mnt-card-v2";

  /* Иконка */
  var ico = document.createElement("div");
  ico.className = "mnt-ico-v2";
  ico.textContent = "🛠️";
  card.appendChild(ico);

  /* Бренд */
  var brand = document.createElement("div");
  brand.className = "mnt-brand-v2";
  brand.textContent = "DOTA JETCH";
  card.appendChild(brand);

  /* Заголовок */
  var title = document.createElement("div");
  title.className = "mnt-title-v2";
  title.textContent = "Технические работы";
  card.appendChild(title);

  /* Сообщение */
  var msg = document.createElement("div");
  msg.className = "mnt-msg-v2";
  msg.textContent = m.message || "Мы обновляем сайт и скоро вернёмся. Спасибо за терпение!";
  card.appendChild(msg);

  /* Countdown */
  var until = m.until ? new Date(m.until) : null;
  if (until && until.getTime() > Date.now()) {
    var timer = document.createElement("div");
    timer.className = "mnt-timer-v2";
    var dot = document.createElement("span");
    dot.className = "mnt-timer-dot-v2";
    timer.appendChild(dot);
    var lbl = document.createElement("span");
    lbl.className = "mnt-timer-label-v2";
    lbl.textContent = "До завершения";
    timer.appendChild(lbl);
    var val = document.createElement("span");
    val.className = "mnt-timer-value-v2";
    val.id = "mntCountdownV2";
    val.textContent = "…";
    timer.appendChild(val);
    card.appendChild(timer);

    setTimeout(function () {
      function tick() {
        var el = document.getElementById("mntCountdownV2");
        if (!el) return;
        var diff = until.getTime() - Date.now();
        if (diff <= 0) {
          el.textContent = "Готово!";
          setTimeout(function () { location.reload(); }, 1200);
          return;
        }
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        el.textContent = (h > 0 ? h + " ч " : "") + String(m).padStart(2, "0") + " мин " + String(s).padStart(2, "0") + " сек";
        setTimeout(tick, 1000);
      }
      tick();
    }, 100);
  }

  /* Кнопка */
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mnt-btn-v2";
  btn.innerHTML = '<span>🔄</span><span>Обновить</span>';
  btn.addEventListener("click", function () { location.reload(); });
  card.appendChild(btn);

  /* Футер */
  var footer = document.createElement("div");
  footer.className = "mnt-footer-v2";
  footer.innerHTML = "Мы делаем сайт лучше для тебя.<br>Спасибо за терпение.";
  card.appendChild(footer);

  ov.appendChild(card);
  document.body.appendChild(ov);
}

/* ═══════════════════════════════════════════════════════════════
   RENDER ADMIN PANEL
   ═══════════════════════════════════════════════════════════════ */
function renderAdminPanel() {
  var frag = document.createDocumentFragment();
  var wrapper = el("div", { id: "adminWrapper", class: "adm-wrapper" });
  frag.appendChild(wrapper);
  setTimeout(function () { initAdminPanel(wrapper); }, 0);
  return frag;
}

async function initAdminPanel(wrapper) {
  if (!wrapper) return;
  wrapper.innerHTML = "";
  wrapper.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:20px;text-align:center;" }, "Проверка прав..."));
  var ok = await AdminPanel.checkAdmin();
  if (!ok) {
    wrapper.innerHTML = "";
    var deny = el("div", { class: "adm-card", style: "text-align:center;padding:40px 24px;" });
    deny.appendChild(el("div", { style: "font-size:52px;margin-bottom:12px;" }, "🚫"));
    deny.appendChild(el("div", { style: "font-size:16px;font-weight:800;color:var(--red);margin-bottom:6px;" }, "Доступ запрещён"));
    deny.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.55;max-width:340px;margin:0 auto;" }, "Эта страница доступна только администраторам."));
    wrapper.appendChild(deny);
    return;
  }
  wrapper.innerHTML = "";
  wrapper.appendChild(renderAdminHero());
  wrapper.appendChild(renderAdminTabs());
  wrapper.appendChild(el("div", { id: "adminContent" }));
  renderAdminTab(AdminPanel.cache.activeTab);
}

function renderAdminHero() {
  var hero = el("div", { class: "adm-hero" });
  var inner = el("div", { class: "adm-hero-inner" });
  inner.appendChild(el("div", { class: "adm-hero-icon" }, "🛡️"));
  var text = el("div", { style: "flex:1;min-width:180px;" });
  var nick = "";
  try { nick = Store.get("nickname", "") || ""; } catch (e) {}
  text.appendChild(el("div", { class: "adm-hero-title" }, "Админ-панель"));
  text.appendChild(el("div", { class: "adm-hero-sub" }, "Привет" + (nick ? ", " + nick : "") + ". Управляй сайтом."));
  inner.appendChild(text);
  hero.appendChild(inner);
  return hero;
}

function renderAdminTabs() {
  var wrap = el("div", { class: "adm-tabs" });
  var tabs = [
    { id: "dashboard", label: "Статистика", icon: "📊" },
    { id: "users", label: "Пользователи", icon: "👥" },
    { id: "config", label: "Настройки", icon: "⚙️" },
    { id: "logs", label: "Логи", icon: "📜" },
    { id: "admins", label: "Админы", icon: "🛡️" }
  ];
  for (var i = 0; i < tabs.length; i++) {
    (function (t) {
      var btn = el("button", { type: "button", "data-admintab": t.id });
      var act = AdminPanel.cache.activeTab === t.id;
      btn.className = "adm-tab" + (act ? " active" : "");
      btn.appendChild(el("span", { class: "adm-tab-icon" }, t.icon));
      btn.appendChild(el("span", {}, t.label));
      btn.addEventListener("click", function () {
        AdminPanel.cache.activeTab = t.id;
        var all = wrap.querySelectorAll("[data-admintab]");
        for (var j = 0; j < all.length; j++) {
          all[j].className = "adm-tab" + (all[j].getAttribute("data-admintab") === t.id ? " active" : "");
        }
        renderAdminTab(t.id);
      });
      wrap.appendChild(btn);
    })(tabs[i]);
  }
  return wrap;
}

async function renderAdminTab(tab) {
  var c = qs("#adminContent");
  if (!c) return;
  c.innerHTML = "";
  if (tab === "dashboard") c.appendChild(await renderAdminDashboard());
  else if (tab === "users") c.appendChild(await renderAdminUsers());
  else if (tab === "config") c.appendChild(await renderAdminConfig());
  else if (tab === "logs") c.appendChild(await renderAdminLogs());
  else if (tab === "admins") c.appendChild(await renderAdminAdmins());
}

/* ═══ DASHBOARD ═══ */
async function renderAdminDashboard() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });
  var users = await AdminPanel.loadUsers();
  var total = users.length, jetch = 0, blocked = 0, totalAnalyzed = 0;
  for (var i = 0; i < users.length; i++) {
    if (users[i].license.active || users[i].license.forever) jetch++;
    if (users[i].blocked) blocked++;
    totalAnalyzed += users[i].analyzed;
  }
  var stats = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:11px;" });
  stats.appendChild(buildMetric("👥", "Всего аккаунтов", total, "зарегистрировано", "#22d3ee", "rgba(34,211,238,0.12)"));
  stats.appendChild(buildMetric("⭐", "JETCH+", jetch, "активных подписок", "#fbbf24", "rgba(251,191,36,0.12)"));
  stats.appendChild(buildMetric("🚫", "Заблокировано", blocked, "нарушителей", "#ef4444", "rgba(239,68,68,0.12)"));
  stats.appendChild(buildMetric("📈", "Анализов", totalAnalyzed, "суммарно", "#22c55e", "rgba(34,197,94,0.12)"));
  section.appendChild(stats);

  section.appendChild(el("div", { class: "adm-section-title" }, "🔥 Топ-5 по анализам"));
  var topCard = el("div", { class: "adm-card" });
  var sorted = users.slice().sort(function (a, b) { return b.analyzed - a.analyzed; }).slice(0, 5);
  if (!sorted.length || !sorted[0].analyzed) {
    topCard.appendChild(buildEmpty("😴", "Пока нет данных"));
  } else {
    for (var j = 0; j < sorted.length; j++) {
      var u = sorted[j];
      var badgeCls = "adm-rank-badge";
      if (j === 0) badgeCls += " gold";
      else if (j === 1) badgeCls += " silver";
      else if (j === 2) badgeCls += " bronze";
      var row = el("div", { class: "adm-top-row" });
      row.appendChild(el("div", { class: badgeCls }, String(j + 1)));
      var av = el("div", { class: "adm-avatar" });
      if (u.avatar) av.style.backgroundImage = "url(" + u.avatar + ")";
      else av.textContent = String(u.nickname).charAt(0).toUpperCase();
      row.appendChild(av);
      var info = el("div", { class: "adm-user-info" });
      info.appendChild(el("div", { class: "adm-user-nick" }, u.nickname));
      row.appendChild(info);
      row.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:900;color:#22d3ee;" }, u.analyzed.toLocaleString()));
      topCard.appendChild(row);
    }
  }
  section.appendChild(topCard);

  section.appendChild(el("div", { class: "adm-section-title" }, "🕐 Последние действия"));
  var logs = await AdminPanel.loadLogs(5);
  var logsCard = el("div", { class: "adm-card" });
  if (!logs.length) logsCard.appendChild(buildEmpty("📭", "Пока ничего не происходило"));
  else for (var k = 0; k < logs.length; k++) logsCard.appendChild(buildLogRow(logs[k]));
  section.appendChild(logsCard);

  frag.appendChild(section);
  return frag;
}

function buildMetric(icon, label, value, sub, color, bg) {
  var m = el("div", { class: "adm-metric" });
  m.style.setProperty("--metric-color", color);
  m.style.setProperty("--metric-bg", bg);
  var top = el("div", { class: "adm-metric-top" });
  top.appendChild(el("div", { class: "adm-metric-icon" }, icon));
  top.appendChild(el("div", { class: "adm-metric-label" }, label));
  m.appendChild(top);
  m.appendChild(el("div", { class: "adm-metric-value" }, String(value)));
  m.appendChild(el("div", { class: "adm-metric-sub" }, sub || ""));
  return m;
}

function buildEmpty(icon, text) {
  var e = el("div", { class: "adm-empty" });
  e.appendChild(el("div", { class: "adm-empty-icon" }, icon));
  e.appendChild(el("div", { class: "adm-empty-text" }, text));
  return e;
}

/* ═══ USERS ═══ */
async function renderAdminUsers() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });
  var users = await AdminPanel.loadUsers();

  var filters = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;" });
  var filterDefs = [
    { id: "all", label: "Все", count: users.length },
    { id: "jetch", label: "⭐ JETCH+", count: users.filter(function (u) { return u.license.active || u.license.forever; }).length },
    { id: "blocked", label: "🚫 Бан", count: users.filter(function (u) { return u.blocked; }).length },
    { id: "active", label: "📈 Активные", count: users.filter(function (u) { return u.analyzed > 0; }).length }
  ];
  for (var f = 0; f < filterDefs.length; f++) {
    (function (fd) {
      var chip = el("button", { type: "button", "data-filter": fd.id });
      chip.className = "adm-chip" + (AdminPanel.cache.userFilter === fd.id ? " active" : "");
      chip.textContent = fd.label + " · " + fd.count;
      chip.addEventListener("click", function () {
        AdminPanel.cache.userFilter = fd.id;
        var all = filters.querySelectorAll("[data-filter]");
        for (var k = 0; k < all.length; k++) {
          all[k].className = "adm-chip" + (all[k].getAttribute("data-filter") === fd.id ? " active" : "");
        }
        renderUserList(users, searchInp.value);
      });
      filters.appendChild(chip);
    })(filterDefs[f]);
  }
  section.appendChild(filters);

  var searchInp = UI.input("🔍  Поиск по нику или UID...");
  searchInp.style.marginBottom = "12px";
  section.appendChild(searchInp);

  var listWrap = el("div", { id: "adminUsersList" });
  section.appendChild(listWrap);

  function renderUserList(allUsers, filter) {
    listWrap.innerHTML = "";
    var q = (filter || "").toLowerCase();
    var f = AdminPanel.cache.userFilter;
    var filtered = allUsers.filter(function (u) {
      if (f === "jetch" && !(u.license.active || u.license.forever)) return false;
      if (f === "blocked" && !u.blocked) return false;
      if (f === "active" && u.analyzed <= 0) return false;
      if (q && u.nickname.toLowerCase().indexOf(q) < 0 && u.uid.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (!filtered.length) {
      listWrap.appendChild(buildEmpty("🔍", "Ничего не найдено"));
      return;
    }
    listWrap.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:8px;" }, "Найдено: " + filtered.length));
    for (var i = 0; i < filtered.length; i++) listWrap.appendChild(buildUserCard(filtered[i], i));
  }
  searchInp.addEventListener("input", function () { renderUserList(users, searchInp.value); });
  renderUserList(users, "");

  frag.appendChild(section);
  return frag;
}

function buildUserCard(user, idx) {
  var card = el("div", { class: "adm-user-card" });
  card.style.animationDelay = Math.min(idx * 20, 300) + "ms";
  var av = el("div", { class: "adm-avatar" });
  if (user.avatar) av.style.backgroundImage = "url(" + user.avatar + ")";
  else av.textContent = String(user.nickname).charAt(0).toUpperCase();
  card.appendChild(av);

  var info = el("div", { class: "adm-user-info" });
  var nickRow = el("div", { class: "adm-user-nick" });
  nickRow.appendChild(document.createTextNode(user.nickname));
  if (user.license.forever) nickRow.appendChild(UI.badge("JETCH+ ∞", "#fbbf24", "rgba(251,191,36,0.12)"));
  else if (user.license.active) nickRow.appendChild(UI.badge("JETCH+", "#fbbf24", "rgba(251,191,36,0.12)"));
  if (user.blocked) nickRow.appendChild(UI.badge("BAN", "#ef4444", "rgba(239,68,68,0.12)"));
  info.appendChild(nickRow);
  info.appendChild(el("div", { class: "adm-user-uid" }, user.uid));
  card.appendChild(info);
  card.appendChild(el("div", { class: "adm-user-arrow" }, "›"));
  card.addEventListener("click", function () { openUserDetailModal(user); });
  return card;
}

/* ═══ USER DETAIL MODAL (с вкладками) ═══ */
function openUserDetailModal(user) {
  var existing = document.getElementById("adminUserModal");
  if (existing) existing.remove();

  var ov = el("div", { id: "adminUserModal" });
  ov.style.cssText = "position:fixed;inset:0;z-index:2147483645;background:rgba(2,3,8,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;animation:admFadeUp 0.25s ease;";

  var box = el("div");
  box.style.cssText = "max-width:580px;width:100%;background:linear-gradient(160deg,rgba(22,24,31,0.98),rgba(14,16,22,0.98));border:1px solid rgba(139,92,246,0.4);border-radius:18px;padding:24px;max-height:92vh;overflow-y:auto;box-shadow:0 40px 100px -30px rgba(0,0,0,0.9),0 0 80px -40px rgba(139,92,246,0.7);animation:admFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;";

  /* HEADER */
  var header = el("div", { style: "display:flex;align-items:center;gap:14px;margin-bottom:16px;" });
  var av = el("div", { class: "adm-avatar", style: "width:58px;height:58px;font-size:22px;border-radius:14px;" });
  if (user.avatar) av.style.backgroundImage = "url(" + user.avatar + ")";
  else av.textContent = String(user.nickname).charAt(0).toUpperCase();
  header.appendChild(av);
  var hInfo = el("div", { style: "flex:1;min-width:0;" });
  hInfo.appendChild(el("div", { style: "font-size:19px;font-weight:800;color:var(--text);" }, user.nickname));
  hInfo.appendChild(el("div", { style: "font-size:10.5px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:4px;word-break:break-all;line-height:1.4;" }, user.uid));
  header.appendChild(hInfo);
  var closeBtn = el("button", { type: "button", style: "width:32px;height:32px;border-radius:9px;background:rgba(30,33,41,0.6);border:1px solid var(--border);color:var(--text-muted);cursor:pointer;font-size:13px;flex-shrink:0;font-family:inherit;" }, "✕");
  closeBtn.addEventListener("click", function () { ov.remove(); });
  header.appendChild(closeBtn);
  box.appendChild(header);

  /* STATUS BADGES */
  var statusRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;" });
  statusRow.appendChild(UI.badge("📈 Анализов: " + user.analyzed, "#22d3ee", "rgba(34,211,238,0.12)"));
  if (user.license.forever) statusRow.appendChild(UI.badge("⭐ JETCH+ ∞", "#fbbf24", "rgba(251,191,36,0.14)"));
  else if (user.license.active) statusRow.appendChild(UI.badge("⭐ JETCH+", "#fbbf24", "rgba(251,191,36,0.14)"));
  else statusRow.appendChild(UI.badge("FREE", "var(--text-muted)", "var(--bg-elev)"));
  if (user.blocked) statusRow.appendChild(UI.badge("🚫 ЗАБЛОКИРОВАН", "#ef4444", "rgba(239,68,68,0.14)"));
  box.appendChild(statusRow);

  /* TABS */
  var tabs = el("div", { class: "adm-modal-tabs" });
  var tabDefs = [
    { id: "actions", label: "⚡ Действия" },
    { id: "edit", label: "✏️ Редактировать" },
    { id: "data", label: "📋 Данные" }
  ];
  var contentWrap = el("div");
  var currentTab = "actions";

  for (var i = 0; i < tabDefs.length; i++) {
    (function (t) {
      var btn = el("button", { type: "button" });
      btn.className = "adm-modal-tab" + (t.id === currentTab ? " active" : "");
      btn.textContent = t.label;
      btn.addEventListener("click", function () {
        currentTab = t.id;
        var all = tabs.querySelectorAll(".adm-modal-tab");
        for (var j = 0; j < all.length; j++) {
          all[j].className = "adm-modal-tab" + (all[j].textContent.indexOf(t.label) >= 0 ? " active" : "");
        }
        renderTabContent(t.id);
      });
      tabs.appendChild(btn);
    })(tabDefs[i]);
  }
  box.appendChild(tabs);
  box.appendChild(contentWrap);

  /* ═══ RENDER CONTENT ═══ */
  function makeActionBtn(label, color, bg, handler) {
    var b = el("button", { type: "button" });
    b.className = "adm-action-btn";
    b.style.borderColor = color;
    b.style.background = bg;
    b.style.color = color;
    b.textContent = label;
    b.addEventListener("mouseenter", function () { b.style.background = color; b.style.color = "#0b0c10"; });
    b.addEventListener("mouseleave", function () { b.style.background = bg; b.style.color = color; });
    b.addEventListener("click", handler);
    return b;
  }

  async function renderTabContent(tabId) {
    contentWrap.innerHTML = "";

    /* ─── ACTIONS ─── */
    if (tabId === "actions") {
      contentWrap.appendChild(el("div", { class: "adm-section-title", style: "margin-top:0;" }, "Лицензия"));
      if (user.license.forever || user.license.active) {
        contentWrap.appendChild(makeActionBtn("❌ Снять JETCH+", "#ef4444", "rgba(239,68,68,0.08)", async function () {
          if (!confirm("Снять подписку с " + user.nickname + "?")) return;
          await AdminPanel.updateUser(user.uid, { "license__DOT__active": false, "license__DOT__forever": false, "license__DOT__expires": null });
          await AdminPanel.log("remove_jetch", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      } else {
        contentWrap.appendChild(makeActionBtn("⭐ Выдать JETCH+ бессрочно", "#fbbf24", "rgba(251,191,36,0.08)", async function () {
          if (!confirm("Выдать бессрочный JETCH+?")) return;
          await AdminPanel.updateUser(user.uid, { "license__DOT__active": true, "license__DOT__forever": true, "license__DOT__expires": null });
          await AdminPanel.log("give_jetch_forever", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
        contentWrap.appendChild(makeActionBtn("📅 Выдать JETCH+ на 30 дней", "#fbbf24", "rgba(251,191,36,0.08)", async function () {
          if (!confirm("Выдать JETCH+ на 30 дней?")) return;
          var d = new Date(); d.setDate(d.getDate() + 30);
          await AdminPanel.updateUser(user.uid, { "license__DOT__active": true, "license__DOT__forever": false, "license__DOT__expires": d.toISOString() });
          await AdminPanel.log("give_jetch_30d", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      }

      contentWrap.appendChild(el("div", { class: "adm-section-title" }, "Блокировка"));
      if (user.blocked) {
        contentWrap.appendChild(makeActionBtn("✅ Разблокировать", "#22c55e", "rgba(34,197,94,0.08)", async function () {
          if (!confirm("Разблокировать " + user.nickname + "?")) return;
          await AdminPanel.updateUser(user.uid, { blocked: false });
          await AdminPanel.log("unblock", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      } else {
        contentWrap.appendChild(makeActionBtn("🚫 Заблокировать", "#ef4444", "rgba(239,68,68,0.08)", async function () {
          if (!confirm("Заблокировать " + user.nickname + "?")) return;
          await AdminPanel.updateUser(user.uid, { blocked: true });
          await AdminPanel.log("block", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      }

      contentWrap.appendChild(el("div", { class: "adm-section-title" }, "Права"));
      var isAdm = await AdminPanel.isAdminUid(user.uid);
      if (isAdm) {
        contentWrap.appendChild(makeActionBtn("🛡 Снять с админов", "#f97316", "rgba(249,115,22,0.08)", async function () {
          if (!confirm("Снять админ-права?")) return;
          await AdminPanel.removeAdmin(user.uid);
          await AdminPanel.log("remove_admin", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      } else {
        contentWrap.appendChild(makeActionBtn("🛡 Сделать админом", "#fbbf24", "rgba(251,191,36,0.08)", async function () {
          if (!confirm("Дать админ-права " + user.nickname + "?")) return;
          await AdminPanel.addAdmin(user.uid);
          await AdminPanel.log("add_admin", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      }

      contentWrap.appendChild(el("div", { class: "adm-section-title" }, "Опасное"));
      contentWrap.appendChild(makeActionBtn("🗑️ Удалить аккаунт", "#ef4444", "rgba(239,68,68,0.08)", async function () {
        if (!confirm("УДАЛИТЬ " + user.nickname + "? Необратимо.")) return;
        if (!confirm("Точно удалить?")) return;
        await AdminPanel.deleteUser(user.uid);
        await AdminPanel.log("delete_user", user.nickname);
        ov.remove(); renderAdminTab("users");
      }));
    }

    /* ─── EDIT ─── */
    if (tabId === "edit") {
      var raw = await AdminPanel.getUserRaw(user.uid);

      contentWrap.appendChild(el("div", { class: "adm-section-title", style: "margin-top:0;" }, "Ник"));
      var nickWrap = el("div", { class: "adm-field" });
      nickWrap.appendChild(el("div", { class: "adm-field-label" }, "Никнейм"));
      var nickRow = el("div", { class: "adm-field-row" });
      var nickInp = el("input", { class: "adm-input-mini", type: "text", maxlength: "20", placeholder: "3-20 символов" });
      nickInp.value = user.nickname === "(без ника)" ? "" : user.nickname;
      nickRow.appendChild(nickInp);
      var nickSaveBtn = el("button", { type: "button", style: "padding:9px 14px;border-radius:9px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid #22c55e;background:rgba(34,197,94,0.10);color:#22c55e;" }, "Сменить");
      nickSaveBtn.addEventListener("click", async function () {
        var v = nickInp.value.trim();
        if (!v) { alert("Введи ник"); return; }
        if (!confirm("Сменить ник " + user.nickname + " → " + v + "?")) return;
        nickSaveBtn.disabled = true;
        nickSaveBtn.textContent = "...";
        var res = await AdminPanel.changeUserNick(user.uid, user.nickname === "(без ника)" ? "" : user.nickname, v);
        if (res.ok) {
          alert("✓ " + res.msg);
          ov.remove();
          renderAdminTab("users");
        } else {
          alert("✕ " + res.msg);
          nickSaveBtn.disabled = false;
          nickSaveBtn.textContent = "Сменить";
        }
      });
      nickRow.appendChild(nickSaveBtn);
      nickWrap.appendChild(nickRow);
      contentWrap.appendChild(nickWrap);

      contentWrap.appendChild(el("div", { class: "adm-section-title" }, "Статистика"));

      var fields = [
        { key: "analyzedcount", label: "Анализов матчей", type: "int" },
        { key: "aiquestions", label: "Вопросов ИИ", type: "int" },
        { key: "sessions", label: "Сессий", type: "int" },
        { key: "dailystreak", label: "Стрик (дней)", type: "int" },
        { key: "minigames_mmr", label: "MMR мини-игр", type: "int" },
        { key: "lockpickbest", label: "Рекорд: Взлом замка", type: "int" },
        { key: "automatonbest", label: "Рекорд: Автоматоны", type: "int" },
        { key: "direjumperbest", label: "Рекорд: Дири-Джампер", type: "int" },
        { key: "quizbest", label: "Рекорд: Викторина", type: "int" }
      ];

      for (var fi = 0; fi < fields.length; fi++) {
        (function (f) {
          var cur = raw[f.key];
          if (cur === undefined || cur === null) cur = 0;
          var wrap = el("div", { class: "adm-field" });
          wrap.appendChild(el("div", { class: "adm-field-label" }, f.label));
          var row = el("div", { class: "adm-field-row" });
          var inp = el("input", { class: "adm-input-mini adm-input-mono", type: "number" });
          inp.value = String(cur);
          row.appendChild(inp);
          var saveBtn = el("button", { type: "button", style: "padding:9px 14px;border-radius:9px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--accent);background:rgba(139,92,246,0.10);color:var(--accent-light);" }, "OK");
          saveBtn.addEventListener("click", async function () {
            var val = parseInt(inp.value, 10);
            if (isNaN(val) || val < 0) { alert("Введи число ≥ 0"); return; }
            var patch = {};
            patch[f.key] = val;
            await AdminPanel.updateUser(user.uid, patch);
            await AdminPanel.log("edit_field", user.nickname + " · " + f.key + " = " + val);
            saveBtn.textContent = "✓";
            saveBtn.style.borderColor = "#22c55e";
            saveBtn.style.color = "#22c55e";
            saveBtn.style.background = "rgba(34,197,94,0.10)";
            setTimeout(function () {
              saveBtn.textContent = "OK";
              saveBtn.style.borderColor = "var(--accent)";
              saveBtn.style.color = "var(--accent-light)";
              saveBtn.style.background = "rgba(139,92,246,0.10)";
            }, 1200);
          });
          row.appendChild(saveBtn);
          wrap.appendChild(row);
          contentWrap.appendChild(wrap);
        })(fields[fi]);
      }
    }

    /* ─── DATA ─── */
    if (tabId === "data") {
      var rawData = await AdminPanel.getUserRaw(user.uid);
      contentWrap.appendChild(el("div", { class: "adm-section-title", style: "margin-top:0;" }, "Сырые данные"));
      var jsonBox = el("div");
      jsonBox.style.cssText = "background:rgba(8,10,14,0.9);border:1px solid var(--border);border-radius:10px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--text-muted);line-height:1.6;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;";
      try {
        jsonBox.textContent = JSON.stringify(rawData, null, 2);
      } catch (e) { jsonBox.textContent = "(не удалось отобразить)"; }
      contentWrap.appendChild(jsonBox);

      var copyBtn = el("button", { type: "button", style: "margin-top:10px;padding:10px 16px;border-radius:10px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--accent);background:rgba(139,92,246,0.10);color:var(--accent-light);width:100%;" }, "📋 Скопировать JSON");
      copyBtn.addEventListener("click", function () {
        try {
          navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
          copyBtn.textContent = "✓ Скопировано";
          setTimeout(function () { copyBtn.textContent = "📋 Скопировать JSON"; }, 1500);
        } catch (e) { alert("Не удалось скопировать"); }
      });
      contentWrap.appendChild(copyBtn);
    }
  }

  renderTabContent("actions");

  ov.appendChild(box);
  ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

/* ═══ CONFIG ═══ */
async function renderAdminConfig() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });
  var cfg = await AdminPanel.loadConfig();
  if (!cfg) cfg = { maintenance: { enabled: false, message: "" }, notification: { enabled: false, text: "" }, minigames: {} };

  /* Тех работы */
  section.appendChild(el("div", { class: "adm-section-title" }, "🛠️ Тех работы"));
  var mntCard = el("div", { class: "adm-card" });
  mntCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.55;" }, "Все обычные пользователи увидят экран тех работ. Админы сохранят доступ."));

  var mntEnabled = cfg.maintenance.enabled;
  var mntRow = el("div", { class: "adm-set-row" });
  var mntText = el("div", { style: "flex:1;" });
  mntText.appendChild(el("div", { class: "adm-set-row-title" }, "Включить тех работы"));
  mntText.appendChild(el("div", { class: "adm-set-row-desc" }, "Сайт станет недоступен для юзеров"));
  mntRow.appendChild(mntText);
  var mntToggle = el("button", { type: "button", class: "adm-toggle" + (mntEnabled ? " on" : " off") });
  mntToggle.addEventListener("click", async function () {
    mntEnabled = !mntEnabled;
    mntToggle.className = "adm-toggle" + (mntEnabled ? " on" : " off");
    await AdminPanel.updateConfig({ "maintenance/enabled": mntEnabled });
    await AdminPanel.log("maintenance", mntEnabled ? "включены" : "выключены");
  });
  mntRow.appendChild(mntToggle);
  mntCard.appendChild(mntRow);

  mntCard.appendChild(el("div", { class: "adm-set-row-desc", style: "margin:12px 0 6px;font-size:10.5px;" }, "СООБЩЕНИЕ НА ЭКРАНЕ"));
  var mntMsgInp = UI.input("Например: Обновляем сервер...");
  mntMsgInp.value = cfg.maintenance.message || "";
  mntMsgInp.style.marginBottom = "8px";
  mntCard.appendChild(mntMsgInp);

  var mntUntilInp = el("input", { class: "adm-input-mini", type: "text", placeholder: "Время завершения (необязательно): 2026-10-13 18:00" });
  mntUntilInp.value = cfg.maintenance.until ? (function () {
    try {
      var d = new Date(cfg.maintenance.until);
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + " " +
        String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    } catch (e) { return ""; }
  })() : "";
  mntUntilInp.style.marginBottom = "8px";
  mntCard.appendChild(mntUntilInp);

  var mntSaveBtn = UI.btn("💾 Сохранить", { variant: "ghost" });
  mntSaveBtn.style.width = "100%";
  mntSaveBtn.addEventListener("click", async function () {
    var patch = { "maintenance/message": mntMsgInp.value };
    var untilVal = mntUntilInp.value.trim();
    if (untilVal) {
      var d = new Date(untilVal.replace(" ", "T"));
      if (!isNaN(d.getTime())) patch["maintenance/until"] = d.toISOString();
      else alert("Не понял дату. Используй формат 2026-10-13 18:00");
    } else {
      patch["maintenance/until"] = null;
    }
    await AdminPanel.updateConfig(patch);
    mntSaveBtn.textContent = "✓ Сохранено";
    setTimeout(function () { mntSaveBtn.textContent = "💾 Сохранить"; }, 1500);
  });
  mntCard.appendChild(mntSaveBtn);
  section.appendChild(mntCard);

  /* Уведомление */
  section.appendChild(el("div", { class: "adm-section-title" }, "📢 Уведомление"));
  var notifCard = el("div", { class: "adm-card" });
  notifCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.55;" }, "Баннер на главной странице для всех юзеров."));

  var notifEnabled = cfg.notification.enabled;
  var notifRow = el("div", { class: "adm-set-row" });
  var notifText = el("div", { style: "flex:1;" });
  notifText.appendChild(el("div", { class: "adm-set-row-title" }, "Показывать уведомление"));
  notifText.appendChild(el("div", { class: "adm-set-row-desc" }, "Вверху страницы «Главная»"));
  notifRow.appendChild(notifText);
  var notifToggle = el("button", { type: "button", class: "adm-toggle" + (notifEnabled ? " on" : " off") });
  notifToggle.addEventListener("click", async function () {
    notifEnabled = !notifEnabled;
    notifToggle.className = "adm-toggle" + (notifEnabled ? " on" : " off");
    await AdminPanel.updateConfig({ "notification/enabled": notifEnabled });
    await AdminPanel.log("notification", notifEnabled ? "включено" : "выключено");
  });
  notifRow.appendChild(notifToggle);
  notifCard.appendChild(notifRow);

  notifCard.appendChild(el("div", { class: "adm-set-row-desc", style: "margin:12px 0 6px;font-size:10.5px;" }, "ТЕКСТ"));
  var notifTextInp = UI.input("Например: Новая версия уже здесь!");
  notifTextInp.value = cfg.notification.text || "";
  notifTextInp.style.marginBottom = "8px";
  notifCard.appendChild(notifTextInp);

  var notifSaveBtn = UI.btn("💾 Сохранить", { variant: "ghost" });
  notifSaveBtn.style.width = "100%";
  notifSaveBtn.addEventListener("click", async function () {
    await AdminPanel.updateConfig({ "notification/text": notifTextInp.value });
    notifSaveBtn.textContent = "✓ Сохранено";
    setTimeout(function () { notifSaveBtn.textContent = "💾 Сохранить"; }, 1500);
  });
  notifCard.appendChild(notifSaveBtn);
  section.appendChild(notifCard);

  /* Мини-игры */
  section.appendChild(el("div", { class: "adm-section-title" }, "🎮 Мини-игры"));
  var gamesCard = el("div", { class: "adm-card" });
  var games = [
    { id: "lockpick", label: "🔓 Взлом замка" },
    { id: "automaton", label: "⌨️ Атака автоматонов" },
    { id: "direjumper", label: "🎪 Дири-Джампер" },
    { id: "quiz", label: "🧠 Викторина" }
  ];
  for (var g = 0; g < games.length; g++) {
    (function (game) {
      var isOn = cfg.minigames[game.id] !== false;
      var row = el("div", { class: "adm-set-row" });
      row.appendChild(el("div", { class: "adm-set-row-title" }, game.label));
      var toggle = el("button", { type: "button", class: "adm-toggle" + (isOn ? " on" : " off") });
      toggle.addEventListener("click", async function () {
        isOn = !isOn;
        toggle.className = "adm-toggle" + (isOn ? " on" : " off");
        var patch = {}; patch["minigames/" + game.id] = isOn;
        await AdminPanel.updateConfig(patch);
        await AdminPanel.log("minigame_toggle", game.id + " -> " + isOn);
      });
      row.appendChild(toggle);
      gamesCard.appendChild(row);
    })(games[g]);
  }
  section.appendChild(gamesCard);

  frag.appendChild(section);
  return frag;
}

/* ═══ LOGS ═══ */
function buildLogRow(log) {
  var actionMeta = {
    give_jetch_forever: { icon: "⭐", label: "Выдан JETCH+ ∞", color: "#fbbf24" },
    give_jetch_30d:     { icon: "📅", label: "Выдан JETCH+ 30д", color: "#fbbf24" },
    remove_jetch:       { icon: "❌", label: "Снят JETCH+", color: "#ef4444" },
    block:              { icon: "🚫", label: "Заблокирован", color: "#ef4444" },
    unblock:            { icon: "✅", label: "Разблокирован", color: "#22c55e" },
    reset_stats:        { icon: "🔄", label: "Сброс статистики", color: "#f97316" },
    delete_user:        { icon: "🗑️", label: "Удалён аккаунт", color: "#ef4444" },
    add_admin:          { icon: "🛡️", label: "Добавлен админ", color: "#fbbf24" },
    remove_admin:       { icon: "🛡️", label: "Удалён админ", color: "#ef4444" },
    maintenance:        { icon: "🛠️", label: "Тех работы", color: "#8b5cf6" },
    notification:       { icon: "📢", label: "Уведомление", color: "#22d3ee" },
    minigame_toggle:    { icon: "🎮", label: "Мини-игра", color: "#a78bfa" },
    change_nick:        { icon: "✏️", label: "Смена ника", color: "#22d3ee" },
    edit_field:         { icon: "📝", label: "Редактирование", color: "#a78bfa" }
  };
  var meta = actionMeta[log.action] || { icon: "📌", label: log.action, color: "#8b5cf6" };
  var row = el("div", { class: "adm-log-row" });
  row.style.setProperty("--log-color", meta.color);
  row.appendChild(el("div", { class: "adm-log-icon" }, meta.icon));
  var body = el("div", { class: "adm-log-body" });
  body.appendChild(el("div", { class: "adm-log-title" }, meta.label));
  if (log.details) body.appendChild(el("div", { class: "adm-log-detail" }, log.details));
  row.appendChild(body);
  var time = el("div", { class: "adm-log-time" });
  try {
    var d = new Date(log.ts);
    var now = new Date();
    var diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) time.textContent = "сейчас";
    else if (diffMin < 60) time.textContent = diffMin + " мин";
    else if (diffMin < 1440) time.textContent = Math.floor(diffMin / 60) + " ч";
    else time.textContent = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  } catch (e) {}
  row.appendChild(time);
  return row;
}

async function renderAdminLogs() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });
  var logs = await AdminPanel.loadLogs(100);
  if (!logs.length) {
    var ec = el("div", { class: "adm-card" });
    ec.appendChild(buildEmpty("📭", "Пока нет записей."));
    section.appendChild(ec);
    frag.appendChild(section);
    return frag;
  }
  section.appendChild(el("div", { class: "adm-section-title" }, "📜 Всего: " + logs.length));
  var card = el("div", { class: "adm-card" });
  for (var i = 0; i < logs.length; i++) card.appendChild(buildLogRow(logs[i]));
  section.appendChild(card);
  frag.appendChild(section);
  return frag;
}

/* ═══ ADMINS ═══ */
async function renderAdminAdmins() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });

  section.appendChild(el("div", { class: "adm-section-title" }, "⭐ Постоянные"));
  var hcCard = el("div", { class: "adm-card" });
  hcCard.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;line-height:1.55;" }, "Хардкод-админы. Не могут быть убраны через интерфейс."));
  for (var h = 0; h < ADMIN_NICKNAMES.length; h++) {
    var hRow = el("div", { class: "adm-adm-card hardcoded" });
    hRow.appendChild(el("div", { class: "adm-adm-crown" }, "👑"));
    var hInfo = el("div", { style: "flex:1;min-width:0;" });
    hInfo.appendChild(el("div", { style: "font-size:14px;font-weight:800;color:var(--text);" }, ADMIN_NICKNAMES[h]));
    hInfo.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:3px;letter-spacing:0.05em;" }, "ЗАЩИЩЁН · ХАРДКОД"));
    hRow.appendChild(hInfo);
    hcCard.appendChild(hRow);
  }
  section.appendChild(hcCard);

  section.appendChild(el("div", { class: "adm-section-title" }, "🛡️ Дополнительные"));
  var admins = await AdminPanel.loadAdmins();
  var uids = Object.keys(admins).filter(function (k) { return admins[k] === true; });
  var nickMap = {};
  try { nickMap = await AdminPanel.getNicknamesForUids(uids); } catch (e) {}
  var listCard = el("div", { class: "adm-card" });
  if (!uids.length) listCard.appendChild(buildEmpty("🕳️", "Пока никого нет."));
  else {
    for (var i = 0; i < uids.length; i++) {
      (function (uid) {
        var nick = nickMap[uid] || "(без ника)";
        var row = el("div", { class: "adm-adm-card" });
        row.appendChild(el("div", { class: "adm-adm-crown regular" }, "🛡️"));
        var info = el("div", { style: "flex:1;min-width:0;" });
        info.appendChild(el("div", { style: "font-size:13.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, nick));
        info.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:3px;word-break:break-all;" }, uid));
        row.appendChild(info);
        var rmBtn = el("button", { type: "button", style: "padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid #ef4444;background:rgba(239,68,68,0.08);color:#ef4444;flex-shrink:0;" }, "Убрать");
        rmBtn.addEventListener("mouseenter", function () { rmBtn.style.background = "#ef4444"; rmBtn.style.color = "#0b0c10"; });
        rmBtn.addEventListener("mouseleave", function () { rmBtn.style.background = "rgba(239,68,68,0.08)"; rmBtn.style.color = "#ef4444"; });
        rmBtn.addEventListener("click", async function () {
          if (!confirm("Убрать админ-права у " + nick + "?")) return;
          await AdminPanel.removeAdmin(uid);
          renderAdminTab("admins");
        });
        row.appendChild(rmBtn);
        listCard.appendChild(row);
      })(uids[i]);
    }
  }
  section.appendChild(listCard);

  section.appendChild(el("div", { class: "adm-section-title" }, "➕ Добавить"));
  var addCard = el("div", { class: "adm-card" });
  addCard.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;line-height:1.55;" }, "Введи ник или UID игрока."));
  var addInp = UI.input("Ник или UID");
  addInp.style.marginBottom = "8px";
  addCard.appendChild(addInp);
  var msgEl = el("div", { style: "font-size:11.5px;min-height:18px;margin-bottom:10px;line-height:1.45;" });
  addCard.appendChild(msgEl);
  var addBtn = UI.btn("🛡️ Добавить");
  addBtn.style.width = "100%";
  addBtn.addEventListener("click", async function () {
    var v = addInp.value.trim();
    msgEl.textContent = "";
    if (!v) { msgEl.textContent = "✕ Введи ник или UID"; msgEl.style.color = "#ef4444"; return; }
    addBtn.disabled = true;
    addBtn.textContent = "🔍 Ищу...";
    var res = await AdminPanel.resolveInput(v);
    if (!res) {
      msgEl.textContent = "✕ Пользователь не найден";
      msgEl.style.color = "#ef4444";
      addBtn.disabled = false; addBtn.textContent = "🛡️ Добавить";
      return;
    }
    var exists = await AdminPanel.isAdminUid(res.uid);
    if (exists) {
      msgEl.textContent = "ℹ️ Уже админ";
      msgEl.style.color = "#eab308";
      addBtn.disabled = false; addBtn.textContent = "🛡️ Добавить";
      return;
    }
    if (!confirm("Дать админ-права " + (res.nickname || res.uid) + "?")) {
      addBtn.disabled = false; addBtn.textContent = "🛡️ Добавить"; return;
    }
    msgEl.textContent = "Выдаю...";
    var ok = await AdminPanel.addAdmin(res.uid);
    if (ok) { addInp.value = ""; renderAdminTab("admins"); }
    else {
      msgEl.textContent = "✕ Ошибка. Проверь правила Firebase.";
      msgEl.style.color = "#ef4444";
      addBtn.disabled = false; addBtn.textContent = "🛡️ Добавить";
    }
  });
  addCard.appendChild(addBtn);
  section.appendChild(addCard);

  frag.appendChild(section);
  return frag;
}

console.log("admin-panel v3.0 ready (clean maintenance, full user editor)");
