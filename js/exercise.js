/* ============================
 * exercise.js — 运动锻炼模块
 * 数据：{ records: [{id,date,type,typeName,duration,calorie,note}],
 *         types: [{key,name,icon,caloriePerMin}] }
 * 运动类型可自定义增删改，记录日期可选
 * ============================ */
(function (global) {
  const KEY = 'exercise';
  const DEFAULT_TYPES = [
    { key: 'run',      name: '跑步', icon: 'run',      caloriePerMin: 9  },
    { key: 'walk',     name: '散步', icon: 'walk',     caloriePerMin: 4  },
    { key: 'yoga',     name: '瑜伽', icon: 'yoga',     caloriePerMin: 4  },
    { key: 'strength', name: '力量', icon: 'strength', caloriePerMin: 7  },
    { key: 'jump',     name: '跳绳', icon: 'jump',     caloriePerMin: 11 },
    { key: 'ride',     name: '骑行', icon: 'ride',     caloriePerMin: 7  },
    { key: 'hiit',     name: 'HIIT', icon: 'hiit',     caloriePerMin: 12 },
    { key: 'other',    name: '其他', icon: 'sparkle',  caloriePerMin: 5  },
  ];

  let selDate = Util.today();
  let manageOpen = false;

  function load() {
    let d = Storage.get(KEY);
    if (!d) { d = {}; }
    d.records = d.records || [];
    if (!Array.isArray(d.types) || d.types.length === 0) {
      d.types = DEFAULT_TYPES.map((t) => ({ ...t }));
      Storage.set(KEY, d);
    }
    return d;
  }
  function save(d) { Storage.set(KEY, d); }

  function typeMap() {
    const map = {};
    load().types.forEach((t) => { map[t.key] = t; });
    return map;
  }
  function getType(key) { return load().types.find((t) => t.key === key); }

  function addType(name, cal) {
    const d = load();
    d.types.push({
      key: 'c' + Storage.uid(),
      name: name.trim(),
      icon: 'sparkle',
      caloriePerMin: Number(cal) || 5,
    });
    save(d);
    return d.types[d.types.length - 1].key;
  }
  function updateType(key, patch) {
    const d = load();
    const t = d.types.find((x) => x.key === key);
    if (!t) return;
    Object.assign(t, patch);
    save(d);
  }
  function delType(key) {
    const d = load();
    d.types = d.types.filter((x) => x.key !== key);
    save(d);
  }

  function add(rec) {
    const d = load();
    d.records.unshift({
      id: Storage.uid(),
      date: rec.date || Util.today(),
      type: rec.type,
      typeName: rec.typeName || '',
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

  function stats(d, date) {
    const dayList = d.records.filter((r) => r.date === date);
    const weekDays = Util.rangeDays(7);
    const weekList = d.records.filter((r) => weekDays.includes(r.date));
    return {
      dayCount: dayList.length,
      dayMin: dayList.reduce((s, r) => s + r.duration, 0),
      dayCal: dayList.reduce((s, r) => s + r.calorie, 0),
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
    const date = selDate;
    const isToday = Util.isToday(date);
    const dayLabel = isToday ? '今日' : Util.dateLabel(date);
    const s = stats(d, date);
    const dayList = d.records.filter((r) => r.date === date);
    const map = typeMap();

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('dumbbell', 16, '#5C6F4E')} ${dayLabel}运动</h3>
          <button class="mini-btn ${manageOpen ? 'on' : ''}" id="exManageBtn">
            ${iconHTML('pencil', 12, manageOpen ? '#fff' : '#6F6A63')} 类型
          </button>
        </div>

        ${Util.dateBar('exDate', date)}

        <div class="stat-grid">
          <div class="stat-cell"><div class="v">${s.dayCount}</div><div class="l">${isToday ? '今日' : '当日'}次数</div></div>
          <div class="stat-cell"><div class="v">${s.dayMin}</div><div class="l">分钟</div></div>
          <div class="stat-cell"><div class="v">${s.dayCal}</div><div class="l">消耗 kcal</div></div>
        </div>

        ${manageOpen ? renderManage(d) : ''}

        <div style="font-size:12px;color:var(--text-2);margin:10px 0 8px">记录一次</div>
        <div class="field">
          <label>运动类型</label>
          <select class="select" id="exType">
            ${d.types.map((t) => `<option value="${t.key}">${Util.esc(t.name)}</option>`).join('')}
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
        <button class="btn btn-exercise btn-block" id="exAddBtn">＋ 添加到${Util.dateLabel(date)}</button>

        ${dayList.length > 0 ? `
          <div style="font-size:12px;color:var(--text-2);margin:14px 0 6px">${isToday ? '今日' : '当日'}记录</div>
          ${dayList.map((r) => renderItem(r, map)).join('')}
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
          : renderGrouped(d.records, map)
        }
      </div>
    `;
  }

  function renderManage(d) {
    return `
      <div class="manage-panel">
        <div class="mp-title">运动类型</div>
        <div class="mp-hint">名称、消耗都能改；消耗用于自动算卡路里。删掉类型不影响历史记录。</div>
        ${d.types.map((t) => `
          <div class="manage-row" data-tkey="${t.key}">
            <input class="input mr-name" data-field="name" value="${Util.esc(t.name)}" maxlength="10" />
            <input class="input mr-num" data-field="cal" type="number" min="0" max="60" step="1" value="${t.caloriePerMin}" />
            <span class="mr-unit">kcal/分</span>
            <button class="mr-del" data-act="delType" aria-label="删除类型">×</button>
          </div>
        `).join('')}
        <div class="manage-add">
          <input class="input" id="exNewTypeName" placeholder="新类型，如 爬山" maxlength="10" />
          <input class="input" id="exNewTypeCal" type="number" min="0" max="60" placeholder="kcal/分" style="max-width:86px" />
          <button class="btn btn-exercise btn-sm" id="exAddTypeBtn">+</button>
        </div>
      </div>
    `;
  }

  function renderItem(r, map) {
    const t = map[r.type];
    const name = t ? t.name : (r.typeName || '其他');
    const icon = t ? t.icon : 'sparkle';
    return `
      <div class="record-item" data-id="${r.id}">
        <div class="ri-icon">${iconHTML(icon, 18, '#5C6F4E')}</div>
        <div class="ri-main">
          <div class="ri-name">${Util.esc(name)} · ${r.duration} 分钟</div>
          <div class="ri-meta">${r.calorie ? r.calorie + ' kcal · ' : ''}${Util.esc(r.note || '')}</div>
        </div>
        <button class="ri-del" data-act="del" aria-label="删除">×</button>
      </div>
    `;
  }

  function renderGrouped(records, map) {
    const groups = {};
    records.forEach((r) => {
      (groups[r.date] = groups[r.date] || []).push(r);
    });
    return Object.keys(groups).sort().reverse().slice(0, 15).map((date) => {
      const d = new Date(date + 'T00:00:00');
      return `
        <div class="day-group">
          <div class="dg-head">${Util.md(d)} · ${Util.weekdayCN(d)}</div>
          ${groups[date].map((r) => renderItem(r, map)).join('')}
        </div>
      `;
    }).join('');
  }

  function bind() {
    const pane = document.getElementById('pane-exercise');
    if (!pane) return;

    // 日期切换
    Util.bindDateBar(pane, 'exDate', (v) => { selDate = v; refresh(); });

    // 展开/收起类型管理
    const manageBtn = document.getElementById('exManageBtn');
    if (manageBtn) {
      manageBtn.addEventListener('click', () => { manageOpen = !manageOpen; refresh(); });
    }

    const typeSel = document.getElementById('exType');
    const durInp = document.getElementById('exDur');
    const calInp = document.getElementById('exCal');

    const currentType = () => {
      const t = getType(typeSel && typeSel.value);
      return t || { name: '运动', caloriePerMin: 5, icon: 'sparkle' };
    };
    const autoCal = () => {
      if (!typeSel || !durInp || !calInp) return;
      if (calInp.dataset.manual === '1') return;
      const t = currentType();
      const dur = Number(durInp.value) || 0;
      calInp.placeholder = `约 ${Math.round(t.caloriePerMin * dur)} kcal`;
    };
    if (typeSel && durInp) {
      typeSel.addEventListener('change', autoCal);
      durInp.addEventListener('input', autoCal);
    }
    if (calInp) calInp.addEventListener('input', () => { calInp.dataset.manual = '1'; });

    // 类型管理：改名 / 改卡路里（保存但不重渲染，避免输入中断）
    pane.querySelectorAll('.manage-row').forEach((row) => {
      const key = row.dataset.tkey;
      const nameInp = row.querySelector('[data-field="name"]');
      const calField = row.querySelector('[data-field="cal"]');

      nameInp.addEventListener('change', () => {
        const v = nameInp.value.trim();
        if (!v) { nameInp.value = (getType(key) || {}).name || '运动'; return; }
        updateType(key, { name: v });
        // 同步下拉里的名字
        const opt = typeSel && typeSel.querySelector(`option[value="${key}"]`);
        if (opt) opt.textContent = v;
        autoCal();
      });

      calField.addEventListener('change', () => {
        const v = Math.max(0, Number(calField.value) || 0);
        calField.value = v;
        updateType(key, { caloriePerMin: v });
        autoCal();
      });
    });

    // 新增类型
    const addTypeBtn = document.getElementById('exAddTypeBtn');
    if (addTypeBtn) {
      addTypeBtn.addEventListener('click', () => {
        const nameInp = document.getElementById('exNewTypeName');
        const calInp2 = document.getElementById('exNewTypeCal');
        const name = nameInp.value.trim();
        if (!name) { Toast('请输入类型名称'); return; }
        const exists = load().types.some((t) => t.name === name);
        if (exists) { Toast('这个类型已经有了'); return; }
        addType(name, calInp2.value);
        Toast('已添加类型');
        refresh();
      });
    }

    // 添加记录
    const addBtn = document.getElementById('exAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const duration = durInp.value;
        if (!duration || duration <= 0) { Toast('请输入时长'); return; }
        const t = currentType();
        const calorie = calInp.value
          ? Number(calInp.value)
          : Math.round(t.caloriePerMin * Number(duration));
        add({
          type: typeSel.value,
          typeName: t.name,
          duration,
          calorie,
          note: document.getElementById('exNote').value,
          date: selDate,
        });
        durInp.value = ''; calInp.value = ''; calInp.dataset.manual = '0';
        document.getElementById('exNote').value = '';
        Toast(`已记录到${Util.dateLabel(selDate)}`); refresh();
      });
    }

    // 删除记录 / 删除类型（事件委托，只绑定一次，避免刷新后重复触发）
    if (pane.dataset.delBound === '1') return;
    pane.dataset.delBound = '1';
    pane.addEventListener('click', (e) => {
      const delTypeBtn = e.target.closest('[data-act="delType"]');
      if (delTypeBtn) {
        const row = delTypeBtn.closest('[data-tkey]');
        if (!row) return;
        const key = row.dataset.tkey;
        const t = getType(key);
        if (confirm(`删除运动类型「${t ? t.name : ''}」？\n历史记录不会受影响。`)) {
          delType(key);
          Toast('已删除类型');
          refresh();
        }
        return;
      }

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
      const dt = new Date(x + 'T00:00:00');
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
  function init() { selDate = Util.today(); refresh(); }
  function onShow() { drawChart(); }
  global.Exercise = { init, refresh, onShow };
})(window);
