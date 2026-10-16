
const MODEL_PARTS = [{"id": "body_model", "name": "Кузов", "cat": "body", "f": "Объединяет основные элементы автомобиля. Защищает людей и задаёт форму салона.", "c": "Соединён с подвеской, дверями, стеклами и агрегатами.", "e": "Повреждение силовых элементов меняет геометрию автомобиля.", "d": "Осматривают швы, зазоры, очаги коррозии и следы ремонта. Геометрию проверяют по контрольным точкам.", "r": "Способ восстановления зависит от повреждения. Силовые элементы ремонтируют по кузовной документации.", "v": "Кузов", "modelOnly": true}, {"id": "hood_model", "name": "Капот", "cat": "body", "f": "Закрывает моторный отсек. В модели его можно открыть кнопкой.", "c": "Установлен на петлях. В закрытом положении удерживается замком.", "e": "Исправный замок предотвращает открытие капота при движении.", "d": "Проверяют петли, зазоры, замок и страховочный фиксатор.", "r": "Регулируют по документации. Повреждённые петли и замок заменяют.", "v": "Капот", "modelOnly": true}, {"id": "doors_model", "name": "Двери", "cat": "body", "f": "Обеспечивают вход в салон и закрывают боковые проёмы.", "c": "Связаны с петлями, замками, уплотнителями и проводкой.", "e": "Неплотное закрывание вызывает шум и попадание воды.", "d": "Осматривают зазоры, проверяют закрывание и состояние уплотнителей.", "r": "Регулируют петли и ответные части замков. Изношенные элементы заменяют.", "v": "Двери", "modelOnly": true}, {"id": "trunk_model", "name": "Крышка багажника", "cat": "body", "f": "Закрывает багажное отделение.", "c": "Соединена с кузовом петлями, замком и уплотнителем.", "e": "Плотность закрывания защищает багаж от осадков.", "d": "Проверяют зазоры, замок и следы воды.", "r": "Регулируют замок и петли. Повреждённый уплотнитель заменяют.", "v": "Крышка багажника", "modelOnly": true}, {"id": "glass_model", "name": "Стёкла кузова", "cat": "body", "f": "Обеспечивают обзор и защищают салон.", "c": "Связаны с рамками кузова и уплотнениями.", "e": "Трещины и загрязнения ухудшают обзор.", "d": "Проверяют трещины, сколы, герметичность и качество обзора.", "r": "Возможность ремонта скола оценивает специалист. Повреждённое стекло при необходимости заменяют.", "v": "Стёкла кузова", "modelOnly": true}, {"id": "wheels_model", "name": "Колёса и шины", "cat": "chassis", "f": "Передают усилия между автомобилем и дорогой.", "c": "Установлены на ступицах. Работают вместе с тормозами и подвеской.", "e": "Давление и износ шин влияют на сцепление и управляемость.", "d": "Проверяют давление, протектор, повреждения, биение и крепление.", "r": "Повреждённые шины заменяют. Колёса балансируют. Крепёж затягивают по документации.", "v": "Колёса и шины", "modelOnly": true}, {"id": "dashboard_model", "name": "Передняя панель салона", "cat": "interior", "f": "Размещает приборы, органы управления и воздуховоды.", "c": "Связана с проводкой, отопителем и оборудованием салона.", "e": "Позволяет контролировать состояние автомобиля и управлять оборудованием.", "d": "Проверяют крепления, работу органов управления и индикацию.", "r": "Снимают облицовки по документации. Работы около подушек безопасности требуют соблюдения заводской процедуры.", "v": "Передняя панель салона", "modelOnly": true}, {"id": "tailpipe_model", "name": "Наконечник выхлопной трубы", "cat": "exhaust", "f": "Выводит отработавшие газы за пределы кузова. В этом GLB показан только выходной участок.", "c": "Соединён с выпускной системой.", "e": "Повреждение соединений может сопровождаться шумом и утечкой газов.", "d": "На остывшей системе осматривают металл и крепления.", "r": "Повреждённый участок заменяют или восстанавливают по результатам осмотра.", "v": "Наконечник выхлопной трубы", "modelOnly": true}];
INTERNAL.forEach(p=>{p.cat='engine'; p.internal=true;});
const ALL_PARTS = PARTS.concat(INTERNAL,MODEL_PARTS);
const TOTAL = ALL_PARTS.length;
document.getElementById('progressTotal').textContent = TOTAL;

/* ============================ ПРОГРЕСС (localStorage) ============================ */
let studied = [];
try{ const raw = localStorage.getItem('cobalt_studied_v1'); const value = raw ? JSON.parse(raw) : []; studied = Array.isArray(value) ? [...new Set(value.filter(id=>ALL_PARTS.some(p=>p.id===id)))] : []; }catch(e){ studied = []; }
function saveStudied(){ try{ localStorage.setItem('cobalt_studied_v1', JSON.stringify(studied)); }catch(e){} }
function isStudied(id){ return studied.indexOf(id) !== -1; }
function toggleStudied(id){
  const i = studied.indexOf(id);
  if(i===-1) studied.push(id); else studied.splice(i,1);
  saveStudied(); refreshProgress();
}
function refreshProgress(){ document.getElementById('progressCount').textContent = studied.length; }
refreshProgress();

/* ============================ ЧИПЫ КАТЕГОРИЙ + ЛЕГЕНДА ============================ */
let activeCats = new Set(Object.keys(CATS));
const chipEls = {};
const chipbar = document.getElementById('chipbar');
Object.keys(CATS).forEach(key=>{
  const c = CATS[key];
  const chip = document.createElement('div');
  chip.className = 'chip active';
  chip.style.color = '#'+c.color.toString(16).padStart(6,'0');
  chip.innerHTML = '<span class="dot" style="background:#'+c.color.toString(16).padStart(6,'0')+'"></span>'+c.label;
  chip.addEventListener('click', ()=>{
    if(activeCats.has(key)){ activeCats.delete(key); chip.classList.remove('active'); }
    else{ activeCats.add(key); chip.classList.add('active'); }
    applyCategoryFilter();
  });
  chipEls[key]=chip; chipbar.appendChild(chip);
});
const legend = document.getElementById('legend');
Object.keys(CATS).forEach(key=>{
  const c = CATS[key];
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<span class="dot" style="background:#'+c.color.toString(16).padStart(6,'0')+'"></span>'+c.label;
  legend.appendChild(row);
});

/* ============================ ПАНЕЛЬ ДЕТАЛИ ============================ */
const panelEmpty = document.getElementById('panelEmpty');
const panelBody = document.getElementById('panelBody');
const TABS = [
  {key:'f', label:'Функция'},
  {key:'c', label:'Связи'},
  {key:'e', label:'Влияние'},
  {key:'d', label:'Диагностика'},
  {key:'r', label:'Ремонт'},
];
const tabbar = document.getElementById('tabbar');
TABS.forEach((t,i)=>{
  const b = document.createElement('button');
  b.textContent = t.label;
  b.dataset.key = t.key;
  if(i===0) b.classList.add('active');
  b.addEventListener('click', ()=>{
    tabbar.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.tabpane').forEach(p=>p.classList.remove('active'));
    document.getElementById('tab-'+t.key).classList.add('active');
  });
  tabbar.appendChild(b);
});
const panelScroll = document.getElementById('panelScroll');
TABS.forEach(t=>{
  const d = document.createElement('div');
  d.className = 'tabpane';
  d.id = 'tab-'+t.key;
  if(t.key==='f') d.classList.add('active');
  panelScroll.appendChild(d);
});

let currentPart = null;
function openPanel(part){
  currentPart = part;
  panelEmpty.style.display = 'none';
  panelBody.classList.add('show');
  document.getElementById('panel').classList.remove('hidden');
  const catColor = '#'+CATS[part.cat].color.toString(16).padStart(6,'0');
  document.getElementById('panelCat').querySelector('.dot').style.background = catColor;
  document.getElementById('panelCatText').textContent = part.internal ? 'Внутри двигателя' : CATS[part.cat].label;
  document.getElementById('panelName').textContent = part.name;
  document.getElementById('tab-f').innerHTML = '<p>'+part.f+'</p>';
  document.getElementById('tab-c').innerHTML = '<p>'+part.c+'</p>';
  document.getElementById('tab-e').innerHTML = '<p>'+part.e+'</p>';
  document.getElementById('tab-d').innerHTML = '<p>'+part.d+'</p>';
  document.getElementById('tab-r').innerHTML = '<p>'+part.r+'</p>'+
    '<a class="videoLink" target="_blank" rel="noopener" href="'+yt(part.v)+'">'+
    '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z"/></svg>'+
    'Смотреть разборы этого узла на YouTube</a>';
  tabbar.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
  tabbar.querySelector('button').classList.add('active');
  document.querySelectorAll('.tabpane').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-f').classList.add('active');
  requestAnimationFrame(resize);
  const studyBtn = document.getElementById('studyBtn');
  updateStudyBtn(part.id);
  studyBtn.onclick = ()=>{ toggleStudied(part.id); updateStudyBtn(part.id); };
}
function updateStudyBtn(id){
  const b = document.getElementById('studyBtn');
  if(isStudied(id)){ b.textContent = '✓ Изучено'; b.classList.add('done'); }
  else{ b.textContent = 'Я изучил эту деталь'; b.classList.remove('done'); }
}
document.getElementById('panelClose').addEventListener('click', closePanel);
document.getElementById('showOnModelBtn').addEventListener('click', ()=>{
  if(!currentPart) return;
  if(currentPart.internal){ showView('cut'); }
  else { showView('3d'); selectPart3D(currentPart.id, true); }
});
function closePanel(){
  document.getElementById('panel').classList.add('hidden');
  panelEmpty.style.display = 'flex';
  panelBody.classList.remove('show');
  currentPart = null;
  clearSelection3D();
  requestAnimationFrame(resize);
}

/* ============================ ПОИСК ============================ */
const searchInput = document.getElementById('searchInput');
let searchDropdown = null;
function dotHtml(cat){
  const hex = '#'+CATS[cat].color.toString(16).padStart(6,'0');
  return '<span style="width:8px;height:8px;border-radius:50%;flex:none;display:inline-block;background:'+hex+'"></span>';
}
function makeRow(p){
  const row = document.createElement('button');
  row.type='button';
  row.className = 'searchRow';
  row.innerHTML = dotHtml(p.cat)+'<span>'+p.name+'</span>'+(p.internal?'<span class="tag">внутри</span>':'');
  row.addEventListener('click', ()=>{
    searchInput.value=''; searchInput.blur();
    if(searchDropdown){ searchDropdown.remove(); searchDropdown=null; }
    if(p.internal){ showView('cut'); selectInternalPart(p.id); }
    else{ showView('3d'); selectPart3D(p.id, true); }
  });
  return row;
}
function renderDropdown(){
  if(searchDropdown){ searchDropdown.remove(); searchDropdown=null; }
  const q = searchInput.value.trim().toLowerCase();
  searchDropdown = document.createElement('div');
  searchDropdown.id = 'searchDropdown';
  if(q){
    const matches = ALL_PARTS.filter(p=>p.name.toLowerCase().includes(q));
    if(!matches.length){
      const empty = document.createElement('div');
      empty.className = 'searchEmpty';
      empty.textContent = 'Ничего не нашлось';
      searchDropdown.appendChild(empty);
    } else {
      matches.forEach(p=> searchDropdown.appendChild(makeRow(p)) );
    }
  } else {
    // режим обзора: все детали, сгруппированные по категориям
    Object.keys(CATS).forEach(cat=>{
      const inCat = ALL_PARTS.filter(p=>p.cat===cat);
      if(!inCat.length) return;
      const head = document.createElement('div');
      head.className = 'searchGroupHead';
      head.innerHTML = dotHtml(cat)+'<span>'+CATS[cat].label+'</span>';
      searchDropdown.appendChild(head);
      inCat.forEach(p=> searchDropdown.appendChild(makeRow(p)) );
    });
  }
  document.getElementById('searchWrap').appendChild(searchDropdown);
}
searchInput.addEventListener('input', renderDropdown);
searchInput.addEventListener('focus', renderDropdown);
document.addEventListener('click', (e)=>{
  if(searchDropdown && !document.getElementById('searchWrap').contains(e.target)){ searchDropdown.remove(); searchDropdown=null; }
});

/* ============================ ВИД: 3D / РАЗРЕЗ ============================ */
let curView='3d';
function setCats(keys){
  activeCats = new Set(keys);
  Object.keys(chipEls).forEach(k=>chipEls[k].classList.toggle('active', activeCats.has(k)));
  applyCategoryFilter();
}
function showView(v){
  document.getElementById('btn3d').classList.toggle('active', v==='3d');
  document.getElementById('btnSalon').classList.toggle('active', v==='salon');
  document.getElementById('btnCut').classList.toggle('active', v==='cut');
  document.getElementById('cutaway').classList.toggle('show', v==='cut');
  if(v!==curView && v!=='cut'){
    const salon = v==='salon';
    setCats(salon ? ['interior'] : Object.keys(CATS));
    [roof,roofFrontFillet,roofRearFillet].forEach(m=>m.visible=!salon);
    hoodOpen = !salon; hoodTarget = salon ? HOOD_CLOSED : HOOD_OPEN;
    document.getElementById('hoodToggle').textContent = hoodOpen ? 'Закрыть капот' : 'Открыть капот';
    camTarget.set(0, salon?0.75:0.55, salon?0.8:-0.3);
    camDist = salon?3.6:6.3; camAz = salon?0.15:0.5; camPolar = salon?0.75:0.92;
    updateCamera();
  }
  curView = v;
  if(currentPart && ((v==='cut') === !currentPart.internal)) closePanel();
}
document.getElementById('btn3d').addEventListener('click', ()=>showView('3d'));
document.getElementById('btnSalon').addEventListener('click', ()=>showView('salon'));
document.getElementById('btnCut').addEventListener('click', ()=>showView('cut'));

/* ============================================================================
   3D СЦЕНА
   ============================================================================ */
const canvasHost = document.getElementById('canvasHost');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 50);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
canvasHost.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';
// доп. подстраховка от зума страницы жестами Safari (touch-action не везде хватает)
renderer.domElement.addEventListener('gesturestart', e=>e.preventDefault());
renderer.domElement.addEventListener('gesturechange', e=>e.preventDefault());
renderer.domElement.addEventListener('gestureend', e=>e.preventDefault());
renderer.domElement.addEventListener('dblclick', e=>e.preventDefault());
let lastTapT = 0;
document.addEventListener('touchend', e=>{
  if(e.target!==renderer.domElement)return;
  const now = Date.now();
  if(now - lastTapT < 300) e.preventDefault();
  lastTapT = now;
}, {passive:false});

scene.add(new THREE.AmbientLight(0x8b93a0, 0.65));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
keyLight.position.set(2.2,4,2.4);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x6f9bff, 0.28);
fillLight.position.set(-3,1.6,-2);
scene.add(fillLight);

const grid = new THREE.GridHelper(4.2, 22, 0x394252, 0x232a33);
grid.position.y = -0.02;
scene.add(grid);

/* ============================================================================
   КУЗОВ АВТОМОБИЛЯ — силуэт седана вытянут из 2D-профиля (не коробки),
   с вырезами под колёсные арки. Ничего здесь не кликабельно (в pickables
   не попадает), это только "рама", в которой стоит мотор.
   ========================================================================= */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024,1024);
keyLight.shadow.camera.left = -3; keyLight.shadow.camera.right = 3;
keyLight.shadow.camera.top = 3; keyLight.shadow.camera.bottom = -3;
keyLight.shadow.camera.near = 0.5; keyLight.shadow.camera.far = 10;
keyLight.shadow.bias = -0.002;
const rimLight = new THREE.DirectionalLight(0xffe3c2, 0.35);
rimLight.position.set(-1.5,2.2,-3.2);
scene.add(rimLight);

// студийный градиентный фон + лёгкий туман для глубины
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 8; bgCanvas.height = 256;
const bgCtx = bgCanvas.getContext('2d');
const bgGrad = bgCtx.createLinearGradient(0,0,0,256);
bgGrad.addColorStop(0, '#232a34');
bgGrad.addColorStop(0.55, '#12151b');
bgGrad.addColorStop(1, '#08090c');
bgCtx.fillStyle = bgGrad; bgCtx.fillRect(0,0,8,256);
scene.background = new THREE.CanvasTexture(bgCanvas);
scene.fog = new THREE.Fog(0x0d0f13, 6, 13);

// пол — принимает тень
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14,14), new THREE.MeshStandardMaterial({color:0x14171c, roughness:1, metalness:0}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.03;
ground.receiveShadow = true;
scene.add(ground);

const bodyMat  = new THREE.MeshPhysicalMaterial({color:0xcfd6de, metalness:0.6, roughness:0.34, clearcoat:0.5, clearcoatRoughness:0.25, side:THREE.DoubleSide});
const trimMat  = new THREE.MeshStandardMaterial({color:0x1f2329, metalness:0.4, roughness:0.5, side:THREE.DoubleSide});
const glassMat = new THREE.MeshPhysicalMaterial({color:0x222a33, metalness:0.1, roughness:0.08, transparent:true, opacity:0.5, side:THREE.DoubleSide});
const tireMat  = new THREE.MeshStandardMaterial({color:0x131417, metalness:0.05, roughness:0.95});
const hubMat   = new THREE.MeshStandardMaterial({color:0x9aa0a8, metalness:0.75, roughness:0.3});

const carBody = new THREE.Group();

/* ---- боковая сторона кузова — простые прямоугольные блоки (без вытяжки
   и поворотов формы, чтобы не словить ту же ошибку осей ещё раз).
   Два яруса + разрывы на месте колёс, чтобы колесо было видно сбоку. ---- */
function makeSidePanel(sign){
  const g = new THREE.Group();
  const X = sign*1.10;
  // нижний ярус (порог/крыло по высоте колеса), с разрывами под колёса
  const lowerSegs = [
    {z0:-2.00, z1:-1.88},
    {z0:-1.18, z1: 1.15},
    {z0: 1.85, z1: 2.00},
  ];
  lowerSegs.forEach(seg=>{
    const len = seg.z1-seg.z0;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.5,len), bodyMat);
    m.position.set(X, 0.35, (seg.z0+seg.z1)/2);
    m.castShadow = true;
    g.add(m);
  });
  // верхний ярус (борт кабины под окнами), сплошной
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.40,2.0), bodyMat);
  upper.position.set(X, 0.80, 0.9);
  upper.castShadow = true;
  g.add(upper);
  return g;
}
carBody.add(makeSidePanel(-1));
carBody.add(makeSidePanel(1));

// бамперы — два яруса вместо одного бруска, чтобы нос не читался как кирпич
const bumperF = new THREE.Mesh(new THREE.BoxGeometry(2.28,0.30,0.24), trimMat);
bumperF.position.set(0,0.34,-2.15); bumperF.castShadow = true;
carBody.add(bumperF);
const bumperFLip = new THREE.Mesh(new THREE.BoxGeometry(2.20,0.10,0.20), trimMat);
bumperFLip.position.set(0,0.50,-2.12); bumperFLip.castShadow = true;
carBody.add(bumperFLip);
const grilleF = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.2,0.05), trimMat);
grilleF.position.set(0,0.52,-2.08);
carBody.add(grilleF);
const bumperR = new THREE.Mesh(new THREE.BoxGeometry(2.28,0.30,0.22), trimMat);
bumperR.position.set(0,0.34,2.18); bumperR.castShadow = true;
carBody.add(bumperR);
const bumperRLip = new THREE.Mesh(new THREE.BoxGeometry(2.20,0.10,0.18), trimMat);
bumperRLip.position.set(0,0.50,2.15); bumperRLip.castShadow = true;
carBody.add(bumperRLip);

// лобовое стекло
const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.06,1.0,0.04), glassMat);
windshield.position.set(0,1.15,0.30);
windshield.rotation.x = -0.85;
carBody.add(windshield);
// заднее стекло
const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(2.06,0.65,0.04), glassMat);
rearGlass.position.set(0,1.12,1.55);
rearGlass.rotation.x = 1.0;
carBody.add(rearGlass);
// крыша + скругляющие вставки на стыках стекло-крыша (чтобы не было острого угла)
const roof = new THREE.Mesh(new THREE.BoxGeometry(2.0,0.07,0.62), bodyMat);
roof.position.set(0,1.44,1.05); roof.castShadow = true;
carBody.add(roof);
const roofFrontFillet = new THREE.Mesh(new THREE.BoxGeometry(1.98,0.09,0.12), bodyMat);
roofFrontFillet.position.set(0,1.42,0.76);
roofFrontFillet.rotation.x = -0.5;
carBody.add(roofFrontFillet);
const roofRearFillet = new THREE.Mesh(new THREE.BoxGeometry(1.98,0.09,0.12), bodyMat);
roofRearFillet.position.set(0,1.42,1.34);
roofRearFillet.rotation.x = 0.5;
carBody.add(roofRearFillet);

// днище
const underbody = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.05,4.2), trimMat);
underbody.position.set(0,0.05,0.0);
carBody.add(underbody);

/* ---- колёса: покрышка (тор) + диск ---- */
function makeWheel(sign, z){
  const g = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.20,0.085,10,22), tireMat);
  tire.rotation.y = Math.PI/2; tire.castShadow = true;
  g.add(tire);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.16,16), hubMat);
  hub.rotation.z = Math.PI/2;
  g.add(hub);
  for(let i=0;i<5;i++){
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.17,0.025,0.025), tireMat);
    spoke.rotation.x = i*(Math.PI*2/5);
    hub.add(spoke);
  }
  g.position.set(sign*1.18, 0.26, z);
  return g;
}
carBody.add(makeWheel(-1,-1.55));
carBody.add(makeWheel(1,-1.55));
carBody.add(makeWheel(-1,1.50));
carBody.add(makeWheel(1,1.50));

scene.add(carBody);

/* ---- капот: открывается/закрывается на петле у лобового стекла ---- */
const hoodGroup = new THREE.Group();
hoodGroup.position.set(0, 0.88, -0.06); // линия петли капота (у лобового)
const hoodLen = 1.99, hoodW = 2.18;
const hoodPadMat = new THREE.MeshStandardMaterial({color:0x1c1e21, roughness:0.85, metalness:0.05});
const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(hoodW, 0.06, hoodLen), hoodPadMat);
hoodMesh.position.set(0, -0.04, -hoodLen/2);
hoodMesh.castShadow = true;
hoodGroup.add(hoodMesh);
const hoodLip = new THREE.Mesh(new THREE.BoxGeometry(hoodW*0.97, 0.03, 0.05), trimMat);
hoodLip.position.set(0,-0.075,-hoodLen+0.05);
hoodGroup.add(hoodLip);
scene.add(hoodGroup);

const HOOD_OPEN = 1.05;    // рад, ~60°
const HOOD_CLOSED = -0.10; // естественный наклон закрытого капота
let hoodTarget = HOOD_OPEN;
let hoodOpen = true;
hoodGroup.rotation.x = HOOD_OPEN;
document.getElementById('hoodToggle').addEventListener('click', ()=>{
  hoodOpen = !hoodOpen;
  hoodTarget = hoodOpen ? HOOD_OPEN : HOOD_CLOSED;
  document.getElementById('hoodToggle').textContent = hoodOpen ? 'Закрыть капот' : 'Открыть капот';
});

const partMaterials = {};
const pickables = [];
const outerGroups = {}; // id -> [group,...]

function colorHex(cat){ return CATS[cat].color; }

/* Внутри одной категории детали красим в разные оттенки той же категории —
   чтобы, например, соседние "двигатель, механика" не сливались в одно пятно,
   но по цвету всё равно было видно, к какой системе деталь относится. */
const catCounters = {};
const L_SHIFT = [0, -0.15, 0.13, -0.08, 0.08, -0.22, 0.20, 0.22, -0.10];
const H_SHIFT = [0, 0.02, -0.02, 0.035, -0.035, 0.015, -0.015, 0.03, -0.03];
function variateColor(cat){
  const i = (catCounters[cat] = (catCounters[cat]||0) + 1) - 1;
  const c = new THREE.Color(colorHex(cat));
  const hsl = {h:0,s:0,l:0};
  c.getHSL(hsl);
  const l = Math.min(0.80, Math.max(0.16, hsl.l + L_SHIFT[i % L_SHIFT.length]));
  const h = (hsl.h + H_SHIFT[i % H_SHIFT.length] + 1) % 1;
  c.setHSL(h, hsl.s, l);
  return c.getHex();
}

/* Реальные материалы деталей (не "конструкторские" цвета по категории —
   категория остаётся только для чипов-фильтров и подсветки при выборе).
   На реальном моторе почти всё чёрное/серое/алюминиевое, это и повторяем. */
const REAL_COLOR = {
  radiator:0x54585e, fan:0x1c1e21, thermostat:0x6b6f75, waterpump:0x6b6f75, expansion:0xe9e4d6,
  block:0x86898f, head:0x7f838a, valvecover:0x24262a, oilfilter:0xb9bdc4, oilpan:0x2a2c2f,
  crankpulley:0x6b6f75, drivebelt:0x121314, timingcover:0x2a2c2f, pspump:0x6b6f75,
  intake:0x1f2124, throttle:0x3a3d42, fuelrail:0x54585e, injectors:0x1a1b1d,
  airbox:0x1c1e21, airhose:0x35373b,
  exhmanifold:0x4a4d51, catalyst:0x6f7378,
  battery:0x1a1c1f, alternator:0x8a8d92, starter:0x74777c, coils:0x1c1e21, fusebox:0x2a2c2f,
  ecu:0x1a1c1f, o2sensor:0x2a2c2f, crankSensor:0x2a2c2f, camSensor:0x2a2c2f,
  maf:0x2a2c2f, coolantSensor:0x2a2c2f, knockSensor:0x2a2c2f,
};
const GLASS_IDS = new Set(['expansion']);
const METAL_IDS = new Set(['radiator','thermostat','waterpump','block','head','oilfilter','crankpulley','fuelrail','alternator','starter','catalyst','pspump','throttle']);
const RUBBER_IDS = new Set(['drivebelt','airhose']);

function buildPart(part){
  if(!partMaterials[part.id]){
    const isGlass = GLASS_IDS.has(part.id);
    const isMetal = METAL_IDS.has(part.id);
    const isRubber = RUBBER_IDS.has(part.id);
    partMaterials[part.id] = new THREE.MeshStandardMaterial({
      color: variateColor(part.cat),
      roughness: isMetal ? 0.35 : (isRubber ? 0.9 : 0.5),
      metalness: isMetal ? 0.55 : (isRubber ? 0.05 : 0.25),
      transparent: isGlass, opacity: isGlass ? 0.55 : 1,
      emissive: 0x000000, emissiveIntensity: 0.6
    });
  }
  const mat = partMaterials[part.id];
  const count = part.many || 1;
  const groups = [];
  for(let i=0;i<count;i++){
    let ox = 0;
    if(count>1){ ox = -part.spread/2 + (part.spread/(count-1))*i; }
    const outer = new THREE.Group();
    outer.position.set(part.pos[0]+ox, part.pos[1], part.pos[2]);
    let mesh;
    if(part.shape==='box'){
      mesh = new THREE.Mesh(new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]), mat);
    } else {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(part.radius, part.radius, part.height, 18), mat);
      if(part.rotAxis==='x') mesh.rotation.z = Math.PI/2;
      else if(part.rotAxis==='z') mesh.rotation.x = Math.PI/2;
    }
    mesh.castShadow = true;
    mesh.userData.partId = part.id;
    outer.add(mesh);
    scene.add(outer);
    pickables.push(mesh);
    groups.push(outer);
  }
  outerGroups[part.id] = groups;
}
PARTS.forEach(buildPart);

// красная крышка на аккумуляторе — маленький акцент, как в реальном моторном отсеке
const battCapMat = new THREE.MeshStandardMaterial({color:0xb5292a, roughness:0.5, metalness:0.1});
const battCap = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.03,0.2), battCapMat);
battCap.position.set(0.09,0.135,0);
outerGroups['battery'][0].add(battCap);

/* ---- камера (сферические координаты вокруг цели) ---- */
const camTarget = new THREE.Vector3(0, 0.55, -0.3);
let camDist = 6.3, camAz = 0.5, camPolar = 0.92;
function updateCamera(){
  window.cobaltNeedsRender=true;
  camera.position.x = camTarget.x + camDist*Math.sin(camPolar)*Math.sin(camAz);
  camera.position.y = camTarget.y + camDist*Math.cos(camPolar);
  camera.position.z = camTarget.z + camDist*Math.sin(camPolar)*Math.cos(camAz);
  camera.lookAt(camTarget);
}
function resize(){
  window.cobaltNeedsRender=true;
  const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
  camera.aspect = w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}
window.addEventListener('resize', resize);
resize(); updateCamera();

/* ---- управление мышью/тач (вращение одним пальцем, зум колесом/щипком/кнопками) ---- */
const CAM_MIN = 0.9, CAM_MAX = 18;
let dragging=false, lastX=0, lastY=0, moved=0;
const activePointers = new Map();
let pinchStartDist = 0, pinchStartCamDist = 0;

function dist2(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

renderer.domElement.addEventListener('pointerdown', e=>{
  activePointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  renderer.domElement.setPointerCapture(e.pointerId);
  if(activePointers.size===2){
    dragging=false;
    const pts = Array.from(activePointers.values());
    pinchStartDist = dist2(pts[0],pts[1]);
    pinchStartCamDist = camDist;
  } else if(activePointers.size===1){
    dragging=true; lastX=e.clientX; lastY=e.clientY; moved=0;
  }
});
renderer.domElement.addEventListener('pointermove', e=>{
  if(!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if(activePointers.size>=2){
    const pts = Array.from(activePointers.values());
    const d = dist2(pts[0],pts[1]);
    if(pinchStartDist>10){
      camDist = Math.max(CAM_MIN, Math.min(CAM_MAX, pinchStartCamDist*(pinchStartDist/d)));
      updateCamera();
    }
    return;
  }
  if(!dragging) return;
  const dx = e.clientX-lastX, dy = e.clientY-lastY;
  moved += Math.abs(dx)+Math.abs(dy);
  camAz -= dx*0.006;
  camPolar = Math.max(0.25, Math.min(2.7, camPolar - dy*0.006));
  lastX=e.clientX; lastY=e.clientY;
  updateCamera();
});
function endPointer(e){
  const wasDragging = dragging && activePointers.size===1;
  activePointers.delete(e.pointerId);
  if(activePointers.size<2) pinchStartDist = 0;
  if(activePointers.size===0){
    if(wasDragging && moved<5){ handlePick(e.clientX, e.clientY); }
    dragging=false;
  } else if(activePointers.size===1){
    // остался один палец после щипка — продолжаем вращать им
    const p = Array.from(activePointers.values())[0];
    dragging=true; lastX=p.x; lastY=p.y; moved=99;
  }
}
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);
renderer.domElement.addEventListener('wheel', e=>{
  e.preventDefault();
  camDist = Math.max(CAM_MIN, Math.min(CAM_MAX, camDist*(1+e.deltaY*0.0012)));
  updateCamera();
}, {passive:false});
document.getElementById('zoomIn').addEventListener('click', ()=>{ camDist = Math.max(CAM_MIN, camDist*0.8); updateCamera(); });
document.getElementById('zoomOut').addEventListener('click', ()=>{ camDist = Math.min(CAM_MAX, camDist*1.25); updateCamera(); });

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function handlePick(clientX, clientY){
  const rect = renderer.domElement.getBoundingClientRect();
  if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom) return;
  ndc.x = ((clientX-rect.left)/rect.width)*2-1;
  ndc.y = -((clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(pickables, false).filter(h=>{
    if(h.object.parent && !h.object.parent.visible) return false;
    const pt = PARTS.find(p=>p.id===h.object.userData.partId);
    return hoodOpen || (pt && pt.cat==='interior');
  });
  if(hits.length){ selectPart3D(hits[0].object.userData.partId); }
}

let selectedId = null, ghostId = null;
function selectPart3D(id, focus){
  selectedId = id;
  const part = PARTS.find(p=>p.id===id);
  if(!part) return;
  ghostId = part.inside || null;
  openPanel(part);
  if(focus){
    const g = outerGroups[id][0];
    camTarget.copy(g.position);
    updateCamera();
  }
}
function clearSelection3D(){ selectedId = null; ghostId = null; }

/* ---- фильтр категорий (показать/скрыть) ---- */
function applyCategoryFilter(){
  PARTS.forEach(p=>{
    const on = activeCats.has(p.cat);
    (outerGroups[p.id]||[]).forEach(g=> g.visible = on);
  });
}

/* ---- цикл рендера ---- */
const clock = new THREE.Clock();
let cobaltLastFrame=0;window.cobaltNeedsRender=true;
function animate(){
  requestAnimationFrame(animate);
  if(document.hidden){clock.getDelta();return;}
  const frameNow=performance.now();if(frameNow-cobaltLastFrame<33)return;cobaltLastFrame=frameNow;
  const dt = Math.min(.06,clock.getDelta());
  const t = clock.getElapsedTime();
  hoodGroup.rotation.x += (hoodTarget - hoodGroup.rotation.x) * Math.min(1, dt*4.5);
  if(!window.unifiedVehicleReady) PARTS.forEach(part=>{
    if(part.moving==='spin'){
      const axis = part.rotAxis || 'y';
      const speed = (part.id===selectedId) ? 2.4 : 0.9;
      (outerGroups[part.id]||[]).forEach(g=>{ g.rotation[axis] += speed*dt; });
    }
    const scale = (part.id===selectedId) ? (1+Math.sin(t*5)*0.05) : 1;
    (outerGroups[part.id]||[]).forEach(g=> g.scale.setScalar(scale) );
  });
  const mat = selectedId ? partMaterials[selectedId] : null;
  if(!window.unifiedVehicleReady) Object.keys(partMaterials).forEach(id=>{
    partMaterials[id].emissive.setHex(id===selectedId ? 0xff8a3d : 0x000000);
    if(!GLASS_IDS.has(id)){ const g = (id===ghostId); partMaterials[id].transparent = g; partMaterials[id].opacity = g ? 0.2 : 1; }
  });
  if(window.animateCobaltModel) window.animateCobaltModel(dt);
  if(!window.cobaltIsRealView||!window.cobaltIsRealView()||window.cobaltNeedsRender){renderer.render(scene,camera);window.cobaltNeedsRender=false;}
}
animate();

/* ============================================================================
   РАЗРЕЗ ДВИГАТЕЛЯ (2D SVG, четыре такта)
   ============================================================================ */
const STROKES = [
  {key:'intake', label:'Впуск', pistonY:206, crankDeg:250, intakeOpen:true, exhaustOpen:false, spark:false},
  {key:'compression', label:'Сжатие', pistonY:78, crankDeg:70, intakeOpen:false, exhaustOpen:false, spark:false},
  {key:'power', label:'Рабочий ход', pistonY:132, crankDeg:130, intakeOpen:false, exhaustOpen:false, spark:true},
  {key:'exhaust', label:'Выпуск', pistonY:92, crankDeg:290, intakeOpen:false, exhaustOpen:true, spark:false},
];
let curStroke = 0;
const strokeBar = document.getElementById('strokeBar');
STROKES.forEach((s,i)=>{
  const b = document.createElement('button');
  b.textContent = s.label;
  if(i===0) b.classList.add('active');
  b.addEventListener('click', ()=>{
    curStroke = i;
    strokeBar.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    updateCutFrame();
  });
  strokeBar.appendChild(b);
});

let cutEls = {};
function buildCutSVG(){
  const wrap = document.getElementById('cutSvgWrap');
  wrap.innerHTML =
  '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">'+
    '<g id="hotBlock" class="cutHot" data-id="block2"></g>'+
    '<rect x="120" y="46" width="160" height="14" rx="3" fill="#3a4350" stroke="#4b5563" stroke-width="1"/>'+
    '<g id="hotValves" class="cutHot" data-id="valves">'+
      '<rect id="valveIn" x="150" y="46" width="16" height="14" fill="#2dd4bf"/>'+
      '<rect id="valveEx" x="234" y="46" width="16" height="14" fill="#9aa3ad"/>'+
    '</g>'+
    '<g id="hotSpark" class="cutHot" data-id="sparkplug">'+
      '<rect x="192" y="20" width="16" height="28" rx="2" fill="#c084fc"/>'+
      '<path id="sparkBurst" d="M200 46 l-7 10 h5 l-4 10 l12 -13 h-6 z" fill="#ffe27a" opacity="0" style="transition:opacity .25s;"/>'+
    '</g>'+
    '<g id="hotCam" class="cutHot" data-id="camshaft">'+
      '<circle cx="158" cy="30" r="9" fill="#ff6b4a"/>'+
      '<circle cx="242" cy="30" r="9" fill="#ff6b4a"/>'+
    '</g>'+
    '<rect x="120" y="60" width="160" height="220" fill="none" stroke="#4b5563" stroke-width="2"/>'+
    '<g id="pistonGroup" class="cutHot" data-id="piston">'+
      '<rect x="128" y="0" width="144" height="46" rx="4" fill="#ff6b4a"/>'+
      '<rect x="128" y="34" width="144" height="6" fill="#7a2f1c"/>'+
    '</g>'+
    '<line id="rodLine" x1="200" y1="0" x2="200" y2="330" stroke="#e7ebef" stroke-width="10" stroke-linecap="round"/>'+
    '<g id="hotCrank" class="cutHot" data-id="crank">'+
      '<circle cx="200" cy="330" r="46" fill="none" stroke="#e7ebef" stroke-width="10"/>'+
      '<circle id="crankPin" cx="200" cy="284" r="11" fill="#ff6b4a"/>'+
    '</g>'+
    '<g id="hotRod" class="cutHot" data-id="rod"></g>'+
  '</svg>';
  cutEls.piston = document.getElementById('pistonGroup');
  cutEls.rod = document.getElementById('rodLine');
  cutEls.crankPin = document.getElementById('crankPin');
  cutEls.valveIn = document.getElementById('valveIn');
  cutEls.valveEx = document.getElementById('valveEx');
  cutEls.spark = document.getElementById('sparkBurst');
  wrap.querySelectorAll('.cutHot').forEach(el=>{
    el.addEventListener('click', ()=> selectInternalPart(el.dataset.id==='block2' ? 'block' : el.dataset.id) );
  });
}
function updateCutFrame(){
  const s = STROKES[curStroke];
  cutEls.piston.setAttribute('transform','translate(0,'+s.pistonY+')');
  const rad = s.crankDeg*Math.PI/180;
  const px = 200 + 46*Math.sin(rad), py = 330 - 46*Math.cos(rad);
  cutEls.crankPin.setAttribute('cx', px); cutEls.crankPin.setAttribute('cy', py);
  cutEls.rod.setAttribute('x1', px); cutEls.rod.setAttribute('y1', py);
  cutEls.rod.setAttribute('x2', 200); cutEls.rod.setAttribute('y2', s.pistonY+40);
  cutEls.valveIn.setAttribute('y', s.intakeOpen? 60 : 46);
  cutEls.valveEx.setAttribute('y', s.exhaustOpen? 60 : 46);
  cutEls.spark.style.opacity = s.spark ? 1 : 0;
}

const cutLabels = document.getElementById('cutLabels');
function buildCutLabels(){
  cutLabels.innerHTML='';
  INTERNAL.forEach(p=>{
    const b = document.createElement('div');
    b.className='cutLabelBtn';
    b.innerHTML = '<span class="dot"></span>'+p.name;
    b.addEventListener('click', ()=> selectInternalPart(p.id));
    cutLabels.appendChild(b);
  });
}
function selectInternalPart(id){
  const part = INTERNAL.find(p=>p.id===id);
  if(!part) return;
  openPanel(part);
}
buildCutSVG();
buildCutLabels();
updateCutFrame();
