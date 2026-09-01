#target illustrator
// Fine-tune only Kent's photo and ChinWang's name label. Does not save.
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

  try {
    var d = app.activeDocument;
    var kentLayer = d.layers.getByName('ACTOR_02');
    var chinLayer = d.layers.getByName('ACTOR_03');
    unlock(kentLayer);
    unlock(chinLayer);

    var kentPhoto = firstRaster(kentLayer.groupItems.getByName('PHOTO'));
    if (!kentPhoto) throw new Error('Kent photo was not found.');
    kentPhoto.left += 35;

    var chinName = chinLayer.textFrames.getByName('NAME');
    chinName.top -= 18;

    alert('Kent photo moved right and ChinWang label moved down. Please inspect before saving.');
  } catch (e) {
    alert('Position adjustment stopped: ' + e.message);
  }
}());
