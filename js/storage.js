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
