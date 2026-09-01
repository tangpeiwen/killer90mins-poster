#target illustrator
(function () {
  var out = [];
  for (var i = 0; i < app.textFonts.length; i++) {
    var f = app.textFonts[i];
    if (/Alibaba|La Machine|Anton|GenEi/i.test(f.name + ' ' + f.family + ' ' + f.style)) out.push(f.name + ' | ' + f.family + ' | ' + f.style);
  }
  var file = new File(Folder.desktop.fsName + '/killer90mins-font-audit.txt');
  file.encoding = 'UTF-8'; file.open('w'); file.write(out.join('\n')); file.close();
}());
