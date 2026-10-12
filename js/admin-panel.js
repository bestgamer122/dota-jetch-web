/* DOTA JETCH — ADMIN PANEL v2.0 (premium UI, hardcoded owner only) */

/* ─── ХАРДКОД: только эти ники всегда админы ─── */
var ADMIN_NICKNAMES = ["owner"];

/* ═══════════════════════════════════════════════════════════════
   ИНЖЕКТ СТИЛЕЙ (курсор + премиум UI)
   ═══════════════════════════════════════════════════════════════ */
(function injectAdminStyles() {
  if (document.getElementById("adminPanelStyles")) return;
  var s = document.createElement("style");
  s.id = "adminPanelStyles";
  s.textContent = `
    /* ── ФИКС КУРСОРА в модалках (z-index выше любого модала) ── */
    .cursor-dot, .cursor-ring { z-index: 2147483647 !important; }

    /* ══ АДМИН-ПАНЕЛЬ v2.0 ══ */
    @keyframes admFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes admGlow { 0%,100%{opacity:0.55} 50%{opacity:1} }
    @keyframes admPulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.08);opacity:0.75} }
    @keyframes admFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes admSlideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes admShimmer { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }

    .adm-wrapper { animation: admFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

    /* Hero баннер админки */
    .adm-hero {
      position: relative;
      padding: 26px 28px;
      border-radius: 20px;
      overflow: hidden;
      background:
        radial-gradient(120% 100% at 0% 0%, rgba(251,191,36,0.16), transparent 55%),
        radial-gradient(80% 90% at 100% 100%, rgba(139,92,246,0.20), transparent 55%),
        linear-gradient(135deg, rgba(20,22,30,1), rgba(12,14,20,1));
      border: 1px solid rgba(251,191,36,0.35);
      margin-bottom: 18px;
      box-shadow: 0 20px 60px -30px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
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
    .adm-hero::after {
      content: ''; position: absolute; top: -50%; right: -20%; width: 60%; height: 200%;
      background: radial-gradient(circle, rgba(251,191,36,0.28), transparent 60%);
      filter: blur(50px);
      animation: admGlow 4s ease-in-out infinite;
      pointer-events: none;
    }

    .adm-hero-inner { position: relative; z-index: 2; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
    .adm-hero-icon {
      width: 62px; height: 62px; border-radius: 16px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 30px;
      background: linear-gradient(135deg, rgba(251,191,36,0.20), rgba(139,92,246,0.20));
      border: 1px solid rgba(251,191,36,0.5);
      box-shadow: 0 0 30px -8px rgba(251,191,36,0.7);
      animation: admFloat 3.5s ease-in-out infinite;
    }
    .adm-hero-title {
      font-size: 24px; font-weight: 900; letter-spacing: -0.01em;
      background: linear-gradient(120deg, #fff 0%, #fbbf24 50%, #f8d478 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      animation: admShimmer 6s linear infinite;
      margin-bottom: 4px;
    }
    .adm-hero-sub { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
    .adm-hero-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }

    /* Табы */
    .adm-tabs {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px;
      padding: 6px; border-radius: 14px;
      background: rgba(20,22,30,0.5);
      border: 1px solid var(--border);
    }
    .adm-tab {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 10px;
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
    .adm-tab-icon { font-size: 15px; line-height: 1; }

    /* Секции */
    .adm-section { animation: admFadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
    .adm-section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--text-muted); text-transform: uppercase;
      margin: 22px 0 12px;
    }
    .adm-section-title::before {
      content: ''; width: 4px; height: 14px; border-radius: 2px;
      background: linear-gradient(180deg, #fbbf24, #8b5cf6);
      box-shadow: 0 0 12px rgba(251,191,36,0.7);
    }

    /* Карточка */
    .adm-card {
      background: linear-gradient(160deg, rgba(22,24,31,0.95), rgba(18,20,26,0.95));
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 14px;
      transition: border-color 0.25s ease;
    }
    .adm-card:hover { border-color: rgba(139,92,246,0.35); }

    /* Метрика */
    .adm-metric {
      position: relative;
      padding: 20px 22px;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(160deg, rgba(22,24,31,1), rgba(16,18,24,1));
      border: 1px solid var(--border);
      transition: all 0.25s ease;
    }
    .adm-metric::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--metric-color, #8b5cf6), transparent);
      opacity: 0.9;
    }
    .adm-metric::after {
      content: ''; position: absolute; top: -40%; right: -20%;
      width: 140px; height: 140px; border-radius: 50%;
      background: var(--metric-glow, rgba(139,92,246,0.4));
      filter: blur(50px);
      opacity: 0.35;
      pointer-events: none;
    }
    .adm-metric:hover {
      transform: translateY(-3px);
      border-color: var(--metric-color, #8b5cf6);
      box-shadow: 0 20px 40px -25px var(--metric-color, #8b5cf6);
    }
    .adm-metric-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; position: relative; z-index: 1; }
    .adm-metric-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      background: var(--metric-bg, rgba(139,92,246,0.15));
      border: 1px solid var(--metric-color, #8b5cf6);
      box-shadow: 0 0 20px -6px var(--metric-color, #8b5cf6);
    }
    .adm-metric-label {
      font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--text-muted); text-transform: uppercase;
    }
    .adm-metric-value {
      position: relative; z-index: 1;
      font-size: 32px; font-weight: 900; line-height: 1; color: var(--text);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .adm-metric-sub {
      position: relative; z-index: 1;
      font-size: 11px; color: var(--text-dim); margin-top: 6px;
      letter-spacing: 0.04em;
    }

    /* Строка топа */
    .adm-top-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      background: rgba(30,33,41,0.55);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }
    .adm-top-row:hover {
      border-color: rgba(139,92,246,0.4);
      background: rgba(30,33,41,0.85);
      transform: translateX(3px);
    }
    .adm-rank-badge {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(139,92,246,0.12);
      border: 1px solid rgba(139,92,246,0.4);
      color: var(--accent-light);
      flex-shrink: 0;
    }
    .adm-rank-badge.gold { background: linear-gradient(135deg, #fbbf24, #d97706); border-color: #fbbf24; color: #0b0c10; box-shadow: 0 0 20px -6px #fbbf24; }
    .adm-rank-badge.silver { background: linear-gradient(135deg, #d1d5db, #6b7280); border-color: #d1d5db; color: #0b0c10; }
    .adm-rank-badge.bronze { background: linear-gradient(135deg, #d97706, #7c2d12); border-color: #d97706; color: #fff; }

    /* User card */
    .adm-user-card {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      animation: admSlideIn 0.3s ease both;
    }
    .adm-user-card:hover {
      border-color: var(--accent);
      background: rgba(30,33,41,0.85);
      transform: translateX(2px);
    }
    .adm-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), var(--cyan));
      background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 900; font-size: 16px;
      border: 1px solid rgba(139,92,246,0.5);
      box-shadow: 0 4px 12px -6px rgba(139,92,246,0.7);
    }
    .adm-user-info { flex: 1; min-width: 0; }
    .adm-user-nick {
      font-size: 13.5px; font-weight: 700; color: var(--text);
      display: flex; align-items: center; gap: 6px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .adm-user-uid {
      font-size: 10.5px; color: var(--text-dim);
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

    /* Фильтр чипы */
    .adm-chip {
      padding: 7px 13px; border-radius: 9px;
      font-size: 11.5px; font-weight: 700; font-family: inherit;
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

    /* Log entry */
    .adm-log-row {
      display: flex; gap: 12px; padding: 12px 14px;
      background: rgba(30,33,41,0.45);
      border: 1px solid var(--border);
      border-left: 3px solid var(--log-color, #8b5cf6);
      border-radius: 12px;
      margin-bottom: 8px;
      animation: admFadeUp 0.35s ease both;
    }
    .adm-log-icon {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px;
      background: rgba(139,92,246,0.10);
      border: 1px solid var(--log-color, #8b5cf6);
    }
    .adm-log-body { flex: 1; min-width: 0; }
    .adm-log-title { font-size: 13px; font-weight: 700; color: var(--text); }
    .adm-log-detail { font-size: 11.5px; color: var(--text-muted); margin-top: 3px; line-height: 1.45; }
    .adm-log-time {
      font-size: 10.5px; color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }

    /* Toggle */
    .adm-toggle {
      width: 48px; height: 26px; border-radius: 13px;
      border: none; cursor: pointer; position: relative;
      transition: background 0.25s ease;
      flex-shrink: 0;
    }
    .adm-toggle::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .adm-toggle.on { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 0 20px -6px #22c55e; }
    .adm-toggle.off { background: rgba(255,255,255,0.10); }
    .adm-toggle.on::after { transform: translateX(22px); }

    /* Setting row */
    .adm-set-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .adm-set-row-title { flex: 1; font-size: 13.5px; font-weight: 600; color: var(--text); }
    .adm-set-row-desc { font-size: 11px; color: var(--text-dim); margin-top: 3px; line-height: 1.4; }

    /* Admin card (gold) */
    .adm-adm-card {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      border-radius: 14px;
      margin-bottom: 8px;
      animation: admFadeUp 0.35s ease both;
    }
    .adm-adm-card.hardcoded {
      background: linear-gradient(135deg, rgba(251,191,36,0.14), rgba(139,92,246,0.14));
      border: 1px solid rgba(251,191,36,0.5);
      box-shadow: 0 4px 20px -10px rgba(251,191,36,0.5);
    }
    .adm-adm-card.regular {
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
    }
    .adm-adm-crown {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      background: rgba(251,191,36,0.15);
      border: 1px solid rgba(251,191,36,0.6);
      box-shadow: 0 0 18px -6px rgba(251,191,36,0.7);
    }
    .adm-adm-crown.regular {
      background: rgba(139,92,246,0.12);
      border-color: rgba(139,92,246,0.5);
      box-shadow: 0 0 18px -6px rgba(139,92,246,0.6);
    }

    /* Пустое состояние */
    .adm-empty {
      text-align: center; padding: 40px 20px;
      color: var(--text-dim);
    }
    .adm-empty-icon { font-size: 42px; opacity: 0.35; margin-bottom: 10px; }
    .adm-empty-text { font-size: 13px; }

    /* ══════════════════════════════════════════════
       PREMIUM MAINTENANCE SCREEN
       ══════════════════════════════════════════════ */
    @keyframes mntAurora { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-4%,3%) scale(1.08)} 100%{transform:translate(3%,-3%) scale(1.03)} }
    @keyframes mntPulseRing { 0%{transform:scale(0.85);opacity:0.7} 100%{transform:scale(1.5);opacity:0} }
    @keyframes mntGearSpin { to{transform:rotate(360deg)} }
    @keyframes mntGearSpinRev { to{transform:rotate(-360deg)} }
    @keyframes mntTextShimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
    @keyframes mntBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes mntProgressGlow { 0%,100%{box-shadow:0 0 10px rgba(139,92,246,0.5)} 50%{box-shadow:0 0 24px rgba(139,92,246,0.9)} }

    .mnt-overlay {
      position: fixed; inset: 0; z-index: 2147483646;
      background: radial-gradient(120% 90% at 50% 30%, #140a20 0%, #0b0c10 45%, #04050a 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; overflow-y: auto;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .mnt-aurora {
      position: absolute; inset: -10%;
      background:
        radial-gradient(40% 32% at 15% 20%, rgba(139,92,246,0.55) 0%, transparent 60%),
        radial-gradient(35% 28% at 85% 25%, rgba(34,211,238,0.40) 0%, transparent 60%),
        radial-gradient(45% 38% at 75% 85%, rgba(251,191,36,0.32) 0%, transparent 65%),
        radial-gradient(35% 28% at 20% 80%, rgba(239,68,68,0.28) 0%, transparent 60%);
      filter: blur(80px) saturate(1.5);
      animation: mntAurora 22s ease-in-out infinite alternate;
      pointer-events: none;
    }
    .mnt-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(80% 70% at 50% 50%, #000 25%, transparent 75%);
      -webkit-mask-image: radial-gradient(80% 70% at 50% 50%, #000 25%, transparent 75%);
      pointer-events: none;
    }
    .mnt-card {
      position: relative; z-index: 2;
      max-width: 560px; width: 100%;
      background: linear-gradient(160deg, rgba(22,24,31,0.94), rgba(14,16,22,0.94));
      backdrop-filter: blur(28px) saturate(1.5);
      -webkit-backdrop-filter: blur(28px) saturate(1.5);
      border: 1px solid rgba(139,92,246,0.4);
      border-radius: 26px;
      padding: 44px 40px 36px;
      box-shadow:
        0 40px 100px -30px rgba(0,0,0,0.9),
        0 0 80px -30px rgba(139,92,246,0.7),
        inset 0 1px 0 rgba(255,255,255,0.05);
      animation: admFadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    .mnt-icon-wrap {
      position: relative;
      width: 110px; height: 110px;
      margin: 0 auto 26px;
      display: flex; align-items: center; justify-content: center;
    }
    .mnt-icon-ring {
      position: absolute; inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(139,92,246,0.55);
      animation: mntPulseRing 2.6s ease-out infinite;
    }
    .mnt-icon-ring.delay { animation-delay: 1.3s; }
    .mnt-gear {
      position: absolute;
      font-size: 26px;
      filter: drop-shadow(0 0 12px rgba(251,191,36,0.7));
    }
    .mnt-gear.g1 { top: -10px; left: 10px; animation: mntGearSpin 8s linear infinite; }
    .mnt-gear.g2 { bottom: -6px; right: 8px; animation: mntGearSpinRev 10s linear infinite; font-size: 22px; }
    .mnt-icon-main {
      width: 84px; height: 84px; border-radius: 24px;
      display: flex; align-items: center; justify-content: center;
      font-size: 40px;
      background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(34,211,238,0.20));
      border: 1px solid rgba(139,92,246,0.55);
      box-shadow: 0 0 40px -10px rgba(139,92,246,0.85), inset 0 1px 0 rgba(255,255,255,0.1);
      animation: mntBounce 3s ease-in-out infinite;
    }
    .mnt-title {
      font-size: 34px; font-weight: 900; text-align: center;
      letter-spacing: -0.02em; line-height: 1.1;
      background: linear-gradient(120deg, #fff 0%, #c4b5fd 40%, #22d3ee 70%, #fff 100%);
      background-size: 300% 100%;
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      animation: mntTextShimmer 5s linear infinite;
      margin-bottom: 12px;
    }
    .mnt-message {
      text-align: center;
      font-size: 14.5px; color: var(--text-muted);
      line-height: 1.65;
      max-width: 440px;
      margin: 0 auto 28px;
    }
    .mnt-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .mnt-info-cell {
      padding: 14px 16px;
      border-radius: 14px;
      background: rgba(30,33,41,0.5);
      border: 1px solid var(--border);
      text-align: center;
    }
    .mnt-info-label {
      font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;
    }
    .mnt-info-value {
      font-size: 17px; font-weight: 800; color: var(--text);
      font-variant-numeric: tabular-nums;
      font-family: 'JetBrains Mono', monospace;
    }
    .mnt-info-value.accent { color: var(--accent-light); }
    .mnt-info-value.gold { color: #fbbf24; }

    .mnt-progress-wrap { margin-bottom: 24px; }
    .mnt-progress-labels {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--text-dim);
      margin-bottom: 8px;
    }
    .mnt-progress {
      height: 8px; border-radius: 4px; overflow: hidden;
      background: rgba(255,255,255,0.06);
      position: relative;
    }
    .mnt-progress-fill {
      height: 100%; border-radius: 4px;
      background: linear-gradient(90deg, #8b5cf6, #22d3ee, #fbbf24);
      background-size: 200% 100%;
      animation: mntTextShimmer 3s linear infinite, mntProgressGlow 2s ease-in-out infinite;
      transition: width 0.6s ease;
    }

    .mnt-actions {
      display: flex; gap: 10px; justify-content: center;
      flex-wrap: wrap;
    }
    .mnt-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; border-radius: 12px;
      font-size: 13.5px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .mnt-btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9 60%, #22d3ee 140%);
      color: #fff;
      border-color: rgba(196,181,253,0.6);
      box-shadow: 0 10px 30px -12px rgba(139,92,246,0.9);
    }
    .mnt-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px -14px rgba(139,92,246,1); }
    .mnt-btn-ghost {
      background: rgba(30,33,41,0.7);
      color: var(--text-muted);
      border-color: var(--border);
    }
    .mnt-btn-ghost:hover { color: var(--text); border-color: var(--accent); }

    .mnt-footer {
      text-align: center;
      margin-top: 26px;
      padding-top: 22px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 11.5px;
      color: var(--text-dim);
      line-height: 1.6;
    }
    .mnt-footer-brand {
      display: inline-flex; align-items: center; gap: 8px;
      font-weight: 800; letter-spacing: 0.14em;
      color: var(--accent-light); text-transform: uppercase;
      font-size: 10.5px;
    }
    .mnt-footer-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 12px #22c55e;
      animation: admPulse 1.6s ease-in-out infinite;
    }

    @media (max-width: 520px) {
      .mnt-card { padding: 32px 22px 28px; border-radius: 20px; }
      .mnt-title { font-size: 26px; }
      .mnt-info-grid { grid-template-columns: 1fr; }
      .adm-hero { padding: 20px; }
      .adm-hero-title { font-size: 20px; }
      .adm-hero-actions { margin-left: 0; width: 100%; }
    }
  `;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL
   ═══════════════════════════════════════════════════════════════ */
var AdminPanel = {
  isAdmin: false,
  cache: { users: null, config: null, logs: null, activeTab: "dashboard", userFilter: "all" },

  checkAdmin: async function () {
    try {
      var nick = "";
      try { if (window.Store) nick = String(Store.get("nickname", "") || "").toLowerCase(); } catch (e) {}
      if (nick && ADMIN_NICKNAMES.indexOf(nick) >= 0) {
        this.isAdmin = true;
        return true;
      }
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
        var createdAt = 0;
        try {
          if (u.nickname) nickname = typeof u.nickname === "string" ? u.nickname : "";
          if (u.avatar) avatar = typeof u.avatar === "string" ? u.avatar : null;
          if (u["license__DOT__active"] !== undefined) license.active = u["license__DOT__active"] === true;
          if (u["license__DOT__forever"] !== undefined) license.forever = u["license__DOT__forever"] === true;
          if (u["license__DOT__expires"] !== undefined) license.expires = u["license__DOT__expires"];
          if (u.blocked !== undefined) blocked = u.blocked === true;
          if (u.analyzedcount !== undefined) analyzed = parseInt(u.analyzedcount, 10) || 0;
          if (u.sessions !== undefined) createdAt = parseInt(u.sessions, 10) || 0;
        } catch (e) {}
        list.push({ uid: uid, nickname: nickname || "(без ника)", avatar: avatar, license: license, blocked: blocked, analyzed: analyzed, raw: u });
      }
      list.sort(function (a, b) { return a.nickname.localeCompare(b.nickname); });
      this.cache.users = list;
      return list;
    } catch (e) { return []; }
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
        maintenance: data.maintenance || { enabled: false, message: "Ведутся технические работы. Скоро вернёмся!", until: null },
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
      list = list.slice(0, limit || 100);
      this.cache.logs = list;
      return list;
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
    if (s.length >= 25 && /^[A-Za-z0-9]+$/.test(s)) {
      return { uid: s, nickname: null, source: "uid" };
    }
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
  }
};
window.AdminPanel = AdminPanel;

/* ═══════════════════════════════════════════════════════════════
   MAINTENANCE CHECK
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

/* ═══════════════════════════════════════════════════════════════
   PREMIUM MAINTENANCE SCREEN
   ═══════════════════════════════════════════════════════════════ */
function showMaintenanceScreen(m) {
  if (document.getElementById("maintenanceOverlay")) return;

  var ov = document.createElement("div");
  ov.id = "maintenanceOverlay";
  ov.className = "mnt-overlay";

  var aurora = document.createElement("div");
  aurora.className = "mnt-aurora";
  ov.appendChild(aurora);

  var grid = document.createElement("div");
  grid.className = "mnt-grid";
  ov.appendChild(grid);

  var card = document.createElement("div");
  card.className = "mnt-card";

  /* Иконка */
  var iconWrap = document.createElement("div");
  iconWrap.className = "mnt-icon-wrap";
  var ring1 = document.createElement("div"); ring1.className = "mnt-icon-ring";
  var ring2 = document.createElement("div"); ring2.className = "mnt-icon-ring delay";
  var gear1 = document.createElement("div"); gear1.className = "mnt-gear g1"; gear1.textContent = "⚙️";
  var gear2 = document.createElement("div"); gear2.className = "mnt-gear g2"; gear2.textContent = "⚙️";
  var iconMain = document.createElement("div"); iconMain.className = "mnt-icon-main"; iconMain.textContent = "🛠️";
  iconWrap.appendChild(ring1); iconWrap.appendChild(ring2);
  iconWrap.appendChild(gear1); iconWrap.appendChild(gear2);
  iconWrap.appendChild(iconMain);
  card.appendChild(iconWrap);

  /* Заголовок */
  var title = document.createElement("div");
  title.className = "mnt-title";
  title.textContent = "Технические работы";
  card.appendChild(title);

  /* Сообщение */
  var msg = document.createElement("div");
  msg.className = "mnt-message";
  msg.textContent = m.message || "Ведутся технические работы. Скоро вернёмся!";
  card.appendChild(msg);

  /* Info grid */
  var infoGrid = document.createElement("div");
  infoGrid.className = "mnt-info-grid";

  /* Ячейка: статус */
  var cell1 = document.createElement("div");
  cell1.className = "mnt-info-cell";
  var l1 = document.createElement("div"); l1.className = "mnt-info-label"; l1.textContent = "Статус";
  var v1 = document.createElement("div"); v1.className = "mnt-info-value accent"; v1.textContent = "Обновление";
  cell1.appendChild(l1); cell1.appendChild(v1);
  infoGrid.appendChild(cell1);

  /* Ячейка: ETA */
  var until = m.until ? new Date(m.until) : null;
  var cell2 = document.createElement("div");
  cell2.className = "mnt-info-cell";
  var l2 = document.createElement("div"); l2.className = "mnt-info-label"; l2.textContent = "Завершение";
  var v2 = document.createElement("div"); v2.className = "mnt-info-value gold";
  if (until && until.getTime() > Date.now()) {
    v2.textContent = String(until.getDate()).padStart(2, "0") + ":" +
                     String(until.getMonth() + 1).padStart(2, "0") + " " +
                     String(until.getHours()).padStart(2, "0") + ":" +
                     String(until.getMinutes()).padStart(2, "0");
  } else {
    v2.textContent = "Скоро";
  }
  cell2.appendChild(l2); cell2.appendChild(v2);
  infoGrid.appendChild(cell2);

  card.appendChild(infoGrid);

  /* Прогресс (если есть until) */
  if (until && until.getTime() > Date.now()) {
    var progressWrap = document.createElement("div");
    progressWrap.className = "mnt-progress-wrap";

    var labels = document.createElement("div");
    labels.className = "mnt-progress-labels";
    var lblLeft = document.createElement("div");
    lblLeft.textContent = "Прогресс";
    var lblRight = document.createElement("div");
    lblRight.id = "mntCountdown";
    labels.appendChild(lblLeft);
    labels.appendChild(lblRight);
    progressWrap.appendChild(labels);

    var bar = document.createElement("div");
    bar.className = "mnt-progress";
    var fill = document.createElement("div");
    fill.className = "mnt-progress-fill";
    fill.style.width = "15%";
    bar.appendChild(fill);
    progressWrap.appendChild(bar);

    card.appendChild(progressWrap);

    /* Обновление прогресса каждые секунды */
    setTimeout(function () {
      function tick() {
        var now = Date.now();
        var total = until.getTime() - (until.getTime() - 60 * 60 * 1000); // окно 60 мин назад
        var diff = until.getTime() - now;
        var lbl = document.getElementById("mntCountdown");
        if (!lbl) return;
        if (diff <= 0) {
          lbl.textContent = "Готово!";
          fill.style.width = "100%";
          setTimeout(function () { location.reload(); }, 1500);
          return;
        }
        var min = Math.floor(diff / 60000);
        var sec = Math.floor((diff % 60000) / 1000);
        lbl.textContent = (min > 60 ? Math.floor(min / 60) + " ч " + (min % 60) + " мин" : min + " мин " + sec + " сек");
        var pct = Math.max(5, Math.min(98, 100 - (diff / (60 * 60 * 1000)) * 100));
        fill.style.width = pct + "%";
        setTimeout(tick, 1000);
      }
      tick();
    }, 100);
  }

  /* Кнопки */
  var actions = document.createElement("div");
  actions.className = "mnt-actions";

  var btnRefresh = document.createElement("button");
  btnRefresh.type = "button";
  btnRefresh.className = "mnt-btn mnt-btn-primary";
  btnRefresh.innerHTML = '<span>🔄</span><span>Обновить сейчас</span>';
  btnRefresh.addEventListener("click", function () { location.reload(); });
  actions.appendChild(btnRefresh);

  card.appendChild(actions);

  /* Footer */
  var footer = document.createElement("div");
  footer.className = "mnt-footer";
  var brand = document.createElement("div");
  brand.className = "mnt-footer-brand";
  var dot = document.createElement("span");
  dot.className = "mnt-footer-dot";
  brand.appendChild(dot);
  brand.appendChild(document.createTextNode("DOTA JETCH AI 2.0"));
  footer.appendChild(brand);
  var tip = document.createElement("div");
  tip.style.marginTop = "8px";
  tip.textContent = "Спасибо за терпение. Мы делаем сайт лучше для тебя.";
  footer.appendChild(tip);
  card.appendChild(footer);

  ov.appendChild(card);
  document.body.appendChild(ov);
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL RENDER
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
    deny.appendChild(el("div", { class: "dim", style: "font-size:12.5px;line-height:1.55;max-width:340px;margin:0 auto;" }, "Эта страница доступна только администраторам. Если ты считаешь, что это ошибка — обратись к владельцу."));
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

  var icon = el("div", { class: "adm-hero-icon" }, "🛡️");
  inner.appendChild(icon);

  var text = el("div", { style: "flex:1;min-width:180px;" });
  var nick = "";
  try { nick = Store.get("nickname", "") || ""; } catch (e) {}
  text.appendChild(el("div", { class: "adm-hero-title" }, "Админ-панель"));
  text.appendChild(el("div", { class: "adm-hero-sub" }, "Добро пожаловать" + (nick ? ", " + nick : "") + ". Управляй пользователями, настройками и логами."));
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
          var isA = all[j].getAttribute("data-admintab") === t.id;
          all[j].className = "adm-tab" + (isA ? " active" : "");
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

  var stats = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;" });
  stats.appendChild(buildMetric("👥", "Всего аккаунтов", total, "зарегистрировано", "#22d3ee", "rgba(34,211,238,0.12)", "rgba(34,211,238,0.4)"));
  stats.appendChild(buildMetric("⭐", "JETCH+", jetch, "активных подписок", "#fbbf24", "rgba(251,191,36,0.12)", "rgba(251,191,36,0.4)"));
  stats.appendChild(buildMetric("🚫", "Заблокировано", blocked, "нарушителей", "#ef4444", "rgba(239,68,68,0.12)", "rgba(239,68,68,0.4)"));
  stats.appendChild(buildMetric("📈", "Анализов", totalAnalyzed, "суммарно", "#22c55e", "rgba(34,197,94,0.12)", "rgba(34,197,94,0.4)"));
  section.appendChild(stats);

  /* Топ-5 */
  var topTitle = el("div", { class: "adm-section-title" }, "🔥 Топ-5 по анализам");
  section.appendChild(topTitle);

  var topCard = el("div", { class: "adm-card" });
  var sorted = users.slice().sort(function (a, b) { return b.analyzed - a.analyzed; }).slice(0, 5);
  if (!sorted.length) {
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
      row.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:#22d3ee;" }, u.analyzed.toLocaleString()));
      topCard.appendChild(row);
    }
  }
  section.appendChild(topCard);

  /* Последние действия */
  var logsTitle = el("div", { class: "adm-section-title" }, "🕐 Последние действия");
  section.appendChild(logsTitle);
  var logs = await AdminPanel.loadLogs(5);
  var logsCard = el("div", { class: "adm-card" });
  if (!logs.length) {
    logsCard.appendChild(buildEmpty("📭", "Пока ничего не происходило"));
  } else {
    for (var k = 0; k < logs.length; k++) {
      logsCard.appendChild(buildLogRow(logs[k]));
    }
  }
  section.appendChild(logsCard);

  frag.appendChild(section);
  return frag;
}

function buildMetric(icon, label, value, sub, color, bg, glow) {
  var m = el("div", { class: "adm-metric" });
  m.style.setProperty("--metric-color", color);
  m.style.setProperty("--metric-bg", bg);
  m.style.setProperty("--metric-glow", glow);
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

  var filters = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" });
  var filterDefs = [
    { id: "all", label: "Все", count: users.length },
    { id: "jetch", label: "⭐ JETCH+", count: users.filter(function (u) { return u.license.active || u.license.forever; }).length },
    { id: "blocked", label: "🚫 Забанены", count: users.filter(function (u) { return u.blocked; }).length },
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
          var isA = all[k].getAttribute("data-filter") === fd.id;
          all[k].className = "adm-chip" + (isA ? " active" : "");
        }
        renderUserList(users, searchInp.value);
      });
      filters.appendChild(chip);
    })(filterDefs[f]);
  }
  section.appendChild(filters);

  var searchWrap = el("div", { style: "position:relative;margin-bottom:14px;" });
  var searchInp = UI.input("🔍  Поиск по нику или UID...");
  searchWrap.appendChild(searchInp);
  section.appendChild(searchWrap);

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

    for (var i = 0; i < filtered.length; i++) {
      listWrap.appendChild(buildUserCard(filtered[i], i));
    }
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

/* ═══ USER DETAIL MODAL ═══ */
function openUserDetailModal(user) {
  var existing = document.getElementById("adminUserModal");
  if (existing) existing.remove();

  var ov = el("div", { id: "adminUserModal" });
  ov.style.cssText = "position:fixed;inset:0;z-index:2147483645;background:rgba(2,3,8,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;animation:admFadeUp 0.25s ease;";

  var box = el("div");
  box.style.cssText = "max-width:540px;width:100%;background:linear-gradient(160deg,rgba(22,24,31,0.98),rgba(14,16,22,0.98));border:1px solid rgba(139,92,246,0.4);border-radius:20px;padding:26px;max-height:92vh;overflow-y:auto;box-shadow:0 40px 100px -30px rgba(0,0,0,0.9),0 0 80px -40px rgba(139,92,246,0.7);animation:admFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;";

  var header = el("div", { style: "display:flex;align-items:center;gap:16px;margin-bottom:20px;" });
  var av = el("div", { class: "adm-avatar", style: "width:64px;height:64px;font-size:24px;border-radius:16px;" });
  if (user.avatar) av.style.backgroundImage = "url(" + user.avatar + ")";
  else av.textContent = String(user.nickname).charAt(0).toUpperCase();
  header.appendChild(av);

  var hInfo = el("div", { style: "flex:1;min-width:0;" });
  hInfo.appendChild(el("div", { style: "font-size:20px;font-weight:800;color:var(--text);" }, user.nickname));
  hInfo.appendChild(el("div", { style: "font-size:10.5px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:5px;word-break:break-all;line-height:1.4;" }, user.uid));
  header.appendChild(hInfo);

  var closeBtn = el("button", { type: "button", style: "width:34px;height:34px;border-radius:10px;background:rgba(30,33,41,0.6);border:1px solid var(--border);color:var(--text-muted);cursor:pointer;font-size:14px;flex-shrink:0;font-family:inherit;" }, "✕");
  closeBtn.addEventListener("mouseenter", function () { closeBtn.style.color = "var(--text)"; closeBtn.style.borderColor = "var(--accent)"; });
  closeBtn.addEventListener("mouseleave", function () { closeBtn.style.color = "var(--text-muted)"; closeBtn.style.borderColor = "var(--border)"; });
  closeBtn.addEventListener("click", function () { ov.remove(); });
  header.appendChild(closeBtn);
  box.appendChild(header);

  var statusRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:22px;" });
  statusRow.appendChild(UI.badge("📈 Анализов: " + user.analyzed, "#22d3ee", "rgba(34,211,238,0.12)"));
  if (user.license.forever) statusRow.appendChild(UI.badge("⭐ JETCH+ ∞", "#fbbf24", "rgba(251,191,36,0.14)"));
  else if (user.license.active) statusRow.appendChild(UI.badge("⭐ JETCH+", "#fbbf24", "rgba(251,191,36,0.14)"));
  else statusRow.appendChild(UI.badge("FREE", "var(--text-muted)", "var(--bg-elev)"));
  if (user.blocked) statusRow.appendChild(UI.badge("🚫 ЗАБЛОКИРОВАН", "#ef4444", "rgba(239,68,68,0.14)"));
  box.appendChild(statusRow);

  var actionsTitle = el("div", { class: "adm-section-title", style: "margin-top:0;" }, "Действия");
  box.appendChild(actionsTitle);

  function makeActionBtn(label, color, bg, handler) {
    var b = el("button", { type: "button" });
    b.textContent = label;
    b.style.cssText = "display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;margin-bottom:8px;border-radius:12px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid " + color + ";background:" + bg + ";color:" + color + ";text-align:left;transition:all 0.2s ease;";
    b.addEventListener("mouseenter", function () { b.style.background = color; b.style.color = "#0b0c10"; b.style.transform = "translateX(3px)"; });
    b.addEventListener("mouseleave", function () { b.style.background = bg; b.style.color = color; b.style.transform = "translateX(0)"; });
    b.addEventListener("click", handler);
    return b;
  }

  if (user.license.forever || user.license.active) {
    box.appendChild(makeActionBtn("❌ Снять JETCH+", "#ef4444", "rgba(239,68,68,0.08)", async function () {
      if (!confirm("Снять подписку с " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { "license__DOT__active": false, "license__DOT__forever": false, "license__DOT__expires": null });
      await AdminPanel.log("remove_jetch", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  } else {
    box.appendChild(makeActionBtn("⭐ Выдать JETCH+ бессрочно", "#fbbf24", "rgba(251,191,36,0.08)", async function () {
      if (!confirm("Выдать бессрочный JETCH+ для " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { "license__DOT__active": true, "license__DOT__forever": true, "license__DOT__expires": null });
      await AdminPanel.log("give_jetch_forever", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  }

  if (user.blocked) {
    box.appendChild(makeActionBtn("✅ Разблокировать", "#22c55e", "rgba(34,197,94,0.08)", async function () {
      if (!confirm("Разблокировать " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { blocked: false });
      await AdminPanel.log("unblock", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  } else {
    box.appendChild(makeActionBtn("🚫 Заблокировать", "#ef4444", "rgba(239,68,68,0.08)", async function () {
      if (!confirm("Заблокировать " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { blocked: true });
      await AdminPanel.log("block", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  }

  (async function () {
    try {
      var isAdm = await AdminPanel.isAdminUid(user.uid);
      if (isAdm) {
        box.appendChild(makeActionBtn("🛡 Снять с админов", "#f97316", "rgba(249,115,22,0.08)", async function () {
          if (!confirm("Снять админ-права с " + user.nickname + "?")) return;
          await AdminPanel.removeAdmin(user.uid);
          await AdminPanel.log("remove_admin", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      } else {
        box.appendChild(makeActionBtn("🛡 Сделать админом", "#fbbf24", "rgba(251,191,36,0.08)", async function () {
          if (!confirm("Дать админ-права " + user.nickname + "?")) return;
          await AdminPanel.addAdmin(user.uid);
          await AdminPanel.log("add_admin", user.nickname);
          ov.remove(); renderAdminTab("users");
        }));
      }
    } catch (e) {}
  })();

  box.appendChild(makeActionBtn("🔄 Сбросить статистику", "#f97316", "rgba(249,115,22,0.08)", async function () {
    if (!confirm("Сбросить статистику для " + user.nickname + "?")) return;
    await AdminPanel.updateUser(user.uid, { analyzedcount: 0, achievementsunlocked: [], diarynotes: [] });
    await AdminPanel.log("reset_stats", user.nickname);
    ov.remove(); renderAdminTab("users");
  }));

  box.appendChild(makeActionBtn("🗑️ Удалить аккаунт", "#ef4444", "rgba(239,68,68,0.08)", async function () {
    if (!confirm("УДАЛИТЬ " + user.nickname + "? Это необратимо.")) return;
    if (!confirm("Точно удалить? Данные нельзя будет восстановить.")) return;
    await AdminPanel.deleteUser(user.uid);
    await AdminPanel.log("delete_user", user.nickname);
    ov.remove(); renderAdminTab("users");
  }));

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
  section.appendChild(el("div", { class: "adm-section-title" }, "🛠️ Режим тех работ"));
  var mntCard = el("div", { class: "adm-card" });
  mntCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.55;" }, "Все пользователи увидят премиум-экран технических работ. Ты как админ сможешь продолжать пользоваться сайтом."));

  var mntEnabled = cfg.maintenance.enabled;
  var mntRow = el("div", { class: "adm-set-row" });
  var mntText = el("div", { style: "flex:1;" });
  mntText.appendChild(el("div", { class: "adm-set-row-title" }, "Включить тех работы"));
  mntText.appendChild(el("div", { class: "adm-set-row-desc" }, "Сайт будет недоступен для обычных пользователей"));
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

  mntCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:14px;margin-bottom:6px;" }, "Сообщение на экране"));
  var mntMsgInp = UI.input("Например: Обновляем сервер...");
  mntMsgInp.value = cfg.maintenance.message || "";
  mntMsgInp.style.marginBottom = "8px";
  mntCard.appendChild(mntMsgInp);

  var mntSaveBtn = UI.btn("💾 Сохранить сообщение", { variant: "ghost" });
  mntSaveBtn.style.width = "100%";
  mntSaveBtn.addEventListener("click", async function () {
    await AdminPanel.updateConfig({ "maintenance/message": mntMsgInp.value });
    mntSaveBtn.textContent = "✓ Сохранено";
    setTimeout(function () { mntSaveBtn.textContent = "💾 Сохранить сообщение"; }, 1500);
  });
  mntCard.appendChild(mntSaveBtn);

  section.appendChild(mntCard);

  /* Уведомление */
  section.appendChild(el("div", { class: "adm-section-title" }, "📢 Глобальное уведомление"));
  var notifCard = el("div", { class: "adm-card" });
  notifCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.55;" }, "Показывается всем пользователям на главной странице."));

  var notifEnabled = cfg.notification.enabled;
  var notifRow = el("div", { class: "adm-set-row" });
  var notifText = el("div", { style: "flex:1;" });
  notifText.appendChild(el("div", { class: "adm-set-row-title" }, "Показывать уведомление"));
  notifText.appendChild(el("div", { class: "adm-set-row-desc" }, "Баннер вверху главной страницы"));
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

  notifCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:14px;margin-bottom:6px;" }, "Текст уведомления"));
  var notifTextInp = UI.input("Например: Добро пожаловать в новую версию!");
  notifTextInp.value = cfg.notification.text || "";
  notifTextInp.style.marginBottom = "8px";
  notifCard.appendChild(notifTextInp);

  var notifSaveBtn = UI.btn("💾 Сохранить текст", { variant: "ghost" });
  notifSaveBtn.style.width = "100%";
  notifSaveBtn.addEventListener("click", async function () {
    await AdminPanel.updateConfig({ "notification/text": notifTextInp.value });
    notifSaveBtn.textContent = "✓ Сохранено";
    setTimeout(function () { notifSaveBtn.textContent = "💾 Сохранить текст"; }, 1500);
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
        var patch = {};
        patch["minigames/" + game.id] = isOn;
        await AdminPanel.updateConfig(patch);
        await AdminPanel.log("minigame_toggle", game.id + " -> " + isOn);
      });
      row.appendChild(toggle);
      gamesCard.appendChild(row);
    })(games[g]);
  }
  section.appendChild(gamesCard);

  /* Экспорт */
  section.appendChild(el("div", { class: "adm-section-title" }, "💾 Экспорт"));
  var exportCard = el("div", { class: "adm-card" });
  var exportBtn = UI.btn("📥 Скачать базу пользователей (JSON)", { variant: "ghost" });
  exportBtn.style.width = "100%";
  exportBtn.addEventListener("click", async function () {
    var users = await AdminPanel.loadUsers();
    var blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "dota-jetch-users-" + Date.now() + ".json"; a.click();
    URL.revokeObjectURL(url);
    await AdminPanel.log("export_users", users.length + " пользователей");
  });
  exportCard.appendChild(exportBtn);
  section.appendChild(exportCard);

  frag.appendChild(section);
  return frag;
}

/* ═══ LOGS ═══ */
function buildLogRow(log) {
  var actionMeta = {
    give_jetch_forever: { icon: "⭐", label: "Выдан JETCH+ ∞", color: "#fbbf24" },
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
    export_users:       { icon: "💾", label: "Экспорт", color: "#22c55e" }
  };
  var meta = actionMeta[log.action] || { icon: "📌", label: log.action, color: "#8b5cf6" };
  var row = el("div", { class: "adm-log-row" });
  row.style.setProperty("--log-color", meta.color);

  var icon = el("div", { class: "adm-log-icon" }, meta.icon);
  row.appendChild(icon);

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
    else time.textContent = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + " " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  } catch (e) {}
  row.appendChild(time);

  return row;
}

async function renderAdminLogs() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });
  var logs = await AdminPanel.loadLogs(100);

  if (!logs.length) {
    var emptyCard = el("div", { class: "adm-card" });
    emptyCard.appendChild(buildEmpty("📭", "Пока нет записей. Как только ты что-то сделаешь — появится здесь."));
    section.appendChild(emptyCard);
    frag.appendChild(section);
    return frag;
  }

  var header = el("div", { class: "adm-section-title" }, "📜 Всего записей: " + logs.length);
  section.appendChild(header);

  var card = el("div", { class: "adm-card" });
  for (var i = 0; i < logs.length; i++) {
    card.appendChild(buildLogRow(logs[i]));
  }
  section.appendChild(card);

  frag.appendChild(section);
  return frag;
}

/* ═══ ADMINS ═══ */
async function renderAdminAdmins() {
  var frag = document.createDocumentFragment();
  var section = el("div", { class: "adm-section" });

  section.appendChild(el("div", { class: "adm-section-title" }, "⭐ Постоянные (хардкод)"));
  var hcCard = el("div", { class: "adm-card" });
  hcCard.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;line-height:1.55;" }, "Эти ники всегда имеют админ-доступ и не могут быть убраны через интерфейс."));
  for (var h = 0; h < ADMIN_NICKNAMES.length; h++) {
    var hRow = el("div", { class: "adm-adm-card hardcoded" });
    hRow.appendChild(el("div", { class: "adm-adm-crown" }, "👑"));
    var hInfo = el("div", { style: "flex:1;min-width:0;" });
    hInfo.appendChild(el("div", { style: "font-size:14.5px;font-weight:800;color:var(--text);" }, ADMIN_NICKNAMES[h]));
    hInfo.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-top:3px;letter-spacing:0.05em;" }, "ХАРДКОД · ЗАЩИЩЁН ОТ УДАЛЕНИЯ"));
    hRow.appendChild(hInfo);
    hcCard.appendChild(hRow);
  }
  section.appendChild(hcCard);

  /* Доп. админы из Firebase */
  section.appendChild(el("div", { class: "adm-section-title" }, "🛡️ Дополнительные"));

  var admins = await AdminPanel.loadAdmins();
  var uids = Object.keys(admins).filter(function (k) { return admins[k] === true; });
  var nickMap = {};
  try { nickMap = await AdminPanel.getNicknamesForUids(uids); } catch (e) {}

  var listCard = el("div", { class: "adm-card" });
  if (!uids.length) {
    listCard.appendChild(buildEmpty("🕳️", "Пока никого нет. Добавь первого админа ниже."));
  } else {
    for (var i = 0; i < uids.length; i++) {
      (function (uid) {
        var nick = nickMap[uid] || "(без ника)";
        var row = el("div", { class: "adm-adm-card regular" });
        row.appendChild(el("div", { class: "adm-adm-crown regular" }, "🛡️"));
        var info = el("div", { style: "flex:1;min-width:0;" });
        info.appendChild(el("div", { style: "font-size:14px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, nick));
        info.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:3px;word-break:break-all;" }, uid));
        row.appendChild(info);

        var rmBtn = el("button", { type: "button", style: "padding:7px 14px;border-radius:9px;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid #ef4444;background:rgba(239,68,68,0.08);color:#ef4444;flex-shrink:0;transition:all 0.2s ease;" }, "Убрать");
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

  /* Добавить */
  section.appendChild(el("div", { class: "adm-section-title" }, "➕ Добавить админа"));
  var addCard = el("div", { class: "adm-card" });
  addCard.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;line-height:1.55;" }, "Введи ник (например, player123) или длинный UID. Мы найдём пользователя и выдадим права."));

  var addInp = UI.input("Ник или UID пользователя");
  addInp.style.marginBottom = "8px";
  addCard.appendChild(addInp);

  var msgEl = el("div", { style: "font-size:11.5px;min-height:18px;margin-bottom:10px;line-height:1.45;" });
  addCard.appendChild(msgEl);

  var addBtn = UI.btn("🛡️ Добавить админа");
  addBtn.style.width = "100%";
  addBtn.addEventListener("click", async function () {
    var v = addInp.value.trim();
    msgEl.textContent = "";
    if (!v) {
      msgEl.textContent = "✕ Введи ник или UID";
      msgEl.style.color = "#ef4444";
      return;
    }
    addBtn.disabled = true;
    addBtn.textContent = "🔍 Ищу...";
    var res = await AdminPanel.resolveInput(v);
    if (!res) {
      msgEl.textContent = "✕ Пользователь «" + v + "» не найден.";
      msgEl.style.color = "#ef4444";
      addBtn.disabled = false;
      addBtn.textContent = "🛡️ Добавить админа";
      return;
    }
    var exists = await AdminPanel.isAdminUid(res.uid);
    if (exists) {
      msgEl.textContent = "ℹ️ " + (res.nickname || res.uid) + " уже админ.";
      msgEl.style.color = "#eab308";
      addBtn.disabled = false;
      addBtn.textContent = "🛡️ Добавить админа";
      return;
    }
    var label = res.nickname ? (res.nickname + " (" + res.uid.slice(0, 8) + "...)") : res.uid;
    if (!confirm("Выдать админ-права: " + label + "?")) {
      addBtn.disabled = false;
      addBtn.textContent = "🛡️ Добавить админа";
      return;
    }
    msgEl.textContent = "Выдаю права...";
    msgEl.style.color = "var(--text-muted)";
    var ok = await AdminPanel.addAdmin(res.uid);
    if (ok) {
      addInp.value = "";
      renderAdminTab("admins");
    } else {
      msgEl.textContent = "✕ Ошибка записи. Проверь правила Firebase.";
      msgEl.style.color = "#ef4444";
      addBtn.disabled = false;
      addBtn.textContent = "🛡️ Добавить админа";
    }
  });
  addCard.appendChild(addBtn);
  section.appendChild(addCard);

  frag.appendChild(section);
  return frag;
}

console.log("admin-panel v2.0 ready (premium UI, hardcoded: owner only)");

