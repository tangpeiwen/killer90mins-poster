#target illustrator
(function () {
  var source = new File('/tmp/k90_0805/killer90mins.ai');
  var d = app.open(source);
  var layer = d.layers.getByName('ACTOR_03');
  var out = [];
  function c(v) { try { return String(v); } catch (e) { return ''; } }
  function color(v) { try { return v.typename + ':' + [v.red, v.green, v.blue, v.cyan, v.magenta, v.yellow, v.black].join(','); } catch (e) { return ''; } }
  function walk(item, depth) {
    var prefix = ''; for (var k = 0; k < depth; k++) prefix += '  ';
    var line = prefix + item.typename + ' name=' + c(item.name) + ' hidden=' + c(item.hidden);
    try { line += ' bounds=' + item.geometricBounds.join(','); } catch (e0) {}
    if (item.typename === 'TextFrame') {
      line += ' text=' + JSON.stringify(item.contents);
      try { line += ' font=' + item.textRange.characterAttributes.textFont.name; } catch (e1) {}
      try { line += ' size=' + item.textRange.characterAttributes.size; } catch (e2) {}
      try { line += ' fill=' + color(item.textRange.characterAttributes.fillColor); } catch (e3) {}
    }
    out.push(line);
    try { for (var i = 0; i < item.layers.length; i++) walk(item.layers[i], depth + 1); } catch (e4) {}
    try { for (var j = 0; j < item.pageItems.length; j++) walk(item.pageItems[j], depth + 1); } catch (e5) {}
  }
  out.push('DOC=' + d.name + ' layers=' + d.layers.length + ' textFrames=' + d.textFrames.length);
  out.push('TARGET pageItems=' + layer.pageItems.length + ' groupItems=' + layer.groupItems.length + ' textFrames=' + layer.textFrames.length + ' layers=' + layer.layers.length);
  if (layer.textFrames.length) {
    var tf = layer.textFrames[0];
    out.push('TARGET_TEXT name=' + c(tf.name) + ' text=' + c(tf.contents) + ' font=' + tf.textRange.characterAttributes.textFont.name + ' size=' + tf.textRange.characterAttributes.size + ' fill=' + color(tf.textRange.characterAttributes.fillColor) + ' bounds=' + tf.geometricBounds.join(','));
  }
  if (layer.groupItems.length) {
    var g = layer.groupItems[0];
    out.push('TARGET_GROUP name=' + c(g.name) + ' hidden=' + c(g.hidden) + ' bounds=' + g.geometricBounds.join(','));
  }
  for (var top = 0; top < d.layers.length; top++) walk(d.layers[top], 0);
  var f = new File('/tmp/k90_0805_linghao_audit.txt'); f.encoding = 'UTF-8'; f.open('w'); f.write(out.join('\n')); f.close();
  d.close(SaveOptions.DONOTSAVECHANGES);
}());
