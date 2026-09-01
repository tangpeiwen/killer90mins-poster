#target illustrator
// Updates only the open "killer90mins copy.ai" document. It does not save.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }
  var d = app.activeDocument;
  var base = '/Users/aaaa/Documents/GitHub/spicy海报/killer90mins文件夹/图片文件/';
  var log = [];
  var phase = 'start';
  function getLayer(n) { return d.layers.getByName(n); }
  function unlock(item) {
    try { item.locked = false; } catch (e) {}
    try {
      for (var u = 0; u < item.pageItems.length; u++) unlock(item.pageItems[u]);
    } catch (e2) {}
  }
  function firstRaster(group) {
    for (var i = 0; i < group.rasterItems.length; i++) return group.rasterItems[i];
    for (var j = 0; j < group.pageItems.length; j++) {
      var p = group.pageItems[j];
      if (p.typename === 'GroupItem') { var x = firstRaster(p); if (x) return x; }
    }
    return null;
  }
  function replaceRaster(photoGroup, fileName, box) {
    phase = 'find embedded photo in ' + photoGroup.name;
    var old = firstRaster(photoGroup);
    if (!old) throw new Error('No embedded photo found in ' + photoGroup.name);
    var container = old.parent;
    unlock(container);
    phase = 'create replacement inside ' + photoGroup.name;
    var placed = container.placedItems.add();
    phase = 'link ' + fileName;
    placed.file = new File(base + fileName);
    phase = 'size and position ' + fileName;
    placed.width = box.width;
    placed.height = box.height;
    placed.left = box.left;
    placed.top = box.top;
    phase = 'remove old embedded photo from ' + photoGroup.name;
    old.remove();
    phase = 'embed ' + fileName;
    placed.embed();
  }
  function setActor(layerName, photoGroupName, displayName, fileName, box) {
    phase = 'unlock ' + layerName;
    var a = getLayer(layerName); unlock(a); a.visible = true;
    phase = 'activate ' + layerName;
    d.activeLayer = a;
    phase = 'change name in ' + layerName;
    a.textFrames.getByName('NAME').contents = displayName;
    phase = 'replace photo in ' + layerName;
    replaceRaster(a.groupItems.getByName(photoGroupName), fileName, box);
    log.push(layerName + '=' + displayName);
  }
  try {
    setActor('ACTOR_01', 'PHOTO', 'ian', '1.Ian（Host）.png', {left:-4744.2344405313, top:-1036.31924751026, width:603.072, height:830.592});
    // Per-photo focus offsets align the subject with the center of each narrow clipping frame.
    setActor('ACTOR_02', 'PHOTO', 'kent', '2.Kent.png', {left:-4443.57415318646, top:-908.9821743484, width:613.90100024364, height:845.53813066393});
    setActor('ACTOR_03', 'PHTOTO', 'chin wang', '3.ChinWang.png', {left:-4152.25561702096, top:-800.546313664823, width:594.44788836028, height:818.76164954817});
    setActor('ACTOR_04', 'PHOTO', 'caleb', '4.Caleb.png', {left:-3769.38851309068, top:-661.40759746278, width:602.928, height:830.448});

    // ACTOR_03 originally used a Chinese-name style. Replace it with the
    // English stamped-label style from ACTOR_02, then fit it to slot 3.
    phase = 'apply English label style to ACTOR_03';
    var actor2Name = getLayer('ACTOR_02').textFrames.getByName('NAME');
    var actor3Layer = getLayer('ACTOR_03');
    var actor3OldName = actor3Layer.textFrames.getByName('NAME');
    var actor3NameTop = actor3OldName.top;
    var actor3NewName = actor2Name.duplicate(actor3Layer, ElementPlacement.PLACEATBEGINNING);
    actor3NewName.name = 'NAME';
    actor3NewName.contents = 'chin wang';
    if (actor3NewName.width > 260) {
      var actor3Ratio = 260 / actor3NewName.width;
      actor3NewName.textRange.characterAttributes.size = actor3NewName.textRange.characterAttributes.size * actor3Ratio;
    }
    actor3NewName.left = -3855.73203257314 - actor3NewName.width / 2;
    actor3NewName.top = actor3NameTop - 18;
    actor3OldName.remove();

    phase = 'unlock date/time layer';
    var dateLayer = getLayer('日期/时间/主持人标签'); unlock(dateLayer);
    // EVENT DATE contains AUG, 8 and sat. as its text frames; identify them by original content.
    var dateGroup = dateLayer.groupItems.getByName('EVENT DATE');
    for (var i = 0; i < dateGroup.textFrames.length; i++) {
      var t = dateGroup.textFrames[i];
      if (t.contents === '8') t.contents = '15';
      if (t.contents === 'sat.') t.contents = 'sat.';
      if (t.contents === 'AUG') t.contents = 'AUG';
    }
    var monthText = null, numberText = null, satText = null;
    for (var di = 0; di < dateGroup.textFrames.length; di++) {
      if (dateGroup.textFrames[di].contents === 'AUG') monthText = dateGroup.textFrames[di];
      if (dateGroup.textFrames[di].contents === '15') numberText = dateGroup.textFrames[di];
      if (dateGroup.textFrames[di].contents === 'sat.') satText = dateGroup.textFrames[di];
    }
    if (monthText && numberText && satText) {
      // Keep a double-digit day close to the master's original single-digit footprint.
      numberText.textRange.characterAttributes.horizontalScale = 75;
      numberText.left = monthText.left + monthText.width + 20;
      satText.contents = 'sat.';
      satText.left = -3674.822265625;
    }
    dateLayer.textFrames.getByName('EVENT TIME').contents = '19:30-21:00';

    phase = 'get ACTOR_05';
    var a5 = getLayer('ACTOR_05');
    phase = 'unlock ACTOR_05 contents';
    unlock(a5);
    phase = 'activate ACTOR_05';
    d.activeLayer = a5;
    phase = 'change name in ACTOR_05';
    a5.textFrames.getByName('NAME：secret guest').contents = 'jorge';
    phase = 'hide secret guest silhouette';
    a5.groupItems.getByName('剪影').hidden = true;
    phase = 'remove previous ACTOR_05 PHOTO test group';
    for (var gi = a5.groupItems.length - 1; gi >= 0; gi--) {
      if (a5.groupItems[gi].name === 'PHOTO') a5.groupItems[gi].remove();
    }
    // Build the fifth photo using the black panel as the exact crop shape.
    phase = 'find ACTOR_05 black panel';
    var board = a5.groupItems.getByName('黑色背板');
    var panel = board.pathItems[0];
    phase = 'duplicate ACTOR_05 crop path';
    var panelCopy = panel.duplicate();
    phase = 'create ACTOR_05 PHOTO group';
    var g = a5.groupItems.add(); g.name = 'PHOTO';
    phase = 'move ACTOR_05 crop path';
    panelCopy.move(g, ElementPlacement.PLACEATBEGINNING); panelCopy.clipping = true;
    phase = 'place Jorge inside ACTOR_05 PHOTO';
    var p5 = g.placedItems.add(); p5.file = new File(base + '5.Jorge.png');
    var pb = panelCopy.geometricBounds;
    phase = 'position Jorge in ACTOR_05';
    var panelW = pb[2] - pb[0];
    var panelH = pb[1] - pb[3];
    var sourceRatio = p5.width / p5.height;
    p5.height = panelH;
    p5.width = panelH * sourceRatio;
    p5.left = pb[0] + (panelW - p5.width) / 2;
    p5.top = pb[1];
    phase = 'embed Jorge in ACTOR_05';
    p5.embed();
    panelCopy.zOrder(ZOrderMethod.BRINGTOFRONT);
    g.clipped = true;
    phase = 'order ACTOR_05 PHOTO above black panel';
    g.move(board, ElementPlacement.PLACEBEFORE);
    log.push('ACTOR_05=jorge (new PHOTO group)');
    alert('Update applied to the open copy. Please inspect the poster before saving.\n' + log.join('\n'));
  } catch (e) {
    alert('No save was made. Update stopped at [' + phase + ']: ' + e.message);
  }
}());
