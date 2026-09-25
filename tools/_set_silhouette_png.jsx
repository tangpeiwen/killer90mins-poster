#target illustrator
// 由 tools/set_silhouette_png.py 生成，勿手改。算术已在 Python 侧算完，这里只赋值。
(function(){
 var status=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260912/killer90mins_master_v2_setsil_status.txt");
 function fin(m){try{status.encoding="UTF-8";status.open("w");status.write(m);status.close();}catch(e){}}
 var d=null, prevUI=null, log=[];
 function bb(b){return "["+b[0].toFixed(2)+","+b[1].toFixed(2)+","+b[2].toFixed(2)+","+b[3].toFixed(2)+"]";}
 var J=[
  {S:"ACTOR_04",left:-3796.9400,top:-836.8700,w:590.1800,h:639.6217},
  {S:"ACTOR_05",left:-3481.0400,top:-727.0400,w:590.1800,h:639.6217},
 ];
 try{
  try{ prevUI=app.userInteractionLevel; app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS; }catch(e0){}
  d=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_slot4secret.ai"));
  d.saveAs(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260912/killer90mins_master_v2.ai"), new IllustratorSaveOptions());
  for(var i=0;i<J.length;i++){ var q=J[i];
   var Ly=d.layers.getByName(q.S);
   var wasLocked=Ly.locked; Ly.locked=false;
   var sgm=Ly.groupItems.getByName("SECRET_GUEST_MODE");
   var wasHidden=sgm.hidden; sgm.hidden=false;
   var sil=sgm.groupItems.getByName("\u526A\u5F71");
   var clip=null, olds=[];
   for(var k=0;k<sil.pageItems.length;k++){
    var it=sil.pageItems[k];
    if(it.typename==="PathItem" && it.clipping){ clip=it; } else { olds[olds.length]=it; }
   }
   if(!clip) throw new Error(q.S+" \u526a\u5f71\u91cc\u6ca1\u6709\u88c1\u5207\u8def\u5f84");
   var clipGb=clip.geometricBounds;
   var oldGb=olds.length?olds[0].geometricBounds:null;
   var p=sil.placedItems.add();
   p.file=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/assets/secret_guest_silhouette.png");
   p.move(sil, ElementPlacement.PLACEATEND);
   p.width=q.w; p.height=q.h; p.left=q.left; p.top=q.top;
   var gotGb=p.geometricBounds;
   p.embed();
   for(var m=olds.length-1;m>=0;m--){ olds[m].remove(); }
   var art=null;
   for(var n=0;n<sil.pageItems.length;n++){ var it2=sil.pageItems[n];
    if(!(it2.typename==="PathItem" && it2.clipping)) art=it2; }
   log.push(q.S+" clip_gb="+bb(clipGb)
    +" old_art_gb="+(oldGb?bb(oldGb):"NONE")
    +" placed_gb="+bb(gotGb)
    +" after_embed="+(art?art.typename+" gb="+bb(art.geometricBounds):"NONE")
    +" sil_children="+sil.pageItems.length+" sil_clipped="+sil.clipped);
   sgm.hidden=wasHidden; Ly.locked=wasLocked;
   log.push(q.S+" restored sgm_hidden="+sgm.hidden+" layer_locked="+Ly.locked);
  }
  d.save();
  fin("OK\n"+log.join("\n")+"\n");
  d.close(SaveOptions.SAVECHANGES);
 }catch(err){ fin("ERR "+err.message+"\n"+log.join("\n")+"\n");
   try{ if(d) d.close(SaveOptions.DONOTSAVECHANGES); }catch(e){} }
 try{ if(prevUI!==null) app.userInteractionLevel=prevUI; }catch(e3){}
})();
