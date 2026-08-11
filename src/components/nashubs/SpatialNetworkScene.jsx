import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { loadThree } from "@/lib/three-runtime";
import datacenterBackground from "../../../assets/backgrounds/nashubs-living-datacenter-v1.webp";

const PANEL_GAP = 26;

export default function SpatialNetworkScene({ progress, active, count }) {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const progressRef = useRef(progress);
  const [rendererName, setRendererName] = useState("Initializing");
  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let disposed = false;
    let cleanup = () => {};

    const initialize = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setRendererName("Static mode");
        return;
      }
      try {
        const THREE = await loadThree();
        if (disposed) return;
        cleanup = createBackbone({ THREE, canvas, theme, count, progressRef });
        setRendererName("NasHubs Data Backbone WebGL");
      } catch {
        setRendererName("CSS fallback");
      }
    };
    initialize();
    return () => { disposed = true; cleanup(); };
  }, [count, theme]);

  const pan = (progress - .5) * -3.6;
  const focus = 13 + progress * 74;
  /** @type {import("react").CSSProperties & Record<string, string | number>} */
  const environmentStyle = { "--dc-pan": `${pan}%`, "--dc-focus": `${focus}%`, "--dc-scene": active };

  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="datacenter-environment absolute inset-0" style={environmentStyle}>
      <div className="datacenter-image absolute inset-[-3%]" style={{ backgroundImage: `url(${datacenterBackground})` }} />
      <div className="datacenter-depth absolute inset-0" />
      <div className="datacenter-focus absolute inset-0" />
      <div className="datacenter-rack-lights absolute inset-0" />
      <div className="datacenter-data-lanes absolute inset-0">
        {Array.from({ length: 7 }, (_, index) => <span key={index} style={laneStyle(index)} />)}
      </div>
      <DataBackboneFlow />
    </div>
    <canvas ref={canvasRef} className="relative z-[2] h-full w-full opacity-[.32] dark:opacity-[.48]" />
    <div className="spatial-vignette absolute inset-0" />
    <div className="backbone-signature absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[.24em] text-emerald-500/50 xl:flex">
      <span className="h-px w-12 bg-emerald-500/35" /> NasHubs Data Backbone <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Encrypted routing
    </div>
    <span className="sr-only">{rendererName}</span>
  </div>;
}

function DataBackboneFlow() {
  const paths = [
    "M-80 760 C250 690 380 510 720 470 C1060 430 1190 660 1520 570",
    "M-90 815 C260 765 410 590 720 525 C1030 460 1210 690 1530 650",
    "M-70 680 C280 620 465 460 720 430 C975 400 1160 570 1510 500",
  ];
  return <svg className="datacenter-backbone-flow absolute inset-0" viewBox="0 0 1440 900" preserveAspectRatio="none">
    <defs>
      <linearGradient id="backbone-flow-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgb(16 185 129)" stopOpacity="0" />
        <stop offset=".22" stopColor="rgb(45 212 191)" stopOpacity=".35" />
        <stop offset=".5" stopColor="rgb(52 211 153)" stopOpacity=".72" />
        <stop offset=".78" stopColor="rgb(45 212 191)" stopOpacity=".35" />
        <stop offset="1" stopColor="rgb(16 185 129)" stopOpacity="0" />
      </linearGradient>
      <filter id="backbone-flow-glow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>
    {paths.map((path, index) => <g key={path}>
      <path d={path} className="datacenter-flow-glow" filter="url(#backbone-flow-glow)" />
      <path d={path} className="datacenter-flow-line" style={{ animationDelay: `${index * -.9}s` }} />
    </g>)}
  </svg>;
}

function laneStyle(index) {
  /** @type {import("react").CSSProperties & Record<string, string | number>} */
  const style = { "--lane": index };
  return style;
}

function createBackbone({ THREE, canvas, theme, count, progressRef }) {
  const scene = new THREE.Scene();
  const isDark = theme === "dark";
  scene.fog = new THREE.FogExp2(isDark ? 0x041b14 : 0xf3fbf8, isDark ? .022 : .026);

  const camera = new THREE.PerspectiveCamera(47, 1, .1, 240);
  camera.position.set(-7, 2.2, 22);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const primary = new THREE.Color(isDark ? 0x10b981 : 0x059669);
  const accent = new THREE.Color(isDark ? 0x2dd4bf : 0x0d9488);
  const dim = new THREE.Color(isDark ? 0x0c6b50 : 0x6ee7b7);
  const root = new THREE.Group();
  scene.add(root);

  const geometries = [];
  const materials = [];
  const rememberGeometry = (geometry) => { geometries.push(geometry); return geometry; };
  const rememberMaterial = (material) => { materials.push(material); return material; };
  const wireMaterial = rememberMaterial(new THREE.LineBasicMaterial({ color: primary, transparent: true, opacity: isDark ? .13 : .065, depthWrite: false }));
  const routeMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: isDark ? .3 : .16, depthWrite: false }));
  const routeGlowMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: primary, transparent: true, opacity: isDark ? .055 : .028, depthWrite: false }));

  const routePoints = Array.from({ length: count }, (_, index) => new THREE.Vector3(index * PANEL_GAP, -1.25 + Math.sin(index * .9) * .42, Math.sin(index * .72) * .7));
  const routeCurve = new THREE.CatmullRomCurve3(routePoints);
  const routeGeometry = rememberGeometry(new THREE.TubeGeometry(routeCurve, count * 28, .055, 7, false));
  const routeGlowGeometry = rememberGeometry(new THREE.TubeGeometry(routeCurve, count * 28, .19, 8, false));
  root.add(new THREE.Mesh(routeGlowGeometry, routeGlowMaterial), new THREE.Mesh(routeGeometry, routeMaterial));

  [-.65, .65].forEach((offset) => {
    const secondaryCurve = new THREE.CatmullRomCurve3(routePoints.map((point, index) => point.clone().add(new THREE.Vector3(0, Math.sin(index + offset) * .12, offset))));
    const geometry = rememberGeometry(new THREE.BufferGeometry().setFromPoints(secondaryCurve.getPoints(count * 22)));
    const material = rememberMaterial(new THREE.LineDashedMaterial({ color: dim, transparent: true, opacity: isDark ? .24 : .13, dashSize: .42, gapSize: .38 }));
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    root.add(line);
  });

  const particleCount = 420;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions[index * 3] = pseudo(index * 9) * Math.max(1, count - 1) * PANEL_GAP;
    particlePositions[index * 3 + 1] = (pseudo(index * 13 + 3) - .5) * 24;
    particlePositions[index * 3 + 2] = (pseudo(index * 17 + 5) - .5) * 38;
  }
  const particleGeometry = rememberGeometry(new THREE.BufferGeometry());
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = rememberMaterial(new THREE.PointsMaterial({ color: accent, size: .05, transparent: true, opacity: isDark ? .42 : .2, depthWrite: false }));
  root.add(new THREE.Points(particleGeometry, particleMaterial));

  const packetGeometry = rememberGeometry(new THREE.SphereGeometry(.13, 8, 8));
  const packetMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: 0x5eead4 }));
  const packets = Array.from({ length: 22 }, (_, index) => {
    const mesh = new THREE.Mesh(packetGeometry, packetMaterial);
    root.add(mesh);
    return { mesh, offset: index / 22, speed: .016 + pseudo(index * 29) * .024 };
  });

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    pointer.x = event.clientX / window.innerWidth - .5;
    pointer.y = event.clientY / window.innerHeight - .5;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  const observer = new ResizeObserver(() => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  observer.observe(canvas);

  const clock = new THREE.Clock();
  const targetVector = new THREE.Vector3();
  let frame = 0;
  const render = () => {
    const elapsed = clock.getElapsedTime();
    const targetX = progressRef.current * Math.max(1, count - 1) * PANEL_GAP;
    camera.position.x += (targetX - 7 + pointer.x * 1.8 - camera.position.x) * .07;
    camera.position.y += (2.2 - pointer.y * 1.6 - camera.position.y) * .055;
    camera.position.z += (21.5 + Math.sin(progressRef.current * Math.PI * 2) * 1.5 - camera.position.z) * .05;
    targetVector.set(targetX + 4.2, -.35, 0);
    camera.lookAt(targetVector);

    packets.forEach(({ mesh, offset, speed }, index) => {
      mesh.position.copy(routeCurve.getPoint((offset + elapsed * speed) % 1));
      const pulse = .75 + Math.sin(elapsed * 5 + index) * .25;
      mesh.scale.setScalar(pulse);
    });
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
  };
}

function pseudo(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
