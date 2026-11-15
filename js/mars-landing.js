// The landing view is an explicitly simplified sky-crane exercise, not an Atlas return.
const earthEnvironment=drawEnvironment;
drawEnvironment=function(view){
  if(!['REENTRY','MANUAL_CONTROL','SUCCESS','FAILED'].includes(state)||ascent<.88){earthEnvironment(view);return;}
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#241822');sky.addColorStop(.7,'#9d5440');sky.addColorStop(1,'#e7a170');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#793e30';ctx.beginPath();ctx.moveTo(0,H);
  for(let x=0;x<=W+30;x+=30)ctx.lineTo(x,H*(.73+.035*Math.sin(x*.012)+.02*Math.cos(x*.025)));
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ad6142';ctx.fillRect(0,H*.82,W,H*.18);
  ctx.fillStyle='#d89a65';for(let i=0;i<24;i++)ctx.fillRect((i*83)%W,H*.85+(i%5)*H*.025,5+i%4,3);
};
drawRecoveryCraft=function(x,y,angle,canopy){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  // Rover wheels touch the pad at y + 15; descent stage remains above it.
  ctx.strokeStyle='#ddd5b6';ctx.lineWidth=1.5;
  if(state!=='SUCCESS')for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*15,-46);ctx.lineTo(side*11,2);ctx.stroke();}
  const flyaway=state==='SUCCESS'?Math.min(phaseTime,5):0;
  section(flyaway*55,-44-flyaway*40,44,10,0,'#c4aa69');section(0,3,28,11,0,'#c6bfa4');
  ctx.fillStyle='#283039';for(const dx of [-15,0,15]){ctx.beginPath();ctx.arc(dx,10,5,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#c9c3b0';ctx.fillRect(5,-14,3,17);ctx.fillRect(2,-18,10,5);
  if(landingPlume&&state==='MANUAL_CONTROL')for(const side of [-1,1]){
    ctx.fillStyle='#ffc884';ctx.beginPath();ctx.moveTo(side*21,-40);ctx.lineTo(side*29,-22-Math.random()*8);ctx.lineTo(side*16,-40);ctx.fill();
  }
  ctx.restore();
};
