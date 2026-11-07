#!/usr/bin/env python3
"""把 src/index.html + css + js 打包成单文件 index.html（减少国内网络请求数）"""
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))


def read(rel):
    with open(os.path.join(BASE, rel), 'r', encoding='utf-8') as f:
        return f.read()


html = read('src/index.html')

# 1) 内联 CSS
css = read('css/style.css')
html = html.replace(
    '<link rel="stylesheet" href="css/style.css" />',
    '<style>\n' + css + '\n</style>'
)

# 2) 内联 Chart.js（本地文件）
chart = read('js/lib/chart.umd.min.js')
html = html.replace(
    '<script src="js/lib/chart.umd.min.js"></script>',
    '<script>\n' + chart + '\n</script>'
)

# 3) 移除 CDN fallback 段（已内联，无需请求）
html = re.sub(
    r'\s*<script>\s*if \(typeof Chart === .undefined.\) \{.*?\}\s*</script>',
    '',
    html,
    flags=re.S,
)

# 4) 按顺序内联模块脚本
JS_ORDER = [
    'js/icons.js',
    'js/storage.js',
    'js/study.js',
    'js/exercise.js',
    'js/skincare.js',
    'js/finance.js',
    'js/app.js',
]
for jf in JS_ORDER:
    html = html.replace(
        '<script src="%s"></script>' % jf,
        '<script>\n' + read(jf) + '\n</script>'
    )

# 5) 校验没有残留外部引用
left = [x for x in re.findall(r'(?:src|href)="([^"]+)"', html)
        if x.startswith('js/') or x.startswith('css/')]
if left:
    raise SystemExit('仍有外部引用: %s' % left)

out = os.path.join(BASE, 'index.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
# 离线版同内容
with open(os.path.join(BASE, 'index-standalone.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print('构建完成: index.html  %.0f KB' % (os.path.getsize(out) / 1024))
