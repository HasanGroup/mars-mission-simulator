const HistoricalSites = (() => {
  function line(ctx,points,color,width=2){
    ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.stroke();
  }
  function launch(ctx,w,h,site,phase,time){
    const x=w*.5,y=h*.83, scale=Math.min(1,w/550,h/600);
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    ctx.fillStyle='#6d7881';
    ctx.fillRect(-w/scale,-2,w*2/scale,h/scale);
    if(site.trench){
      ctx.fillStyle='#253542';
      ctx.fillRect(-114,7,228,35);
      line(ctx,[[-114,42],[-86,10],[86,10],[114,42]],'#a2adb5',4);
    }
    ctx.fillStyle='#a8b3bd';
    ctx.fillRect(-82,-8,164,9);
    const top=-170*site.height;
    const release=phase==='IGNITION'?Math.min(1,time*2):phase==='ASCENT'?1:0;
    ctx.save();
    ctx.translate(-64,-8);
    if(site.type==='erector')ctx.rotate(-release*.85);
    const height=top+8;
    for(let y=0;y>height;y-=18){
      line(ctx,[[0,y],[22,y-18],[22,y],[0,y-18]],site.color);
    }
    line(ctx,[[0,0],[0,height],[22,height],[22,0]],site.color,4);
    for(const level of [.42,.70,.89]){
      ctx.save();
      ctx.translate(22,height*level);
      ctx.rotate(-release*1.45);
      line(ctx,[[0,0],[35,0],[42,-5]],site.color,5);
      ctx.restore();
    }
    if(site.type==='rss'){
      ctx.fillStyle='#e4ebef';
      ctx.fillRect(19,height*.65,24,13);
    }
    ctx.restore();
    if(site.lightning){
      for(const mast of [-140,115,153]){
        line(ctx,[[mast,0],[mast,top-31]],'#7a8995');
        line(ctx,[[mast,top-31],[mast+15,top-24]],'#b3c2cc',1);
      }
    }
    ctx.restore();
  }
  function landing(ctx,w,h,site,time,tolerance){
    const y=h*.82;
    ctx.save();
    if(site.type==='splashdown'){
      const sea=ctx.createLinearGradient(0,y-28,0,h);
      sea.addColorStop(0,'#468db2');sea.addColorStop(1,'#082f4d');
      ctx.fillStyle=sea;ctx.fillRect(0,y-23,w,h-y+23);
      for(let row=0;row<6;row++){
        ctx.beginPath();
        for(let x=0;x<=w+12;x+=12){
          const wave=y-19+row*13+Math.sin(x*.043+time*3+row)*3;
          if(x===0)ctx.moveTo(x,wave);else ctx.lineTo(x,wave);
        }
        ctx.strokeStyle='#a9e8ef66';ctx.stroke();
      }
      for(const side of [-1,1]){
        const x=w*(.5+side*tolerance);
        line(ctx,[[x,y-13],[x,y+2]],'#ffc764',4);
      }
      const ship=w*.79;
      line(ctx,[[ship-25,y-22],[ship-18,y-16],[ship+28,y-16],[ship+36,y-22],[ship-25,y-22]],'#263d4c',4);
      ctx.fillStyle='#405461';ctx.fillRect(ship+2,y-30,14,7);
      const helicopter=w*.77+Math.sin(time)*17;
      line(ctx,[[helicopter-13,y-57],[helicopter+9,y-57],[helicopter+15,y-62]],'#344551',4);
      line(ctx,[[helicopter-10,y-64],[helicopter+12,y-64]],'#344551',1);
    }else if(site.type==='runway'){
      ctx.fillStyle='#35414b';ctx.fillRect(0,y,w,h-y);
      ctx.fillStyle='#e5e8df';
      for(let x=0;x<w;x+=39)ctx.fillRect(x,y+21,21,3);
      for(let x=10;x<w;x+=24){
        ctx.fillStyle=Math.sin(time*3-x*.055)>.1?'#fff2ad':'#89cde5';
        ctx.fillRect(x,y+3,4,3);
      }
      ctx.strokeStyle='#f1d16c';
      ctx.strokeRect(w*(.5-tolerance),y,w*2*tolerance,9);
      ctx.fillStyle='#62717d';ctx.fillRect(w*.85,y-24,7,24);
    }else{
      ctx.fillStyle='#747f87';ctx.fillRect(w*.22,y,w*.56,h-y);
      ctx.strokeStyle='#f0e6c9';ctx.strokeRect(w*(.5-tolerance),y,w*tolerance*2,20);
      line(ctx,[[w*.5-9,y+14],[w*.5+9,y+14]],'#f0e6c9',3);
      line(ctx,[[w*.5,y+6],[w*.5,y+22]],'#f0e6c9',3);
    }
    ctx.restore();
  }
  return {launch,landing};
})();
