#target illustrator
// Versioned updater for the 2026-08-29 Killer90mins poster.
// Source master is never overwritten: the document is first saved as outputAI.
(function () {
  if (app.documents.length === 0) { alert('No Illustrator document is open.'); return; }

  var d = app.activeDocument;
  var PT_PER_MM = 72 / 25.4;
  var HEAD_GAP = 12 * PT_PER_MM;
  var root = '/Users/aaaa/Documents/GitHub/spicy海报';
  var outputDir = new Folder(root + '/killer90mins_20260829');
  if (!outputDir.exists) outputDir.create();
  var outputAI = new File(outputDir.fsName + '/killer90mins_v1.ai');
  var outputPNG = new File(outputDir.fsName + '/killer90mins_v1.png');
  var calibrationLog = new File(outputDir.fsName + '/killer90mins_v1_calibration.txt');

  var actorConfigs = [
    { layer: 'ACTOR_01', photo: 'PHOTO', name: 'casper', file: root + '/0829 Killer/1.CASPER.png', ratio: 2756 / 3796, heightFactor: 1.057, visibleTop: 0.020, focalX: 0.526 },
    { layer: 'ACTOR_02', photo: 'PHOTO', name: 'caleb',  file: root + '/0829 Killer/2.Caleb.png',  ratio: 2756 / 3796, heightFactor: 0.991, visibleTop: 0.050, focalX: 0.544 },
    { layer: 'ACTOR_03', photo: 'PHTOTO', name: 'ayin',   file: root + '/0829 Killer/3.Ayin.png',   ratio: 318 / 379,     heightFactor: 0.922, visibleTop: 0.020, focalX: 0.535 },
    { layer: 'ACTOR_04', photo: 'PHOTO', name: '凌浩',    file: root + '/0829 Killer/4.凌浩.png',   ratio: 5430 / 7479,  heightFactor: 0.900, visibleTop: 0.027, focalX: 0.497 }
  ];

  function unlock(item) {
    try { item.locked = false; } catch (e) {}
    try { for (var i = 0; i < item.pageItems.length; i++) unlock(item.pageItems[i]); } catch (e2) {}
  }

  function getText(layer, preferred) {
    try { return layer.textFrames.getByName(preferred); } catch (e) {}
    if (layer.textFrames.length) return layer.textFrames[0];
    throw new Error('Missing text object ' + preferred + ' in ' + layer.name);
  }

  function getGroup(layer, name) {
    try { return layer.groupItems.getByName(name); } catch (e) { throw new Error('Missing group ' + name + ' in ' + layer.name); }
  }

  function firstPlaced(container) {
    try { if (container.placedItems.length) return container.placedItems[0]; } catch (e) {}
    try {
      for (var i = 0; i < container.pageItems.length; i++) {
        var p = container.pageItems[i];
        if (p.typename === 'PlacedItem') return p;
        if (p.typename === 'GroupItem') { var found = firstPlaced(p); if (found) return found; }
      }
    } catch (e2) {}
    return null;
  }

  function clippingPath(container) {
    try {
      for (var i = 0; i < container.pathItems.length; i++) if (container.pathItems[i].clipping) return container.pathItems[i];
    } catch (e) {}
    try {
      for (var j = 0; j < container.groupItems.length; j++) {
        var found = clippingPath(container.groupItems[j]);
        if (found) return found;
      }
    } catch (e2) {}
    return null;
  }

  function setTextPreservingAnchor(frame, value) {
    var cx = frame.left + frame.width / 2;
    var top = frame.top;
    frame.contents = value;
    try { frame.left = cx - frame.width / 2; frame.top = top; } catch (e) {}
  }

  function replaceAndPlace(cfg) {
    var layer = d.layers.getByName(cfg.layer);
    unlock(layer);
    var group = getGroup(layer, cfg.photo);
    var clip = clippingPath(group);
    var placed = firstPlaced(group);
    if (!clip || !placed) throw new Error('Photo geometry missing in ' + cfg.layer);
    var f = new File(cfg.file);
    if (!f.exists) throw new Error('Actor file missing: ' + cfg.file);

    // Reuse the existing linked image object and clipping path.
    placed.file = f;
    var b = clip.geometricBounds;
    var clipLeft = b[0], clipTop = b[1], clipRight = b[2], clipBottom = b[3];
    var clipW = clipRight - clipLeft, clipH = clipTop - clipBottom;
    var targetH = clipH * cfg.heightFactor;
    var targetW = targetH * cfg.ratio;
    placed.width = targetW;
    placed.height = targetH;

    // Align the visible head to the slot-specific name-tag calibration.
    var name = getText(layer, 'NAME');
    var nameBounds = name.geometricBounds;
    var desiredHeadTop = nameBounds[3] - HEAD_GAP;
    placed.top = desiredHeadTop + cfg.visibleTop * targetH;
    var targetCenterX = clipLeft + clipW / 2;
    placed.left = targetCenterX - cfg.focalX * targetW;
    try { placed.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}
    name.note = 'K90_CAL_20260829_V1; head_gap_mm=12; photo=' + cfg.file + '; height_factor=' + cfg.heightFactor + '; focal_x=' + cfg.focalX + '; visible_top=' + cfg.visibleTop;
  }

  function setFont(frame, fontName) {
    try { frame.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName); } catch (e) {}
  }

  function updateDateAndTime() {
    var info = d.layers.getByName('日期/时间/主持人标签');
    unlock(info);
    var month = info.textFrames.getByName('MONTH');
    var day = info.textFrames.getByName('DAY');
    var weekday = info.textFrames.getByName('WEEKDAY');
    var time = info.textFrames.getByName('EVENT TIME');
    var rightEdge = weekday.left + weekday.width;
    var gapMonthDay = 13;
    var gapDayWeekday = 7;
    var monthTop = month.top, dayTop = day.top, weekdayTop = weekday.top;
    month.contents = 'AUG';
    day.contents = '29';
    weekday.contents = 'sat.';
    time.contents = '19:30-21:00';
    weekday.left = rightEdge - weekday.width;
    day.left = weekday.left - gapDayWeekday - day.width;
    month.left = day.left - gapMonthDay - month.width;
    month.top = monthTop; day.top = dayTop; weekday.top = weekdayTop;
  }

  function writeCalibration() {
    calibrationLog.encoding = 'UTF-8';
    calibrationLog.open('w');
    calibrationLog.write('template=killer90mins_20260819/killer90mins_v3.ai\n');
    calibrationLog.write('output=killer90mins_v1\n');
    calibrationLog.write('event=2026-08-29 19:30-21:00\n');
    calibrationLog.write('actor_05_mode=SECRET_GUEST\n');
    calibrationLog.write('head_gap_target_mm=12\n');
    for (var i = 0; i < actorConfigs.length; i++) {
      var c = actorConfigs[i];
      calibrationLog.write(c.layer + ' photo=' + c.file + ' height_factor=' + c.heightFactor + ' focal_x=' + c.focalX + ' visible_top=' + c.visibleTop + '\n');
    }
    calibrationLog.close();
  }

  try {
    var saveOptions = new IllustratorSaveOptions();
    saveOptions.pdfCompatible = true;
    d.saveAs(outputAI, saveOptions);

    for (var i = 0; i < actorConfigs.length; i++) {
      var cfg = actorConfigs[i];
      var layer = d.layers.getByName(cfg.layer);
      unlock(layer);
      var nameFrame = getText(layer, 'NAME');
      setTextPreservingAnchor(nameFrame, cfg.name);
      if (cfg.layer === 'ACTOR_04') setFont(nameFrame, 'AlibabaPuHuiTi_3_105_Heavy');
      replaceAndPlace(cfg);
    }

    var guestLayer = d.layers.getByName('ACTOR_05');
    unlock(guestLayer);
    var guestMode = getGroup(guestLayer, 'SECRET_GUEST_MODE');
    guestMode.visible = true;
    try { getGroup(guestLayer, 'PHOTO_MODE').visible = false; } catch (e3) {}
    try { getGroup(guestLayer, '剪影').visible = true; } catch (e4) {}
    try { getGroup(guestLayer, '黑色背板').visible = true; } catch (e5) {}
    try { guestMode.textFrames.getByName('SECRET GUEST 姓名牌').contents = 'secret\nguest'; } catch (e6) {}

    updateDateAndTime();
    writeCalibration();
    d.save();

    var pngOptions = new ExportOptionsPNG24();
    pngOptions.antiAliasing = true;
    pngOptions.transparency = false;
    pngOptions.artBoardClipping = true;
    pngOptions.horizontalScale = 416.667;
    pngOptions.verticalScale = 416.667;
    d.exportFile(outputPNG, ExportType.PNG24, pngOptions);
    alert('Updated and exported: ' + outputAI.fsName + '\n' + outputPNG.fsName);
  } catch (e7) {
    alert('Killer90mins update stopped: ' + e7.message);
  }
}());
