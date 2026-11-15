// Layered, local procedural background. Artistic scenery, not a star catalogue.
function createSpaceSky(scene){
 const group=new THREE.Group();scene.add(group);const layers=[];
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
 gradient.addColorStop(0,'rgba(180,170,240,.5)');gradient.addColorStop(.35,'rgba(80,95,165,.18)');gradient.addColorStop(1,'rgba(40,60,120,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 for(let layer=0;layer<4;layer++){
  const points=[],count=layer===3?55:900-layer*240;
  for(let i=0;i<count;i++){const a=i*2.399963+layer,b=Math.acos(1-2*(i+.5)/count),r=2200+layer*170;points.push(Math.sin(b)*Math.cos(a)*r,Math.cos(b)*r,Math.sin(b)*Math.sin(a)*r)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  const material=new THREE.PointsMaterial({color:[0x91b7df,0xe0e7ff,0xffd8af,0x8476bf][layer],size:layer===3?650:1+layer*.9,sizeAttenuation:layer===3,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,map:layer===3?new THREE.CanvasTexture(canvas):null});
  const stars=new THREE.Points(geo,material);group.add(stars);layers.push(stars);
 }
 let time=0;return {update(dt,visibility){time+=dt;group.rotation.y=time*.0015;layers.forEach((l,i)=>{l.rotation.z=Math.sin(time*.012+i)*.015;l.material.opacity=visibility*(i===3?.28:.7+.17*Math.sin(time*(.6+i*.2)+i))})}};
}
