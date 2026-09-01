#target illustrator
// Replace only ACTOR_03's Chinese-name styling with the English stamped label.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }
  try {
    var d = app.activeDocument;
    var a2 = d.layers.getByName('ACTOR_02');
    var a3 = d.layers.getByName('ACTOR_03');
    try { a2.locked = false; a3.locked = false; } catch (e0) {}
    var source = a2.textFrames.getByName('NAME');
    var oldName = a3.textFrames.getByName('NAME');
    try { source.locked = false; oldName.locked = false; } catch (e1) {}
    var targetTop = oldName.top;
    var replacement = source.duplicate(a3, ElementPlacement.PLACEATBEGINNING);
    replacement.name = 'NAME';
    replacement.contents = 'chinwang';
    if (replacement.width > 260) {
      var ratio = 260 / replacement.width;
      replacement.textRange.characterAttributes.size = replacement.textRange.characterAttributes.size * ratio;
    }
    replacement.left = -3855.73203257314 - replacement.width / 2;
    replacement.top = targetTop;
    oldName.remove();
    alert('ChinWang label style fixed. Please inspect before saving.');
  } catch (e) {
    alert('ChinWang label fix stopped: ' + e.message);
  }
}());
