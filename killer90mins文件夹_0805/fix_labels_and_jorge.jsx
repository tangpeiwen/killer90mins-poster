#target illustrator
// Move each portrait/name pair down together and refine Jorge's face position.
// Modifies the open document only; does not save.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }

  function unlock(item) {
    try { item.locked = false; } catch (e) {}
    try {
      for (var i = 0; i < item.pageItems.length; i++) unlock(item.pageItems[i]);
    } catch (e2) {}
  }

  function firstRaster(group) {
    for (var i = 0; i < group.rasterItems.length; i++) return group.rasterItems[i];
    for (var j = 0; j < group.pageItems.length; j++) {
      var p = group.pageItems[j];
      if (p.typename === 'GroupItem') {
        var found = firstRaster(p);
        if (found) return found;
      }
    }
    return null;
  }

  function nameFrame(layer, index) {
    try { return layer.textFrames.getByName('NAME'); } catch (e) {}
    if (index === 4) {
      try { return layer.textFrames.getByName('NAME：secret guest'); } catch (e2) {}
    }
    if (layer.textFrames.length) return layer.textFrames[0];
    throw new Error('Name label not found in ' + layer.name);
  }

  try {
    var d = app.activeDocument;
    var photoNames = ['PHOTO', 'PHOTO', 'PHTOTO', 'PHOTO', 'PHOTO'];

    for (var i = 0; i < 5; i++) {
      var layer = d.layers.getByName('ACTOR_0' + (i + 1));
      unlock(layer);
      var raster = firstRaster(layer.groupItems.getByName(photoNames[i]));
      var name = nameFrame(layer, i);
      if (!raster) throw new Error('Photo not found in ' + layer.name);

      var marker = 'K90_PAIR_DOWN_V1';
      if (name.note.indexOf(marker) === -1) {
        raster.top -= 36;
        name.top -= 36;
        name.note = name.note ? name.note + '|' + marker : marker;
      }

      if (i === 4 && raster.note.indexOf('K90_JORGE_RIGHT_V1') === -1) {
        raster.left += 36;
        raster.note = raster.note ? raster.note + '|K90_JORGE_RIGHT_V1' : 'K90_JORGE_RIGHT_V1';
      }
    }

    alert('Labels and portraits moved down together; Jorge moved right. Please inspect before saving.');
  } catch (e) {
    alert('Alignment fix stopped: ' + e.message);
  }
}());
