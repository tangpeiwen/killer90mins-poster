#target illustrator
/*
 * L4 审计 —— 只读回实际状态，不看任何脚本的日志。
 * 对 killer90mins_auto_20260829.ai 运行。
 * 会创建临时副本用于测量名牌墨迹并立即删除；跑完请【不要保存】直接关闭。
 */
(function(){
  var AUTO = (typeof AUTO_TARGET !== 'undefined');
  var d;
  if(AUTO){ d=app.open(new File(AUTO_TARGET)); }
  else { if(app.documents.length===0){alert('Open killer90mins_auto_20260829.ai first');return;}
         d=app.activeDocument; }
  var OUT=[], tmp=[];
  function w(s){OUT[OUT.length]=s;}
  function safe(f,v){try{return f();}catch(e){return v;}}
  function bb(b){return '['+b[0].toFixed(4)+','+b[1].toFixed(4)+','+b[2].toFixed(4)+','+b[3].toFixed(4)+']';}
  // 人像可能是链接图(PlacedItem)也可能已被嵌入(RasterItem)。只认前者的话，
  // 任何 embed 过的文件都会报 photo_gb=NONE，R2/R3/COV 全部读不到 —— 等于无法验收。
  // 验收只需要 geometricBounds，两种类型都有；photo_file 对 RasterItem 会落到 MISSING，无妨。
  function pl(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}
    try{if(x.rasterItems.length)return x.rasterItems[0];}catch(e1){}
    try{for(var i=0;i<x.groupItems.length;i++){var z=pl(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  function ink(tf){var g=tf.duplicate(d,ElementPlacement.PLACEATEND);tmp[tmp.length]=g;
    try{var o=g.createOutline();tmp[tmp.length]=o;return o.geometricBounds;}catch(e){return null;}}
  try{
    var R=d.artboards[0].artboardRect;
    w('doc='+d.name);
    w('artboard='+bb(R));
    var names=['ACTOR_01','ACTOR_02','ACTOR_03','ACTOR_04','ACTOR_05'];
    for(var i=0;i<names.length;i++){
      var nm=names[i], L=d.layers.getByName(nm);
      var tf=null, g=null;
      // 按结构判断，不按名字：任何带 SECRET_GUEST_MODE 的格子都走剪影分支。
      // 原先写死 nm==='ACTOR_05'，第 4 格改成剪影后会被漏检。
      var hasSG=safe(function(){L.groupItems.getByName('SECRET_GUEST_MODE');return true;},false);
      if(hasSG){
        var pm=safe(function(){return L.layers.getByName('PHOTO_MODE').visible;},'?');
        var sg=safe(function(){return L.groupItems.getByName('SECRET_GUEST_MODE').hidden;},'?');
        w(nm+' photo_mode_visible='+pm+' silhouette_hidden='+sg);
        // 两种模式的名牌都量：PHOTO_MODE/NAME 与 神秘嘉宾姓名牌
        var pl5=safe(function(){return L.layers.getByName('PHOTO_MODE');},null);
        if(pl5){
          var t5=safe(function(){return pl5.textFrames.getByName('NAME');},null);
          if(t5){var i5=ink(t5);
            w(nm+'_PHOTO_MODE name="'+t5.contents+'" ink_gb='+(i5?bb(i5):'FAIL'));}
          var g5=safe(function(){return pl5.groupItems.getByName('PHOTO');},null);
          var p5=g5?pl(g5):null;
          if(p5) w(nm+'_PHOTO_MODE photo_gb='+bb(p5.geometricBounds)
                   +' photo_file='+safe(function(){return p5.file.name;},'MISSING'));
        }
        var sgm=safe(function(){return L.groupItems.getByName('SECRET_GUEST_MODE');},null);
        if(sgm){
          for(var q=0;q<sgm.textFrames.length;q++){
            var ts=sgm.textFrames[q]; var isx=ink(ts);
            w(nm+'_SECRET name="'+String(ts.contents).replace(/[\r\n]/g,'\\n')+'"'
              +' font='+safe(function(){return ts.textRange.characterAttributes.textFont.name;},'?')
              +' ink_gb='+(isx?bb(isx):'FAIL'));
          }
        }
        continue;
      }
      tf=L.textFrames.getByName('NAME');
      g=safe(function(){return L.groupItems.getByName('PHOTO');},null);
      if(!g) g=safe(function(){return L.groupItems.getByName('PHTOTO');},null);
      var p=g?pl(g):null;
      var ig=ink(tf);
      w(nm+' name="'+tf.contents+'"'
        +' font='+safe(function(){return tf.textRange.characterAttributes.textFont.name;},'?')
        +' size='+safe(function(){return tf.textRange.characterAttributes.size.toFixed(3);},'?')
        +' ink_gb='+(ig?bb(ig):'FAIL')
        +' photo_gb='+(p?bb(p.geometricBounds):'NONE')
        +' photo_file='+(p?safe(function(){return p.file.name;},'MISSING'):'NONE'));
    }
    var DT=d.layers.getByName('日期/时间/主持人标签');
    var dn=['MONTH','DAY','WEEKDAY','EVENT TIME'];
    for(var k=0;k<dn.length;k++){
      var t=DT.textFrames.getByName(dn[k]);
      // 同时给出墨迹边界：MONTH→DAY 间距规则定义在墨迹上，文字框含内边距不可用
      var dig=ink(t);
      w('DATE '+dn[k]+'="'+t.contents+'" gb='+bb(t.geometricBounds)
        +' ink_gb='+(dig?bb(dig):'FAIL'));
    }
    var hb=DT.groupItems.getByName('HOST BADGE');
    w('HOST_BADGE gb='+bb(hb.geometricBounds)+' hidden='+hb.hidden);
  }catch(e){ w('ERROR: '+e.message); }
  for(var z=tmp.length-1;z>=0;z--){try{tmp[z].remove();}catch(e3){}}
  w('tmp_removed='+tmp.length);
  var dir=safe(function(){return d.path.fsName;},Folder.desktop.fsName);
  var f=new File(dir+'/'+d.name.replace(/\.ai$/i,'')+'_L4.txt');
  f.encoding='UTF-8'; f.open('w'); f.write(OUT.join('\n')); f.close();
  if(AUTO){
    // 自动模式：不保存直接关闭，人没有机会误存
    try{ d.close(SaveOptions.DONOTSAVECHANGES); }catch(e){}
    var st=new File(AUTO_STATUS); st.encoding='UTF-8';
    st.open('w'); st.writeln('OK '+f.fsName); st.close();
  } else {
    alert('L4 audit done (document unchanged — do NOT save)\n\n'+f.fsName);
  }
}());
