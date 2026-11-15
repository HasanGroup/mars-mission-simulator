const assert=require('node:assert/strict'),{createFlight}=require('../js/flight-sim.js');
const g=createFlight(),s=g.s;
function run(seconds,input){for(let t=0;t<seconds;t+=.02)g.tick(.02,typeof input==='function'?input(s):input)}
function staging(q){const e=g.stages[q.stage];if(e&&e.phase===q.phase&&q.altitude>e.min+2)g.separate();return {}}
g.reset('controlroom');run(5.02);assert.equal(s.phase,'cabin');run(5.02);assert.equal(s.phase,'countdown');run(6.02);assert.equal(s.phase,'ascent');run(40,staging);assert.equal(s.phase,'departure');run(16,staging);assert.equal(s.phase,'cruise');assert.equal(s.stage,3);
// A top/right corridor is reachable before the first obstacle arrives and remains safe.
run(42,q=>({x:Math.sign(Math.sin(q.time*.55)*14-q.x),y:Math.sign(Math.cos(q.time*.55)*9-q.y)}));assert.equal(s.phase,'phobos');
run(12);assert.equal(s.phase,'approach');run(12);assert.equal(s.phase,'entry');run(10);assert.equal(s.phase,'landing');
run(60,q=>({x:-Math.sign(q.x),thrust:q.fall>(q.altitude>14?5:1.7)}));assert.equal(s.phase,'success');
g.reset('landing');run(20);assert.equal(s.phase,'failed');assert.match(s.reason,/касание/);
g.reset('landing');assert.equal(s.fuel,100);assert.equal(s.altitude,70);assert.equal(s.time,0);assert.equal(s.objects.length,0);
g.reset('cruise');s.shield=0;s.hull=10;s.spawn=999;s.objects.push({id:90,x:0,y:0,z:-5,r:2,kind:0});run(.2);assert.equal(s.phase,'failed');assert.match(s.reason,/столкновения/);
g.reset('cruise');assert.equal(s.flash,0);run(10);assert(s.shield<80,'standing still must cause collision damage');
g.reset('ascent');run(3,{x:1});assert.equal(s.phase,'failed');assert.match(s.reason,/коридор/);
g.reset('cruise');s.paused=true;g.tick(50,{x:1});assert.equal(s.time,0);s.paused=false;g.tick(50);assert.equal(s.time,.05);
g.reset('cruise');g.tick(NaN);assert.equal(s.time,0);
console.log('PASS complete 3D route, collision failure, launch failure, soft/hard landing, reset, pause and frame clamp');
g.reset('ascent');g.separate();assert.equal(s.phase,'failed');assert.match(s.reason,/раннее/);
g.reset('ascent');run(40);assert.equal(s.phase,'failed');assert.match(s.reason,/поздно/);
for(let i=0;i<3;i++){g.reset('ascent');s.stage=i;const e=g.stages[i];s.altitude=e.min;g.separate();assert.equal(s.stage,i+1);assert.notEqual(s.phase,'failed');}
g.reset('ascent');assert.equal(s.stage,0);s.paused=true;g.separate();assert.equal(s.stage,0);
console.log('PASS stage windows, early/late failure, all separations, pause and reset');



