#target illustrator
/*
 * 模板几何审计 —— 只读，不修改任何东西。
 * 没有 save / saveAs / 任何写入文档的调用。跑完文档保持未修改状态。
 *
 * 用法：在 Illustrator 里打开要审计的 .ai（例如 killer90mins_v3.ai），运行本脚本。
 * 输出：与该 .ai 同目录下的  <文件名>_geometry_audit.txt
 */
(function () {
  if (app.documents.length === 0) { alert('请先打开要审计的 .ai 文件，再运行本脚本。'); return; }

  var d = app.activeDocument;
  var PT2MM = 25.4 / 72;
  var OUT = [];
  var MAXPTS = 64;          // 点数超过这个的路径不导出坐标（静态插画）
  var DETAIL = /ACTOR|EVENT|HOST|DATE|TIME|NAME|PHOTO|PHTOTO|SECRET|GUEST|MONTH|DAY|WEEKDAY/i;

  function mm(v) { return Math.round(v * PT2MM * 100) / 100; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function w(s) { OUT[OUT.length] = s; }
  function bnds(b) { return '[' + r2(b[0]) + ',' + r2(b[1]) + ',' + r2(b[2]) + ',' + r2(b[3]) + ']'; }
  function bmm(b) { return '[' + mm(b[0]) + ',' + mm(b[1]) + ',' + mm(b[2]) + ',' + mm(b[3]) + ']mm'; }
  function esc(s) { return String(s).replace(/[\r\n\t]/g, ' '); }
  function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

  // ---------- 文档与画板 ----------
  w('=== DOCUMENT ===');
  w('name=' + d.name);
  w('path=' + safe(function () { return d.path.fsName; }, '(未保存)'));
  w('colorSpace=' + safe(function () { return String(d.documentColorSpace); }, '?'));
  w('rulerUnits=' + safe(function () { return String(d.rulerUnits); }, '?'));
  w('coordinateSystem=' + safe(function () { return String(app.coordinateSystem); }, '?'));
  w('artboards=' + d.artboards.length);
  for (var ai = 0; ai < d.artboards.length; ai++) {
    var ab = d.artboards[ai], R = ab.artboardRect;   // [left, top, right, bottom]  y 向上
    w('ARTBOARD i=' + ai + ' name=' + esc(ab.name) +
      ' rect_pt=' + bnds(R) +
      ' width_pt=' + r2(R[2] - R[0]) + ' height_pt=' + r2(R[1] - R[3]) +
      ' width_mm=' + mm(R[2] - R[0]) + ' height_mm=' + mm(R[1] - R[3]));
  }

  // ---------- 路径顶点 ----------
  function dumpPath(p, path) {
    var n = safe(function () { return p.pathPoints.length; }, 0);
    var line = 'PATH  ' + path +
      ' clipping=' + safe(function () { return p.clipping; }, '?') +
      ' closed=' + safe(function () { return p.closed; }, '?') +
      ' npts=' + n +
      ' gb=' + bnds(safe(function () { return p.geometricBounds; }, [0, 0, 0, 0]));
    if (n > 0 && n <= MAXPTS) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var a = p.pathPoints[i].anchor;
        pts[pts.length] = r2(a[0]) + ',' + r2(a[1]);
      }
      line += ' pts=' + pts.join(';');
    }
    w(line);
  }

  // ---------- 递归 ----------
  var itemCount = 0;
  function walk(container, path, detail, depth) {
    if (depth > 9 || itemCount > 6000) return;
    var items = safe(function () { return container.pageItems; }, null);
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      itemCount++;
      var nm = safe(function () { return it.name; }, '');
      var tp = safe(function () { return it.typename; }, '?');
      var sub = path + '/' + (nm !== '' ? nm : '<' + tp + ' #' + i + '>');
      var isDetail = detail || DETAIL.test(nm);

      if (!isDetail && depth >= 1) continue;   // 静态图形只列到第一层

      var gb = safe(function () { return it.geometricBounds; }, [0, 0, 0, 0]);
      var vb = safe(function () { return it.visibleBounds; }, [0, 0, 0, 0]);
      var head = tp.toUpperCase() + '  ' + sub +
        ' hidden=' + safe(function () { return it.hidden; }, '?') +
        ' locked=' + safe(function () { return it.locked; }, '?') +
        ' gb=' + bnds(gb) + ' vb=' + bnds(vb) +
        ' gb_mm=' + bmm(gb) + ' vb_mm=' + bmm(vb);

      if (tp === 'PathItem') { dumpPath(it, sub); }
      else if (tp === 'TextFrame') {
        w(head +
          ' contents="' + esc(safe(function () { return it.contents; }, '')) + '"' +
          ' font=' + esc(safe(function () { return it.textRange.characterAttributes.textFont.name; }, '?')) +
          ' size=' + safe(function () { return r2(it.textRange.characterAttributes.size); }, '?') +
          ' kind=' + safe(function () { return String(it.kind); }, '?') +
          ' matrix=' + safe(function () { var m = it.matrix; return r2(m.mValueA) + ',' + r2(m.mValueB) + ',' + r2(m.mValueC) + ',' + r2(m.mValueD) + ',' + r2(m.mValueTX) + ',' + r2(m.mValueTY); }, 'n/a'));
      }
      else if (tp === 'PlacedItem' || tp === 'RasterItem') {
        w(head +
          ' file=' + esc(safe(function () { return it.file.fsName; }, '(缺失或已嵌入)')) +
          ' embedded=' + (tp === 'RasterItem') +
          ' matrix=' + safe(function () { var m = it.matrix; return r2(m.mValueA) + ',' + r2(m.mValueB) + ',' + r2(m.mValueC) + ',' + r2(m.mValueD) + ',' + r2(m.mValueTX) + ',' + r2(m.mValueTY); }, 'n/a'));
      }
      else { w(head + ' children=' + safe(function () { return it.pageItems.length; }, 0)); }

      if (tp === 'GroupItem' || tp === 'CompoundPathItem') walk(it, sub, isDetail, depth + 1);
    }
  }

  function walkLayers(coll, prefix) {
    for (var i = 0; i < coll.length; i++) {
      var L = coll[i], p = prefix + '/' + L.name;
      w('');
      w('LAYER ' + p + ' visible=' + L.visible + ' locked=' + L.locked +
        ' items=' + safe(function () { return L.pageItems.length; }, 0));
      walk(L, p, DETAIL.test(L.name), 0);
      if (L.layers.length) walkLayers(L.layers, p);
    }
  }

  w('');
  w('=== LAYER TREE ===');
  w('(说明：名称匹配 ACTOR/NAME/PHOTO/EVENT/HOST/DATE/TIME/SECRET 的分支完整展开；其余只列首层)');
  walkLayers(d.layers, '');

  // ---------- 字体 ----------
  w('');
  w('=== FONTS IN USE ===');
  var seen = {};
  for (var t = 0; t < d.textFrames.length; t++) {
    var fn = safe(function () { return d.textFrames[t].textRange.characterAttributes.textFont.name; }, '(读取失败)');
    if (!seen[fn]) { seen[fn] = 1; w('font=' + esc(fn)); }
  }

  // ---------- 链接 ----------
  w('');
  w('=== PLACED LINKS ===');
  for (var pi = 0; pi < d.placedItems.length; pi++) {
    w('link=' + esc(safe(function () { return d.placedItems[pi].file.fsName; }, '(缺失)')) +
      ' gb=' + bnds(safe(function () { return d.placedItems[pi].geometricBounds; }, [0, 0, 0, 0])));
  }

  w('');
  w('=== END ===  itemsVisited=' + itemCount);

  // ---------- 写出 ----------
  var dir = safe(function () { return d.path.fsName; }, Folder.desktop.fsName);
  var f = new File(dir + '/' + d.name.replace(/\.ai$/i, '') + '_geometry_audit.txt');
  f.encoding = 'UTF-8';
  f.open('w');
  f.write(OUT.join('\n'));
  f.close();
  alert('审计完成（文档未被修改）\n\n输出：\n' + f.fsName + '\n\n条目数：' + itemCount);
}());
