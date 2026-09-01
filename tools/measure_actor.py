#!/usr/bin/env python3
"""
L2 素材闸门 —— 测量一张透明底演员 PNG，并在不合格时拒绝。

用法:
    python3 measure_actor.py <photo.png> [<photo2.png> ...] [--out actors/] [--target-width-mm 190]

产出:
    actors/<id>.json     三个比例值 + 体检结论
    actors/<id>_check.png 画了发顶线与头宽框的核对图（人眼确认一次）

定义见 docs/specs/2026-08-23-...-design.md §4.4 §4.6:
    headTopRatio     = alpha>=128 连续覆盖 >=0.1% 图高的第一行 / 图高
    headCenterXRatio = 发顶下 5%-20% 内轮廓最宽那一行的中点 / 图宽
    headWidthRatio   = 同一行的宽度 / 图宽
"""
import sys, json, argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None

ALPHA = 128            # 见 §4.4：>16 会把渲染出来接近纯黑的发丝算进来
TOP_COVER = 0.001      # 发顶判定：该行 alpha>=128 的像素数 >= 0.1% 图高
BANDS = [(0.03, 0.22), (0.05, 0.20), (0.05, 0.25)]   # 三种搜索窗口，用于自检稳定性
SPLIT = 0.03           # 与主体水平分离超过 3% 图宽的块视为麦克风/举起的手，剔除
MIN_DPI = 250
MAX_SPREAD = 0.003     # 三窗口分歧警告线（占图宽）；非拒绝条件
CROWN_MAX  = 0.10      # 最上 5 行轮廓宽超过此值 = 头顶被裁切


def widest_row(mask, top, lo, hi):
    H, W = mask.shape
    best = (0, 0, 0, 0)
    for r in range(top + int(H * lo), min(H, top + int(H * hi))):
        idx = np.nonzero(mask[r])[0]
        if len(idx) < 3:
            continue
        seg = max(np.split(idx, np.where(np.diff(idx) > W * SPLIT)[0] + 1), key=len)
        if seg[-1] - seg[0] > best[0]:
            best = (seg[-1] - seg[0], seg[0], seg[-1], r)
    return best


def measure(path, target_width_mm):
    p = Path(path)
    im = Image.open(p)
    issues = []
    if im.mode != 'RGBA':
        return None, [f'不是 RGBA，没有 alpha 通道（当前 {im.mode}）——无法定位人物']

    A = np.array(im.split()[-1])
    H, W = A.shape
    mask = A >= ALPHA

    rows = mask.sum(1)
    thr = max(3, int(H * TOP_COVER))
    if not (rows > thr).any():
        return None, ['alpha 通道里找不到主体']
    top = int(np.argmax(rows > thr))

    results = [widest_row(mask, top, lo, hi) for lo, hi in BANDS]
    centers = [(b[1] + b[2] + 1) / 2 / W for b in results]
    spread = max(centers) - min(centers)
    w0, l0, r0, row0 = results[1]          # [5%,20%] 为准

    # 硬性拒绝：这些问题无论怎么摆都出不来能用的图
    fatal = []
    dpi = W / target_width_mm * 25.4
    if dpi < MIN_DPI:
        fatal.append(f'分辨率不足：{W}px 铺到 {target_width_mm:.0f}mm 约 {dpi:.0f} dpi（需 >= {MIN_DPI}）')
    idx = np.nonzero(mask[top])[0]
    crown = max((np.ptp(np.nonzero(mask[top + k])[0]) if mask[top + k].any() else 0)
                for k in range(min(5, H - top))) / W
    if crown > CROWN_MAX:
        fatal.append(f'头顶疑似被裁切：最上 5 行的轮廓宽达 {crown:.1%} 图宽（正常头顶是一个点，< {CROWN_MAX:.0%}）')
    if top / H > 0.35:
        fatal.append(f'发顶在 {top/H:.1%} 处，主体偏下，可能不是半身像')

    # 软性警告：够用，但值得知道
    if spread > MAX_SPREAD:
        issues.append(f'头中心定位偏软：三种搜索窗口分歧 {spread:.4f} 图宽 ≈ '
                      f'{spread * target_width_mm:.2f}mm（长发常见，头发向下越来越宽，'
                      f'"最宽的一行"不是锚定特征）。容差 4mm，可用。')
    if top / H < 0.01:
        issues.append(f'发顶距画布上沿仅 {top/H:.2%}，裁切极紧；本期够用，'
                      f'但以后若需把头往上挪没有余量')
    issues = fatal + issues

    data = {
        'id': p.stem,
        'file': str(p),
        'px': [W, H],
        'headTopRatio':     round(top / H, 6),
        'headCenterXRatio': round(centers[1], 6),
        'headWidthRatio':   round(w0 / W, 6),
        'headWidestDepth':  round((row0 - top) / H, 6),
        'aspect':           round(W / H, 6),
        'dpi_at_target':    round(dpi, 1),
        'center_spread':    round(spread, 6),
        'alpha_threshold':  ALPHA,
        'verdict': 'REJECT' if fatal else ('OK-WARN' if issues else 'OK'),
        'fatal': fatal,
        'issues': issues,
    }
    return (data, im, top, l0, r0, row0), issues


def check_image(im, top, l0, r0, row0, out):
    W, H = im.size
    sc = 900 / W
    v = im.convert('RGBA')
    bg = Image.new('RGBA', v.size, (24, 24, 28, 255))
    v = Image.alpha_composite(bg, v).convert('RGB').resize((900, int(H * sc)))
    d = ImageDraw.Draw(v)
    y = top * sc
    d.line([(0, y), (900, y)], fill=(255, 60, 200), width=3)                       # 发顶
    d.rectangle([l0 * sc, row0 * sc - 6, r0 * sc, row0 * sc + 6],
                outline=(80, 230, 120), width=3)                                    # 头宽（最宽行）
    cx = (l0 + r0 + 1) / 2 * sc
    d.line([(cx, 0), (cx, v.height)], fill=(255, 210, 0), width=2)                 # 头中心
    v.save(out, quality=92)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('photos', nargs='+')
    ap.add_argument('--out', default='actors')
    ap.add_argument('--target-width-mm', type=float, default=190.0)
    a = ap.parse_args()
    outdir = Path(a.out); outdir.mkdir(parents=True, exist_ok=True)

    print(f'{"照片":<16}{"尺寸":<14}{"发顶":<9}{"头中心":<9}{"头宽":<9}{"dpi":<7}{"分歧":<9}判定')
    print('─' * 88)
    bad = 0
    for ph in a.photos:
        res, issues = measure(ph, a.target_width_mm)
        if res is None:
            print(f'{Path(ph).stem:<16}{"—":<14}{"—":<9}{"—":<9}{"—":<9}{"—":<7}{"—":<9}REJECT')
            for i in issues: print(f'    ✗ {i}')
            bad += 1; continue
        data, im, top, l0, r0, row0 = res
        j = outdir / f'{data["id"]}.json'
        j.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        chk = outdir / f'{data["id"]}_check.jpg'
        check_image(im, top, l0, r0, row0, chk)
        mark = data['verdict']
        print(f'{data["id"]:<16}{data["px"][0]}x{data["px"][1]:<8}'
              f'{data["headTopRatio"]:<9.4f}{data["headCenterXRatio"]:<9.4f}'
              f'{data["headWidthRatio"]:<9.4f}{data["dpi_at_target"]:<7.0f}'
              f'{data["center_spread"]:<9.4f}{mark}')
        for i in data['fatal']:
            print(f'    ✗ {i}')
        for i in data['issues']:
            if i not in data['fatal']:
                print(f'    ⚠ {i}')
        if data['fatal']: bad += 1
    print('─' * 88)
    print(f'{len(a.photos) - bad}/{len(a.photos)} 合格   json 与核对图已写入 {outdir}/')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
