#target illustrator
// Match the name-tag layout to the supplied master poster.
// The two controlled distances are:
//   panel top -> name-tag top: 3 mm
//   name-tag bottom -> visible head top: 5 mm
// The script updates the open document, saves a new AI copy, and exports a PNG preview.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }

  var d = app.activeDocument;
  var PT_PER_MM = 72 / 25.4;
  var TOP_GAP = 3 * PT_PER_MM;
  var HEAD_GAP = 5 * PT_PER_MM;
  var outputFolder = new Folder('/Users/aaaa/Documents/GitHub/spicy海报/killer90mins文件夹_0805');
  var outputAI = new File(outputFolder.fsName + '/killer90mins_v3.ai');
  var outputPNG = new File(outputFolder.fsName + '/killer90mins_v3.png');

  var actors = [
    { layer: 'ACTOR_01', photo: 'PHOTO',  trimTop: 742 / 11536 },
    { layer: 'ACTOR_02', photo: 'PHOTO',  trimTop: 1510 / 11534 },
    { layer: 'ACTOR_03', photo: 'PHTOTO', trimTop: 587 / 3796 },
    { layer: 'ACTOR_04', photo: 'PHOTO',  trimTop: 399 / 3796 },
    { layer: 'ACTOR_05', photo: 'PHOTO',  trimTop: 1234 / 11233 }
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
      if (group.pageItems[j].typename === 'GroupItem') {
        var found = firstRaster(group.pageItems[j]);
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

  function nameFrame(layer, index) {
    try { return layer.textFrames.getByName('NAME'); } catch (e) {}
    if (index === 4) {
      try { return layer.textFrames.getByName('NAME：secret guest'); } catch (e2) {}
    }
    if (layer.textFrames.length) return layer.textFrames[0];
    throw new Error('Name tag missing in ' + layer.name + '.');
  }

  function topEdge(path) {
    var b = path.geometricBounds;
    var midY = (b[1] + b[3]) / 2;
    var upper = [];
    for (var i = 0; i < path.pathPoints.length; i++) {
      var a = path.pathPoints[i].anchor;
      if (a[1] >= midY) upper.push({ x: a[0], y: a[1] });
    }
    if (upper.length < 2) throw new Error('Cannot read actor-panel top edge.');
    upper.sort(function (a, b2) { return a.x - b2.x; });
    return { left: upper[0], right: upper[upper.length - 1] };
  }

  function edgeYAtX(edge, x) {
    var dx = edge.right.x - edge.left.x;
    if (Math.abs(dx) < 0.001) return (edge.left.y + edge.right.y) / 2;
    return edge.left.y + (x - edge.left.x) * (edge.right.y - edge.left.y) / dx;
  }

  function currentAngle(item) {
    var m = item.matrix;
    return Math.atan2(m.mValueB, m.mValueA) * 180 / Math.PI;
  }

  try {
    for (var i = 0; i < actors.length; i++) {
      var cfg = actors[i];
      var layer = d.layers.getByName(cfg.layer);
      unlock(layer);

      var group = layer.groupItems.getByName(cfg.photo);
      var clip = clippingPath(group);
      var raster = firstRaster(group);
      var name = nameFrame(layer, i);
      if (!clip || !raster) throw new Error('Photo geometry missing in ' + cfg.layer + '.');

      var edge = topEdge(clip);
      var desiredAngle = Math.atan2(edge.right.y - edge.left.y, edge.right.x - edge.left.x) * 180 / Math.PI;
      var delta = desiredAngle - currentAngle(name);
      if (Math.abs(delta) > 0.05) name.rotate(delta, true, true, true, true, Transformation.CENTER);

      // Anchor the label to the black panel's top edge at the label center.
      var nameCenterX = name.left + name.width / 2;
      name.top = edgeYAtX(edge, nameCenterX) - TOP_GAP;

      // Then anchor the visible top of the head to the label's lower edge.
      var desiredHeadTop = name.top - name.height - HEAD_GAP;
      raster.top = desiredHeadTop + cfg.trimTop * raster.height;
    }

    var saveOptions = new IllustratorSaveOptions();
    saveOptions.pdfCompatible = true;
    d.saveAs(outputAI, saveOptions);

    var pngOptions = new ExportOptionsPNG24();
    pngOptions.antiAliasing = true;
    pngOptions.transparency = false;
    pngOptions.artBoardClipping = true;
    pngOptions.horizontalScale = 200;
    pngOptions.verticalScale = 200;
    d.exportFile(outputPNG, ExportType.PNG24, pngOptions);

    alert('Matched to master: 3 mm above label, 5 mm below label.\nSaved: killer90mins_v3.ai\nPreview: killer90mins_v3.png');
  } catch (e3) {
    alert('Master alignment stopped: ' + e3.message);
  }
}());
