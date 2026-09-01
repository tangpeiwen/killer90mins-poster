#target illustrator
// STAGE 2 - apply positions. All arithmetic precomputed in Python.
(function(){
 if(app.documents.length===0){alert("open killer90mins_auto_20260829_s1.ai first");return;}
 var d=app.activeDocument;
 if(d.name!=="killer90mins_auto_20260829_s1.ai"){alert("please open killer90mins_auto_20260829_s1.ai, current is "+d.name);return;}
 var out=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260829/killer90mins_auto_20260829.ai"), png=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260829/killer90mins_auto_20260829.png"), log=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260829/killer90mins_auto_20260829_s2_log.txt");
 function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
 var M=[
  {S:"ACTOR_01",G:"PHOTO",cardL:-4599.70000,cardT:-996.99863,left:-4761.24104,top:-1057.70050,w:580.95875,h:800.18890},
  {S:"ACTOR_02",G:"PHOTO",cardL:-4264.80900,cardT:-906.95973,left:-4418.38639,top:-947.75298,w:554.69821,h:764.01871},
  {S:"ACTOR_03",G:"PHTOTO",cardL:-3935.15710,cardT:-788.30518,left:-4179.33971,top:-903.31015,w:566.41272,h:677.04450},
  {S:"ACTOR_04",G:"PHOTO",cardL:-3607.65765,cardT:-660.35653,left:-3778.73403,top:-687.90946,w:582.74654,h:802.64470},
 ];
 try{
  d.saveAs(out,new IllustratorSaveOptions());
  log.encoding="UTF-8"; log.open("w");
  for(var i=0;i<M.length;i++){var q=M[i];
   var Lx=d.layers.getByName(q.S);
   var tf=Lx.textFrames.getByName("NAME"); tf.left=q.cardL; tf.top=q.cardT;
   var p=pl(Lx.groupItems.getByName(q.G)); if(!p) throw new Error(q.S+" no portrait");
   p.width=q.w; p.height=q.h; p.left=q.left; p.top=q.top;
   log.writeln(q.S+" card="+q.cardL+","+q.cardT+" photo="+q.left+","+q.top+","+q.w+","+q.h);
  }
  log.close(); d.save();
  var e=new ExportOptionsPNG24(); e.antiAliasing=true; e.transparency=false;
  e.artBoardClipping=true; e.horizontalScale=200; e.verticalScale=200;
  d.exportFile(png,ExportType.PNG24,e);
  alert("STAGE 2 done\n\n"+out.fsName+"\n"+png.fsName);
 }catch(err){ try{log.close();}catch(e2){} alert("STAGE 2 stopped: "+err.message); }
}());