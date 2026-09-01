#target illustrator
(function () {
  if (app.documents.length === 0) { alert('No document open'); return; }
  var d = app.activeDocument;
  var out = [];
  function value(v) { try { return String(v); } catch (e) { return ''; } }
  function bounds(it) { try { return it.geometricBounds.join(','); } catch (e) { return ''; } }
  function indent(n) { var s = ''; while (n-- > 0) s += '  '; return s; }
  function emit(it, depth) {
    var line = indent(depth) + it.typename + ' name=' + value(it.name) + ' hidden=' + value(it.hidden) + ' visible=' + value(it.visible) + ' bounds=' + bounds(it);
    try { if (it.typename === 'TextFrame') line += ' text=' + JSON.stringify(it.contents); } catch (e0) {}
    try { if (it.typename === 'PlacedItem') line += ' file=' + it.file.fsName; } catch (e1) {}
    out.push(line);
    try { for (var i = 0; i < it.layers.length; i++) emit(it.layers[i], depth + 1); } catch (e2) {}
    try { for (var j = 0; j < it.pageItems.length; j++) emit(it.pageItems[j], depth + 1); } catch (e3) {}
  }
  var target = d.layers.getByName('ACTOR_05');
  out.push('DOC=' + d.name);
  emit(target, 0);
  var f = new File('/tmp/actor05_audit.txt');
  f.encoding = 'UTF-8'; f.open('w'); f.write(out.join('\n')); f.close();
}());
