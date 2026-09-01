#!/usr/bin/env python3
"""
把某一格的「剪影」素材从一份 .ai 提取进母版，生成新母版。

⚠️ 未跑通，不要当成可用工具。2026-09-01 实测两次都失败：
   1. 第一次 `ERR Cannot modify a layer that is locked` —— 已修（跑前递归解锁+显示，
      跑完原样还原；这部分验证过是对的）。
   2. 第二次 **挂死在跨文档 `silSrc.duplicate(sgmOut, ...)`** —— 不抛异常、不写 status，
      Illustrator 无响应。产物只完成到 `saveAs`，里面仍是旧剪影。

   结论：Illustrator 的跨文档 duplicate() 在这个体量的素材上不可用。要继续做的话，
   换思路：**拿设计师回稿当基底造母版**（新剪影天然在里面），在同一文档内把
   ACTOR_01/02/03 的内嵌 RasterItem 换回 PlacedItem，全程不跨文档。未验证。

   在此之前，下一期若需要设计师的新剪影，最省事的办法是让他在管线出图后再放一次。

用途：设计师在终稿里重画了剪影，但**终稿不能直接当母版** —— 交付给设计师的文件里
图片是 embed 的（RasterItem），而 stage1 换照片靠 `p.file=新路径`，只对链接图
（PlacedItem）有效。所以设计师加的素材必须像这样单独提取，不能整份接管。

只搬「剪影」组本身，不动裁切路径以外的任何东西：
  SECRET_GUEST_MODE
  ├─ TextFrame 'SECRET GUEST 姓名牌'   ← 不动
  └─ GroupItem '剪影'                  ← 换成来源文件里的那一个
       ├─ PathItem clipping=true        ← 必须仍等于 config 的 clip_pt，脚本会核对
       └─ GroupItem（图形本体）

母版只读：源母版不写，结果另存为新文件。

用法:
    python3 tools/extract_silhouette.py ACTOR_04 \
        --from killer90mins_20260905/killer90mins_20260905.ai \
        --master killer90mins_20260905/killer90mins_master_slot4secret.ai \
        --out killer90mins_20260905/killer90mins_master_v2.ai
"""
import sys, json, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


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


def corners(clip_pt):
    """整理成 TL,BL,BR,TR，与模板中裁切路径的锚点顺序一致"""
    xs = sorted({p[0] for p in clip_pt})
    left = sorted([p for p in clip_pt if p[0] == xs[0]], key=lambda p: p[1])
    right = sorted([p for p in clip_pt if p[0] == xs[-1]], key=lambda p: p[1])
    return [left[1], left[0], right[0], right[1]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('slot', help='要提取的格子，如 ACTOR_04')
    ap.add_argument('--from', dest='src', required=True, help='剪影的来源 .ai（只读）')
    ap.add_argument('--master', required=True, help='源母版 .ai（只读）')
    ap.add_argument('--out', required=True, help='新母版输出路径')
    ap.add_argument('--jsx', default='tools/_extract_silhouette.jsx')
    a = ap.parse_args()

    cfg = json.loads((ROOT / 'config/slots.json').read_text(encoding='utf-8'))
    if a.slot not in cfg['slots']:
        sys.exit(f'config 里没有 {a.slot}')
    c = corners(cfg['slots'][a.slot]['clip_pt'])

    src = (ROOT / a.src).resolve()
    mst = (ROOT / a.master).resolve()
    out = (ROOT / a.out).resolve()
    for p, tag in ((src, '来源'), (mst, '母版')):
        if not p.exists():
            sys.exit(f'{tag}文件不存在: {p}')
    out.parent.mkdir(parents=True, exist_ok=True)

    print(f'格子: {a.slot}')
    print(f'来源: {src.relative_to(ROOT)}   （只读）')
    print(f'母版: {mst.relative_to(ROOT)}   （只读）')
    print(f'新版: {out.relative_to(ROOT)}')
    print('核对裁切锚点 TL,BL,BR,TR:')
    for p in c:
        print(f'    [{p[0]:.2f}, {p[1]:.2f}]')

    SIL = '剪影'
    SGM = 'SECRET_GUEST_MODE'
    L = []
    A = L.append
    A('#target illustrator')
    A('// 由 tools/extract_silhouette.py 生成，勿手改。')
    A('(function(){')
    A(' var status=new File(%s);' % esc(str(out.with_suffix('')) + '_extract_status.txt'))
    A(' function fin(m){try{status.encoding="UTF-8";status.open("w");status.writeln(m);status.close();}catch(e){}}')
    A(' var dSrc=null, dOut=null, prevUI=null, saved=[];')
    # Illustrator 不允许改动被锁定或隐藏的图层里的对象。母版里 ACTOR_04 是锁着的，
    # PHOTO_MODE 子图层是隐藏的 —— 直接 duplicate/remove 会抛
    # "Cannot modify a layer that is locked"。先全解锁全显示，做完原样还原。
    A(' function unlockAll(doc,tag){')
    A('  function walk(ls){ for(var i=0;i<ls.length;i++){ var L=ls[i];')
    A('    saved[saved.length]={doc:tag,layer:L,locked:L.locked,visible:L.visible};')
    A('    try{L.locked=false;}catch(e){} try{L.visible=true;}catch(e2){}')
    A('    if(L.layers.length) walk(L.layers); } }')
    A('  walk(doc.layers);')
    A(' }')
    A(' function restoreAll(){')
    A('  for(var i=saved.length-1;i>=0;i--){')
    A('   try{ saved[i].layer.visible=saved[i].visible; }catch(e){}')
    A('   try{ saved[i].layer.locked=saved[i].locked; }catch(e2){}')
    A('  }')
    A(' }')
    A(' try{')
    # 缺字体 / 颜色配置不匹配 / 粘贴偏好等模态框会锁死 ExtendScript，全程抑制
    A('  try{ prevUI=app.userInteractionLevel;'
      ' app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS; }catch(e0){}')
    A('  dSrc=app.open(new File(%s));' % esc(str(src)))
    A('  var silSrc=dSrc.layers.getByName(%s).groupItems.getByName(%s).groupItems.getByName(%s);'
      % (esc(a.slot), esc(SGM), esc(SIL)))
    # 先核对来源的裁切路径确实是这一格的板
    A('  var cs=null;')
    A('  for(var i=0;i<silSrc.pathItems.length;i++){ if(silSrc.pathItems[i].clipping){ cs=silSrc.pathItems[i]; break; } }')
    A('  if(!cs) throw new Error("\\u6765\\u6e90\\u526a\\u5f71\\u91cc\\u6ca1\\u6709\\u88c1\\u5207\\u8def\\u5f84");')
    A('  var want=[')
    for p in c:
        A('    [%.4f,%.4f],' % (p[0], p[1]))
    A('  ];')
    A('  if(cs.pathPoints.length!==want.length) throw new Error("\\u6765\\u6e90\\u88c1\\u5207\\u8def\\u5f84\\u70b9\\u6570="+cs.pathPoints.length);')
    A('  for(var q=0;q<want.length;q++){')
    A('   var an=cs.pathPoints[q].anchor;')
    A('   if(Math.abs(an[0]-want[q][0])>0.05||Math.abs(an[1]-want[q][1])>0.05)')
    A('     throw new Error("\\u6765\\u6e90\\u88c1\\u5207\\u677f\\u4e0d\\u662f\\u672c\\u683c\\u7684\\uff1a\\u70b9"+q+" ["+an[0].toFixed(2)+","+an[1].toFixed(2)+"]");')
    A('  }')
    # 打开母版，立刻另存
    A('  dOut=app.open(new File(%s));' % esc(str(mst)))
    A('  dOut.saveAs(new File(%s), new IllustratorSaveOptions());' % esc(str(out)))
    A('  unlockAll(dSrc,"src"); unlockAll(dOut,"out");')
    A('  var sgmOut=dOut.layers.getByName(%s).groupItems.getByName(%s);' % (esc(a.slot), esc(SGM)))
    A('  var sgmWasHidden=sgmOut.hidden;')
    A('  sgmOut.hidden=false;   // 隐藏的组同样不能改，先显出来，最后还原')
    A('  var oldSil=sgmOut.groupItems.getByName(%s);' % esc(SIL))
    A('  var oldGb=oldSil.geometricBounds;')
    # 跨文档复制：把来源剪影放进母版的 SECRET_GUEST_MODE
    A('  var newSil=silSrc.duplicate(sgmOut, ElementPlacement.PLACEATEND);')
    A('  oldSil.remove();')
    A('  newSil.name=%s;' % esc(SIL))
    A('  newSil.hidden=false;')
    # 回读核对
    A('  function bb(b){return "["+b[0].toFixed(3)+","+b[1].toFixed(3)+","+b[2].toFixed(3)+","+b[3].toFixed(3)+"]";}')
    A('  var chk=null;')
    A('  for(var j=0;j<newSil.pathItems.length;j++){ if(newSil.pathItems[j].clipping){ chk=newSil.pathItems[j]; break; } }')
    A('  var pts=[];')
    A('  if(chk){ for(var k=0;k<chk.pathPoints.length;k++){var b2=chk.pathPoints[k].anchor;pts.push("["+b2[0].toFixed(2)+","+b2[1].toFixed(2)+"]");} }')
    A('  var lines=[];')
    A('  lines.push("slot=%s");' % a.slot)
    A('  lines.push("out="+dOut.name);')
    A('  lines.push("old_sil_gb="+bb(oldGb));')
    A('  lines.push("new_sil_gb="+bb(newSil.geometricBounds));')
    A('  lines.push("new_clip_anchors="+pts.join(" "));')
    A('  lines.push("SGM_children="+sgmOut.pageItems.length);')
    A('  var nm=[]; for(var m=0;m<sgmOut.pageItems.length;m++) nm.push(sgmOut.pageItems[m].typename+":"+sgmOut.pageItems[m].name);')
    A('  lines.push("SGM_list="+nm.join(" | "));')
    A('  sgmOut.hidden=sgmWasHidden;   // 还原母版的默认状态（照片模式可见、剪影隐藏）')
    A('  restoreAll();')
    A('  lines.push("SGM_hidden="+sgmOut.hidden+" (restored)");')
    A('  lines.push("layers_restored="+saved.length);')
    A('  dOut.save();')
    A('  fin("OK\\n"+lines.join("\\n"));')
    A('  dOut.close(SaveOptions.SAVECHANGES);')
    A('  dSrc.close(SaveOptions.DONOTSAVECHANGES);')
    A(' }catch(err){ try{restoreAll();}catch(e9){} fin("ERR "+err.message);')
    A('   try{if(dOut)dOut.close(SaveOptions.DONOTSAVECHANGES);}catch(e){}')
    A('   try{if(dSrc)dSrc.close(SaveOptions.DONOTSAVECHANGES);}catch(e2){} }')
    A(' try{ if(prevUI!==null) app.userInteractionLevel=prevUI; }catch(e3){}')
    A('})();')

    jsx = ROOT / a.jsx
    jsx.write_text('\n'.join(L) + '\n', encoding='utf-8')
    print(f'\nJSX 已生成: {a.jsx}')


if __name__ == '__main__':
    main()
