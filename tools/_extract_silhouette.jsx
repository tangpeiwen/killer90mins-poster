#target illustrator
// 由 tools/extract_silhouette.py 生成，勿手改。
(function(){
 var status=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_v2_extract_status.txt");
 function fin(m){try{status.encoding="UTF-8";status.open("w");status.writeln(m);status.close();}catch(e){}}
 var dSrc=null, dOut=null, prevUI=null, saved=[];
 function unlockAll(doc,tag){
  function walk(ls){ for(var i=0;i<ls.length;i++){ var L=ls[i];
    saved[saved.length]={doc:tag,layer:L,locked:L.locked,visible:L.visible};
    try{L.locked=false;}catch(e){} try{L.visible=true;}catch(e2){}
    if(L.layers.length) walk(L.layers); } }
  walk(doc.layers);
 }
 function restoreAll(){
  for(var i=saved.length-1;i>=0;i--){
   try{ saved[i].layer.visible=saved[i].visible; }catch(e){}
   try{ saved[i].layer.locked=saved[i].locked; }catch(e2){}
  }
 }
 try{
  try{ prevUI=app.userInteractionLevel; app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS; }catch(e0){}
  dSrc=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_20260905.ai"));
  var silSrc=dSrc.layers.getByName("ACTOR_04").groupItems.getByName("SECRET_GUEST_MODE").groupItems.getByName("\u526A\u5F71");
  var cs=null;
  for(var i=0;i<silSrc.pathItems.length;i++){ if(silSrc.pathItems[i].clipping){ cs=silSrc.pathItems[i]; break; } }
  if(!cs) throw new Error("\u6765\u6e90\u526a\u5f71\u91cc\u6ca1\u6709\u88c1\u5207\u8def\u5f84");
  var want=[
    [-3687.0900,-701.3500],
    [-3687.0900,-1443.9100],
    [-3392.5900,-1339.8600],
    [-3392.5900,-597.3100],
  ];
  if(cs.pathPoints.length!==want.length) throw new Error("\u6765\u6e90\u88c1\u5207\u8def\u5f84\u70b9\u6570="+cs.pathPoints.length);
  for(var q=0;q<want.length;q++){
   var an=cs.pathPoints[q].anchor;
   if(Math.abs(an[0]-want[q][0])>0.05||Math.abs(an[1]-want[q][1])>0.05)
     throw new Error("\u6765\u6e90\u88c1\u5207\u677f\u4e0d\u662f\u672c\u683c\u7684\uff1a\u70b9"+q+" ["+an[0].toFixed(2)+","+an[1].toFixed(2)+"]");
  }
  dOut=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_slot4secret.ai"));
  dOut.saveAs(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_v2.ai"), new IllustratorSaveOptions());
  unlockAll(dSrc,"src"); unlockAll(dOut,"out");
  var sgmOut=dOut.layers.getByName("ACTOR_04").groupItems.getByName("SECRET_GUEST_MODE");
  var sgmWasHidden=sgmOut.hidden;
  sgmOut.hidden=false;   // 隐藏的组同样不能改，先显出来，最后还原
  var oldSil=sgmOut.groupItems.getByName("\u526A\u5F71");
  var oldGb=oldSil.geometricBounds;
  var newSil=silSrc.duplicate(sgmOut, ElementPlacement.PLACEATEND);
  oldSil.remove();
  newSil.name="\u526A\u5F71";
  newSil.hidden=false;
  function bb(b){return "["+b[0].toFixed(3)+","+b[1].toFixed(3)+","+b[2].toFixed(3)+","+b[3].toFixed(3)+"]";}
  var chk=null;
  for(var j=0;j<newSil.pathItems.length;j++){ if(newSil.pathItems[j].clipping){ chk=newSil.pathItems[j]; break; } }
  var pts=[];
  if(chk){ for(var k=0;k<chk.pathPoints.length;k++){var b2=chk.pathPoints[k].anchor;pts.push("["+b2[0].toFixed(2)+","+b2[1].toFixed(2)+"]");} }
  var lines=[];
  lines.push("slot=ACTOR_04");
  lines.push("out="+dOut.name);
  lines.push("old_sil_gb="+bb(oldGb));
  lines.push("new_sil_gb="+bb(newSil.geometricBounds));
  lines.push("new_clip_anchors="+pts.join(" "));
  lines.push("SGM_children="+sgmOut.pageItems.length);
  var nm=[]; for(var m=0;m<sgmOut.pageItems.length;m++) nm.push(sgmOut.pageItems[m].typename+":"+sgmOut.pageItems[m].name);
  lines.push("SGM_list="+nm.join(" | "));
  sgmOut.hidden=sgmWasHidden;   // 还原母版的默认状态（照片模式可见、剪影隐藏）
  restoreAll();
  lines.push("SGM_hidden="+sgmOut.hidden+" (restored)");
  lines.push("layers_restored="+saved.length);
  dOut.save();
  fin("OK\n"+lines.join("\n"));
  dOut.close(SaveOptions.SAVECHANGES);
  dSrc.close(SaveOptions.DONOTSAVECHANGES);
 }catch(err){ try{restoreAll();}catch(e9){} fin("ERR "+err.message);
   try{if(dOut)dOut.close(SaveOptions.DONOTSAVECHANGES);}catch(e){}
   try{if(dSrc)dSrc.close(SaveOptions.DONOTSAVECHANGES);}catch(e2){} }
 try{ if(prevUI!==null) app.userInteractionLevel=prevUI; }catch(e3){}
})();
