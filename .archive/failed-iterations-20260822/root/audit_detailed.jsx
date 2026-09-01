#target illustrator
(function () {
  var d = app.activeDocument;
  var out = [];
  function a(s) { out.push(String(s)); }
  function n(v) { return (Math.round(v * 1000) / 1000); }
  function bounds(it) {
    try { var b = it.geometricBounds; return '[' + n(b[0]) + ',' + n(b[1]) + ',' + n(b[2]) + ',' + n(b[3]) + ']'; } catch (e) { return '[]'; }
  }
  function walk(it, depth, parent) {
    var pad = ''; for (var i = 0; i < depth; i++) pad += '  ';
    var nm = ''; try { nm = it.name || ''; } catch (e0) {}
    var line = pad + it.typename + ' name=' + nm + ' bounds=' + bounds(it);
    try { if (it.typename === 'TextFrame') line += ' text=' + JSON.stringify(it.contents); } catch (e1) {}
    try { if (it.typename === 'TextFrame') line += ' font=' + it.textRange.characterAttributes.textFont.name; } catch (e2a) { line += ' fontERR=' + e2a; }
    try { if (it.typename === 'TextFrame') line += ' size=' + n(it.textRange.characterAttributes.size); } catch (e2b) { line += ' sizeERR=' + e2b; }
    try { if (it.typename === 'PlacedItem') line += ' file=' + it.file.fsName + ' w=' + n(it.width) + ' h=' + n(it.height) + ' left=' + n(it.left) + ' top=' + n(it.top); } catch (e2) {}
    try { if (it.typename === 'PathItem') line += ' clipped=' + it.clipping; } catch (e3) {}
    a(line);
    try {
      if (it.pageItems) for (var j = 0; j < it.pageItems.length; j++) walk(it.pageItems[j], depth + 1, it);
    } catch (e4) {}
  }
  a('DOC ' + d.name + ' artboard=' + d.artboards[0].artboardRect.join(','));
  for (var i = 0; i < d.layers.length; i++) {
    var l = d.layers[i];
    a('LAYER ' + l.name + ' visible=' + l.visible + ' locked=' + l.locked);
    for (var j = 0; j < l.pageItems.length; j++) walk(l.pageItems[j], 1, l);
  }
  var f = new File(Folder.desktop.fsName + '/killer90mins-detailed-audit.txt');
  f.encoding = 'UTF-8'; f.open('w'); f.write(out.join('\n')); f.close();
}());
