/* ============================
 * skincare.js — 护肤模块
 * 数据：{ steps: {morning:[...], night:[...]}, products:[{id,name,total,used,unit}],
 *         logs: { 'yyyy-mm-dd': { morning:[stepName,...], night:[...] } } }
 * ============================ */
(function (global) {
  const KEY = 'skincare';
  const DEFAULT_MORNING = ['洁面', '化妆水', '精华', '乳液', '防晒'];
  const DEFAULT_NIGHT   = ['卸妆', '洁面', '化妆水', '精华', '面霜'];

  function load() {
    let d = Storage.get(KEY);
    if (!d) {
      d = {
        steps: { morning: [...DEFAULT_MORNING], night: [...DEFAULT_NIGHT] },
        products: [],
        logs: {},
      };
      Storage.set(KEY, d);
    }
    d.steps = d.steps || { morning: [], night: [] };
    d.products = d.products || [];
    d.logs = d.logs || {};
    return d;
  }
  function save(d) { Storage.set(KEY, d); }

  function toggleStep(period, step) {
    const d = load();
    const today = Util.today();
    d.logs[today] = d.logs[today] || { morning: [], night: [] };
    d.logs[today][period] = d.logs[today][period] || [];
    const arr = d.logs[today][period];
    const i = arr.indexOf(step);
    if (i >= 0) arr.splice(i, 1); else arr.push(step);
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
    // 本周 7 天的护肤完成率
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
    const today = Util.today();
    const log = d.logs[today] || { morning: [], night: [] };
    const s = stats(d);

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('drop', 16, '#5C6E7E')} 今日护肤</h3>
          <span class="tag tag-skincare">护肤</span>
        </div>

        ${renderPeriodBlock('morning', 'sun',     d.steps.morning, log.morning || [], s)}
        ${renderPeriodBlock('night',   'moon',    d.steps.night,   log.night || [], s)}
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

  function renderPeriodBlock(period, iconName, steps, done, s) {
    const pct = steps.length === 0 ? 0 : Math.round((done.length / steps.length) * 100);
    const titleText = iconName === 'sun' ? '晨间流程' : '晚间流程';
    return `
      <div class="skincare-block">
        <div class="sb-head">
          ${iconHTML(iconName, 16, period === 'morning' ? '#C9A66B' : '#6E7C8C')}
          <h4>${titleText}</h4>
          <span class="pct">${done.length}/${steps.length} · ${pct}%</span>
        </div>
        ${steps.length === 0
          ? `<div class="empty" style="padding:14px 0;font-size:12px">暂无步骤</div>`
          : steps.map((step) => {
              const isDone = done.includes(step);
              return `
                <div class="step-row ${isDone ? 'done' : ''}" data-period="${period}" data-step="${Util.esc(step)}">
                  <div class="check">${isDone ? '✓' : ''}</div>
                  <div>${Util.esc(step)}</div>
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

    // 步骤勾选
    pane.querySelectorAll('.step-row').forEach((row) => {
      row.addEventListener('click', () => {
        const period = row.dataset.period;
        const step = row.dataset.step;
        toggleStep(period, step);
        refresh();
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

    // 产品操作（事件委托）
    pane.addEventListener('click', (e) => {
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
    });
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
  function init() { refresh(); }
  function onShow() { drawChart(); }
  global.Skincare = { init, refresh, onShow };
})(window);
