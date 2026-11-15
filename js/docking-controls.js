function createDockingControls(element, knob){
  let id=null;
  const vector={x:0,y:0};
  function reset(){
    id=null;
    vector.x=vector.y=0;
    knob.style.transform='';
  }
  function move(event){
    if(event.pointerId!==id)return;
    const bounds=element.getBoundingClientRect();
    const radius=bounds.width*.32;
    const x=(event.clientX-bounds.left-bounds.width/2)/radius;
    const y=(event.clientY-bounds.top-bounds.height/2)/radius;
    const distance=Math.hypot(x,y);
    const power=Math.min(1,Math.max(0,(distance-.12)/.88));
    vector.x=distance?x/distance*power:0;
    vector.y=distance?y/distance*power:0;
    knob.style.transform='translate('+vector.x*radius+'px,'+vector.y*radius+'px)';
  }
  element.addEventListener('pointerdown',event=>{
    if(id!==null)return;
    id=event.pointerId;
    element.setPointerCapture(id);
    move(event);
  });
  element.addEventListener('pointermove',move);
  for(const event of ['pointerup','pointercancel','lostpointercapture']){
    element.addEventListener(event,e=>{if(e.pointerId===id)reset()});
  }
  return {
    reset, vector,
    get active(){return id!==null},
    place(targetX,targetY,width,height){
      element.dataset.side=targetX<width/2?'right':'left';
      element.dataset.row=targetY<height/2?'bottom':'top';
    }
  };
}
