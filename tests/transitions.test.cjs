const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context={console};vm.createContext(context);const run=s=>vm.runInContext(s,context);
run(fs.readFileSync('js/three.vendor.js','utf8'));run(fs.readFileSync('js/transition-manager.js','utf8'));
run(`const ship=new THREE.Group(),capsule=new THREE.Group(),planet=new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshBasicMaterial());const sceneColor=new THREE.Color(0);const manager=createTransitionManager([ship,capsule,planet],[ship,capsule]);
ship.position.y=320;capsule.visible=false;for(let i=0;i<300;i++){ship.visible=true;capsule.visible=false;ship.position.y=320;manager.apply(1/60,ship,sceneColor)}
const oldY=ship.position.y;ship.visible=false;capsule.visible=true;capsule.position.set(0,0,0);manager.apply(1/60,capsule,sceneColor);`);
assert(run('capsule.position.y>300 && capsule.position.y<oldY'),'new actor begins from previous actor, not its distant target');
assert(run('ship.visible'),'old actor fades instead of disappearing');
run(`for(let i=0;i<240;i++){ship.visible=false;capsule.visible=true;capsule.position.set(0,0,0);manager.apply(1/60,capsule,sceneColor)}`);
assert(run('capsule.position.y<.1'));assert(run('!ship.visible'));
run(`const before=planet.position.clone();planet.position.z=-100;manager.apply(0,capsule,sceneColor)`);assert(run('planet.position.equals(before)'),'pause freezes interpolation');
console.log('PASS actor continuity, opacity fade, settling and paused interpolation');
