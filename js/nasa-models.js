/* NASA VTAD assets. Atlas 551 adapted to four boosters for the educational 541 view.
 * Geometry and markings are illustrative, not an exact reconstruction of AV-028.
 */
const NASAModels={
 load(name){
  return new Promise((resolve,reject)=>{
   try{
    const bytes=Uint8Array.from(atob(NASA_MODEL_DATA[name]),c=>c.charCodeAt(0));
    new GLTFLoader().parse(bytes.buffer,'',gltf=>resolve(gltf.scene),reject);
   }catch(error){reject(error)}
  });
 },
 normalize(model,height){
  model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
  model.scale.multiplyScalar(height/size.y);model.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  model.position.y+=height/2;
  model.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});
  return model;
 }
};
// Render the detailed 3D vehicle into the flight's existing 2D canvas.
const AtlasPortrait={ready:false,canvas:null};
if(typeof document.createElementNS==='function'&&document.getElementById('model-credit')&&typeof NASA_MODEL_DATA!=='undefined'&&NASA_MODEL_DATA['atlas-v']){
 try{
  const display=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  display.setSize(512,1024);display.setPixelRatio(1);
  display.toneMapping=THREE.ACESFilmicToneMapping;display.toneMappingExposure=1.4;
  const scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xd9eaff,0x64513d,2.2));
  const sun=new THREE.DirectionalLight(0xffedd6,3.5);sun.position.set(-6,10,10);scene.add(sun);
  const camera=new THREE.OrthographicCamera(-2.5,2.5,5,-5,.1,100);camera.position.set(9,4.5,18);camera.lookAt(0,4.5,0);
  NASAModels.load('atlas-v').then(model=>{
   const fifth=model.getObjectByName('solid_04');if(fifth)fifth.removeFromParent();
   NASAModels.normalize(model,9);scene.add(model);
   display.render(scene,camera);AtlasPortrait.canvas=display.domElement;AtlasPortrait.ready=true;
   const credit=document.getElementById('model-credit');if(credit)credit.textContent='3D NASA / VTAD · Atlas V: адаптация 541, 4 ускорителя';
  }).catch(error=>{console.warn('Модель Atlas недоступна',error);});
 }catch(error){console.warn('3D Atlas: используется резервная схема',error)}
}
