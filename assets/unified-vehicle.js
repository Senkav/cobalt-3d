/* One assembly for the supplied exterior and 84 educational mechanical nodes.
   These mechanical meshes are illustrative, not factory CAD geometry. */
let unifiedVehicleReady=false;
const unifiedGroups={}, mechanicalMeshes=[], movingPistons=[], movingRods=[], movingValves=[], movingPins=[], rotatingInternals=[];
let shellMode=0, exploded=0, engineRunning=false, enginePhase=0, coloredSystems=false, onlySelected=false, showConnections=false;
const insideIds=new Set(INTERNAL.map(p=>p.id));
const engineShellIds=new Set(['block','head','valvecover','oilpan','timingcover']);
const underIds=new Set(['driveshaft','frontbrake','strut','steeringrack','fueltank','muffler','reardrum','brakelines','rearbeam','controlarm','swaybar','fuelpump','fuelline','fuelfilter','resonator','exhaustpipe','differential']);
const customPos={airbox:[.62,.65,-1.32],airhose:[.43,.71,-1.25],throttle:[.34,.71,-1.27],battery:[-.61,.62,-1.58],expansion:[.62,.66,-1.09],fusebox:[-.64,.73,-1.22],ecu:[-.53,.49,-1.12],alternator:[.5,.44,-1.76],starter:[-.36,.4,-1.57],crankpulley:[.45,.44,-1.55],drivebelt:[.5,.52,-1.55],thermostat:[-.42,.7,-1.59],pspump:[.46,.46,-1.31],maf:[.12,.72,-1.35],psreservoir:[-.36,.77,-1.15],radiator:[0,.58,-1.99],fan:[0,.58,-1.91],gearbox:[-.57,.49,-1.54],clutch:[-.44,.5,-1.54],differential:[-.56,.33,-1.4],driveshaft:[0,.32,-1.37],frontbrake:[0,.32,-1.37],strut:[0,.55,-1.37],steeringrack:[0,.29,-1.14],fueltank:[0,.25,1.08],muffler:[.38,.22,1.83],wipers:[0,.96,-1.05],cluster:[-.3,.87,-.8],windowreg:[0,.62,-.12],doorlock:[0,.7,.15],horn:[.59,.51,-1.96],washer:[-.62,.55,-1.92],reardrum:[0,.32,1.32],brakelines:[-.48,.2,0],mastercyl:[-.43,.72,-1.11],brakebooster:[-.43,.73,-1.0],rearbeam:[0,.29,1.32],controlarm:[0,.22,-1.37],swaybar:[0,.27,-1.2],fuelpump:[0,.3,1.08],fuelline:[.38,.22,-.1],fuelfilter:[.38,.24,.8],resonator:[.3,.2,.55],exhaustpipe:[.3,.2,-.42],heater:[0,.67,-.93],cabinfilter:[.42,.68,-.92],gearlever:[0,.53,-.12],handbrake:[0,.45,.18],headunit:[0,.8,-.78]};
const metal=new THREE.MeshStandardMaterial({color:0x8b959f,metalness:.65,roughness:.4});
const darkMetal=new THREE.MeshStandardMaterial({color:0x343c44,metalness:.6,roughness:.5});
const rubber=new THREE.MeshStandardMaterial({color:0x192027,metalness:.02,roughness:.88});
const brass=new THREE.MeshStandardMaterial({color:0xb8974d,metalness:.7,roughness:.38});
const redPlastic=new THREE.MeshStandardMaterial({color:0x9b282b,roughness:.58});
const palePlastic=new THREE.MeshStandardMaterial({color:0xc9c6b7,roughness:.65});
const copper=new THREE.MeshStandardMaterial({color:0xaa6233,metalness:.6,roughness:.4});
function umesh(g,geometry,mat,pos=[0,0,0]){const m=new THREE.Mesh(geometry,mat);m.position.set(...pos);g.add(m);return m;}
function ubox(g,dims,pos=[0,0,0],mat=metal){return umesh(g,new THREE.BoxGeometry(...dims),mat,pos);}
function ucyl(g,r,len,pos=[0,0,0],axis='y',mat=metal,r2=r,segments=16){const m=umesh(g,new THREE.CylinderGeometry(r,r2,len,segments),mat,pos);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
function uring(g,r,t,pos=[0,0,0],axis='z',mat=metal){const m=umesh(g,new THREE.TorusGeometry(r,t,6,24),mat,pos);if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=Math.PI/2;return m;}
function utube(g,points,r,mat=rubber,closed=false){return umesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed),Math.min(80,Math.max(12,points.length*3)),r,7,closed),mat);}
function urod(g,a,b,r=.012,mat=metal){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const m=ucyl(g,r,d.length(),va.add(vb).multiplyScalar(.5).toArray(),'y',mat);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
function ubolts(g,w,d,y){for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])ucyl(g,.012,.015,[x,y,z],'y',darkMetal,.012,6);}
function ufins(g,w,h,d,mat=darkMetal,n=13){for(let i=0;i<n;i++)ubox(g,[w,.004,d],[0,-h/2+i*h/(n-1),0],mat);}
function helix(g,r,height,loops=6,pos=[0,0,0],mat=metal){const pts=[];for(let k=0;k<=loops*14;k++){const t=k/(loops*14);pts.push([pos[0]+r*Math.cos(t*loops*Math.PI*2),pos[1]+height*(t-.5),pos[2]+r*Math.sin(t*loops*Math.PI*2)]);}return utube(g,pts,.007,mat);}
function proceduralPart(p){
 const g=new THREE.Group();g.name='Учебный узел: '+p.name;g.userData.partId=p.id;
 const d=p.size?p.size.map(v=>v*.65):[p.radius*1.3,p.height*.65,p.radius*1.3],w=d[0],h=d[1],z=d[2];
 const radius=(p.radius||.1)*.65,len=(p.height||.2)*.65,axis=p.rotAxis||'y';
 const multi=(fn,n=4,span=.58)=>{for(let i=0;i<n;i++)fn(-span/2+i*span/(n-1),i);};
 switch(p.id){
 case 'block':{
  // A shell of four walls leaves real room for the four animated pistons.
  for(const s of [-1,1])ubox(g,[.83,.25,.028],[0,0,s*.185],darkMetal);
  for(const s of [-1,1])ubox(g,[.025,.25,.37],[s*.415,0,0],darkMetal);
  multi(x=>{ucyl(g,.093,.25,[x,0,0],'y',metal);},4,.6);
  ubox(g,[.86,.025,.4],[0,.14,0],metal);ubolts(g,.76,.33,.16);break;}
 case 'head':ubox(g,[w,h,z]);ufins(g,w+.02,h,z+.02,metal,5);ubolts(g,w*.88,z*.86,h/2+.008);break;
 case 'valvecover':ubox(g,[w,h,z],[0,0,0],rubber);ubox(g,[w*.9,.018,z*.83],[0,h/2+.008,0],rubber);multi(x=>uring(g,.032,.006,[x,.036,0],'y',darkMetal),4,.6);ucyl(g,.036,.018,[-.3,.05,.085],'y',rubber);ubolts(g,w*.9,z*.85,h/2+.018);break;
 case 'oilpan':ubox(g,[w,h,z],[0,0,0],darkMetal);ubox(g,[w+.06,.016,z+.06],[0,h/2,0],metal);ufins(g,w*.9,h*.8,z,metal,5);ucyl(g,.013,.015,[w/2,-h/2,0],'x',brass,.013,6);break;
 case 'radiator':ubox(g,[.99,.45,.035],[0,0,0],darkMetal);ufins(g,.88,.43,.05,metal,24);for(const x of [-.48,.48])ubox(g,[.055,.47,.07],[x,0,0],rubber);utube(g,[[.46,.18,0],[.55,.18,.1],[.38,.04,.26]],.024);utube(g,[[-.46,-.18,0],[-.51,-.15,.1],[-.3,-.08,.31]],.024);break;
 case 'fan':uring(g,.213,.018,[0,0,0],'z',rubber);ucyl(g,.055,.07,[0,0,0],'z',rubber);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const blade=ubox(g,[.13,.045,.014],[Math.cos(a)*.12,Math.sin(a)*.12,0],rubber);blade.rotation.z=a+.5;}break;
 case 'psreservoir':ucyl(g,.045,.12,[0,0,0],'y',palePlastic);ucyl(g,.05,.016,[0,.065,0],'y',rubber);utube(g,[[0,-.06,0],[.02,-.13,0],[.1,-.15,0]],.009);break;
 case 'battery':ubox(g,[w,h,z],[0,0,0],rubber);ubox(g,[w+.015,.018,z+.015],[0,h/2+.006,0],darkMetal);multi(x=>ucyl(g,.008,.01,[x,h/2+.02,0],'y',rubber),6,w*.75);ucyl(g,.012,.025,[-w*.32,h/2+.02,-z*.26],'y',metal);ucyl(g,.012,.025,[w*.32,h/2+.02,-z*.26],'y',redPlastic);ubox(g,[w*.55,.05,.004],[0,0,z/2+.003],palePlastic);break;
 case 'alternator':ucyl(g,radius,len,[0,0,0],'x',metal);multi(x=>uring(g,radius,.006,[x,0,0],'x',darkMetal),5,len*.9);for(let i=0;i<10;i++){const a=i*Math.PI/5;ubox(g,[len,.02,.022],[0,Math.cos(a)*radius*.8,Math.sin(a)*radius*.8],darkMetal);}ucyl(g,radius*.5,.025,[-len/2-.018,0,0],'x',darkMetal);ucyl(g,radius*.75,.04,[len/2,0,0],'x',copper);break;
 case 'starter':ucyl(g,radius,len,[0,0,0],'x',darkMetal);ucyl(g,radius*.9,.035,[len/2,0,0],'x',metal);ucyl(g,radius*.45,len*.65,[0,radius,0],'x',metal);ucyl(g,radius*.3,.05,[-len/2-.02,0,0],'x',brass);break;
 case 'intake':ucyl(g,.056,.55,[0,.045,.04],'x',rubber);multi(x=>utube(g,[[x,.045,.04],[x,.01,.1],[x,-.07,.07],[x,-.07,-.07]],.029),4,.54);break;
 case 'exhmanifold':multi(x=>utube(g,[[x,.05,0],[x,-.01,-.08],[x*.5,-.11,-.13],[.04,-.15,-.12]],.024,metal),4,.54);ubox(g,[.62,.05,.016],[0,.05,.01],darkMetal);break;
 case 'throttle':ucyl(g,radius,len,[0,0,0],'x',metal);uring(g,radius,.01,[-len/2,0,0],'x',darkMetal);ubox(g,[len*.75,radius,radius],[0,radius,.04],rubber);ucyl(g,.015,radius*2.2,[0,0,0],'y',brass);break;
 case 'fuelrail':ucyl(g,.016,.6,[0,0,0],'x',metal);multi(x=>ucyl(g,.009,.025,[x,-.02,0],'y',brass),4,.54);break;
 case 'injectors':multi(x=>{ucyl(g,.013,.08,[x,0,0],'y',rubber);ucyl(g,.008,.024,[x,-.05,0],'y',metal);uring(g,.014,.003,[x,.02,0],'y',redPlastic);ubox(g,[.025,.022,.028],[x,.005,.018],rubber);},4,.54);break;
 case 'coils':multi(x=>{ubox(g,[.055,.035,.06],[x,0,0],rubber);ucyl(g,.012,.09,[x,-.05,0],'y',rubber);ubox(g,[.025,.015,.027],[x,.005,.042],darkMetal);},4,.6);break;
 case 'airbox':ubox(g,[w,h,z],[0,0,0],rubber);ubox(g,[w+.015,.014,z+.015],[0,h*.33,0],darkMetal);for(let i=0;i<6;i++)ubox(g,[w*.8,.006,.008],[0,h/2+.008,-z*.35+i*z*.14],darkMetal);ubolts(g,w*.9,z*.88,h/2+.018);break;
 case 'airhose':utube(g,[[-.19,0,0],[-.1,.01,0],[0,.04,.02],[.12,.04,.04],[.23,0,.04]],.035);multi(x=>uring(g,.036,.004,[x,.02,.02],'x',darkMetal),12,.32);break;
 case 'thermostat':case 'waterpump':case 'pspump':ucyl(g,radius,len,[0,0,0],axis,metal);ucyl(g,radius*1.25,.015,[0,0,0],axis,darkMetal);utube(g,[[0,0,0],[radius,0,0],[radius*1.6,.03,0]],radius*.37);for(let i=0;i<4;i++){const a=i*Math.PI/2;ucyl(g,.009,.02,[Math.cos(a)*radius,.01,Math.sin(a)*radius],'y',darkMetal,.009,6);}break;
 case 'crankpulley':ucyl(g,.1,.04,[0,0,0],'x',darkMetal);for(const x of [-.015,0,.015])uring(g,.094,.003,[x,0,0],'x',rubber);ucyl(g,.018,.05,[0,0,0],'x',metal,.018,6);break;
 case 'drivebelt':utube(g,[[-.12,-.07,0],[.12,-.07,0],[.16,.05,0],[.07,.14,0],[-.12,.08,0]],.008,rubber,true);g.rotation.y=Math.PI/2;break;
 case 'timingcover':ubox(g,[w,h,z],[0,0,0],rubber);ubox(g,[w+.012,h*.9,z*.8],[0,0,0],darkMetal);ubolts(g,w,z*.8,h*.4);break;
 case 'gearbox':ucyl(g,.16,.15,[-.07,0,0],'x',metal,.21);ubox(g,[.22,.22,.22],[.07,-.02,0],metal);for(let i=0;i<7;i++)ubox(g,[.013,.24,.24],[-.02+i*.032,-.02,0],darkMetal);ucyl(g,.045,.1,[.19,-.07,.07],'x',metal);ubolts(g,.22,.24,.13);break;
 case 'clutch':ucyl(g,.14,.027,[0,0,0],'x',darkMetal);ucyl(g,.135,.012,[.023,0,0],'x',metal);for(let i=0;i<12;i++){const a=i*Math.PI/6;urod(g,[.035,Math.cos(a)*.05,Math.sin(a)*.05],[.025,Math.cos(a)*.12,Math.sin(a)*.12],.006,metal);}break;
 case 'differential':ucyl(g,.08,.18,[0,0,0],'x',darkMetal);uring(g,.084,.008,[0,0,0],'x',metal);ucyl(g,.026,.32,[0,0,0],'x',metal);break;
 case 'driveshaft':for(const side of [-1,1]){urod(g,[side*.18,0,0],[side*.72,0,0],.017,metal);for(const x of [.25,.61]){ucyl(g,.041,.08,[side*x,0,0],'x',rubber);for(let i=0;i<5;i++)uring(g,.042,.004,[side*(x-.032+i*.016),0,0],'x',darkMetal);}}break;
 case 'frontbrake':for(const side of [-1,1]){const x=side*.65;ucyl(g,.143,.018,[x,0,0],'x',metal);uring(g,.11,.006,[x+side*.012,0,0],'x',darkMetal);ucyl(g,.045,.045,[x,0,0],'x',darkMetal);ubox(g,[.065,.105,.055],[x,.07,-.1],redPlastic);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ucyl(g,.009,.05,[x,Math.sin(a)*.035,Math.cos(a)*.035],'x',metal);}}break;
 case 'reardrum':for(const side of [-1,1]){ucyl(g,.13,.065,[side*.65,0,0],'x',darkMetal);uring(g,.125,.009,[side*.68,0,0],'x',metal);ucyl(g,.04,.075,[side*.65,0,0],'x',metal);}break;
 case 'strut':for(const side of [-1,1]){ucyl(g,.03,.38,[side*.62,0,0],'y',darkMetal);ucyl(g,.015,.26,[side*.62,.18,0],'y',metal);helix(g,.064,.25,7,[side*.62,.08,0],darkMetal);ucyl(g,.085,.018,[side*.62,-.07,0],'y',metal);ucyl(g,.07,.02,[side*.62,.22,0],'y',rubber);}break;
 case 'controlarm':for(const side of [-1,1]){utube(g,[[side*.2,0,.1],[side*.65,0,0],[side*.22,0,-.12]],.023,darkMetal,true);for(const z0 of [-.12,.1])ucyl(g,.033,.07,[side*.22,0,z0],'z',rubber);ucyl(g,.032,.03,[side*.65,0,0],'y',metal);}break;
 case 'steeringrack':ucyl(g,.034,.94,[0,0,0],'x',metal);for(const side of [-1,1]){ucyl(g,.047,.12,[side*.48,0,0],'x',rubber);for(let i=0;i<6;i++)uring(g,.048,.004,[side*(.43+i*.02),0,0],'x',darkMetal);urod(g,[side*.52,0,0],[side*.7,0,0],.014,metal);}ucyl(g,.025,.18,[-.28,.08,0],'y',darkMetal);break;
 case 'swaybar':utube(g,[[-.65,0,-.12],[-.6,0,.04],[-.3,0,.04],[.3,0,.04],[.6,0,.04],[.65,0,-.12]],.016,darkMetal);break;
 case 'rearbeam':ubox(g,[1.27,.075,.075],[0,0,0],darkMetal);for(const side of [-1,1]){ubox(g,[.07,.075,.42],[side*.59,0,-.14],darkMetal);helix(g,.065,.22,6,[side*.5,.11,-.04],metal);ucyl(g,.026,.33,[side*.62,.16,.08],'y',darkMetal);}break;
 case 'brakebooster':ucyl(g,.135,.1,[0,0,0],'z',rubber);uring(g,.136,.005,[0,0,0],'z',metal);ucyl(g,.028,.16,[0,0,-.08],'z',metal);break;
 case 'mastercyl':ucyl(g,.032,.15,[0,0,0],'z',metal);ubox(g,[.09,.055,.1],[0,.044,0],palePlastic);ucyl(g,.022,.015,[0,.08,0],'y',rubber);break;
 case 'brakelines':for(const x of [-.02,.02])utube(g,[[x,.08,-1.1],[x,0,-.9],[x,0,1.16],[.3,0,1.3]],.006,brass);break;
 case 'fueltank':ubox(g,[.86,.17,.6],[0,0,0],rubber);for(const x of [-.24,.24])ubox(g,[.035,.185,.61],[x,0,0],metal);ucyl(g,.055,.02,[0,.095,0],'y',metal);break;
 case 'fuelpump':ucyl(g,.058,.15,[0,0,0],'y',palePlastic);ucyl(g,.066,.018,[0,.085,0],'y',rubber);ucyl(g,.023,.1,[0,0,0],'y',metal);utube(g,[[0,.08,0],[.05,.1,0],[.05,.15,0]],.007,brass);break;
 case 'fuelline':utube(g,[[0,.05,-1.2],[-.12,0,-1],[0,0,-.65],[0,0,.85],[-.2,.1,1.15]],.008,darkMetal);break;
 case 'muffler':case 'resonator':case 'catalyst':ucyl(g,radius,len,[0,0,0],'z',metal);for(const s of [-1,1]){ucyl(g,radius,.025,[0,0,s*len/2],'z',darkMetal);ucyl(g,radius*.25,.09,[0,0,s*(len/2+.045)],'z',metal);}for(const z0 of [-len*.32,len*.32])uring(g,radius,.006,[0,0,z0],'z',darkMetal);break;
 case 'exhaustpipe':utube(g,[[0,0,-1.05],[-.12,0,-.85],[-.12,0,-.2],[0,0,.2],[0,0,.8],[.08,.02,1.1]],.025,metal);break;
 case 'expansion':case 'washer':ubox(g,[w,h,z],[0,0,0],palePlastic);ucyl(g,.026,.035,[0,h/2+.012,0],'y',p.id==='washer'?new THREE.MeshStandardMaterial({color:0x2376ad}):rubber);ubox(g,[w*.8,.006,.003],[0,0,z/2+.002],darkMetal);utube(g,[[w/2,0,0],[w/2+.05,0,0],[w/2+.05,-.08,.03]],.008);break;
 case 'fusebox':case 'ecu':ubox(g,[w,h,z],[0,0,0],p.id==='ecu'?metal:rubber);ubox(g,[w+.01,.012,z+.01],[0,h/2,0],darkMetal);for(let i=0;i<4;i++)ubox(g,[w*.15,.024,.028],[-w*.32+i*w*.21,0,z/2],rubber);if(p.id==='ecu')ufins(g,w*.9,h*.9,z+.005,darkMetal,6);break;
 case 'oilfilter':case 'fuelfilter':ucyl(g,radius,len,[0,0,0],axis,p.id==='oilfilter'?new THREE.MeshStandardMaterial({color:0x315779}):metal);ucyl(g,radius*1.05,.012,[0,0,0],axis,darkMetal);break;
 case 'wipers':for(const side of [-1,1]){const x=side*.3;urod(g,[x,-.015,0],[x+.13,.02,.045],.008,darkMetal);urod(g,[x-.1,.02,.045],[x+.33,.02,.045],.01,rubber);}break;
 case 'windowreg':for(const side of [-1,1]){const x=side*.73;urod(g,[x,-.15,-.15],[x,.15,.15],.012,metal);urod(g,[x,-.15,.15],[x,.15,-.15],.012,metal);ubox(g,[.035,.03,.38],[x,-.16,0],metal);ucyl(g,.04,.05,[x,-.1,.08],'x',darkMetal);}break;
 case 'doorlock':for(const side of [-1,1]){ubox(g,[.03,.065,.055],[side*.74,0,0],metal);urod(g,[side*.74,0,0],[side*.74,.18,-.05],.004,metal);}break;
 case 'horn':ucyl(g,.05,.04,[0,0,0],'z',rubber);uring(g,.04,.009,[0,0,-.03],'z',darkMetal);ubox(g,[.018,.09,.014],[0,.04,.01],metal);break;
 case 'cluster':ubox(g,[.26,.11,.05],[0,0,0],rubber);for(const x of [-.075,.075]){ucyl(g,.044,.008,[x,0,.029],'z',rubber);uring(g,.044,.003,[x,0,.036],'z',metal);urod(g,[x,0,.038],[x+.02,.021,.038],.002,redPlastic);}break;
 case 'heater':ubox(g,[.3,.17,.18],[0,0,0],rubber);ucyl(g,.07,.07,[.17,-.025,0],'x',rubber);utube(g,[[0,.06,0],[0,.15,0],[.15,.15,0]],.037);break;
 case 'cabinfilter':ubox(g,[.18,.02,.12],[0,0,0],rubber);for(let i=0;i<14;i++)ubox(g,[.008,.025,.105],[-.078+i*.012,.01,0],palePlastic);break;
 case 'gearlever':ucyl(g,.012,.14,[0,.04,0],'y',metal);umesh(g,new THREE.SphereGeometry(.028,12,8),rubber,[0,.12,0]);for(let i=0;i<5;i++)ubox(g,[.075-i*.01,.012,.075-i*.01],[0,-.06+i*.011,0],rubber);break;
 case 'handbrake':ubox(g,[.036,.03,.18],[0,0,0],rubber);ucyl(g,.012,.018,[0,0,-.095],'z',metal);break;
 case 'headunit':ubox(g,[.19,.09,.04],[0,0,0],rubber);ubox(g,[.09,.038,.002],[0,.012,.023],new THREE.MeshStandardMaterial({color:0x174356,emissive:0x113244,emissiveIntensity:.4}));for(const x of [-.07,.07])ucyl(g,.014,.012,[x,-.01,.024],'z',metal);break;
 default: // Sensors have a threaded metal body, hex seat and connector.
  ucyl(g,radius*.65,len*.65,[0,-len*.12,0],'y',metal);
  ucyl(g,radius,len*.2,[0,len*.18,0],'y',brass,radius,6);
  ubox(g,[radius*1.4,len*.45,radius*1.6],[0,len*.45,0],rubber);
  for(let i=0;i<4;i++)uring(g,radius*.68,.002,[0,-len*.4+i*len*.1,0],'y',darkMetal);
  utube(g,[[0,len*.65,0],[.025,len*.8,0],[.04,len*.8,.02]],.003,rubber);
 }
 const pos=customPos[p.id]||[p.pos[0]*.65,p.pos[1]*.65+.27,-1.55+(p.pos[2]+.5)*.47];g.position.set(...pos);return g;
}
function mergeStaticGeometry(g){
 g.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(g.matrixWorld).invert();const buckets=new Map(),old=[];
 g.traverse(m=>{if(!m.isMesh)return;const matrix=new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld);let geometry=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geometry.applyMatrix4(matrix);const key=m.material.uuid;if(!buckets.has(key))buckets.set(key,{material:m.material,positions:[],normals:[],count:0});const item=buckets.get(key);item.positions.push(geometry.attributes.position.array);item.normals.push(geometry.attributes.normal.array);item.count+=geometry.attributes.position.array.length;old.push(m.geometry);geometry.dispose();});
 for(const child of [...g.children])g.remove(child);
 for(const item of buckets.values()){const positions=new Float32Array(item.count),normals=new Float32Array(item.count);let offset=0;for(let k=0;k<item.positions.length;k++){positions.set(item.positions[k],offset);normals.set(item.normals[k],offset);offset+=item.positions[k].length;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));geo.computeBoundingSphere();g.add(new THREE.Mesh(geo,item.material));}
 old.forEach(geo=>geo.dispose());
}
function addUnifiedGroup(id,g,internal=false){
 if(!['piston','rod','valves','crank','camshaft','wristpin'].includes(id))mergeStaticGeometry(g);
 scene.add(g);unifiedGroups[id]=[g];g.userData.home=g.position.clone();g.userData.internal=internal;
 g.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();o.userData.partId=id;o.userData.procedural=true;o.userData.originalColor=o.material.color.clone();o.userData.originalOpacity=o.material.opacity;o.userData.originalTransparent=o.material.transparent;o.castShadow=false;mechanicalMeshes.push(o);realMeshes.push(o);(realById[id]||(realById[id]=[])).push(o);});
}
function buildInternalEngine(){
 const ids=Object.fromEntries(INTERNAL.map(p=>{const g=new THREE.Group();g.name=p.name;g.position.set(0,.51,-1.55);return[p.id,g];}));
 const cylinderXs=[-.3,-.1,.1,.3];
 cylinderXs.forEach((x,i)=>{
  const piston=new THREE.Group();ids.piston.add(piston);piston.position.set(x,.07,0);ucyl(piston,.072,.065);for(const y of [.018,.005,-.008])uring(piston,.073,.0025,[0,y,0],'y',darkMetal);movingPistons.push({group:piston,index:i});
  const pin=ucyl(ids.wristpin,.014,.13,[x,.045,0],'x',metal);movingPins.push({node:pin,index:i});
  const liner=umesh(ids.liner,new THREE.CylinderGeometry(.077,.077,.21,24,1,true),metal,[x,.075,0]);liner.material=metal;
  const rod=new THREE.Group();ids.rod.add(rod);rod.position.set(x,-.025,0);ucyl(rod,.017,.14);uring(rod,.026,.008,[0,-.07,0],'x',metal);movingRods.push({group:rod,index:i});
  for(const zz of [-.066,.066])for(const dx of [-.032,.032]){
   const v=new THREE.Group();v.position.set(x+dx,.23,zz);ids.valves.add(v);ucyl(v,.008,.12);ucyl(v,.025,.009,[0,-.064,0]);movingValves.push({group:v,index:i,exhaust:zz<0});
   helix(ids.valvespring,.02,.06,5,[x+dx,.26,zz],metal);ucyl(ids.lifter,.014,.04,[x+dx,.31,zz],'y',metal);
  }
  ucyl(ids.sparkplug,.01,.08,[x,.23,0],'y',palePlastic);ucyl(ids.sparkplug,.014,.014,[x,.2,0],'y',brass,.014,6);
 });
 const crank=new THREE.Group();ids.crank.add(crank);ucyl(crank,.022,.89,[0,-.07,0],'x',metal);
 cylinderXs.forEach((x,i)=>{const phase=[0,Math.PI,Math.PI,0][i];const y=-.07+Math.cos(phase)*.037,z=Math.sin(phase)*.037;ucyl(crank,.021,.09,[x,y,z],'x',metal);for(const dx of [-.06,.06])ubox(crank,[.018,.065,.055],[x+dx,(y-.07)/2-.07,z/2],darkMetal);});
 crank.children.forEach(o=>o.position.y+=.07);crank.position.y=-.07;rotatingInternals.push({node:crank,axis:'x',ratio:1});
 for(const zz of [-.066,.066]){const cam=new THREE.Group();ids.camshaft.add(cam);ucyl(cam,.015,.88,[0,.32,zz],'x',metal);cylinderXs.forEach((x,i)=>{const lobe=ucyl(cam,.027,.018,[x,.324,zz],'x',metal);lobe.rotation.x=i*.5;});cam.children.forEach(o=>{o.position.y-=.32;o.position.z-=zz;});cam.position.set(0,.32,zz);rotatingInternals.push({node:cam,axis:'x',ratio:.5});}
 ucyl(ids.flywheel,.14,.025,[-.45,-.07,0],'x',metal);uring(ids.flywheel,.142,.007,[-.45,-.07,0],'x',darkMetal);
 ucyl(ids.oilpump,.045,.04,[.43,-.08,0],'x',metal);ucyl(ids.oilpump,.018,.05,[.43,-.08,0],'x',brass);
 utube(ids.oilpickup,[[-.4,-.1,0],[-.25,-.18,0],[0,-.19,0]],.013,metal);ucyl(ids.oilpickup,.04,.016,[0,-.19,0],'y',darkMetal);
 const chain=ids.timingchain;const chainPath=[[.445,-.07,0],[.445,.24,-.11],[.445,.35,-.08],[.445,.35,.08],[.445,.24,.11],[.445,-.07,0]];
 utube(chain,chainPath,.009,darkMetal,true);
 for(const [yy,zz,rr] of [[-.07,0,.045],[.32,-.066,.055],[.32,.066,.055]]){ucyl(chain,rr,.018,[.445,yy,zz],'x',metal);uring(chain,rr,.005,[.455,yy,zz],'x',darkMetal);}
 const chainCurve=new THREE.CatmullRomCurve3(chainPath.map(p=>new THREE.Vector3(...p)),true);for(let i=0;i<52;i++){const p=chainCurve.getPoint(i/52);ubox(chain,[.018,.009,.013],p.toArray(),metal);}
 Object.entries(ids).forEach(([id,g])=>addUnifiedGroup(id,g,true));
}
function setEnginePose(phase){
 enginePhase=phase;
   for(const item of movingPistons){const a=enginePhase+[0,Math.PI,Math.PI,0][item.index];item.group.position.y=-.07+.037*Math.cos(a)+Math.sqrt(.145**2-(.037*Math.sin(a))**2)+.016;}
   for(const item of movingPins){const a=enginePhase+[0,Math.PI,Math.PI,0][item.index];item.node.position.y=-.07+.037*Math.cos(a)+Math.sqrt(.145**2-(.037*Math.sin(a))**2)+.005;}
   for(const item of movingRods){const a=enginePhase+[0,Math.PI,Math.PI,0][item.index];item.group.position.y=-.07+.037*Math.cos(a)+Math.sqrt(.145**2-(.037*Math.sin(a))**2)/2;item.group.position.z=.037*Math.sin(a)/2;item.group.rotation.x=Math.asin(.037*Math.sin(a)/.145);}
   for(const item of movingValves){const cycle=(enginePhase+[0,Math.PI,3*Math.PI,2*Math.PI][item.index])%(Math.PI*4);const phase=item.exhaust?cycle-3*Math.PI:cycle;item.group.position.y=.23-(phase>=0&&phase<Math.PI?Math.sin(phase)*.018:0);}
   for(const item of rotatingInternals)item.node.rotation[item.axis]=enginePhase*item.ratio;
 window.cobaltNeedsRender=true;
}
const relatedParts={block:['head','oilpan','piston','crank'],head:['valvecover','valves','camshaft','intake','exhmanifold'],piston:['rod','wristpin','liner','crank'],rod:['piston','crank'],crank:['rod','flywheel','oilpump'],camshaft:['valves','valvespring'],valves:['camshaft','piston','intake','exhmanifold'],radiator:['fan','thermostat','waterpump','expansion'],waterpump:['radiator','thermostat'],battery:['starter','alternator','fusebox','ecu'],alternator:['battery','drivebelt'],starter:['battery','flywheel'],injectors:['fuelrail','fuelpump','ecu'],fuelpump:['fueltank','fuelline','injectors'],gearbox:['clutch','differential','driveshaft'],clutch:['flywheel','gearbox'],frontbrake:['mastercyl','brakebooster','brakelines'],mastercyl:['brakebooster','brakelines','frontbrake','reardrum'],steeringwheel:['steeringrack','controlarm'],strut:['controlarm','swaybar','wheels_model'],exhmanifold:['catalyst','o2sensor','exhaustpipe'],exhaustpipe:['catalyst','resonator','muffler'],throttle:['intake','airhose','ecu'],oilpump:['oilpickup','oilfilter','crank'],heater:['radiator','cabinfilter']};
const connectionGroup=new THREE.Group();scene.add(connectionGroup);
function groupCenter(id){const b=new THREE.Box3();(realById[id]||[]).forEach(m=>{if(realVisible(m))b.expandByObject(m);});if(b.isEmpty())(realById[id]||[]).forEach(m=>b.expandByObject(m));return b.isEmpty()?null:b.getCenter(new THREE.Vector3());}
function refreshConnections(){
 while(connectionGroup.children.length){const o=connectionGroup.children[0];connectionGroup.remove(o);o.geometry.dispose();o.material.dispose();}
 if(!showConnections||!selectedId)return;
 const from=groupCenter(selectedId);if(!from)return;
 for(const id of relatedParts[selectedId]||[]){const to=groupCenter(id);if(!to)continue;const points=[from,from.clone().lerp(to,.5).add(new THREE.Vector3(0,.15,0)),to];
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(points).getPoints(24)),new THREE.LineBasicMaterial({color:0xf6b768,transparent:true,opacity:.85,depthTest:false}));line.renderOrder=20;connectionGroup.add(line);
 }
}
function updateExploded(){
 Object.entries(unifiedGroups).forEach(([id,groups])=>groups.forEach((g,i)=>{
  const home=g.userData.home,part=ALL_PARTS.find(p=>p.id===id);let offset=new THREE.Vector3();
  if(insideIds.has(id)){const rank=INTERNAL.findIndex(p=>p.id===id);offset.set((rank%3-1)*.28,.22+Math.floor(rank/3)*.11,(rank%2-.5)*.28);}
  else if(part.cat==='engine'||['fuel','cooling','ignition','sensor','transmission'].includes(part.cat)&&home.z<-.9){offset.copy(home).sub(new THREE.Vector3(0,.5,-1.55));if(offset.length()<.08)offset.set(.1,.05,.12);offset.normalize().multiplyScalar(.45);offset.y+=.15;}
  else if(id==='wheels_model')offset.set(home.x<0?-.4:.4,0,0);
  else offset.set(home.x*.4,part.cat==='interior'?.3:-.18,home.z*.2);
  if(id==='valvecover')offset.y=.65;if(id==='head')offset.y=.4;if(id==='oilpan')offset.y=-.3;
  g.position.copy(home).addScaledVector(offset,exploded);
 }));scene.updateMatrixWorld(true);refreshConnections();window.cobaltNeedsRender=true;
}
function updateUnifiedVisibility(){
 if(!unifiedVehicleReady)return;
 carBody.visible=false;hoodGroup.visible=false;document.getElementById('cutaway').classList.remove('show');
 const engineMode=curView==='engine',cabin=curView==='salon',below=curView==='under';
 ground.visible=!below;grid.visible=!below;
 const ghostEngine=engineMode||insideIds.has(selectedId);
 const source=ALL_PARTS.find(p=>p.id===selectedId);
 const showInterior=source&&source.cat==='interior';
 realMeshes.forEach(m=>{
  const id=m.userData.partId,p=ALL_PARTS.find(x=>x.id===id);if(!p)return;
  const procedural=m.userData.procedural,internal=insideIds.has(id),shell=['body_model','hood_model','doors_model','trunk_model','glass_model'].includes(id);
  let visible=activeCats.has(p.cat);
  if(shell&&(shellMode===2||cabin||below))visible=false;
  if(internal&&!ghostEngine&&exploded===0)visible=false;
  if(onlySelected&&selectedId&&id!==selectedId&&!(showConnections&&(relatedParts[selectedId]||[]).includes(id)))visible=false;
  // Keep the surrounding car visible in the engine view as a transparent reference.
  m.visible=visible;
  const original=m.userData.unifiedBase;if(!original)return;
  let opacity=original.opacity;
  if(shell&&(shellMode===1||engineMode||showInterior))opacity=id==='glass_model'?.045:.10;
  if(!procedural&&p.cat==='interior'&&engineMode)opacity=.10;
  if(!procedural&&id==='dashboard_model'&&showInterior&&id!==selectedId)opacity=.14;
  if(engineShellIds.has(id)&&ghostEngine)opacity=.10;
  if(id==='liner'&&ghostEngine)opacity=.10;
  if(id==='gearbox'&&['clutch','differential','flywheel'].includes(selectedId))opacity=.12;
  if(id==='fueltank'&&selectedId==='fuelpump')opacity=.12;
  m.material.opacity=opacity;m.material.transparent=opacity<1||original.transparent;m.material.depthWrite=opacity>.9;
  if(coloredSystems&&procedural)m.material.color.setHex(CATS[p.cat].color);else m.material.color.copy(original.color);
 });
 document.getElementById('realShell').textContent=['Кузов: обычный','Кузов: прозрачный','Кузов: скрыт'][shellMode];
 document.getElementById('enginePlay').textContent=engineRunning?'Пауза двигателя':'Работа двигателя';
 document.getElementById('systemsColor').textContent=coloredSystems?'Обычные цвета':'Цвета систем';
 document.getElementById('isolatePart').textContent=onlySelected?'Показать все':'Только выбранная';
 document.getElementById('isolatePart').disabled=!selectedId;
 document.getElementById('connectParts').classList.toggle('active',showConnections);
 document.getElementById('realHood').textContent=realHoodOpen?'Закрыть капот':'Открыть капот';
 document.getElementById('realDoors').textContent=realDoorsOpen?'Закрыть двери':'Открыть двери';
 ['realHood','realDoors','realShell'].forEach(id=>document.getElementById(id).disabled=false);
 document.getElementById('hoodToggle').style.display='none';realControls.hidden=false;
 Object.values(chipEls).forEach(chip=>chip.style.display='');
 document.getElementById('modelNote').textContent=engineMode?'Двигатель в общей сборке · внутренние детали видны сквозь корпус':cabin?'Салон в общей сборке':below?'Вид снизу · тормоза, подвеска, магистрали и выпуск':'Общая 3D-сборка · выбери систему или деталь';
 document.getElementById('engineCycle').hidden=!engineMode;
 document.getElementById('modelNote').hidden=false;document.getElementById('modelCredit').hidden=false;
 document.getElementById('selectedModelLabel').hidden=!selectedId;
 if(selectedId)document.getElementById('selectedModelLabel').textContent=(source?source.name:'')+(insideIds.has(selectedId)?' · внутри двигателя':'');
 window.cobaltNeedsRender=true;
 if(window.applyWorkspaceVisibility)window.applyWorkspaceVisibility();
 if(window.applyCourseVisibility)window.applyCourseVisibility();
 if(window.refreshInterface)window.refreshInterface();
}
function goUnifiedView(v){
 const map={schema:'bay',cut:'engine'};curView=map[v]||v;onlySelected=false;
 if(curView!=='engine')engineRunning=false;
 if(curView==='3d'){shellMode=0;realHoodOpen=false;realDoorsOpen=false;}
 if(curView==='bay'){realHoodOpen=true;shellMode=1;}
 if(curView==='engine'){realHoodOpen=true;shellMode=1;}
 if(curView==='salon'){shellMode=2;realDoorsOpen=true;}
 if(curView==='under'){shellMode=2;}
 closePanel();activeCats=new Set(Object.keys(CATS));Object.values(chipEls).forEach(c=>c.classList.add('active'));
 document.getElementById('cutaway').classList.remove('show');
 const controls={btn3d:'3d',btnSalon:'salon',btnCut:'engine',btnSchema:'bay',btnUnder:'under'};
 Object.entries(controls).forEach(([id,value])=>document.getElementById(id).classList.toggle('active',value===curView));
 updateUnifiedVisibility();resize();
 if(curView==='3d')homeModel();
 else if(curView==='bay'||curView==='engine'){
  camAz=2.7;camPolar=.82;
  modelFrame(new THREE.Box3(new THREE.Vector3(-.78,.18,-2.05),new THREE.Vector3(.78,1.15,-.95)),true);
 }else if(curView==='salon'){
  camAz=.6;camPolar=.62;modelFrame(new THREE.Box3(new THREE.Vector3(-.75,.25,-.95),new THREE.Vector3(.75,1.3,1.4)),true);
 }else{camAz=2.5;camPolar=2.1;modelFrame(new THREE.Box3(new THREE.Vector3(-.85,.12,-2.15),new THREE.Vector3(.85,.65,2.15)),true);}
 refreshConnections();
}
function installUnifiedVehicle(){
 if(unifiedVehicleReady)return;
 // Remove the old schematic meshes and frames, keeping the descriptions and progress.
 Object.keys(outerGroups).forEach(id=>{outerGroups[id].forEach(g=>{scene.remove(g);g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});});outerGroups[id]=[];});pickables.length=0;
 PARTS.forEach(p=>{if(!realById[p.id])addUnifiedGroup(p.id,proceduralPart(p));});buildInternalEngine();
 // Move each wheel as a complete object in exploded mode. Keep the bonnet/door hinges intact.
 for(const key of [35,59,91,248]){let node;realRoot.traverse(o=>{if(o.userData.sourceNode===key)node=o;});if(!node)continue;
  const box=new THREE.Box3().setFromObject(node),g=new THREE.Group();g.position.copy(box.getCenter(new THREE.Vector3()));scene.add(g);g.updateMatrixWorld(true);g.attach(node);g.userData.home=g.position.clone();(unifiedGroups.wheels_model||(unifiedGroups.wheels_model=[])).push(g);
 }
 realMeshes.forEach(m=>{m.userData.unifiedBase={opacity:m.material.opacity,transparent:m.material.transparent,color:m.material.color.clone()};});
 unifiedVehicleReady=true;window.unifiedVehicleReady=true;window.cobaltIsRealView=()=>true;
 isRealView=()=>true;
 refreshReal=updateUnifiedVisibility;
 applyCategoryFilter=()=>{updateUnifiedVisibility();refreshConnections();};
 showView=goUnifiedView;
 const oldClosePanel=closePanel;
 closePanel=function(){oldClosePanel();if(unifiedVehicleReady){onlySelected=false;updateUnifiedVisibility();refreshConnections();}};
 const plainPanel=baseOpenPanel;
 openPanel=function(p){
  plainPanel(p);const note=document.createElement('p');note.className='sourceNote';
  note.textContent=realById[p.id]&&realById[p.id][0].userData.procedural?'Учебная 3D-модель. Форма и положение приблизительные.':'Элемент загруженной модели кузова и салона.';
  document.getElementById('tab-f').prepend(note);
  const links=relatedParts[p.id]||[];if(links.length){const row=document.createElement('div');row.className='partLinks';links.forEach(id=>{const target=ALL_PARTS.find(x=>x.id===id);if(!target)return;const b=document.createElement('button');b.textContent=target.name;b.onclick=()=>selectPart3D(id,true);row.appendChild(b);});document.getElementById('tab-c').appendChild(row);}
 };
 selectPart3D=function(id,focus){
  const p=ALL_PARTS.find(x=>x.id===id);if(!p||!realById[id])return;
  selectedId=id;ghostId=null;onlySelected=false;activeCats.add(p.cat);chipEls[p.cat].classList.add('active');
  if(insideIds.has(id)){curView='engine';realHoodOpen=true;shellMode=1;}
  else if(p.cat==='interior')shellMode=2;
  else if(realById[id][0].userData.procedural){shellMode=1;if(realById[id][0].getWorldPosition(new THREE.Vector3()).z<-1)realHoodOpen=true;}
  updateUnifiedVisibility();openPanel(p);scene.updateMatrixWorld(true);
  document.getElementById('partSelect').value=id;
  if(focus){const box=new THREE.Box3();realById[id].forEach(m=>box.expandByObject(m));const center=box.getCenter(new THREE.Vector3());
   // Retain context around tiny sensors and internal pieces.
   if(box.getSize(new THREE.Vector3()).length()<.4)box.expandByScalar(.15);
   if(underIds.has(id)){camPolar=1.85;ground.visible=false;grid.visible=false;}else camPolar=.95;
   modelFrame(box,true);
  }
  refreshConnections();
 };
 selectInternalPart=id=>selectPart3D(id,true);
 handlePick=function(x,y){const rect=renderer.domElement.getBoundingClientRect();if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return;
  ndc.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);raycaster.setFromCamera(ndc,camera);scene.updateMatrixWorld(true);
  const hits=raycaster.intersectObjects(realMeshes.filter(realVisible),false);const usable=hits.find(h=>h.object.material.opacity>.35)||hits[0];if(usable){const id=usable.object.userData.partId;if(window.routeLearningPick&&window.routeLearningPick(id))return;selectPart3D(id,false);}
 };
 const priorAnimate=animateReal;
 animateReal=function(dt){priorAnimate(dt);
  if(engineRunning){enginePhase+=dt*2.7*(window.cobaltEngineSpeed||1);window.cobaltNeedsRender=true;
   setEnginePose(enginePhase);
  }
  if(curView==='engine'){const stroke=Math.floor((enginePhase%(Math.PI*4))/Math.PI);document.getElementById('engineCycle').textContent='1-й цилиндр: '+['Впуск','Сжатие','Рабочий ход','Выпуск'][stroke]+(engineRunning?' · замедленная анимация':' · пауза');}
  if(selectedId&&showConnections&&engineRunning)refreshConnections();
 };
 window.animateCobaltModel=animateReal;
 const select=document.getElementById('partSelect');Object.keys(CATS).forEach(cat=>{const opts=ALL_PARTS.filter(p=>p.cat===cat);if(!opts.length)return;const optg=document.createElement('optgroup');optg.label=CATS[cat].label;opts.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name;optg.appendChild(opt);});select.appendChild(optg);});
 select.onchange=()=>selectPart3D(select.value,true);
 document.getElementById('realShell').onclick=()=>{shellMode=(shellMode+1)%3;updateUnifiedVisibility();};
 document.getElementById('realHood').onclick=()=>{realHoodOpen=!realHoodOpen;updateUnifiedVisibility();};
 document.getElementById('realDoors').onclick=()=>{realDoorsOpen=!realDoorsOpen;updateUnifiedVisibility();};
 const basicResize=resize;resize=function(){basicResize();const w=canvasHost.clientWidth,h=canvasHost.clientHeight;if(w<760)camera.setViewOffset(w,h,0,-Math.min(55,h*.10),w,h);else camera.clearViewOffset();};
 document.getElementById('realHome').onclick=()=>{exploded=0;document.getElementById('explodeRange').value=0;updateExploded();goUnifiedView('3d');};
 document.getElementById('enginePlay').onclick=()=>{engineRunning=!engineRunning;if(engineRunning){if(curView!=='engine')goUnifiedView('engine');}updateUnifiedVisibility();};
 document.getElementById('systemsColor').onclick=()=>{coloredSystems=!coloredSystems;updateUnifiedVisibility();};
 document.getElementById('isolatePart').onclick=()=>{onlySelected=!onlySelected;updateUnifiedVisibility();};
 document.getElementById('connectParts').onclick=()=>{showConnections=!showConnections;updateUnifiedVisibility();refreshConnections();};
 document.getElementById('explodeRange').oninput=e=>{exploded=Number(e.target.value)/100;if(exploded>0)shellMode=1;updateExploded();updateUnifiedVisibility();};
 document.getElementById('btnUnder').onclick=()=>showView('under');
 const showBtn=document.getElementById('showOnModelBtn');showBtn.replaceWith(showBtn.cloneNode(true));document.getElementById('showOnModelBtn').onclick=()=>{if(currentPart)selectPart3D(currentPart.id,true);};
 document.getElementById('modelStatus').textContent=ALL_PARTS.length+' учебных узла · единая 3D-сборка';
 document.getElementById('modelCredit').insertAdjacentHTML('beforeend','<br>Механизмы построены для обучения. Это не заводская CAD-модель.');
 goUnifiedView('3d');
}
window.installUnifiedVehicle=installUnifiedVehicle;
if(realReady)installUnifiedVehicle();
