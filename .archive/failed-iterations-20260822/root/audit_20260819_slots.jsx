#target illustrator
(function () {
  var source = new File('/tmp/k90_20260819/killer90mins_v3.ai');
  var out = new File('/tmp/k90_20260819_slots_audit.txt');
  out.encoding = 'UTF-8'; out.open('w');
  function log(s) { out.writeln(s); }
  function bounds(label, item) {
    try { var b = item.geometricBounds; log(label + ' geometric=' + b[0] + ',' + b[1] + ',' + b[2] + ',' + b[3]); } catch (e) {}
    try { var v = item.visibleBounds; log(label + ' visible=' + v[0] + ',' + v[1] + ',' + v[2] + ',' + v[3]); } catch (e2) {}
  }
  function findClip(item) {
    try { for (var i=0; i<item.pathItems.length; i++) if (item.pathItems[i].clipping) return item.pathItems[i]; } catch(e) {}
    try { for (var j=0; j<item.groupItems.length; j++) { var x=findClip(item.groupItems[j]); if(x)return x; } } catch(e2) {}
    return null;
  }
  var d = app.open(source);
  log('DOC=' + d.fullName.fsName);
  for (var n=1; n<=4; n++) {
    var key = 'ACTOR_0' + n;
    var layer = d.layers.getByName(key);
    log('\n' + key);
    var t = layer.textFrames.getByName('NAME');
    log('NAME contents=' + t.contents + ' font=' + t.textRange.characterAttributes.textFont.name + ' size=' + t.textRange.characterAttributes.size + ' left=' + t.left + ' top=' + t.top);
    bounds('NAME',t);
    var pg = null;
    try { pg = layer.groupItems.getByName('PHOTO'); } catch(e1) { pg=layer.groupItems.getByName('PHTOTO'); }
    var c=findClip(pg); if(c) bounds('CLIP',c);
    try { var p=pg.placedItems[0]; log('PLACED left=' + p.left + ' top=' + p.top + ' width=' + p.width + ' height=' + p.height); bounds('PLACED',p); } catch(e2) { log('no direct placed'); }
  }
  d.close(SaveOptions.DONOTSAVECHANGES); out.close();
}());
