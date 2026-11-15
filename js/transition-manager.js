// One render-state owner: targets may change by stage, displayed poses never jump.
function createTransitionManager(objects,actors){
 const records=new Map(),materials=new WeakMap();let active=null,background=null;
 for(const object of objects)records.set(object,{position:object.position.clone(),quaternion:object.quaternion.clone(),scale:object.scale.clone(),alpha:0,wanted:false,fresh:true});
 function apply(dt,actor,bg){
  const amount=1-Math.exp(-Math.max(0,dt)*2.4),actorTarget=actor?.position.clone();
  const oldActor=active&&records.get(active);
  for(const [object,r] of records){
   const wanted=object.visible;
   if(wanted&&r.fresh&&!actors.includes(object)){r.position.copy(object.position);r.quaternion.copy(object.quaternion);r.scale.copy(object.scale);}
   if(wanted)r.fresh=false;
   if(wanted&&!r.wanted&&actors.includes(object)&&oldActor&&object!==active){r.position.copy(oldActor.position);r.quaternion.copy(oldActor.quaternion);}
   if(wanted){r.position.lerp(object.position,amount);r.quaternion.slerp(object.quaternion,amount);r.scale.lerp(object.scale,amount);}
   r.alpha=THREE.MathUtils.lerp(r.alpha,wanted?1:0,amount);r.wanted=wanted;
   object.position.copy(r.position);object.quaternion.copy(r.quaternion);object.scale.copy(r.scale);object.visible=r.alpha>.002;
   object.traverse(node=>{if(!node.isMesh)return;let list=materials.get(node);if(!list){node.material=Array.isArray(node.material)?node.material.map(m=>m.clone()):node.material.clone();list=(Array.isArray(node.material)?node.material:[node.material]).map(m=>({m,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite}));materials.set(node,list)}
    for(const item of list){item.m.opacity=item.opacity*r.alpha;item.m.transparent=r.alpha<.995||item.transparent;item.m.depthWrite=r.alpha>.9&&item.depthWrite;}
   });
  }
  active=actor||active;
  if(!background)background=bg.clone();background.lerp(bg,amount);bg.copy(background);
  return actor?actor.position.clone().sub(actorTarget):new THREE.Vector3();
 }
 return {apply};
}
