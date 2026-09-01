#target illustrator
// 2026-08-29 Killer90mins updater, V7.
// Requires the untouched killer90mins_20260819/killer90mins_v3.ai to be open.
// Cards are master artwork: their position, rotation and scale are never changed.
(function () {
  if (app.documents.length === 0) { alert('Open killer90mins_v3.ai first.'); return; }
  var d = app.activeDocument;
  var root = '/Users/aaaa/Documents/GitHub/spicy海报';
  var masterPath = root + '/killer90mins_20260819/killer90mins_v3.ai';
  var outputDir = new Folder(root + '/killer90mins_20260829');
  var outputAI = new File(outputDir.fsName + '/killer90mins_v7.ai');
  var outputPNG = new File(outputDir.fsName + '/killer90mins_v7.png');
  var outputLog = new File(outputDir.fsName + '/killer90mins_v7_calibration.txt');
  var GAP_PT = 12 * 72 / 25.4;
  var configs = [
    {layer:'ACTOR_01', photo:'PHOTO',  name:'CASPER', file:root + '/0829 Killer/1.CASPER.png', ratio:2756/3796, height:1.057, headTop:0.117, faceX:0.518},
    {layer:'ACTOR_02', photo:'PHOTO',  name:'CALEB',  file:root + '/0829 Killer/2.Caleb.png',  ratio:2756/3796, height:0.991, headTop:0.186, faceX:0.396},
    {layer:'ACTOR_03', photo:'PHTOTO', name:'AYIN',   file:root + '/0829 Killer/3.Ayin.png',   ratio:318/379,   height:0.922, headTop:0.053, faceX:0.580},
    {layer:'ACTOR_04', photo:'PHOTO',  name:'凌 浩',  file:root + '/0829 Killer/4.凌浩.png',   ratio:5430/7479, height:0.900, headTop:0.160, faceX:0.410}
  ];

  function fail(message) { throw new Error(message); }
  function unlock(item) {
    try { item.locked = false; } catch (e) {}
    try { for (var i=0; i<item.pageItems.length; i++) unlock(item.pageItems[i]); } catch (e2) {}
    try { for (var j=0; j<item.layers.length; j++) unlock(item.layers[j]); } catch (e3) {}
  }
  function nameFrame(layer) {
    try { return layer.textFrames.getByName('NAME'); }
    catch (e) { fail(layer.name + ' has no editable NAME text object.'); }
  }
  function photoGroup(layer, id) {
    try { return layer.groupItems.getByName(id); }
    catch (e) { fail(layer.name + ' has no ' + id + ' photo group.'); }
  }
  function clipIn(item) {
    try { for (var i=0; i<item.pathItems.length; i++) if (item.pathItems[i].clipping) return item.pathItems[i]; } catch (e) {}
    try { for (var j=0; j<item.groupItems.length; j++) { var x=clipIn(item.groupItems[j]); if (x) return x; } } catch (e2) {}
    return null;
  }
  function placedIn(item) {
    try { if (item.placedItems.length) return item.placedItems[0]; } catch (e) {}
    try { for (var i=0; i<item.groupItems.length; i++) { var x=placedIn(item.groupItems[i]); if (x) return x; } } catch (e2) {}
    return null;
  }
  function white() { var c=new RGBColor(); c.red=255; c.green=255; c.blue=255; return c; }
  function updateChinese(frame) {
    // Exact font and content measured from 0805/killer90mins.ai > ACTOR_03.
    var font;
    try { font=app.textFonts.getByName('Huiwen-MinchoGBK-Regular'); }
    catch (e) { fail('Missing Huiwen-MinchoGBK-Regular, required by the 0805 凌浩 reference.'); }
    frame.textRange.characterAttributes.textFont=font;
    frame.textRange.characterAttributes.size=54.2531089782715;
    frame.textRange.characterAttributes.fillColor=white();
  }
  function updatePhoto(c) {
    var layer=d.layers.getByName(c.layer); unlock(layer);
    var frame=nameFrame(layer);
    // Do not assign left/top/rotation/width: this retains the v3 master namecard.
    frame.contents=c.name;
    if (c.layer==='ACTOR_04') updateChinese(frame);
    var group=photoGroup(layer,c.photo), clip=clipIn(group), placed=placedIn(group), file=new File(c.file);
    if (!clip || !placed) fail(c.layer + ' photo clipping geometry is incomplete.');
    if (!file.exists) fail('Missing actor image: ' + c.file);
    placed.file=file;
    var b=clip.geometricBounds, clipW=b[2]-b[0], clipH=b[1]-b[3];
    var targetH=clipH*c.height, targetW=targetH*c.ratio;
    placed.width=targetW; placed.height=targetH;
    // Use visible bounds (not raw text geometry) so the measured 12 mm begins
    // at the actual stamped card edge. The portrait, not the card, is moved.
    var card=frame.visibleBounds;
    var visibleHeadTop=card[3]-GAP_PT;
    placed.top=visibleHeadTop+c.headTop*targetH;
    placed.left=(b[0]+clipW/2)-c.faceX*targetW;
    frame.note='K90_20260829_V7 master-card-fixed; visible-head-gap=12mm; file='+c.file;
  }
  function namedAll(parent, target, out) {
    out=out||[];
    try { if (parent.name===target) out.push(parent); } catch(e) {}
    try { for(var i=0;i<parent.layers.length;i++) namedAll(parent.layers[i],target,out); } catch(e2) {}
    try { for(var j=0;j<parent.pageItems.length;j++) { var p=parent.pageItems[j]; if(p.name===target) out.push(p); namedAll(p,target,out); } } catch(e3) {}
    return out;
  }
  function show(item, yes) {
    try { if(item.typename==='Layer') item.visible=yes; else item.hidden=!yes; } catch(e) {}
    try { for(var i=0;i<item.layers.length;i++) show(item.layers[i],yes); } catch(e2) {}
    try { for(var j=0;j<item.pageItems.length;j++) show(item.pageItems[j],yes); } catch(e3) {}
  }
  function secretGuest() {
    var l=d.layers.getByName('ACTOR_05'); unlock(l);
    var secret=namedAll(l,'SECRET_GUEST_MODE',[]), photo=namedAll(l,'PHOTO_MODE',[]), silhouette=namedAll(l,'剪影',[]), board=namedAll(l,'黑色背板',[]);
    if(!secret.length || !photo.length || !silhouette.length || !board.length) fail('ACTOR_05 secret-guest structure is incomplete in v3.');
    for(var i=0;i<secret.length;i++) show(secret[i],true);
    for(var j=0;j<photo.length;j++) show(photo[j],false);
    for(var k=0;k<silhouette.length;k++) show(silhouette[k],true);
    for(var m=0;m<board.length;m++) show(board[m],true);
    var label=namedAll(l,'SECRET GUEST 姓名牌',[]); if(!label.length) label=namedAll(l,'NAME：secret guest',[]);
    if(!label.length) fail('ACTOR_05 has no Secret Guest label.');
    label[0].contents='SECRET\nGUEST';
  }
  function dateAndTime() {
    var l=d.layers.getByName('日期/时间/主持人标签'); unlock(l);
    var mo=l.textFrames.getByName('MONTH'), day=l.textFrames.getByName('DAY'), wk=l.textFrames.getByName('WEEKDAY'), time=l.textFrames.getByName('EVENT TIME');
    var right=wk.left+wk.width, moTop=mo.top, dayTop=day.top, wkTop=wk.top;
    mo.contents='AUG'; day.contents='29'; wk.contents='sat.'; time.contents='19:30-21:00';
    wk.left=right-wk.width; day.left=wk.left-7-day.width; mo.left=day.left-13-mo.width;
    mo.top=moTop; day.top=dayTop; wk.top=wkTop;
  }
  function log() {
    outputLog.encoding='UTF-8'; outputLog.open('w');
    outputLog.writeln('source=killer90mins_20260819/killer90mins_v3.ai');
    outputLog.writeln('output=killer90mins_v7.ai');
    outputLog.writeln('namecards=master transforms preserved; text only changed');
    outputLog.writeln('head-gap=12mm from visible namecard edge; portraits only moved');
    outputLog.writeln('actor_04_font=Huiwen-MinchoGBK-Regular (0805 ACTOR_03 reference)');
    outputLog.writeln('actor_05=SECRET_GUEST; PHOTO_MODE hidden'); outputLog.close();
  }
  try {
    if (d.fullName.fsName !== new File(masterPath).fsName) fail('Open the untouched v3 master first: ' + masterPath);
    if(!outputDir.exists && !outputDir.create()) fail('Cannot create output directory.');
    var save=new IllustratorSaveOptions(); save.pdfCompatible=true; d.saveAs(outputAI,save);
    for(var i=0;i<configs.length;i++) updatePhoto(configs[i]);
    secretGuest(); dateAndTime(); log(); d.save();
    var png=new ExportOptionsPNG24(); png.antiAliasing=true; png.transparency=false; png.artBoardClipping=true; png.horizontalScale=416.6667; png.verticalScale=416.6667;
    d.exportFile(outputPNG,ExportType.PNG24,png);
    alert('Done: killer90mins_v7.ai and killer90mins_v7.png');
  } catch (e) {
    var err=new File(outputDir.fsName + '/killer90mins_v7_error.txt'); err.encoding='UTF-8'; err.open('w'); err.write(String(e)+'\n'+e.message); err.close(); alert('Update stopped: ' + e.message);
  }
}());
