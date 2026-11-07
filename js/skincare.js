/* ============================
 * skincare.js — 护肤模块
 * 数据：{ v:2,
 *         steps: { morning:[{id,name}], night:[{id,name}] },
 *         products: [{id,name,total,used,unit}],
 *         logs: { 'yyyy-mm-dd': { morning:[stepId], night:[stepId] } } }
 * 步骤可自定义增删改，记录日期可选
 * ============================ */
(function (global) {
  const KEY = 'skincare';
  const DEFAULT_MORNING = ['洁面', '化妆水', '精华', '乳液', '防晒'];
  const DEFAULT_NIGHT   = ['卸妆', '洁面', '化妆水', '精华', '面霜'];

  let selDate = Util.today();
  let manageOpen = false;

  function makeSteps(arr) {
    return arr.map((name) => ({ id: Storage.uid(), name: name }));
  }

  function save(d) { Storage.set(KEY, d); }

  /** 老数据（步骤是字符串）迁移成 {id,name}，日志里的名字也转成 id */
  function migrate(d) {
    if (d.v === 2) return d;
    const oldSteps = d.steps || {};
    const newSteps = { morning: [], night: [] };
    ['morning', 'night'].forEach((p) => {
      const list = Array.isArray(oldSteps[p]) ? oldSteps[p] : [];
      newSteps[p] = list.map((s) => {
        if (s && typeof s === 'object') return { id: s.id || Storage.uid(), name: s.name || '' };
        return { id: Storage.uid(), name: String(s) };
      });
    });

    const logs = d.logs || {};
    Object.keys(logs).forEach((date) => {
      const lg = logs[date] || {};
      ['morning', 'night'].forEach((p) => {
        const arr = Array.isArray(lg[p]) ? lg[p] : [];
        const list = newSteps[p];
        lg[p] = arr.map((x) => {
          if (list.some((s) => s.id === x)) return x;
          const m = list.find((s) => s.name === x);
          return m ? m.id : null;
        }).filter(Boolean);
      });
      logs[date] = lg;
    });

    d.steps = newSteps;
    d.logs = logs;
    d.v = 2;
    save(d);
    return d;
  }

  function load() {
    let d = Storage.get(KEY);
    if (!d) {
      d = {
        v: 2,
        steps: { morning: makeSteps(DEFAULT_MORNING), night: makeSteps(DEFAULT_NIGHT) },
        products: [],
        logs: {},
      };
      save(d);
      return d;
    }
    d.steps = d.steps || { morning: [], night: [] };
    d.products = d.products || [];
    d.logs = d.logs || {};
    return migrate(d);
  }

  function toggleStep(period, stepId, date) {
    const d = load();
    d.logs[date] = d.logs[date] || { morning: [], night: [] };
    d.logs[date][period] = d.logs[date][period] || [];
    const arr = d.logs[date][period];
    const i = arr.indexOf(stepId);
    if (i >= 0) arr.splice(i, 1); else arr.push(stepId);
    save(d);
  }

  function addStep(period, name) {
    if (!name || !name.trim()) return;
    const d = load();
    d.steps[period].push({ id: Storage.uid(), name: name.trim() });
    save(d);
  }
  function renameStep(period, stepId, name) {
    const d = load();
    const s = d.steps[period].find((x) => x.id === stepId);
    if (s) { s.name = name; save(d); }
  }
  function delStep(period, stepId) {
    const d = load();
    d.steps[period] = d.steps[period].filter((x) => x.id !== stepId);
    save(d);
  }

  function addProduct(name, total) {
    if (!name || !name.trim()) return;
    const d = load();
    d.products.unshift({ id: Storage.uid(), name: name.trim(), total: Number(total) || 100, used: 0, unit: '%' });
    save(d);
  }
  function delProduct(id) {
    const d = load();
    d.products = d.products.filter((p) => p.id !== id);
    save(d);
  }
  function adjustProduct(id, delta) {
    const d = load();
    const p = d.products.find((x) => x.id === id);
    if (!p) return;
    p.used = Math.max(0, Math.min(p.total, p.used + delta));
    save(d);
  }

  function stats(d) {
    const days = Util.rangeDays(7);
    const totalSteps = (d.steps.morning.length + d.steps.night.length) || 1;
    const pctList = days.map((day) => {
      const log = d.logs[day] || {};
      const done = (log.morning?.length || 0) + (log.night?.length || 0);
      return Math.round((done / totalSteps) * 100);
    });
    const avg = Math.round(pctList.reduce((a, b) => a + b, 0) / pctList.length);
    return { pctList, avg, totalSteps, days };
  }

  function render() {
    const d = load();
    const date = selDate;
    const isToday = Util.isToday(date);
    const log = d.logs[date] || { morning: [], night: [] };
    const s = stats(d);
    const dayLabel = isToday ? '今日' : Util.dateLabel(date);

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('drop', 16, '#5C6E7E')} ${dayLabel}护肤</h3>
          <button class="mini-btn ${manageOpen ? 'on' : ''}" id="skManageBtn">
            ${iconHTML('pencil', 12, manageOpen ? '#fff' : '#6F6A63')} 步骤
          </button>
        </div>

        ${Util.dateBar('skDate', date)}

        ${manageOpen ? renderManage(d) : ''}

        ${renderPeriodBlock('morning', 'sun',  '晨间流程', d.steps.morning, log.morning || [])}
        ${renderPeriodBlock('night',   'moon', '晚间流程', d.steps.night,   log.night || [])}
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('bottle', 16, '#5C6E7E')} 我的护肤品</h3></div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <input class="input" id="skPName" placeholder="产品名称" style="flex:1.6;min-width:120px" maxlength="20" />
          <input class="input" id="skPTotal" type="number" min="1" placeholder="总量 100" style="flex:1;min-width:90px" />
          <button class="btn btn-skincare btn-sm" id="skPAddBtn">+ 添加</button>
        </div>
        <div style="margin-top:10px">
          ${d.products.length === 0
            ? `<div class="empty"><div class="emo">${iconHTML('bottle', 32, '#A09A92')}</div>暂无产品记录</div>`
            : d.products.map((p) => {
                const pct = p.total > 0 ? Math.round(((p.total - p.used) / p.total) * 100) : 0;
                return `
                  <div class="product-item" data-id="${p.id}">
                    <div style="flex:1">
                      <div class="row">
                        <div class="pi-name">${Util.esc(p.name)}</div>
                        <div class="pi-pct">剩余 ${pct}%</div>
                      </div>
                      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
                    </div>
                    <button class="btn btn-ghost btn-sm" data-act="minus" aria-label="用掉一点">−</button>
                    <button class="btn btn-ghost btn-sm" data-act="plus" aria-label="补货">+</button>
                    <button class="task-del" data-act="del" aria-label="删除">×</button>
                  </div>
                `;
              }).join('')
          }
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('chart', 16, '#5C6E7E')} 本周完成率</h3><span class="more">近 7 天</span></div>
        <div class="chart-box chart-box-sm"><canvas id="chartSkincare"></canvas></div>
      </div>
    `;
  }

  function renderManage(d) {
    const block = (period, title) => `
      <div class="mp-title">${title}</div>
      ${d.steps[period].length === 0
        ? `<div class="mp-hint">还没有步骤，下面加一个吧</div>`
        : d.steps[period].map((s) => `
            <div class="manage-row" data-period="${period}" data-sid="${s.id}">
              <input class="input mr-name" data-field="stepName" value="${Util.esc(s.name)}" maxlength="14" />
              <button class="mr-del" data-act="delStep" aria-label="删除步骤">×</button>
            </div>
          `).join('')
      }
      <div class="manage-add">
        <input class="input" id="skNew_${period}" placeholder="新增${title}，如 眼霜" maxlength="14" />
        <button class="btn btn-skincare btn-sm" data-act="addStep" data-period="${period}">+</button>
      </div>
    `;
    return `
      <div class="manage-panel">
        <div class="mp-hint">步骤名称可改，改完自动保存；删掉不影响历史打卡。</div>
        ${block('morning', '晨间步骤')}
        ${block('night', '晚间步骤')}
      </div>
    `;
  }

  function renderPeriodBlock(period, iconName, titleText, steps, done) {
    const pct = steps.length === 0 ? 0 : Math.round((done.length / steps.length) * 100);
    return `
      <div class="skincare-block">
        <div class="sb-head">
          ${iconHTML(iconName, 16, period === 'morning' ? '#C9A66B' : '#6E7C8C')}
          <h4>${titleText}</h4>
          <span class="pct">${done.length}/${steps.length} · ${pct}%</span>
        </div>
        ${steps.length === 0
          ? `<div class="empty" style="padding:14px 0;font-size:12px">暂无步骤，点右上角「步骤」添加</div>`
          : steps.map((step) => {
              const isDone = done.includes(step.id);
              return `
                <div class="step-row ${isDone ? 'done' : ''}" data-period="${period}" data-step="${step.id}">
                  <div class="check">${isDone ? '✓' : ''}</div>
                  <div>${Util.esc(step.name)}</div>
                </div>
              `;
            }).join('')
        }
      </div>
    `;
  }

  function bind() {
    const pane = document.getElementById('pane-skincare');
    if (!pane) return;

    // 日期切换
    Util.bindDateBar(pane, 'skDate', (v) => { selDate = v; refresh(); });

    // 展开/收起步骤管理
    const manageBtn = document.getElementById('skManageBtn');
    if (manageBtn) {
      manageBtn.addEventListener('click', () => { manageOpen = !manageOpen; refresh(); });
    }

    // 步骤勾选
    pane.querySelectorAll('.step-row').forEach((row) => {
      row.addEventListener('click', () => {
        toggleStep(row.dataset.period, row.dataset.step, selDate);
        refresh();
      });
    });

    // 步骤改名（保存不重渲染）
    pane.querySelectorAll('.manage-row[data-sid]').forEach((row) => {
      const inp = row.querySelector('[data-field="stepName"]');
      if (!inp) return;
      inp.addEventListener('change', () => {
        const v = inp.value.trim();
        if (!v) {
          const d = load();
          const s = d.steps[row.dataset.period].find((x) => x.id === row.dataset.sid);
          inp.value = s ? s.name : '';
          return;
        }
        renameStep(row.dataset.period, row.dataset.sid, v);
      });
    });

    // 添加产品
    const addBtn = document.getElementById('skPAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = document.getElementById('skPName').value;
        const total = document.getElementById('skPTotal').value;
        if (!name.trim()) { Toast('请输入产品名'); return; }
        addProduct(name, total);
        document.getElementById('skPName').value = '';
        document.getElementById('skPTotal').value = '';
        Toast('已添加'); refresh();
      });
    }

    // 事件委托：步骤增删 + 产品操作（onclick 覆盖式绑定，避免刷新累积）
    pane.onclick = (e) => {
      const addStepBtn = e.target.closest('[data-act="addStep"]');
      if (addStepBtn) {
        const period = addStepBtn.dataset.period;
        const inp = document.getElementById('skNew_' + period);
        const v = inp ? inp.value.trim() : '';
        if (!v) { Toast('请输入步骤名称'); return; }
        addStep(period, v);
        Toast('已添加步骤');
        refresh();
        return;
      }

      const delStepBtn = e.target.closest('[data-act="delStep"]');
      if (delStepBtn) {
        const row = delStepBtn.closest('[data-sid]');
        if (!row) return;
        const inp = row.querySelector('[data-field="stepName"]');
        const nm = inp ? inp.value : '';
        if (confirm('删除步骤「' + nm + '」？\n历史打卡记录不会受影响。')) {
          delStep(row.dataset.period, row.dataset.sid);
          Toast('已删除步骤');
          refresh();
        }
        return;
      }

      const item = e.target.closest('.product-item');
      if (!item) return;
      const id = item.dataset.id;
      if (e.target.closest('[data-act="del"]')) {
        if (confirm('删除这个产品？')) { delProduct(id); refresh(); }
      } else if (e.target.closest('[data-act="minus"]')) {
        adjustProduct(id, -5); refresh();
      } else if (e.target.closest('[data-act="plus"]')) {
        adjustProduct(id, 20); refresh();
      }
    };

  }

  function drawChart() {
    if (typeof Chart === 'undefined') return;
    const d = load();
    const s = stats(d);
    const ctx = document.getElementById('chartSkincare');
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['完成', '未完成'],
        datasets: [{
          data: [s.avg, 100 - s.avg],
          backgroundColor: ['#A5B5C4', '#EEE6DB'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
      plugins: [{
        id: 'centerText',
        afterDraw(chart) {
          const { ctx: c, chartArea } = chart;
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = (chartArea.top + chartArea.bottom) / 2;
          c.save();
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillStyle = '#3F3A35';
          c.font = '700 22px -apple-system, sans-serif';
          c.fillText(s.avg + '%', cx, cy - 6);
          c.fillStyle = '#A09A92';
          c.font = '11px -apple-system, sans-serif';
          c.fillText('本周完成率', cx, cy + 14);
          c.restore();
        },
      }],
    });
  }

  function refresh() {
    const pane = document.getElementById('pane-skincare');
    if (!pane) return;
    try {
      pane.innerHTML = render();
      bind();
    } catch (e) {
      console.error('[skincare.js] render error:', e);
      pane.innerHTML = '<div class="empty"><div class="emo">⚠️</div>模块加载异常：' + (e && e.message ? e.message : e) + '</div>';
      return;
    }
    try { drawChart(); } catch (e) { console.error('[skincare.js] chart error:', e); }
  }
  function init() { selDate = Util.today(); refresh(); }
  function onShow() { drawChart(); }
  global.Skincare = { init, refresh, onShow };
})(window);
