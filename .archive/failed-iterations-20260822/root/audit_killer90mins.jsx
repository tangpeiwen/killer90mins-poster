// Read-only structure audit for the currently open Illustrator document.
(function () {
  var d = app.activeDocument;
  var out = [];
  function line(s) { out.push(s); }
  function indent(n) { var s = ''; while (n-- > 0) s += '  '; return s; }
  function scan(item, depth) {
    var nm = item.name ? ' name=' + item.name : '';
    var extra = '';
    try { if (item.typename === 'TextFrame') extra = ' text=' + item.contents; } catch (e) {}
    try { if (item.typename === 'PathItem') extra += ' clipped=' + item.clipping; } catch (e2) {}
    line(indent(depth) + item.typename + nm + extra);
    try {
      if (item.pageItems && item.pageItems.length) {
        for (var i = 0; i < item.pageItems.length; i++) scan(item.pageItems[i], depth + 1);
      }
    } catch (e3) {}
  }
  line('Document: ' + d.name);
  for (var i = 0; i < d.layers.length; i++) {
    var l = d.layers[i];
    line('LAYER ' + l.name + ' visible=' + l.visible + ' locked=' + l.locked);
    for (var j = 0; j < l.pageItems.length; j++) scan(l.pageItems[j], 1);
  }
  var f = new File(Folder.desktop.fsName + '/killer90mins-audit.txt');
  f.encoding = 'UTF-8';
  f.open('w'); f.write(out.join('\n')); f.close();
  alert('Read-only audit complete. Report saved to Desktop: killer90mins-audit.txt');
}());
