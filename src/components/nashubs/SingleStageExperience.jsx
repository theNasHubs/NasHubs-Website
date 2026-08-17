import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AppWindow, ArrowLeft, ArrowRight, Boxes, Check, Cpu,
  Download, Globe2, KeyRound, Layers3, LockKeyhole,
  MemoryStick, Network, Server, ShieldCheck, Smartphone, Sparkles,
  Thermometer, Wifi, WifiOff,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { getAppScreen } from "@/lib/app-screens";
import SpatialNetworkScene from "@/components/nashubs/SpatialNetworkScene";
import CommunityGlobe from "@/components/nashubs/CommunityGlobe";

const SCENE_IDS = ["overview", "demo", "agent", "architecture", "gallery", "security", "community", "download"];

const SCENE_VISUAL_PATHS = {
  overview: "03-dashboard/dashboard.jpg",
  demo: "02-devices/devices.jpg",
  agent: "04-agent/agent.jpg",
  architecture: "04-agent/agent.jpg",
  gallery: "06-media/media.jpg",
  security: "01-auth/login.jpg",
  community: "08-photo/photo.jpg",
  download: "09-setting/setting.jpg",
};

export default function SingleStageExperience() {
  const { lang } = useI18n();
  const { theme } = useTheme();
  const vi = lang === "vn";
  const scenes = useMemo(() => createScenes(vi), [vi]);
  const initialId = typeof window === "undefined" ? "overview" : normalizeScene(window.location.hash.slice(1));
  const [activeId, setActiveId] = useState(initialId);
  const [direction, setDirection] = useState(1);
  const [community, setCommunity] = useState({ locations: [] });
  const activeIndex = Math.max(0, scenes.findIndex((scene) => scene.id === activeId));
  const activeScene = scenes[activeIndex];
  const ActiveIcon = activeScene.icon;
  const progress = activeIndex / Math.max(1, scenes.length - 1);

  useEffect(() => {
    let live = true;
    fetch(`${import.meta.env.BASE_URL}data/community.json`).then((response) => response.json()).then((data) => { if (live) setCommunity(data); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const activate = useCallback((target) => {
    const nextIndex = typeof target === "number" ? Math.max(0, Math.min(scenes.length - 1, target)) : scenes.findIndex((scene) => scene.id === target);
    if (nextIndex < 0 || nextIndex === activeIndex) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    const nextId = scenes[nextIndex].id;
    setActiveId(nextId);
    window.history.replaceState(null, "", `#${nextId}`);
  }, [activeIndex, scenes]);

  useEffect(() => {
    const onAnchorClick = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href*='#']") : null;
      const hash = anchor?.hash?.slice(1);
      if (!hash || !SCENE_IDS.includes(hash)) return;
      event.preventDefault();
      activate(hash);
    };
    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, [activate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const element = event.target;
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") activate(activeIndex + 1);
      if (event.key === "ArrowLeft" || event.key === "PageUp") activate(activeIndex - 1);
      if (event.key === "Escape") activate(0);
      const number = Number(event.key);
      if (number >= 1 && number <= scenes.length) activate(number - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activate, activeIndex, scenes.length]);

  return (
    <main className="single-stage-shell spatial-stage relative h-[100dvh] overflow-hidden bg-surface" aria-label={vi ? "Trải nghiệm NasHubs" : "NasHubs experience"}>
      <SpatialNetworkScene progress={progress} active={activeIndex} count={scenes.length} />

      <section className="single-stage-layout relative z-10 mx-auto grid h-full max-w-[1560px] items-center gap-4 px-5 pb-5 pt-[94px] lg:grid-cols-[minmax(280px,.82fr)_minmax(430px,1.18fr)_minmax(210px,.52fr)] lg:px-10 lg:pb-8 lg:pt-[98px]">
        <div className="scene-copy relative z-20 min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeScene.id}
              custom={direction}
              variants={copyVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: .48, ease: [.22, 1, .36, 1] }}
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.2em] text-emerald-500"><ActiveIcon className="h-4 w-4" />{activeScene.eyebrow}</span>
              <h1 className="mt-4 max-w-[580px] text-balance font-heading text-[clamp(2.6rem,5.4vw,5.1rem)] font-bold leading-[.94] tracking-[-.045em]">{activeScene.title}<span className="block text-emerald-500">{activeScene.accent}</span></h1>
              <p className="scene-description mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">{activeScene.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {activeScene.proofs.map((proof) => <span key={proof} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/70 px-3 py-1.5 text-xs font-bold text-ink-muted backdrop-blur"><Check className="h-3.5 w-3.5 text-emerald-500" />{proof}</span>)}
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button onClick={() => activate(activeIndex === scenes.length - 1 ? 0 : activeIndex + 1)} className="morph-cta group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-[#03140e] shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400">{activeScene.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-ink-muted">{String(activeIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="scene-arrows mt-7 flex items-center gap-2">
            <button onClick={() => activate(activeIndex - 1)} disabled={activeIndex === 0} aria-label={vi ? "Cảnh trước" : "Previous scene"} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-2/75 text-ink shadow-sm backdrop-blur transition hover:border-emerald-500/40 hover:text-emerald-500 disabled:opacity-25"><ArrowLeft className="h-4 w-4" /></button>
            <button onClick={() => activate(activeIndex + 1)} disabled={activeIndex === scenes.length - 1} aria-label={vi ? "Cảnh tiếp theo" : "Next scene"} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-2/75 text-ink shadow-sm backdrop-blur transition hover:border-emerald-500/40 hover:text-emerald-500 disabled:opacity-25"><ArrowRight className="h-4 w-4" /></button>
            <span className="ml-2 hidden text-xs text-ink-muted xl:inline">{vi ? "Phím ← → hoặc chọn một card" : "Use ← → or choose a card"}</span>
          </div>
        </div>

        <div className="scene-stage relative z-10 grid min-h-0 place-items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeScene.id}
              custom={direction}
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: .7, ease: [.22, 1, .36, 1] }}
              className="scene-visual-frame relative grid aspect-[1.04/1] w-full max-w-[650px] place-items-center overflow-hidden rounded-[2.5rem] border border-border bg-surface-2/58 shadow-[0_35px_100px_-45px_rgba(16,185,129,.55)] backdrop-blur-md"
              role="tabpanel"
              id={`scene-${activeScene.id}`}
              aria-label={activeScene.label}
            >
              <SceneVisual id={activeScene.id} theme={theme} lang={lang} community={community} />
            </motion.div>
          </AnimatePresence>
        </div>

        <nav className="scene-card-grid relative z-20 grid grid-cols-2 gap-2" aria-label={vi ? "Chọn nội dung" : "Choose a scene"}>
          {scenes.map((scene, index) => {
            const Icon = scene.icon;
            const selected = index === activeIndex;
            return <motion.button
              layout
              key={scene.id}
              onClick={() => activate(index)}
              aria-selected={selected}
              aria-controls={`scene-${scene.id}`}
              className={`scene-card group relative min-h-[92px] overflow-hidden rounded-2xl border p-2.5 text-left backdrop-blur-xl transition-colors ${selected ? "border-emerald-400/65 bg-emerald-500/14 shadow-[0_14px_35px_-18px_rgba(16,185,129,.8)]" : "border-border bg-surface-2/72 hover:border-emerald-500/35 hover:bg-emerald-500/[.055]"}`}
              animate={{ scale: selected ? 1.035 : 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-start justify-between gap-2"><span className={`grid h-8 w-8 place-items-center rounded-xl ${selected ? "bg-emerald-500 text-[#03140e]" : "bg-emerald-500/10 text-emerald-500"}`}><Icon className="h-4 w-4" /></span><span className="font-mono text-[9px] font-bold text-ink-muted/65">0{index + 1}</span></div>
              <div className="mt-2 text-xs font-bold leading-tight sm:text-sm">{scene.label}</div>
              <img src={getAppScreen(theme, SCENE_VISUAL_PATHS[scene.id])} alt="" className="pointer-events-none absolute -bottom-8 -right-3 w-14 rotate-[8deg] rounded-lg border border-white/10 opacity-20 transition duration-500 group-hover:-translate-y-1 group-hover:opacity-35" />
            </motion.button>;
          })}
        </nav>
      </section>
    </main>
  );
}

function SceneVisual({ id, theme, lang, community }) {
  if (id === "overview") return <OverviewVisual theme={theme} />;
  if (id === "demo") return <DemoVisual theme={theme} lang={lang} />;
  if (id === "agent") return <AgentVisual theme={theme} />;
  if (id === "architecture") return <ArchitectureVisual theme={theme} />;
  if (id === "gallery") return <GalleryVisual theme={theme} />;
  if (id === "security") return <SecurityVisual theme={theme} />;
  if (id === "community") return <CommunityVisual locations={community.locations || []} lang={lang} />;
  return <DownloadVisual theme={theme} lang={lang} />;
}

function OverviewVisual({ theme }) {
  return <div className="relative h-full w-full">
    <Glow />
    <Phone src={getAppScreen(theme, "03-dashboard/dashboard.jpg")} className="absolute left-1/2 top-[7%] z-20 w-[38%] -translate-x-1/2" />
    <Phone src={getAppScreen(theme, "02-devices/devices.jpg")} className="absolute bottom-[4%] left-[5%] z-10 w-[25%] -rotate-6 opacity-85" />
    <Phone src={getAppScreen(theme, "09-setting/setting.jpg")} className="absolute bottom-[4%] right-[5%] z-10 w-[25%] rotate-6 opacity-85" />
    <StatusChip className="left-[7%] top-[12%]" icon={Wifi} text="2 NAS online" />
  </div>;
}

function DemoVisual({ theme, lang }) {
  const [online, setOnline] = useState(true);
  const [metrics, setMetrics] = useState({ cpu: 18, ram: 42, temp: 47 });
  useEffect(() => {
    if (!online) return undefined;
    const timer = window.setInterval(() => setMetrics((value) => ({ cpu: clamp(value.cpu + randomDelta(8), 8, 78), ram: clamp(value.ram + randomDelta(4), 30, 76), temp: clamp(value.temp + randomDelta(2), 41, 61) })), 1300);
    return () => window.clearInterval(timer);
  }, [online]);
  const vi = lang === "vn";
  return <div className="relative h-full w-full">
    <Glow />
    <Phone src={getAppScreen(theme, "03-dashboard/dashboard.jpg")} className={`absolute left-1/2 top-[5%] w-[40%] -translate-x-1/2 transition ${online ? "" : "grayscale opacity-55"}`} />
    <div className="absolute left-[5%] top-[8%] z-20 grid gap-2">
      {[{ icon: Cpu, label: "CPU", value: `${metrics.cpu}%` }, { icon: MemoryStick, label: "RAM", value: `${metrics.ram}%` }, { icon: Thermometer, label: vi ? "Nhiệt độ" : "Temp", value: `${metrics.temp}°C` }].map(({ icon: Icon, label, value }) => <div key={label} className="flex min-w-28 items-center gap-3 rounded-2xl border border-border bg-surface-2/86 p-3 shadow-lg backdrop-blur"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><Icon className="h-4 w-4" /></span><span><span className="block text-[9px] font-bold uppercase tracking-wider text-ink-muted">{label}</span><span className="font-heading text-lg font-bold">{online ? value : "—"}</span></span></div>)}
    </div>
    <button onClick={() => setOnline((value) => !value)} className={`absolute right-[5%] top-[9%] z-30 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur ${online ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-500" : "border-red-500/25 bg-red-500/10 text-red-500"}`}>{online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}{online ? "ONLINE" : "OFFLINE"}</button>
  </div>;
}

function AgentVisual({ theme }) {
  return <div className="relative h-full w-full">
    <Glow />
    <div className="agent-orbit absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/25" />
    <div className="agent-orbit-reverse absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-400/20" />
    <Phone src={getAppScreen(theme, "04-agent/agent.jpg")} className="absolute left-1/2 top-[5%] z-20 w-[40%] -translate-x-1/2" />
    <StatusChip className="right-[4%] top-[14%]" icon={ShieldCheck} text="Ed25519 + TLS Pin" />
    <StatusChip className="left-[4%] bottom-[16%]" icon={KeyRound} text="Key-based pairing" />
  </div>;
}

function ArchitectureVisual({ theme }) {
  const nodes = [{ icon: Smartphone, label: "NasHubs App", pos: "left-[6%] top-[38%]" }, { icon: ShieldCheck, label: "Agent", pos: "left-1/2 top-[18%] -translate-x-1/2" }, { icon: Server, label: "NAS", pos: "right-[6%] top-[38%]" }, { icon: Boxes, label: "Mini-Apps", pos: "bottom-[7%] left-1/2 -translate-x-1/2" }];
  return <div className="relative h-full w-full">
    <Glow />
    <Phone src={getAppScreen(theme, "04-agent/agent.jpg")} className="absolute left-1/2 top-1/2 z-0 w-[24%] -translate-x-1/2 -translate-y-1/2 opacity-25" />
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 560" preserveAspectRatio="none"><motion.path d="M85 270 C180 80 235 205 300 175 C380 140 430 85 515 270" fill="none" stroke="rgb(16 185 129 / .6)" strokeWidth="2" strokeDasharray="8 10" animate={{ strokeDashoffset: [0, -72] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} /><motion.path d="M300 190 C300 280 300 350 300 475" fill="none" stroke="rgb(45 212 191 / .5)" strokeWidth="2" strokeDasharray="7 11" animate={{ strokeDashoffset: [0, -72] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} /></svg>
    {nodes.map(({ icon: Icon, label, pos }) => <div key={label} className={`absolute z-10 ${pos} grid min-w-24 place-items-center rounded-2xl border border-border bg-surface-2/88 p-3 text-center shadow-xl backdrop-blur`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500"><Icon className="h-5 w-5" /></span><span className="mt-2 text-xs font-bold">{label}</span></div>)}
  </div>;
}

function GalleryVisual({ theme }) {
  const screens = ["05-files/files.jpg", "06-media/media.jpg", "07-miniapps/miniapps.jpg", "08-photo/photo.jpg"];
  return <div className="relative flex h-full w-full items-center justify-center gap-3 overflow-hidden px-5 py-8">
    <Glow />
    {screens.map((screen, index) => <Phone key={screen} src={getAppScreen(theme, screen)} className={`relative z-10 w-[22%] transition duration-500 ${index === 1 ? "-translate-y-[3%] scale-105" : index === 2 ? "translate-y-[3%]" : ""}`} />)}
  </div>;
}

function SecurityVisual({ theme }) {
  return <div className="relative h-full w-full">
    <Glow />
    <Phone src={getAppScreen(theme, "01-auth/login.jpg")} className="absolute left-[9%] top-[14%] w-[31%] -rotate-5 opacity-85" />
    <Phone src={getAppScreen(theme, "04-agent/agent.jpg")} className="absolute right-[9%] top-[8%] z-10 w-[36%] rotate-4" />
    <motion.div animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 25px rgba(16,185,129,.15)", "0 0 65px rgba(16,185,129,.4)", "0 0 25px rgba(16,185,129,.15)"] }} transition={{ duration: 2.8, repeat: Infinity }} className="absolute left-1/2 top-[25%] z-20 grid h-24 w-24 -translate-x-1/2 place-items-center rounded-[1.8rem] border border-emerald-400/40 bg-surface-2/90 text-emerald-500 backdrop-blur-xl"><ShieldCheck className="h-12 w-12" /></motion.div>
  </div>;
}

function CommunityVisual({ locations, lang }) {
  return <div className="h-full w-full p-5"><CommunityGlobe locations={locations} lang={lang} /></div>;
}

function DownloadVisual({ theme, lang }) {
  const vi = lang === "vn";
  return <div className="relative h-full w-full">
    <Glow />
    <Phone src={getAppScreen(theme, "01-auth/login.jpg")} className="absolute left-[10%] top-[8%] w-[36%] -rotate-5" />
    <div className="absolute right-[7%] top-[17%] z-20 w-[44%] rounded-[2rem] border border-border bg-surface-2/86 p-5 shadow-2xl backdrop-blur-xl">
      <div className="font-heading text-2xl font-bold">{vi ? "NasHubs trong tay bạn." : "NasHubs in your hands."}</div>
      <p className="mt-2 text-sm text-ink-muted">{vi ? "Tải miễn phí. Nâng cấp Pro bất kỳ lúc nào." : "Download free. Upgrade to Pro whenever you need."}</p>
      <div className="mt-5 grid gap-2"><StoreBadge brand="Apple" label="App Store" /><StoreBadge brand="Google" label="Google Play" /></div>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4"><Qr /><span className="text-xs font-bold text-ink-muted">{vi ? "Quét để tải ứng dụng" : "Scan to download"}</span></div>
    </div>
  </div>;
}

function Phone({ src, className = "" }) {
  return <div className={`${className} overflow-hidden rounded-[2rem] border border-white/15 bg-black p-1.5 shadow-[0_28px_65px_-18px_rgba(0,0,0,.65)]`}><img src={src} alt="NasHubs app screen" className="aspect-[1320/2868] h-auto w-full rounded-[1.65rem] object-cover" /></div>;
}

function Glow() {
  return <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-[75px]" />;
}

function StatusChip({ icon: Icon, text, className = "" }) {
  return <div className={`absolute z-30 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/88 px-3 py-2 text-[10px] font-bold text-emerald-500 shadow-xl backdrop-blur ${className}`}><Icon className="h-3.5 w-3.5" />{text}</div>;
}

function StoreBadge({ brand, label }) {
  return <div className="flex items-center gap-3 rounded-xl bg-ink px-3 py-2 text-surface"><AppWindow className="h-5 w-5" /><span><span className="block text-[8px] uppercase tracking-wider opacity-65">{brand}</span><span className="text-xs font-bold">{label}</span></span></div>;
}

function Qr() {
  const filled = new Set([0,1,2,4,5,6,7,9,11,13,14,16,18,20,22,24,28,30,31,32,33,35,37,39,41,42,44,45,46,47,48]);
  return <div className="grid h-14 w-14 shrink-0 grid-cols-7 grid-rows-7 gap-px rounded-lg bg-surface p-1.5">{Array.from({ length: 49 }, (_, index) => <span key={index} className={filled.has(index) ? "bg-ink" : "bg-transparent"} />)}</div>;
}

function createScenes(vi) {
  return [
    { id: "overview", label: vi ? "Tổng quan" : "Overview", icon: Sparkles, eyebrow: vi ? "NAS của bạn · Quyền kiểm soát của bạn" : "Your NAS · Your control", title: vi ? "Mọi NAS." : "Every NAS.", accent: vi ? "Một trải nghiệm." : "One experience.", description: vi ? "Theo dõi, quản lý và truy cập mọi thiết bị Network Attached Storage trong một giao diện duy nhất." : "Monitor, manage and reach Network Attached Storage devices across brands from one unified interface.", proofs: [vi ? "Đa nền tảng" : "Cross-platform", vi ? "Đa thương hiệu" : "Multi-brand"], cta: vi ? "Thử quản lý NAS" : "Try managing a NAS" },
    { id: "demo", label: vi ? "NAS trực tiếp" : "Live NAS", icon: Activity, eyebrow: vi ? "Demo tương tác" : "Interactive demo", title: vi ? "Chạm vào dữ liệu." : "Touch the data.", accent: vi ? "Thấy ngay thay đổi." : "See it respond.", description: vi ? "CPU, RAM, nhiệt độ và trạng thái kết nối phản hồi ngay trong trình duyệt — không cần tài khoản." : "CPU, RAM, temperature and connection state respond live in the browser — no account required.", proofs: [vi ? "Dữ liệu mô phỏng" : "Live simulation", vi ? "Không đăng nhập" : "No sign-in"], cta: vi ? "Khám phá Agent" : "Explore the Agent" },
    { id: "agent", label: "NasHubs-Agent", icon: ShieldCheck, eyebrow: "NasHubs-Agent", title: vi ? "Trái tim bảo mật." : "The secure heart.", accent: vi ? "Ngay trên NAS." : "Right on your NAS.", description: vi ? "Agent nhẹ tạo cầu nối riêng tư giữa ứng dụng và NAS bằng Ed25519 cùng TLS pin." : "A lightweight agent creates a private bridge between the app and your NAS with Ed25519 and TLS pinning.", proofs: ["Ed25519", "TLS Pin"], cta: vi ? "Xem kiến trúc" : "See the architecture" },
    { id: "architecture", label: vi ? "Kiến trúc" : "Architecture", icon: Network, eyebrow: vi ? "Luồng kết nối" : "Connection flow", title: vi ? "Mỗi lệnh." : "Every command.", accent: vi ? "Đều có thể kiểm chứng." : "Fully verifiable.", description: vi ? "Ứng dụng, Agent, NAS và Mini‑Apps phối hợp qua một tuyến kết nối rõ ràng, không cần chia sẻ mật khẩu SSH." : "App, Agent, NAS and Mini-Apps work through a transparent path without sharing SSH passwords.", proofs: [vi ? "Không mở port" : "No open ports", vi ? "Không mật khẩu SSH" : "No SSH password"], cta: vi ? "Xem ứng dụng" : "See the app" },
    { id: "gallery", label: vi ? "Ứng dụng" : "App screens", icon: Layers3, eyebrow: vi ? "Trải nghiệm thực tế" : "The real experience", title: vi ? "File, media, photo." : "Files, media, photos.", accent: vi ? "Luôn trong tầm tay." : "Always within reach.", description: vi ? "Duyệt file, xem media, quản lý ảnh và vận hành Mini‑Apps mà không phải đổi qua nhiều giao diện quản trị." : "Browse files, enjoy media, manage photos and operate Mini-Apps without switching between admin interfaces.", proofs: ["File Browser", "Media & Mini‑Apps"], cta: vi ? "Xem bảo mật" : "See security" },
    { id: "security", label: vi ? "Bảo mật" : "Security", icon: LockKeyhole, eyebrow: vi ? "Riêng tư từ thiết kế" : "Private by design", title: vi ? "Dữ liệu của bạn." : "Your data.", accent: vi ? "Chỉ của bạn." : "Only yours.", description: vi ? "Khóa nằm trên thiết bị, dữ liệu đi trực tiếp giữa bạn và NAS, không qua máy chủ trung gian." : "Keys stay on-device and NAS data travels directly between you and your hardware without a middleman server.", proofs: [vi ? "Không theo dõi" : "No tracking", "Pinned TLS"], cta: vi ? "Gặp cộng đồng" : "Meet the community" },
    { id: "community", label: vi ? "Cộng đồng" : "Community", icon: Globe2, eyebrow: vi ? "Cộng đồng toàn cầu" : "Global community", title: "NasHubs", accent: vi ? "kết nối thế giới." : "connects the world.", description: vi ? "Từ homelab nhỏ đến hệ thống nhiều thiết bị — cộng đồng NasHubs đang lớn lên trên mọi loại NAS." : "From small homelabs to multi-device systems, the NasHubs community is growing across every kind of NAS.", proofs: ["12K+ users", "38K+ NAS"], cta: vi ? "Tải NasHubs" : "Get NasHubs" },
    { id: "download", label: vi ? "Tải ứng dụng" : "Download", icon: Download, eyebrow: vi ? "Sẵn sàng kết nối" : "Ready to connect", title: vi ? "NAS trong tay bạn." : "Your NAS in hand.", accent: vi ? "Bắt đầu hôm nay." : "Start today.", description: vi ? "Tải miễn phí trên iOS và Android. Nâng cấp NasHubs Pro bất kỳ lúc nào khi bạn cần nhiều hơn." : "Download free on iOS and Android. Upgrade to NasHubs Pro whenever you need more.", proofs: ["iOS", "Android"], cta: vi ? "Quay về tổng quan" : "Back to overview" },
  ];
}

function normalizeScene(id) {
  return SCENE_IDS.includes(id) ? id : "overview";
}

const copyVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 28 : -28, filter: "blur(7px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24, filter: "blur(6px)" }),
};

const visualVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 70 : -70, rotate: direction > 0 ? 4 : -4, scale: .9, filter: "blur(12px)" }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1, filter: "blur(0px)" },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -85 : 85, rotate: direction > 0 ? -5 : 5, scale: 1.08, filter: "blur(10px)" }),
};

function randomDelta(range) { return Math.round((Math.random() - .5) * range); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
