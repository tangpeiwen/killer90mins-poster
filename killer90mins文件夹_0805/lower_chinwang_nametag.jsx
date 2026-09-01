#target illustrator
// Move all five actor name tags down and align each one to its slot's top edge.
// Modifies the open document only; does not save.
(function () {
  if (app.documents.length === 0) { alert('No open document.'); return; }

  function unlock(item) {
    try { item.locked = false; } catch (e) {}
    try {
      for (var i = 0; i < item.pageItems.length; i++) unlock(item.pageItems[i]);
    } catch (e2) {}
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

  function topEdgeAngle(path) {
    var points = [];
    var minY = 1e20;
    var maxY = -1e20;
    for (var i = 0; i < path.pathPoints.length; i++) {
      var anchor = path.pathPoints[i].anchor;
      points.push({ x: anchor[0], y: anchor[1] });
      if (anchor[1] < minY) minY = anchor[1];
      if (anchor[1] > maxY) maxY = anchor[1];
    }

    // The masks are trapezoids. Select the leftmost and rightmost points from
    // the upper half so the label follows the visible upper border.
    var middleY = (minY + maxY) / 2;
    var upper = [];
    for (var p = 0; p < points.length; p++) {
      if (points[p].y >= middleY) upper.push(points[p]);
    }
    if (upper.length < 2) throw new Error('Cannot determine slot top edge.');

    upper.sort(function (a, b) { return a.x - b.x; });
    var left = upper[0];
    var right = upper[upper.length - 1];
    return Math.atan2(right.y - left.y, right.x - left.x) * 180 / Math.PI;
  }

  function currentAngle(item) {
    var m = item.matrix;
    return Math.atan2(m.mValueB, m.mValueA) * 180 / Math.PI;
  }

  try {
    var d = app.activeDocument;
    var marker = 'K90_ALL_NAMES_DOWN_V1';
    var photoNames = ['PHOTO', 'PHOTO', 'PHTOTO', 'PHOTO', 'PHOTO'];
    for (var actorIndex = 1; actorIndex <= 5; actorIndex++) {
      var layer = d.layers.getByName('ACTOR_0' + actorIndex);
      unlock(layer);

      var name;
      try { name = layer.textFrames.getByName('NAME'); }
      catch (e) {
        if (actorIndex === 5) {
          try { name = layer.textFrames.getByName('NAME：secret guest'); } catch (e2) {}
        }
        if (!name && layer.textFrames.length) name = layer.textFrames[0];
      }
      if (!name) throw new Error('Name tag not found in ' + layer.name + '.');

      if (name.note.indexOf(marker) === -1) {
        name.top -= 24;
        name.note = name.note ? name.note + '|' + marker : marker;
      }

      var photoGroup = layer.groupItems.getByName(photoNames[actorIndex - 1]);
      var clip = clippingPath(photoGroup);
      if (!clip) throw new Error('Clipping path not found in ' + layer.name + '.');

      var desiredAngle = topEdgeAngle(clip);
      var angleDelta = desiredAngle - currentAngle(name);
      if (Math.abs(angleDelta) > 0.05) {
        name.rotate(angleDelta, true, true, true, true, Transformation.CENTER);
      }
    }

    alert('All five name tags moved down and aligned to their slot borders. Please inspect before saving.');
  } catch (e3) {
    alert('Name-tag adjustment stopped: ' + e3.message);
  }
}());
