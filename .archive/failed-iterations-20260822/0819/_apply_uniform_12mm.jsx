#target illustrator
// 统一 12mm 试做版 —— 由 Python 预计算全部目标坐标，本脚本只做赋值，无任何判断。
// 规则: 黑板上沿→名牌墨迹顶 = 12mm(垂线);  名牌墨迹底→人像轮廓最小垂线净距 = 12mm
(function(){
 if(app.documents.length===0){alert("请先打开 killer90mins_v3.ai");return;}
 var d=app.activeDocument;
 if(d.name!=="killer90mins_v3.ai"){alert("请打开 killer90mins_v3.ai（当前是 "+d.name+"）");return;}
 var dir=d.path.fsName, out=new File(dir+"/killer90mins_v3_12mm.ai"), png=new File(dir+"/killer90mins_v3_12mm.png"), log=new File(dir+"/killer90mins_v3_12mm_log.txt");
 function placedIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=placedIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
 var M=[
  {L:"ACTOR_01",G:"PHOTO",N:"ian",dx:-1.3045,dy:9.2039,left:-4753.3100,top:-1038.1183,w:601.7700,h:828.8100},
  {L:"ACTOR_02",G:"PHOTO",N:"kent",dx:-2.6628,dy:7.5375,left:-4405.1800,top:-914.0492,w:609.2800,h:839.2000},
  {L:"ACTOR_03",G:"PHTOTO",N:"chin wang",dx:-2.5955,dy:6.1239,left:-4203.9700,top:-754.3232,w:671.8300,h:925.3600},
  {L:"ACTOR_04",G:"PHOTO",N:"caleb",dx:-0.5115,dy:1.4480,left:-3784.6950,top:-694.1873,w:546.3699,h:752.5573},
  {L:"ACTOR_05",G:"PHOTO",N:"jorge",dx:0.4007,dy:-2.8274,left:-3505.9000,top:-589.1516,w:596.0800,h:821.0100},
 ];
 try{
  d.saveAs(out,new IllustratorSaveOptions());
  log.encoding="UTF-8"; log.open("w"); log.writeln("统一 12mm 试做版");
  for(var i=0;i<M.length;i++){
   var c=M[i], L=d.layers.getByName(c.L);
   var tf=(c.L==="ACTOR_05")?L.layers.getByName("PHOTO_MODE").textFrames.getByName("NAME"):L.textFrames.getByName("NAME");
   var gp=(c.L==="ACTOR_05")?L.layers.getByName("PHOTO_MODE").groupItems.getByName(c.G):L.groupItems.getByName(c.G);
   var p=placedIn(gp); if(!p) throw new Error(c.L+" 找不到人像");
   tf.translate(c.dx,c.dy);
   p.width=c.w; p.height=c.h; p.left=c.left; p.top=c.top;
   log.writeln(c.L+" "+c.N+" card_dx="+c.dx+" card_dy="+c.dy+" photo_left="+c.left+" photo_top="+c.top+" photo_w="+c.w+" photo_h="+c.h);
  }
  log.close(); d.save();
  var e=new ExportOptionsPNG24(); e.antiAliasing=true; e.transparency=false; e.artBoardClipping=true; e.horizontalScale=200; e.verticalScale=200;
  d.exportFile(png,ExportType.PNG24,e);
  alert("完成\n\n"+out.fsName+"\n"+png.fsName);
 }catch(err){ try{log.open("w");log.write("ERROR: "+err.message);log.close();}catch(e3){} alert("停止: "+err.message); }
}());