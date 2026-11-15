'use strict';

const FlightAtmosphere = (() => {
  const maxAltitude = 6000;
  const palette = [
    [0, [.31,.61,.82], [.89,.94,.93]],
    [.4, [.043,.098,.173], [.28,.55,.75]],
    [.8, [0,0,0], [.024,.07,.13]],
    [1, [0,0,0], [0,0,0]]
  ];
  const clamp = value => Math.max(0, Math.min(1, value));
  const fade = (start, end, value) => {
    const t = clamp((value-start)/(end-start));
    return t*t*(3-2*t);
  };
  const wrap = (value, period) => ((value%period)+period)%period;
  let seed = 8014;
  function random(){
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  }
  const stars = Array.from({length:180},()=>[random(),random()*.77,.4+random()*1.4,.25+random()*.75]);
  const nebulae = Array.from({length:5},()=>[random(),random()*.45,.14+random()*.21]);
  const layers = [
    {factor:.2, wind:7, opacity:.51, count:9, scale:.75},
    {factor:1.2, wind:16, opacity:.27, count:6, scale:1.65}
  ].map(layer=>({...layer, clouds:Array.from({length:layer.count},()=>[random(),random(),.65+random()*.7])}));

  function skyColors(altitude){
    const t = clamp(altitude/maxAltitude);
    const i = palette.findIndex((stop,index)=>index>0&&t<=stop[0]);
    const a=palette[i-1], b=palette[i], blend=(t-a[0])/(b[0]-a[0]);
    return [1,2].map(edge=>'rgb('+a[edge].map((channel,index)=>
      Math.round(255*(channel+(b[edge][index]-channel)*blend))).join(',')+')');
  }

  function drawSky(ctx,w,h,altitude){
    const t=clamp(altitude/maxAltitude);
    const [top,bottom]=skyColors(altitude);
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,top);
    sky.addColorStop(1,bottom);
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,w,h);
    const visibility=fade(.34,.82,t);
    if(!visibility)return;
    ctx.save();
    ctx.globalAlpha=visibility*.2;
    for(const [x,y,r] of nebulae){
      const radius=r*Math.max(w,h);
      const glow=ctx.createRadialGradient(x*w,y*h,0,x*w,y*h,radius);
      glow.addColorStop(0,'#6464a8');
      glow.addColorStop(1,'#6464a800');
      ctx.fillStyle=glow;
      ctx.fillRect(x*w-radius,y*h-radius,2*radius,2*radius);
    }
    ctx.fillStyle='#eaf5ff';
    for(const [x,y,size,alpha] of stars){
      ctx.globalAlpha=alpha*visibility;
      ctx.fillRect(x*w,y*h,size,size);
    }
    ctx.restore();
  }

  function drawClouds(ctx,w,h,view,foreground){
    const layer=layers[foreground?1:0];
    const t=clamp(view.altitude/maxAltitude);
    const front=fade(.025,.12,t)*(1-fade(.24,.47,t));
    const visibility=foreground?front:1-fade(.20,.54,t);
    if(!visibility)return;
    const margin=185;
    ctx.save();
    ctx.globalAlpha=visibility*layer.opacity;
    for(const [u,v,size] of layer.clouds){
      const x=wrap(u*(w+2*margin)+view.time*layer.wind-view.cameraX*layer.factor,w+2*margin)-margin;
      const y=wrap(v*(h+2*margin)-view.cameraY*layer.factor,h+2*margin)-margin;
      const rx=68*layer.scale*size, ry=rx*.26;
      const haze=ctx.createRadialGradient(0,0,.15,0,0,1);
      haze.addColorStop(0,'#f5fcff');
      haze.addColorStop(.55,'#eefaffb8');
      haze.addColorStop(1,'#eefaff00');
      ctx.save();
      ctx.translate(x,y);
      ctx.scale(rx,ry);
      ctx.fillStyle=haze;
      ctx.fillRect(-1,-1,2,2);
      ctx.restore();
    }
    if(foreground){
      ctx.globalAlpha=front*.07;
      ctx.fillStyle='#eaf7ff';
      ctx.fillRect(0,0,w,h);
    }
    ctx.restore();
  }
  return {maxAltitude,fade,skyColors,drawSky,drawClouds};
})();
