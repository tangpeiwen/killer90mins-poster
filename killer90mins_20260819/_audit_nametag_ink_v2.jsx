#target illustrator
/*
 * 名牌墨迹边界审计 v2 —— 测量「可见白色印章块」的真实边界。
 *
 * 原理：Illustrator 对点文字返回的 geometricBounds 是「文字对象框」，
 *       含上伸/下伸空白，不等于看得见的白色印章块。
 *       本脚本把每个名牌复制一份 → 转轮廓 → 读 bounds → 立即删除副本。
 *
 * 对文档的影响：仅创建并删除临时副本，跑完文档内容与运行前完全一致。
 *       但 Illustrator 会把文档标记为「已修改」——请直接关闭且【不要保存】。
 *
 * 输出：<文件名>_nametag_ink.txt
 */
(function () {
  if (app.documents.length === 0) { alert('请先打开要审计的 .ai 文件。'); return; }
  var d = app.activeDocument, PT2MM = 25.4 / 72, OUT = [], made = [];
  function mm(v) { return Math.round(v * PT2MM * 1000) / 1000; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function w(s) { OUT[OUT.length] = s; }
  function safe(f, dv) { try { return f(); } catch (e) { return dv; } }
  function bb(b) { return '[' + r2(b[0]) + ',' + r2(b[1]) + ',' + r2(b[2]) + ',' + r2(b[3]) + ']'; }
  function bmm(b) { return '[' + mm(b[0]) + ',' + mm(b[1]) + ',' + mm(b[2]) + ',' + mm(b[3]) + ']mm'; }

  w('=== NAME TAG INK BOUNDS ===');
  w('doc=' + d.name);
  var R = d.artboards[0].artboardRect;
  w('artboard_pt=' + bb(R) + ' size_mm=' + mm(R[2] - R[0]) + 'x' + mm(R[1] - R[3]));
  w('说明: text_gb=文字对象框(Illustrator 原始值)  ink_gb=转轮廓后的真实墨迹框');
  w('');

  try {
    for (var i = 0; i < d.textFrames.length; i++) {
      var tf = d.textFrames[i];
      var nm = safe(function () { return tf.name; }, '');
      var lay = safe(function () { return tf.layer.name; }, '?');
      var body = safe(function () { return tf.contents; }, '');
      var tgb = safe(function () { return tf.geometricBounds; }, null);
      if (!tgb) continue;

      var dup = tf.duplicate(d, ElementPlacement.PLACEATEND);
      made[made.length] = dup;
      var og = null;
      try { var o = dup.createOutline(); made[made.length] = o; og = o.geometricBounds; } catch (e) { og = null; }

      w('TAG layer=' + lay + ' name=' + nm +
        ' contents="' + String(body).replace(/[\r\n\t]/g, '\\n') + '"' +
        ' font=' + safe(function () { return tf.textRange.characterAttributes.textFont.name; }, '?') +
        ' size=' + safe(function () { return r2(tf.textRange.characterAttributes.size); }, '?') +
        ' rotation_matrix=' + safe(function () { var m = tf.matrix; return r2(m.mValueA) + ',' + r2(m.mValueB) + ',' + r2(m.mValueC) + ',' + r2(m.mValueD); }, 'n/a') +
        ' text_gb=' + bb(tgb) + ' text_gb_mm=' + bmm(tgb) +
        (og ? (' ink_gb=' + bb(og) + ' ink_gb_mm=' + bmm(og) +
               ' inset_top_mm=' + mm(tgb[1] - og[1]) +
               ' inset_bottom_mm=' + mm(og[3] - tgb[3]) +
               ' inset_left_mm=' + mm(og[0] - tgb[0]) +
               ' inset_right_mm=' + mm(tgb[2] - og[2]))
            : ' ink_gb=(轮廓化失败)'));
    }
  } catch (err) {
    w('ERROR: ' + err.message);
  }

  // 清理全部临时副本
  var removed = 0;
  for (var k = made.length - 1; k >= 0; k--) {
    try { made[k].remove(); removed++; } catch (e2) {}
  }
  w('');
  w('=== END ===  临时副本已删除 ' + removed + ' 个');

  var dir = safe(function () { return d.path.fsName; }, Folder.desktop.fsName);
  var f = new File(dir + '/' + d.name.replace(/\.ai$/i, '') + '_nametag_ink.txt');
  f.encoding = 'UTF-8'; f.open('w'); f.write(OUT.join('\n')); f.close();
  alert('完成。临时副本已全部删除。\n\n请【不要保存】直接关闭文档。\n\n输出：\n' + f.fsName);
}());
