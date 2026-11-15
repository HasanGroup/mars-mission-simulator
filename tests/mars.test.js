const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {marsProgress}=require('../js/mars-progress');
const sample=['hottah','john-klein','rad'].map(dataKey=>({dataKey,scanned:false}));
// All six exploration orders must eventually succeed; early scans remain credited.
let orders=0;
function permutations(left,order=[]){
 if(!left.length){const objects=sample.map(o=>({...o}));for(const i of order)objects[i].scanned=true;assert(marsProgress(objects).ready);orders++;return;}
 left.forEach((value,i)=>permutations(left.filter((_,j)=>i!==j),[...order,value]));
}
permutations(sample.map((_,i)=>i));
const nodes=new Map(),noop=()=>{},listeners={};
const canvas=new Proxy({},{get:()=>noop,set:()=>true});
function element(){return {style:{},classList:{add:noop,remove:noop,toggle:noop},dataset:{},children:[],addEventListener(type,fn){this[type]=fn},appendChild:noop,getContext:()=>canvas};}
const sandbox={console,Math,location:{href:"mars.html"},setTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0},innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(type,fn){listeners[type]=fn},document:{addEventListener:noop,querySelectorAll:()=>[],getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)}}};sandbox.window=sandbox;
vm.createContext(sandbox);
const run=code=>vm.runInContext(code,sandbox);
run(fs.readFileSync('js/three.vendor.js','utf8'));
run('THREE.WebGLRenderer=class {constructor(){this.shadowMap={};this.domElement={}}setSize(){}setPixelRatio(){}render(){}}');
run(fs.readFileSync('js/mars-progress.js','utf8'));
run(fs.readFileSync('js/science-archive.js','utf8'));
run(fs.readFileSync('js/rover-course.js','utf8'));
run(fs.readFileSync('js/mars-rover.js','utf8'));
run('document.getElementById("start-btn").click()');assert(run('state.started'));
run('state.keys.ArrowUp=true;for(let i=0;i<120;i++)updateRover(1/60)');assert(run('rover.group.position.z< -1'));
run('resetSurface();state.keys.KeyS=true;for(let i=0;i<120;i++)updateRover(1/60)');assert(run('rover.group.position.z>.5'));
run('resetSurface();roverAngle=Math.PI/2;state.keys.KeyW=true;for(let i=0;i<120;i++)updateRover(1/60)');assert(run('rover.group.position.x< -1'));
run('resetSurface();state.cameraMode=2;const beforeCam=camera.position.clone();updateCamera(.001)');assert(run('camera.position.distanceTo(beforeCam)<1'),'camera switch should interpolate');
run('resetSurface();state.energy=2;startScan(objects[0])');assert.equal(run('state.scannedIds.size'),0);
run('state.keys={};for(let i=0;i<240;i++)updateRover(1/60)');assert(run('state.energy>=8'));
run('resetSurface();for(const obj of objects){startScan(obj);closeScan()}');assert(run('marsProgress(objects).ready'));
run('document.getElementById("report-button").onclick()');assert.equal(run('location.href'),'communications.html');
run('resetSurface()');assert.equal(run('state.scannedIds.size'),0);assert.equal(run('state.timeLeft'),180);assert(!run('state.finished'));
run('resetSurface()');assert(run('objects.every(obj=>!obj.scanned)'));assert.equal(run('state.energy'),100);
// Drive to three archive stations using ordinary steering keys, then scan only in range.
run(`for(let waypoint=1;waypoint<ROVER_COURSE.path.length;waypoint++){
 const point=ROVER_COURSE.path[waypoint],goal={position:{x:point[0],z:point[1]}};
 for(let step=0;step<18000;step++){
   const dx=goal.position.x-rover.group.position.x,dz=goal.position.z-rover.group.position.z;
   if(Math.hypot(dx,dz)<3){state.keys={};velocity.set(0,0,0);updateRover(1/60);break;}
   const desired=Math.atan2(-dx,-dz),error=Math.atan2(Math.sin(desired-roverAngle),Math.cos(desired-roverAngle));
   state.keys={ArrowLeft:error>.04,ArrowRight:error<-.04,ArrowUp:Math.abs(error)<.45};
   updateRover(1/60);
 }
 if(state.finished)throw new Error('Course failed: '+waypoint);
 if(waypoint%2===0){const station=objects[waypoint/2-1];if(state.nearObject!==station)throw new Error('Target not reachable: '+station.id);state.keys={};startScan(state.nearObject);closeScan();}
}`);
assert(run('marsProgress(objects).ready'));assert(run('state.timeLeft>0'));
console.log('Course driving seconds:',run('180-state.timeLeft').toFixed(1));assert(run('180-state.timeLeft>=100 && 180-state.timeLeft<180'),'route should fit a short arcade session');
run('resetSurface();state.timeLeft=.001;updateRover(.02)');assert(run('state.finished'));
run('resetSurface();rover.group.position.set(8,getHeight(8,-5),-5);velocity.set(0,0,-.035);state.keys.KeyW=true;for(let i=0;i<90;i++)updateRover(1/60)');assert(run('state.integrity<100'),'rocks cause damage');
run('resetSurface()');assert.equal(run('state.integrity'),100);
console.log('PASS 3D world creation (renderer stub), movement, energy, report, timeout, retry; '+orders+' scan orders');


