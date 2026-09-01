#target illustrator
// Final visual refinements for the currently open Killer90mins working copy.
// Modifies the open document only; does not save.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }

  var d = app.activeDocument;
  var MM12 = 12 * 72 / 25.4;

  var actors = [
    { layer: 'ACTOR_01', photo: 'PHOTO',  faceX: 0.43, trimTop: 742 / 11536 },
    { layer: 'ACTOR_02', photo: 'PHOTO',  faceX: 0.39, trimTop: 1510 / 11534 },
    { layer: 'ACTOR_03', photo: 'PHTOTO', faceX: 0.51, trimTop: 587 / 3796, trimBottom: (587 + 2796) / 3796, enlarge: 1.16 },
    { layer: 'ACTOR_04', photo: 'PHOTO',  faceX: 0.43, trimTop: 399 / 3796 },
    { layer: 'ACTOR_05', photo: 'PHOTO',  faceX: 0.47, trimTop: 1234 / 11233 }
  ];

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

  function clippingPath(group) {
    for (var i = 0; i < group.pathItems.length; i++) {
      if (group.pathItems[i].clipping) return group.pathItems[i];
    }
    for (var j = 0; j < group.groupItems.length; j++) {
      var found = clippingPath(group.groupItems[j]);
      if (found) return found;
    }
    return null;
  }

  function actorName(layer, index) {
    try { return layer.textFrames.getByName('NAME'); } catch (e) {}
    if (index === 4) {
      try { return layer.textFrames.getByName('NAME：secret guest'); } catch (e2) {}
    }
    if (layer.textFrames.length) return layer.textFrames[0];
    throw new Error('No name label in ' + layer.name);
  }

  try {
    // Apply the installed Alibaba font to the fixed Chinese ticket label.
    var cnFont = app.textFonts.getByName('AlibabaPuHuiTi_3_105_Heavy');
    var changedChinese = 0;
    for (var ti = 0; ti < d.textFrames.length; ti++) {
      var tf = d.textFrames[ti];
      if (tf.contents.indexOf('扫码购票') !== -1) {
        unlock(tf);
        tf.textRange.characterAttributes.textFont = cnFont;
        changedChinese++;
      }
    }

    for (var ai = 0; ai < actors.length; ai++) {
      var cfg = actors[ai];
      var layer = d.layers.getByName(cfg.layer);
      unlock(layer);

      var photoGroup = layer.groupItems.getByName(cfg.photo);
      var raster = firstRaster(photoGroup);
      var clip = clippingPath(photoGroup);
      if (!raster || !clip) throw new Error('Photo or clipping path missing in ' + cfg.layer);

      // ChinWang needs a larger cutout so the transparent lower edge cannot reveal black.
      if (cfg.enlarge && raster.note !== 'K90_CHIN_ENLARGED_V1') {
        var oldW = raster.width;
        var oldH = raster.height;
        raster.width = oldW * cfg.enlarge;
        raster.height = oldH * cfg.enlarge;
        raster.note = 'K90_CHIN_ENLARGED_V1';
      }

      var cb = clip.geometricBounds; // left, top, right, bottom
      var clipCenterX = (cb[0] + cb[2]) / 2;

      // Center the face rather than the full transparent PNG canvas.
      raster.left += clipCenterX - (raster.left + cfg.faceX * raster.width);

      // For ChinWang, align the lowest non-transparent pixel slightly beyond the mask bottom.
      if (cfg.trimBottom) raster.top = cb[3] + cfg.trimBottom * raster.height - 5;

      var name = actorName(layer, ai);
      if (ai === 2) name.contents = 'chin wang';
      if (ai === 4) {
        name.contents = 'jorge';
        if (name.note !== 'K90_JORGE_TILT_V1') {
          name.rotate(8, true, true, true, true, Transformation.CENTER);
          name.note = 'K90_JORGE_TILT_V1';
        }
      }

      // Keep about 12 mm between the label's lower edge and the top of the head.
      var headTop = raster.top - cfg.trimTop * raster.height;
      name.top = headTop + MM12 + name.height;

      // The upper KILLER artwork overlaps the top of the later slots. Move the
      // complete portrait/name pair down while preserving their measured gap.
      raster.top -= 36;
      name.top -= 36;
    }

    alert('Final refinements applied to the open document. Chinese labels updated: ' + changedChinese + '. Please inspect before saving.');
  } catch (e) {
    alert('Final refinements stopped: ' + e.message);
  }
}());
