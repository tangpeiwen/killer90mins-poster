#!/usr/bin/env python3
"""
L4 验收 —— 读回 .ai 的实际状态并重算，不信任任何生成脚本的自述。

输入:  _audit_output.jsx 产出的 <doc>_L4.txt  +  config/slots.json  +  briefs/<date>.json
输出:  逐格 PASS / FAIL 表

判定（定义见 docs/specs/2026-08-23-...-design.md）:
  R2  名牌墨迹下边 → 人像轮廓，最小垂线净距 = 12mm ± 1mm
  R3  头部最宽处到黑板左右两侧的距离，|左−右| ≤ 4mm
  R1  名牌横向中心 vs 黑板中心，|偏移| ≤ 1mm
  COV 人像底部超出黑板底 ≥ 1mm（无透明缝）
"""
import sys, re, json, math, argparse
from pathlib import Path
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
PT = 25.4 / 72
MM = 72 / 25.4


def parse_l4(path):
    txt = Path(path).read_text(encoding='utf-8')
    slots, misc = {}, {}
    for m in re.finditer(r'(ACTOR_\d\d) name="(.*?)" font=(\S+) size=([\d.]+) '
                         r'ink_gb=\[([^\]]+)\] photo_gb=\[([^\]]+)\] photo_file=(\S+)', txt):
        slots[m.group(1)] = {'name': m.group(2), 'font': m.group(3), 'size': float(m.group(4)),
                             'ink': [float(v) for v in m.group(5).split(',')],
                             'photo': [float(v) for v in m.group(6).split(',')],
                             'file': m.group(7)}
    # 模式行与照片行合并，不覆盖：兼具两种模式的格子（ACTOR_04/05）两条都会出现，
    # 早先这里直接赋值，会把照片模式量到的 ink/photo 冲掉，导致该格漏检。
    for m in re.finditer(r'(ACTOR_\d\d) photo_mode_visible=(\S+) silhouette_hidden=(\S+)', txt):
        d = slots.setdefault(m.group(1), {})
        d['photo_mode_visible'] = m.group(2)
        d['silhouette_hidden'] = m.group(3)
    for m in re.finditer(r'DATE (\S[^=]*)="(.*?)"', txt):
        misc.setdefault('date', {})[m.group(1).strip()] = m.group(2)
    for m in re.finditer(r'DATE (\S[^=]*)=".*?" gb=\[[^\]]+\] ink_gb=\[([^\]]+)\]', txt):
        misc.setdefault('date_ink', {})[m.group(1).strip()] = \
            [float(v) for v in m.group(2).split(',')]
    m = re.search(r'HOST_BADGE gb=\[([^\]]+)\] hidden=(\S+)', txt)
    if m:
        misc['host'] = {'gb': [float(v) for v in m.group(1).split(',')], 'hidden': m.group(2)}
    return slots, misc


def rot_h(ink, th):
    l, t, r, b = ink
    W, H = r - l, t - b
    ca, sa = math.cos(th), math.sin(th)
    det = ca * ca - sa * sa
    return (W * ca - H * sa) / det, (H * ca - W * sa) / det


def head_cols(png, alpha=128):
    A = np.array(Image.open(png).split()[-1])
    H, W = A.shape
    m = A >= alpha
    rows = np.full(W, -1, dtype=np.int64)
    for c in range(W):
        idx = np.nonzero(m[:int(H * 0.45), c])[0]
        if len(idx):
            rows[c] = idx[0]
    top = int(np.argmax(m.sum(1) > max(3, int(H * 0.001))))
    best = (0, 0, 0)
    for r in range(top + int(H * 0.05), min(H, top + int(H * 0.20))):
        i = np.nonzero(m[r])[0]
        if len(i) < 3:
            continue
        seg = max(np.split(i, np.where(np.diff(i) > W * 0.03)[0] + 1), key=len)
        if seg[-1] - seg[0] > best[0]:
            best = (seg[-1] - seg[0], seg[0], seg[-1])
    return rows, W, H, best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('l4_txt')
    ap.add_argument('brief')
    a = ap.parse_args()
    cfg = json.loads((ROOT / 'config/slots.json').read_text(encoding='utf-8'))
    brief = json.loads(Path(a.brief).read_text(encoding='utf-8'))
    got, misc = parse_l4(a.l4_txt)
    rule = cfg['rules']

    print(f'\n{"slot":<10}{"演员":<9}│ {"R0 上沿→名牌":<15}{"R2 名牌→头顶":<15}{"R3 左−右":<15}'
          f'{"R1 名牌居中":<14}{"COV 出血":<10}')
    print('─' * 100)
    ok = True
    for slot, s in brief['slots'].items():
        sl = cfg['slots'][slot]
        if s['mode'] != 'PHOTO':
            g = got.get(slot, {})
            good = g.get('photo_mode_visible') == 'false' and g.get('silhouette_hidden') == 'false'
            ok &= good
            print(f'{slot:<10}{"secret":<9}│ 剪影模式 photo_mode={g.get("photo_mode_visible")} '
                  f'silhouette_hidden={g.get("silhouette_hidden")}  '
                  f'{"PASS" if good else "FAIL"}')
            continue
        g = got[slot]
        if 'ink' not in g:
            ok = False
            print(f'{slot:<10}{"?":<9}│ L4 里没有这一格的照片模式数据 —— '
                  f'审计脚本是旧版或该格没切到照片模式   FAIL')
            continue
        # 这一格若同时具备剪影能力，还得确认它真的停在照片模式
        mode_ok = ('photo_mode_visible' not in g
                   or (g['photo_mode_visible'] == 'true' and g['silhouette_hidden'] == 'true'))
        te = sl['top_edge']
        m_, (x1, y1) = te['slope'], te['through']
        th = math.atan(m_); ca, sa = math.cos(th), math.sin(th)
        n = math.hypot(m_, 1)

        cw, ch = rot_h(g['ink'], th)
        Cx, Cy = (g['ink'][0] + g['ink'][2]) / 2, (g['ink'][1] + g['ink'][3]) / 2
        c_bot = (Cy - (ch / 2) * ca) - m_ * (Cx + (ch / 2) * sa)
        # R0: 黑板上沿 → 名牌墨迹上边（垂线）
        r0 = ((m_ * Cx - Cy + (y1 - m_ * x1)) / n - ch / 2) * PT

        pl_, pt_, pr_, pb_ = g['photo']
        rows, PW, PH, best = head_cols(ROOT / s['photo'])
        sx, sy = (pr_ - pl_) / PW, (pt_ - pb_) / PH

        xa, xb = Cx - cw / 2 * ca, Cx + cw / 2 * ca
        gap = None
        for col in range(max(0, int((xa - pl_) / sx)), min(PW, int((xb - pl_) / sx) + 1)):
            if rows[col] < 0:
                continue
            xd = pl_ + (col + 0.5) * sx
            v = (m_ * xd - (pt_ - rows[col] * sy) + c_bot) / n
            if gap is None or v < gap:
                gap = v
        r2 = gap * PT if gap is not None else float('nan')

        hl, hr = pl_ + best[1] * sx, pl_ + (best[2] + 1) * sx
        r3 = ((hl - sl['left_pt']) - (sl['right_pt'] - hr)) * PT
        r1 = (Cx - sl['center_x_pt']) * PT
        cov = (sl['bottom_pt'] - pb_) * PT

        gp_t = sl.get('gap_panel_to_card_mm', rule['gap_panel_to_card_mm'])
        o0 = abs(r0 - gp_t) <= rule['tol_gap_mm']
        o2 = abs(r2 - rule['gap_card_to_head_mm']) <= rule['tol_gap_mm']
        o3 = abs(r3) <= rule['tol_center_mm']
        o1 = abs(r1) <= rule['tol_card_center_mm']
        o4 = cov >= rule['bottom_bleed_mm'] - 0.05
        ok &= o0 and o2 and o3 and o1 and o4 and mode_ok
        if not mode_ok:
            print(f'{slot:<10}{"":<9}│ 照片模式未生效：photo_mode_visible='
                  f'{g.get("photo_mode_visible")} silhouette_hidden='
                  f'{g.get("silhouette_hidden")}   FAIL')
        f = lambda b: 'PASS' if b else 'FAIL'
        print(f'{slot:<10}{g["name"][:8]:<9}│ {r0:>6.2f} {f(o0):<8}{r2:>6.2f} {f(o2):<8}'
              f'{r3:>+6.2f} {f(o3):<8}{r1:>+6.2f} {f(o1):<7}{cov:>7.1f} {f(o4):<6}')

    print('─' * 100)
    d = misc.get('date', {})
    dok = (d.get('MONTH') == brief['month'] and d.get('DAY') == brief['day']
           and d.get('WEEKDAY') == brief['weekday'] and d.get('EVENT TIME') == brief['time'])
    ok &= dok
    print(f'日期  {d.get("MONTH")} {d.get("DAY")} {d.get("WEEKDAY")}  |  {d.get("EVENT TIME")}   '
          f'{"PASS" if dok else "FAIL"}')

    # MONTH 墨迹右沿 → DAY 墨迹左沿。模板里 DAY/WEEKDAY 位置是死的，
    # 换月份或换成一位数就走形；目标值由两份认可稿反推（见 config 的 _date_gap_note）。
    di = misc.get('date_ink', {})
    want = rule.get('date_month_to_day_gap_mm')
    if want is not None and {'MONTH', 'DAY'} <= set(di):
        got_gap = (di['DAY'][0] - di['MONTH'][2]) * PT
        tol = rule.get('tol_date_gap_mm', 1.0)
        gok = abs(got_gap - want) <= tol
        ok &= gok
        print(f'日期间距  MONTH→DAY {got_gap:.2f}mm  目标 {want}±{tol}mm   '
              f'{"PASS" if gok else "FAIL"}')
    elif want is not None:
        ok = False
        print('日期间距  L4 里没有 ink_gb —— 审计脚本是旧版，重跑 _audit_output.jsx   FAIL')

    hb = misc.get('host', {})
    hs = cfg['slots'][brief['host']]
    hin = hb and hs['left_pt'] <= (hb['gb'][0] + hb['gb'][2]) / 2 <= hs['right_pt'] and hb['hidden'] == 'false'
    ok &= bool(hin)
    print(f'HOST 徽章  落在 {brief["host"]}   {"PASS" if hin else "FAIL"}')

    print(f'\n目标: R0 逐格（见 config/slots.json）±{rule["tol_gap_mm"]}mm | '
          f'R2 {rule["gap_card_to_head_mm"]}±{rule["tol_gap_mm"]}mm | '
          f'R3 ≤{rule["tol_center_mm"]}mm | R1 ≤{rule["tol_card_center_mm"]}mm | '
          f'COV ≥{rule["bottom_bleed_mm"]}mm')
    print(f'\n{"✅ 全部通过" if ok else "❌ 有不通过项"}\n')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
