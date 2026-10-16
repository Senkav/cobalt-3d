/* Imported Cobalt viewer. Original schematic is retained separately. */
let realRoot=null, realReady=false, realMeshes=[], realById={}, realPivots=[];
let realBodyHidden=false, realDoorsOpen=false, realHoodOpen=false;
const realStatus=document.getElementById('modelStatus');
const realControls=document.getElementById('realControls');
const baseShowView=showView, basePick=handlePick, baseSelect=selectPart3D, baseFilter=applyCategoryFilter, baseOpenPanel=openPanel;
const realOnlyIds=new Set(MODEL_PARTS.map(p=>p.id));
function isRealView(){return curView==='3d'||curView==='salon';}
function realVisible(o){for(let p=o;p;p=p.parent){if(!p.visible)return false;}return true;}
function modelFrame(box,detail){
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());camTarget.copy(center);
 const vfov=THREE.MathUtils.degToRad(camera.fov),hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
 const n=new THREE.Vector3(Math.sin(camPolar)*Math.sin(camAz),Math.cos(camPolar),Math.sin(camPolar)*Math.cos(camAz));
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n).normalize(),up=new THREE.Vector3().crossVectors(n,right);
 let distance=1.2;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const p=new THREE.Vector3(x,y,z).sub(center);
  distance=Math.max(distance,p.dot(n)+Math.abs(p.dot(right))/Math.tan(hfov/2),p.dot(n)+Math.abs(p.dot(up))/Math.tan(vfov/2));
 }
 camDist=Math.min(CAM_MAX,distance*(detail?1.18:1.2));updateCamera();
}
function homeModel(){
 if(!realRoot)return;
 camAz=2.45;camPolar=1.16;
 modelFrame(new THREE.Box3(new THREE.Vector3(-1,0,-2.24),new THREE.Vector3(1,1.53,2.24)),false);
}
function refreshReal(){
 window.cobaltNeedsRender=true;
 const real=isRealView();carBody.visible=!real&&curView!=='cut';hoodGroup.visible=!real&&curView!=='cut';
 PARTS.forEach(p=>(outerGroups[p.id]||[]).forEach(g=>g.visible=!real&&curView!=='cut'&&activeCats.has(p.cat)));
 if(realRoot)realRoot.visible=real;
 realPivots.forEach(p=>p.group.visible=real);
 realControls.hidden=!real;
 document.getElementById('hoodToggle').style.display=curView==='schema'?'':'none';
 document.getElementById('legend').style.display='none';
 document.getElementById('modelNote').textContent=curView==='schema'?'Учебная схема · формы и расположение условные':curView==='salon'?'Салон из GLB · наружные панели скрыты':'Модель Cobalt LTZ · двигатель и КПП в файле отсутствуют';
 document.getElementById('modelNote').hidden=curView==='cut';
 document.getElementById('modelCredit').hidden=curView==='cut'||curView==='schema';
 Object.keys(chipEls).forEach(k=>chipEls[k].style.display=real&&!['body','chassis','interior','bodyel','exhaust'].includes(k)?'none':'');
 realMeshes.forEach(m=>{
  const id=m.userData.partId,p=ALL_PARTS.find(x=>x.id===id);const cabin=curView==='salon';
  m.visible=activeCats.has(p.cat)&&(!(realBodyHidden||cabin)||p.cat==='interior'||p.id==='wheels_model'||p.cat==='exhaust');
 });
 document.getElementById('realShell').textContent=realBodyHidden?'Вернуть кузов':'Скрыть кузов';
 document.getElementById('realDoors').textContent=realDoorsOpen?'Закрыть двери':'Открыть двери';
 document.getElementById('realHood').textContent=realHoodOpen?'Закрыть капот':'Открыть капот';
 document.getElementById('realHood').disabled=curView==='salon'||realBodyHidden;
 document.getElementById('realDoors').disabled=curView==='salon'||realBodyHidden;
 document.getElementById('realShell').disabled=curView==='salon';
}
showView=function(v){
 // The original implementation owns the cutaway and schematic camera.
 if(v==='schema'){baseShowView('3d');curView='schema';setCats(Object.keys(CATS));camAz=2.55;camDist=7.8;camTarget.set(0,.7,0);updateCamera();}
 else if(v==='cut'){baseShowView('cut');}
 else{
  curView=v;document.getElementById('cutaway').classList.remove('show');setCats(Object.keys(CATS));
  if(v==='salon'&&realReady){camAz=.6;camPolar=.65;modelFrame(new THREE.Box3(new THREE.Vector3(-.8,.25,-1.3),new THREE.Vector3(.8,1.4,1.6)),true);}
  else if(realReady)homeModel();
 }
 ['btn3d','btnSalon','btnCut','btnSchema'].forEach((id,i)=>document.getElementById(id).classList.toggle('active',v===['3d','salon','cut','schema'][i]));
 closePanel();refreshReal();resize();
};
applyCategoryFilter=function(){baseFilter();refreshReal();};
openPanel=function(part){
 baseOpenPanel(part);
 const badge=document.createElement('p');badge.className='sourceNote';
 badge.textContent=part.internal?'Схематический разрез двигателя':realById[part.id]&&isRealView()?'Деталь загруженной 3D-модели':'Учебная схема. Точной геометрии этого узла в GLB нет.';
 document.getElementById('tab-f').prepend(badge);
};
selectPart3D=function(id,focus){
 if(realById[id]){
  if(!isRealView())showView('3d');
  const part=ALL_PARTS.find(p=>p.id===id);if(!part)return;
  activeCats.add(part.cat);chipEls[part.cat].classList.add('active');
  if(part.cat==='interior'&&curView!=='salon'){realBodyHidden=true;}
  else if(part.cat!=='interior'&&(realBodyHidden||curView==='salon')){if(curView==='salon')showView('3d');realBodyHidden=false;}
  refreshReal();selectedId=id;ghostId=null;openPanel(part);
  if(focus){const box=new THREE.Box3();realById[id].forEach(m=>box.expandByObject(m));modelFrame(box,true);}
 }else if(realOnlyIds.has(id)){
  realStatus.textContent=realReady?'Элемент недоступен в модели':'Модель ещё загружается';
 }else{
  if(curView!=='schema')showView('schema');
  const p=PARTS.find(x=>x.id===id);if(!p)return;activeCats.add(p.cat);chipEls[p.cat].classList.add('active');
  hoodOpen=true;hoodTarget=HOOD_OPEN;document.getElementById('hoodToggle').textContent='Закрыть капот';
  refreshReal();baseSelect(id,focus);
 }
};
handlePick=function(x,y){
 if(!isRealView())return basePick(x,y);
 if(!realReady)return;
 const rect=renderer.domElement.getBoundingClientRect();ndc.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
 raycaster.setFromCamera(ndc,camera);
 const hits=raycaster.intersectObjects(realMeshes.filter(realVisible),false);
 if(hits.length)selectPart3D(hits[0].object.userData.partId,false);
};
let cobaltHighlightedId;
function animateReal(dt){
 if(!realReady)return;
 realPivots.forEach(p=>{const target=p.type==='hood'?(realHoodOpen?1.05:0):(realDoorsOpen?p.angle:0);if(Math.abs(target-p.group.rotation[p.axis])>.001){p.group.rotation[p.axis]+= (target-p.group.rotation[p.axis])*Math.min(1,dt*6);window.cobaltNeedsRender=true;}});
 if(cobaltHighlightedId===selectedId)return;cobaltHighlightedId=selectedId;window.cobaltNeedsRender=true;
 realMeshes.forEach(m=>{const mat=m.material;if(mat.emissive){mat.emissive.setHex(m.userData.partId===selectedId?0xe86f22:0);mat.emissiveIntensity=.28;}});
}
document.getElementById('btnSchema').addEventListener('click',()=>showView('schema'));
document.getElementById('realHome').onclick=()=>{closePanel();homeModel();};
document.getElementById('realHood').onclick=()=>{realHoodOpen=!realHoodOpen;refreshReal();};
document.getElementById('realDoors').onclick=()=>{realDoorsOpen=!realDoorsOpen;refreshReal();};
document.getElementById('realShell').onclick=()=>{realBodyHidden=!realBodyHidden;refreshReal();};
function initializeReal(gltf){
 realRoot=gltf.scene;scene.add(realRoot);
 // Front is -Z, up is +Y. Use a uniform scale; the original scene is about 5.3 units long.
 realRoot.scale.setScalar(.845);realRoot.position.y=.88*.845;realRoot.updateMatrixWorld(true);
 const nodeMap={153:'hood_model',156:'doors_model',163:'doors_model',168:'doors_model',173:'doors_model',205:'trunk_model',131:'dashboard_model',138:'steeringwheel',143:'pedals',146:'seats',127:'tailpipe_model',35:'wheels_model',59:'wheels_model',91:'wheels_model',248:'wheels_model',245:'glass_model',235:'headlight',188:'headlight',192:'headlight',217:'taillight',221:'taillight',223:'taillight',225:'taillight',227:'taillight',231:'taillight'};
 function tag(o,id){id=nodeMap[o.userData.sourceNode]||id;o.userData.partId=id;o.children.forEach(c=>tag(c,id));}tag(realRoot,'body_model');
 const rubberNodes=new Set([42,66,98,254]);
 realRoot.traverse(o=>{if(!o.isMesh)return;
  const id=o.userData.partId,n=o.name,idx=o.userData.sourceNode;
  let mat=o.material.clone();mat.side=THREE.DoubleSide;
  const metal=n.includes('primary');
  if(metal){mat.color.setHex(0xe5e9ed);mat.metalness=.3;mat.roughness=.3;}
  else if(id==='wheels_model'){mat.color.setHex(rubberNodes.has(idx)?0x17191d:0xa4acb8);mat.roughness=rubberNodes.has(idx)?.86:.3;mat.metalness=rubberNodes.has(idx)?0:.65;}
  else if(id==='taillight'){mat.color.setHex(/escape/.test(n)?0xa7abb4:0xa82023);mat.metalness=.2;mat.roughness=.3;}
  else if(['body_model','doors_model','dashboard_model','steeringwheel','pedals','seats'].includes(id)){mat.color.setHex(/painel\.1/.test(n)?0x555c65:0x24282e);mat.roughness=.76;mat.metalness=.05;}
  if(/glass/.test(n)||idx===240){mat.color.setHex(0x7893a5);mat.transparent=true;mat.opacity=idx===240?.22:.3;mat.depthWrite=false;mat.roughness=.13;mat.metalness=.08;}
  if(id==='headlight'&&idx!==240&&!/glass/.test(n)){mat.color.setHex(0xb8c3d0);mat.roughness=.24;mat.metalness=.45;}
  mat.color.convertSRGBToLinear();
  o.material=mat;o.castShadow=false;o.receiveShadow=false;realMeshes.push(o);(realById[id]||(realById[id]=[])).push(o);
 });
 function pivot(node,position,type,axis,angle){let found;realRoot.traverse(x=>{if(x.userData.sourceNode===node)found=x;});if(!found)return;
  const g=new THREE.Group();g.position.copy(new THREE.Vector3(...position).multiplyScalar(.845));g.position.y+=.88*.845;scene.add(g);g.updateMatrixWorld(true);g.attach(found);realPivots.push({group:g,type,axis,angle});
 }
 pivot(153,[0,.22,-1.46],'hood','x',1.05);
 pivot(163,[.84,-.12,-1.08],'door','y',1.05);pivot(168,[-.84,-.12,-1.08],'door','y',-1.05);
 pivot(156,[.9,-.12,.2],'door','y',1.05);pivot(173,[-.9,-.12,.2],'door','y',-1.05);
 renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 scene.add(new THREE.HemisphereLight(0xdceaff,0x26222a,.75));keyLight.intensity=1.05;fillLight.intensity=.35;rimLight.intensity=.65;
 scene.background.encoding=THREE.sRGBEncoding;ground.material.color.convertSRGBToLinear();
 scene.fog=new THREE.Fog(0x10151d,10,24);grid.material.opacity=.23;grid.material.transparent=true;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=256;
 const sc=shadowCanvas.getContext('2d');sc.scale(1,2);const gradient=sc.createRadialGradient(64,64,12,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.7)');gradient.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.5,5.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.015;shadow.name='vehicleGroundShadow';scene.add(shadow);
 grid.scale.setScalar(2);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
 renderer.shadowMap.enabled=false;
 realReady=true;document.getElementById('modelLoading').remove();refreshReal();homeModel();
 realStatus.textContent='GLB · кузов и салон';
 if(window.installUnifiedVehicle)window.installUnifiedVehicle();
}
refreshReal();

let cobaltLoadBusy=false;
function loadingStatus(title,detail){
 const el=document.getElementById('loadStage');if(el)el.textContent=title;
 const sub=document.getElementById('loadDetail');if(sub&&detail)sub.textContent=detail;
}
const nextPaint=()=>new Promise(resolve=>setTimeout(resolve,0));
async function loadCobaltModel(){
 if(cobaltLoadBusy||realReady)return;cobaltLoadBusy=true;
 const retry=document.getElementById('retryLoad');if(retry)retry.hidden=true;
 try{
  loadingStatus('Читаем модель…','Облегчённая версия');await nextPaint();
  let packed;
  const el=document.getElementById('cobaltGlb');
  if(el){
   const encoded=el.textContent.trim();const chunks=[];let size=0;
   for(let i=0;i<encoded.length;i+=131072){const data=atob(encoded.slice(i,i+131072));const part=new Uint8Array(data.length);for(let k=0;k<data.length;k++)part[k]=data.charCodeAt(k);chunks.push(part);size+=part.length;
    if(i%524288===0){loadingStatus('Читаем модель… '+Math.round(i/encoded.length*100)+'%');await nextPaint();}
   }
   packed=new Uint8Array(size);let offset=0;for(const part of chunks){packed.set(part,offset);offset+=part.length;}
  }else{
   const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),30000);
   try{
    const response=await fetch('./assets/cobalt-mobile.glb.gz',{signal:abort.signal});if(!response.ok)throw new Error('HTTP '+response.status);
    const total=Number(response.headers.get('content-length'))||0;
    if(response.body&&response.body.getReader){
     const reader=response.body.getReader(),chunks=[];let size=0;
     while(true){const r=await reader.read();if(r.done)break;chunks.push(r.value);size+=r.value.length;loadingStatus('Загрузка модели'+(total?' · '+Math.min(100,Math.round(size/total*100))+'%':'…'),(size/1048576).toFixed(1)+' МБ');}
     packed=new Uint8Array(size);let offset=0;for(const part of chunks){packed.set(part,offset);offset+=part.length;}
    }else packed=new Uint8Array(await response.arrayBuffer());
   }finally{clearTimeout(timeout);}
  }
  loadingStatus('Подготавливаем детали…');await nextPaint();
  const bytes=fflate.gunzipSync(packed);await nextPaint();
  const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes.buffer,'',resolve,reject));
  initializeReal(gltf);if(el)el.remove();window.cobaltBoot.ready=true;
 }catch(e){modelError(e);}finally{cobaltLoadBusy=false;}
}
function modelError(e){
 console.error('Cobalt model:',e);realStatus.textContent='Ошибка загрузки';
 loadingStatus('Модель не загрузилась',e&&e.name==='AbortError'?'Загрузка прервана по времени. Повторите попытку.':'Попробуйте повторить загрузку или открыть сайт по ссылке.');
 const retry=document.getElementById('retryLoad');if(retry){retry.hidden=false;retry.onclick=loadCobaltModel;}
}
setTimeout(loadCobaltModel,80);

window.animateCobaltModel=animateReal;
window.cobaltIsRealView=()=>realReady&&isRealView();
new ResizeObserver(()=>resize()).observe(canvasHost);
