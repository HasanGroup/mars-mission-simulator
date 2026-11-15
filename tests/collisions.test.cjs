const assert=require('node:assert/strict'),{createFlight}=require('../js/flight-sim.js');
function scenario(x=0,z=-5,vz=0){const g=createFlight();g.reset('cruise');g.s.spawn=999;g.s.objects=[{id:7,x,y:0,z,r:2,kind:0,vz}];return g;}
function run(g,time,dt=.01){for(let t=0;t<time;t+=dt)g.tick(dt)}
const head=scenario();run(head,.08);assert(head.s.vz>0,'normal impulse knocks craft back');assert(head.s.speed<34);assert(head.s.shield<80);assert(head.s.hull===100);assert(head.s.shake>0);assert.equal(head.s.impactId,1);
const damage=head.s.shield;run(head,.08);assert.equal(head.s.shield,damage,'one contact does not deal frame-by-frame damage');assert.equal(head.s.objects.length,1,'asteroid remains visible after impact');
const graze=scenario(3.8);run(graze,.3);assert(graze.s.vx<0,'glancing collision pushes away from asteroid');assert(graze.s.shield>head.s.shield,'glancing hit is weaker');
const miss=scenario(5);run(miss,.4);assert.equal(miss.s.shield,80);assert.equal(miss.s.impactId,0);
const fast=scenario(0,-20,1200);fast.tick(.05);assert(fast.s.impactId>0,'sweep catches an asteroid crossing the entire craft within a frame');assert.equal(fast.s.phase,'failed');
const overlapped=scenario(0,0);overlapped.tick(.02);assert(Number.isFinite(overlapped.s.z));assert(overlapped.s.z>0,'initial overlap is resolved');
head.reset('cruise');assert.equal(head.s.shield,80);assert.equal(head.s.hull,100);assert.equal(head.s.vz,0);assert.equal(head.s.impact,null);assert.equal(head.s.shake,0);assert.equal(head.s.z,0);
const paused=scenario();paused.s.paused=true;paused.tick(.05);assert.equal(paused.s.objects[0].z,-5);assert.equal(paused.s.impactId,0);
const fine=scenario(),coarse=scenario();run(fine,.2,.01);run(coarse,.2,.05);assert(Math.abs(fine.s.shield-coarse.s.shield)<3,'damage stable across frame rates');
console.log('PASS swept collision, near miss, overlap, impulse, shields, glancing damage, contact latch, fatal hit, reset, pause, frame-rate stability');
