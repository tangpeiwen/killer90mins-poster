#target illustrator
(function(){var d=app.activeDocument,o=new File('/tmp/k90_master_actor04_points.txt');o.open('w');var l=d.layers.getByName('ACTOR_04'),g=l.groupItems.getByName('PHOTO'),c=null;for(var i=0;i<g.pathItems.length;i++)if(g.pathItems[i].clipping)c=g.pathItems[i];o.writeln('doc='+d.name);for(var j=0;j<c.pathPoints.length;j++)o.writeln(j+': '+c.pathPoints[j].anchor);o.close();}());
