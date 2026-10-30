/* ============================
 * finance.js — 记账模块
 * 数据：{ records: [{id,date,type,amount,category,note}] }
 * ============================ */
(function (global) {
  const KEY = 'finance';
  const CATS = {
    out: [
      { key: 'food',    name: '餐饮',  icon: 'food' },
      { key: 'trans',   name: '交通',  icon: 'bus' },
      { key: 'shop',    name: '购物',  icon: 'bag' },
      { key: 'study',   name: '学习',  icon: 'book' },
      { key: 'beauty',  name: '护肤',  icon: 'drop' },
      { key: 'health',  name: '健康',  icon: 'pill' },
      { key: 'fun',     name: '娱乐',  icon: 'game' },
      { key: 'home',    name: '居家',  icon: 'house' },
      { key: 'other',   name: '其他',  icon: 'sparkle' },
    ],
    in: [
      { key: 'salary',  name: '工资',  icon: 'briefcase' },
      { key: 'bonus',   name: '奖金',  icon: 'gift' },
      { key: 'part',    name: '兼职',  icon: 'wrench' },
      { key: 'invest',  name: '投资',  icon: 'chart' },
      { key: 'gift',    name: '红包',  icon: 'heart' },
      { key: 'other',   name: '其他',  icon: 'sparkle' },
    ],
  };
  const CAT_MAP = {};
  CATS.out.concat(CATS.in).forEach((c) => { CAT_MAP[c.key] = c; });

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
      type: rec.type,                   // 'in' | 'out'
      amount: Number(rec.amount) || 0,
      category: rec.category,
      note: rec.note || '',
    });
    save(d);
  }
  function del(id) {
    const d = load();
    d.records = d.records.filter((r) => r.id !== id);
    save(d);
  }

  function summary(d) {
    const month = Util.thisMonth();
    const list = d.records.filter((r) => r.date.slice(0, 7) === month);
    const inTotal  = list.filter((r) => r.type === 'in').reduce((s, r) => s + r.amount, 0);
    const outTotal = list.filter((r) => r.type === 'out').reduce((s, r) => s + r.amount, 0);
    return { inTotal, outTotal, net: inTotal - outTotal, month, list };
  }

  function outByCategory(d) {
    const month = Util.thisMonth();
    const map = {};
    d.records.filter((r) => r.type === 'out' && r.date.slice(0, 7) === month).forEach((r) => {
      map[r.category] = (map[r.category] || 0) + r.amount;
    });
    const arr = Object.entries(map).map(([k, v]) => ({ key: k, name: CAT_MAP[k]?.name || k, icon: CAT_MAP[k]?.icon || 'sparkle', amount: v }));
    arr.sort((a, b) => b.amount - a.amount);
    return arr;
  }

  function render() {
    const d = load();
    const s = summary(d);
    const pie = outByCategory(d);

    return `
      <div class="card">
        <div class="card-title">
          <h3>${iconHTML('wallet', 16, '#7A5A48')} 本月账单</h3>
          <span class="tag tag-finance">${s.month}</span>
        </div>
        <div class="finance-summary">
          <div class="fs-cell in"><div class="l">收入</div><div class="v">+${s.inTotal.toFixed(0)}</div></div>
          <div class="fs-cell out"><div class="l">支出</div><div class="v">-${s.outTotal.toFixed(0)}</div></div>
          <div class="fs-cell net"><div class="l">结余</div><div class="v">${s.net >= 0 ? '+' : ''}${s.net.toFixed(0)}</div></div>
        </div>

        <div class="type-toggle">
          <button class="active out" data-type="out">支出</button>
          <button data-type="in">收入</button>
        </div>

        <div class="row" style="gap:8px">
          <input class="input" id="finAmt" type="number" min="0.01" step="0.01" placeholder="金额" style="flex:1" />
        </div>
        <div class="field" style="margin-top:10px">
          <label>分类</label>
          <div id="finCatList" style="display:flex;flex-wrap:wrap;gap:6px">
            ${renderCatChips('out')}
          </div>
        </div>
        <div class="field">
          <input class="input" id="finNote" placeholder="备注(可选)" maxlength="40" />
        </div>
        <button class="btn btn-finance btn-block" id="finAddBtn">＋ 记一笔</button>
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('chart', 16, '#7A5A48')} 支出分类</h3><span class="more">本月</span></div>
        ${pie.length === 0
          ? `<div class="empty"><div class="emo">${iconHTML('chart', 32, '#A09A92')}</div>本月暂无支出</div>`
          : `<div class="chart-box"><canvas id="chartFinance"></canvas></div>`
        }
      </div>

      <div class="card">
        <div class="card-title"><h3>${iconHTML('book', 16, '#7A5A48')} 流水明细</h3></div>
        ${d.records.length === 0
          ? `<div class="empty"><div class="emo">${iconHTML('coin', 32, '#A09A92')}</div>还没有记录，记一笔吧</div>`
          : renderGrouped(d.records)
        }
      </div>
    `;
  }

  function renderCatChips(type) {
    return CATS[type].map((c, i) => `
      <button class="tag ${i === 0 ? 'tag-finance' : ''}" data-cat="${c.key}"
              style="padding:6px 12px;font-size:12px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--c-finance)' : 'transparent'};display:inline-flex;align-items:center;gap:4px">
        ${iconHTML(c.icon, 12, '#7A5A48')} ${c.name}
      </button>
    `).join('');
  }

  function renderItem(r) {
    const c = CAT_MAP[r.category] || { name: r.category, icon: 'sparkle' };
    return `
      <div class="fin-item ${r.type}" data-id="${r.id}">
        <div class="fi-cat">${iconHTML(c.icon, 16, '#7A5A48')}</div>
        <div class="fi-main">
          <div class="fi-cat-name">${c.name} ${r.note ? '· ' + Util.esc(r.note) : ''}</div>
          <div class="fi-date">${Util.relDate(r.date)}</div>
        </div>
        <div class="fi-amt">${r.type === 'in' ? '+' : '-'}${r.amount.toFixed(2)}</div>
        <button class="fi-del" data-act="del" aria-label="删除">×</button>
      </div>
    `;
  }

  function renderGrouped(records) {
    const groups = {};
    records.forEach((r) => {
      (groups[r.date] = groups[r.date] || []).push(r);
    });
    return Object.keys(groups).slice(0, 20).map((date) => {
      const d = new Date(date);
      const inSum  = (groups[date] || []).filter((r) => r.type === 'in').reduce((s, r) => s + r.amount, 0);
      const outSum = (groups[date] || []).filter((r) => r.type === 'out').reduce((s, r) => s + r.amount, 0);
      return `
        <div class="day-group">
          <div class="dg-head">
            <span>${Util.md(d)} ${Util.weekdayCN(d)}
              ${inSum ? `<span style="color:#6E8F60">+${inSum.toFixed(0)}</span>` : ''}
              ${outSum ? `<span style="color:var(--c-finance)">-${outSum.toFixed(0)}</span>` : ''}
            </span>
          </div>
          ${groups[date].map((r) => renderItem(r)).join('')}
        </div>
      `;
    }).join('');
  }

  function bind() {
    const pane = document.getElementById('pane-finance');
    let curType = 'out';
    let curCat  = CATS.out[0].key;

    // 切换收入/支出
    pane.querySelectorAll('.type-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => {
        curType = btn.dataset.type;
        pane.querySelectorAll('.type-toggle button').forEach((b) => {
          b.classList.toggle('active', b === btn);
          if (b === btn) b.classList.add(curType);
        });
        curCat = CATS[curType][0].key;
        document.getElementById('finCatList').innerHTML = renderCatChips(curType);
        bindChips();
      });
    });

    function bindChips() {
      pane.querySelectorAll('#finCatList .tag').forEach((tag) => {
        tag.addEventListener('click', () => {
          pane.querySelectorAll('#finCatList .tag').forEach((t) => {
            t.style.borderColor = 'transparent';
            t.classList.remove('tag-finance');
          });
          tag.style.borderColor = 'var(--c-finance)';
          tag.classList.add('tag-finance');
          curCat = tag.dataset.cat;
        });
      });
    }
    bindChips();

    // 记一笔
    document.getElementById('finAddBtn').addEventListener('click', () => {
      const amt = document.getElementById('finAmt').value;
      if (!amt || amt <= 0) { Toast('请输入金额'); return; }
      add({ type: curType, amount: amt, category: curCat, note: document.getElementById('finNote').value });
      document.getElementById('finAmt').value = '';
      document.getElementById('finNote').value = '';
      Toast('已记账'); refresh();
    });

    // 删除
    pane.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-act="del"]');
      if (!delBtn) return;
      const item = delBtn.closest('[data-id]');
      if (!item) return;
      if (confirm('删除这笔记录？')) { del(item.dataset.id); refresh(); }
    });
  }

  function drawChart() {
    if (typeof Chart === 'undefined') return;
    const d = load();
    const pie = outByCategory(d);
    const ctx = document.getElementById('chartFinance');
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    const palette = ['#C4A89A', '#D4A5A5', '#A8B89A', '#A5B5C4', '#B8A89A', '#C8B4A2', '#9DA8B4', '#B6A294', '#C2B0A0'];
    ctx._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: pie.map((p) => p.name),
        datasets: [{
          data: pie.map((p) => p.amount),
          backgroundColor: pie.map((_, i) => palette[i % palette.length]),
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { color: '#6F6A63', font: { size: 11 }, boxWidth: 10, padding: 8 } },
        },
      },
    });
  }

  function refresh() {
    const pane = document.getElementById('pane-finance');
    if (!pane) return;
    try {
      pane.innerHTML = render();
      bind();
    } catch (e) {
      console.error('[finance.js] render error:', e);
      pane.innerHTML = '<div class="empty"><div class="emo">⚠️</div>模块加载异常：' + (e && e.message ? e.message : e) + '</div>';
      return;
    }
    try { drawChart(); } catch (e) { console.error('[finance.js] chart error:', e); }
  }
  function init() { refresh(); }
  function onShow() { drawChart(); }
  global.Finance = { init, refresh, onShow };
})(window);
