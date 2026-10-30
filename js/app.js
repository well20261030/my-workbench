/* ============================
 * app.js — 应用入口、Tab 切换、Dashboard
 * ============================ */
(function () {
  /* ------- Toast ------- */
  const toastEl = (() => {
    const el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
    return el;
  })();
  let toastTimer = null;
  window.Toast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };

  /* ------- Tab 切换 ------- */
  const tabMap = {
    home:     { pane: 'pane-home',     render: () => renderHomePane() },
    study:    { pane: 'pane-study',    render: () => Study.refresh() },
    exercise: { pane: 'pane-exercise', render: () => Exercise.refresh() },
    skincare: { pane: 'pane-skincare', render: () => Skincare.refresh() },
    finance:  { pane: 'pane-finance',  render: () => Finance.refresh() },
  };
  let currentTab = 'home';

  function switchTab(name) {
    if (!tabMap[name]) return;
    if (name !== currentTab) {
      tabMap[currentTab] && (document.getElementById(tabMap[currentTab].pane).classList.remove('active'));
    }
    document.getElementById(tabMap[name].pane).classList.add('active');
    document.querySelectorAll('.nav-item').forEach((n) => {
      n.classList.toggle('active', n.dataset.target === name);
    });
    // 每次进入都重新渲染（数据可能已变 + 图表 resize）
    tabMap[name].render();
    currentTab = name;
  }

  /* ------- 头部日期 ------- */
  function setHeaderDate() {
    const d = new Date();
    const w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    document.getElementById('headerDate').textContent =
      `${d.getMonth() + 1}月${d.getDate()}日 · ${w}`;
  }

  /* ------- Dashboard 数据 ------- */
  function getModuleStatuses() {
    const today = Util.today();
    const study = Storage.get('study', { tasks: [], records: [] });
    const ex    = Storage.get('exercise', { records: [] });
    const sk    = Storage.get('skincare', { steps: { morning: [], night: [] }, logs: {} });
    const fin   = Storage.get('finance', { records: [] });

    // 学习：今日至少完成一项任务 OR 有记录
    const studyDone = study.tasks.some((t) => (t.doneDates || []).includes(today))
                   || study.records.some((r) => r.date === today);

    // 运动：今日有记录
    const exToday = ex.records.filter((r) => r.date === today);
    const exerciseDone = exToday.length > 0;

    // 护肤：今日早晚流程都至少完成 1 步
    const skToday = sk.logs[today] || { morning: [], night: [] };
    const skincareDone = (skToday.morning.length + skToday.night.length) > 0;
    const skincarePct = (() => {
      const total = (sk.steps.morning.length + sk.steps.night.length) || 1;
      const done = (skToday.morning.length || 0) + (skToday.night.length || 0);
      return Math.round((done / total) * 100);
    })();

    // 记账：今日有任意记录
    const financeDone = fin.records.some((r) => r.date === today);

    return {
      studyDone, exerciseDone, skincareDone, skincarePct, financeDone,
      studyCount: study.tasks.filter((t) => (t.doneDates || []).includes(today)).length,
      exMin: exToday.reduce((s, r) => s + r.duration, 0),
    };
  }

  function getAllStreak() {
    // 综合连续天数：只要今天任何一个模块有动作就算 1 天
    const today = Util.today();
    const study = Storage.get('study', { tasks: [], records: [] });
    const ex    = Storage.get('exercise', { records: [] });
    const sk    = Storage.get('skincare', { logs: {} });
    const fin   = Storage.get('finance', { records: [] });

    const activeDates = new Set();
    study.tasks.forEach((t) => (t.doneDates || []).forEach((d) => activeDates.add(d)));
    study.records.forEach((r) => activeDates.add(r.date));
    ex.records.forEach((r) => activeDates.add(r.date));
    Object.keys(sk.logs || {}).forEach((d) => activeDates.add(d));
    fin.records.forEach((r) => activeDates.add(r.date));

    return Util.streak([...activeDates]);
  }

  function getWeekExMinutes() {
    const ex = Storage.get('exercise', { records: [] });
    const days = Util.rangeDays(7);
    const byDate = {};
    ex.records.forEach((r) => { byDate[r.date] = (byDate[r.date] || 0) + r.duration; });
    return {
      labels: days.map((x) => {
        const dt = new Date(x);
        return ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()];
      }),
      data: days.map((x) => byDate[x] || 0),
    };
  }

  function getWeekOutAmount() {
    const fin = Storage.get('finance', { records: [] });
    const month = Util.thisMonth();
    const days = Util.rangeDays(7);
    const byDate = {};
    fin.records
      .filter((r) => r.type === 'out' && r.date.slice(0, 7) === month)
      .forEach((r) => { byDate[r.date] = (byDate[r.date] || 0) + r.amount; });
    return {
      labels: days.map((x) => x.slice(5)),
      data: days.map((x) => byDate[x] || 0),
    };
  }

  function progressRing(pct) {
    const r = 48, c = 2 * Math.PI * r;
    const off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
    return `
      <div class="progress-ring">
        <svg width="110" height="110">
          <circle cx="55" cy="55" r="${r}" stroke="#EEE6DB" stroke-width="8" fill="none" />
          <circle cx="55" cy="55" r="${r}" stroke="url(#ringGrad)" stroke-width="8" fill="none"
            stroke-dasharray="${c}" stroke-dashoffset="${off}"
            stroke-linecap="round" />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stop-color="#D4A5A5" />
              <stop offset="50%" stop-color="#C4A89A" />
              <stop offset="100%" stop-color="#A5B5C4" />
            </linearGradient>
          </defs>
        </svg>
        <div class="ring-text">
          <div class="ring-pct">${Math.round(pct)}%</div>
          <div class="ring-lbl">今日完成</div>
        </div>
      </div>
    `;
  }

  function renderHome() {
    const m = getModuleStatuses();
    const streak = getAllStreak();
    const totalTasks = (() => {
      const t = Storage.get('study', { tasks: [] });
      return t.tasks.length || 0;
    })();

    // 4 个模块是否完成
    const doneCount = [m.studyDone, m.exerciseDone, m.skincareDone, m.financeDone].filter(Boolean).length;
    const pct = (doneCount / 4) * 100;

    const exWeek = getWeekExMinutes();
    const outWeek = getWeekOutAmount();

    return `
      <div class="hero">
        <h2>你好，今天也要加油 ${iconHTML('sun', 18, '#fff')}</h2>
        <div class="hero-sub">${Util.fmtDate(new Date())} · 让每一天都留下痕迹</div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="num">${streak}</div>
            <div class="lbl">连续打卡(天)</div>
          </div>
          <div class="hero-stat">
            <div class="num">${doneCount}/4</div>
            <div class="lbl">今日模块</div>
          </div>
          <div class="hero-stat">
            <div class="num">${m.exMin}</div>
            <div class="lbl">今日运动(分)</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('leaf', 16, '#5C6F4E')} 今日概览</h3></div>
        ${progressRing(pct)}
        <div class="row" style="justify-content:space-around;margin-top:6px">
          <div style="text-align:center"><div style="font-size:13px;color:var(--c-study);display:flex;align-items:center;gap:4px">${iconHTML('book', 14, '#8B6161')} 学习</div>
            <div style="font-size:11px;color:var(--text-3)">${m.studyDone ? '✓ 已打卡' : '待开始'}</div></div>
          <div style="text-align:center"><div style="font-size:13px;color:var(--c-exercise);display:flex;align-items:center;gap:4px">${iconHTML('dumbbell', 14, '#5C6F4E')} 运动</div>
            <div style="font-size:11px;color:var(--text-3)">${m.exerciseDone ? '✓ 已完成' : '待开始'}</div></div>
          <div style="text-align:center"><div style="font-size:13px;color:var(--c-skincare);display:flex;align-items:center;gap:4px">${iconHTML('drop', 14, '#5C6E7E')} 护肤</div>
            <div style="font-size:11px;color:var(--text-3)">${m.skincarePct}%</div></div>
          <div style="text-align:center"><div style="font-size:13px;color:var(--c-finance);display:flex;align-items:center;gap:4px;justify-content:center">${iconHTML('wallet', 14, '#7A5A48')} 记账</div>
            <div style="font-size:11px;color:var(--text-3)">${m.financeDone ? '✓ 已记' : '待记账'}</div></div>
        </div>
      </div>

      <div class="module-grid">
        <div class="module-card mc-study" data-go="study">
          <div class="mc-icon">${iconHTML('book', 18, '#8B6161')}</div>
          <div class="mc-title">学习打卡</div>
          <div class="mc-sub">${m.studyCount}/${totalTasks || 0} 任务 · ${streak} 天</div>
          <div class="mc-status tag tag-study">${m.studyDone ? '今日已打卡' : '去打卡'}</div>
        </div>
        <div class="module-card mc-exercise" data-go="exercise">
          <div class="mc-icon">${iconHTML('dumbbell', 18, '#5C6F4E')}</div>
          <div class="mc-title">运动锻炼</div>
          <div class="mc-sub">${m.exMin} 分钟 · 今天</div>
          <div class="mc-status tag tag-exercise">${m.exerciseDone ? '已记录' : '去记录'}</div>
        </div>
        <div class="module-card mc-skincare" data-go="skincare">
          <div class="mc-icon">${iconHTML('drop', 18, '#5C6E7E')}</div>
          <div class="mc-title">护肤</div>
          <div class="mc-sub">完成率 ${m.skincarePct}%</div>
          <div class="mc-status tag tag-skincare">${m.skincareDone ? '已护肤' : '去护肤'}</div>
        </div>
        <div class="module-card mc-finance" data-go="finance">
          <div class="mc-icon">${iconHTML('wallet', 18, '#7A5A48')}</div>
          <div class="mc-title">记账</div>
          <div class="mc-sub">${m.financeDone ? '今日已记' : '记一笔'}</div>
          <div class="mc-status tag tag-finance">${m.financeDone ? '已记' : '去记账'}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('chart', 16, '#5C6F4E')} 本周运动</h3><span class="more">单位:分钟</span></div>
        <div class="chart-box chart-box-sm"><canvas id="chartHomeEx"></canvas></div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('coin', 16, '#7A5A48')} 本周支出</h3><span class="more">单位:元</span></div>
        <div class="chart-box chart-box-sm"><canvas id="chartHomeOut"></canvas></div>
      </div>
    `;
  }

  function drawHomeCharts() {
  if (typeof Chart === 'undefined') return;
    const ex = getWeekExMinutes();
    const out = getWeekOutAmount();

    const exCtx = document.getElementById('chartHomeEx');
    if (exCtx) {
      if (exCtx._chart) exCtx._chart.destroy();
      exCtx._chart = new Chart(exCtx, {
        type: 'bar',
        data: {
          labels: ex.labels,
          datasets: [{
            data: ex.data,
            backgroundColor: 'rgba(168,184,154,0.55)',
            borderColor: '#A8B89A',
            borderWidth: 1, borderRadius: 8, maxBarThickness: 28,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#A09A92', font: { size: 10 } }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#A09A92', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
          },
        },
      });
    }

    const outCtx = document.getElementById('chartHomeOut');
    if (outCtx) {
      if (outCtx._chart) outCtx._chart.destroy();
      outCtx._chart = new Chart(outCtx, {
        type: 'line',
        data: {
          labels: out.labels,
          datasets: [{
            data: out.data,
            borderColor: '#C4A89A',
            backgroundColor: 'rgba(196,168,154,0.20)',
            fill: true, tension: 0.35,
            pointRadius: 2, pointBackgroundColor: '#C4A89A',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#A09A92', font: { size: 10 }, maxRotation: 0, autoSkipPadding: 12 }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#A09A92', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
          },
        },
      });
    }
  }

  // 渲染首页（独立函数，不依赖 Study/Exercise 等是否加载好）
  function renderHomePane() {
    const pane = document.getElementById('pane-home');
    if (!pane) return;
    try {
      pane.innerHTML = renderHome();
      // 快捷卡片跳转
      pane.querySelectorAll('[data-go]').forEach((el) => {
        el.addEventListener('click', () => switchTab(el.dataset.go));
      });
    } catch (e) {
      console.error('[home] render error:', e);
      pane.innerHTML = '<div class="empty"><div class="emo">⚠️</div>首页加载异常：' + (e && e.message ? e.message : e) + '</div>';
      return;
    }
    // 图表在 DOM 写入后再画
    setTimeout(() => { try { drawHomeCharts(); } catch (e) { console.error('[home] chart error:', e); } }, 0);
  }

  /* ------- 初始化 ------- */
  function init() {
    setHeaderDate();

    // 注入底部导航的 SVG 图标
    document.querySelectorAll('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon, 22);
    });

    // 确保各模块有默认数据
    Storage.get('study');     // 触发默认
    Storage.get('exercise');
    Storage.get('skincare');
    Storage.get('finance');

    // 渲染当前 Tab
    switchTab('home');

    // 底部导航点击
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.target));
    });

    // 暴露 switchTab 给其他模块使用
    window.switchTab = switchTab;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
