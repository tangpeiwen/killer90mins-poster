#!/usr/bin/env python3
"""
L3 摆放 —— 分两阶段，每阶段生成一个「只做赋值」的 JSX。

  stage1  换文本/字体/颜色、换照片链接、切第五格状态、改日期；然后【测量】名牌墨迹与
          人像实际边界，写出 txt。不做任何定位。
  stage2  读 stage1 的测量结果，在 Python 侧算出全部目标坐标，生成第二个 JSX 施加。

分两阶段的原因：换了名字之后名牌的墨迹边界才能知道（字数不同宽度不同，中文字体度量
完全不同），而人像位置由名牌下边决定。与其在 ExtendScript 里做几何运算，不如让它只
负责「测量」和「赋值」两件蠢事。

用法:
    python3 tools/build_poster.py stage1 briefs/2026-08-29.json
    python3 tools/build_poster.py stage2 briefs/2026-08-29.json
"""
import sys, json, math, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PT = 25.4 / 72
MM = 72 / 25.4


def esc(s):
    """把非 ASCII 转成 \\uXXXX，彻底绕开 ExtendScript 的编码问题"""
    out = []
    for ch in str(s):
        o = ord(ch)
        if ch == '\\':
            out.append('\\\\')
        elif ch == '"':
            out.append('\\"')
        elif 32 <= o < 127:
            out.append(ch)
        else:
            out.append('\\u%04X' % o)
    return '"' + ''.join(out) + '"'


def load(brief_path):
    brief = json.loads(Path(brief_path).read_text(encoding='utf-8'))
    cfg = json.loads((ROOT / 'config/slots.json').read_text(encoding='utf-8'))
    return brief, cfg


# ────────────────────────────── STAGE 1 ──────────────────────────────
def stage1(brief, cfg, out_jsx, silent=False):
    master = ROOT / cfg['_source']
    outdir = ROOT / 'killer90mins_20260829'
    stem = 'killer90mins_auto_' + brief['date'].replace('-', '')
    L = []
    A = L.append
    A('#target illustrator')
    A('// STAGE 1 — 换内容 + 测量。不做任何定位。由 tools/build_poster.py 生成，勿手改。')
    A('(function(){')
    if silent:
        A(' var d=app.open(new File(%s));' % esc(str(master)))
    else:
        A(' if(app.documents.length===0){alert("\\u8bf7\\u5148\\u6253\\u5f00 %s");return;}' % master.name)
        A(' var d=app.activeDocument;')
        A(' if(d.name!==%s){alert("\\u8bf7\\u6253\\u5f00 %s\\uff0c\\u5f53\\u524d\\u662f "+d.name);return;}'
          % (esc(master.name), master.name))
    A(' var st=new File(%s); st.encoding="UTF-8";' % esc(str(outdir / (stem + '_s1_status.txt'))))
    A(' function fin(m){try{st.open("w");st.writeln(m);st.close();}catch(e){}}')
    A(' var out=new File(%s), rep=new File(%s);' %
      (esc(str(outdir / (stem + '_s1.ai'))), esc(str(outdir / (stem + '_s1_measure.txt')))))
    A(' var WHITE=new RGBColor(); WHITE.red=255; WHITE.green=255; WHITE.blue=255;')
    A(' function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}'
      'try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}')
    A(' function bb(b){return "["+b[0].toFixed(4)+","+b[1].toFixed(4)+","+b[2].toFixed(4)+","+b[3].toFixed(4)+"]";}')
    A(' var tmp=[];')
    A(' function ink(tf){var g=tf.duplicate(d,ElementPlacement.PLACEATEND);tmp[tmp.length]=g;'
      'try{var o=g.createOutline();tmp[tmp.length]=o;return o.geometricBounds;}catch(e){return null;}}')
    A(' try{')
    A('  d.saveAs(out,new IllustratorSaveOptions());')
    A('  rep.encoding="UTF-8"; rep.open("w");')
    A('  rep.writeln("stage=1 doc="+d.name);')

    for slot, s in brief['slots'].items():
        if s['mode'] == 'SECRET_GUEST':
            A('  // ---- %s : 切换到神秘嘉宾剪影 ----' % slot)
            A('  var L5=d.layers.getByName(%s);' % esc(slot))
            A('  L5.layers.getByName("PHOTO_MODE").visible=false;')
            A('  L5.groupItems.getByName("SECRET_GUEST_MODE").hidden=false;')
            A('  rep.writeln("%s mode=SECRET_GUEST photo_mode_visible=false silhouette_hidden=false");' % slot)
            continue
        grp = cfg['slots'][slot]['photo_group']
        A('  // ---- %s ----' % slot)
        A('  var Lx=d.layers.getByName(%s);' % esc(slot))
        A('  var tf=Lx.textFrames.getByName("NAME");')
        A('  tf.contents=%s;' % esc(s['name']))
        A('  tf.textRange.characterAttributes.textFont=app.textFonts.getByName(%s);' % esc(s['name_font']))
        A('  tf.textRange.characterAttributes.size=%s;' % s['name_size'])
        if s.get('name_fill') == 'white':
            A('  tf.textRange.characterAttributes.fillColor=WHITE;')
        A('  var p=pl(Lx.groupItems.getByName(%s));' % esc(grp))
        A('  if(!p) throw new Error(%s+" \\u627e\\u4e0d\\u5230\\u4eba\\u50cf");' % esc(slot))
        A('  p.file=new File(%s);' % esc(str(ROOT / s['photo'])))
        A('  var ig=ink(tf);')
        A('  rep.writeln("%s name="+tf.contents+" font="+tf.textRange.characterAttributes.textFont.name'
          '+" size="+tf.textRange.characterAttributes.size'
          '+" text_gb="+bb(tf.geometricBounds)+" ink_gb="+(ig?bb(ig):"FAIL")'
          '+" photo_gb="+bb(p.geometricBounds));' % slot)

    A('  // ---- 日期 ----')
    A('  var DT=d.layers.getByName("\\u65e5\\u671f/\\u65f6\\u95f4/\\u4e3b\\u6301\\u4eba\\u6807\\u7b7e");')
    for nm, val in (('MONTH', brief['month']), ('DAY', brief['day']),
                    ('WEEKDAY', brief['weekday']), ('EVENT TIME', brief['time'])):
        A('  var t_%s=DT.textFrames.getByName(%s); t_%s.contents=%s;'
          % (nm.replace(' ', '_'), esc(nm), nm.replace(' ', '_'), esc(val)))
        A('  var i_%s=ink(t_%s);' % (nm.replace(' ', '_'), nm.replace(' ', '_')))
        A('  rep.writeln("DATE %s value="+t_%s.contents+" text_gb="+bb(t_%s.geometricBounds)'
          '+" ink_gb="+(i_%s?bb(i_%s):"FAIL"));'
          % (nm, nm.replace(' ', '_'), nm.replace(' ', '_'), nm.replace(' ', '_'), nm.replace(' ', '_')))

    A('  for(var k=tmp.length-1;k>=0;k--){try{tmp[k].remove();}catch(e){}}')
    A('  rep.writeln("tmp_removed="+tmp.length);')
    A('  rep.close(); d.save(); fin("OK");')
    if not silent:
        A('  alert("STAGE 1 \\u5b8c\\u6210\\n\\n"+out.fsName+"\\n"+rep.fsName+"\\n\\n\\u63a5\\u4e0b\\u6765\\u8dd1 stage2\\u3002");')
    A(' }catch(err){ for(var k2=tmp.length-1;k2>=0;k2--){try{tmp[k2].remove();}catch(e){}}'
      ' try{rep.close();}catch(e3){} fin("ERR "+err.message);')
    if not silent:
        A('   alert("STAGE 1 \\u505c\\u6b62: "+err.message);')
    A(' }')
    A('}());')
    Path(out_jsx).write_text('\n'.join(L), encoding='utf-8')
    return out_jsx, outdir / (stem + '_s1.ai'), outdir / (stem + '_s1_measure.txt')


# ────────────────────────────── STAGE 2 ──────────────────────────────
import re
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None


def parse_measure(path):
    """把 stage1 的 txt 解析成 {slot: {ink_gb, photo_gb, ...}}"""
    txt = Path(path).read_text(encoding='utf-8')
    out = {}
    for mm_ in re.finditer(
            r'(ACTOR_\d\d) name=(.+?) font=(\S+) size=([\d.]+) '
            r'text_gb=\[([^\]]+)\] ink_gb=\[([^\]]+)\] photo_gb=\[([^\]]+)\]', txt):
        out[mm_.group(1)] = {
            'name': mm_.group(2), 'font': mm_.group(3), 'size': float(mm_.group(4)),
            'text_gb': [float(v) for v in mm_.group(5).split(',')],
            'ink_gb':  [float(v) for v in mm_.group(6).split(',')],
            'photo_gb': [float(v) for v in mm_.group(7).split(',')],
        }
    return out


def rot_rect(ink, th):
    """从旋转矩形的轴对齐外框还原真实边长 (w, h) 与中心"""
    l, t, r, b = ink
    W, H = r - l, t - b
    ca, sa = math.cos(th), math.sin(th)
    det = ca * ca - sa * sa
    return ((l + r) / 2, (t + b) / 2,
            (W * ca - H * sa) / det, (H * ca - W * sa) / det)


def head_profile(png, alpha=128):
    """返回每列的发顶行号（无主体的列为 -1）"""
    A = np.array(Image.open(png).split()[-1])
    H, W = A.shape
    m = A >= alpha
    rows = np.full(W, -1, dtype=np.int64)
    for c in range(W):
        idx = np.nonzero(m[:int(H * 0.45), c])[0]
        if len(idx):
            rows[c] = idx[0]
    return rows, W, H


def stage2(brief, cfg, measure_path, out_jsx, silent=False):
    meas = parse_measure(measure_path)
    outdir = ROOT / 'killer90mins_20260829'
    stem = 'killer90mins_auto_' + brief['date'].replace('-', '')
    src = outdir / (stem + '_s1.ai')
    G = cfg['rules']['gap_card_to_head_mm'] * MM
    BLEED = cfg['rules']['bottom_bleed_mm'] * MM

    moves, report = [], []
    for slot, s in brief['slots'].items():
        if s['mode'] != 'PHOTO':
            continue
        sl = cfg['slots'][slot]
        te = sl['top_edge']
        m, (x1, y1) = te['slope'], te['through']
        th = math.atan(m); ca, sa = math.cos(th), math.sin(th)
        n = math.hypot(m, 1)
        c = y1 - m * x1
        pcx = sl['center_x_pt']
        pan_bot = sl['bottom_pt']
        GP = sl.get('gap_panel_to_card_mm', cfg['rules']['gap_panel_to_card_mm']) * MM

        # ---- 名牌：ink 上边距黑板上沿 12mm（垂线），横向居中 ----
        cx0, cy0, cw, ch = rot_rect(meas[slot]['ink_gb'], th)
        Cx = pcx
        Cy = m * Cx + c - n * (GP + ch / 2)
        dx, dy = Cx - cx0, Cy - cy0
        c_bot = (Cy - (ch / 2) * ca) - m * (Cx + (ch / 2) * sa)   # 名牌下边所在直线

        # ---- 人像 ----
        am = json.loads((ROOT / s['metrics']).read_text(encoding='utf-8'))
        tgt = s.get('target_head_width_mm', brief.get('target_head_width_mm', 64.4))
        w_pt = tgt * MM / am['headWidthRatio']
        h_pt = w_pt / am['aspect']
        left = pcx - am['headCenterXRatio'] * w_pt

        rows, PW, PH = head_profile(ROOT / s['photo'])
        sx, sy = w_pt / PW, h_pt / PH
        # 只看名牌下边覆盖的 x 区间
        xa, xb = Cx - cw / 2 * ca, Cx + cw / 2 * ca
        ca0, cb0 = int((xa - left) / sx), int((xb - left) / sx)
        K = None
        for col in range(max(0, ca0), min(PW, cb0 + 1)):
            if rows[col] < 0:
                continue
            xd = left + (col + 0.5) * sx
            v = m * xd + rows[col] * sy
            if K is None or v < K:
                K = v
        if K is None:
            raise SystemExit(f'{slot}: 名牌下方没有人像轮廓，无法定位')
        top = K + c_bot - n * G

        scale = 1.0
        head_y = top - am['headTopRatio'] * h_pt
        if top - h_pt > pan_bot - BLEED:
            scale = (head_y - (pan_bot - BLEED)) / ((1 - am['headTopRatio']) * h_pt)
            w_pt, h_pt = w_pt * scale, h_pt * scale
            top = head_y + am['headTopRatio'] * h_pt
            left = pcx - am['headCenterXRatio'] * w_pt

        # 名牌改为绝对坐标：stage1 测得的 text_gb 加上位移即目标位置。
        # 相对位移(translate)跑两次会叠加，绝对赋值跑几次结果都一样。
        tgb = meas[slot]['text_gb']
        moves.append(dict(slot=slot, cardL=tgb[0] + dx, cardT=tgb[1] + dy,
                          left=left, top=top, w=w_pt, h=h_pt,
                          group=sl['photo_group'], dx=dx, dy=dy))
        report.append((slot, s['name'], GP * PT, dx * PT, dy * PT, tgt, scale,
                       (top - h_pt - pan_bot) * PT, w_pt * PT, h_pt * PT))

    # ---------- 生成 JSX ----------
    L = []; A = L.append
    A('#target illustrator')
    A('// STAGE 2 - apply positions. All arithmetic precomputed in Python.')
    A('(function(){')
    if silent:
        A(' var d=app.open(new File(%s));' % esc(str(src)))
    else:
        A(' if(app.documents.length===0){alert("open %s first");return;}' % src.name)
        A(' var d=app.activeDocument;')
        A(' if(d.name!==%s){alert("please open %s, current is "+d.name);return;}' % (esc(src.name), src.name))
    A(' var st=new File(%s); st.encoding="UTF-8";' % esc(str(outdir / (stem + '_s2_status.txt'))))
    A(' function fin(m){try{st.open("w");st.writeln(m);st.close();}catch(e){}}')
    A(' var out=new File(%s), png=new File(%s), log=new File(%s);' % (
        esc(str(outdir / (stem + '.ai'))), esc(str(outdir / (stem + '.png'))),
        esc(str(outdir / (stem + '_s2_log.txt')))))
    A(' function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}'
      'try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}')
    A(' var M=[')
    for mv in moves:
        A('  {S:%s,G:%s,cardL:%.5f,cardT:%.5f,left:%.5f,top:%.5f,w:%.5f,h:%.5f},' % (
            esc(mv['slot']), esc(mv['group']), mv['cardL'], mv['cardT'],
            mv['left'], mv['top'], mv['w'], mv['h']))
    A(' ];')
    A(' try{')
    A('  d.saveAs(out,new IllustratorSaveOptions());')
    A('  log.encoding="UTF-8"; log.open("w");')
    A('  for(var i=0;i<M.length;i++){var q=M[i];')
    A('   var Lx=d.layers.getByName(q.S);')
    A('   var tf=Lx.textFrames.getByName("NAME"); tf.left=q.cardL; tf.top=q.cardT;')
    A('   var p=pl(Lx.groupItems.getByName(q.G)); if(!p) throw new Error(q.S+" no portrait");')
    A('   p.width=q.w; p.height=q.h; p.left=q.left; p.top=q.top;')
    A('   log.writeln(q.S+" card="+q.cardL+","+q.cardT+" photo="+q.left+","+q.top+","+q.w+","+q.h);')
    A('  }')
    A('  log.close(); d.save();')
    A('  var e=new ExportOptionsPNG24(); e.antiAliasing=true; e.transparency=false;')
    A('  e.artBoardClipping=true; e.horizontalScale=200; e.verticalScale=200;')
    A('  d.exportFile(png,ExportType.PNG24,e);')
    A('  fin("OK");')
    if not silent:
        A('  alert("STAGE 2 done\\n\\n"+out.fsName+"\\n"+png.fsName);')
    A(' }catch(err){ try{log.close();}catch(e2){} fin("ERR "+err.message);')
    if not silent:
        A('   alert("STAGE 2 stopped: "+err.message);')
    A(' }')
    A('}());')
    Path(out_jsx).write_text('\n'.join(L), encoding='utf-8')
    return out_jsx, report, outdir / (stem + '.ai'), outdir / (stem + '.png')


# ────────────────────────────── 驱动 Illustrator ──────────────────────────────
import subprocess, tempfile, os

AS_TIMEOUT = 1800   # AppleScript 默认只有 120 秒，存 64MB 的 .ai 加导 PNG 远不止


def drive(jsx_path, status_path, label, preamble=''):
    """让 Illustrator 执行一个 JSX，然后读它写下的状态文件。"""
    if status_path.exists():
        status_path.unlink()          # 先清掉，避免读到上一轮的结果

    js = preamble + '$.evalFile(new File(%s));' % esc(str(jsx_path))
    aps = js.replace('\\', '\\\\').replace('"', '\\"')
    script = ('with timeout of %d seconds\n'
              ' tell application "Adobe Illustrator"\n'
              '  activate\n'
              '  do javascript "%s"\n'
              ' end tell\n'
              'end timeout\n') % (AS_TIMEOUT, aps)

    with tempfile.NamedTemporaryFile('w', suffix='.applescript',
                                     delete=False, encoding='utf-8') as f:
        f.write(script)
        tmp = f.name
    try:
        r = subprocess.run(['osascript', tmp], capture_output=True, text=True)
    finally:
        os.unlink(tmp)

    if r.returncode != 0:
        raise SystemExit('%s 驱动失败：%s' % (label, (r.stderr or '').strip()))
    if not status_path.exists():
        raise SystemExit('%s 没有写出状态文件，脚本可能在前置检查处退出了' % label)

    st = status_path.read_text(encoding='utf-8').strip()
    if not st.startswith('OK'):
        raise SystemExit('%s 报错：%s' % (label, st))
    return st


def illustrator_ready():
    r = subprocess.run(
        ['osascript', '-e',
         'tell application "Adobe Illustrator" to do javascript "app.version"'],
        capture_output=True, text=True)
    return r.returncode == 0, (r.stdout or r.stderr).strip()




def run_all(brief_path, brief, cfg, verify=True):
    """一条命令跑完 stage1 → stage2（→ L4），中途不需要人介入。"""
    ok, msg = illustrator_ready()
    if not ok:
        raise SystemExit('连不上 Illustrator：%s' % msg)
    print('Illustrator %s' % msg)

    stem = 'killer90mins_auto_' + brief['date'].replace('-', '')
    outdir = ROOT / 'killer90mins_20260829'
    tag = brief['date'].replace('-', '')

    # ---- stage 1 ----
    print('\n[1/3] stage1 换内容并测量…')
    j1 = ROOT / 'tools' / ('_stage1_%s.jsx' % tag)
    j1, ai1, txt = stage1(brief, cfg, j1, silent=True)
    drive(j1, outdir / (stem + '_s1_status.txt'), 'stage1')
    print('      %s' % ai1.name)
    print('      %s' % txt.name)

    # ---- stage 2 ----
    print('\n[2/3] stage2 计算并施加坐标…')
    j2 = ROOT / 'tools' / ('_stage2_%s.jsx' % tag)
    j2, rep, ai2, png = stage2(brief, cfg, txt, j2, silent=True)
    for slot, nm, gp, dx, dy, tgt, sc, bl, w, h in rep:
        print('      %-10s%-9sR0=%.2fmm  名牌 %+.2f,%+.2f  头宽 %.1fmm' %
              (slot, nm, gp, dx, dy, tgt))
    drive(j2, outdir / (stem + '_s2_status.txt'), 'stage2')
    print('      %s' % ai2.name)
    print('      %s' % png.name)

    # ---- L4 ----
    if not verify:
        print('\n[3/3] 已跳过验收（--no-verify）')
        return
    print('\n[3/3] L4 验收…')
    audit = ROOT / 'tools' / '_audit_output.jsx'
    ast_path = outdir / (stem + '_audit_status.txt')
    pre = ('var AUTO_TARGET=%s; var AUTO_STATUS=%s; '
           % (esc(str(outdir / (stem + '.ai'))), esc(str(ast_path))))
    drive(audit, ast_path, 'L4-audit', preamble=pre)
    print('      %s' % (stem + '_L4.txt'))
    r = subprocess.run([sys.executable, str(ROOT / 'tools' / 'verify_poster.py'),
                        str(brief_path)], capture_output=True, text=True)
    print(r.stdout.rstrip() or r.stderr.rstrip())
    if r.returncode != 0:
        raise SystemExit('验收未通过 —— 按纪律：改 config/slots.json 或 actors/<id>.json '
                         '里的一个数字，然后整条重跑，不要打补丁。')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('stage', choices=['stage1', 'stage2', 'run'])
    ap.add_argument('brief')
    ap.add_argument('--no-verify', action='store_true', help='run 模式下跳过 L4 验收')
    a = ap.parse_args()
    brief, cfg = load(a.brief)

    if a.stage == 'run':
        return run_all(a.brief, brief, cfg, verify=not a.no_verify)

    if a.stage == 'stage1':
        jsx = ROOT / 'tools' / ('_stage1_' + brief['date'].replace('-', '') + '.jsx')
        j, ai, txt = stage1(brief, cfg, jsx)
        print(f'已生成  {j}')
        print(f'  母版   {ROOT / cfg["_source"]}')
        print(f'  将输出 {ai}')
        print(f'         {txt}')
    else:
        stem = 'killer90mins_auto_' + brief['date'].replace('-', '')
        mp = ROOT / 'killer90mins_20260829' / (stem + '_s1_measure.txt')
        jsx = ROOT / 'tools' / ('_stage2_' + brief['date'].replace('-', '') + '.jsx')
        j, rep, ai, png = stage2(brief, cfg, mp, jsx)
        print(f'已生成  {j}\n')
        print(f'{"slot":<10}{"演员":<9}{"R0 目标":<10}{"名牌 dx,dy(mm)":<18}{"目标头宽":<10}'
              f'{"缩放":<10}{"底部出血":<10}{"人像尺寸 mm"}')
        print('─' * 102)
        for slot, nm, gp, dx, dy, tgt, sc, bl, w, h in rep:
            print(f'{slot:<10}{nm:<9}{gp:<10.2f}{dx:+7.2f},{dy:+7.2f}   {tgt:<10.1f}'
                  f'{sc:<10.5f}{-bl:<10.1f}{w:.0f} x {h:.0f}')
        print(f'\n  输入 {mp.name}\n  将输出 {ai.name} / {png.name}')


if __name__ == '__main__':
    main()
