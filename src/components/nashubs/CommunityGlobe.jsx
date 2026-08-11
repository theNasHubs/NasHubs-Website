import { useEffect, useRef, useState } from "react";
import { MapPin, Server, Users } from "lucide-react";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import { useTheme } from "@/lib/theme";
import { loadThree } from "@/lib/three-runtime";

const WORLD_TOPOLOGY = /** @type {import("topojson-specification").Topology} */ (/** @type {unknown} */ (worldData));
const COUNTRIES = /** @type {import("geojson").FeatureCollection} */ (feature(WORLD_TOPOLOGY, WORLD_TOPOLOGY.objects.countries));

export default function CommunityGlobe({ locations, lang }) {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const focusRef = useRef(/** @type {(id: string) => void} */ (() => {}));
  const [activeLocation, setActiveLocation] = useState(null);
  const [renderer, setRenderer] = useState("Loading globe");
  focusRef.current = (id) => setActiveLocation(locations.find((location) => location.id === id) || null);

  useEffect(() => {
    if (!activeLocation && locations.length) setActiveLocation(locations[0]);
  }, [activeLocation, locations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !locations.length) return undefined;
    let disposed = false;
    let cleanup = () => {};
    loadThree().then((THREE) => {
      if (disposed) return;
      cleanup = createGlobe({ THREE, canvas, locations, theme, onFocus: (id) => focusRef.current(id) });
      setRenderer("Interactive 3D community globe");
    }).catch(() => setRenderer("Globe fallback"));
    return () => { disposed = true; cleanup(); };
  }, [locations, theme]);

  return (
    <div className="globe-terminal relative aspect-square w-full overflow-hidden rounded-[2.25rem] border border-border bg-surface-2/75 shadow-[0_35px_100px_-45px_rgba(16,185,129,.5)] backdrop-blur-xl">
      <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-emerald-500">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>
        Live community nodes
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="globe-glass pointer-events-none absolute inset-0" />

      {activeLocation && <div className="globe-location-card absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-border bg-surface-2/88 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500"><MapPin className="h-4 w-4" /></span><div className="min-w-0"><div className="truncate text-sm font-bold">{lang === "vn" ? activeLocation.cityVi : activeLocation.cityEn} · {activeLocation.country}</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-ink-muted">{activeLocation.lat.toFixed(2)}° · {activeLocation.lon.toFixed(2)}°</div></div></div>
          <div className="flex shrink-0 gap-4 text-xs text-ink-muted"><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-500" />{activeLocation.users.toLocaleString()}</span><span className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-emerald-500" />{activeLocation.devices.toLocaleString()}</span></div>
        </div>
      </div>}
      <span className="sr-only">{renderer}</span>
    </div>
  );
}

function createGlobe({ THREE, canvas, locations, theme, onFocus }) {
  const isDark = theme === "dark";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 30);
  camera.position.set(0, .12, 6.25);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const geometries = [];
  const materials = [];
  const rememberGeometry = (geometry) => { geometries.push(geometry); return geometry; };
  const rememberMaterial = (material) => { materials.push(material); return material; };
  const emerald = isDark ? 0x10b981 : 0x059669;
  const teal = isDark ? 0x2dd4bf : 0x0d9488;
  const globe = new THREE.Group();
  globe.rotation.y = -.24;
  globe.rotation.x = -.07;
  scene.add(globe);

  const sphereGeometry = rememberGeometry(new THREE.SphereGeometry(2, 48, 32));
  const sphereMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: emerald, transparent: true, opacity: isDark ? .075 : .045, depthWrite: false }));
  const wireMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: emerald, wireframe: true, transparent: true, opacity: isDark ? .075 : .055, depthWrite: false }));
  globe.add(new THREE.Mesh(sphereGeometry, sphereMaterial), new THREE.Mesh(sphereGeometry, wireMaterial));

  const atmosphereGeometry = rememberGeometry(new THREE.SphereGeometry(2.08, 40, 28));
  const atmosphereMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: isDark ? .075 : .045, side: THREE.BackSide, depthWrite: false }));
  globe.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

  const borderPositions = buildCountrySegments(COUNTRIES.features, 2.012);
  const borderGeometry = rememberGeometry(new THREE.BufferGeometry());
  borderGeometry.setAttribute("position", new THREE.Float32BufferAttribute(borderPositions, 3));
  const borderMaterial = rememberMaterial(new THREE.LineBasicMaterial({ color: teal, transparent: true, opacity: isDark ? .48 : .32, depthWrite: false }));
  globe.add(new THREE.LineSegments(borderGeometry, borderMaterial));

  addGraticule({ THREE, globe, rememberGeometry, rememberMaterial, color: emerald, dark: isDark });

  const dotGeometry = rememberGeometry(new THREE.SphereGeometry(.065, 12, 10));
  const ringGeometry = rememberGeometry(new THREE.RingGeometry(.105, .155, 24));
  const normalAxis = new THREE.Vector3(0, 0, 1);
  const markers = locations.map((location, index) => {
    const normal = latLonVector(location.lat, location.lon, 1, THREE);
    const group = new THREE.Group();
    group.position.copy(normal.clone().multiplyScalar(2.055));
    group.quaternion.setFromUnitVectors(normalAxis, normal);
    const dotMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0, depthWrite: false }));
    const ringMaterial = rememberMaterial(new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -.01;
    group.add(dot, ring);
    group.scale.setScalar(.001);
    globe.add(group);
    return { group, dotMaterial, ringMaterial, ring, id: location.id, index, visibility: 0 };
  });

  const starsGeometry = rememberGeometry(new THREE.BufferGeometry());
  const starPositions = new Float32Array(240 * 3);
  for (let index = 0; index < 240; index += 1) {
    starPositions[index * 3] = (pseudo(index * 7) - .5) * 10;
    starPositions[index * 3 + 1] = (pseudo(index * 11 + 2) - .5) * 10;
    starPositions[index * 3 + 2] = -1 - pseudo(index * 17 + 4) * 4;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starsMaterial = rememberMaterial(new THREE.PointsMaterial({ color: teal, size: .018, transparent: true, opacity: isDark ? .38 : .18, depthWrite: false }));
  scene.add(new THREE.Points(starsGeometry, starsMaterial));

  const observer = new ResizeObserver(() => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  observer.observe(canvas);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const worldPosition = new THREE.Vector3();
  const scaleVector = new THREE.Vector3();
  let focusedId = "";
  let frame = 0;
  const clock = new THREE.Clock();
  const render = () => {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) globe.rotation.y += .0017;
    /** @type {any} */
    let bestMarker = null;
    let bestFront = .28;
    markers.forEach((marker) => {
      marker.group.getWorldPosition(worldPosition);
      const front = worldPosition.z / 2.1;
      const target = smoothstep(.12, .52, front);
      marker.visibility += (target - marker.visibility) * .075;
      const pulse = 1 + Math.sin(elapsed * 3.2 + marker.index * .9) * .17;
      scaleVector.setScalar(Math.max(.001, marker.visibility * pulse));
      marker.group.scale.lerp(scaleVector, .12);
      marker.dotMaterial.opacity = marker.visibility;
      marker.ringMaterial.opacity = marker.visibility * .52;
      marker.ring.scale.setScalar(1 + ((elapsed * .5 + marker.index * .17) % 1) * .65);
      if (front > bestFront) { bestFront = front; bestMarker = marker; }
    });
    if (bestMarker && bestMarker.id !== focusedId) {
      focusedId = bestMarker.id;
      onFocus(focusedId);
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
  };
}

function buildCountrySegments(features, radius) {
  const positions = [];
  const addRing = (ring) => {
    for (let index = 1; index < ring.length; index += 1) {
      const previous = ring[index - 1];
      const current = ring[index];
      if (Math.abs(previous[0] - current[0]) > 180) continue;
      const a = rawLatLon(previous[1], previous[0], radius);
      const b = rawLatLon(current[1], current[0], radius);
      positions.push(...a, ...b);
    }
  };
  features.forEach((country) => {
    const geometry = country.geometry;
    if (!geometry) return;
    if (geometry.type === "Polygon") geometry.coordinates.forEach(addRing);
    if (geometry.type === "MultiPolygon") geometry.coordinates.forEach((polygon) => polygon.forEach(addRing));
  });
  return positions;
}

function addGraticule({ THREE, globe, rememberGeometry, rememberMaterial, color, dark }) {
  const material = rememberMaterial(new THREE.LineBasicMaterial({ color, transparent: true, opacity: dark ? .1 : .065, depthWrite: false }));
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 4) points.push(new THREE.Vector3(...rawLatLon(lat, lon, 2.006)));
    globe.add(new THREE.Line(rememberGeometry(new THREE.BufferGeometry().setFromPoints(points)), material));
  }
  for (let lon = -150; lon < 180; lon += 30) {
    const points = [];
    for (let lat = -90; lat <= 90; lat += 3) points.push(new THREE.Vector3(...rawLatLon(lat, lon, 2.006)));
    globe.add(new THREE.Line(rememberGeometry(new THREE.BufferGeometry().setFromPoints(points)), material));
  }
}

function latLonVector(lat, lon, radius, THREE) {
  return new THREE.Vector3(...rawLatLon(lat, lon, radius));
}

function rawLatLon(lat, lon, radius) {
  const latitude = lat * Math.PI / 180;
  const longitude = lon * Math.PI / 180;
  const cosLat = Math.cos(latitude);
  return [-radius * cosLat * Math.cos(longitude), radius * Math.sin(latitude), radius * cosLat * Math.sin(longitude)];
}

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function pseudo(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
