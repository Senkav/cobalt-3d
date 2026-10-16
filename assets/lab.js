/* A guided workspace around the same model, catalogue and learning engine. */
const LEARNING_PATH=[
 {title:'Как работает двигатель',view:'engine',icon:'engine',text:'Поршень, валы и цепной привод. Свяжи движение деталей с четырьмя тактами.',ids:['block','piston','crank','camshaft','timingchain']},
 {title:'Куда уходит тепло',view:'bay',icon:'bonnet',text:'Проследи путь жидкости и найди узлы, которые отводят тепло.',ids:['radiator','waterpump','thermostat','expansion']},
 {title:'Пуск и зарядка',view:'bay',icon:'play',text:'Что вращает двигатель при пуске и питает электрооборудование в пути.',ids:['battery','starter','alternator','drivebelt']},
 {title:'От двигателя к колёсам',view:'bay',icon:'under',text:'Проследи передачу момента в автомобиле с механической коробкой.',ids:['clutch','gearbox','differential','driveshaft']},
 {title:'Торможение и управление',view:'under',icon:'car',text:'Изучи тормоза, подвеску и рулевой механизм в виде снизу.',ids:['frontbrake','reardrum','mastercyl','strut','steeringrack']}
];
const PATH_TOTAL=LEARNING_PATH.reduce((n,c)=>n+c.ids.length,0);
const labRead=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v==null?fallback:v;}catch(e){return fallback;}};
const labWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}};
const labValidIds=value=>Array.isArray(value)?[...new Set(value.filter(id=>ALL_PARTS.some(p=>p.id===id)))]:[];
let labBookmarks=new Set(labValidIds(labRead('cobalt_bookmarks_v1',[])));
let labSystem=null,labCatalogFilter='all',labBound=false,labLabelTime=0,labEnginePhase=-1;
const homeScreen=document.getElementById('homeScreen'),systemDrawer=document.getElementById('systemsDrawer');
const labLabels=document.getElementById('systemLabels'),engineLab=document.getElementById('engineLab');
const pathCompleted=()=>LEARNING_PATH.reduce((n,c)=>n+c.ids.filter(isStudied).length,0);
const chapterCompleted=c=>c.ids.filter(isStudied).length;
function nextPathChapter(){const i=LEARNING_PATH.findIndex(c=>chapterCompleted(c)<c.ids.length);return i<0?0:i;}
function labHomeVisible(){return !homeScreen.hidden;}
function refreshLabHome(){
 const done=pathCompleted(),next=LEARNING_PATH[nextPathChapter()];
 document.getElementById('homeRouteCount').textContent=done+' / '+PATH_TOTAL;
 document.getElementById('homeRouteFill').style.width=done/PATH_TOTAL*100+'%';
 document.getElementById('homeRouteTitle').textContent=done===PATH_TOTAL?'Маршрут пройден':done?'Продолжить обучение':'Учиться по шагам';
 document.getElementById('homeRouteHint').textContent=done===PATH_TOTAL?'Закрепи знания в поиске деталей и диагностических ситуациях.':next.title+'. '+next.text;
 document.getElementById('homeSavedCount').textContent=labBookmarks.size+' деталей ↗';
 document.getElementById('homeModelState').textContent=labBound?'Выбирайте детали и читайте объяснения':'Подготавливаем модель…';
 for(const id of ['homeExplore','homeRoute','homeCases'])document.getElementById(id).disabled=!labBound;
}
function leaveLabHome(){
 if(homeScreen.hidden)return;
 homeScreen.hidden=true;document.body.classList.remove('homeOpen');labWrite('cobalt_home_seen_v1',true);if(labBound)resize();
}
function openLabHome(){
 if(activeCourse)stopCourse(true);closeInterfaceDrawer();
 labSystem=null;labLabels.innerHTML='';
 if(labBound){document.getElementById('realHome').click();engineRunning=false;}
 homeScreen.hidden=false;document.body.classList.add('homeOpen');refreshLabHome();if(labBound)resize();
}
function showPathMenu(){
 leaveLabHome();openCoursePanel('Учебный маршрут');
 courseBody.appendChild(courseButton('‹ Все занятия',showCourseHub,'textButton'));
 const done=pathCompleted();const intro=document.createElement('div');intro.className='pathOverview';
 intro.innerHTML='<span>ОТ УСТРОЙСТВА К ПОНИМАНИЮ</span><strong>'+done+'<small> / '+PATH_TOTAL+'</small></strong><p>Узлов отмечено как изученные. Это твоя отметка о знакомстве с материалом.</p>';courseBody.appendChild(intro);
 LEARNING_PATH.forEach((c,i)=>{
  const count=chapterCompleted(c),b=document.createElement('button');b.className='pathChapter';b.disabled=!courseReady;
  b.innerHTML='<span class="chapterNumber '+(count===c.ids.length?'complete':'')+'">'+(count===c.ids.length?'✓':String(i+1).padStart(2,'0'))+'</span><span><strong>'+escapeCourse(c.title)+'</strong><small>'+escapeCourse(c.text)+'</small><span class="chapterTrack"><i style="width:'+count/c.ids.length*100+'%"></i></span></span><b>'+count+'/'+c.ids.length+'</b>';
  b.onclick=()=>startPathChapter(i);courseBody.appendChild(b);
 });
 const actions=document.createElement('div');actions.className='courseActions';actions.appendChild(courseButton('Проверить себя',()=>startFindCourse(),'primaryAction'));actions.appendChild(courseButton('Диагностические ситуации',showDiagnosticList));courseBody.appendChild(actions);
}
function startPathChapter(index){
 const chapter=LEARNING_PATH[index];if(!courseReady||!chapter)return;
 beginCourse('path');const first=chapter.ids.findIndex(id=>!isStudied(id));Object.assign(activeCourse,{chapter:index,index:first<0?0:first,detail:false});renderPathStep();
}
function renderPathStep(){
 const a=activeCourse,c=LEARNING_PATH[a.chapter],id=c.ids[a.index],p=ALL_PARTS.find(x=>x.id===id);
 focusCoursePart(id,c.view);engineRunning=false;setEnginePose(enginePhase);updateUnifiedVisibility();
 const content=coachHeader('МАРШРУТ · '+(a.chapter+1)+' / '+LEARNING_PATH.length,p.name);
 content.appendChild(coachProgress(a.index+1,c.ids.length));
 const topic=document.createElement('div');topic.className='pathTopic';topic.textContent=c.title+' · узел '+(a.index+1)+' из '+c.ids.length;content.appendChild(topic);
 content.appendChild(courseMessage(p.f));
 const detail=document.createElement('details');detail.className='pathCheck';const summary=document.createElement('summary');summary.textContent='Как проверяют этот узел';const text=document.createElement('p');text.textContent=p.d;detail.append(summary,text);content.appendChild(detail);
 const actions=document.createElement('div');actions.className='coachActions';const back=courseButton('Назад',()=>{a.index--;renderPathStep();});back.disabled=a.index===0;actions.appendChild(back);
 actions.appendChild(courseButton(a.index===c.ids.length-1?'Раздел изучен':'Изучено, дальше',()=>{
  if(!isStudied(id))toggleStudied(id);
  if(a.index<c.ids.length-1){a.index++;renderPathStep();}
  else{const next=a.chapter+1;stopCourse(true);openCoursePanel('Раздел завершён');
   const success=document.createElement('div');success.className='pathSuccess';success.innerHTML='<span>✓</span><h3>'+escapeCourse(c.title)+'</h3><p>'+c.ids.length+' узлов отмечено как изученные.</p>';courseBody.appendChild(success);
   const row=document.createElement('div');row.className='courseActions';if(next<LEARNING_PATH.length)row.appendChild(courseButton('Следующий раздел',()=>startPathChapter(next),'primaryAction'));else row.appendChild(courseButton('Проверить себя',startFindCourse,'primaryAction'));row.appendChild(courseButton('Весь маршрут',showPathMenu));courseBody.appendChild(row);
  }
 },'primaryAction'));content.appendChild(actions);
}
const LAB_SYSTEM_VIEWS={body:'3d',cooling:'bay',engine:'engine',fuel:'bay',exhaust:'under',ignition:'bay',sensor:'bay',transmission:'under',brakes:'under',chassis:'under',bodyel:'3d',interior:'salon'};
const LAB_SYSTEM_ICONS={body:'car',cooling:'bonnet',engine:'engine',fuel:'layers',exhaust:'under',ignition:'play',sensor:'sliders',transmission:'under',brakes:'under',chassis:'car',bodyel:'play',interior:'seat'};
function renderSystemCards(){
 const box=document.getElementById('systemCards');box.innerHTML='';
 for(const [key,c]of Object.entries(CATS)){
  const parts=ALL_PARTS.filter(p=>p.cat===key),done=parts.filter(p=>isStudied(p.id)).length,b=document.createElement('button');b.className='systemCard';b.disabled=!labBound;
  b.style.setProperty('--system-color','#'+c.color.toString(16).padStart(6,'0'));
  b.innerHTML='<span class="systemIcon">'+interfaceSvg(LAB_SYSTEM_ICONS[key]||'layers')+'</span><span><strong>'+escapeCourse(c.label)+'</strong><small>'+parts.length+' узлов · изучено '+done+'</small></span><span>↗</span>';
  b.onclick=()=>focusLabSystem(key);box.appendChild(b);
 }
}
function openLabSystems(){
 leaveLabHome();closePanel();closeInterfaceDrawer();drawerReturnFocus=document.getElementById('systemsOpen');activeDrawer=systemDrawer;systemDrawer.hidden=false;drawerBackdrop.hidden=false;renderSystemCards();document.getElementById('systemsClose').focus();
}
function focusLabSystem(cat){
 if(!labBound||!CATS[cat])return;if(activeCourse)stopCourse(true);leaveLabHome();closeInterfaceDrawer();
 showView(LAB_SYSTEM_VIEWS[cat]||'bay');labSystem=cat;coloredSystems=true;engineRunning=false;
 activeCats=new Set(cat==='body'?['body']:[cat,'body']);Object.entries(chipEls).forEach(([key,el])=>el.classList.toggle('active',activeCats.has(key)));
 shellMode=cat==='body'?0:['under','salon'].includes(curView)?2:1;
 updateUnifiedVisibility();buildSystemLabels();
 const targets=ALL_PARTS.filter(p=>p.cat===cat&&(!p.internal||cat==='engine')),bounds=new THREE.Box3();
 targets.forEach(p=>(realById[p.id]||[]).forEach(m=>bounds.expandByObject(m)));
 if(!bounds.isEmpty()){if(bounds.getSize(new THREE.Vector3()).length()<.5)bounds.expandByScalar(.15);modelFrame(bounds,true);}
 window.cobaltNeedsRender=true;
}
function clearLabSystem(restore=true){
 labSystem=null;labLabels.innerHTML='';document.getElementById('systemFocus').hidden=true;
 if(restore&&labBound){setCats(Object.keys(CATS));coloredSystems=false;updateUnifiedVisibility();}
}
function buildSystemLabels(){
 labLabels.innerHTML='';if(!labSystem)return;
 const preferred={engine:['piston','crank','camshaft','timingchain'],cooling:['radiator','waterpump','thermostat','expansion'],fuel:['airbox','throttle','intake','fuelrail'],ignition:['battery','alternator','starter'],brakes:['frontbrake','reardrum','mastercyl'],chassis:['strut','steeringrack','rearaxle'],transmission:['gearbox','clutch','driveshaft']};
 const ids=preferred[labSystem]||ALL_PARTS.filter(p=>p.cat===labSystem).map(p=>p.id).slice(0,5);
 for(const id of ids){if(!realById[id])continue;const b=document.createElement('button');b.className='modelAnnotation';b.dataset.part=id;b.textContent=partName(id);b.onclick=()=>selectPart3D(id,true);labLabels.appendChild(b);}
 positionSystemLabels();
}
function positionSystemLabels(){
 if(!labSystem)return;labLabels.hidden=!!currentPart||!!activeCourse||labHomeVisible()||!!activeDrawer;if(labLabels.hidden)return;
 camera.updateMatrixWorld();const w=canvasHost.clientWidth,h=canvasHost.clientHeight,placed=[];let shown=0;
 for(const b of labLabels.children){const point=groupCenter(b.dataset.part);b.hidden=true;if(!point)continue;point.project(camera);const x=(point.x+1)*w/2,y=(1-point.y)*h/2;
  if(point.z>1||point.z< -1||x<24||x>w-125||y<24||y>h-28||placed.some(p=>Math.abs(p.x-x)<135&&Math.abs(p.y-y)<38)||shown>=(w<760?2:4))continue;
  b.hidden=false;b.style.left=x+'px';b.style.top=y+'px';placed.push({x,y});shown++;
 }
}
const LAB_ALIASES={battery:'акб аккумулятор батарея',timingchain:'грм газораспределение цепь',timingcover:'грм крышка',alternator:'генератор зарядка',gearbox:'кпп мкпп коробка',ecu:'эбу компьютер',maf:'map мап давление впуск',frontbrake:'суппорт диск колодки',reardrum:'барабан колодки',pspump:'гур насос',psreservoir:'гур бачок',steeringrack:'рулевая рейка',sparkplug:'свечи зажигание',coils:'катушки зажигание'};
const labNormalize=value=>String(value).toLowerCase().replace(/ё/g,'е').trim();
function renderLabCatalog(){
 if(searchDropdown)searchDropdown.remove();searchDropdown=document.createElement('div');searchDropdown.id='searchDropdown';
 const words=labNormalize(searchInput.value).split(/\s+/).filter(Boolean),category=document.getElementById('catalogSystem').value;
 const parts=ALL_PARTS.filter(p=>{
  if(labCatalogFilter==='saved'&&!labBookmarks.has(p.id)||labCatalogFilter==='new'&&isStudied(p.id)||category&&p.cat!==category)return false;
  const corpus=labNormalize(p.name+' '+CATS[p.cat].label+' '+(LAB_ALIASES[p.id]||''));return words.every(word=>corpus.includes(word));
 });
 document.getElementById('catalogSummary').textContent='Найдено: '+parts.length+' из '+TOTAL;
 document.getElementById('savedFilterCount').textContent=labBookmarks.size;
 document.querySelectorAll('#catalogFilters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===labCatalogFilter)));
 if(!parts.length){const empty=document.createElement('div');empty.className='searchEmpty';empty.textContent=labCatalogFilter==='saved'?'Сохранённых деталей пока нет. Откройте деталь, нажмите «Читать крупно» и «Сохранить деталь».':'Нет деталей по этим условиям. Попробуй убрать фильтр или изменить запрос.';searchDropdown.appendChild(empty);}
 for(const [cat,c]of Object.entries(CATS)){
  const items=parts.filter(p=>p.cat===cat);if(!items.length)continue;
  const h=document.createElement('div');h.className='searchGroupHead';h.innerHTML=dotHtml(cat)+'<span>'+escapeCourse(c.label)+'</span><small>'+items.length+'</small>';searchDropdown.appendChild(h);
  for(const p of items){const b=document.createElement('button');b.className='searchRow';b.type='button';
   b.innerHTML=dotHtml(p.cat)+'<span>'+escapeCourse(p.name)+'</span><span class="catalogMarks">'+(labBookmarks.has(p.id)?'★':'')+(isStudied(p.id)?' ✓':'')+'</span>'+(p.internal?'<span class="tag">внутри</span>':'');
   b.onclick=()=>{searchInput.blur();closeInterfaceDrawer();showView(p.internal?'engine':LAB_SYSTEM_VIEWS[p.cat]||'bay');selectPart3D(p.id,true);};searchDropdown.appendChild(b);
  }
 }
 catalogDrawer.appendChild(searchDropdown);
}
function openSavedParts(){labCatalogFilter='saved';document.getElementById('catalogSystem').value='';openInterfaceDrawer('catalog',document.getElementById('catalogOpen'));}
function togglePartBookmark(){
 if(!currentPart)return;const id=currentPart.id;if(labBookmarks.has(id))labBookmarks.delete(id);else labBookmarks.add(id);
 labWrite('cobalt_bookmarks_v1',[...labBookmarks]);window.refreshLab();
}
const LAB_STROKES=[
 {name:'Впуск',color:'#76bdf3',text:'Поршень идёт вниз. Впускные клапаны открыты, воздух поступает в цилиндр.'},
 {name:'Сжатие',color:'#bd9bf5',text:'Поршень идёт вверх. Клапаны закрыты, смесь сжимается.'},
 {name:'Рабочий ход',color:'#ffb46b',text:'После воспламенения газы расширяются. Поршень идёт вниз, клапаны закрыты.'},
 {name:'Выпуск',color:'#e7828c',text:'Поршень идёт вверх. Выпускные клапаны открыты, отработавшие газы выходят.'}
];
function setLabEngineAngle(degrees){
 engineRunning=false;setEnginePose(Math.max(0,Math.min(719,Number(degrees)))*Math.PI/180);updateUnifiedVisibility();refreshEngineLab();
}
function refreshEngineLab(){
 const visible=labBound&&curView==='engine'&&!activeCourse&&!currentPart&&!labHomeVisible();
 engineLab.hidden=!visible;document.body.classList.toggle('engineLabOpen',visible);if(!visible)return;
 const angle=Math.floor(((enginePhase*180/Math.PI)%720+720)%720),stroke=Math.floor(angle/180);
 if(angle===labEnginePhase)return;labEnginePhase=angle;
 document.getElementById('engineAngle').textContent=angle+'° / 720°';document.getElementById('cycleScrub').value=angle;
 document.querySelectorAll('#strokeControls button').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===stroke));});
 document.getElementById('strokeExplanation').textContent=LAB_STROKES[stroke].text;
 document.getElementById('cycleScrub').style.setProperty('--cycle-progress',angle/719*100+'%');
 engineLab.style.setProperty('--stroke-color',LAB_STROKES[stroke].color);
}
window.refreshLab=function(){
 if(!labBound)return;
 const focus=document.getElementById('systemFocus');focus.hidden=!labSystem||labHomeVisible()||!!activeCourse;
 if(labSystem){const c=CATS[labSystem],parts=ALL_PARTS.filter(p=>p.cat===labSystem);document.getElementById('systemFocusName').textContent=c.label+' · '+parts.filter(p=>isStudied(p.id)).length+' / '+parts.length+' изучено';focus.style.setProperty('--system-color','#'+c.color.toString(16).padStart(6,'0'));}
 const bookmark=document.getElementById('bookmarkPart'),inspect=document.getElementById('inspectPart');
 if(currentPart){const saved=labBookmarks.has(currentPart.id);bookmark.textContent=saved?'✓ Деталь сохранена':'Сохранить деталь';bookmark.setAttribute('aria-pressed',String(saved));inspect.textContent=onlySelected?'Вернуть сборку':'Рассмотреть отдельно';inspect.setAttribute('aria-pressed',String(onlySelected));}
 document.getElementById('savedFilterCount').textContent=labBookmarks.size;
 refreshLabHome();refreshEngineLab();positionSystemLabels();
};
function bindLab(){
 if(labBound)return;labBound=true;
 const previousOpen=openPanel;openPanel=function(p){leaveLabHome();if(labSystem&&p.cat!==labSystem)clearLabSystem(true);previousOpen(p);window.refreshLab();};
 const previousView=showView;showView=function(v){leaveLabHome();clearLabSystem(false);previousView(v);window.refreshLab();};
 const previousResize=resize;resize=function(){previousResize();if(labHomeVisible()){const w=canvasHost.clientWidth,h=canvasHost.clientHeight;camera.setViewOffset(w,h,w<760?-w*.025:-w*.19,w<760?h*.08:0,w,h);}window.cobaltNeedsRender=true;positionSystemLabels();};
 const previousAnimate=window.animateCobaltModel;window.animateCobaltModel=function(dt){previousAnimate(dt);refreshEngineLab();labLabelTime+=dt;if(labLabelTime>.12){labLabelTime=0;positionSystemLabels();}};
 document.getElementById('brandHome').onclick=openLabHome;
 document.getElementById('hint').textContent=window.matchMedia?.('(pointer: fine)').matches?'Мышь: вращение · колесо: масштаб · /: поиск':'Палец: вращение · два пальца: масштаб';
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D-модель автомобиля. Стрелки вращают, плюс и минус меняют масштаб.');
 renderer.domElement.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')camAz+=.12;if(e.key==='ArrowRight')camAz-=.12;if(e.key==='ArrowUp')camPolar=Math.max(.25,camPolar-.1);if(e.key==='ArrowDown')camPolar=Math.min(2.7,camPolar+.1);if(e.key==='+'||e.key==='=')camDist=Math.max(CAM_MIN,camDist*.9);if(e.key==='-')camDist=Math.min(CAM_MAX,camDist*1.1);updateCamera();});
 setEnginePose(enginePhase);refreshLabHome();if(!labRead('cobalt_home_seen_v1',false))openLabHome();else resize();window.refreshLab();
}
// Catalogue listeners hold the original function reference; replace them explicitly.
searchInput.removeEventListener('input',renderDropdown);searchInput.removeEventListener('focus',renderDropdown);renderDropdown=renderLabCatalog;
searchInput.addEventListener('input',renderDropdown);searchInput.addEventListener('focus',renderDropdown);
const previousDrawerOpen=openInterfaceDrawer;openInterfaceDrawer=function(type,trigger){leaveLabHome();previousDrawerOpen(type,trigger);window.refreshLab();};
const previousDrawerClose=closeInterfaceDrawer;closeInterfaceDrawer=function(restore){previousDrawerClose(restore);window.refreshLab();};
const previousBegin=beginCourse;beginCourse=function(type){leaveLabHome();clearLabSystem(false);previousBegin(type);window.refreshLab();};
const previousHub=showCourseHub;showCourseHub=function(){
 leaveLabHome();previousHub();const b=document.createElement('button');b.className='courseTile pathStart';b.innerHTML='<span class="tileIcon">'+interfaceSvg('layers')+'</span><span><strong>Учебный маршрут</strong><small>5 разделов · '+pathCompleted()+' из '+PATH_TOTAL+' узлов изучено</small></span><span class="tileArrow">→</span>';b.onclick=showPathMenu;courseBody.insertBefore(b,courseBody.querySelector('.courseTile'));
};
document.getElementById('learnOpen').onclick=()=>showCourseHub();document.getElementById('learnFromTools').onclick=()=>showCourseHub();
document.getElementById('progressBadge').onclick=showPathMenu;
document.getElementById('homeExplore').onclick=leaveLabHome;document.getElementById('homeRoute').onclick=()=>startPathChapter(nextPathChapter());document.getElementById('homeCases').onclick=()=>{leaveLabHome();showDiagnosticList();};document.getElementById('homeSaved').onclick=openSavedParts;
document.getElementById('systemsOpen').onclick=openLabSystems;document.getElementById('systemsClose').onclick=()=>closeInterfaceDrawer(true);document.getElementById('clearSystemFocus').onclick=()=>clearLabSystem(true);
document.getElementById('bookmarkPart').onclick=togglePartBookmark;document.getElementById('inspectPart').onclick=()=>{document.getElementById('isolatePart').click();window.refreshLab();};
document.querySelectorAll('#catalogFilters button').forEach(b=>b.onclick=()=>{labCatalogFilter=b.dataset.filter;renderDropdown();});
const categorySelect=document.getElementById('catalogSystem');Object.entries(CATS).forEach(([id,c])=>{const opt=document.createElement('option');opt.value=id;opt.textContent=c.label;categorySelect.appendChild(opt);});categorySelect.onchange=renderDropdown;
LAB_STROKES.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.style.setProperty('--stroke-color',s.color);b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+s.name;b.setAttribute('aria-pressed','false');b.onclick=()=>setLabEngineAngle(i*180+90);document.getElementById('strokeControls').appendChild(b);});
document.getElementById('cycleScrub').oninput=e=>setLabEngineAngle(e.target.value);document.getElementById('engineSpeed').onchange=e=>{window.cobaltEngineSpeed=Number(e.target.value);};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!activeDrawer&&!activeCourse?.type?.includes('find')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();openInterfaceDrawer('catalog',document.getElementById('headerSearch'));}});
const installBeforeLab=window.installUnifiedVehicle;window.installUnifiedVehicle=function(){installBeforeLab();bindLab();};if(unifiedVehicleReady)bindLab();else refreshLabHome();
