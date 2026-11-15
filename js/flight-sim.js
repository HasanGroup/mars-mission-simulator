(function(root){
 const durations={controlroom:5,cabin:5,countdown:6,ascent:40,departure:16,cruise:42,phobos:12,approach:12,entry:10};
 const stages=typeof module!=='undefined'?require('./rockets-data.js').FLIGHT_STAGES:FLIGHT_STAGES;
 const next={controlroom:'cabin',cabin:'countdown',countdown:'ascent',ascent:'departure',departure:'cruise',cruise:'phobos',phobos:'approach',approach:'entry',entry:'landing'};
 // Swept bounding spheres in the local flight frame; catches contact between frames.
 const craftRadius=2.3;
 function sweepSphere(p,d,r){
  const c=p.x*p.x+p.y*p.y+p.z*p.z-r*r;
  if(c<=0)return 0;
  const a=d.x*d.x+d.y*d.y+d.z*d.z,b=2*(p.x*d.x+p.y*d.y+p.z*d.z);
  if(a<1e-12||b>=0)return null;
  const disc=b*b-4*a*c;if(disc<0)return null;
  const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;
 }
 function createFlight(){
  const s={};
  function enter(phase){Object.assign(s,{phase,time:0,x:0,y:0,vx:0,vy:0,altitude:phase==='ascent'?0:phase==='departure'?320:70,fall:3,fuel:100,health:3,objects:[],spawn:0,serial:0,flash:0,reason:'',paused:false});}
  function reset(phase='story'){enter(phase);Object.assign(s,{z:0,vz:0,shield:80,hull:100,speed:34,impactId:0,impact:null,shake:0,stun:0});s.stage=['departure','cruise','phobos','approach','entry','landing'].includes(phase)?3:0;s.generation=(s.generation||0)+1;s.total=0;s.lastCheckpoint=phase;return s}
  function separate(){
   if(s.paused||!['ascent','departure'].includes(s.phase))return;
   const event=stages[s.stage];if(!event)return;
   if(event.phase!==s.phase||s.altitude<event.min){fail('Слишком раннее отделение: '+event.name+'. Нажмите Пробел в зелёном окне '+event.min+'–'+event.max+' км (игровая шкала).');return}
   if(s.altitude>event.max){fail('Окно отделения пропущено: '+event.name);return}
   s.stage++;
  }
  function fail(reason){s.reason=reason;s.failedPhase=s.phase;s.phase='failed'}
  function tick(raw,input={}){
   const dt=Math.max(0,Math.min(Number.isFinite(raw)?raw:0,.05));
   if(dt===0)return;
   if(s.paused||['story','clearance','failed','success'].includes(s.phase))return;
   s.time+=dt;s.total+=dt;
   const previous={x:s.x,y:s.y,z:s.z};
   s.flash=Math.max(0,s.flash-dt*1.8);s.shake=Math.max(0,s.shake-dt*1.3);s.stun=Math.max(0,s.stun-dt);
   const h=Math.max(-1,Math.min(1,input.x||0)),v=Math.max(-1,Math.min(1,input.y||0));
   if(['ascent','cruise','phobos','approach'].includes(s.phase)){
    const limit=s.phase==='ascent'?8:18;
    const response=s.stun>0?.8:5;
    s.vx+=(h*8-s.vx)*(1-Math.exp(-response*dt));s.vy+=(v*7-s.vy)*(1-Math.exp(-response*dt));
    s.x=s.phase==='ascent'?Math.max(-limit,Math.min(limit,s.x+s.vx*dt)):s.x+s.vx*dt;s.y+=s.vy*dt;
    // Soft boundary forces preserve a physical knockback rather than clipping position.
    if(s.phase!=='ascent'){if(Math.abs(s.x)>18)s.vx-=Math.sign(s.x)*(Math.abs(s.x)-18)*dt*6;if(Math.abs(s.y)>12)s.vy-=Math.sign(s.y)*(Math.abs(s.y)-12)*dt*6;}
   }
   if(s.phase==='ascent'){
    s.fuel=Math.max(0,s.fuel-dt*2.2);s.altitude=320*Math.pow(s.time/durations.ascent,1.6);
    if(Math.abs(s.x)>6.7){fail('Ракета вышла за коридор запуска. Корректируйте наклон короткими нажатиями и держитесь ближе к центру.');return}
   }
   if(s.phase==='cruise'){
    s.speed+=(34-s.speed)*(1-Math.exp(-.55*dt));s.vz*=Math.exp(-1.4*dt);s.z+=s.vz*dt;
    s.spawn-=dt;
    if(s.spawn<=0&&s.time<35){
     const n=s.serial++;s.objects.push({id:n,x:n%5===0?s.x:Math.sin(n*2.4)*17,y:n%5===0?s.y:Math.cos(n*1.7)*11,z:(s.z||0)-180,r:1.3+(n%3)*.35,kind:n%3});s.spawn=.8;
    }
    for(const o of s.objects){
     o.vx??=0;o.vy??=0;o.vz??=0;
     const start={x:o.x,y:o.y,z:o.z},ovz=s.speed+o.vz;
     o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=ovz*dt;
     const radius=craftRadius+o.r*1.15;
     const p={x:previous.x-start.x,y:previous.y-start.y,z:previous.z-start.z};
     const d={x:s.x-o.x-p.x,y:s.y-o.y-p.y,z:s.z-o.z-p.z};
     const hit=sweepSphere(p,d,radius);
     const separation=Math.hypot(s.x-o.x,s.y-o.y,s.z-o.z);
     if(o.contact&&separation>radius+.6)o.contact=false;
     if(hit===null)continue;
     let nx=p.x+d.x*hit,ny=p.y+d.y*hit,nz=p.z+d.z*hit;
     let length=Math.hypot(nx,ny,nz);if(length<1e-8){nx=0;ny=0;nz=1;length=1}nx/=length;ny/=length;nz/=length;
     const normalSpeed=(s.vx-o.vx)*nx+(s.vy-o.vy)*ny+(s.vz-ovz)*nz;
     if(normalSpeed>=0)continue;
     // Restitution .42: rebound with energy loss; asteroid effective mass is 3x craft.
     const impulse=-(1+.42)*normalSpeed;
     s.vx+=nx*impulse*.75;s.vy+=ny*impulse*.75;s.vz+=nz*impulse*.75;
     o.vx-=nx*impulse*.25;o.vy-=ny*impulse*.25;o.vz-=nz*impulse*.25;
     const remaining=dt*(1-hit),cx=start.x+(o.x-start.x)*hit,cy=start.y+(o.y-start.y)*hit,cz=start.z+(o.z-start.z)*hit;
     s.x=cx+nx*(radius+.02)+s.vx*remaining;s.y=cy+ny*(radius+.02)+s.vy*remaining;s.z=cz+nz*(radius+.02)+s.vz*remaining;
     o.x=cx+o.vx*remaining;o.y=cy+o.vy*remaining;o.z=cz+(s.speed+o.vz)*remaining;
     if(!o.contact){
      const damage=Math.max(4,-normalSpeed*1.9),absorbed=Math.min(s.shield,damage);s.shield-=absorbed;s.hull=Math.max(0,s.hull-(damage-absorbed));
      s.speed=Math.max(9,s.speed*.62);s.stun=.9;s.flash=1;s.shake=Math.min(1.3,-normalSpeed/28);s.health=Math.ceil(s.hull/100*3);
      s.impact={id:++s.impactId,x:cx+nx*o.r,y:cy+ny*o.r,z:cz+nz*o.r,strength:Math.min(1.4,-normalSpeed/30)};
      if(s.hull<=0){fail('Корпус разрушен после столкновения. Щит исчерпан; обходите астероиды заранее.');return}
     }
     o.contact=true;
    }
    s.objects=s.objects.filter(o=>o.z<s.z+55&&Math.abs(o.x-s.x)<120);
   }
   if(s.phase==='departure')s.altitude=320+s.time*3;
   const pending=stages[s.stage];
   if(pending&&pending.phase===s.phase&&s.altitude>pending.max){fail('Слишком поздно: не отделён элемент «'+pending.name+'». Окно '+pending.min+'–'+pending.max+' км закрыто.');return}
   if(s.phase==='landing'){
    s.vx+=(h*4-s.vx)*(1-Math.exp(-2*dt));s.x=Math.max(-18,Math.min(18,s.x+s.vx*dt));
    const burn=!!input.thrust&&s.fuel>0;s.fuel=Math.max(0,s.fuel-(burn?3.2:0)*dt);
    s.fall=Math.max(-3,Math.min(17,s.fall+(1.7-(burn?4.5:0))*dt));s.altitude-=s.fall*dt;
    if(s.altitude>100){fail('Аппарат снова набрал высоту. Отпустите тягу и продолжайте снижение.');return}
    if(s.altitude<=0){s.altitude=0;if(s.fall>3.5)fail('Слишком быстрое касание: '+s.fall.toFixed(1)+' м/с. Начинайте тормозить заранее; цель — не более 3,5 м/с.');else if(Math.abs(s.x)>6||Math.abs(s.vx)>1.5)fail('Касание вне безопасной зоны или с боковым сносом. Совместите аппарат с кругом и отпустите руль перед касанием.');else{s.phase='success';s.time=0}return}
   }
   if(durations[s.phase]&&s.time>=durations[s.phase]){const phase=next[s.phase];enter(phase);s.lastCheckpoint=phase;}
  }
  reset();return {s,tick,reset,enter,fail,separate,stages,durations};
 }
 if(typeof module!=='undefined')module.exports={createFlight};else root.createFlight=createFlight;
})(typeof globalThis!=='undefined'?globalThis:this);

