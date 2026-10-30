/* ============================
 * icons.js — 莫兰迪色系 inline SVG 图标
 * 用法：window.ICONS.<name>
 * 所有图标用 currentColor，方便外层控制颜色
 * ============================ */
(function (global) {
  const ICONS = {
    /* 导航 */
    home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5"/><path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5"/></svg>`,
    book:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2M20 12h2M6 8v8M18 8v8M9 6v12M15 6v12"/></svg>`,
    drop:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/></svg>`,
    wallet:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h12l3 3v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M16 13h2"/></svg>`,
    /* 装饰 / 动作 */
    plus:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
    close:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    sun:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>`,
    bulb:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.4-1 2.5H9c0-1.1-.4-1.9-1-2.5A6 6 0 0 1 12 3z"/></svg>`,
    fire:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/></svg>`,
    trophy:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4zM5 4h2v3a3 3 0 0 1-3-3M19 4h-2v3a3 3 0 0 0 3-3M9 14h6l-1 5h-4l-1-5zM8 21h8"/></svg>`,
    /* 运动类型 */
    run:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="5" r="2"/><path d="M5 22l4-7 3 2 3-2 4 3M9 12l3-5 4 2 2 4"/></svg>`,
    walk:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M8 22l3-7 3 1 1 4 3 2M9 11l4-2 3 1 2 4"/></svg>`,
    yoga:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2"/><path d="M12 8v4M8 12h8M4 18c2-2 6-3 8-3s6 1 8 3"/></svg>`,
    strength: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2M20 12h2M6 8v8M18 8v8M9 6v12M15 6v12"/></svg>`,
    jump:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M5 22l4-6 3 1 2 4M9 11l3-1 4 1 3 5M12 11v-3M9 6l3-3 3 3"/></svg>`,
    ride:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-7h6l3 7M9 10l-1-3h-2"/></svg>`,
    hiit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 1 5 0 7-1 2-1 4 0 6 1 2 1 4 0 5M8 5c0 2 0 4-1 6-1 2-1 4 0 6 1 2 1 3 1 5M16 5c0 2 0 4 1 6 1 2 1 4 0 6-1 2-1 3-1 5"/></svg>`,
    sparkle:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z"/></svg>`,
    /* 食物 / 分类 */
    food:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V4M8 4l4 4 4-4M12 15v6"/></svg>`,
    bus:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="14" rx="2"/><path d="M4 11h16M8 18v2M16 18v2M7 7h4M13 7h4"/></svg>`,
    bag:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
    pill:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)"/><path d="M9 9l6 6"/></svg>`,
    game:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h2M8 11v2M15 12h.01M17 13h.01M17 11h.01"/></svg>`,
    house:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"/></svg>`,
    briefcase:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/></svg>`,
    gift:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11M8 9c-1-2 0-4 2-4s2 2 2 4M16 9c1-2 0-4-2-4s-2 2-2 4"/></svg>`,
    wrench:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7a4 4 0 0 0 5 5l-9 9-4-4 9-9c-1 0-1 0-1-1z"/></svg>`,
    chart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 16V11M12 16V8M16 16v-4"/></svg>`,
    coin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10c0-1 1-2 3-2s3 1 3 2-1 1.5-3 2-3 1-3 2 1 2 3 2 3-1 3-2M12 6v12"/></svg>`,
    pencil:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>`,
    heart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
    clock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    leaf:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4S6 4 6 14c0 4 3 6 6 6 8 0 8-12 8-16zM6 20c2-4 4-7 8-10"/></svg>`,
    /* 护肤 */
    bottle:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v3l1 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l1-2V2z"/></svg>`,
  };

  /** 工具：icon(name, size, color) 返回带样式的 svg */
  function icon(name, size, color) {
    const svg = ICONS[name] || ICONS.sparkle;
    const s = size || 18;
    const c = color || 'currentColor';
    return svg.replace('<svg ', `<svg width="${s}" height="${s}" style="color:${c};vertical-align:-3px" `);
  }
  /** icon 包一层 span 用于行内 */
  function iconHTML(name, size, color) {
    return `<span class="ic" style="display:inline-flex;align-items:center;line-height:1">${icon(name, size, color)}</span>`;
  }

  global.ICONS = ICONS;
  global.icon = icon;
  global.iconHTML = iconHTML;
})(window);
