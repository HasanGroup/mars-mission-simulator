const assert=require('assert');
const {createRelaySession}=require('../js/communications');
const r=createRelaySession();
assert(!r.choose('Оптический кабель'));assert.equal(r.data.stage,'band');
assert(r.choose('UHF'));r.data.time=1;assert.equal(r.send(),'window');assert.equal(r.data.sent,0);
r.data.time=0;assert.equal(r.send(),'sent');assert.equal(r.send(),'busy');
r.data.paused=true;r.tick(.05);assert.equal(r.data.flight,1);r.data.paused=false;
for(let i=0;i<30;i++)r.tick(.05);assert.equal(r.data.sent,1);
for(let n=0;n<2;n++){r.data.time=0;assert.equal(r.send(),'sent');for(let i=0;i<30;i++)r.tick(.05);}
assert.equal(r.data.stage,'downlink');assert(!r.choose('UHF · домашний Wi-Fi'));assert(r.choose('X-band · DSN'));
r.tick(1000);assert(r.data.flight>2.9,'background time is clamped');
for(let i=0;i<80;i++)r.tick(.05);assert.equal(r.data.stage,'benefits');
assert(!r.choose('life'));assert(!r.choose('habitable'));for(let i=0;i<3;i++)assert(r.decode(i));assert(r.choose('habitable'));assert(r.data.complete);
r.reset();assert.deepEqual(r.data,{stage:'band',sent:0,time:0,flight:0,paused:false,complete:false,aim:.5,decoded:0});
console.log('PASS radio route, window failure, packet delivery, pause, time clamp, conclusion and reset');

r.choose('UHF');r.aim(0);assert.equal(r.send(),'aim');r.aim(.5);assert.equal(r.send(),'sent');

