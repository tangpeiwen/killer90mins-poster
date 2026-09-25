#!/usr/bin/env python3
"""
把一张剪影 PNG 摆进母版的「神秘嘉宾」格，生成新母版。

为什么需要它：设计师 2026-09-05 期重画了剪影，但 tools/extract_silhouette.py 走不通
（跨文档 duplicate() 在这个体量上会挂死 Illustrator，见该文件抬头）。设计师把新剪影
导成了 PNG，于是改走「放图」这条路 —— 结构上等价：剪影组里原本是
    剪影(clipped group)
    ├─ PathItem clipping=true   ← 黑板裁切板，不动
    └─ GroupItem 图形本体        ← 换成这张 PNG（嵌入）
换完仍被同一块裁切板裁，SECRET GUEST 名牌一个像素不动。

摆位不是拍的：目标框来自 config/slots.json 每格的 silhouette_art_gb_pt，
ACTOR_04 那组数直接读自设计师终稿，ACTOR_05 由它按当初 05→04 的平移量取逆得到。
PNG 的**不透明包围盒**（alpha>=128）对齐到这个框，等比缩放、按宽度定标。

算术全部在 Python 侧，生成的 JSX 只做赋值。母版只读，结果另存。

用法:
    python3 tools/set_silhouette_png.py \
        --png assets/secret_guest_silhouette.png \
        --slots ACTOR_04 ACTOR_05 \
        --master killer90mins_20260905/killer90mins_master_slot4secret.ai \
        --out killer90mins_20260912/killer90mins_master_v2.ai
"""
import sys, json, argparse, subprocess, tempfile, os
from pathlib import Path
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
PT = 25.4 / 72
ALPHA = 128
AS_TIMEOUT = 1800


def esc(s):
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


def alpha_bbox(png):
    A = np.array(Image.open(png).split()[-1])
    H, W = A.shape
    m = A >= ALPHA
    ys, xs = np.nonzero(m)
    if not len(xs):
        sys.exit(f'{png}: alpha 通道里找不到主体')
    return W, H, int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def place(png, target):
    """把 PNG 的不透明包围盒对齐到 target=[l,t,r,b]（pt），返回 PlacedItem 的四个赋值。"""
    W, H, bx0, by0, bx1, by1 = alpha_bbox(png)
    tl, tt, tr, tb = target
    tw, th = tr - tl, tt - tb
    bw, bh = bx1 - bx0, by1 - by0
    s = tw / bw                       # 按宽度定标，等比
    return dict(left=tl - bx0 * s, top=tt + by0 * s, w=W * s, h=H * s,
                img_px=(W, H), bbox_px=(bx0, by0, bx1, by1), scale=s,
                fit_h_err_pt=bh * s - th)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--png', required=True)
    ap.add_argument('--slots', nargs='+', required=True)
    ap.add_argument('--master', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--jsx', default='tools/_set_silhouette_png.jsx')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()

    cfg = json.loads((ROOT / 'config/slots.json').read_text(encoding='utf-8'))
    png = (ROOT / a.png).resolve()
    mst = (ROOT / a.master).resolve()
    out = (ROOT / a.out).resolve()
    for p, tag in ((png, 'PNG'), (mst, '母版')):
        if not p.exists():
            sys.exit(f'{tag} 不存在: {p}')
    if out == mst:
        sys.exit('拒绝写回母版：--out 必须是另一个文件')
    out.parent.mkdir(parents=True, exist_ok=True)
    status = out.with_name(out.stem + '_setsil_status.txt')

    jobs = []
    print(f'PNG   {a.png}')
    print(f'母版  {a.master}   （只读）')
    print(f'新版  {a.out}\n')
    print(f'{"slot":<10}{"目标框 [l,t,r,b] pt":<44}{"放图 left,top,w,h pt":<44}{"高度残差"}')
    print('─' * 118)
    for slot in a.slots:
        if slot not in cfg['slots']:
            sys.exit(f'config 里没有 {slot}')
        tgt = cfg['slots'][slot].get('silhouette_art_gb_pt')
        if tgt is None:
            sys.exit(f'{slot} 没有 silhouette_art_gb_pt，先在 config/slots.json 里定义')
        g = place(png, tgt)
        g['slot'] = slot
        jobs.append(g)
        print(f'{slot:<10}[{tgt[0]:.2f},{tgt[1]:.2f},{tgt[2]:.2f},{tgt[3]:.2f}]'.ljust(54)
              + f'{g["left"]:.3f},{g["top"]:.3f},{g["w"]:.3f},{g["h"]:.3f}'.ljust(44)
              + f'{g["fit_h_err_pt"]:+.3f}pt ({g["fit_h_err_pt"]*PT:+.3f}mm)')
    print('─' * 118)
    print(f'PNG {jobs[0]["img_px"][0]}x{jobs[0]["img_px"][1]}px  '
          f'不透明包围盒 {jobs[0]["bbox_px"]}  缩放 {jobs[0]["scale"]:.6f} pt/px\n')

    SIL, SGM = '剪影', 'SECRET_GUEST_MODE'
    L = []
    A = L.append
    A('#target illustrator')
    A('// 由 tools/set_silhouette_png.py 生成，勿手改。算术已在 Python 侧算完，这里只赋值。')
    A('(function(){')
    A(' var status=new File(%s);' % esc(str(status)))
    A(' function fin(m){try{status.encoding="UTF-8";status.open("w");status.write(m);status.close();}catch(e){}}')
    A(' var d=null, prevUI=null, log=[];')
    A(' function bb(b){return "["+b[0].toFixed(2)+","+b[1].toFixed(2)+","+b[2].toFixed(2)+","+b[3].toFixed(2)+"]";}')
    A(' var J=[')
    for g in jobs:
        A('  {S:%s,left:%.4f,top:%.4f,w:%.4f,h:%.4f},'
          % (esc(g['slot']), g['left'], g['top'], g['w'], g['h']))
    A(' ];')
    A(' try{')
    A('  try{ prevUI=app.userInteractionLevel;'
      ' app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS; }catch(e0){}')
    A('  d=app.open(new File(%s));' % esc(str(mst)))
    A('  d.saveAs(new File(%s), new IllustratorSaveOptions());' % esc(str(out)))
    A('  for(var i=0;i<J.length;i++){ var q=J[i];')
    A('   var Ly=d.layers.getByName(q.S);')
    A('   var wasLocked=Ly.locked; Ly.locked=false;')
    A('   var sgm=Ly.groupItems.getByName(%s);' % esc(SGM))
    A('   var wasHidden=sgm.hidden; sgm.hidden=false;')
    A('   var sil=sgm.groupItems.getByName(%s);' % esc(SIL))
    A('   var clip=null, olds=[];')
    A('   for(var k=0;k<sil.pageItems.length;k++){')
    A('    var it=sil.pageItems[k];')
    A('    if(it.typename==="PathItem" && it.clipping){ clip=it; } else { olds[olds.length]=it; }')
    A('   }')
    A('   if(!clip) throw new Error(q.S+" \\u526a\\u5f71\\u91cc\\u6ca1\\u6709\\u88c1\\u5207\\u8def\\u5f84");')
    A('   var clipGb=clip.geometricBounds;')
    A('   var oldGb=olds.length?olds[0].geometricBounds:null;')
    A('   var p=sil.placedItems.add();')
    A('   p.file=new File(%s);' % esc(str(png)))
    A('   p.move(sil, ElementPlacement.PLACEATEND);')
    A('   p.width=q.w; p.height=q.h; p.left=q.left; p.top=q.top;')
    A('   var gotGb=p.geometricBounds;')
    A('   p.embed();')
    A('   for(var m=olds.length-1;m>=0;m--){ olds[m].remove(); }')
    A('   var art=null;')
    A('   for(var n=0;n<sil.pageItems.length;n++){ var it2=sil.pageItems[n];')
    A('    if(!(it2.typename==="PathItem" && it2.clipping)) art=it2; }')
    A('   log.push(q.S+" clip_gb="+bb(clipGb)')
    A('    +" old_art_gb="+(oldGb?bb(oldGb):"NONE")')
    A('    +" placed_gb="+bb(gotGb)')
    A('    +" after_embed="+(art?art.typename+" gb="+bb(art.geometricBounds):"NONE")')
    A('    +" sil_children="+sil.pageItems.length+" sil_clipped="+sil.clipped);')
    A('   sgm.hidden=wasHidden; Ly.locked=wasLocked;')
    A('   log.push(q.S+" restored sgm_hidden="+sgm.hidden+" layer_locked="+Ly.locked);')
    A('  }')
    A('  d.save();')
    A('  fin("OK\\n"+log.join("\\n")+"\\n");')
    A('  d.close(SaveOptions.SAVECHANGES);')
    A(' }catch(err){ fin("ERR "+err.message+"\\n"+log.join("\\n")+"\\n");')
    A('   try{ if(d) d.close(SaveOptions.DONOTSAVECHANGES); }catch(e){} }')
    A(' try{ if(prevUI!==null) app.userInteractionLevel=prevUI; }catch(e3){}')
    A('})();')

    jsx = ROOT / a.jsx
    jsx.write_text('\n'.join(L) + '\n', encoding='utf-8')
    print(f'JSX 已生成: {a.jsx}')
    if a.dry_run:
        return

    if status.exists():
        status.unlink()
    js = '$.evalFile(new File(%s));' % esc(str(jsx))
    aps = js.replace('\\', '\\\\').replace('"', '\\"')
    script = ('with timeout of %d seconds\n tell application "Adobe Illustrator"\n'
              '  activate\n  do javascript "%s"\n end tell\nend timeout\n') % (AS_TIMEOUT, aps)
    with tempfile.NamedTemporaryFile('w', suffix='.applescript', delete=False,
                                     encoding='utf-8') as f:
        f.write(script)
        tmp = f.name
    try:
        r = subprocess.run(['osascript', tmp], capture_output=True, text=True)
    finally:
        os.unlink(tmp)
    if r.returncode != 0:
        sys.exit('驱动失败：' + (r.stderr or '').strip())
    if not status.exists():
        sys.exit('没有写出状态文件，脚本可能在前置检查处退出了')
    st = status.read_text(encoding='utf-8')
    print(st)
    if not st.startswith('OK'):
        sys.exit(1)


if __name__ == '__main__':
    main()
