(()=>{function fail(msg){console.error(msg);const m=document.getElementById('lanyard-3d-root');if(m){m.innerHTML='<div style="color:#f33;font-size:12px;text-align:center;padding:4px">'+msg+'</div>'}}
if(!window.THREE){fail('THREE missing');return}
const mount=document.getElementById('lanyard-3d-root');if(!mount){fail('mount missing');return}
document.body.classList.add('has-3d-lanyard');
const w=mount.clientWidth||160;const h=mount.clientHeight||220;const scene=new THREE.Scene();
let camera;try{const aspect=w/h;const viewH=2;const viewW=viewH*aspect;camera=new THREE.OrthographicCamera(-viewW/2,viewW/2,viewH/2,-viewH/2,0.1,10)}catch(e){fail('camera error');return}
camera.position.set(0,0,5);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){fail('webgl unsupported');return}
try{renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(w,h);mount.appendChild(renderer.domElement)}catch(e){fail('renderer attach failed');return}
const texLoader=new THREE.TextureLoader();function load(path){try{const t=texLoader.load(path,()=>{},undefined,()=>{console.error('tex fail',path)});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}catch(e){console.error('tex error',path);return null}}
const frontTex=load('Images/Lanyard_pokemon.png');const backTex=load('Images/Back_pokemon.png');
const cardGroup=new THREE.Group();scene.add(cardGroup);
const aspect=w/h;const viewH=2;const viewW=viewH*aspect;const cardGeo=new THREE.BoxGeometry(viewW,viewH,0.02);
const matFront=new THREE.MeshBasicMaterial({map:frontTex});
const matBack=new THREE.MeshBasicMaterial({map:backTex});
const matSide=new THREE.MeshBasicMaterial({color:0x22263d});
const cardMesh=new THREE.Mesh(cardGeo,[matSide,matSide,matSide,matSide,matFront,matBack]);cardGroup.add(cardMesh);
scene.add(new THREE.AmbientLight(0xffffff,0.7));const dir=new THREE.DirectionalLight(0xffffff,0.6);dir.position.set(2,3,4);scene.add(dir);
let spinRemaining=0;const spinSpeed=4;mount.addEventListener('click',()=>{if(spinRemaining<=0)spinRemaining=2*Math.PI});
window.addEventListener('resize',()=>{const nw=mount.clientWidth||160,nh=mount.clientHeight||220;const aspect=nw/nh;const vH=2;const vW=vH*aspect;camera.left=-vW/2;camera.right=vW/2;camera.top=vH/2;camera.bottom=-vH/2;camera.updateProjectionMatrix();renderer.setSize(nw,nh)});
let last=performance.now();
function loop(now){const dt=(now-last)/1000;last=now;if(spinRemaining>0){const step=Math.min(spinSpeed*dt,spinRemaining);cardGroup.rotation.y+=step;spinRemaining-=step;}renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
console.log('lanyard init done');
})();