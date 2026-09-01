#target illustrator
// V9: Caleb-only correction, measured directly from 20260819/v3 ACTOR_04.
// Run with killer90mins_v8.ai open. Namecard and black panel are read-only.
(function(){
  if(app.documents.length===0){alert('Open killer90mins_v8.ai first.');return;}
  var d=app.activeDocument,root='/Users/aaaa/Documents/GitHub/spicy海报';
  var out=new File(root+'/killer90mins_20260829/killer90mins_v9.ai');
  var pngOut=new File(root+'/killer90mins_20260829/killer90mins_v9.png');
  var report=new File(root+'/killer90mins_20260829/killer90mins_v9_caleb.txt');
  var GAP=12*72/25.4;
  // Direct measurements from v3 ACTOR_04 / PHOTO placed image.
  var MASTER_WIDTH=543.78694108386, MASTER_HEIGHT=748.989560360786;
  // Face centre and visible-hair top in 0829 Killer/2.Caleb.png.
  var FACE_X=0.4060232221, HAIR_TOP=399/3796;
  function fail(s){throw new Error(s);}
  function placedIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=placedIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  try{
    if(d.name!=='killer90mins_v8.ai')fail('Open killer90mins_v8.ai, then run V9.');
    var l=d.layers.getByName('ACTOR_02'),tag=l.textFrames.getByName('NAME'),photo=l.groupItems.getByName('PHOTO'),p=placedIn(photo);
    if(!p)fail('ACTOR_02 has no placed Caleb portrait.');
    d.saveAs(out,new IllustratorSaveOptions());
    // Keep aspect ratio and use the exact master Caleb image scale.
    p.width=MASTER_WIDTH;p.height=MASTER_HEIGHT;
    var tagBounds=tag.visibleBounds, targetHairTop=tagBounds[3]-GAP;
    p.top=targetHairTop+HAIR_TOP*p.height;
    // Centre the detected face/head centre on the fixed black-panel centre.
    var clip=photo.pathItems[0].geometricBounds, panelCentre=(clip[0]+clip[2])/2;
    p.left=panelCentre-FACE_X*p.width;
    var verifiedGap=tagBounds[3]-(p.top-HAIR_TOP*p.height);
    report.encoding='UTF-8';report.open('w');
    report.writeln('source_reference=killer90mins_20260819/killer90mins_v3.ai / ACTOR_04 Caleb');
    report.writeln('master_photo_width_pt='+MASTER_WIDTH+' height_pt='+MASTER_HEIGHT);
    report.writeln('namecard=unchanged');
    report.writeln('hair_to_tag_gap_pt='+verifiedGap+'; mm='+(verifiedGap*25.4/72));
    report.writeln('face_x='+FACE_X+'; panel_center_x='+panelCentre);report.close();
    d.save();
    var ex=new ExportOptionsPNG24();ex.antiAliasing=true;ex.transparency=false;ex.artBoardClipping=true;ex.horizontalScale=416.6667;ex.verticalScale=416.6667;d.exportFile(pngOut,ExportType.PNG24,ex);
    alert('Done: killer90mins_v9.ai/png');
  }catch(e){try{if(report.open('w')){report.write('ERROR: '+e.message);report.close();}}catch(e2){}alert('Caleb calibration stopped: '+e.message);}
}());
