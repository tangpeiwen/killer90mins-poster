#target illustrator
// Visual follow-up for the v3 poster:
// - give Ian's name tag a clear gap below the panel top
// - lift Chin Wang's portrait and name tag together
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }

  var d = app.activeDocument;
  var outputFolder = new Folder('/Users/aaaa/Documents/GitHub/spicy海报/killer90mins文件夹_0805');
  var outputAI = new File(outputFolder.fsName + '/killer90mins_v4.ai');
  var outputPNG = new File(outputFolder.fsName + '/killer90mins_v4.png');

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

  try {
    var ianLayer = d.layers.getByName('ACTOR_01');
    unlock(ianLayer);
    var ianName = ianLayer.textFrames.getByName('NAME');
    ianName.top -= 10;

    var chinLayer = d.layers.getByName('ACTOR_03');
    unlock(chinLayer);
    var chinName = chinLayer.textFrames.getByName('NAME');
    var chinRaster = firstRaster(chinLayer.groupItems.getByName('PHTOTO'));
    if (!chinRaster) throw new Error('Chin Wang photo not found.');
    chinName.top += 12;
    chinRaster.top += 12;

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
    d.save();

    alert('v4 saved: Ian name down 10 pt; Chin Wang pair up 12 pt.');
  } catch (e3) {
    alert('v4 correction stopped: ' + e3.message);
  }
}());
