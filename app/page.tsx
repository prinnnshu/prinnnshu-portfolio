"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const TOTAL_FRAMES = 120;

const sectionCopy = [
  {
    className: "copy copy-hero",
    eyebrow: "Xbox Wireless Controller",
    title: "Precision gaming. Perfect control.",
    body: "Engineered for speed, accuracy, and total immersion.",
  },
  {
    className: "copy copy-left",
    eyebrow: "Design",
    title: "Designed for total control.",
    body: "Ergonomic grips, refined thumbsticks, and perfectly balanced weight deliver comfort and precision for long gaming sessions.",
  },
  {
    className: "copy copy-right",
    eyebrow: "Engineering",
    title: "Engineering inside every move.",
    body: "Advanced sensors, responsive triggers, and optimized electronics ensure every input is instant and precise.",
  },
  {
    className: "copy copy-center",
    eyebrow: "Performance",
    title: "Built for competitive performance.",
    body: "Responsive thumbsticks and precision triggers deliver total control whether you're racing, fighting, or exploring vast worlds.",
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function rangeProgress(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}

export default function Page() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameBuffer = useRef<HTMLCanvasElement[]>([]);
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.05, 1]);

  useEffect(() => {
    const buildFrames = () => {
      frameBuffer.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        const offscreen = document.createElement("canvas");
        offscreen.width = 1920;
        offscreen.height = 1080;
        const ctx = offscreen.getContext("2d");
        if (ctx) drawController(ctx, i);
        return offscreen;
      });
      setReady(true);
    };

    buildFrames();
  }, []);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !ready) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const source = frameBuffer.current[Math.min(frame, TOTAL_FRAMES - 1)];
      if (!source) return;
      ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, window.innerWidth, window.innerHeight);
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [frame, ready]);

  useEffect(() => {
    const updateFrame = () => {
      const root = scrollRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      const traveled = clamp(-rect.top / total);
      setFrame(Math.round(traveled * (TOTAL_FRAMES - 1)));
    };

    updateFrame();
    window.addEventListener("scroll", updateFrame, { passive: true });
    window.addEventListener("resize", updateFrame);

    return () => {
      window.removeEventListener("scroll", updateFrame);
      window.removeEventListener("resize", updateFrame);
    };
  }, []);

  const finalVisible = useMemo(() => frame > 102, [frame]);

  return (
    <main>
      <motion.nav className="top-nav" style={{ opacity: navOpacity }}>
        <span className="brand">Xbox Wireless Controller</span>
        <div className="nav-links">
          {["Overview", "Design", "Engineering", "Performance", "Specs", "Buy"].map((link) => (
            <a key={link} href="#">
              {link}
            </a>
          ))}
        </div>
        <button className="nav-cta">Buy Controller</button>
      </motion.nav>

      <section ref={scrollRef} className="scroll-stage">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} aria-label="Xbox controller exploded sequence" />
          <div className="vignette" />
        </div>

        {sectionCopy.map((block, i) => (
          <motion.article
            key={block.title}
            className={block.className}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: frame > i * 25 && frame < i * 25 + 35 ? 1 : 0.2, y: frame > i * 25 ? 0 : 30 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.7 }}
          >
            <p>{block.eyebrow}</p>
            <h2>{block.title}</h2>
            <p>{block.body}</p>
          </motion.article>
        ))}

        <motion.article className="copy copy-end" animate={{ opacity: finalVisible ? 1 : 0 }}>
          <h2>Power your play.</h2>
          <p>Xbox Wireless Controller</p>
          <div className="end-actions">
            <button>Buy Now</button>
            <a href="#">View full specifications.</a>
          </div>
        </motion.article>
      </section>
    </main>
  );
}

function drawController(ctx: CanvasRenderingContext2D, frame: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  const explode = rangeProgress(frame, 20, 60);
  const hold = rangeProgress(frame, 60, 90);
  const reassemble = rangeProgress(frame, 90, 119);
  const spread = explode * (1 - reassemble) + hold * (1 - reassemble);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#050505");
  bg.addColorStop(1, "#0A0A0C");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 480);
  glow.addColorStop(0, "rgba(33,240,0,0.18)");
  glow.addColorStop(1, "rgba(33,240,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(cx, cy + 20);

  const parts = [
    { x: -320, y: -20, z: 0, c: "#1a1a1d", s: [430, 230], r: 26 },
    { x: -250, y: -30, z: 1, c: "#1f2022", s: [50, 50], r: 18 },
    { x: -220, y: -15, z: 2, c: "#2d2e31", s: [52, 52], r: 18 },
    { x: -185, y: -6, z: 3, c: "#3c3d41", s: [40, 40], r: 10 },
    { x: -145, y: -14, z: 4, c: "#26272b", s: [60, 24], r: 10 },
    { x: -95, y: -14, z: 5, c: "#0e0f11", s: [58, 26], r: 10 },
    { x: -35, y: -8, z: 6, c: "#191a1f", s: [70, 34], r: 12 },
    { x: 35, y: -8, z: 7, c: "#1f2522", s: [230, 120], r: 16 },
    { x: 130, y: -4, z: 8, c: "#3d4149", s: [36, 36], r: 18 },
    { x: 165, y: -2, z: 9, c: "#24272c", s: [44, 44], r: 18 },
    { x: 205, y: 4, z: 10, c: "#2f3136", s: [70, 28], r: 14 },
    { x: 265, y: 6, z: 11, c: "#2a2b2e", s: [55, 22], r: 10 },
    { x: 320, y: 14, z: 12, c: "#17181c", s: [420, 240], r: 26 },
  ];

  const axis = 80 + spread * 250;
  parts.forEach((part, idx) => {
    const ox = (idx - parts.length / 2) * axis * 0.18;
    const oy = Math.sin(idx * 0.7) * 12 * spread;
    const alpha = 0.95 - Math.abs(idx - parts.length / 2) * 0.02;

    ctx.save();
    ctx.translate(part.x + ox, part.y + oy);
    ctx.globalAlpha = alpha;

    const shade = ctx.createLinearGradient(-part.s[0] / 2, 0, part.s[0] / 2, 0);
    shade.addColorStop(0, "rgba(255,255,255,0.05)");
    shade.addColorStop(0.45, part.c);
    shade.addColorStop(1, "rgba(8,8,10,0.95)");

    roundRect(ctx, -part.s[0] / 2, -part.s[1] / 2, part.s[0], part.s[1], part.r);
    ctx.fillStyle = shade;
    ctx.fill();

    if (part.z === 2 || part.z === 8) {
      ctx.fillStyle = idx % 2 ? "#21F000" : "#107C10";
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
