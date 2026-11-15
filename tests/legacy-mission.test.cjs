const fs=require('fs'), vm=require('vm'), assert=require('assert');
function game(width=1280,height=800){
  const nodes=new Map();
  const noop=()=>{};
  const ctx=new Proxy({}, {get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
  function node(){return {style:{setProperty(name,value){this[name]=value}},dataset:{},classList:{add:noop,remove:noop},children:[],set innerHTML(value){this.children=[]},firstElementChild:{style:{}},addEventListener:noop,setPointerCapture:noop,appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:80,height:80})};}
  const sandbox={console,Math,location:{href:"index.html"},innerWidth:width,innerHeight:height,devicePixelRatio:1,addEventListener:noop,requestAnimationFrame:noop,Image:class{},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,addEventListener:noop},performance:{now:()=>0}};
  sandbox.window=sandbox;
  vm.createContext(sandbox);
  const html=fs.readFileSync('legacy-flight.html','utf8');
  for(const match of html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g))vm.runInContext(match[1]?fs.readFileSync(match[1],'utf8'):match[2],sandbox,{filename:match[1]||'index.html'});
  vm.runInContext('sound=false',sandbox);
  return code=>vm.runInContext(code,sandbox);
}
for(const [w,h] of [[1280,800],[390,844],[844,390]]){
 const run=game(w,h);
 run('start()');assert(run('briefing'));assert(!run('launchAuthorized'));assert.equal(run('state'),'IDLE');
 run('update(20)');assert.equal(run('state'),'IDLE','clearance pauses flight');
 run('resultBtns.children[0].onclick()');assert(run('launchAuthorized'));assert.equal(run('state'),'COUNTDOWN');
 run('for(let i=0;i<3000&&state!=="CRUISE"&&state!=="FAILED";i++)update(1/120)');
 assert.equal(run('state'),'CRUISE');assert(run('briefing'));
 run('resultBtns.children[0].onclick();for(let i=0;i<1600&&!briefing;i++)update(1/120)');assert.equal(run('state'),'MANUAL_CONTROL');
 run('briefing=false;for(let i=0;i<1500&&state==="MANUAL_CONTROL";i++)update(1/120)');assert.equal(run('state'),'FAILED');
 run('startLanding();briefing=false');assert.equal(run('burn'),1);
 run(`for(let i=0;i<3000&&state==='MANUAL_CONTROL';i++){
 const command=(worldW*.5-rocketX)*.9-vx*1.8;keys.ArrowRight=command>2;keys.ArrowLeft=command<-2;
 keys.Space=rocketY>contact-70&&vy>worldH*.065;update(1/120);}`);
 assert.equal(run('state'),'SUCCESS');
 run('resultBtns.children.find(b=>b.textContent==="ИССЛЕДОВАТЬ МАРС").onclick()');assert.equal(run('location.href'),'mars.html');
 run('start();resultBtns.children[0].onclick();enter("ASCENT");launchFuel=.00001;update(1/120)');assert.equal(run('state'),'FAILED');
 console.log('PASS historical route, clearance, landing, failure and retry '+w+'x'+h);
}

