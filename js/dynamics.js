'use strict';

function calculateDynamicPressure(density, velocity){
  return .5*density*velocity**2;
}

function calculateMassProperties(stage, propellant, vehicle){
  const tank=propellant*Math.max(.08,.74-Math.min(stage,vehicle?.stageCount??stage)*.21)*(vehicle?.propellantScale??1), payload=.26, dry=.19*(vehicle?.dryMassScale??1);
  const mass=tank+payload+dry;
  const center=(payload*.75-tank*.42)/mass;
  const inertia=.08+tank*(-.42-center)**2+payload*(.75-center)**2+dry*center**2;
  return {mass,center,inertia};
}

function createFlightDynamics(){
  const modes=['LEVEL','HOLD','PROGRADE','RETROGRADE','OFF'];
  let mode=0, target=0;
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const limit=(x,n)=>Math.max(-n,Math.min(n,x));
  const data={angle:0,spin:0,rcs:1,heat:0,integrity:1,q:0,mach:0,center:0,inertia:1};
  return {
    data,
    get mode(){return modes[mode]},
    cycle(){mode=(mode+1)%modes.length;target=data.angle},
    reset(angle=0){
      Object.assign(data,{angle,spin:0,rcs:1,heat:0,integrity:1,q:0,mach:0});
      mode=0;
    },
    align(angle){data.angle=target=angle;data.spin=0},
    update(dt,{air,speed,thrust,stage,propellant,steer,path,entry,reference,vehicle}){
      const {center,inertia}=calculateMassProperties(stage,propellant,vehicle);
      data.center=center;
      data.inertia=inertia;
      data.mach=speed;
      // Preserve the existing game tuning and HUD scale (twice normalized dynamic pressure).
      data.q=2*calculateDynamicPressure(air,speed);
      const incidence=wrap(data.angle-reference);
      const heating=air*speed**3*(entry?1+Math.abs(incidence)*1.8:.32);
      data.heat=Math.max(0,data.heat+dt*(heating*.52-data.heat*.8));
      const overload=Math.max(0,data.q-.38)*(thrust>.9?1:.12);
      data.integrity=Math.max(0,data.integrity-dt*(overload*.25+Math.max(0,data.heat-1)*.18));
      const desired=[reference,target,path,path+Math.PI,data.angle][mode];
      const correction=mode===4?0:wrap(desired-data.angle)*2.8-data.spin*1.5;
      const command=limit(steer+correction,1);
      const gimbal=thrust*(vehicle?.thrustScale??1)*command*.16*(.65+data.center);
      const rcs=thrust<.12&&data.rcs>0?command*.085:0;
      data.rcs=Math.max(0,data.rcs-Math.abs(rcs)*dt*.65);
      const aero=data.q*(.12-data.center)*Math.sin(incidence)*.09;
      data.spin=limit(data.spin+dt*((gimbal+rcs+aero)/data.inertia-data.spin*air*.34),2.5);
      data.angle=wrap(data.angle+data.spin*dt);
      return rcs/.085;
    }
  };
}

if(typeof module!=='undefined'&&module.exports){
  module.exports={calculateDynamicPressure,calculateMassProperties,createFlightDynamics};
}
