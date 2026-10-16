const fs=require('fs'),vm=require('vm'),assert=require('assert'),zlib=require('zlib');
const path=require('path');
const root=path.resolve(__dirname,'..');
const THREE=require(path.join(root,'assets/vendor/three.r128.min.js'));global.THREE=THREE;require(path.join(root,'assets/vendor/GLTFLoader.r128.js'));
class Element{
 constructor(id=''){this.id=id;this.children=[];this.style={};this.dataset={};this.value='';this.hidden=false;this.clientWidth=1100;this.clientHeight=760;this.classList={add(){},remove(){},toggle(){}};}
 appendChild(o){this.children.push(o);return o;} append(o){this.children.push(o);} prepend(o){this.children.unshift(o);} addEventListener(){} remove(){} setAttribute(){} getAttribute(){return '';}querySelector(){return new Element();}querySelectorAll(){return [];} cloneNode(){return new Element();}replaceWith(){} insertAdjacentHTML(){}getBoundingClientRect(){return{left:0,top:0,width:1100,height:760,right:1100,bottom:760};}
 getContext(){return{scale(){},createLinearGradient(){return{addColorStop(){}};},createRadialGradient(){return{addColorStop(){}};},fillRect(){}};}
}
const elements={};const doc={getElementById:id=>elements[id]||(elements[id]=new Element(id)),createElement:()=>new Element(),createElementNS:()=>new Element(),querySelectorAll:()=>[],addEventListener(){}};
const sceneRenderer={};THREE.WebGLRenderer=class{constructor(){this.domElement=new Element();this.shadowMap={};this.info={render:{}};}setPixelRatio(){}setSize(){}render(){}};
const ctx={THREE,document:doc,window:{devicePixelRatio:1,addEventListener(){}},devicePixelRatio:1,requestAnimationFrame(){},performance,console,localStorage:{getItem(){return null;},setItem(){}},setTimeout(){},clearTimeout(){},ResizeObserver:class{observe(){}},Map,Set,Date,Math,Uint8Array,AbortController};vm.createContext(ctx);
for(const file of ['catalog-data.js','technical-data.js','viewer-core.js','model-loader.js','unified-vehicle.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),ctx,{filename:file});
const b=zlib.gunzipSync(fs.readFileSync(path.join(root,'assets/cobalt-mobile.glb.gz')));
new THREE.GLTFLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',g=>{
 ctx.gltf=g;
 vm.runInContext(`initializeReal(gltf);
 const absent=ALL_PARTS.filter(p=>!realById[p.id]||!realById[p.id].length);if(absent.length)throw Error('Missing: '+absent.map(p=>p.id));
 for(const p of ALL_PARTS){selectPart3D(p.id,true);if(selectedId!==p.id)throw Error('Unselectable '+p.id);}
 for(const v of ['3d','schema','cut','salon','under']){showView(v);if(carBody.visible||hoodGroup.visible)throw Error('Old scheme still visible');}
 shellMode=1;exploded=1;updateExploded();updateUnifiedVisibility();
 scene.updateMatrixWorld(true);
 let triangles=0;for(const m of mechanicalMeshes){const pos=m.geometry.attributes.position;if(!Array.from(pos.array).every(Number.isFinite))throw Error('Nonfinite geometry');triangles+=(m.geometry.index?m.geometry.index.count:pos.count)/3;}
 showView('engine');engineRunning=true;for(let i=0;i<120;i++)animateReal(1/30);engineRunning=false;
 this.result={parts:ALL_PARTS.length,selectable:Object.keys(realById).length,mechanicalMeshes:mechanicalMeshes.length,mechanicalTriangles:triangles,pistons:movingPistons.length,valves:movingValves.length,view:curView};
 `,ctx);
 assert.equal(ctx.result.parts,ctx.result.selectable);assert.equal(ctx.result.pistons,4);assert.equal(ctx.result.valves,16);console.log('PASS',JSON.stringify(ctx.result));
},e=>{throw e;});
