#target illustrator
// Adjust only the date layout in the currently open Killer90mins copy.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }
  try {
    var d = app.activeDocument;
    var l = d.layers.getByName('日期/时间/主持人标签');
    try { l.locked = false; } catch (e0) {}
    var g = l.groupItems.getByName('EVENT DATE');
    var month = null, day = null, weekday = null;
    for (var i = 0; i < g.textFrames.length; i++) {
      var t = g.textFrames[i];
      try { t.locked = false; } catch (e1) {}
      if (t.contents === 'AUG') month = t;
      if (t.contents === '15') day = t;
      if (t.contents === 'sat' || t.contents === 'sat.') weekday = t;
    }
    if (!month || !day || !weekday) throw new Error('AUG / 15 / sat. text object not found');
    day.textRange.characterAttributes.horizontalScale = 75;
    day.left = month.left + month.width + 20;
    weekday.contents = 'sat.';
    weekday.left = -3674.822265625;
    alert('Date layout adjusted. Please inspect before saving.');
  } catch (e) {
    alert('Date adjustment stopped: ' + e.message);
  }
}());
