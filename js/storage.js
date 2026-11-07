/* ============================
 * storage.js
 * 统一的 localStorage 封装
 * ============================ */
(function (global) {
  const PREFIX = 'wb_';

  const Storage = {
    /** 读取数据（带默认值） */
    get(key, defaultVal) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw == null) return defaultVal;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[Storage.get]', key, e);
        return defaultVal;
      }
    },

    /** 写入数据 */
    set(key, val) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(val));
        return true;
      } catch (e) {
        console.warn('[Storage.set]', key, e);
        return false;
      }
    },

    /** 删除 */
    remove(key) {
      localStorage.removeItem(PREFIX + key);
    },

    /** 生成唯一 id */
    uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },
  };

  /* ============ 工具函数 ============ */
  const Util = {
    /** 今日 yyyy-mm-dd */
    today() {
      const d = new Date();
      return this.fmtDate(d);
    },
    /** 是否今天 */
    isToday(dateStr) {
      return dateStr === this.today();
    },
    /** 日期加减天数 */
    shiftDate(dateStr, delta) {
      const d = new Date((dateStr || this.today()) + 'T00:00:00');
      if (isNaN(d.getTime())) return this.today();
      d.setDate(d.getDate() + delta);
      return this.fmtDate(d);
    },
    /** 日期友好标签：今天 / 昨天 / 11月5日 周三 */
    dateLabel(dateStr) {
      const today = this.today();
      if (dateStr === today) return '今天';
      if (dateStr === this.shiftDate(today, -1)) return '昨天';
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return `${this.md(d)} ${this.weekdayCN(d)}`;
    },
    /** 日期选择条 HTML（默认选中 dateStr，不能选未来） */
    dateBar(inputId, dateStr) {
      const today = this.today();
      const val = dateStr || today;
      const atToday = val >= today;
      return `
        <div class="date-bar">
          <button class="db-arrow" type="button" data-db="prev" aria-label="前一天">‹</button>
          <div class="db-center">
            <span class="db-label">${this.dateLabel(val)}</span>
            <input class="db-input" type="date" id="${inputId}" value="${val}" max="${today}" aria-label="选择日期" />
          </div>
          <button class="db-arrow" type="button" data-db="next" aria-label="后一天" ${atToday ? 'disabled' : ''}>›</button>
          ${atToday ? '' : '<button class="db-today" type="button" data-db="today">回到今天</button>'}
        </div>`;
    },
    /** 绑定日期条：切换日期时回调 */
    bindDateBar(scope, inputId, onChange) {
      const root = scope || document;
      const inp = root.querySelector('#' + inputId);
      if (!inp) return;
      const bar = inp.closest('.date-bar');
      let cur = inp.value || this.today();

      const commit = (v) => {
        const today = this.today();
        if (!v) v = today;
        if (v > today) v = today;
        cur = v;
        onChange(v);
      };

      inp.addEventListener('change', () => commit(inp.value));

      if (bar) {
        bar.querySelectorAll('[data-db]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const act = btn.dataset.db;
            if (act === 'prev') commit(this.shiftDate(cur, -1));
            else if (act === 'next') commit(this.shiftDate(cur, 1));
            else commit(this.today());
          });
        });
      }
    },
    fmtDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    /** 友好的中文星期 */
    weekdayCN(d) {
      return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    },
    /** 月-日 */
    md(d) {
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    },
    /** 相对日期：今天 / 昨天 / N天前 / yyyy-mm-dd */
    relDate(dateStr) {
      const today = new Date();
      const d = new Date(dateStr);
      const diff = Math.floor((today - d) / 86400000);
      if (diff === 0) return '今天';
      if (diff === 1) return '昨天';
      if (diff > 1 && diff < 7) return `${diff} 天前`;
      return dateStr;
    },
    /** 计算连续打卡天数（从今天往前数） */
    streak(dates) {
      if (!dates || !dates.length) return 0;
      const set = new Set(dates);
      let n = 0;
      const cur = new Date();
      while (true) {
        const k = this.fmtDate(cur);
        if (set.has(k)) {
          n++;
          cur.setDate(cur.getDate() - 1);
        } else {
          // 允许今天没打卡但昨天有：连续数从昨天算
          if (n === 0) {
            cur.setDate(cur.getDate() - 1);
            const k2 = this.fmtDate(cur);
            if (!set.has(k2)) break;
          } else {
            break;
          }
        }
      }
      return n;
    },
    /** N 天范围（默认近 7 天，含今天） */
    rangeDays(n) {
      const arr = [];
      const cur = new Date();
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(cur);
        d.setDate(cur.getDate() - i);
        arr.push(this.fmtDate(d));
      }
      return arr;
    },
    /** 本月 yyyy-mm */
    thisMonth() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    },
    /** 判断是否本月 */
    inMonth(dateStr) {
      return dateStr.slice(0, 7) === this.thisMonth();
    },
    /** 转义 HTML */
    esc(s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
  };

  global.Storage = Storage;
  global.Util = Util;
})(window);
