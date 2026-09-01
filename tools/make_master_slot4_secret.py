#!/usr/bin/env python3
"""
造一个新母版：让 ACTOR_04 也具备「神秘嘉宾剪影」能力。

原母版里只有 ACTOR_05 有 PHOTO_MODE 子图层与 SECRET_GUEST_MODE 组，第 4 格没有，
管线的 SECRET_GUEST 分支在第 4 格上会直接抛错。本脚本把第 5 格的剪影搬到第 4 格：

  1. 从源文件 saveAs 一个新文件（源文件只读，全程不动）
  2. ACTOR_04 的 NAME 与 PHOTO 收进新建的 PHOTO_MODE 子图层
  3. 复制 ACTOR_05 的 SECRET_GUEST_MODE 到 ACTOR_04，整体平移
  4. 把复制品里的裁切路径锚点改成 slot4 的 clip_pt（换板子，纠正错切）
  5. 默认隐藏剪影、显示 PHOTO_MODE —— 与 ACTOR_05 在母版里的初始状态一致

平移量由两格黑板的左下角推出。两块板全等（294.5pt 宽、742.55pt 高的平行四边形），
只是错切不同，所以「平移 + 换裁切路径」即可，剪影本体保持竖直 —— 与照片同理。

用法:
    python3 tools/make_master_slot4_secret.py \
        killer90mins_20260829/killer90mins_auto_20260829.ai \
        killer90mins_20260905/killer90mins_master_slot4secret.ai
"""
import sys, json, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PT = 25.4 / 72


def esc(s):
    """非 ASCII 转 \\uXXXX，绕开 ExtendScript 编码问题"""
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


def corners(clip_pt):
    """把 config 里的 4 个 clip 点整理成 TL,BL,BR,TR，与模板中裁切路径的锚点顺序一致"""
    xs = sorted({p[0] for p in clip_pt})
    left_x, right_x = xs[0], xs[-1]
    left = sorted([p for p in clip_pt if p[0] == left_x], key=lambda p: p[1])
    right = sorted([p for p in clip_pt if p[0] == right_x], key=lambda p: p[1])
    bl, tl = left[0], left[1]      # y 更小的是下
    br, tr = right[0], right[1]
    return [tl, bl, br, tr]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source', help='源 .ai（只读）')
    ap.add_argument('dest', help='新母版 .ai 的输出路径')
    ap.add_argument('--jsx', default='tools/_make_master_slot4.jsx')
    a = ap.parse_args()

    cfg = json.loads((ROOT / 'config/slots.json').read_text(encoding='utf-8'))
    s4, s5 = cfg['slots']['ACTOR_04'], cfg['slots']['ACTOR_05']

    # 平移量：左下角对左下角。两板全等，故等价于中心对中心 + 底对底。
    c4, c5 = corners(s4['clip_pt']), corners(s5['clip_pt'])
    dx = c4[1][0] - c5[1][0]
    dy = c4[1][1] - c5[1][1]

    src = (ROOT / a.source).resolve()
    dst = (ROOT / a.dest).resolve()
    if not src.exists():
        sys.exit(f'源文件不存在: {src}')
    dst.parent.mkdir(parents=True, exist_ok=True)

    print(f'源  : {src.relative_to(ROOT)}   （只读）')
    print(f'新  : {dst.relative_to(ROOT)}')
    print(f'平移: dx={dx:+.3f}pt ({dx*PT:+.2f}mm)  dy={dy:+.3f}pt ({dy*PT:+.2f}mm)')
    print(f'换板: slot5 上沿 {s5["top_edge"]["deg"]}° → slot4 {s4["top_edge"]["deg"]}°')
    print('新裁切锚点 TL,BL,BR,TR:')
    for p in c4:
        print(f'    [{p[0]:.2f}, {p[1]:.2f}]')

    L = []
    A = L.append
    A('#target illustrator')
    A('// 由 tools/make_master_slot4_secret.py 生成，勿手改。')
    A('// 把 ACTOR_05 的神秘嘉宾剪影搬一份到 ACTOR_04，并换成 slot4 的裁切板。')
    A('(function(){')
    A(' var status=new File(%s);' % esc(str(dst.with_suffix('')) + '_make_status.txt'))
    A(' function fin(m){try{status.encoding="UTF-8";status.open("w");status.writeln(m);status.close();}catch(e){}}')
    A(' var d=app.open(new File(%s));' % esc(str(src)))
    A(' try{')
    # 立刻另存，之后所有操作都在副本上
    A('  d.saveAs(new File(%s), new IllustratorSaveOptions());' % esc(str(dst)))
    A('  var L4=d.layers.getByName("ACTOR_04");')
    A('  var L5=d.layers.getByName("ACTOR_05");')
    # --- 1. ACTOR_04 建 PHOTO_MODE 子图层，把 NAME 与 PHOTO 收进去 ---
    A('  var already=false;')
    A('  try{ L4.layers.getByName("PHOTO_MODE"); already=true; }catch(e){}')
    A('  if(already) throw new Error("ACTOR_04 \\u5df2\\u6709 PHOTO_MODE\\uff0c\\u672c\\u811a\\u672c\\u53ea\\u80fd\\u8dd1\\u4e00\\u6b21");')
    A('  var pm=L4.layers.add(); pm.name="PHOTO_MODE";')
    A('  var nameTf=L4.textFrames.getByName("NAME");')
    A('  var photoG=null;')
    A('  try{ photoG=L4.groupItems.getByName("PHOTO"); }catch(e){ photoG=L4.groupItems.getByName("PHTOTO"); }')
    A('  nameTf.move(pm, ElementPlacement.PLACEATEND);')
    A('  photoG.move(pm, ElementPlacement.PLACEATEND);')
    # --- 2. 复制剪影组过来并平移 ---
    A('  var sgm5=L5.groupItems.getByName("SECRET_GUEST_MODE");')
    A('  var dup=sgm5.duplicate(L4, ElementPlacement.PLACEATBEGINNING);')
    A('  dup.name="SECRET_GUEST_MODE";')
    A('  dup.translate(%.4f, %.4f);' % (dx, dy))
    # --- 3. 换裁切路径锚点为 slot4 的板 ---
    A('  var sil=dup.groupItems.getByName(%s);' % esc('剪影'))
    A('  var clip=null;')
    A('  for(var i=0;i<sil.pathItems.length;i++){ if(sil.pathItems[i].clipping){ clip=sil.pathItems[i]; break; } }')
    A('  if(!clip) throw new Error("\\u627e\\u4e0d\\u5230\\u526a\\u5f71\\u91cc\\u7684\\u88c1\\u5207\\u8def\\u5f84");')
    A('  if(clip.pathPoints.length!==4) throw new Error("\\u88c1\\u5207\\u8def\\u5f84\\u4e0d\\u662f4\\u70b9\\uff0c\\u5b9e\\u9645="+clip.pathPoints.length);')
    for i, p in enumerate(c4):
        A('  clip.pathPoints[%d].anchor=[%.4f,%.4f];' % (i, p[0], p[1]))
        A('  clip.pathPoints[%d].leftDirection=[%.4f,%.4f];' % (i, p[0], p[1]))
        A('  clip.pathPoints[%d].rightDirection=[%.4f,%.4f];' % (i, p[0], p[1]))
    # --- 4. 黑色背板 ---
    # 第 1-4 格的黑底来自照片自身（照片带黑背景，被裁切成板形），一旦隐藏 PHOTO_MODE 就没了。
    # 第 5 格有独立的「黑色背板」组，所以切剪影时黑底还在。不把它一并搬过来，第 4 格的剪影会
    # 浮在白纸上；更隐蔽的是 LaMachineCompany 的字形是「白色印章板 + 镂空字母」，压在白纸上
    # 会整个消失 —— 名牌看起来像没生成，实则是没有黑底。
    A('  var bd5=L5.groupItems.getByName(%s);' % esc('黑色背板'))
    A('  var bdup=bd5.duplicate(L4, ElementPlacement.PLACEATEND);')
    A('  bdup.name=%s;' % esc('黑色背板'))
    A('  bdup.translate(%.4f, %.4f);' % (dx, dy))
    A('  var bpath=null;')
    A('  for(var bi=0;bi<bdup.pathItems.length;bi++){ if(bdup.pathItems[bi].clipping){ bpath=bdup.pathItems[bi]; break; } }')
    A('  if(!bpath && bdup.pathItems.length===1) bpath=bdup.pathItems[0];')
    A('  if(!bpath) throw new Error("\\u9ed1\\u8272\\u80cc\\u677f\\u91cc\\u627e\\u4e0d\\u5230\\u8def\\u5f84");')
    A('  if(bpath.pathPoints.length!==4) throw new Error("\\u80cc\\u677f\\u8def\\u5f84\\u4e0d\\u662f4\\u70b9\\uff0c\\u5b9e\\u9645="+bpath.pathPoints.length);')
    for i, p in enumerate(c4):
        A('  bpath.pathPoints[%d].anchor=[%.4f,%.4f];' % (i, p[0], p[1]))
        A('  bpath.pathPoints[%d].leftDirection=[%.4f,%.4f];' % (i, p[0], p[1]))
        A('  bpath.pathPoints[%d].rightDirection=[%.4f,%.4f];' % (i, p[0], p[1]))

    # --- 5. 默认状态：显示照片、隐藏剪影 ---
    A('  dup.hidden=true;')
    A('  pm.visible=true;')
    # --- 5. 回读实际结果，写进 status，供独立验收 ---
    A('  function bb(b){return "["+b[0].toFixed(3)+","+b[1].toFixed(3)+","+b[2].toFixed(3)+","+b[3].toFixed(3)+"]";}')
    A('  var lines=[];')
    A('  lines.push("dest="+d.name);')
    A('  lines.push("ACTOR_04_sublayers="+L4.layers.length);')
    A('  lines.push("ACTOR_04_PHOTO_MODE_visible="+L4.layers.getByName("PHOTO_MODE").visible);')
    A('  lines.push("ACTOR_04_SGM_hidden="+L4.groupItems.getByName("SECRET_GUEST_MODE").hidden);')
    A('  lines.push("ACTOR_04_SGM_gb="+bb(dup.geometricBounds));')
    A('  var pts=[];for(var q=0;q<clip.pathPoints.length;q++){var an=clip.pathPoints[q].anchor;pts.push("["+an[0].toFixed(2)+","+an[1].toFixed(2)+"]");}')
    A('  lines.push("ACTOR_04_clip_anchors="+pts.join(" "));')
    A('  var t4=dup.textFrames[0];')
    A('  lines.push("ACTOR_04_SGM_name=\\""+String(t4.contents).replace(/[\\r\\n]/g,"\\\\n")+"\\" gb="+bb(t4.geometricBounds));')
    A('  var bpts=[];for(var bq=0;bq<bpath.pathPoints.length;bq++){var ban=bpath.pathPoints[bq].anchor;bpts.push("["+ban[0].toFixed(2)+","+ban[1].toFixed(2)+"]");}')
    A('  lines.push("ACTOR_04_board_gb="+bb(bdup.geometricBounds));')
    A('  lines.push("ACTOR_04_board_anchors="+bpts.join(" "));')
    A('  lines.push("ACTOR_05_SGM_hidden="+L5.groupItems.getByName("SECRET_GUEST_MODE").hidden);')
    A('  d.save();')
    A('  fin("OK\\n"+lines.join("\\n"));')
    A('  d.close(SaveOptions.SAVECHANGES);')
    A(' }catch(err){ fin("ERR "+err.message); try{d.close(SaveOptions.DONOTSAVECHANGES);}catch(e){} }')
    A('})();')

    jsx = ROOT / a.jsx
    jsx.write_text('\n'.join(L) + '\n', encoding='utf-8')
    print(f'\nJSX 已生成: {a.jsx}')
    print('在 Illustrator 里运行它，或:')
    print(f"  osascript -e 'tell application \"Adobe Illustrator\" to do javascript file \"{jsx}\"'")


if __name__ == '__main__':
    main()
