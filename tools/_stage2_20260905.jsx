#target illustrator
// STAGE 2 - apply positions. All arithmetic precomputed in Python.
(function(){
 var d=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s1.ai"));
 var st=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s2_status.txt"); st.encoding="UTF-8";
 function fin(m){try{st.open("w");st.writeln(m);st.close();}catch(e){}}
 var out=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905.ai"), png=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905.png"), log=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s2_log.txt");
 function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
 var M=[
  {S:"ACTOR_01",G:"PHOTO",cardL:-4544.66235,cardT:-1009.37669,left:-4749.77627,top:-1049.48091,w:600.09856,h:826.49665},
  {S:"ACTOR_02",G:"PHOTO",cardL:-4307.35040,cardT:-893.90076,left:-4522.79480,top:-879.42979,w:671.85686,h:925.38825},
  {S:"ACTOR_03",G:"PHTOTO",cardL:-3946.13245,cardT:-780.09697,left:-4037.62187,top:-909.64950,w:446.38234,h:833.89190},
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
  var DT=d.layers.getByName("\u65e5\u671f/\u65f6\u95f4/\u4e3b\u6301\u4eba\u6807\u7b7e");
  var dt_DAY=DT.textFrames.getByName("DAY"); dt_DAY.translate(-50.56532,0);
  log.writeln("DATE DAY shifted="+-50.56532+" new_gb="+dt_DAY.geometricBounds.join(","));
  var dt_WEEKDAY=DT.textFrames.getByName("WEEKDAY"); dt_WEEKDAY.translate(-50.56532,0);
  log.writeln("DATE WEEKDAY shifted="+-50.56532+" new_gb="+dt_WEEKDAY.geometricBounds.join(","));
  log.close(); d.save();
  var e=new ExportOptionsPNG24(); e.antiAliasing=true; e.transparency=false;
  e.artBoardClipping=true; e.horizontalScale=200; e.verticalScale=200;
  d.exportFile(png,ExportType.PNG24,e);
  fin("OK");
 }catch(err){ try{log.close();}catch(e2){} fin("ERR "+err.message);
 }
}());