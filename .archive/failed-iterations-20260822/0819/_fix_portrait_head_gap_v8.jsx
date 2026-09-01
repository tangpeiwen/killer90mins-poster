#target illustrator
// V8 is a portrait-only correction for the V7 working copy.
// It deliberately leaves every namecard and all static master artwork untouched.
(function () {
  if (app.documents.length === 0) { alert('Open killer90mins_v7.ai first.'); return; }
  var d=app.activeDocument, root='/Users/aaaa/Documents/GitHub/spicy海报';
  var output=new File(root+'/killer90mins_20260829/killer90mins_v8.ai');
  var pngOut=new File(root+'/killer90mins_20260829/killer90mins_v8.png');
  var logOut=new File(root+'/killer90mins_20260829/killer90mins_v8_spacing.txt');
  var gap=12*72/25.4;
  // These are visible head/hair tops in the supplied image—not face detector boxes.
  var cfg=[
    {layer:'ACTOR_01',photo:'PHOTO', headTop:173/3796}, // CASPER: top of hair
    {layer:'ACTOR_02',photo:'PHOTO', headTop:399/3796}, // Caleb: top of hair
    {layer:'ACTOR_03',photo:'PHTOTO',headTop:0.037},    // Ayin: visual top of hair on opaque source
    {layer:'ACTOR_04',photo:'PHOTO', headTop:798/7479}  // 凌浩: top of hair
  ];
  function fail(s){throw new Error(s);}
  function clipIn(x){try{for(var i=0;i<x.pathItems.length;i++)if(x.pathItems[i].clipping)return x.pathItems[i];}catch(e){}try{for(var j=0;j<x.groupItems.length;j++){var z=clipIn(x.groupItems[j]);if(z)return z;}}catch(e2){}return null;}
  function placedIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=placedIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  try {
    if(d.name!=='killer90mins_v7.ai') fail('Open killer90mins_v7.ai—not the master or an older output—then run V8.');
    d.saveAs(output,new IllustratorSaveOptions());
    logOut.encoding='UTF-8'; logOut.open('w'); logOut.writeln('v8 uses the visible top of hair/hat, not facial-detection bounds.');
    for(var n=0;n<cfg.length;n++){
      var c=cfg[n],l=d.layers.getByName(c.layer),f=l.textFrames.getByName('NAME'),g=l.groupItems.getByName(c.photo),p=placedIn(g);
      if(!p) fail(c.layer+' has no placed portrait.');
      var card=f.visibleBounds, targetHeadTop=card[3]-gap;
      // Change only the portrait vertical translation; preserve card and image scale.
      p.top=targetHeadTop+c.headTop*p.height;
      var verified=(card[3]-(p.top-c.headTop*p.height));
      logOut.writeln(c.layer+' visible_head_top='+c.headTop+' verified_gap_pt='+verified+' verified_gap_mm='+(verified*25.4/72));
    }
    logOut.close(); d.save();
    var png=new ExportOptionsPNG24(); png.antiAliasing=true; png.transparency=false; png.artBoardClipping=true; png.horizontalScale=416.6667; png.verticalScale=416.6667;
    d.exportFile(pngOut,ExportType.PNG24,png);
    alert('Done: killer90mins_v8.ai and killer90mins_v8.png');
  } catch(e) {
    try{if(logOut.open('w')){logOut.write('ERROR: '+e.message);logOut.close();}}catch(e2){}
    alert('Portrait correction stopped: '+e.message);
  }
}());
