#target illustrator
(function(){
  var o=new File('/tmp/k90_active_v7_spacing.txt'); o.open('w');
  function w(s){o.writeln(s);}
  function clipIn(x){try{for(var i=0;i<x.pathItems.length;i++)if(x.pathItems[i].clipping)return x.pathItems[i];}catch(e){} try{for(var j=0;j<x.groupItems.length;j++){var z=clipIn(x.groupItems[j]);if(z)return z;}}catch(e2){} return null;}
  function placedIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){} try{for(var i=0;i<x.groupItems.length;i++){var z=placedIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  var d=app.activeDocument, tops=[.117,.186,.053,.160], ids=['PHOTO','PHOTO','PHTOTO','PHOTO'];
  w('DOC='+d.fullName.fsName);
  for(var n=1;n<=4;n++){
    var l=d.layers.getByName('ACTOR_0'+n), f=l.textFrames.getByName('NAME'), g=l.groupItems.getByName(ids[n-1]), c=clipIn(g), p=placedIn(g), vb=f.visibleBounds, cb=c.geometricBounds;
    var calcHead=p.top-tops[n-1]*p.height;
    w('ACTOR_0'+n+' tag_v='+vb+' clip='+cb+' placed top='+p.top+' h='+p.height+' calc_head='+calcHead+' tag_bottom='+vb[3]+' gap_pt='+(vb[3]-calcHead));
  }
  o.close();
}());
