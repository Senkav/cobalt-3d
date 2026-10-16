/* Keep camera framing tied to the actual, unobstructed WebGL viewport. */
let descriptionCollapsed=false,descriptionKey='',descriptionLayoutKey='',layoutResizeBusy=false;
let latestModelFrame=null,lastViewportWidth=0,lastViewportHeight=0;
let workspaceEngineInCar=false,workspacePlaybackState='';
const workspaceEngineIds=new Set([...INTERNAL.map(p=>p.id),...PARTS.filter(p=>p.cat==='engine').map(p=>p.id),'injectors','fuelrail','intake','throttle','exhmanifold','coils']);
const dockRestore=document.getElementById('dockRestore');
function setDescriptionCollapsed(value){
 descriptionCollapsed=!!value;window.refreshModelLayout();
 if(descriptionCollapsed)dockRestore.focus();
 else (activeCourse?document.getElementById('coachCollapse'):currentPart?document.getElementById('panelCollapse'):document.getElementById('engineCollapse'))?.focus();
}
window.prepareCoachLayout=function(){
 const header=coach.querySelector('.coachHead');if(!header||header.querySelector('#coachCollapse'))return;
 const actions=document.createElement('div');actions.className='coachHeadActions';
 const fold=document.createElement('button');fold.id='coachCollapse';fold.textContent='Свернуть';fold.setAttribute('aria-label','Свернуть описание');fold.setAttribute('aria-expanded','true');fold.setAttribute('aria-controls','coachContent');fold.onclick=()=>setDescriptionCollapsed(true);
 actions.appendChild(fold);actions.appendChild(document.getElementById('coachExit'));header.appendChild(actions);window.refreshModelLayout();
};
window.refreshModelLayout=function(){
 const learning=!!activeCourse&&!coach.hidden,part=!learning&&!!currentPart&&!document.getElementById('panel').classList.contains('hidden');
 const engine=!learning&&!part&&!engineLab.hidden;
 const title=learning?coach.querySelector('.coachHead h3')?.textContent||'Учебное задание':part?currentPart.name:engine?'Четыре такта двигателя':'';
 const key=learning?'course:'+activeCourse.type:part?'part:'+currentPart.id:engine?'engine':'';
 if(key!==descriptionKey){descriptionCollapsed=false;descriptionKey=key;}
 if(!key)descriptionCollapsed=false;
 document.body.classList.toggle('infoCollapsed',descriptionCollapsed);
 document.body.classList.toggle('engineDock',engine);
 document.getElementById('quickShell').hidden=curView==='engine'&&!workspaceEngineInCar;
 document.getElementById('systemsOpen').disabled=activeCourse?.type==='find';
 dockRestore.hidden=!key||!descriptionCollapsed;document.getElementById('dockRestoreTitle').textContent=title;
 const layoutKey=key+'|'+descriptionCollapsed;
 if(layoutKey!==descriptionLayoutKey){descriptionLayoutKey=layoutKey;if(!layoutResizeBusy){layoutResizeBusy=true;resize();layoutResizeBusy=false;}}
};
document.getElementById('panelCollapse').onclick=()=>setDescriptionCollapsed(true);
document.getElementById('engineCollapse').onclick=()=>setDescriptionCollapsed(true);
dockRestore.onclick=()=>setDescriptionCollapsed(false);
const frameBeforeDescription=modelFrame;modelFrame=function(box,detail){latestModelFrame={box:box.clone(),detail};frameBeforeDescription(box,detail);};
const resizeBeforeDescription=resize;resize=function(){
 resizeBeforeDescription();const w=canvasHost.clientWidth,h=canvasHost.clientHeight;
 if(w>0&&h>0&&(w!==lastViewportWidth||h!==lastViewportHeight)){
  lastViewportWidth=w;lastViewportHeight=h;
  if(latestModelFrame)frameBeforeDescription(latestModelFrame.box,latestModelFrame.detail);
 }
};
const installBeforeDescription=window.installUnifiedVehicle;window.installUnifiedVehicle=function(){installBeforeDescription();window.refreshModelLayout();};
window.applyWorkspaceVisibility=function(){
 const isolated=curView==='engine'&&!workspaceEngineInCar;
 const selected=ALL_PARTS.find(p=>p.id===selectedId),extra=new Set(selected&&!workspaceEngineIds.has(selectedId)?[selectedId,...(relatedParts[selectedId]||[])]:[]);
 if(isolated){for(const m of realMeshes)if(!workspaceEngineIds.has(m.userData.partId)&&!extra.has(m.userData.partId))m.visible=false;ground.visible=false;grid.visible=false;}
 const shadow=scene.getObjectByName('vehicleGroundShadow');if(shadow)shadow.visible=!isolated;
};
function refreshWorkspacePlayback(){
 const state=String(engineRunning);if(state!==workspacePlaybackState){workspacePlaybackState=state;const b=document.getElementById('engineTogglePlay');b.innerHTML=interfaceSvg(engineRunning?'pause':'play')+'<span>'+(engineRunning?'Пауза':'Запустить')+'</span>';b.setAttribute('aria-label',engineRunning?'Остановить анимацию двигателя':'Запустить анимацию двигателя');b.setAttribute('aria-pressed',String(engineRunning));}
}
const engineRefreshBeforeWorkspace=refreshEngineLab;refreshEngineLab=function(){const wasHidden=engineLab.hidden;engineRefreshBeforeWorkspace();refreshWorkspacePlayback();if(wasHidden!==engineLab.hidden)window.refreshModelLayout();};
document.getElementById('engineTogglePlay').onclick=()=>document.getElementById('enginePlay').click();
document.querySelectorAll('#engineSpeedButtons button').forEach(b=>b.onclick=()=>{window.cobaltEngineSpeed=Number(b.dataset.speed);document.getElementById('engineSpeed').value=b.dataset.speed;document.querySelectorAll('#engineSpeedButtons button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
document.getElementById('engineContext').onclick=()=>{workspaceEngineInCar=!workspaceEngineInCar;const b=document.getElementById('engineContext');b.setAttribute('aria-pressed',String(workspaceEngineInCar));b.textContent=workspaceEngineInCar?'Показать двигатель отдельно':'Показать двигатель в автомобиле';updateUnifiedVisibility();};
refreshWorkspacePlayback();
window.refreshModelLayout();
