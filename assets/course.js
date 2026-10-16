/* Lessons share the actual raycast, transforms and materials of the 3D scene. */
let courseReady=false,activeCourse=null,courseSnapshot=null,courseLastResult=null;
let courseHistory=[];try{const saved=JSON.parse(localStorage.getItem('cobalt_courses_v1')||'[]');if(Array.isArray(saved))courseHistory=saved.filter(x=>x&&['find','diagnostic','disassembly','tour'].includes(x.type)).slice(-30);}catch(e){}
const courseDrawer=document.getElementById('courseDrawer'),courseBody=document.getElementById('courseContent'),coach=document.getElementById('coachCard');
const flowRoot=new THREE.Group();flowRoot.name='Учебные потоки';flowRoot.visible=false;scene.add(flowRoot);
let flowTracks=[],flowTime=0;
const disassemblyHidden=new Set();
const escapeCourse=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const partName=id=>ALL_PARTS.find(p=>p.id===id)?.name||id;
function courseButton(label,action,style=''){const b=document.createElement('button');b.textContent=label;b.className=style;b.onclick=action;return b;}
function courseMessage(text,kind=''){const p=document.createElement('p');p.textContent=text;p.className='courseMessage '+kind;return p;}
function saveCourseResult(result){result.date=new Date().toISOString();courseHistory.push(result);courseHistory=courseHistory.slice(-30);try{localStorage.setItem('cobalt_courses_v1',JSON.stringify(courseHistory));}catch(e){}courseLastResult=result;}
function openCoursePanel(title){
 closeInterfaceDrawer();drawerReturnFocus=document.getElementById('learnOpen');activeDrawer=courseDrawer;courseDrawer.hidden=false;drawerBackdrop.hidden=false;document.getElementById('courseTitle').textContent=title;courseBody.innerHTML='';document.getElementById('courseClose').focus();
}
function showCourseHub(){
 openCoursePanel('Обучение');
 const intro=document.createElement('p');intro.className='courseIntro';intro.textContent=courseReady?'Учись прямо на 3D-модели. Выбери задание или короткий разбор.':'Подготавливаем модель. Задания станут доступны после загрузки.';courseBody.appendChild(intro);
 const tiles=[['Найди деталь','10 заданий за попытку. В банке 40 деталей.','◎',()=>startFindCourse()],['Диагностика','8 ситуаций, 32 решения с объяснениями.','⌁',showDiagnosticList],['Разборка двигателя','7 шагов от общей сборки до коленвала.','▤',()=>startDisassembly()],['Потоки в системах','Антифриз, масло, воздух и топливо.','↝',showFlowList],['Защита курсовой','8 сцен с подсказками для выступления.','▷',()=>startDefense()],['Точность и источники','Профиль B15D2, что проверено и что условно.','✓',showTechnicalProfile]];
 for(const [title,sub,icon,fn]of tiles){const b=document.createElement('button');b.className='courseTile';b.disabled=!courseReady&&title!=='Точность и источники';b.innerHTML='<span class="tileIcon">'+icon+'</span><span><strong>'+title+'</strong><small>'+sub+'</small></span><span class="tileArrow">›</span>';b.onclick=fn;courseBody.appendChild(b);}
 const exams=courseHistory.filter(x=>x.type==='find'||x.type==='diagnostic');
 if(exams.length){const last=exams[exams.length-1];const stats=document.createElement('div');stats.className='courseStats';stats.textContent='Завершено попыток: '+exams.length+'. Последний результат: '+last.score+' из '+last.total+'.';courseBody.appendChild(stats);}
 const links=document.createElement('div');links.className='courseActions';links.appendChild(courseButton('История результатов',showCourseHistory));if(activeCourse)links.appendChild(courseButton('Завершить текущий режим',()=>{stopCourse(true);showCourseHub();}));courseBody.appendChild(links);
}
function showTechnicalProfile(){
 openCoursePanel('Точность и источники');courseBody.appendChild(courseButton('‹ К обучению',showCourseHub,'textButton'));
 const intro=document.createElement('p');intro.className='courseIntro';intro.textContent='Учебный профиль: '+TEACHING_PROFILE.model+'. Техническая сверка: 15 октября 2026 года.';courseBody.appendChild(intro);
 const table=document.createElement('dl');table.className='profileTable';for(const [label,key]of [['Двигатель','engine'],['Коробка','transmission'],['Привод','drive'],['Газораспределение','timing'],['Компоновка','cylinders'],['Тормоза','brakes'],['Подвеска','suspension']]){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=TEACHING_PROFILE[key];table.append(dt,dd);}courseBody.appendChild(table);
 courseBody.appendChild(courseMessage('Исправлено: цепь ГРМ вместо ремня, отдельный ремень навесных агрегатов, обозначение датчика давления во впуске, формулировки диагностики и расположение крупных узлов по схеме моторного отсека.'));
 courseBody.appendChild(courseMessage(TEACHING_PROFILE.scope));
 const h=document.createElement('h3');h.textContent='Проверяемые источники';courseBody.appendChild(h);
 for(const source of TECH_SOURCES){const a=document.createElement('a');a.className='sourceCard';a.href=source.url;a.target='_blank';a.rel='noopener';a.innerHTML='<strong>'+escapeCourse(source.name)+'</strong><small>'+escapeCourse(source.section)+'</small>';courseBody.appendChild(a);}
 courseBody.appendChild(courseMessage('Регламент обслуживания и комплектацию конкретной машины сверяют по её VIN и документации. Здесь не указаны вымышленные моменты затяжки и ремонтные допуски.'));
}
function showCourseHistory(){
 openCoursePanel('Результаты');courseBody.appendChild(courseButton('‹ К обучению',showCourseHub,'textButton'));
 if(!courseHistory.length)courseBody.appendChild(courseMessage('Пока нет завершённых занятий. Начни с поиска деталей.'));
 for(const item of [...courseHistory].reverse()){const card=document.createElement('article');card.className='historyCard';const date=new Date(item.date);card.innerHTML='<strong>'+escapeCourse(item.title||item.type)+'</strong><small>'+escapeCourse(Number.isNaN(date.getTime())?'':date.toLocaleString('ru-RU'))+'</small><p>'+(item.total?escapeCourse(item.score+' из '+item.total+' верных с первого раза'):'Занятие завершено')+'</p>';courseBody.appendChild(card);}
 if(courseHistory.length)courseBody.appendChild(courseButton('Скачать результаты TXT',downloadCourseHistory,'primaryAction'));
}
function downloadCourseHistory(){
 const text=['COBALT 3D. Результаты учебных занятий','Профиль: '+TEACHING_PROFILE.engine+', '+TEACHING_PROFILE.transmission,'Результаты хранятся на этом устройстве.','',...courseHistory.map(x=>new Date(x.date).toLocaleString('ru-RU')+' | '+x.title+' | '+(x.total?x.score+'/'+x.total:'завершено'))].join('\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cobalt-results.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function snapshotCourse(){
 if(courseSnapshot)return;
 courseSnapshot={view:curView,shell:shellMode,exploded,run:engineRunning,colors:coloredSystems,cats:Array.from(activeCats),connections:showConnections};
}
function stopCourse(restore=true){
 activeCourse=null;disassemblyHidden.clear();clearCourseFlow();coach.hidden=true;document.body.classList.remove('learningActive','findMode');
 ['headerSearch','catalogOpen','partSelect'].forEach(id=>document.getElementById(id).disabled=false);
 if(courseReady){engineRunning=false;onlySelected=false;showConnections=false;exploded=0;document.getElementById('explodeRange').value=0;updateExploded();showView('3d');
  if(restore&&courseSnapshot){const snap=courseSnapshot;showView(snap.view);shellMode=snap.shell;exploded=snap.exploded;engineRunning=snap.run;coloredSystems=snap.colors;activeCats=new Set(snap.cats);showConnections=snap.connections;Object.entries(chipEls).forEach(([key,el])=>el.classList.toggle('active',activeCats.has(key)));document.getElementById('explodeRange').value=exploded*100;updateExploded();}
  updateUnifiedVisibility();
 }
 courseSnapshot=null;
}
function beginCourse(type){
 if(!courseSnapshot)snapshotCourse();const saved=courseSnapshot;stopCourse(false);courseSnapshot=saved;activeCourse={type};closeInterfaceDrawer();coach.hidden=false;document.body.classList.add('learningActive');
 engineRunning=false;onlySelected=false;exploded=0;coloredSystems=false;showConnections=false;updateExploded();
}
function coachHeader(tag,title){
 coach.innerHTML='<div class="coachHead"><div><span class="eyebrow">'+escapeCourse(tag)+'</span><h3>'+escapeCourse(title)+'</h3></div><button id="coachExit" aria-label="Закончить занятие">Выйти</button></div><div id="coachContent"></div>';
 document.getElementById('coachExit').onclick=()=>{stopCourse(true);showCourseHub();};if(window.prepareCoachLayout)window.prepareCoachLayout();return document.getElementById('coachContent');
}
function coachProgress(index,total){const p=document.createElement('div');p.className='coachProgress';p.innerHTML='<span style="width:'+Math.round(index/total*100)+'%"></span>';return p;}
function focusCoursePart(id,view){
 if(view)showView(view);if(id&&realById[id]){selectPart3D(id,true);document.getElementById('panel').classList.add('hidden');currentPart=null;document.body.classList.remove('partOpen');window.refreshInterface();resize();}
}
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startFindCourse(){
 if(!courseReady)return;beginCourse('find');Object.assign(activeCourse,{questions:shuffled(FIND_QUESTIONS).slice(0,10),index:0,score:0,attempts:0,hinted:false,answered:false,mistakes:[]});document.body.classList.add('findMode');
 ['headerSearch','catalogOpen','partSelect'].forEach(id=>document.getElementById(id).disabled=true);renderFindQuestion();
}
function renderFindQuestion(){
 const a=activeCourse,q=a.questions[a.index];a.attempts=0;a.hinted=false;a.answered=false;showView(q.view);shellMode=1;selectedId=null;ghostId=null;
 if(q.view==='under')shellMode=2;if(q.view==='salon')shellMode=2;updateUnifiedVisibility();
 const content=coachHeader('ПОИСК · '+(a.index+1)+' / '+a.questions.length,'Найди: '+partName(q.id));content.appendChild(coachProgress(a.index,a.questions.length));
 content.appendChild(courseMessage('Нажми на нужную деталь в 3D. Вращение, приближение и прозрачность кузова доступны.'));
 const feedback=document.createElement('p');feedback.id='findFeedback';feedback.setAttribute('aria-live','polite');feedback.className='answerFeedback';content.appendChild(feedback);
 const row=document.createElement('div');row.className='coachActions';const hint=courseButton('Подсказка',()=>{if(a.answered)return;a.hinted=true;feedback.textContent=q.hint;feedback.className='answerFeedback hint';hint.disabled=true;});row.appendChild(hint);
 row.appendChild(courseButton('Пропустить',()=>{if(a.answered)return;a.answered=true;a.mistakes.push({id:q.id,why:'Пропущено'});feedback.textContent='Пропущено. Ответ можно рассмотреть после завершения.';feedback.className='answerFeedback';showFindNext();}));content.appendChild(row);
}
function answerFindPick(id){
 const a=activeCourse;if(!a||a.type!=='find')return false;if(a.answered)return true;
 const q=a.questions[a.index],feedback=document.getElementById('findFeedback');a.attempts++;
 if(id===q.id){a.answered=true;const first=a.attempts===1&&!a.hinted;if(first)a.score++;else a.mistakes.push({id:q.id,why:a.hinted?'Использована подсказка':'Не с первой попытки'});
  selectedId=id;updateUnifiedVisibility();feedback.textContent=first?'Верно с первого раза.':a.hinted?'Верно. При подсказке балл за самостоятельный ответ не начисляется.':'Верно. В результате отмечена ошибка первой попытки.';feedback.className='answerFeedback correct';showFindNext();
 }else{feedback.textContent='Попробуй ещё раз. Сравни форму и расположение узла.';feedback.className='answerFeedback wrong';}
 return true;
}
function showFindNext(){const content=document.getElementById('coachContent');if(!content.querySelector('#findNext')){const b=courseButton(activeCourse.index===activeCourse.questions.length-1?'Результат':'Следующая деталь',()=>{const a=activeCourse;a.index++;if(a.index>=a.questions.length)finishFindCourse();else renderFindQuestion();},'primaryAction');b.id='findNext';content.appendChild(b);}}
function finishFindCourse(){
 const a=activeCourse,result={type:'find',title:'Поиск деталей',score:a.score,total:a.questions.length,mistakes:a.mistakes};saveCourseResult(result);stopCourse(true);showCourseResult(result);
}
function showCourseResult(result){
 openCoursePanel('Результат занятия');const score=document.createElement('div');score.className='resultScore';score.textContent=result.score+' / '+result.total;courseBody.appendChild(score);courseBody.appendChild(courseMessage('Правильных ответов с первого раза без подсказки. Повторные попытки помогают учиться, но не повышают этот результат.'));
 if(result.mistakes?.length){const h=document.createElement('h3');h.textContent='Что повторить';courseBody.appendChild(h);for(const item of result.mistakes){const b=courseButton(partName(item.id)+' · '+item.why,()=>{closeInterfaceDrawer();selectPart3D(item.id,true);},'reviewButton');courseBody.appendChild(b);}}
 const row=document.createElement('div');row.className='courseActions';row.appendChild(courseButton('К обучению',showCourseHub,'primaryAction'));row.appendChild(courseButton('История',showCourseHistory));courseBody.appendChild(row);
}
function showDiagnosticList(){
 openCoursePanel('Диагностические ситуации');courseBody.appendChild(courseButton('‹ К обучению',showCourseHub,'textButton'));courseBody.appendChild(courseMessage('Выбирай следующий обоснованный шаг. Объяснения появляются после ответа.'));
 for(const c of DIAGNOSTIC_CASES){const b=document.createElement('button');b.className='courseTile';b.innerHTML='<span><strong>'+escapeCourse(c.title)+'</strong><small>'+escapeCourse(c.symptom)+'</small></span><span>›</span>';b.onclick=()=>startDiagnostic(c.id);courseBody.appendChild(b);}
}
function startDiagnostic(id){
 const data=DIAGNOSTIC_CASES.find(c=>c.id===id);if(!courseReady||!data)return;beginCourse('diagnostic');Object.assign(activeCourse,{data,index:0,score:0,mistakes:[],answered:false});renderDiagnosticStage();
}
function renderDiagnosticStage(){
 const a=activeCourse,s=a.data.stages[a.index];a.answered=false;focusCoursePart(s.part,a.data.view);
 const content=coachHeader('ДИАГНОСТИКА · '+(a.index+1)+' / '+a.data.stages.length,a.data.title);content.appendChild(coachProgress(a.index,a.data.stages.length));if(a.index===0)content.appendChild(courseMessage(a.data.symptom));
 const q=document.createElement('p');q.className='coachQuestion';q.textContent=s.q;content.appendChild(q);const options=document.createElement('div');options.className='answerOptions';
 s.options.forEach((text,index)=>{const b=courseButton(text,()=>answerDiagnostic(index));b.dataset.answer=String(index);options.appendChild(b);});content.appendChild(options);
 const feedback=document.createElement('p');feedback.id='diagnosticFeedback';feedback.className='answerFeedback';feedback.setAttribute('aria-live','polite');content.appendChild(feedback);
}
function answerDiagnostic(index){
 const a=activeCourse;if(!a||a.type!=='diagnostic'||a.answered)return;const s=a.data.stages[a.index];if(!Number.isInteger(index)||index<0||index>=s.options.length)return;a.answered=true;
 const correct=index===s.answer;if(correct)a.score++;else a.mistakes.push({id:s.part,why:'Диагностический шаг '+(a.index+1)});
 document.querySelectorAll('#coachContent .answerOptions button').forEach((b,i)=>{b.disabled=true;b.classList.toggle('correctAnswer',i===s.answer);b.classList.toggle('wrongAnswer',i===index&&!correct);});
 const f=document.getElementById('diagnosticFeedback');f.textContent=(correct?'Верно. ':'Неверно. ')+s.why;f.className='answerFeedback '+(correct?'correct':'wrong');
 document.getElementById('coachContent').appendChild(courseButton(a.index===a.data.stages.length-1?'Показать результат':'Следующий шаг',()=>{a.index++;if(a.index>=a.data.stages.length){const result={type:'diagnostic',title:a.data.title,score:a.score,total:a.data.stages.length,mistakes:a.mistakes};saveCourseResult(result);stopCourse(true);showCourseResult(result);}else renderDiagnosticStage();},'primaryAction'));
}
function startDisassembly(){if(!courseReady)return;beginCourse('disassembly');activeCourse.index=0;renderDisassembly();}
function renderDisassembly(){
 const a=activeCourse,s=DISASSEMBLY_STEPS[a.index];disassemblyHidden.clear();s.hide.forEach(id=>disassemblyHidden.add(id));focusCoursePart(s.part,a.index===0?'bay':'engine');engineRunning=false;updateUnifiedVisibility();
 const content=coachHeader('РАЗБОРКА · '+(a.index+1)+' / '+DISASSEMBLY_STEPS.length,s.title);content.appendChild(coachProgress(a.index+1,DISASSEMBLY_STEPS.length));content.appendChild(courseMessage(s.text));
 const row=document.createElement('div');row.className='coachActions';const back=courseButton('Назад',()=>{if(a.index>0){a.index--;renderDisassembly();}});back.disabled=a.index===0;row.appendChild(back);
 row.appendChild(courseButton(a.index===DISASSEMBLY_STEPS.length-1?'Собрать обратно':'Следующий шаг',()=>{if(a.index<DISASSEMBLY_STEPS.length-1){a.index++;renderDisassembly();}else{saveCourseResult({type:'disassembly',title:'Разборка двигателя',steps:DISASSEMBLY_STEPS.length});stopCourse(true);showCourseHub();}},'primaryAction'));content.appendChild(row);
 if(s.hide.length)content.appendChild(courseMessage('Скрыто для показа: '+s.hide.map(partName).join(', '),'muted'));
}
function showFlowList(){
 openCoursePanel('Потоки в системах');courseBody.appendChild(courseButton('‹ К обучению',showCourseHub,'textButton'));
 for(const [key,item]of Object.entries(FLOW_LESSONS)){const b=document.createElement('button');b.className='courseTile';b.innerHTML='<span class="flowDot" style="background:#'+item.color.toString(16)+'"></span><span><strong>'+escapeCourse(item.title)+'</strong><small>'+escapeCourse(item.text)+'</small></span>';b.onclick=()=>startFlowLesson(key);courseBody.appendChild(b);}
}
function clearCourseFlow(){
 flowTracks=[];while(flowRoot.children.length){const obj=flowRoot.children[0];flowRoot.remove(obj);obj.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});}flowRoot.visible=false;
}
function createCourseFlow(key,cold=false){
 clearCourseFlow();const lesson=FLOW_LESSONS[key];if(!lesson)return;
 const ids=cold&&lesson.cold?lesson.cold:lesson.nodes;
 // World-space paths are illustrative overlays, not a plumbing CAD model.
 scene.updateMatrixWorld(true);const points=ids.map(id=>groupCenter(id)).filter(Boolean).map(v=>v.add(new THREE.Vector3(0,.06,0)));
 if(points.length<2)return;const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(110)),new THREE.LineBasicMaterial({color:lesson.color,transparent:true,opacity:.75,depthTest:false}));line.renderOrder=30;flowRoot.add(line);
 const count=30,positions=new Float32Array(count*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const dots=new THREE.Points(geo,new THREE.PointsMaterial({color:lesson.color,size:.027,depthTest:false,transparent:true,opacity:.95}));dots.renderOrder=31;flowRoot.add(dots);flowTracks.push({curve,positions,geo,count});
 for(const t of [.15,.42,.7,.9]){const pos=curve.getPoint(t),dir=curve.getTangent(t);const arrow=new THREE.ArrowHelper(dir,pos,.09,lesson.color,.035,.025);arrow.traverse(o=>{if(o.material){o.material.depthTest=false;o.material.transparent=true;o.material.opacity=.85;}o.renderOrder=32;});flowRoot.add(arrow);}
 flowRoot.visible=true;window.cobaltNeedsRender=true;
}
function startFlowLesson(key){if(!courseReady||!FLOW_LESSONS[key])return;beginCourse('flow');Object.assign(activeCourse,{key,cold:false,paused:false});renderFlowLesson();}
function renderFlowLesson(){
 const a=activeCourse,l=FLOW_LESSONS[a.key];focusCoursePart(null,l.view);shellMode=1;if(a.key==='fuel')shellMode=2;updateUnifiedVisibility();createCourseFlow(a.key,a.cold);
 const content=coachHeader('ПОТОКИ · СХЕМА НА 3D',l.title);content.appendChild(courseMessage(a.cold&&l.coldText?l.coldText:l.text));
 const legend=document.createElement('div');legend.className='flowLegend';legend.innerHTML='<span class="flowDot" style="background:#'+l.color.toString(16)+'"></span><span>Частицы и стрелки показывают направление</span>';content.appendChild(legend);
 const row=document.createElement('div');row.className='coachActions';const pause=courseButton(a.paused?'Продолжить':'Пауза потока',()=>{a.paused=!a.paused;pause.textContent=a.paused?'Продолжить':'Пауза потока';});row.appendChild(pause);
 if(a.key==='coolant')row.appendChild(courseButton(a.cold?'Прогретый двигатель':'Холодный двигатель',()=>{a.cold=!a.cold;renderFlowLesson();},'primaryAction'));
 row.appendChild(courseButton('Другие системы',showFlowList));content.appendChild(row);
 content.appendChild(courseMessage('Показаны принципиальные пути. Точная форма каналов и шлангов не воспроизводится.','muted'));
}
function startDefense(){if(!courseReady)return;beginCourse('tour');Object.assign(activeCourse,{index:0});renderDefense();}
function renderDefense(){
 const a=activeCourse,s=DEFENSE_STEPS[a.index];clearCourseFlow();disassemblyHidden.clear();focusCoursePart(s.part,s.view);engineRunning=a.index===2;if(s.flow)createCourseFlow(s.flow,false);
 const content=coachHeader('ЗАЩИТА · '+(a.index+1)+' / '+DEFENSE_STEPS.length,s.title);content.appendChild(coachProgress(a.index+1,DEFENSE_STEPS.length));content.appendChild(courseMessage(s.text));
 const note=document.createElement('details');note.className='speakerNotes';note.innerHTML='<summary>Подсказка выступающему</summary><p>'+escapeCourse(s.talk)+'</p>';content.appendChild(note);
 const row=document.createElement('div');row.className='coachActions';const back=courseButton('Назад',()=>{if(a.index>0){a.index--;renderDefense();}});back.disabled=a.index===0;row.appendChild(back);
 row.appendChild(courseButton(a.index===DEFENSE_STEPS.length-1?'Завершить показ':'Далее',()=>{if(a.index<DEFENSE_STEPS.length-1){a.index++;renderDefense();}else{saveCourseResult({type:'tour',title:'Режим защиты',steps:DEFENSE_STEPS.length});stopCourse(true);showCourseHub();}},'primaryAction'));content.appendChild(row);
}
window.routeLearningPick=id=>{if(activeCourse?.type==='find')return answerFindPick(id);if(activeCourse){focusCoursePart(id);return true;}return false;};
window.applyCourseVisibility=function(){if(!activeCourse)return;for(const m of realMeshes)if(disassemblyHidden.has(m.userData.partId))m.visible=false;};
function bindCourse(){
 if(courseReady)return;courseReady=true;
 const modelOpen=openPanel;openPanel=function(p){modelOpen(p);if(p.sources?.length){const section=document.createElement('div');section.className='partSources';section.appendChild(courseMessage('Сведения о выбранном профиле:'));for(const id of p.sources){const source=TECH_SOURCES.find(s=>s.id===id);if(!source)continue;const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener';a.textContent=source.name;section.appendChild(a);}document.getElementById('tab-f').appendChild(section);}};
 const animate=window.animateCobaltModel;window.animateCobaltModel=function(dt){animate(dt);if(flowRoot.visible&&!(activeCourse?.type==='flow'&&activeCourse.paused)){flowTime+=dt*.16;for(const track of flowTracks){for(let i=0;i<track.count;i++){const p=track.curve.getPoint((i/track.count+flowTime)%1);track.positions.set(p.toArray(),i*3);}track.geo.attributes.position.needsUpdate=true;}window.cobaltNeedsRender=true;}};
 const select=selectPart3D;selectPart3D=function(id,focus){if(activeCourse?.type==='find'){answerFindPick(id);return;}select(id,focus);};
 document.getElementById('learnOpen').disabled=false;document.getElementById('learnFromTools').disabled=false;
 if(activeDrawer===courseDrawer&&document.getElementById('courseTitle').textContent==='Обучение')showCourseHub();
}
document.getElementById('learnOpen').onclick=showCourseHub;document.getElementById('learnFromTools').onclick=showCourseHub;document.getElementById('courseClose').onclick=()=>closeInterfaceDrawer(true);
const installForCourses=window.installUnifiedVehicle;window.installUnifiedVehicle=function(){installForCourses();bindCourse();};if(unifiedVehicleReady)bindCourse();
