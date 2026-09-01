#target illustrator
// 由 tools/make_master_slot4_secret.py 生成，勿手改。
// 把 ACTOR_05 的神秘嘉宾剪影搬一份到 ACTOR_04，并换成 slot4 的裁切板。
(function(){
 var status=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_slot4secret_make_status.txt");
 function fin(m){try{status.encoding="UTF-8";status.open("w");status.writeln(m);status.close();}catch(e){}}
 var d=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260829/killer90mins_auto_20260829.ai"));
 try{
  d.saveAs(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_slot4secret.ai"), new IllustratorSaveOptions());
  var L4=d.layers.getByName("ACTOR_04");
  var L5=d.layers.getByName("ACTOR_05");
  var already=false;
  try{ L4.layers.getByName("PHOTO_MODE"); already=true; }catch(e){}
  if(already) throw new Error("ACTOR_04 \u5df2\u6709 PHOTO_MODE\uff0c\u672c\u811a\u672c\u53ea\u80fd\u8dd1\u4e00\u6b21");
  var pm=L4.layers.add(); pm.name="PHOTO_MODE";
  var nameTf=L4.textFrames.getByName("NAME");
  var photoG=null;
  try{ photoG=L4.groupItems.getByName("PHOTO"); }catch(e){ photoG=L4.groupItems.getByName("PHTOTO"); }
  nameTf.move(pm, ElementPlacement.PLACEATEND);
  photoG.move(pm, ElementPlacement.PLACEATEND);
  var sgm5=L5.groupItems.getByName("SECRET_GUEST_MODE");
  var dup=sgm5.duplicate(L4, ElementPlacement.PLACEATBEGINNING);
  dup.name="SECRET_GUEST_MODE";
  dup.translate(-315.9000, -109.8300);
  var sil=dup.groupItems.getByName("\u526A\u5F71");
  var clip=null;
  for(var i=0;i<sil.pathItems.length;i++){ if(sil.pathItems[i].clipping){ clip=sil.pathItems[i]; break; } }
  if(!clip) throw new Error("\u627e\u4e0d\u5230\u526a\u5f71\u91cc\u7684\u88c1\u5207\u8def\u5f84");
  if(clip.pathPoints.length!==4) throw new Error("\u88c1\u5207\u8def\u5f84\u4e0d\u662f4\u70b9\uff0c\u5b9e\u9645="+clip.pathPoints.length);
  clip.pathPoints[0].anchor=[-3687.0900,-701.3500];
  clip.pathPoints[0].leftDirection=[-3687.0900,-701.3500];
  clip.pathPoints[0].rightDirection=[-3687.0900,-701.3500];
  clip.pathPoints[1].anchor=[-3687.0900,-1443.9100];
  clip.pathPoints[1].leftDirection=[-3687.0900,-1443.9100];
  clip.pathPoints[1].rightDirection=[-3687.0900,-1443.9100];
  clip.pathPoints[2].anchor=[-3392.5900,-1339.8600];
  clip.pathPoints[2].leftDirection=[-3392.5900,-1339.8600];
  clip.pathPoints[2].rightDirection=[-3392.5900,-1339.8600];
  clip.pathPoints[3].anchor=[-3392.5900,-597.3100];
  clip.pathPoints[3].leftDirection=[-3392.5900,-597.3100];
  clip.pathPoints[3].rightDirection=[-3392.5900,-597.3100];
  var bd5=L5.groupItems.getByName("\u9ED1\u8272\u80CC\u677F");
  var bdup=bd5.duplicate(L4, ElementPlacement.PLACEATEND);
  bdup.name="\u9ED1\u8272\u80CC\u677F";
  bdup.translate(-315.9000, -109.8300);
  var bpath=null;
  for(var bi=0;bi<bdup.pathItems.length;bi++){ if(bdup.pathItems[bi].clipping){ bpath=bdup.pathItems[bi]; break; } }
  if(!bpath && bdup.pathItems.length===1) bpath=bdup.pathItems[0];
  if(!bpath) throw new Error("\u9ed1\u8272\u80cc\u677f\u91cc\u627e\u4e0d\u5230\u8def\u5f84");
  if(bpath.pathPoints.length!==4) throw new Error("\u80cc\u677f\u8def\u5f84\u4e0d\u662f4\u70b9\uff0c\u5b9e\u9645="+bpath.pathPoints.length);
  bpath.pathPoints[0].anchor=[-3687.0900,-701.3500];
  bpath.pathPoints[0].leftDirection=[-3687.0900,-701.3500];
  bpath.pathPoints[0].rightDirection=[-3687.0900,-701.3500];
  bpath.pathPoints[1].anchor=[-3687.0900,-1443.9100];
  bpath.pathPoints[1].leftDirection=[-3687.0900,-1443.9100];
  bpath.pathPoints[1].rightDirection=[-3687.0900,-1443.9100];
  bpath.pathPoints[2].anchor=[-3392.5900,-1339.8600];
  bpath.pathPoints[2].leftDirection=[-3392.5900,-1339.8600];
  bpath.pathPoints[2].rightDirection=[-3392.5900,-1339.8600];
  bpath.pathPoints[3].anchor=[-3392.5900,-597.3100];
  bpath.pathPoints[3].leftDirection=[-3392.5900,-597.3100];
  bpath.pathPoints[3].rightDirection=[-3392.5900,-597.3100];
  dup.hidden=true;
  pm.visible=true;
  function bb(b){return "["+b[0].toFixed(3)+","+b[1].toFixed(3)+","+b[2].toFixed(3)+","+b[3].toFixed(3)+"]";}
  var lines=[];
  lines.push("dest="+d.name);
  lines.push("ACTOR_04_sublayers="+L4.layers.length);
  lines.push("ACTOR_04_PHOTO_MODE_visible="+L4.layers.getByName("PHOTO_MODE").visible);
  lines.push("ACTOR_04_SGM_hidden="+L4.groupItems.getByName("SECRET_GUEST_MODE").hidden);
  lines.push("ACTOR_04_SGM_gb="+bb(dup.geometricBounds));
  var pts=[];for(var q=0;q<clip.pathPoints.length;q++){var an=clip.pathPoints[q].anchor;pts.push("["+an[0].toFixed(2)+","+an[1].toFixed(2)+"]");}
  lines.push("ACTOR_04_clip_anchors="+pts.join(" "));
  var t4=dup.textFrames[0];
  lines.push("ACTOR_04_SGM_name=\""+String(t4.contents).replace(/[\r\n]/g,"\\n")+"\" gb="+bb(t4.geometricBounds));
  var bpts=[];for(var bq=0;bq<bpath.pathPoints.length;bq++){var ban=bpath.pathPoints[bq].anchor;bpts.push("["+ban[0].toFixed(2)+","+ban[1].toFixed(2)+"]");}
  lines.push("ACTOR_04_board_gb="+bb(bdup.geometricBounds));
  lines.push("ACTOR_04_board_anchors="+bpts.join(" "));
  lines.push("ACTOR_05_SGM_hidden="+L5.groupItems.getByName("SECRET_GUEST_MODE").hidden);
  d.save();
  fin("OK\n"+lines.join("\n"));
  d.close(SaveOptions.SAVECHANGES);
 }catch(err){ fin("ERR "+err.message); try{d.close(SaveOptions.DONOTSAVECHANGES);}catch(e){} }
})();
