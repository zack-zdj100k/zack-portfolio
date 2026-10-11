"use client";

// Option A: the owner's cutout on a finely subdivided plane, pushed forward by a depth map.
// Scroll turns the head (yaw/pitch) and sweeps a pale-blue rim light across it.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { RendererProps } from "./types";
import { trackPointer, visibleLoop } from "./pointer";

const vertexShader = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uStrength;
  uniform vec2 uTexel;
  uniform vec2 uPlane;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  float h(vec2 uv) { return texture2D(uDepth, uv).r; }
  void main() {
    vUv = uv;
    float d = h(uv);
    vec3 p = position + vec3(0.0, 0.0, d * uStrength);
    float hx = h(uv + vec2(uTexel.x, 0.0)) - h(uv - vec2(uTexel.x, 0.0));
    float hy = h(uv + vec2(0.0, uTexel.y)) - h(uv - vec2(0.0, uTexel.y));
    vec3 n = normalize(vec3(
      -hx * uStrength / (2.0 * uTexel.x * uPlane.x),
      -hy * uStrength / (2.0 * uTexel.y * uPlane.y),
      1.0));
    vNormal = normalize(normalMatrix * n);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uColor;
  uniform vec3 uLight;
  uniform vec3 uRim;
  uniform float uRimStrength;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 c = texture2D(uColor, vUv);
    if (c.a < 0.04) discard;
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    // The artwork is already lit, so shading only nudges it: a soft key from uLight plus a rim.
    float key = clamp(dot(n, normalize(uLight)), 0.0, 1.0);
    float shade = 0.86 + 0.24 * key;
    float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2) * uRimStrength;
    vec3 col = c.rgb * shade + uRim * rim;
    gl_FragColor = vec4(col * c.a, c.a);
  }
`;

export default function DepthHead({ assets, progress, onReady, onFail, interactive }: RendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assets.depthMap) return onFail();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return onFail();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const aspect = assets.image.width / assets.image.height;
    const camera = new THREE.PerspectiveCamera(26, aspect, 0.1, 50);
    const distance = 5;
    camera.position.set(0, 0, distance);
    // Plane height that exactly fills the canvas at rest, so the swap from the static image is seamless.
    const planeH = 2 * Math.tan(THREE.MathUtils.degToRad(13)) * distance;
    const planeW = planeH * aspect;

    const loader = new THREE.TextureLoader();
    const uniforms = {
      uColor: { value: null as THREE.Texture | null },
      uDepth: { value: null as THREE.Texture | null },
      uStrength: { value: planeH * 0.34 },
      uTexel: { value: new THREE.Vector2(1 / 512, 1 / 512) },
      uPlane: { value: new THREE.Vector2(planeW, planeH) },
      uLight: { value: new THREE.Vector3(-0.4, 0.5, 1) },
      uRim: { value: new THREE.Color("#bbccd7") },
      uRimStrength: { value: 0.0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      premultipliedAlpha: true,
    });
    const geometry = new THREE.PlaneGeometry(planeW, planeH, 256, 256);
    const mesh = new THREE.Mesh(geometry, material);
    // Push the plane back by half the relief so the head's middle sits at the image plane.
    const pivot = new THREE.Group();
    mesh.position.z = -planeH * 0.17;
    pivot.add(mesh);
    const scene = new THREE.Scene();
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

    const pointer = trackPointer(interactive);
    let disposed = false;
    let ready = false;
    let stopLoop = () => {};

    Promise.all([loader.loadAsync(assets.image.src), loader.loadAsync(assets.depthMap)])
      .then(([color, depth]) => {
        if (disposed) return;
        color.anisotropy = renderer.capabilities.getMaxAnisotropy();
        color.generateMipmaps = true;
        depth.minFilter = THREE.LinearFilter;
        uniforms.uColor.value = color;
        uniforms.uDepth.value = depth;
        uniforms.uTexel.value.set(1 / depth.image.width, 1 / depth.image.height);
        resize();
        stopLoop = visibleLoop(canvas, (time) => {
          const p = progress.get();
          const m = pointer.read();
          // Scroll: a gentle turn (about -5° to +20°) and a slight chin-down tilt, so the artwork stays
          // true to the original at every point of the scroll.
          pivot.rotation.y = THREE.MathUtils.lerp(-0.08, 0.34, p) + m.x * 0.12;
          pivot.rotation.x = THREE.MathUtils.lerp(0.02, -0.16, p) + m.y * 0.08;
          pivot.rotation.z = Math.sin(time / 2400) * 0.008;
          pivot.position.y = Math.sin(time / 1800) * planeH * 0.006;
          uniforms.uLight.value.set(Math.cos(p * Math.PI) * 0.9, 0.55, 1);
          uniforms.uRimStrength.value = 0.18 + Math.sin(p * Math.PI) * 0.55;
          renderer.render(scene, camera);
          if (!ready) {
            ready = true;
            onReady();
          }
        });
      })
      .catch(() => !disposed && onFail());

    const onLost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      stopLoop();
      ro.disconnect();
      pointer.dispose();
      canvas.removeEventListener("webglcontextlost", onLost);
      geometry.dispose();
      material.dispose();
      uniforms.uColor.value?.dispose();
      uniforms.uDepth.value?.dispose();
      renderer.dispose();
    };
  }, [assets, progress, onReady, onFail, interactive]);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
