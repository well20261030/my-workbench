/* ============================
 * exercise.js — 运动锻炼模块
 * 数据：{ records: [{id,date,type,duration,calorie,note}] }
 * ============================ */
(function (global) {
  const KEY = 'exercise';
  const TYPES = [
    { key: 'run',     name: '跑步',   icon: 'run',      caloriePerMin: 9  },
    { key: 'walk',    name: '散步',   icon: 'walk',     caloriePerMin: 4  },
    { key: 'yoga',    name: '瑜伽',   icon: 'yoga',     caloriePerMin: 4  },
    { key: 'strength',name: '力量',   icon: 'strength', caloriePerMin: 7  },
    { key: 'jump',    name: '跳绳',   icon: 'jump',     caloriePerMin: 11 },
    { key: 'ride',    name: '骑行',   icon: 'ride',     caloriePerMin: 7  },
    { key: 'hiit',    name: 'HIIT',   icon: 'hiit',     caloriePerMin: 12 },
    { key: 'other',   name: '其他',   icon: 'sparkle',  caloriePerMin: 5  },
  ];
  const TYPES_MAP = Object.fromEntries(TYPES.map((t) => [t.key, t]));

  function load() {
    let d = Storage.get(KEY);
    if (!d) { d = { records: [] }; Storage.set(KEY, d); }
    d.records = d.records || [];
    return d;
  }
  function save(d) { Storage.set(KEY, d); }

  function add(rec) {
    const d = load();
    d.records.unshift({
      id: Storage.uid(),
      date: rec.date || Util.today(),
      type: rec.type,
      duration: Number(rec.duration) || 0,
      calorie: Number(rec.calorie) || 0,
      note: rec.note || '',
    });
    save(d);
  }
  function del(id) {
    const d = load();
    d.records = d.records.filter((r) => r.id !== id);
    save(d);
  }

  function stats(d) {
    const today = Util.today();
    const todayList = d.records.filter((r) => r.date === today);
    const weekDays = Util.rangeDays(7);
    const weekList = d.records.filter((r) => weekDays.includes(r.date));
    return {
      todayCount: todayList.length,
      todayMin: todayList.reduce((s, r) => s + r.duration, 0),
      todayCal: todayList.reduce((s, r) => s + r.calorie, 0),
      weekCount: weekList.length,
      weekMin: weekList.reduce((s, r) => s + r.duration, 0),
      weekCal: weekList.reduce((s, r) => s + r.calorie, 0),
      totalCount: d.records.length,
      totalMin: d.records.reduce((s, r) => s + r.duration, 0),
      totalCal: d.records.reduce((s, r) => s + r.calorie, 0),
    };
  }

  function render() {
    const d = load();
    const s = stats(d);
    const today = Util.today();
    const todayList = d.records.filter((r) => r.date === today);

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('dumbbell', 16, '#5C6F4E')} 今日运动</h3>
          <span class="tag tag-exercise">运动</span>
        </div>
        <div class="stat-grid">
          <div class="stat-cell"><div class="v">${s.todayCount}</div><div class="l">今日次数</div></div>
          <div class="stat-cell"><div class="v">${s.todayMin}</div><div class="l">今日分钟</div></div>
          <div class="stat-cell"><div class="v">${s.todayCal}</div><div class="l">今日消耗 kcal</div></div>
        </div>

        <div style="font-size:12px;color:var(--text-2);margin:10px 0 8px">记录一次</div>
        <div class="field">
          <label>运动类型</label>
          <select class="select" id="exType">
            ${TYPES.map((t) => `<option value="${t.key}">${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="row" style="gap:8px">
          <div class="field" style="flex:1;margin:0">
            <label>时长(分钟)</label>
            <input class="input" id="exDur" type="number" min="1" max="600" placeholder="30" />
          </div>
          <div class="field" style="flex:1;margin:0">
            <label>消耗(kcal，可选)</label>
            <input class="input" id="exCal" type="number" min="0" placeholder="自动估算" />
          </div>
        </div>
        <div class="field" style="margin-top:8px">
          <input class="input" id="exNote" placeholder="备注(可选)" maxlength="40" />
        </div>
        <button class="btn btn-exercise btn-block" id="exAddBtn">＋ 添加运动记录</button>

        ${todayList.length > 0 ? `
          <div style="font-size:12px;color:var(--text-2);margin:14px 0 6px">今日记录</div>
          ${todayList.map((r) => renderItem(r)).join('')}
        ` : ''}
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('chart', 16, '#5C6F4E')} 累计数据</h3></div>
        <div class="stat-grid">
          <div class="stat-cell"><div class="v">${s.totalCount}</div><div class="l">总次数</div></div>
          <div class="stat-cell"><div class="v">${s.totalMin}</div><div class="l">总分钟</div></div>
          <div class="stat-cell"><div class="v">${s.totalCal}</div><div class="l">总消耗 kcal</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('calendar', 16, '#5C6F4E')} 本周运动时长</h3><span class="more">近 7 天</span></div>
        <div class="chart-box"><canvas id="chartExercise"></canvas></div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('book', 16, '#5C6F4E')} 全部记录</h3></div>
        ${d.records.length === 0
          ? `<div class="empty"><div class="emo">${iconHTML('run', 32, '#A09A92')}</div>还没运动过，起来动一动</div>`
          : renderGrouped(d.records)
        }
      </div>
    `;
  }

  function renderItem(r) {
    const t = TYPES_MAP[r.type] || TYPES_MAP.other;
    return `
      <div class="record-item" data-id="${r.id}">
        <div class="ri-icon">${iconHTML(t.icon, 18, '#5C6F4E')}</div>
        <div class="ri-main">
          <div class="ri-name">${t.name} · ${r.duration} 分钟</div>
          <div class="ri-meta">${r.calorie ? r.calorie + ' kcal · ' : ''}${Util.esc(r.note || '')}</div>
        </div>
        <button class="ri-del" data-act="del" aria-label="删除">×</button>
      </div>
    `;
  }

  function renderGrouped(records) {
    const groups = {};
    records.forEach((r) => {
      (groups[r.date] = groups[r.date] || []).push(r);
    });
    return Object.keys(groups).slice(0, 10).map((date) => {
      const d = new Date(date);
      return `
        <div class="day-group">
          <div class="dg-head">${Util.md(d)} · ${Util.weekdayCN(d)}</div>
          ${groups[date].map((r) => renderItem(r)).join('')}
        </div>
      `;
    }).join('');
  }

  function bind() {
    // 类型切换时自动估算卡路里
    const typeSel = document.getElementById('exType');
    const durInp = document.getElementById('exDur');
    const calInp = document.getElementById('exCal');
    const autoCal = () => {
      if (!typeSel || !durInp || !calInp) return;
      if (calInp.dataset.manual === '1') return;
      const t = TYPES_MAP[typeSel.value] || TYPES_MAP.other;
      const dur = Number(durInp.value) || 0;
      calInp.placeholder = `约 ${Math.round(t.caloriePerMin * dur)} kcal`;
    };
    if (typeSel) { typeSel.addEventListener('change', autoCal); durInp.addEventListener('input', autoCal); }
    if (calInp) calInp.addEventListener('input', () => { calInp.dataset.manual = '1'; });

    const addBtn = document.getElementById('exAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const type = typeSel.value;
        const duration = durInp.value;
        if (!duration || duration <= 0) { Toast('请输入时长'); return; }
        const t = TYPES_MAP[type];
        const calorie = calInp.value
          ? Number(calInp.value)
          : Math.round(t.caloriePerMin * Number(duration));
        add({ type, duration, calorie, note: document.getElementById('exNote').value });
        durInp.value = ''; calInp.value = ''; calInp.dataset.manual = '0';
        document.getElementById('exNote').value = '';
        Toast('已记录'); refresh();
      });
    }

    // 删除（事件委托）
    const pane = document.getElementById('pane-exercise');
    pane.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-act="del"]');
      if (!delBtn) return;
      const item = delBtn.closest('[data-id]');
      if (!item) return;
      if (confirm('删除这条记录？')) { del(item.dataset.id); refresh(); }
    });
  }

  function drawChart() {
    if (typeof Chart === 'undefined') return;
    const d = load();
    const days = Util.rangeDays(7);
    const labels = days.map((x) => {
      const dt = new Date(x);
      return ['日','一','二','三','四','五','六'][dt.getDay()];
    });
    const byDate = {};
    d.records.forEach((r) => { byDate[r.date] = (byDate[r.date] || 0) + r.duration; });
    const data = days.map((x) => byDate[x] || 0);

    const ctx = document.getElementById('chartExercise');
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: 'rgba(168,184,154,0.55)',
          borderColor: '#A8B89A',
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 32,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#A09A92', font: { size: 11 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#A09A92', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
        },
      },
    });
  }

  function refresh() {
    const pane = document.getElementById('pane-exercise');
    if (!pane) return;
    try {
      pane.innerHTML = render();
      bind();
    } catch (e) {
      console.error('[exercise.js] render error:', e);
      pane.innerHTML = '<div class="empty"><div class="emo">⚠️</div>模块加载异常：' + (e && e.message ? e.message : e) + '</div>';
      return;
    }
    try { drawChart(); } catch (e) { console.error('[exercise.js] chart error:', e); }
  }
  function init() { refresh(); }
  function onShow() { drawChart(); }
  global.Exercise = { init, refresh, onShow };
})(window);
