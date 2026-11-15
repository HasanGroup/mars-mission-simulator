const fs=require('fs');const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
edit('mars.html',s=>s.replace('<script src="js/mars-rover.js">','<script src="js/rover-course.js"></script><script src="js/mars-rover.js">').replace('<div id="status-panel" class="panel">','<div id="status-panel" class="panel"><div id="course-status" role="status">Маршрут · 3:00</div>').replace('Посадка позади. Изучите три реальных результата Curiosity:', 'Аркадный маршрут на 2–3 минуты: объезжайте камни и кратеры; песчаные дюны замедляют движение. Успейте изучить три реальных результата Curiosity:').replace('Затем настройте передачу данных на Землю.','Соберите все три записи за 180 секунд игрового движения, затем настройте передачу на Землю. Чтение карточек останавливает таймер.'));
edit('js/mars-rover.js',s=>s.replaceAll('timeLeft:900','timeLeft:180,hitCooldown:0').replace("addScienceObject('hottah',8,-6","addScienceObject('hottah',18,-20").replace("addScienceObject('john-klein',-12,14","addScienceObject('john-klein',-20,-50").replace("addScienceObject('rad',22,18","addScienceObject('rad',12,-80").replace('const maxSpeed = 0.18','const maxSpeed = 0.035').replace('const accel = 0.006','const accel = 0.0013').replace('state.energy -= 0.012','state.energy -= 0.003').replace('state.energy -= 0.008','state.energy -= 0.002').replace('const x = (Math.random() - 0.5) * WORLD_SIZE * 0.85;','const x = (i%2?1:-1)*(42+i%20);').replace('const z = (Math.random() - 0.5) * WORLD_SIZE * 0.85;','const z = -i*2;').replace('// ===================== ROVER =====================',`const courseHazards=ROVER_COURSE.hazards.map(h=>({...h}));
for(const h of courseHazards){
 const shape=h.type==='crater'?new THREE.CylinderGeometry(h.r,h.r,.2,40):h.type==='dune'?new THREE.SphereGeometry(1,24,12):rockGeo;
 const marker=new THREE.Mesh(shape,new THREE.MeshStandardMaterial({color:h.type==='crater'?0x443529:h.type==='dune'?0xc89462:0x6b4937,roughness:1}));
 if(h.type==='dune')marker.scale.set(h.r,1.3,h.r*.65);else if(h.type==='rock')marker.scale.set(h.r,h.r*.6,h.r);
 marker.position.set(h.x,getHeight(h.x,h.z)+(h.type==='crater'?.03:.3),h.z);scene.add(marker);
}
const trailPoints=[];
for(let i=1;i<ROVER_COURSE.path.length;i++){const a=ROVER_COURSE.path[i-1],b=ROVER_COURSE.path[i];for(let j=0;j<24;j++){const t=j/24,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;trailPoints.push(x,getHeight(x,z)+.12,z)}}
const trailGeometry=new THREE.BufferGeometry();trailGeometry.setAttribute('position',new THREE.Float32BufferAttribute(trailPoints,3));scene.add(new THREE.Points(trailGeometry,new THREE.PointsMaterial({color:0xe7c991,size:.2})));
function failSurface(message){state.finished=true;state.keys={};velocity.set(0,0,0);document.getElementById('surface-result').hidden=false;document.getElementById('surface-result-title').textContent='Маршрут не завершён';document.getElementById('surface-result-text').textContent=message;}
// ===================== ROVER =====================`).replace('  const frame=dt*60;',`  dt=Math.max(0,Math.min(dt,.05));const frame=dt*60;
  if(!marsProgress(objects).ready){state.timeLeft=Math.max(0,state.timeLeft-dt);if(state.timeLeft===0){failSurface('Время вышло. Следуйте светлым отметкам, объезжайте препятствия и соберите три записи.');return}}
  state.hitCooldown=Math.max(0,state.hitCooldown-dt);`).replace('  const h = getHeight(newPos.x, newPos.z);',`  for(const hazard of courseHazards){const dx=newPos.x-hazard.x,dz=newPos.z-hazard.z,dist=Math.hypot(dx,dz),radius=hazard.r+1.2;
   if(dist>=radius)continue;
   if(hazard.type==='dune'){velocity.multiplyScalar(Math.pow(.85,frame));continue;}
   const nx=dist>.001?dx/dist:1,nz=dist>.001?dz/dist:0;
   newPos.x=hazard.x+nx*(radius+.02);newPos.z=hazard.z+nz*(radius+.02);
   const impactSpeed=velocity.length(),dot=velocity.x*nx+velocity.z*nz;if(dot<0){velocity.x-=dot*1.25*nx;velocity.z-=dot*1.25*nz;}
   if(state.hitCooldown===0&&impactSpeed>.005){state.integrity=Math.max(0,state.integrity-15);state.hitCooldown=1.5;showToast(hazard.type==='crater'?'Край кратера: потеря прочности. Объезжайте тёмную область.':'Удар о камень. Сбавьте скорость и объезжайте сбоку.');if(state.integrity===0){failSurface('Ходовая часть повреждена. Объезжайте камни и кратеры; Пробел — тормоз.');return}}
  }
  const h = getHeight(newPos.x, newPos.z);`).replace("  const e = Math.max(0, Math.round(state.energy));",`  const seconds=Math.ceil(state.timeLeft);document.getElementById('course-status').textContent='МАРШРУТ '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' · КОРПУС '+state.integrity+'%';
  const e = Math.max(0, Math.round(state.energy));`).replace('  // Objects\n',`  mctx.strokeStyle='#b39565';mctx.beginPath();ROVER_COURSE.path.forEach((p,i)=>{if(i)mctx.lineTo(cx+p[0]*scale,cy+p[1]*scale);else mctx.moveTo(cx+p[0]*scale,cy+p[1]*scale)});mctx.stroke();
  courseHazards.forEach(h=>{mctx.beginPath();mctx.arc(cx+h.x*scale,cy+h.z*scale,h.r*scale,0,Math.PI*2);mctx.fillStyle=h.type==='dune'?'#bd925c':'#793e32';mctx.fill()});
  // Objects\n`));
