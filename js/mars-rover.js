

// ===================== CONSTANTS =====================
const WORLD_SIZE = 220;
const TERRAIN_RES = 128;
const GRAVITY_MARS = 3.71;

// ===================== STATE =====================
const state = {
  energy: 100,
  integrity: 100,
  scanning: false,
  nearObject: null,
  scannedIds: new Set(),
  missionIndex: 0,
  missionProgress: 0,
  cameraMode: 0, // 0 follow, 1 orbit, 2 top
  started: false,
  keys: {},
  dustStorm: false,
  timeLeft:180,hitCooldown:0, finished:false,
  time: 0
};

// ===================== MISSIONS =====================


// ===================== SCIENCE OBJECTS DATA =====================
const scienceData=Object.fromEntries(SCIENCE_ARCHIVE.map(item=>[item.id,{name:item.name,type:item.instrument,content:'<p>'+item.date+'</p><p>'+item.finding+'</p><div class="fact">'+item.benefit+'</div><p class="note">Архивный результат NASA. Маркер представляет запись, не вновь найденный объект. Расположение на схеме не соответствует реальным координатам.</p><a target="_blank" rel="noopener" href="'+item.source+'">Источник NASA/JPL</a>'}]));

// ===================== SCENE SETUP =====================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6c5143);
scene.fog = new THREE.FogExp2(0x6c5143, 0.009);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 12, 22);

let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(error){
 document.getElementById('loading').innerHTML='Не удалось включить 3D-графику (WebGL). Откройте игру в браузере с поддержкой WebGL.<br><a href="index.html">Вернуться к запуску</a>';throw error;
}
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xe3d9c8, 0.65);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffe4c4, 2.4);
sun.position.set(40, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 180;
sun.shadow.camera.left = -70;
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
sun.shadow.bias = -0.0003;
scene.add(sun);

const hemi = new THREE.HemisphereLight(0xc6bbaf, 0x4a362a, 1.1);
scene.add(hemi);

// ===================== TERRAIN =====================
function createTerrain() {
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, TERRAIN_RES, TERRAIN_RES);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = [];
  const color = new THREE.Color();

  // Simple layered noise
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    let h = 0;
    h += Math.sin(x * 0.03) * Math.cos(z * 0.025) * 2.8;
    h += Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.07) * 1.1;
    h += Math.sin(x * 0.18) * Math.sin(z * 0.15) * 0.45;
    // subtle crater-like dips
    const cx = x + 18, cz = z - 25;
    const d = Math.sqrt(cx*cx + cz*cz);
    if (d < 18) h -= (1 - d/18) * (1 - d/18) * 4.5;
    const cx2 = x - 35, cz2 = z + 12;
    const d2 = Math.sqrt(cx2*cx2 + cz2*cz2);
    if (d2 < 11) h -= (1 - d2/11) * (1 - d2/11) * 2.8;

    pos.setY(i, h);

    // Color variation
    const t = (h + 4) / 10;
    color.setHSL(0.065 + t * 0.015, 0.30 - t * 0.08, 0.30 + t * 0.12 + Math.random() * 0.035);
    colors.push(color.r, color.g, color.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: false
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);

  // Store for height queries
  return { mesh, geo };
}

const terrain = createTerrain();

function getHeight(x, z) {
  // Approximate height from the same noise function
  let h = 0;
  h += Math.sin(x * 0.03) * Math.cos(z * 0.025) * 2.8;
  h += Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.07) * 1.1;
  h += Math.sin(x * 0.18) * Math.sin(z * 0.15) * 0.45;
  const cx = x + 18, cz = z - 25;
  const d = Math.sqrt(cx*cx + cz*cz);
  if (d < 18) h -= (1 - d/18) * (1 - d/18) * 4.5;
  const cx2 = x - 35, cz2 = z + 12;
  const d2 = Math.sqrt(cx2*cx2 + cz2*cz2);
  if (d2 < 11) h -= (1 - d2/11) * (1 - d2/11) * 2.8;
  return h;
}

// ===================== ROCKS & OBJECTS =====================
const objects = [];
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a4a30, roughness: 0.9, metalness: 0.05 });

function addScienceObject(id, x, z, scale, dataKey, yOffset = 0) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(rockGeo, rockMat.clone());
  mesh.material.color.setHSL(0.04 + Math.random()*0.04, 0.45, 0.25 + Math.random()*0.1);
  mesh.scale.set(scale * (0.8 + Math.random()*0.4), scale * (0.6 + Math.random()*0.5), scale * (0.8 + Math.random()*0.4));
  mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Glow ring when near
  const ringGeo = new THREE.RingGeometry(scale * 1.6, scale * 1.85, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff9030,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  const h = getHeight(x, z);
  group.position.set(x, h + yOffset, z);

  scene.add(group);
  objects.push({
    id,
    group,
    mesh,
    ring,
    dataKey,
    scanned: false,
    position: new THREE.Vector3(x, h, z)
  });
}

// Three archive stations, not fictitious scientific samples.
addScienceObject('hottah',18,-20,1.4,'hottah');
addScienceObject('john-klein',-20,-50,1.8,'john-klein');
addScienceObject('rad',12,-80,1.5,'rad');
// Extra decorative rocks
for (let i = 0; i < 40; i++) {
  const x = (i%2?1:-1)*(42+i%20);
  const z = -i*2;
  const s = 0.3 + Math.random() * 0.9;
  const mesh = new THREE.Mesh(rockGeo, rockMat.clone());
  mesh.material.color.setHSL(0.05, 0.4, 0.22 + Math.random()*0.12);
  mesh.scale.set(s, s * (0.5 + Math.random()*0.6), s);
  mesh.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
  mesh.position.set(x, getHeight(x, z) + s * 0.3, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

const courseHazards=ROVER_COURSE.hazards.map(h=>({...h}));
for(const h of courseHazards){
 const shape=h.type==='crater'?new THREE.CircleGeometry(h.r,40):h.type==='dune'?new THREE.SphereGeometry(1,24,12):rockGeo;
 if(h.type==='crater'){shape.rotateX(-Math.PI/2);const points=shape.attributes.position;for(let i=0;i<points.count;i++)points.setY(i,getHeight(h.x+points.getX(i),h.z+points.getZ(i))-getHeight(h.x,h.z)+.06);shape.computeVertexNormals();}
 const marker=new THREE.Mesh(shape,new THREE.MeshStandardMaterial({color:h.type==='crater'?0x443529:h.type==='dune'?0xc89462:0x6b4937,roughness:1}));
 if(h.type==='dune')marker.scale.set(h.r,1.3,h.r*.65);else if(h.type==='rock')marker.scale.set(h.r,h.r*.6,h.r);
 marker.position.set(h.x,getHeight(h.x,h.z)+(h.type==='crater'?.03:.3),h.z);scene.add(marker);
}
const trailPoints=[];
for(let i=1;i<ROVER_COURSE.path.length;i++){const a=ROVER_COURSE.path[i-1],b=ROVER_COURSE.path[i];for(let j=0;j<24;j++){const t=j/24,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;trailPoints.push(x,getHeight(x,z)+.12,z)}}
const trailGeometry=new THREE.BufferGeometry();trailGeometry.setAttribute('position',new THREE.Float32BufferAttribute(trailPoints,3));scene.add(new THREE.Points(trailGeometry,new THREE.PointsMaterial({color:0xe7c991,size:.2})));
function failSurface(message){state.finished=true;state.keys={};velocity.set(0,0,0);document.getElementById('surface-result').hidden=false;document.getElementById('surface-result-title').textContent='Маршрут не завершён';document.getElementById('surface-result-text').textContent=message;}
// ===================== ROVER =====================
function createRover() {
  const rover = new THREE.Group();

  // Body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.55, metalness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.6), bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  rover.add(body);

  // Mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 8), bodyMat);
  mast.position.set(0.3, 1.5, 0);
  rover.add(mast);

  // Camera head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), bodyMat);
  head.position.set(0.3, 2.15, 0);
  rover.add(head);

  // Schematic rear radioisotope generator, not solar panels.
  const generatorMat=new THREE.MeshStandardMaterial({color:0x96918a,metalness:.6,roughness:.5});
  const generator=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,1,12),generatorMat);
  generator.rotation.z=Math.PI/2;generator.position.set(-1.2,.95,0);rover.add(generator);
  for(let i=0;i<8;i++){const fin=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,.8),generatorMat);fin.rotation.x=i*Math.PI/8;fin.position.set(-1.2,.95,0);rover.add(fin);}
  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 12);
  const wheels = [];
  const positions = [
    [-0.9, 0.38, 0.75], [0.9, 0.38, 0.75],
    [-0.9, 0.38, 0], [0.9, 0.38, 0],
    [-0.9, 0.38, -0.75], [0.9, 0.38, -0.75]
  ];
  positions.forEach(p => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(...p);
    w.castShadow = true;
    rover.add(w);
    wheels.push(w);
  });

  // Suspension arms (visual)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x888880, roughness: 0.6 });
  [[-0.9, 0.75], [0.9, 0.75], [-0.9, -0.75], [0.9, -0.75]].forEach(([x, z]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.7), armMat);
    arm.position.set(x, 0.55, z * 0.5);
    rover.add(arm);
  });

  rover.position.set(0, getHeight(0, 0) + 0.1, 0);
  scene.add(rover);

  return { group: rover, wheels, body };
}

const rover = createRover();
if(typeof NASAModels!=='undefined'){
 NASAModels.load('curiosity').then(model=>{
  // The NASA asset is a single static mesh; do not distort it to animate wheels.
  NASAModels.normalize(model,2.2);
  // NASA mesh front +Z maps to game forward -Z.
  model.rotation.y=Math.PI;
  const fallback=rover.group.children.slice();
  fallback.forEach(n=>{n.visible=false});
  rover.group.add(model);
  const credit=document.getElementById('model-credit');
  if(credit)credit.textContent='Curiosity · 3D-модель NASA / VTAD · рельеф условный';
 }).catch(error=>{
  console.warn('Модель Curiosity недоступна',error);
  const credit=document.getElementById('model-credit');
  if(credit)credit.textContent='Резервная схема Curiosity · 3D-модель не загрузилась';
 });
}

// ===================== PARTICLES (dust) =====================
const dustCount = 600;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
const dustVel = [];
for (let i = 0; i < dustCount; i++) {
  dustPos[i*3] = (Math.random() - 0.5) * 80;
  dustPos[i*3+1] = Math.random() * 12;
  dustPos[i*3+2] = (Math.random() - 0.5) * 80;
  dustVel.push({
    x: (Math.random() - 0.5) * 0.02,
    y: Math.random() * 0.008,
    z: (Math.random() - 0.5) * 0.02
  });
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xc07040,
  size: 0.08,
  transparent: true,
  opacity: 0.16,
  depthWrite: false
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// ===================== CONTROLS =====================
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let roverAngle = 0;
const maxSpeed = 0.105;
const accel = 0.003;
const friction = 0.94;
const turnSpeed = 0.035;

window.addEventListener('keydown', e => {
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(!state.started||state.finished)return;
  state.keys[e.code] = true;
  if (e.code === 'KeyE' && state.nearObject && !state.scanning) {
    startScan(state.nearObject);
  }
  if (e.code === 'KeyC') {
    state.cameraMode = (state.cameraMode + 1) % 3;
  }
});
window.addEventListener('keyup', e => { state.keys[e.code] = false; });

// ===================== CAMERA =====================
const camOffset = new THREE.Vector3(0, 9, 16);
const camLook = new THREE.Vector3();

let zoomTarget=55;
window.addEventListener('wheel',e=>{if(e.target.closest?.('button,.overlay'))return;e.preventDefault();zoomTarget=THREE.MathUtils.clamp(zoomTarget+e.deltaY*.025,30,75)},{passive:false});
function updateCamera(dt=1/60) {
  const roverPos = rover.group.position;

  if (state.cameraMode === 0) {
    // Follow
    const offset = camOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), roverAngle);
    const target = roverPos.clone().add(offset);
    camera.position.lerp(target, 1-Math.exp(-5*dt));
    camLook.lerp(roverPos.clone().add(new THREE.Vector3(0, 1.5, 0)), 1-Math.exp(-6*dt));
    camera.lookAt(camLook);
  } else if (state.cameraMode === 1) {
    // Slightly higher chase
    const offset = new THREE.Vector3(0, 14, 22).applyAxisAngle(new THREE.Vector3(0,1,0), roverAngle);
    camera.position.lerp(roverPos.clone().add(offset), 1-Math.exp(-5*dt));
    camLook.lerp(roverPos.clone().add(new THREE.Vector3(0,1,0)),1-Math.exp(-6*dt));camera.lookAt(camLook);
  } else {
    // Top-down
    camera.position.lerp(new THREE.Vector3(roverPos.x, roverPos.y+45, roverPos.z + 0.1), 1-Math.exp(-5*dt));
    camLook.lerp(roverPos,1-Math.exp(-6*dt));camera.lookAt(camLook);
  }
}

// ===================== GAME LOGIC =====================
function updateRover(dt) {
  if (!state.started || state.scanning || state.finished) return;
  dt=Math.max(0,Math.min(dt,.05));const frame=dt*60;
  if(!marsProgress(objects).ready){state.timeLeft=Math.max(0,state.timeLeft-dt);if(state.timeLeft===0){failSurface('Время вышло. Следуйте светлым отметкам, объезжайте препятствия и соберите три записи.');return}}
  state.hitCooldown=Math.max(0,state.hitCooldown-dt);

  const forward = state.keys['KeyW'] || state.keys['ArrowUp'];
  const back = state.keys['KeyS'] || state.keys['ArrowDown'];
  const left = state.keys['KeyA'] || state.keys['ArrowLeft'];
  const right = state.keys['KeyD'] || state.keys['ArrowRight'];
  const brake = state.keys['Space'];

  if (left) roverAngle += turnSpeed * frame * (forward || back ? 1 : 0.7);
  if (right) roverAngle -= turnSpeed * frame * (forward || back ? 1 : 0.7);

  direction.set(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),roverAngle);

  if (forward && state.energy > 0) {
    velocity.add(direction.clone().multiplyScalar(accel*frame));
    state.energy -= 0.003 * dt * 60;
  }
  if (back && state.energy > 0) {
    velocity.add(direction.clone().multiplyScalar(-accel * 0.6*frame));
    state.energy -= 0.002 * dt * 60;
  }
  if (brake) velocity.multiplyScalar(Math.pow(0.88,frame));

  velocity.multiplyScalar(Math.pow(friction,frame));
  if (velocity.length() > maxSpeed) velocity.setLength(maxSpeed);

  const newPos = rover.group.position.clone().add(velocity.clone().multiplyScalar(frame));
  // Soft bounds
  const half = WORLD_SIZE * 0.45;
  newPos.x = THREE.MathUtils.clamp(newPos.x, -half, half);
  newPos.z = THREE.MathUtils.clamp(newPos.z, -half, half);

  for(const hazard of courseHazards){const dx=newPos.x-hazard.x,dz=newPos.z-hazard.z,dist=Math.hypot(dx,dz),radius=hazard.r+1.2;
   if(dist>=radius)continue;
   if(hazard.type==='dune'){velocity.multiplyScalar(Math.pow(.85,frame));continue;}
   const nx=dist>.001?dx/dist:1,nz=dist>.001?dz/dist:0;
   newPos.x=hazard.x+nx*(radius+.02);newPos.z=hazard.z+nz*(radius+.02);
   const impactSpeed=velocity.length(),dot=velocity.x*nx+velocity.z*nz;if(dot<0){velocity.x-=dot*1.25*nx;velocity.z-=dot*1.25*nz;}
   if(state.hitCooldown===0&&impactSpeed>.005){state.integrity=Math.max(0,state.integrity-15);state.hitCooldown=1.5;showToast(hazard.type==='crater'?'Край кратера: потеря прочности. Объезжайте тёмную область.':'Удар о камень. Сбавьте скорость и объезжайте сбоку.');if(state.integrity===0){failSurface('Ходовая часть повреждена. Объезжайте камни и кратеры; Пробел — тормоз.');return}}
  }
  const h = getHeight(newPos.x, newPos.z);
  newPos.y = h + 0.15;

  rover.group.position.copy(newPos);
  rover.group.rotation.y = roverAngle;

  // Wheel spin
  const speed = velocity.length();
  rover.wheels.forEach(w => { w.rotation.x -= speed * 3.5; });

  // Terrain tilt approximation
  const hL = getHeight(newPos.x - 1, newPos.z);
  const hR = getHeight(newPos.x + 1, newPos.z);
  const hF = getHeight(newPos.x, newPos.z + 1);
  const hB = getHeight(newPos.x, newPos.z - 1);
  rover.group.rotation.z = THREE.MathUtils.lerp(rover.group.rotation.z, (hL - hR) * 0.15, 0.1);
  rover.group.rotation.x = THREE.MathUtils.lerp(rover.group.rotation.x, (hB - hF) * 0.12, 0.1);

  // Energy recovery when almost still
  if (speed < 0.01) {
    state.energy = Math.min(100, state.energy + 0.04 * dt * 60);
  }

  // Proximity check
  let closest = null;
  let minD = 4.5;
  objects.forEach(obj => {
    const d = rover.group.position.distanceTo(obj.position);
    if (d < minD && !obj.scanned) {
      minD = d;
      closest = obj;
    }
    // Ring visibility
    const show = d < 5.5 && !obj.scanned;
    obj.ring.material.opacity = THREE.MathUtils.lerp(obj.ring.material.opacity, show ? 0.7 : 0, 0.15);
    if (show) obj.ring.rotation.z += 0.02;
  });

  state.nearObject = closest;
  document.getElementById('scan-prompt').classList.toggle('show', !!closest);
}

function startScan(obj) {
  if (!state.started || state.finished || state.scanning || !obj || obj.scanned) return;
  if (state.energy < 8) {
    showToast('Недостаточно энергии для сканирования');
    return;
  }
  state.scanning = true;state.keys={};velocity.set(0,0,0);
  state.energy -= 8;
  obj.scanned = true;
  state.scannedIds.add(obj.id);
  obj.ring.material.opacity = 0;
  obj.mesh.material.emissive = new THREE.Color(0x331800);
  obj.mesh.material.emissiveIntensity = 0.3;

  const data = scienceData[obj.dataKey];
  document.getElementById('scan-name').textContent = data.name;
  document.getElementById('scan-type').textContent = data.type;
  document.getElementById('scan-content').innerHTML = data.content;
  document.getElementById('scan-modal').classList.add('visible');

  // Mission progress
  updateMissionProgress(obj);
}

function closeScan() {
  document.getElementById('scan-modal').classList.remove('visible');
  state.scanning = false;
}

document.getElementById('scan-close').addEventListener('click', closeScan);

function updateMissionProgress(){updateMissionUI()}
function updateMissionUI(){
  const progress=marsProgress(objects);
  state.missionIndex=progress.stage;
  document.getElementById('mission-title').textContent=progress.title;
  document.getElementById('mission-desc').textContent=progress.description;
  document.getElementById('mission-progress-bar').style.width=progress.percent+'%';
  document.getElementById('report-button').disabled=!progress.ready;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ===================== HUD UPDATE =====================
function updateHUD() {
  const seconds=Math.ceil(state.timeLeft);document.getElementById('course-status').textContent='МАРШРУТ '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' · КОРПУС '+state.integrity+'%';
  const e = Math.max(0, Math.round(state.energy));
  document.getElementById('energy-val').textContent = e + '%';
  document.getElementById('energy-bar').style.width = e + '%';
  document.getElementById('energy-bar').classList.toggle('low', e < 25);

  document.getElementById('integrity-val').textContent = state.scannedIds.size + '/3';
  document.getElementById('integrity-bar').style.width = state.scannedIds.size/3*100 + '%';
}

// ===================== MINIMAP =====================
const minimapCanvas = document.getElementById('minimap');
const mctx = minimapCanvas.getContext('2d');

function drawMinimap() {
  const s = 160;
  mctx.fillStyle = '#1a0e08';
  mctx.fillRect(0, 0, s, s);

  // Terrain hint
  mctx.fillStyle = '#2a1810';
  mctx.beginPath();
  mctx.arc(s/2, s/2, 70, 0, Math.PI*2);
  mctx.fill();

  const scale = 160 / (WORLD_SIZE * 0.9);
  const cx = s / 2;
  const cy = s / 2;

  mctx.strokeStyle='#b39565';mctx.beginPath();ROVER_COURSE.path.forEach((p,i)=>{if(i)mctx.lineTo(cx+p[0]*scale,cy+p[1]*scale);else mctx.moveTo(cx+p[0]*scale,cy+p[1]*scale)});mctx.stroke();
  courseHazards.forEach(h=>{mctx.beginPath();mctx.arc(cx+h.x*scale,cy+h.z*scale,h.r*scale,0,Math.PI*2);mctx.fillStyle=h.type==='dune'?'#bd925c':'#793e32';mctx.fill()});
  // Objects
  objects.forEach(obj => {
    const px = cx + obj.position.x * scale;
    const py = cy + obj.position.z * scale;
    mctx.beginPath();
    mctx.arc(px, py, obj.scanned ? 3 : 4, 0, Math.PI*2);
    mctx.fillStyle = obj.scanned ? '#4a8a4a' : '#e08030';
    mctx.fill();
  });

  // Rover
  const rx = cx + rover.group.position.x * scale;
  const ry = cy + rover.group.position.z * scale;
  mctx.save();
  mctx.translate(rx, ry);
  mctx.rotate(-roverAngle);
  mctx.fillStyle = '#60b0ff';
  mctx.beginPath();
  mctx.moveTo(0, -6);
  mctx.lineTo(4, 5);
  mctx.lineTo(-4, 5);
  mctx.closePath();
  mctx.fill();
  mctx.restore();
}

// ===================== DUST ANIMATION =====================
function updateDust(dt) {
  const pos = dust.geometry.attributes.position.array;
  const rp = rover.group.position;
  for (let i = 0; i < dustCount; i++) {
    pos[i*3] += dustVel[i].x;
    pos[i*3+1] += dustVel[i].y;
    pos[i*3+2] += dustVel[i].z;

    if (pos[i*3+1] > 14 || Math.abs(pos[i*3] - rp.x) > 50 || Math.abs(pos[i*3+2] - rp.z) > 50) {
      pos[i*3] = rp.x + (Math.random() - 0.5) * 70;
      pos[i*3+1] = Math.random() * 3;
      pos[i*3+2] = rp.z + (Math.random() - 0.5) * 70;
    }
  }
  dust.geometry.attributes.position.needsUpdate = true;
  dust.position.set(0, 0, 0);
}

// ===================== MAIN LOOP =====================
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  state.time += dt;

  if (state.started && !state.finished) {
    updateRover(dt);

    updateCamera(dt);camera.fov=THREE.MathUtils.damp(camera.fov,zoomTarget,5,dt);camera.updateProjectionMatrix();
    updateDust(dt);
    updateHUD();
    drawMinimap();

    // Subtle sun movement
    sun.position.x = Math.cos(state.time * 0.02) * 50;
    sun.position.z = Math.sin(state.time * 0.02) * 30 + 20;
  }

  renderer.render(scene, camera);
}

// ===================== START =====================
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('hud').style.display = 'block';
  state.started = true;
  updateMissionUI();
  showToast('Добро пожаловать на Марс. Приборы активны.');
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function resetSurface(){
 Object.assign(state,{energy:100,integrity:100,scanning:false,nearObject:null,missionIndex:0,missionProgress:0,cameraMode:0,keys:{},time:0,timeLeft:180,hitCooldown:0,finished:false,started:true});state.scannedIds.clear();
 roverAngle=0;velocity.set(0,0,0);rover.group.position.set(0,getHeight(0,0)+.15,0);rover.group.rotation.set(0,0,0);
 objects.forEach(obj=>{obj.scanned=false;obj.ring.material.opacity=0;obj.mesh.material.emissive.set(0x000000)});
 closeScan();document.getElementById('surface-result').hidden=true;document.getElementById('scan-prompt').classList.remove('show');updateMissionUI();updateHUD();
}
for(const button of document.querySelectorAll('[data-key]')){
 button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);state.keys[button.dataset.key]=true});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{delete state.keys[button.dataset.key]});
}
window.addEventListener('blur',()=>{state.keys={}});
document.addEventListener('visibilitychange',()=>{state.keys={};lastTime=performance.now()});
document.getElementById('scan-button').onclick=()=>{if(state.nearObject)startScan(state.nearObject);else showToast('Подъедьте к архивной точке на схеме')};
document.getElementById('camera-button').onclick=()=>{state.cameraMode=(state.cameraMode+1)%3};
document.getElementById('report-button').onclick=()=>{if(marsProgress(objects).ready)location.href='communications.html'};
document.getElementById('retry-surface').onclick=resetSurface;
document.getElementById('surface-again').onclick=resetSurface;
// Hide loading
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 600);
});

animate(performance.now());

