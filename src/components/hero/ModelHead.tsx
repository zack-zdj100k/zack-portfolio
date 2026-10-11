"use client";

// Option C: a real 3D model (GLB) uploaded from the admin. Scroll turns it most of the way round.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { RendererProps } from "./types";
import { trackPointer, visibleLoop } from "./pointer";

export default function ModelHead({ assets, progress, onReady, onFail, interactive }: RendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assets.model) return onFail();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return onFail();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    // Cool rim from behind-right, warm key from front-left: matches the artwork's lighting.
    const rim = new THREE.DirectionalLight("#bbccd7", 1.1);
    rim.position.set(2.5, 1.5, -2.5);
    const key = new THREE.DirectionalLight("#ffe9d6", 1.6);
    key.position.set(-2, 1.5, 3);
    scene.add(rim, key);

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    const pivot = new THREE.Group();
    scene.add(pivot);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const pointer = trackPointer(interactive);
    let disposed = false;
    let ready = false;
    let stopLoop = () => {};
    let gltfScene: THREE.Object3D | null = null;

    new GLTFLoader()
      .loadAsync(assets.model)
      .then((gltf) => {
        if (disposed) return;
        gltfScene = gltf.scene;
        // Normalise any model: centre it and scale it to fill ~90% of the view height.
        const box = new THREE.Box3().setFromObject(gltfScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        gltfScene.position.sub(center);
        const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(13)) * 5;
        pivot.scale.setScalar((viewH * 0.9) / Math.max(size.y, 1e-6));
        pivot.add(gltfScene);
        stopLoop = visibleLoop(canvas, (time) => {
          const p = progress.get();
          const m = pointer.read();
          // Two acts: while the words appear (first 60% of the scroll) the face turns slowly from the
          // artwork's 3/4 pose through the front to the other side; then one full spin, ending on the face.
          const ease = (t: number) => t * t * (3 - 2 * t);
          const turn = ease(Math.min(p / 0.6, 1));
          const spin = ease(Math.max((p - 0.6) / 0.4, 0));
          pivot.rotation.y = 0.55 - 1.25 * turn + Math.PI * 2 * spin + m.x * 0.25;
          pivot.rotation.x = THREE.MathUtils.lerp(0.04, -0.12, p) + m.y * 0.1;
          pivot.position.y = Math.sin(time / 1800) * 0.02;
          renderer.render(scene, camera);
          if (!ready) {
            ready = true;
            onReady();
          }
        });
      })
      .catch(() => !disposed && onFail());

    return () => {
      disposed = true;
      stopLoop();
      ro.disconnect();
      pointer.dispose();
      gltfScene?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [assets, progress, onReady, onFail, interactive]);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
