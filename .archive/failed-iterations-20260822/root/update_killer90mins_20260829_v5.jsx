#target illustrator
// Versioned updater for the 2026-08-29 Killer90mins poster.
// V5: always starts from the untouched 20260819 v3 master; preserves each
// slot's name-tag transform; switches ACTOR_05 via its actual Layer/Group tree.
(function () {
  var runProbe = new File('/tmp/k90_v4_started.txt');
  try { runProbe.open('w'); runProbe.write('started'); runProbe.close(); } catch (probeError) {}
  if (app.documents.length === 0) { alert('No Illustrator document is open.'); return; }

  var PT_PER_MM = 72 / 25.4;
  var HEAD_GAP = 12 * PT_PER_MM;
  var root = '/Users/aaaa/Documents/GitHub/spicy海报';
  var masterAI = new File(root + '/killer90mins_20260819/killer90mins_v3.ai');
  if (!masterAI.exists) { alert('Missing master: ' + masterAI.fsName); return; }
  var outputDir = new Folder(root + '/killer90mins_20260829');
  if (!outputDir.exists) outputDir.create();
  var outputAI = new File(outputDir.fsName + '/killer90mins_v5.ai');
  var outputPNG = new File(outputDir.fsName + '/killer90mins_v5.png');
  var calibrationLog = new File(outputDir.fsName + '/killer90mins_v5_calibration.txt');

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
    try { if (container.name === name) return container; } catch (e0) {}
    try {
      for (var l = 0; l < container.layers.length; l++) {
        var childLayer = container.layers[l];
        if (childLayer.name === name) return childLayer;
        var insideLayer = findNamedItem(childLayer, name);
        if (insideLayer) return insideLayer;
      }
    } catch (e1) {}
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
    try { if (container.name === name) out.push(container); } catch (e0) {}
    try {
      for (var l = 0; l < container.layers.length; l++) {
        findAllNamed(container.layers[l], name, out);
      }
    } catch (e1) {}
    try {
      for (var i = 0; i < container.pageItems.length; i++) {
        var p = container.pageItems[i];
        if (p.name === name) out.push(p);
        findAllNamed(p, name, out);
      }
    } catch (e) {}
    return out;
  }

  function removeAllNamed(container, name) {
    var items = findAllNamed(container, name, []);
    for (var i = items.length - 1; i >= 0; i--) { try { items[i].remove(); } catch (e) {} }
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

  function setTextKeepingMasterTransform(frame, value) {
    // Keep the slot-specific name-card transform from the master.  Do not
    // recenter, rotate, or vertically recalibrate the card for a new name.
    var position = [frame.left, frame.top];
    frame.contents = value;
    try { frame.left = position[0]; frame.top = position[1]; } catch (e) {}
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

  function styleChineseName(frame) {
    // The 0805 reference uses white Chinese text directly on the black panel:
    // no added white plate. The font ships in the 20260819/Fonts package.
    var font = app.textFonts.getByName('GenEiKiwamiGo-Ultra');
    frame.textRange.characterAttributes.textFont = font;
    frame.textRange.characterAttributes.fillColor = whiteColor();
  }

  function setShown(item, shown) {
    try {
      if (item.typename === 'Layer') item.visible = shown;
      else item.hidden = !shown;
    } catch (e) {}
    try { for (var l = 0; l < item.layers.length; l++) setShown(item.layers[l], shown); } catch (e2) {}
    try { for (var i = 0; i < item.pageItems.length; i++) setShown(item.pageItems[i], shown); } catch (e3) {}
  }

  function collectPlaced(container, out) {
    out = out || [];
    try { for (var l = 0; l < container.layers.length; l++) collectPlaced(container.layers[l], out); } catch (e0) {}
    try {
      for (var i = 0; i < container.pageItems.length; i++) {
        var p = container.pageItems[i];
        if (p.typename === 'PlacedItem') out.push(p);
        collectPlaced(p, out);
      }
    } catch (e) {}
    return out;
  }

  function findGuestLabel(layer) {
    var exactNamed = findAllNamed(layer, 'NAME：secret guest', []);
    if (exactNamed.length) return exactNamed[0];
    var namedLabel = findAllNamed(layer, 'SECRET GUEST 姓名牌', []);
    if (namedLabel.length) return namedLabel[0];
    try {
      var exact = layer.textFrames.getByName('NAME：secret guest');
      if (exact) return exact;
    } catch (e) {}
    try {
      var exact2 = layer.textFrames.getByName('SECRET GUEST 姓名牌');
      if (exact2) return exact2;
    } catch (e2) {}
    try {
      for (var i = 0; i < layer.textFrames.length; i++) {
        var tf = layer.textFrames[i];
        var probe = String(tf.name || '') + ' ' + String(tf.contents || '');
        if (/secret|guest|jorge/i.test(probe)) return tf;
      }
    } catch (e3) {}
    return null;
  }

  function setSecretGuestState(layer) {
    unlock(layer);
    var guestModes = findAllNamed(layer, 'SECRET_GUEST_MODE', []);
    var photoModes = findAllNamed(layer, 'PHOTO_MODE', []);
    var silhouettes = findAllNamed(layer, '剪影', []);
    var boards = findAllNamed(layer, '黑色背板', []);
    if (!guestModes.length || !silhouettes.length || !boards.length) {
      throw new Error('ACTOR_05 secret-guest contract incomplete: guest=' + guestModes.length + ', silhouette=' + silhouettes.length + ', blackPanel=' + boards.length);
    }
    for (var i = 0; i < guestModes.length; i++) setShown(guestModes[i], true);
    for (var j = 0; j < photoModes.length; j++) setShown(photoModes[j], false);
    for (var k = 0; k < silhouettes.length; k++) setShown(silhouettes[k], true);
    for (var m = 0; m < boards.length; m++) setShown(boards[m], true);
    var placedPhotos = collectPlaced(layer, []);
    for (var n = 0; n < placedPhotos.length; n++) setShown(placedPhotos[n], false);
    var label = findGuestLabel(layer);
    if (!label) throw new Error('ACTOR_05 secret-guest name tag is missing');
    label.contents = 'SECRET\nGUEST';
    try { layer.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e2) {}
    var photoIsVisible = false;
    if (photoModes.length) {
      try { photoIsVisible = photoModes[0].typename === 'Layer' ? photoModes[0].visible : !photoModes[0].hidden; } catch (e3) {}
    }
    if (photoIsVisible || guestModes[0].hidden || silhouettes[0].hidden || boards[0].hidden) {
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
    calibrationLog.write('output=killer90mins_v5\n');
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
    // Never continue from a partial v2/v3/v4 working copy. Start clean.
    var d = app.open(masterAI);
    var saveOptions = new IllustratorSaveOptions();
    saveOptions.pdfCompatible = true;
    d.saveAs(outputAI, saveOptions);

    for (var i = 0; i < actorConfigs.length; i++) {
      var cfg = actorConfigs[i];
      var layer = d.layers.getByName(cfg.layer);
      unlock(layer);
      var nameFrame = getText(layer, 'NAME');
      setTextKeepingMasterTransform(nameFrame, cfg.name);
      if (cfg.layer === 'ACTOR_04') styleChineseName(nameFrame);
      replaceAndPlace(cfg);
      if (cfg.layer === 'ACTOR_04') removeAllNamed(layer, 'K90_NAME_PLATE_V3');
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
    var done = new File(outputDir.fsName + '/killer90mins_v5_done.txt');
    done.encoding = 'UTF-8'; done.open('w'); done.write('OK\nAI=' + outputAI.fsName + '\nPNG=' + outputPNG.fsName); done.close();
  } catch (e7) {
    var err = new File(outputDir.fsName + '/killer90mins_v5_error.txt');
    err.encoding = 'UTF-8'; err.open('w'); err.write(String(e7) + '\n' + e7.message); err.close();
  }
}());
