import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { MeshStandardMaterial } from "three";

/*
 * Texture
 */
const textureLoader = new THREE.TextureLoader();
const mapTexture = textureLoader.load("/textures/old-paper.jpeg");

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(450, 300),
  new THREE.MeshStandardMaterial({
    map: mapTexture
  })
);
floor.rotation.x = -Math.PI * 0.5;
const conf = { color: 0x9199c0 };
gui.addColor(conf, "color").onChange(function (colorValue) {
  floor.material.color.set(colorValue);
});
floor.receiveShadow = true;
scene.add(floor);

/**
 * Character
 */
const harryPotter = new THREE.Group();
// Name
var texture = textureLoader.load("/textures/harry-potter-name.png");
const harryPotterName = new THREE.Mesh(
  new THREE.PlaneGeometry(35, 15),
  new MeshStandardMaterial({
    map: texture,
    transparent: true
  })
);
harryPotter.add(harryPotterName);
harryPotterName.position.y = 1;
harryPotterName.position.x = -50;
harryPotterName.position.z = 15;
harryPotterName.rotation.x = -Math.PI * 0.5;

// Foot
var foot1Texture = textureLoader.load("/textures/footprint-left.png");
const harryPotterFoot = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 8),
  new THREE.MeshStandardMaterial({ map: foot1Texture, transparent: true })
);
harryPotterFoot.position.y = 1;
harryPotterFoot.position.x = -53;
harryPotterFoot.rotation.x = -Math.PI * 0.5;

var foot2Texture = textureLoader.load("/textures/footprint-right.png");
const harryPotterFoot2 = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 8),
  new THREE.MeshStandardMaterial({ map: foot2Texture, transparent: true })
);
harryPotterFoot2.position.y = 1;
harryPotterFoot2.position.x = -47;
harryPotterFoot2.position.z = -3;
harryPotterFoot2.rotation.x = -Math.PI * 0.5;

const feetGroup = new THREE.Group();
feetGroup.name = "feetGroup";
feetGroup.add(harryPotterFoot);
feetGroup.add(harryPotterFoot2);
harryPotter.add(feetGroup);

scene.add(harryPotter);

/**
 * Lights
 */

/* Lights */
const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);

scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.7, 100);
frontLight.position.set(0, 50, 0);
frontLight.castShadow = true;
scene.add(frontLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  500
);
camera.position.x = 0;
camera.position.y = 200;
camera.position.z = 0;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor("white");

// Shadows
renderer.shadowMap.enabled = true;

function animateFootPrint(obj, deltaTime) {
  if (obj.currentTimeAnimation >= FOOTSTEP_ANIMATION_TIME && obj.isAppearing) {
    obj.isAppearing = false;
  } else if (obj.currentTimeAnimation <= 0 && !obj.isAppearing) {
    obj.isAppearing = true;
    obj.position.z -= FOOTSTEP_ANIMATION_SPEED * 2;
  }

  obj.currentTimeAnimation = obj.isAppearing
    ? obj.currentTimeAnimation + deltaTime
    : obj.currentTimeAnimation - deltaTime;

  const newOpacity = obj.currentTimeAnimation / FOOTSTEP_ANIMATION_TIME;
  obj.material.opacity = newOpacity;
}

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const FOOTSTEP_ANIMATION_TIME = 1;
const FOOTSTEP_ANIMATION_SPEED = 3;
const feet = harryPotter.getObjectByName("feetGroup");

const [foot1, foot2] = feet.children;

foot1.isAppearing = false;
foot1.currentTimeAnimation = FOOTSTEP_ANIMATION_TIME;

foot2.isAppearing = true;
foot2.currentTimeAnimation = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = Math.abs(elapsedTime - previousTime);
  previousTime = elapsedTime;

  animateFootPrint(foot1, deltaTime);
  animateFootPrint(foot2, deltaTime);
  harryPotterName.position.z -=
    deltaTime * FOOTSTEP_ANIMATION_TIME * FOOTSTEP_ANIMATION_SPEED;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
