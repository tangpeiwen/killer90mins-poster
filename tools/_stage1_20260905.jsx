#target illustrator
// STAGE 1 — 换内容 + 测量。不做任何定位。由 tools/build_poster.py 生成，勿手改。
(function(){
 var d=app.open(new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_master_slot4secret.ai"));
 var st=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s1_status.txt"); st.encoding="UTF-8";
 function fin(m){try{st.open("w");st.writeln(m);st.close();}catch(e){}}
 var out=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s1.ai"), rep=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/killer90mins_20260905/killer90mins_auto_20260905_s1_measure.txt");
 var WHITE=new RGBColor(); WHITE.red=255; WHITE.green=255; WHITE.blue=255;
 function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
 function bb(b){return "["+b[0].toFixed(4)+","+b[1].toFixed(4)+","+b[2].toFixed(4)+","+b[3].toFixed(4)+"]";}
 var tmp=[];
 function ink(tf){var g=tf.duplicate(d,ElementPlacement.PLACEATEND);tmp[tmp.length]=g;try{var o=g.createOutline();tmp[tmp.length]=o;return o.geometricBounds;}catch(e){return null;}}
 try{
  d.saveAs(out,new IllustratorSaveOptions());
  rep.encoding="UTF-8"; rep.open("w");
  rep.writeln("stage=1 doc="+d.name);
  // ---- ACTOR_01 ----
  var Lx=d.layers.getByName("ACTOR_01");
  var tf=Lx.textFrames.getByName("NAME");
  tf.contents="ian";
  tf.textRange.characterAttributes.textFont=app.textFonts.getByName("LaMachineCompany");
  tf.textRange.characterAttributes.size=54.25;
  var p=pl(Lx.groupItems.getByName("PHOTO"));
  if(!p) throw new Error("ACTOR_01"+" \u627e\u4e0d\u5230\u4eba\u50cf");
  p.file=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/\u6F14\u5458\u7167\u72470905/1.IAN B.png");
  var ig=ink(tf);
  rep.writeln("ACTOR_01 name="+tf.contents+" font="+tf.textRange.characterAttributes.textFont.name+" size="+tf.textRange.characterAttributes.size+" text_gb="+bb(tf.geometricBounds)+" ink_gb="+(ig?bb(ig):"FAIL")+" photo_gb="+bb(p.geometricBounds));
  // ---- ACTOR_02 ----
  var Lx=d.layers.getByName("ACTOR_02");
  var tf=Lx.textFrames.getByName("NAME");
  tf.contents="chin wang";
  tf.textRange.characterAttributes.textFont=app.textFonts.getByName("LaMachineCompany");
  tf.textRange.characterAttributes.size=49.19;
  var p=pl(Lx.groupItems.getByName("PHOTO"));
  if(!p) throw new Error("ACTOR_02"+" \u627e\u4e0d\u5230\u4eba\u50cf");
  p.file=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/\u6F14\u5458\u7167\u72470905/2.Chin Wang.png");
  var ig=ink(tf);
  rep.writeln("ACTOR_02 name="+tf.contents+" font="+tf.textRange.characterAttributes.textFont.name+" size="+tf.textRange.characterAttributes.size+" text_gb="+bb(tf.geometricBounds)+" ink_gb="+(ig?bb(ig):"FAIL")+" photo_gb="+bb(p.geometricBounds));
  // ---- ACTOR_03 ----
  var Lx=d.layers.getByName("ACTOR_03");
  var tf=Lx.textFrames.getByName("NAME");
  tf.contents="david";
  tf.textRange.characterAttributes.textFont=app.textFonts.getByName("LaMachineCompany");
  tf.textRange.characterAttributes.size=54.25;
  var p=pl(Lx.groupItems.getByName("PHTOTO"));
  if(!p) throw new Error("ACTOR_03"+" \u627e\u4e0d\u5230\u4eba\u50cf");
  p.file=new File("/Users/aaaa/Documents/GitHub/spicy\u6D77\u62A5/\u6F14\u5458\u7167\u72470905/3.David.PNG");
  var ig=ink(tf);
  rep.writeln("ACTOR_03 name="+tf.contents+" font="+tf.textRange.characterAttributes.textFont.name+" size="+tf.textRange.characterAttributes.size+" text_gb="+bb(tf.geometricBounds)+" ink_gb="+(ig?bb(ig):"FAIL")+" photo_gb="+bb(p.geometricBounds));
  // ---- ACTOR_04 : 切换到神秘嘉宾剪影 ----
  var L5=d.layers.getByName("ACTOR_04");
  L5.layers.getByName("PHOTO_MODE").visible=false;
  L5.groupItems.getByName("SECRET_GUEST_MODE").hidden=false;
  rep.writeln("ACTOR_04 mode=SECRET_GUEST photo_mode_visible=false silhouette_hidden=false");
  // ---- ACTOR_05 : 切换到神秘嘉宾剪影 ----
  var L5=d.layers.getByName("ACTOR_05");
  L5.layers.getByName("PHOTO_MODE").visible=false;
  L5.groupItems.getByName("SECRET_GUEST_MODE").hidden=false;
  rep.writeln("ACTOR_05 mode=SECRET_GUEST photo_mode_visible=false silhouette_hidden=false");
  // ---- 日期 ----
  var DT=d.layers.getByName("\u65e5\u671f/\u65f6\u95f4/\u4e3b\u6301\u4eba\u6807\u7b7e");
  var t_MONTH=DT.textFrames.getByName("MONTH"); t_MONTH.contents="SEPT";
  var i_MONTH=ink(t_MONTH);
  rep.writeln("DATE MONTH value="+t_MONTH.contents+" text_gb="+bb(t_MONTH.geometricBounds)+" ink_gb="+(i_MONTH?bb(i_MONTH):"FAIL"));
  var t_DAY=DT.textFrames.getByName("DAY"); t_DAY.contents="5";
  var i_DAY=ink(t_DAY);
  rep.writeln("DATE DAY value="+t_DAY.contents+" text_gb="+bb(t_DAY.geometricBounds)+" ink_gb="+(i_DAY?bb(i_DAY):"FAIL"));
  var t_WEEKDAY=DT.textFrames.getByName("WEEKDAY"); t_WEEKDAY.contents="sat.";
  var i_WEEKDAY=ink(t_WEEKDAY);
  rep.writeln("DATE WEEKDAY value="+t_WEEKDAY.contents+" text_gb="+bb(t_WEEKDAY.geometricBounds)+" ink_gb="+(i_WEEKDAY?bb(i_WEEKDAY):"FAIL"));
  var t_EVENT_TIME=DT.textFrames.getByName("EVENT TIME"); t_EVENT_TIME.contents="19:30-21:00";
  var i_EVENT_TIME=ink(t_EVENT_TIME);
  rep.writeln("DATE EVENT TIME value="+t_EVENT_TIME.contents+" text_gb="+bb(t_EVENT_TIME.geometricBounds)+" ink_gb="+(i_EVENT_TIME?bb(i_EVENT_TIME):"FAIL"));
  for(var k=tmp.length-1;k>=0;k--){try{tmp[k].remove();}catch(e){}}
  rep.writeln("tmp_removed="+tmp.length);
  rep.close(); d.save(); fin("OK");
 }catch(err){ for(var k2=tmp.length-1;k2>=0;k2--){try{tmp[k2].remove();}catch(e){}} try{rep.close();}catch(e3){} fin("ERR "+err.message);
 }
}());