/* ============================
 * study.js — 学习打卡模块
 * 数据：{ tasks: [{id,name,doneDates:[yyyy-mm-dd]}], records: [{id,date,duration,note}] }
 * 支持选择日期补记（不能选未来）
 * ============================ */
(function (global) {
  const KEY = 'study';
  const DEFAULT_TASKS = ['背单词 20 个', '阅读 30 分钟', '写作 / 复盘'];

  let selDate = Util.today();

  function load() {
    let d = Storage.get(KEY);
    if (!d) {
      d = {
        tasks: DEFAULT_TASKS.map((n) => ({ id: Storage.uid(), name: n, doneDates: [] })),
        records: [],
      };
      Storage.set(KEY, d);
    }
    // 兼容
    d.tasks = d.tasks || [];
    d.records = d.records || [];
    d.tasks.forEach((t) => { t.doneDates = t.doneDates || []; });
    return d;
  }
  function save(d) { Storage.set(KEY, d); }

  function isDone(task, date) {
    return (task.doneDates || []).includes(date);
  }

  function toggleTask(taskId, date) {
    const d = load();
    const t = d.tasks.find((x) => x.id === taskId);
    if (!t) return;
    const i = t.doneDates.indexOf(date);
    if (i >= 0) t.doneDates.splice(i, 1);
    else t.doneDates.push(date);
    save(d);
  }

  function addTask(name) {
    if (!name || !name.trim()) return;
    const d = load();
    d.tasks.push({ id: Storage.uid(), name: name.trim(), doneDates: [] });
    save(d);
  }

  function delTask(taskId) {
    const d = load();
    d.tasks = d.tasks.filter((x) => x.id !== taskId);
    save(d);
  }

  function addRecord(duration, note, date) {
    const d = load();
    d.records.unshift({
      id: Storage.uid(),
      date: date || Util.today(),
      duration: Number(duration) || 0,
      note: note || '',
    });
    save(d);
  }

  /* -------- 渲染 -------- */
  function render() {
    const d = load();
    const date = selDate;
    const isToday = Util.isToday(date);
    const dayLabel = isToday ? '今日' : Util.dateLabel(date);

    const allDoneDates = Array.from(new Set(d.tasks.flatMap((t) => t.doneDates))).sort();
    const streak = Util.streak(allDoneDates);
    const totalDays = allDoneDates.length;

    // 所选日期的学习时长
    const dayMin = d.records.filter((r) => r.date === date).reduce((s, r) => s + r.duration, 0);
    const dayDoneCount = d.tasks.filter((t) => isDone(t, date)).length;

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('book', 16, '#8B6161')} ${dayLabel}学习</h3>
          <span class="tag tag-study">学习打卡</span>
        </div>

        ${Util.dateBar('studyDate', date)}

        <div class="streak-box">
          <div class="streak-cell">
            <div class="v">${streak}</div>
            <div class="l">连续打卡</div>
          </div>
          <div class="streak-cell">
            <div class="v">${totalDays}</div>
            <div class="l">累计天数</div>
          </div>
          <div class="streak-cell">
            <div class="v">${dayMin}<span style="font-size:11px;color:var(--text-3);font-weight:500"> 分</span></div>
            <div class="l">${isToday ? '今日学习' : '当日学习'}</div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--text-2);margin:14px 0 6px">
          ${isToday ? '今日任务' : `${Util.dateLabel(date)}的任务`}
          ${d.tasks.length ? `<span style="color:var(--text-3)"> · 完成 ${dayDoneCount}/${d.tasks.length}</span>` : ''}
        </div>
        <div id="studyTaskList">
          ${d.tasks.length === 0
            ? `<div class="empty"><div class="emo">${iconHTML('pencil', 32, '#A09A92')}</div>还没有任务，添加一个吧</div>`
            : d.tasks.map((t) => `
              <div class="task-item ${isDone(t, date) ? 'done' : ''}" data-id="${t.id}">
                <div class="check" data-act="toggle">${isDone(t, date) ? '✓' : ''}</div>
                <div class="task-name">${Util.esc(t.name)}</div>
                <button class="task-del" data-act="del" aria-label="删除">×</button>
              </div>
            `).join('')
          }
        </div>

        <div class="add-task">
          <input class="input" id="studyNewTask" placeholder="添加学习任务..." maxlength="30" />
          <button class="btn btn-study btn-sm" id="studyAddTaskBtn">+ 添加</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('clock', 16, '#8B6161')} 学习记录</h3>
          <span class="more">记到 ${Util.dateLabel(date)}</span>
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <input class="input" id="studyMin" type="number" min="1" max="600" placeholder="时长(分钟)" style="flex:1;min-width:110px" />
          <input class="input" id="studyNote" placeholder="学了啥？(可选)" style="flex:1.4;min-width:130px" maxlength="40" />
          <button class="btn btn-study btn-sm" id="studyLogBtn">记录</button>
        </div>
        <div style="font-size:12px;color:var(--text-2);margin:14px 0 6px">最近记录</div>
        ${d.records.length === 0
          ? `<div class="empty"><div class="emo">${iconHTML('clock', 32, '#A09A92')}</div>暂无记录</div>`
          : d.records.slice(0, 12).map((r) => `
            <div class="record-item">
              <div class="ri-icon" style="background:var(--c-study-soft)">${iconHTML('book', 18, '#8B6161')}</div>
              <div class="ri-main">
                <div class="ri-name">${r.duration} 分钟 ${r.note ? '· ' + Util.esc(r.note) : ''}</div>
                <div class="ri-meta">${Util.relDate(r.date)}</div>
              </div>
            </div>
          `).join('')
        }
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('chart', 16, '#8B6161')} 近 30 天学习时长</h3><span class="more">单位:分钟</span></div>
        <div class="chart-box"><canvas id="chartStudy"></canvas></div>
      </div>
    `;
  }

  function bind() {
    const pane = document.getElementById('pane-study');
    if (!pane) return;

    // 日期切换
    Util.bindDateBar(pane, 'studyDate', (v) => { selDate = v; refresh(); });

    // 任务勾选 / 删除
    const list = document.getElementById('studyTaskList');
    if (list) {
      list.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const id = item.dataset.id;
        if (e.target.closest('[data-act="del"]')) {
          if (confirm('删除这个任务？')) { delTask(id); refresh(); }
        } else if (e.target.closest('[data-act="toggle"]')) {
          toggleTask(id, selDate); refresh();
        }
      });
    }
    // 添加任务
    const addBtn = document.getElementById('studyAddTaskBtn');
    const newInp = document.getElementById('studyNewTask');
    if (addBtn && newInp) {
      const doAdd = () => {
        const v = newInp.value.trim();
        if (!v) { Toast('写点什么吧'); return; }
        addTask(v); newInp.value = ''; refresh();
      };
      addBtn.addEventListener('click', doAdd);
      newInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });
    }
    // 学习记录
    const logBtn = document.getElementById('studyLogBtn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        const min = document.getElementById('studyMin').value;
        const note = document.getElementById('studyNote').value;
        if (!min || min <= 0) { Toast('请输入时长'); return; }
        addRecord(min, note, selDate);
        document.getElementById('studyMin').value = '';
        document.getElementById('studyNote').value = '';
        Toast(`已记录到${Util.dateLabel(selDate)}`); refresh();
      });
    }
  }

  function drawChart() {
    if (typeof Chart === 'undefined') return;
    const d = load();
    const days = Util.rangeDays(30);
    const byDate = {};
    d.records.forEach((r) => { byDate[r.date] = (byDate[r.date] || 0) + r.duration; });
    const labels = days.map((x) => x.slice(5));
    const data = days.map((x) => byDate[x] || 0);

    const ctx = document.getElementById('chartStudy');
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '分钟',
          data,
          borderColor: '#D4A5A5',
          backgroundColor: 'rgba(212,165,165,0.18)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
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

  function refresh() {
    const pane = document.getElementById('pane-study');
    if (!pane) return;
    try {
      pane.innerHTML = render();
      bind();
    } catch (e) {
      console.error('[study.js] render error:', e);
      pane.innerHTML = '<div class="empty"><div class="emo">⚠️</div>模块加载异常：' + (e && e.message ? e.message : e) + '</div>';
      return;
    }
    try { drawChart(); } catch (e) { console.error('[study.js] chart error:', e); }
  }

  function init() { selDate = Util.today(); refresh(); }
  function onShow() { drawChart(); }

  global.Study = { init, refresh, onShow };
})(window);
