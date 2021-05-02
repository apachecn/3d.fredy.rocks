import * as THREE from "three";
import { PointerLockControls } from "./scripts/PointerLockMobile.js";

//loadGLTF is a function that is used to load the model
import loadGLTF from "./loaders/loader";

//PlaneGeoMetry,WallGeoMetry is the geometry for the landscape including the texture
import PlaneGeoMetry from "./geometries/PlaneGeo";
import WallGeoMetry from "./geometries/WallGeo";

//WG is a set of Vector3 geometries to load the walls
const WG = require("./coordinates/walls.json");
const CC=require('./coordinates/clouds.json');

//import TextGeo from "./geometries/TextGeo";

var scene = new THREE.Scene();

let TP = loadGLTF("models/tree/scene.gltf").then((TREE) => {
  TREE.scene.position.set(35, 0, 65);
  scene.add(TREE.scene);
});
let AP = loadGLTF("models/arch1/scene.gltf").then((ARCH) => {
  ARCH.scene.scale.set(0.2, 0.2, 0.2);
  ARCH.scene.position.set(-109, -4, 95);
  scene.add(ARCH.scene);
});
let CP
let Clord
CC.forEach((Clcord)=>{
CP=loadGLTF("models/cloud/scene.gltf").then((CLOUD)=>{
  
  CLOUD.scene.position.set(
    Clcord.x,
    130,
    Clcord.z,
  )
  scene.add(CLOUD.scene)
  
})
})
Promise.all([TP, AP,CP]).then(() => {
  document.getElementById("btn").innerHTML = "Start";
  document.getElementById("btn").disabled = false;
});



	var loader = new THREE.FontLoader();
    loader.load( "https://raw.githubusercontent.com/fredysomy/3d.fredy.rocks/master/src/fonts/popins.typeface.json", function ( font ) {
       let geometry = new THREE.TextBufferGeometry( 'WELCOME', {
        font: font,
        size: 6,
        height: 5,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.05,
        bevelSegments: 3
      } );
    
     let material = new THREE.MeshNormalMaterial();
    let mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(-20,42,105)
      scene.add(mesh)
	})



const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);

const lightArch = new THREE.AmbientLight("#ffffff", 1.5);
scene.add(lightArch);

const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");
const btnn = document.getElementById("btn");
btnn.addEventListener("click", function () {
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    document.getElementById("instructions").style.display = "none";
    document.getElementById("blocker").style.display = "none";
  }
  controls.lock();
});
controls.addEventListener("lock", function () {
  instructions.style.display = "none";
  blocker.style.display = "none";
});

controls.addEventListener("unlock", function () {
  blocker.style.display = "block";
  instructions.style.display = "";
});
scene.add(controls.getObject());
var coordinates = [];
const onKeyDown = function (event) {
  switch (event.keyCode) {
    case 38:
    case 87:
      moveForward = true;
      break;

    case 37:
    case 65:
      moveLeft = true;
      break;

    case 40:
    case 83:
      moveBackward = true;
      coordinates.push({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
      break;

    case 39:
    case 68:
      moveRight = true;
      break;

    case 32:
      if (canJump === true) velocity.y += 350;
      console.log(coordinates);
      canJump = false;
      break;
  }
};

const onKeyUp = function (event) {
  switch (event.keyCode) {
    case 38:
    case 87:
      moveForward = false;
      break;

    case 37:
    case 65:
      moveLeft = false;
      break;

    case 40:
    case 83:
      moveBackward = false;
      break;

    case 39:
    case 68:
      moveRight = false;
      break;
  }
};

const forward = document.getElementById("controller-forward");
forward.addEventListener("touchstart", function () {
  console.log("touch");
  moveForward = true;
});
forward.addEventListener("touchend", function () {
  console.log("end");
  moveForward = false;
});
forward.addEventListener("touchmove", function () {
  console.log("end");
  moveForward = false;
});

const right = document.getElementById("controller-right");
right.addEventListener("touchstart", function () {
  moveRight = true;
});
right.addEventListener("touchend", function () {
  moveRight = false;
});

const left = document.getElementById("controller-left");
left.addEventListener("touchstart", function () {
  moveLeft = true;
});
left.addEventListener("touchend", function () {
  moveLeft = false;
});

const back = document.getElementById("controller-back");
back.addEventListener("touchstart", function () {
  moveBackward = true;
});
back.addEventListener("touchend", function () {
  moveBackward = false;
});

document.addEventListener("touchmove", function () {
  console.log("moved");
});
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

camera.position.set(0, 7, 180);
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

scene.add(PlaneGeoMetry());
scene.background = new THREE.Color("#87ceeb");

//Bellow set of fuction load the wall geometries into the specified locations
let Wall;
WG.forEach((cord) => {
  Wall = WallGeoMetry();
  Wall.position.x = cord.x;
  Wall.position.y = cord.y;
  Wall.position.z = cord.z;
  scene.add(Wall);
});

const animate = function () {
  requestAnimationFrame(animate);

  const time = performance.now();

  const delta = (time - prevTime) / 1000;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 8.0 * delta;
  velocity.y -= 0 * delta;
  direction.z = Number(moveForward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward) velocity.z -= direction.z * 400.0 * delta;
  if (moveBackward) velocity.z += 400.0 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  controls.getObject().position.y += velocity.y * delta;
  if (controls.getObject().position.y < 10) {
    velocity.y = 0;
    controls.getObject().position.y = 10;
    canJump = true;
  }

  prevTime = time;

  renderer.render(scene, camera);
};

animate();
