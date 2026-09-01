#target illustrator
// V10: apply the 20260819/v3 ACTOR_04 Caleb portrait treatment to all actors.
// Run with killer90mins_v8.ai open. It changes placed portraits only.
(function(){
  if(app.documents.length===0){alert('Open killer90mins_v8.ai first.');return;}
  var d=app.activeDocument,root='/Users/aaaa/Documents/GitHub/spicy海报';
  var output=new File(root+'/killer90mins_20260829/killer90mins_v10.ai');
  var pngOutput=new File(root+'/killer90mins_20260829/killer90mins_v10.png');
  var report=new File(root+'/killer90mins_20260829/killer90mins_v10_portrait_calibration.txt');
  var GAP=12*72/25.4;
  // Exact master Caleb placed-image height measured from v3 ACTOR_04.
  var MASTER_HEIGHT=748.989560360786;
  // faceX is the visible face/head centre; hairTop is the visible top of hair.
  var cast=[
    {layer:'ACTOR_01',photo:'PHOTO', ratio:2756/3796, faceX:0.518,     hairTop:173/3796,  label:'CASPER'},
    {layer:'ACTOR_02',photo:'PHOTO', ratio:2756/3796, faceX:0.406023,  hairTop:399/3796,  label:'CALEB'},
    {layer:'ACTOR_03',photo:'PHTOTO',ratio:318/379,   faceX:0.580,     hairTop:0.037,      label:'AYIN'},
    {layer:'ACTOR_04',photo:'PHOTO', ratio:5430/7479,faceX:0.4105,    hairTop:798/7479,   label:'凌 浩'}
  ];
  function fail(s){throw new Error(s);}
  function clipIn(x){try{for(var i=0;i<x.pathItems.length;i++)if(x.pathItems[i].clipping)return x.pathItems[i];}catch(e){}try{for(var j=0;j<x.groupItems.length;j++){var z=clipIn(x.groupItems[j]);if(z)return z;}}catch(e2){}return null;}
  function placedIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=placedIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  try{
    if(d.name!=='killer90mins_v8.ai')fail('Open killer90mins_v8.ai, then run V10.');
    d.saveAs(output,new IllustratorSaveOptions());
    report.encoding='UTF-8';report.open('w');
    report.writeln('reference=killer90mins_20260819/killer90mins_v3.ai / ACTOR_04 Caleb');
    report.writeln('portrait_height_pt='+MASTER_HEIGHT+' (same visual treatment for all four)');
    report.writeln('namecards=unchanged; black panels=unchanged');
    for(var i=0;i<cast.length;i++){
      var c=cast[i], layer=d.layers.getByName(c.layer), tag=layer.textFrames.getByName('NAME'), group=layer.groupItems.getByName(c.photo), clip=clipIn(group), placed=placedIn(group);
      if(!clip||!placed)fail(c.layer+' portrait frame is incomplete.');
      // Keep natural proportions, with the Caleb master scale as the shared base.
      placed.height=MASTER_HEIGHT; placed.width=MASTER_HEIGHT*c.ratio;
      var tagB=tag.visibleBounds, headTarget=tagB[3]-GAP, clipB=clip.geometricBounds;
      // First constraint: true visible hair top sits exactly 12 mm below tag.
      placed.top=headTarget+c.hairTop*placed.height;
      // Second constraint: visible head/face centre sits at black panel centre.
      placed.left=(clipB[0]+clipB[2])/2-c.faceX*placed.width;
      var actual=tagB[3]-(placed.top-c.hairTop*placed.height);
      report.writeln(c.layer+' '+c.label+' width_pt='+placed.width+' height_pt='+placed.height+' hair_gap_mm='+(actual*25.4/72)+' faceX='+c.faceX);
    }
    report.close();d.save();
    var ex=new ExportOptionsPNG24();ex.antiAliasing=true;ex.transparency=false;ex.artBoardClipping=true;ex.horizontalScale=416.6667;ex.verticalScale=416.6667;d.exportFile(pngOutput,ExportType.PNG24,ex);
    alert('Done: killer90mins_v10.ai/png');
  }catch(e){try{if(report.open('w')){report.write('ERROR: '+e.message);report.close();}}catch(e2){}alert('Portrait calibration stopped: '+e.message);}
}());
