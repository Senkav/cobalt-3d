/* Plain labels, adjustable reading and help without technical vocabulary. */
let easyPreferences={size:'normal',theme:'light'};
try{const value=JSON.parse(localStorage.getItem('cobalt_readability_v1')||'null');if(value&&typeof value==='object'){if(['normal','large','largest'].includes(value.size))easyPreferences.size=value.size;if(['light','dark'].includes(value.theme))easyPreferences.theme=value.theme;}}catch(e){}
let easyReading=false,easyReadingKey='',easySpeechActive=false,easySpeechSession=0;
const easySpeechAvailable=!!window.speechSynthesis&&typeof window.SpeechSynthesisUtterance==='function';
const easySizeLabels={normal:'крупный',large:'ещё крупнее',largest:'самый крупный'};
function applyEasyPreferences(save=false){
 document.body.classList.add('easyUI');document.body.dataset.easySize=easyPreferences.size;document.body.dataset.easyTheme=easyPreferences.theme;
 document.documentElement.classList.toggle('easyPageScroll',easyPreferences.size!=='normal');
 document.documentElement.style.setProperty('--read-size',{normal:'18px',large:'21px',largest:'24px'}[easyPreferences.size]);
 document.documentElement.style.setProperty('--ui-size',{normal:'16px',large:'18px',largest:'20px'}[easyPreferences.size]);
 document.querySelectorAll('#easyFontChoices button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.size===easyPreferences.size)));
 document.querySelectorAll('#easyThemeChoices button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===easyPreferences.theme)));
 document.getElementById('easySettingsStatus').textContent='Текст: '+easySizeLabels[easyPreferences.size]+'. Фон: '+(easyPreferences.theme==='light'?'светлый':'тёмный')+'. Настройки сохраняются на этом устройстве.';
 if(save)try{localStorage.setItem('cobalt_readability_v1',JSON.stringify(easyPreferences));}catch(e){}
 if(unifiedVehicleReady)resize();
}
function stopEasySpeech(){
 easySpeechSession++;if(easySpeechAvailable)window.speechSynthesis.cancel();easySpeechActive=false;document.getElementById('easyListen').textContent='Слушать текст';document.getElementById('easySpeechStatus').textContent='';
}
function openEasyDrawer(id,trigger){
 stopEasySpeech();closeInterfaceDrawer();drawerReturnFocus=trigger;activeDrawer=document.getElementById(id);activeDrawer.hidden=false;drawerBackdrop.hidden=false;activeDrawer.querySelector('.drawerClose').focus();
}
function easyDocumentKey(){return activeCourse?'course:'+activeCourse.type:currentPart?'part:'+currentPart.id:curView==='engine'&&!labHomeVisible()?'engine':'';}
function refreshEasyReading(){
 const key=easyDocumentKey();if(easyReading&&key!==easyReadingKey){easyReading=false;stopEasySpeech();}
 document.body.classList.toggle('easyReading',easyReading);document.body.dataset.readingKind=activeCourse?'course':currentPart?'part':'engine';
 document.getElementById('easyReaderBar').hidden=!easyReading;document.getElementById('easyListen').hidden=!easySpeechAvailable;document.getElementById('stage').setAttribute('aria-hidden',String(easyReading));
}
function setEasyReading(value){
 if(value&&!easyDocumentKey())return;
 stopEasySpeech();if(value&&descriptionCollapsed)setDescriptionCollapsed(false);
 easyReading=!!value;easyReadingKey=easyDocumentKey();
 if(easyReading&&engineRunning){engineRunning=false;updateUnifiedVisibility();}
 refreshEasyReading();resize();
 if(easyReading)document.getElementById('easyReadBack').focus();
 else (activeCourse?coach.querySelector('.easyCoachRead'):currentPart?document.getElementById('easyReadPart'):document.getElementById('easyReadEngine'))?.focus();
}
function easySpeechText(){
 if(currentPart)return currentPart.name+'. '+TABS.map(t=>easyTopicLabels[t.key]+'. '+currentPart[t.key]).join('\n');
 if(activeCourse){const title=coach.querySelector('h3')?.textContent||'';const texts=Array.from(coach.querySelectorAll('#coachContent .courseMessage,#coachContent .coachQuestion,#coachContent .answerOptions button,#coachContent .answerFeedback,#coachContent .speakerNotes p')).map(el=>el.textContent);return title+'. '+texts.join('\n');}
 return 'Четыре такта двигателя. '+LAB_STROKES.map(s=>s.name+'. '+s.text).join('\n');
}
function toggleEasySpeech(){
 if(!easySpeechAvailable)return;if(easySpeechActive){stopEasySpeech();return;}
 stopEasySpeech();const session=easySpeechSession,utterance=new window.SpeechSynthesisUtterance(easySpeechText());utterance.lang='ru-RU';utterance.rate=.85;
 const done=()=>{if(session!==easySpeechSession)return;easySpeechActive=false;document.getElementById('easyListen').textContent='Слушать текст';document.getElementById('easySpeechStatus').textContent='Чтение завершено.';};
 utterance.onend=done;utterance.onerror=()=>{done();if(session===easySpeechSession)document.getElementById('easySpeechStatus').textContent='Звук не воспроизвёлся. Текст доступен ниже.';};
 easySpeechActive=true;document.getElementById('easyListen').textContent='Остановить чтение';document.getElementById('easySpeechStatus').textContent='Читаем вслух.';window.speechSynthesis.speak(utterance);
}
const easyTopicLabels={f:'Что делает эта деталь',c:'С какими деталями связана',e:'Как влияет на машину',d:'Как проверить',r:'Как ремонтируют'};
for(const t of TABS){const heading=document.createElement('h3');heading.className='easyTopicHeading';heading.textContent=easyTopicLabels[t.key];document.getElementById('panelScroll').insertBefore(heading,document.getElementById('tab-'+t.key));}
let easyModelBound=false;
function bindEasyModel(){if(easyModelBound)return;easyModelBound=true;const openBeforeEasy=openPanel;openPanel=function(p){openBeforeEasy(p);document.getElementById('panelName').setAttribute('aria-live','polite');refreshEasyReading();};}
const layoutBeforeEasy=window.refreshModelLayout;window.refreshModelLayout=function(){layoutBeforeEasy();refreshEasyReading();};
const prepareBeforeEasy=window.prepareCoachLayout;window.prepareCoachLayout=function(){prepareBeforeEasy();const actions=coach.querySelector('.coachHeadActions');if(actions&&!actions.querySelector('.easyCoachRead')){const b=document.createElement('button');b.className='easyCoachRead';b.textContent='Читать крупно';b.onclick=()=>setEasyReading(true);actions.prepend(b);}};
const engineRead=document.createElement('button');engineRead.id='easyReadEngine';engineRead.textContent='Читать объяснение крупно';engineRead.onclick=()=>setEasyReading(true);document.querySelector('.enginePanelBody').appendChild(engineRead);
document.querySelector('.enginePanelHeading h3').textContent='Работа двигателя';
const engineHint=document.createElement('p');engineHint.className='courseMessage';engineHint.textContent='Нажмите «Запустить». Детали начнут двигаться. Для остановки нажмите «Пауза».';document.querySelector('.enginePanelBody').prepend(engineHint);
const speedCaption=document.createElement('p');speedCaption.className='easySpeedCaption';speedCaption.textContent='Скорость движения';document.getElementById('engineSpeedButtons').before(speedCaption);
document.querySelectorAll('#engineSpeedButtons button').forEach(b=>{b.textContent={'0.35':'Очень медленно','0.65':'Медленно','1':'Обычно'}[b.dataset.speed];});
document.getElementById('easyHelp').onclick=()=>openEasyDrawer('easyHelpDrawer',document.getElementById('easyHelp'));
document.getElementById('easySettings').onclick=()=>openEasyDrawer('easySettingsDrawer',document.getElementById('easySettings'));
for(const id of ['easyHelpClose','easySettingsClose','easyHelpBack','easySettingsDone'])document.getElementById(id).onclick=()=>closeInterfaceDrawer(true);
document.getElementById('easyHelpCatalog').onclick=()=>{closeInterfaceDrawer();openInterfaceDrawer('catalog',document.getElementById('catalogOpen'));};
document.getElementById('easyHelpLearn').onclick=()=>{closeInterfaceDrawer();showPathMenu();};
document.getElementById('easyHelpTools').onclick=()=>{closeInterfaceDrawer();openInterfaceDrawer('tools',document.getElementById('easyHelp'));};
document.getElementById('easyReadPart').onclick=()=>setEasyReading(true);document.getElementById('easyReadBack').onclick=()=>setEasyReading(false);document.getElementById('easyListen').onclick=toggleEasySpeech;
document.querySelectorAll('#easyFontChoices button').forEach(b=>b.onclick=()=>{easyPreferences.size=b.dataset.size;applyEasyPreferences(true);});
document.querySelectorAll('#easyThemeChoices button').forEach(b=>b.onclick=()=>{easyPreferences.theme=b.dataset.theme;applyEasyPreferences(true);});
document.querySelectorAll('.drawerClose').forEach(b=>{b.textContent='Закрыть';});
document.getElementById('clearSystemFocus').textContent='Все системы';document.getElementById('clearSearch').textContent='Стереть';
document.querySelectorAll('#viewToggle button').forEach(b=>b.addEventListener('click',()=>{stopEasySpeech();if(easyReading)setEasyReading(false);}));
applyEasyPreferences();refreshEasyReading();
const installBeforeEasy=window.installUnifiedVehicle;window.installUnifiedVehicle=function(){installBeforeEasy();bindEasyModel();};if(unifiedVehicleReady)bindEasyModel();
