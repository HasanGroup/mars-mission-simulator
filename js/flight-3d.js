/* Cinematic educational flight. Distances/time and obstacles are fictional.
 * External launch and heading-relative chase cameras throughout the flight.
 */
const $=id=>document.getElementById(id), flight=createFlight(), s=flight.s;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,12000);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
catch(error){$('model-status').textContent='Для 3D нужен WebGL. Включите аппаратное ускорение браузера.';throw error}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
$('scene').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xbacfe6,0x5a3c28,2));
const sun=new THREE.DirectionalLight(0xffe7c4,3.2);sun.position.set(-80,120,60);scene.add(sun);
const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness});
function mesh(geometry,material,parent=scene){const m=new THREE.Mesh(geometry,material);parent.add(m);return m}
const white=mat(0xdcded8,.3),gold=mat(0xb39a61,.5),dark=mat(0x1b2631,.3);
const vehicle=new THREE.Group();scene.add(vehicle);
const rocket=new THREE.Group();vehicle.add(rocket);
const placeholder=mesh(new THREE.CylinderGeometry(.8,.8,10,24),white,rocket);placeholder.position.y=5;
const nose=mesh(new THREE.ConeGeometry(.8,2,24),white,rocket);nose.position.y=11;
for(let i=0;i<4;i++){const b=mesh(new THREE.CylinderGeometry(.25,.3,5,12),white,rocket);b.position.set(Math.cos(i*Math.PI/2)*1.1,2.5,Math.sin(i*Math.PI/2)*1.1)}
let atlasModel,modelGeneration=-1,shownStage=0;const parts=[],debris=[];
NASAModels.load('atlas-v').then(model=>{
 model.getObjectByName('solid_04')?.removeFromParent();NASAModels.normalize(model,12);
 // Remove mission-specific Juno artwork from the shared Atlas asset.
 model.traverse(n=>{if(n.isMesh){n.material=Array.isArray(n.material)?n.material.map(m=>m.clone()):n.material.clone();for(const m of Array.isArray(n.material)?n.material:[n.material]){m.map=null;m.needsUpdate=true}}});
 rocket.clear();rocket.add(model);rocket.add(launchPayload);atlasModel=model;modelGeneration=-1;
 // Keep fairing and adapters independent so dropping Centaur cannot carry them away.
 model.updateMatrixWorld(true);
 for(const name of ['fairing_left','fairing_right','forward_load_reactor_L','forward_load_reactor_R']){const node=model.getObjectByName(name);if(node)model.attach(node)}
 model.getObjectByName('adapter')?.removeFromParent();
 const rootMesh=model.getObjectByName('_root');if(rootMesh?.isMesh){rootMesh.geometry=new THREE.BufferGeometry()}

 for(const name of ['solid_01','solid_02','solid_03','solid_05','fairing_left','fairing_right','forward_load_reactor_L','forward_load_reactor_R','1st_stage','2nd_stage_centaur']){const node=model.getObjectByName(name);if(node)parts.push({node,parent:node.parent,position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()})}
$('model-status').textContent='NASA / VTAD · Atlas V адаптирован под 541';
}).catch(()=>{$('model-status').textContent='Atlas V · резервная схема (модель не загрузилась)'});
const plume=mesh(new THREE.ConeGeometry(.6,9,24),new THREE.MeshBasicMaterial({color:0xffc677,transparent:true,opacity:.8}),vehicle);plume.rotation.z=Math.PI;plume.position.y=-4;
const plumeCore=mesh(new THREE.ConeGeometry(.28,6,16),new THREE.MeshBasicMaterial({color:0xd4eeff}),vehicle);plumeCore.rotation.z=Math.PI;plumeCore.position.y=-2.7;
const cruise=new THREE.Group();scene.add(cruise);
const disc=mesh(new THREE.CylinderGeometry(2.2,2.2,.45,48),gold,cruise);disc.rotation.x=Math.PI/2;
const solar=mesh(new THREE.CylinderGeometry(2,2,.05,48),mat(0x21364e,.6),cruise);solar.rotation.x=Math.PI/2;solar.position.z=.26;
const capsule=mesh(new THREE.ConeGeometry(1.8,1.2,48),white,cruise);capsule.rotation.x=-Math.PI/2;capsule.position.z=-.6;
for(let i=0;i<8;i++){const spoke=mesh(new THREE.BoxGeometry(.04,4,.05),gold,cruise);spoke.rotation.z=i*Math.PI/4;spoke.position.z=.3}
const ground=new THREE.Group();scene.add(ground);
const pad=mesh(new THREE.CylinderGeometry(10,10,.5,64),mat(0x444b50),ground);
const tower=mesh(new THREE.BoxGeometry(1.2,15,1.2),mat(0x747c82,.5),ground);tower.position.set(-4,7.5,0);
for(let y=2;y<14;y+=2){const arm=mesh(new THREE.BoxGeometry(4,.2,.2),white,ground);arm.position.set(-2,y,0)}
const terrain=mesh(new THREE.PlaneGeometry(2000,2000),mat(0x3a4b42),ground);terrain.rotation.x=-Math.PI/2;terrain.position.y=-.4;
const smoke=new THREE.Group();scene.add(smoke);
for(let i=0;i<24;i++){const cloud=mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:0xc6c8c9,transparent:true,opacity:0,depthWrite:false,roughness:1}),smoke);cloud.userData.seed=i;}
// Stylized map textures are generated locally; they are not NASA imagery.
function planetTexture(mars){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
 g.fillStyle=mars?'#a96745':'#194b6a';g.fillRect(0,0,1024,512);
 let seed=19;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<(mars?1600:100);i++){
  const x=rand()*1024,y=rand()*512,r=rand()*(mars?30:65)+3;
  g.fillStyle=mars?(i%2?'#81513b50':'#d4a17a35'):(i%3?'#688167':'#91a188');
  g.beginPath();g.ellipse(x,y,r,r*(mars?.5:.8),rand()*6,0,Math.PI*2);g.fill();
 }
 if(!mars){g.fillStyle='#ffffff25';for(let i=0;i<50;i++){g.beginPath();g.ellipse(rand()*1024,rand()*512,rand()*70+20,rand()*8+2,-.2,0,Math.PI*2);g.fill()}}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
const earth=mesh(new THREE.SphereGeometry(130,64,48),new THREE.MeshStandardMaterial({map:planetTexture(false),roughness:1}));
const atmosphere=mesh(new THREE.SphereGeometry(133,64,40),new THREE.MeshBasicMaterial({color:0x549fce,transparent:true,opacity:.12,side:THREE.BackSide}));
const mars=mesh(new THREE.SphereGeometry(100,64,48),new THREE.MeshStandardMaterial({map:planetTexture(true),roughness:1}));
if(typeof PLANET_TEXTURES!=='undefined')new THREE.TextureLoader().load(PLANET_TEXTURES.mars,texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const fallback=mars.material.map;mars.material.map=texture;mars.material.needsUpdate=true;fallback.dispose();});
const starsGeo=new THREE.BufferGeometry(),stars=[];
for(let i=0;i<1800;i++){const a=i*2.39996,b=Math.acos(1-2*(i+.5)/1800);stars.push(Math.sin(b)*Math.cos(a)*3000,Math.cos(b)*3000,Math.sin(b)*Math.sin(a)*3000)}
starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));const starfield=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xc2d1df,size:1.5,sizeAttenuation:false}));scene.add(starfield);
function rockGeometry(seed){const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.13*Math.sin(x*17+y*23+z*31+seed);p.setXYZ(i,x*k,y*k,z*k)}g.computeVertexNormals();return g}
const rockGeos=[rockGeometry(1),rockGeometry(4),rockGeometry(8)],rockMats=[mat(0x776e63),mat(0x89989e),mat(0x5d554e)];
const phobos=mesh(rockGeometry(12),mat(0x877665));phobos.scale.set(13,9,10);
const hazardMeshes=new Map(),hazardNodes=new Map();
let hazardGeneration=-1;
const impactGeo=new THREE.BufferGeometry(),impactPositions=new Float32Array(72*3);
impactGeo.setAttribute('position',new THREE.BufferAttribute(impactPositions,3));
const impactParticles=new THREE.Points(impactGeo,new THREE.PointsMaterial({color:0xffce7a,size:.2,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(impactParticles);
impactParticles.frustumCulled=false;
const impactLight=new THREE.PointLight(0xffae60,0,35);scene.add(impactLight);
let effectAge=10,effectStrength=0,effectId=0,effectGeneration=-1;const fragmentVelocities=[];
function updateImpact(dt){
 if(effectGeneration!==s.generation){effectGeneration=s.generation;effectId=0;effectAge=10;effectStrength=0;}
 if(s.impact&&s.impact.id!==effectId){effectId=s.impact.id;effectAge=0;effectStrength=s.impact.strength;fragmentVelocities.length=0;
  for(let i=0;i<72;i++){impactPositions.set([s.impact.x,s.impact.y,s.impact.z],i*3);const a=i*2.39996,z=1-2*(i+.5)/72,r=Math.sqrt(1-z*z),speed=4+i%9;fragmentVelocities.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,z).multiplyScalar(speed));}
  impactLight.position.set(s.impact.x,s.impact.y,s.impact.z);
 }
 effectAge+=dt;for(let i=0;i<fragmentVelocities.length;i++){const v=fragmentVelocities[i];impactPositions[i*3]+=v.x*dt;impactPositions[i*3+1]+=v.y*dt;impactPositions[i*3+2]+=v.z*dt;v.multiplyScalar(Math.exp(-dt*.8));}
 impactGeo.attributes.position.needsUpdate=true;impactParticles.visible=effectAge<1.2;impactParticles.material.opacity=Math.max(0,1-effectAge/1.2);impactLight.intensity=Math.max(0,1-effectAge/.3)*55*effectStrength;
 return Math.max(0,1-effectAge/.85)**2*effectStrength;
}
const landing=new THREE.Group();scene.add(landing);
const landPlane=mesh(new THREE.PlaneGeometry(1500,1500,1,1),mat(0xa57555),landing);landPlane.rotation.x=-Math.PI/2;landPlane.position.y=-.1;
for(let i=0;i<95;i++){const r=mesh(rockGeos[i%3],mat(i%2?0x755540:0x8b6449),landing);r.position.set(Math.sin(i*9.3)*(20+i*2),.3,Math.cos(i*5.1)*(20+i*2));r.scale.setScalar(.3+(i%8)*.3)}
const target=mesh(new THREE.RingGeometry(5.7,6,80),new THREE.MeshBasicMaterial({color:0xe2c282,side:THREE.DoubleSide,transparent:true,opacity:.8}),landing);target.rotation.x=-Math.PI/2;target.position.y=.04;
const lander=new THREE.Group();scene.add(lander);
const descent=mesh(new THREE.BoxGeometry(3,.6,2.6),gold,lander);descent.position.y=3.5;
const cables=[];let flyaway=0;
for(const x of [-1.2,1.2])for(const z of [-1,1]){const cable=mesh(new THREE.CylinderGeometry(.018,.018,2.8,5),white,lander);cable.position.set(x,1.8,z);cables.push(cable)}
const roverRoot=new THREE.Group();lander.add(roverRoot);
mesh(new THREE.BoxGeometry(2,.6,1.5),white,roverRoot).position.y=.8;
for(const x of [-1,1])for(const z of [-.8,0,.8]){const w=mesh(new THREE.CylinderGeometry(.3,.3,.2,12),dark,roverRoot);w.rotation.z=Math.PI/2;w.position.set(x,.3,z)}
NASAModels.load('curiosity').then(model=>{NASAModels.normalize(model,1.8);roverRoot.clear();roverRoot.add(model)}).catch(()=>{});
const landFlames=[];for(const x of [-1.8,1.8]){const f=mesh(new THREE.ConeGeometry(.2,2,12),new THREE.MeshBasicMaterial({color:0x8dbdff,transparent:true,opacity:.8}),lander);f.rotation.z=Math.PI;f.position.set(x,2.4,0);landFlames.push(f)}
// MSL cruise configuration: circular solar cruise stage, backshell and broad heat shield.
capsule.geometry.dispose();capsule.geometry=new THREE.CylinderGeometry(1.25,2.15,1.25,48);capsule.rotation.x=Math.PI/2;capsule.position.z=-.8;
const heatShield=mesh(new THREE.SphereGeometry(2.15,48,16,0,Math.PI*2,0,.46),mat(0x533b2e),cruise);heatShield.rotation.x=-Math.PI/2;heatShield.scale.y=.38;heatShield.position.z=-.65;
for(let i=0;i<12;i++){const cell=mesh(new THREE.BoxGeometry(.035,3.8,.025),white,cruise);cell.position.set((i-5.5)*.29,0,.3);cell.scale.y=Math.sqrt(Math.max(.05,1-Math.pow((i-5.5)/6,2)))}
const launchPayload=cruise.clone();rocket.add(launchPayload);launchPayload.scale.setScalar(.21);launchPayload.rotation.x=-Math.PI/2;launchPayload.position.y=10;
function restoreParts(){for(const p of parts){p.parent.add(p.node);p.node.position.copy(p.position);p.node.quaternion.copy(p.quaternion);p.node.scale.copy(p.scale);p.node.visible=true}debris.length=0;shownStage=0;}
function updateStages(dt){
  if(modelGeneration!==s.generation){restoreParts();modelGeneration=s.generation;}
 while(shownStage<(s.stage||0)){const groups=flight.stages.map(event=>event.parts);
  for(const [i,name] of groups[shownStage].entries()){const p=parts.find(p=>p.node.name===name);if(p){scene.attach(p.node);debris.push({node:p.node,age:0,v:new THREE.Vector3((i%2?1:-1)*(2+i*.4),-5,1)})}}shownStage++;
 }
 for(const d of debris){d.age+=dt;d.node.position.addScaledVector(d.v,dt);d.v.y-=dt*2;d.node.rotation.z+=dt*.2;if(d.age>8)d.node.visible=false}
}
const keys={},touch={x:0,y:0,thrust:false};let lastPhase='',lastTime=0,firstFrame=true,dialogOpen=false;
const phaseInfo={controlroom:['ПРОЛОГ','Центр управления','Художественная визуализация подготовки запуска.'],cabin:['ПРОЛОГ','На стартовом столе','Внешняя камера сзади-сбоку. Подготовка к запуску.'],countdown:['01 / ЗЕМЛЯ','Обратный отсчёт','Сигнал принят. Камера наблюдает за ракетой снаружи.'],ascent:['01 / ЗАПУСК','Выше облаков','A / D или ← → — наклон. Держите ракету в коридоре: отклонение меньше 6,7. Тяга автоматическая.'],departure:['02 / ЗЕМНАЯ ОРБИТА','Курс на Марс','Внешняя камера: аппарат после отделения ступеней. Переход на межпланетную траекторию сокращён для игры.'],cruise:['03 / ИГРОВОЙ ПЕРЕЛЁТ','Смотрите вперёд','WASD / стрелки — уклонение. Обходите маркеры. Удар расходует щит, затем повреждает корпус и отбрасывает аппарат.'],phobos:['04 / СПУТНИК МАРСА','Рядом с Фобосом','Фобос движется по орбите вокруг Марса. Масштаб спутника, орбиты и время показаны условно.'],approach:['05 / ПРИБЛИЖЕНИЕ','Красная планета','Камера следует за аппаратом сзади и сверху. Curiosity входил в атмосферу напрямую, без выхода на орбиту Марса.'],entry:['06 / ВХОД В АТМОСФЕРУ','Переход к посадке','Камера остаётся снаружи. Торможение и парашют сжаты в переход; впереди упражнение Sky Crane.'],landing:['06 / SKY CRANE','Мягкое касание','← → — снос. Пробел / ТЯГА — тормозить. Касание ≤3,5 м/с, снос ≤1,5 м/с, внутри круга.']};
function showDialog(tag,title,text,actions,source){dialogOpen=true;$('dialog').hidden=false;$('dialog-tag').textContent=tag;$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog-actions').replaceChildren();for(const [label,fn] of actions){const b=document.createElement('button');b.textContent=label;b.className='primary';b.onclick=()=>{hideDialog();fn()};$('dialog-actions').appendChild(b)}$('dialog-source').hidden=!source;if(source)$('dialog-source').href=source;keysClear();}
function hideDialog(){dialogOpen=false;$('dialog').hidden=true;lastTime=performance.now();}
function keysClear(){for(const k in keys)delete keys[k];Object.assign(touch,{x:0,y:0,thrust:false});document.querySelectorAll('.pressed').forEach(n=>n.classList.remove('pressed'));}
$('archive-open').onclick=()=>{$('intro').hidden=true;flight.reset('controlroom');$('flight-hud').hidden=false;};
$('separate').onclick=()=>{if(!dialogOpen)flight.separate()};
$('begin').onclick=()=>{flight.enter('clearance');$('intro').hidden=true;showDialog('26 НОЯБРЯ 2011 · SLC-41','Разрешение на запуск','Руководитель запуска NASA Омар Баэз дал «go» для начала миссии. Здесь передан смысл решения, а не вымышленная стенограмма. Примите сигнал, затем удерживайте ракету в коридоре. Реальный запуск был автоматическим.',[['Сигнал принят · старт',()=>{flight.reset('controlroom');$('flight-hud').hidden=false}]],'https://www3.nasa.gov/centers/kennedy/pdf/676259main_aug10-2012.pdf')};
$('info').onclick=()=>{if(dialogOpen)return;s.paused=true;showDialog('ИСТОРИЯ И УСЛОВНОСТИ','Беспилотная миссия, игровой маршрут','Atlas V 541 компании ULA запустил Curiosity 26 ноября 2011. Посадка на Марсе состоялась 6 августа 2012 по UTC. Полёт через препятствия и близкий пролёт Фобоса вымышлены для игры. В реальности плотного астероидного поля не было; MSL не выходил на орбиту Марса. Камеры, время, масштабы и пороги посадки условные.',[['Вернуться',()=>{s.paused=false}]],'https://www.jpl.nasa.gov/news/press_kits/MSLLanding.pdf')};
$('pause').onclick=()=>{if(dialogOpen||['story','success','failed','clearance'].includes(s.phase))return;s.paused=true;showDialog('ПАУЗА','Полёт приостановлен','Управление: WASD / стрелки. При посадке Пробел или кнопка ТЯГА включает тормозящие двигатели. На телефоне используйте экранные кнопки.',[['Продолжить',()=>{s.paused=false}],['Повторить этап',()=>{flight.reset(s.phase)}]])};
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Space'&&!e.repeat&&!dialogOpen)flight.separate();if(e.code==='Escape'&&!e.repeat)$('pause').click()});addEventListener('keyup',e=>{delete keys[e.code]});
for(const b of document.querySelectorAll('[data-x],[data-y],#thrust')){
 b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('pressed');if(b.id==='thrust')touch.thrust=true;else if(b.dataset.x)touch.x=+b.dataset.x;else touch.y=+b.dataset.y};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{b.classList.remove('pressed');if(b.id==='thrust')touch.thrust=false;else if(b.dataset.x)touch.x=0;else touch.y=0});
}
addEventListener('blur',()=>{keysClear();if(!dialogOpen&&!['story','clearance','success','failed'].includes(s.phase))$('pause').click()});document.addEventListener('visibilitychange',()=>{lastTime=performance.now();keysClear()});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const sky=createSpaceSky(scene);let zoomTarget=58;
const transitions=createTransitionManager([vehicle,ground,cruise,earth,atmosphere,mars,phobos,landing,lander],[vehicle,cruise,lander]);
let fogDistance=12000;
addEventListener('wheel',e=>{if(dialogOpen)return;e.preventDefault();zoomTarget=THREE.MathUtils.clamp(zoomTarget+e.deltaY*.025,30,85)},{passive:false});
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t)},camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),lookCurrent=new THREE.Vector3();
function renderWorld(dt,input){
 const phase=s.phase==='failed'?s.failedPhase:s.phase,t=s.time;
 if(hazardGeneration!==s.generation){for(const m of hazardMeshes.values()){scene.remove(m);m.material.dispose()}for(const n of hazardNodes.values())n.remove();hazardMeshes.clear();hazardNodes.clear();hazardGeneration=s.generation;}
 updateStages(dt);
 smoke.visible=['countdown','ascent'].includes(phase);
 if(smoke.visible)for(const cloud of smoke.children){const i=cloud.userData.seed,age=(t+i*.27)%6,a=i*2.399;cloud.position.set(Math.cos(a)*age*2,.3+age*.3,Math.sin(a)*age*2);cloud.scale.setScalar(.3+age*.7);cloud.material.opacity=Math.sin(age/6*Math.PI)*.22*Math.min(1,t)* (phase==='ascent'?Math.max(0,1-t/8):1);}
 const launch=['story','clearance','controlroom','cabin','countdown','ascent'].includes(phase),space=['departure','cruise','phobos','approach'].includes(phase),land=['entry','landing','success'].includes(phase);
 vehicle.visible=launch;ground.visible=launch;cruise.visible=space;earth.visible=launch||phase==='departure';atmosphere.visible=earth.visible;mars.visible=space;phobos.visible=space;landing.visible=land;lander.visible=land;starfield.visible=true;
 scene.background=new THREE.Color(launch&&phase!=='story'&&phase!=='clearance'?0x1d3a51:0x060b12);
  if(phase==='ascent')scene.background.lerp(new THREE.Color(0x02060b),smooth(t/18));
  starfield.material.transparent=true;starfield.material.opacity=launch&&!['story','clearance'].includes(phase)?smooth((t-6)/12):1;
 earth.position.set(0,-160,-160);atmosphere.position.copy(earth.position);earth.rotation.y=.5;
 if(launch){
  const h=phase==='ascent'?s.altitude:phase==='countdown'?smooth(t/6)*.5:0;
  vehicle.position.set(s.x*.35,h,0);vehicle.rotation.z=-s.x*.025;ground.position.y=0;
  const hero=['story','clearance'].includes(phase);
  camPos.set(hero?12:15,h+(hero?8:7),hero?24:25);camLook.set(hero?-8:0,h+6,0);
  if(hero&&innerWidth<700){camPos.set(18,10,36);camLook.set(0,6,0)}
  if(!hero){camPos.copy(vehicle.position).add(new THREE.Vector3(15,12,30));camLook.copy(vehicle.position).add(new THREE.Vector3(0,6,0));}
  plume.visible=plumeCore.visible=phase==='ascent'&&s.stage<2||phase==='countdown';plume.scale.y=1+Math.sin(t*35)*.12;
  if(hero){ground.visible=false;earth.position.set(45,-100,-280);atmosphere.position.copy(earth.position)}
 }else if(space){
  ground.visible=false;cruise.position.set(s.x,s.y,s.z||0);
  cruise.rotation.x=THREE.MathUtils.damp(cruise.rotation.x,s.vy*.018,4,dt);
  cruise.rotation.y=THREE.MathUtils.damp(cruise.rotation.y,-s.vx*.025,4,dt);
  cruise.rotation.z=THREE.MathUtils.damp(cruise.rotation.z,-s.vx*.018,4,dt);
  // Local +Z is behind the craft; follow heading without inheriting roll.
  const heading=new THREE.Quaternion().setFromEuler(new THREE.Euler(cruise.rotation.x,cruise.rotation.y,0,'YXZ'));
  // Close, elevated arcade chase: foreground craft with a clear view along the route.
  camPos.copy(cruise.position).add(new THREE.Vector3(2,11,16).applyQuaternion(heading));
  camLook.copy(cruise.position).add(new THREE.Vector3(0,1,-12).applyQuaternion(heading));
  // Continuous approach across departure -> cruise -> Phobos -> entry.
  const journey=({departure:0,cruise:16,phobos:58,approach:70})[phase]+t;
  const progress=THREE.MathUtils.clamp(journey/82,0,1);
  const marsDistance=850-690*smooth(progress);
  mars.position.set(0,-marsDistance*.32,-marsDistance);mars.scale.setScalar(.65);
  // Enlarged educational orbit; always present, with a continuous phase angle.
  const orbit=.25+journey*.035;
  phobos.position.copy(mars.position).add(new THREE.Vector3(Math.cos(orbit)*110,Math.sin(orbit)*24,Math.sin(orbit)*52));
  phobos.rotation.set(.2,journey*.08,.1);phobos.scale.set(7,5,6);
  if(phase==='departure'){
   vehicle.visible=s.stage<3;vehicle.position.set(s.x,-8,0);vehicle.rotation.set(0,0,0);cruise.visible=s.stage>=3;plume.visible=plumeCore.visible=false;
   // Craft faces local -Z. The Earth recedes toward +Z, behind its velocity vector.
   earth.position.set(-155,-115,100+t*9);atmosphere.position.copy(earth.position);
  }else{
  }
 }else if(land){
  const entry=phase==='entry',alt=entry?100-t*3:s.altitude;
  lander.position.set(s.x,alt,0);lander.rotation.z=-s.vx*.04;
  camPos.set(s.x+18,alt+10,28);camLook.set(s.x,alt+1,0);
  scene.background.set(0x846350);scene.fog=new THREE.Fog(0x846350,160,650);
  landFlames.forEach(f=>{f.visible=entry||input.thrust;f.scale.y=.8+Math.sin(t*40)*.2});
  if(phase==='success'){flyaway=Math.min(8,flyaway+dt);lander.position.y=0;camPos.set(12,6,16);camLook.set(0,1,0)}
  descent.position.set(flyaway*3,3.5+flyaway*2,0);cables.forEach(c=>{c.visible=phase!=='success'});
  landFlames.forEach(f=>{f.visible=phase!=='success'&&(entry||input.thrust)});
 }
 if(!land)scene.fog=null;
 const actor=launch?vehicle:space?cruise:land?lander:null;
 const shift=transitions.apply(dt,actor,scene.background);camPos.add(shift);camLook.add(shift);
 fogDistance=THREE.MathUtils.damp(fogDistance,land?650:12000,1.7,dt);scene.fog=new THREE.Fog(scene.background,160,fogDistance);
 // The former cabin beat now previews the pad from outside as well.
 $('cinema').hidden=phase!=='controlroom';$('cinema-room').hidden=phase!=='controlroom';$('cinema-cabin').hidden=true;
 camera.fov=THREE.MathUtils.damp(camera.fov,zoomTarget,4,dt);camera.updateProjectionMatrix();
 sky.update(dt,starfield.material.opacity);starfield.visible=false;
 const ease=1-Math.exp(-dt*2.8);camera.position.lerp(camPos,ease);lookCurrent.lerp(camLook,ease);camera.lookAt(lookCurrent);firstFrame=false;
 const shake=updateImpact(dt),unshakenPosition=camera.position.clone();
 camera.position.x+=Math.sin(effectAge*97)*shake*.9;camera.position.y+=Math.sin(effectAge*131+1)*shake*.65;camera.position.z+=Math.sin(effectAge*83)*shake*.35;camera.lookAt(lookCurrent);camera.rotateZ(Math.sin(effectAge*73)*shake*.025);
 $('reticle').style.opacity='0';$('view-label').textContent=space?'CHASE CAM · СЗАДИ И СВЕРХУ':'ВНЕШНЯЯ КАМЕРА';
 const moonScreen=phobos.position.clone().project(camera);$('phobos-label').hidden=!space||Math.abs(moonScreen.x)>1||Math.abs(moonScreen.y)>1||moonScreen.z>1;
 $('phobos-label').style.left=(moonScreen.x*.5+.5)*innerWidth+'px';$('phobos-label').style.top=(-moonScreen.y*.5+.5)*innerHeight+'px';
 for(const [id,m] of hazardMeshes)if(!s.objects.some(o=>o.id===id)){m.material.opacity=THREE.MathUtils.damp(m.material.opacity,0,5,dt);hazardNodes.get(id)?.remove();hazardNodes.delete(id);if(m.material.opacity<.01){scene.remove(m);m.material.dispose();hazardMeshes.delete(id)}}
 for(const o of s.objects){
  let m=hazardMeshes.get(o.id);if(!m){const material=rockMats[o.kind].clone();material.transparent=true;material.opacity=0;m=mesh(rockGeos[o.kind],material);m.scale.setScalar(o.r);hazardMeshes.set(o.id,m);const n=document.createElement('div');n.className='hazard';$('hazards').appendChild(n);hazardNodes.set(o.id,n)}
  m.material.opacity=THREE.MathUtils.damp(m.material.opacity,1,5,dt);
  m.position.set(o.x,o.y,o.z);m.rotation.x=t*.2+o.id;m.rotation.y=t*.16;m.visible=true;
  const p=m.position.clone().project(camera),n=hazardNodes.get(o.id);n.hidden=o.z>(s.z||0)-3||s.phase!=='cruise';n.style.left=(p.x*.5+.5)*innerWidth+'px';n.style.top=(-p.y*.5+.5)*innerHeight+'px';n.textContent=Math.max(0,Math.round((s.z||0)-o.z))+' м';n.className='hazard'+(Math.abs(o.x-s.x)<4&&Math.abs(o.y-s.y)<4?' danger':'');
 }
 $('impact').style.opacity=String(Math.max(0,1-effectAge/.3)*.45);
 renderer.render(scene,camera);
 camera.position.copy(unshakenPosition);
}
function updateUI(){
 if(s.phase!==lastPhase){

  keysClear();lastPhase=s.phase;flyaway=0;document.body.dataset.phase=s.phase;
  const info=phaseInfo[s.phase];if(info){$('phase-number').textContent=info[0];$('phase-title').textContent=info[1];$('phase-hint').textContent=info[2];}
  if(s.phase==='failed')showDialog('ПОПЫТКА НЕ УДАЛАСЬ','Попробуем ещё раз',s.reason,[['Повторить этап',()=>{flight.reset(s.failedPhase)}],['С начала полёта',()=>{flight.reset('countdown')}]]);
  if(s.phase==='success')showDialog('6 АВГУСТА 2012 · ИСТОРИЧЕСКАЯ ОСНОВА','Curiosity на поверхности','Вы выполнили условное упражнение мягкого касания. В реальной миссии посадочная ступень опустила марсоход на тросах и улетела в сторону. Теперь изучите архивные результаты Curiosity и передайте данные на Землю.',[['Исследовать Марс →',()=>{location.href='mars.html'}],['Повторить посадку',()=>{flight.reset('landing')}]],'https://www.jpl.nasa.gov/missions/mars-science-laboratory-curiosity-rover-msl/');
 }
 const phase=s.phase,land=phase==='landing';
 const stage=flight.stages[s.stage],staging=['ascent','departure'].includes(phase)&&stage;
 $('separate').hidden=!staging;
 if(!staging&&phaseInfo[phase])$('phase-hint').textContent=phaseInfo[phase][2];
 if(staging){const ready=stage.phase===phase&&s.altitude>=stage.min&&s.altitude<=stage.max;$('separate').classList.toggle('ready',ready);$('separate').textContent=ready?'ОТДЕЛИТЬ · ПРОБЕЛ':'ЖДИТЕ · '+stage.min+'–'+stage.max+' км';$('phase-hint').textContent=stage.name+' · окно '+stage.min+'–'+stage.max+' км. Сейчас '+s.altitude.toFixed(1)+' км. '+(ready?'Нажмите ПРОБЕЛ сейчас!':'Раннее или позднее отделение — потеря аппарата.')+' Порядок и высоты — игровые, не исторические.';}
$('thrust').hidden=!land;
 $('controls').hidden=!['ascent','departure','cruise','phobos','approach','landing'].includes(phase);
 $('countdown').textContent=phase==='countdown'?String(Math.max(1,6-Math.floor(s.time))):'';
 $('phase-progress').style.width=(flight.durations[phase]?Math.min(100,s.time/flight.durations[phase]*100):land?100-s.altitude/70*100:0)+'%';
 const m=land?['ВЫСОТА',Math.max(0,s.altitude).toFixed(0)+' м','СНИЖЕНИЕ / ТОПЛИВО',s.fall.toFixed(1)+' м/с · '+s.fuel.toFixed(0)+'%']:phase==='ascent'?['КОРИДОР',s.x.toFixed(1)+' / ±6,7','ТОПЛИВО',s.fuel.toFixed(0)+'%']:['ДО СЛЕДУЮЩЕГО ЭТАПА',Math.max(0,(flight.durations[phase]||0)-s.time).toFixed(0)+' с','ЦЕЛОСТНОСТЬ',s.health+' / 3'];
 $('metric-one-name').textContent=m[0];$('metric-one').textContent=m[1];$('metric-two-name').textContent=m[2];$('metric-two').textContent=m[3];
 if(['cruise','phobos','approach'].includes(phase)){ $('metric-one-name').textContent='СКОРОСТЬ · ИГРОВАЯ';$('metric-one').textContent=s.speed.toFixed(0)+' м/с';$('metric-two-name').textContent='ЩИТ / КОРПУС';$('metric-two').textContent=Math.round(s.shield/80*100)+'% / '+Math.round(s.hull)+'%';}
 $('subtitle').textContent=phase==='cruise'?'Астероиды и защитный щит — игровые условности миссии':phase==='phobos'?'Фобос — больший из двух спутников Марса. Близкий пролёт в игре вымышлен.':land?'Посадочная ступень + марсоход · игровые пороги касания':phase==='entry'?'Вход → торможение → Sky Crane · сокращённый учебный переход':'';
 const i=({countdown:0,ascent:0,departure:1,cruise:2,phobos:3,approach:4,entry:5,landing:5})[phase];Array.from($('timeline').children).forEach((n,j)=>n.classList.toggle('active',j===i));
}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,Math.max(0,(now-lastTime)/1000));lastTime=now;
 const input={x:touch.x||((keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)),y:touch.y||((keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)),thrust:touch.thrust||keys.Space};
 if(!dialogOpen)flight.tick(dt,input);updateUI();renderWorld(s.paused?0:dt,input);
}
camera.position.set(18,9,36);lookCurrent.set(-12,6,0);requestAnimationFrame(animate);






