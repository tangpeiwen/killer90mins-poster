#target illustrator

function indent(n) {
  var s = "";
  for (var i = 0; i < n; i++) s += "  ";
  return s;
}

function itemLine(item, depth) {
  var name = item.name ? item.name : "";
  var text = "";
  try { if (item.typename === "TextFrame") text = " contents=" + item.contents; } catch (e) {}
  var bounds = "";
  try { bounds = " bounds=" + item.geometricBounds.join(","); } catch (e2) {}
  return indent(depth) + item.typename + " name=" + name + text + bounds + "\n";
}

function walkContainer(container, depth) {
  var out = "";
  if (container.layers) {
    for (var i = 0; i < container.layers.length; i++) {
      var layer = container.layers[i];
      out += indent(depth) + "LAYER " + layer.name + " visible=" + layer.visible + " locked=" + layer.locked + "\n";
      out += walkContainer(layer, depth + 1);
    }
  }
  if (container.pageItems) {
    for (var j = 0; j < container.pageItems.length; j++) {
      var item = container.pageItems[j];
      out += itemLine(item, depth);
    }
  }
  return out;
}

if (app.documents.length === 0) {
  alert("No document open");
} else {
  var report = walkContainer(app.activeDocument, 0);
  var f = new File(Folder.desktop.fsName + "/killer90mins_ai_audit.txt");
  f.encoding = "UTF-8";
  f.open("w");
  f.write(report);
  f.close();
  alert("Audit written to Desktop: killer90mins_ai_audit.txt");
}
