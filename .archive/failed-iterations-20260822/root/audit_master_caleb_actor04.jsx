#target illustrator
(function(){
  var d=app.activeDocument,o=new File('/tmp/k90_master_caleb_actor04.txt');o.open('w');
  function w(s){o.writeln(s);}
  function clipIn(x){try{for(var i=0;i<x.pathItems.length;i++)if(x.pathItems[i].clipping)return x.pathItems[i];}catch(e){}try{for(var j=0;j<x.groupItems.length;j++){var z=clipIn(x.groupItems[j]);if(z)return z;}}catch(e2){}return null;}
  function placeIn(x){try{if(x.placedItems.length)return x.placedItems[0];}catch(e){}try{for(var i=0;i<x.groupItems.length;i++){var z=placeIn(x.groupItems[i]);if(z)return z;}}catch(e2){}return null;}
  w('doc='+d.name);
  var l=d.layers.getByName('ACTOR_04'),f=l.textFrames.getByName('NAME'),g=l.groupItems.getByName('PHOTO'),c=clipIn(g),p=placeIn(g);
  w('name='+f.contents+' font='+f.textRange.characterAttributes.textFont.name+' size='+f.textRange.characterAttributes.size);
  w('name visible='+f.visibleBounds+' geometric='+f.geometricBounds+' left='+f.left+' top='+f.top+' rotation?=transform preserved');
  w('clip='+c.geometricBounds+' visible='+c.visibleBounds);
  w('placed='+p.geometricBounds+' left='+p.left+' top='+p.top+' width='+p.width+' height='+p.height+' file='+p.file.fsName);
  o.close();
}());
