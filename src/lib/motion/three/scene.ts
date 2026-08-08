"use client";

import * as THREE from "three";
import { gsap, prefersReducedMotion } from "../plugins";

export type SceneCue = "vinyl-spin" | "reel-spin" | "tent-pop" | "idle";

type SceneHandle = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  vinyl: THREE.Mesh;
  reel: THREE.Group;
  tent: THREE.Group;
  raf: number;
  cueTween?: gsap.core.Tween | gsap.core.Timeline;
};

let handle: SceneHandle | null = null;

function makeVinyl() {
  const geo = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.6,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.09, 32),
    new THREE.MeshStandardMaterial({ color: 0xff3d6e, emissive: 0xff3d6e, emissiveIntensity: 0.4 }),
  );
  label.rotation.x = Math.PI / 2;
  const group = new THREE.Group();
  group.add(mesh);
  group.add(label);
  group.position.set(-2.2, -0.4, -1);
  return { group, disc: mesh };
}

function makeReel() {
  const group = new THREE.Group();
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0xffc700,
    metalness: 0.3,
    roughness: 0.4,
  });
  for (const x of [-0.55, 0.55]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 12, 24), wheelMat);
    wheel.position.set(x, 0.3, 0);
    group.add(wheel);
  }
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.7, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e }),
  );
  group.add(body);
  group.position.set(2.3, -0.6, -1.2);
  group.visible = false;
  return group;
}

function makeTent() {
  const group = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 1.6, 4),
    new THREE.MeshStandardMaterial({ color: 0x00f0ff, flatShading: true }),
  );
  cone.position.y = 0.4;
  const stripes = new THREE.Mesh(
    new THREE.ConeGeometry(1.12, 1.62, 4),
    new THREE.MeshStandardMaterial({
      color: 0xff3d6e,
      wireframe: true,
    }),
  );
  stripes.position.y = 0.4;
  group.add(cone, stripes);
  group.position.set(0, -0.9, -2);
  group.visible = false;
  return group;
}

export function mountScene(canvas: HTMLCanvasElement) {
  if (handle) disposeScene();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / Math.max(canvas.clientHeight, 1),
    0.1,
    100,
  );
  camera.position.set(0, 0.6, 6);

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(3, 5, 4);
  scene.add(light, new THREE.AmbientLight(0xffa0c0, 0.55));

  const { group: vinylGroup, disc } = makeVinyl();
  const reel = makeReel();
  const tent = makeTent();
  scene.add(vinylGroup, reel, tent);

  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResize);

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!prefersReducedMotion()) {
      disc.rotation.z += 0.01;
    }
    renderer.render(scene, camera);
  };
  tick();

  handle = {
    renderer,
    scene,
    camera,
    vinyl: disc,
    reel,
    tent,
    raf,
  };

  (canvas as HTMLCanvasElement & { __cleanup?: () => void }).__cleanup = () => {
    window.removeEventListener("resize", onResize);
  };

  return handle;
}

export function playSceneCue(cue: SceneCue) {
  if (!handle) return;
  const { vinyl, reel, tent } = handle;
  handle.cueTween?.kill();

  vinyl.parent!.visible = cue === "vinyl-spin" || cue === "idle";
  reel.visible = cue === "reel-spin";
  tent.visible = cue === "tent-pop";

  if (prefersReducedMotion()) return;

  if (cue === "vinyl-spin") {
    handle.cueTween = gsap.to(vinyl.rotation, {
      z: vinyl.rotation.z + Math.PI * 8,
      duration: 2.5,
      ease: "power1.inOut",
    });
    gsap.fromTo(vinyl.parent!.scale, { x: 0.6, y: 0.6, z: 0.6 }, { x: 1, y: 1, z: 1, duration: 0.4 });
  }
  if (cue === "reel-spin") {
    handle.cueTween = gsap.to(reel.rotation, {
      y: reel.rotation.y + Math.PI * 4,
      duration: 1.8,
      ease: "power2.inOut",
    });
    gsap.fromTo(reel.position, { y: -1.4 }, { y: -0.6, duration: 0.5, ease: "back.out(2)" });
  }
  if (cue === "tent-pop") {
    tent.scale.set(0.2, 0.2, 0.2);
    handle.cueTween = gsap.to(tent.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.55,
      ease: "elastic.out(1,0.45)",
    });
    gsap.to(tent.rotation, { y: Math.PI * 2, duration: 0.8, ease: "power2.out" });
  }
}

export function disposeScene() {
  if (!handle) return;
  cancelAnimationFrame(handle.raf);
  handle.cueTween?.kill();
  handle.renderer.dispose();
  handle = null;
}
