/* Focused navigation and touch-friendly drawers around the unified 3D scene. */
const interfaceIcons={
 search:'<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.6 4.6"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 car:'<path d="m5 8 2-4h10l2 4M3 10l2-2h14l2 2v8H3zM5 18v2m14-2v2M6 12h3m6 0h3M8 16h8"/>',
 bonnet:'<path d="M4 18V9l8-5 8 5v9M3 18h18M7 10l5-3 5 3M7 14h10"/>',
 engine:'<path d="M6 8h9l3 3h3v7h-4l-2 2H7l-3-3H2v-6h4zM8 4h6m-3 0v4M1 12v4M8 12h5m-3 0v5"/>',
 under:'<path d="M4 7h16M6 4v6m12-6v6M4 17h16M6 14v6m12-6v6M9 7v10m6-10v10M7 12h10"/>',
 seat:'<path d="M8 3h5v5H8zM7 10h8v6H6l-1-5m10 2h4v7H7l-1-4M9 20v2m9-2v2"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
 eye:'<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
 sliders:'<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2" fill="#1a2430"/><circle cx="16" cy="12" r="2" fill="#1a2430"/><circle cx="10" cy="19" r="2" fill="#1a2430"/>',
 reset:'<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',
 play:'<path d="m9 5 10 7-10 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>'
};
function interfaceSvg(name){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(interfaceIcons[name]||interfaceIcons.layers)+'</svg>';}
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=interfaceSvg(el.dataset.icon);});
let activeDrawer=null,drawerReturnFocus=null;
const catalogDrawer=document.getElementById('searchWrap'),toolsDrawer=document.getElementById('toolDrawer'),drawerBackdrop=document.getElementById('drawerBackdrop');
function closeInterfaceDrawer(restore=false){
 if(activeDrawer)activeDrawer.hidden=true;activeDrawer=null;drawerBackdrop.hidden=true;
 document.getElementById('toolsOpen').setAttribute('aria-expanded','false');document.getElementById('catalogOpen').setAttribute('aria-expanded','false');
 if(restore&&drawerReturnFocus)drawerReturnFocus.focus();
}
function openInterfaceDrawer(type,trigger){
 if(typeof closePanel==='function')closePanel();closeInterfaceDrawer();drawerReturnFocus=trigger||document.activeElement;
 activeDrawer=type==='catalog'?catalogDrawer:toolsDrawer;activeDrawer.hidden=false;drawerBackdrop.hidden=false;
 document.getElementById(type==='catalog'?'catalogOpen':'toolsOpen').setAttribute('aria-expanded','true');
 if(type==='catalog'){searchInput.value='';renderDropdown();setTimeout(()=>searchInput.focus(),50);}else document.getElementById('toolsClose').focus();
}
for(const id of ['headerSearch','catalogOpen'])document.getElementById(id).addEventListener('click',e=>{e.stopPropagation();openInterfaceDrawer('catalog',e.currentTarget);});
document.getElementById('toolsOpen').addEventListener('click',e=>{e.stopPropagation();openInterfaceDrawer('tools',e.currentTarget);});
document.getElementById('catalogClose').addEventListener('click',()=>closeInterfaceDrawer(true));
document.getElementById('toolsClose').addEventListener('click',()=>closeInterfaceDrawer(true));
drawerBackdrop.addEventListener('click',()=>closeInterfaceDrawer(true));
searchInput.addEventListener('input',()=>document.getElementById('clearSearch').hidden=!searchInput.value);
document.getElementById('clearSearch').addEventListener('click',()=>{searchInput.value='';document.getElementById('clearSearch').hidden=true;renderDropdown();searchInput.focus();});
document.getElementById('studyBtn').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(activeDrawer)closeInterfaceDrawer(true);else closePanel();}
 if(e.key==='Tab'&&activeDrawer){const items=Array.from(activeDrawer.querySelectorAll('button:not(:disabled):not([hidden]),input:not([hidden]),select,[tabindex="0"]')).filter(el=>el.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
const interfaceViewNames={"3d":'Автомобиль',bay:'Под капотом',engine:'Внутри двигателя',under:'Вид снизу',salon:'Салон'};
window.refreshInterface=function(){
 const panelVisible=currentPart&&!document.getElementById('panel').classList.contains('hidden');document.body.classList.toggle('partOpen',!!panelVisible);
 document.getElementById('sceneTitle').textContent=interfaceViewNames[curView]||'Автомобиль';
 document.getElementById('quickEngine').hidden=curView!=='engine';
 document.getElementById('quickEngine').innerHTML='<span data-icon="'+(engineRunning?'pause':'play')+'">'+interfaceSvg(engineRunning?'pause':'play')+'</span><span>'+(engineRunning?'Пауза':'Запустить двигатель')+'</span>';
 document.getElementById('quickEngine').setAttribute('aria-label',engineRunning?'Остановить анимацию двигателя':'Запустить анимацию двигателя');
 document.getElementById('quickShell').classList.toggle('active',shellMode!==0);
 document.getElementById('quickShell').setAttribute('aria-label',['Сделать кузов прозрачным','Скрыть кузов','Вернуть кузов'][shellMode]);
 Object.entries({btn3d:'3d',btnSchema:'bay',btnCut:'engine',btnUnder:'under',btnSalon:'salon'}).forEach(([id,v])=>{const btn=document.getElementById(id);btn.classList.toggle('active',curView===v);btn.setAttribute('aria-current',curView===v?'page':'false');});
 Object.entries(chipEls).forEach(([cat,el])=>el.setAttribute('aria-checked',String(activeCats.has(cat))));
 const progress=Math.max(0,Math.min(100,studied.length/TOTAL*100));document.querySelector('.progressRing').style.setProperty('--progress',progress+'%');
 if(window.refreshLab)window.refreshLab();
 if(window.refreshModelLayout)window.refreshModelLayout();
};
let interfaceBound=false;
function bindVehicleInterface(){
 if(interfaceBound)return;interfaceBound=true;
 const panelOpen=openPanel;openPanel=function(p){closeInterfaceDrawer();panelOpen(p);window.refreshInterface();};
 const panelClose=closePanel;closePanel=function(){panelClose();window.refreshInterface();};
 // Replace the close button to remove a listener bound to the old close function.
 const oldButton=document.getElementById('panelClose');oldButton.replaceWith(oldButton.cloneNode(true));document.getElementById('panelClose').addEventListener('click',()=>closePanel());
 document.getElementById('quickShell').onclick=()=>document.getElementById('realShell').click();
 document.getElementById('quickEngine').onclick=()=>document.getElementById('enginePlay').click();
 for(const id of ['brandHome','resetCamera'])document.getElementById(id).onclick=()=>{closeInterfaceDrawer();document.getElementById('realHome').click();};
 document.getElementById('showAllSystems').onclick=()=>setCats(Object.keys(CATS));
 const progressRefresh=refreshProgress;refreshProgress=function(){progressRefresh();window.refreshInterface();};
 const resizeScene=resize;resize=function(){resizeScene();const w=canvasHost.clientWidth,h=canvasHost.clientHeight;camera.clearViewOffset();window.cobaltNeedsRender=true;};
 const showPanel=openPanel;openPanel=function(p){showPanel(p);resize();};
 Object.values(chipEls).forEach(chip=>{chip.setAttribute('role','switch');chip.tabIndex=0;chip.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chip.click();}});});
 window.refreshInterface();resize();
}
const installForInterface=window.installUnifiedVehicle;
window.installUnifiedVehicle=function(){installForInterface();bindVehicleInterface();};
if(unifiedVehicleReady)bindVehicleInterface();
