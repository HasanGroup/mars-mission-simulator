// Editorial backdrop, not a scale model of the solar system.
const priorEnvironment=drawEnvironment;
drawEnvironment=function(view){
 if(state!=='IDLE'||!briefing){priorEnvironment(view);return}
 ctx.fillStyle='#060b12';ctx.fillRect(0,0,W,H);
 for(let i=0;i<110;i++){
  const x=((i*7919)%1000)/1000*W,y=((i*3571)%997)/997*H;
  ctx.globalAlpha=.15+(i%5)*.09;ctx.fillStyle='#c4d3e2';ctx.fillRect(x,y,i%11===0?2:1,1);
 }ctx.globalAlpha=1;
 ctx.save();ctx.translate(W*.79,H*.5);ctx.rotate(-.32);
 for(let i=0;i<3;i++){
  ctx.beginPath();ctx.strokeStyle=i===1?'#b49a624d':'#6a91ac30';ctx.lineWidth=1;
  ctx.ellipse(0,0,W*(.21+i*.1),H*(.21+i*.06),0,0,Math.PI*2);ctx.stroke();
 }ctx.restore();
 ctx.fillStyle='#8fa4b8';ctx.font='10px Segoe UI';ctx.fillText('ЗЕМЛЯ → МАРС',W*.68,H*.91);
};
