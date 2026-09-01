#target illustrator
// Versioned updater for the 2026-08-29 Killer90mins poster.
// V3: explicit secret-guest verification, stamped Chinese name plate,
// and visible-face/head calibration for the replacement PNG portraits.
// Source master is never overwritten: the document is first saved as outputAI.
(function () {
  if (app.documents.length === 0) { alert('No Illustrator document is open.'); return; }

  var d = app.activeDocument;
  var PT_PER_MM = 72 / 25.4;
  var HEAD_GAP = 12 * PT_PER_MM;
  var root = '/Users/aaaa/Documents/GitHub/spicy海报';
  var outputDir = new Folder(root + '/killer90mins_20260829');
  if (!outputDir.exists) outputDir.create();
  var outputAI = new File(outputDir.fsName + '/killer90mins_v3.ai');
  var outputPNG = new File(outputDir.fsName + '/killer90mins_v3.png');
  var calibrationLog = new File(outputDir.fsName + '/killer90mins_v3_calibration.txt');

  var actorConfigs = [
    // focalX/headTop are measured on the visible face/head in each source PNG,
    // not on the transparent canvas. They are deliberately actor-specific.
    { layer: 'ACTOR_01', photo: 'PHOTO', name: 'CASPER', file: root + '/0829 Killer/1.CASPER.png', ratio: 2756 / 3796, heightFactor: 1.057, headTop: 0.117, focalX: 0.518, focalY: 0.260 },
    { layer: 'ACTOR_02', photo: 'PHOTO', name: 'CALEB',  file: root + '/0829 Killer/2.Caleb.png',  ratio: 2756 / 3796, heightFactor: 0.991, headTop: 0.186, focalX: 0.396, focalY: 0.292 },
    { layer: 'ACTOR_03', photo: 'PHTOTO', name: 'AYIN',   file: root + '/0829 Killer/3.Ayin.png',   ratio: 318 / 379,     heightFactor: 0.922, headTop: 0.053, focalX: 0.580, focalY: 0.178 },
    { layer: 'ACTOR_04', photo: 'PHOTO', name: '凌浩',    file: root + '/0829 Killer/4.凌浩.png',   ratio: 5430 / 7479,  heightFactor: 0.900, headTop: 0.160, focalX: 0.410, focalY: 0.281 }
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

  function findNamedItem(container, name) {
    try {
      for (var i = 0; i < container.pageItems.length; i++) {
        var p = container.pageItems[i];
        if (p.name === name) return p;
        var nested = findNamedItem(p, name);
        if (nested) return nested;
      }
    } catch (e) {}
    return null;
  }

  function findAllNamed(container, name, out) {
    out = out || [];
    try {
      for (var i = 0; i < container.pageItems.length; i++) {
        var p = container.pageItems[i];
        if (p.name === name) out.push(p);
        findAllNamed(p, name, out);
      }
    } catch (e) {}
    return out;
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
    placed.top = desiredHeadTop + cfg.headTop * targetH;
    var targetCenterX = clipLeft + clipW / 2;
    placed.left = targetCenterX - cfg.focalX * targetW;
    try { placed.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}
    name.note = 'K90_CAL_20260829_V3; head_gap_mm=12; photo=' + cfg.file + '; height_factor=' + cfg.heightFactor + '; focal_x=' + cfg.focalX + '; focal_y=' + cfg.focalY + '; head_top=' + cfg.headTop;
  }

  function setFont(frame, fontName) {
    try { frame.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName); } catch (e) {}
  }

  function blackColor() {
    var c = new RGBColor(); c.red = 0; c.green = 0; c.blue = 0; return c;
  }

  function whiteColor() {
    var c = new RGBColor(); c.red = 255; c.green = 255; c.blue = 255; return c;
  }

  function ensureWhiteStampedPlate(layer, frame, cfg) {
    // ACTOR_04 in this master has editable Chinese text but no visible
    // stamped plate. Add one editable vector behind that text only.
    if (cfg.layer !== 'ACTOR_04') return;
    var existing = findNamedItem(layer, 'K90_NAME_PLATE_V3');
    if (existing) { try { existing.hidden = false; } catch (e0) {} return; }
    var b = frame.geometricBounds;
    var padX = 7, padY = 5;
    var plate = layer.pathItems.rectangle(b[1] + padY, b[0] - padX, (b[2] - b[0]) + padX * 2, (b[1] - b[3]) + padY * 2);
    plate.name = 'K90_NAME_PLATE_V3';
    plate.filled = true; plate.fillColor = whiteColor();
    plate.stroked = true; plate.strokeColor = blackColor(); plate.strokeWidth = 1.5;
    try { plate.rotate(frame.rotation || 0); } catch (e1) {}
    try { plate.move(frame, ElementPlacement.PLACEBEFORE); } catch (e2) {
      try { plate.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e3) {}
    }
  }

  function styleChineseName(frame) {
    // This installed CJK face is closer to the stamped reference than the
    // previous Alibaba fallback.
    setFont(frame, 'GenEiKiwamiGo-Ultra');
    try { frame.textRange.characterAttributes.fillColor = blackColor(); } catch (e) {}
  }

  function setSecretGuestState(layer) {
    unlock(layer);
    var guestMode = findNamedItem(layer, 'SECRET_GUEST_MODE');
    var photoMode = findNamedItem(layer, 'PHOTO_MODE');
    var silhouette = findNamedItem(layer, '剪影');
    var board = findNamedItem(layer, '黑色背板');
    if (!guestMode || !photoMode || !silhouette || !board) {
      throw new Error('ACTOR_05 dual-state contract incomplete: SECRET_GUEST_MODE=' + !!guestMode + ', PHOTO_MODE=' + !!photoMode + ', silhouette=' + !!silhouette + ', blackPanel=' + !!board);
    }
    guestMode.hidden = false;
    photoMode.hidden = true;
    silhouette.hidden = false;
    board.hidden = false;
    var labels = findAllNamed(layer, 'NAME：secret guest');
    if (!labels.length) labels = findAllNamed(layer, 'SECRET GUEST 姓名牌');
    if (!labels.length) throw new Error('ACTOR_05 secret-guest name tag is missing');
    for (var i = 0; i < labels.length; i++) {
      try { labels[i].contents = 'secret\nguest'; } catch (e) {}
    }
    try { layer.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e2) {}
    if (!photoMode.hidden || guestMode.hidden || silhouette.hidden || board.hidden) {
      throw new Error('ACTOR_05 secret-guest visibility verification failed');
    }
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
    calibrationLog.write('output=killer90mins_v3\n');
    calibrationLog.write('event=2026-08-29 19:30-21:00\n');
    calibrationLog.write('actor_05_mode=SECRET_GUEST\n');
    calibrationLog.write('head_gap_target_mm=12\n');
    for (var i = 0; i < actorConfigs.length; i++) {
      var c = actorConfigs[i];
      calibrationLog.write(c.layer + ' photo=' + c.file + ' height_factor=' + c.heightFactor + ' focal_x=' + c.focalX + ' focal_y=' + c.focalY + ' head_top=' + c.headTop + '\n');
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
      if (cfg.layer === 'ACTOR_04') styleChineseName(nameFrame);
      replaceAndPlace(cfg);
      ensureWhiteStampedPlate(layer, nameFrame, cfg);
    }

    var guestLayer = d.layers.getByName('ACTOR_05');
    setSecretGuestState(guestLayer);

    updateDateAndTime();
    writeCalibration();
    d.save();

    var pngOptions = new ExportOptionsPNG24();
    pngOptions.antiAliasing = true;
    pngOptions.transparency = false;
    pngOptions.artBoardClipping = true;
    pngOptions.horizontalScale = 416.6667;
    pngOptions.verticalScale = 416.6667;
    d.exportFile(outputPNG, ExportType.PNG24, pngOptions);
    var done = new File(outputDir.fsName + '/killer90mins_v3_done.txt');
    done.encoding = 'UTF-8'; done.open('w'); done.write('OK\nAI=' + outputAI.fsName + '\nPNG=' + outputPNG.fsName); done.close();
  } catch (e7) {
    var err = new File(outputDir.fsName + '/killer90mins_v3_error.txt');
    err.encoding = 'UTF-8'; err.open('w'); err.write(String(e7) + '\n' + e7.message); err.close();
  }
}());
