"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { getSynthUrl, isSynthUrl } from "@/lib/audio/synthesizer";
import { unlockAudio, isWeChat } from "@/lib/audio/engine";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

/**
 * 氛围视频 Canvas 动画
 * - 用 Canvas 实时绘制与标题匹配的氛围动画，替代占位视频
 * - 同时播放与标题匹配的环境音（Web Audio 合成）
 */
export type VideoAnimType =
  | "breathing"
  | "night-city"
  | "rain"
  | "ocean"
  | "forest"
  | "fire";

/** 视频类型 → 匹配的环境音类型 */
const VIDEO_SOUND_MAP: Record<VideoAnimType, string> = {
  breathing: "synth:tibet",
  "night-city": "synth:cafe",
  rain: "synth:rain",
  ocean: "synth:ocean",
  forest: "synth:forest",
  fire: "synth:fire",
};

interface AmbientVideoProps {
  type: VideoAnimType;
  playing?: boolean;
  className?: string;
}

export function AmbientVideo({ type, playing = true, className }: AmbientVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const howlRef = useRef<Howl | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [active, setActive] = useState(playing);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 监听全屏状态变化
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /** 切换全屏（兼容 webkit 前缀） */
  const toggleFullscreen = () => {
    const el = containerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    if (!el) return;
    if (!document.fullscreenElement) {
      const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
      req?.call(el).catch(() => {});
    } else {
      const exit =
        document.exitFullscreen ??
        (document as Document & { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen;
      exit?.call(document).catch(() => {});
    }
  };


  // 初始化匹配的环境音
  useEffect(() => {
    const soundUrl = VIDEO_SOUND_MAP[type];
    const realUrl = isSynthUrl(soundUrl)
      ? getSynthUrl(soundUrl.slice("synth:".length) as never)
      : soundUrl;
    const isBlob = realUrl.startsWith("blob:");
    howlRef.current = new Howl({
      src: [realUrl],
      // 微信用 html5 模式，其他用 Web Audio
      html5: isBlob ? isWeChat() : true,
      loop: true,
      volume: 0.6,
      ...(isBlob ? { format: ["wav"] } : {}),
    });
    return () => {
      howlRef.current?.unload();
      howlRef.current = null;
    };
  }, [type]);

  // 控制音频播放/暂停
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (active && soundOn) {
      if (!howl.playing()) {
        unlockAudio();
        howl.play();
      }
    } else {
      if (howl.playing()) howl.pause();
    }
  }, [active, soundOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();

    const draw = (now: number) => {
      const t = (now - startRef.current) / 1000;
      switch (type) {
        case "breathing":
          drawBreathing(ctx, w, h, t);
          break;
        case "night-city":
          drawNightCity(ctx, w, h, t);
          break;
        case "rain":
          drawRain(ctx, w, h, t);
          break;
        case "ocean":
          drawOcean(ctx, w, h, t);
          break;
        case "forest":
          drawForest(ctx, w, h, t);
          break;
        case "fire":
          drawFire(ctx, w, h, t);
          break;
      }
      if (active) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [type, active]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl bg-black">
      <canvas
        ref={canvasRef}
        className={className ?? "aspect-video w-full bg-black"}
      />
      {/* 中央播放/暂停按钮 */}
      <button
        onClick={() => {
          const willPlay = !active;
          setActive(willPlay);
          if (willPlay) setSoundOn(true);
        }}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={active ? "暂停" : "播放"}
      >
        {!active && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-text-primary backdrop-blur-sm transition hover:bg-black/60">
            <Play className="h-8 w-8 fill-current" />
          </span>
        )}
      </button>
      {/* 右下角控制组 */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button
          onClick={() => setSoundOn((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-text-primary backdrop-blur-sm transition hover:bg-black/60"
          aria-label={soundOn ? "关闭声音" : "开启声音"}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-text-primary backdrop-blur-sm transition hover:bg-black/60"
          aria-label={isFullscreen ? "退出全屏" : "全屏"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
      {/* 左下角播放状态指示 */}
      {active && (
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-text-primary backdrop-blur-sm">
          <Pause className="h-3 w-3" /> 播放中
        </span>
      )}
    </div>
  );
}

/* ---------------- 呼吸引导（4-7-8 圆环） ---------------- */
function drawBreathing(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#1a1614";
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  // 4-7-8 循环，总周期 19s
  const cycle = 19;
  const phase = t % cycle;
  let scale: number;
  let label: string;
  if (phase < 4) {
    scale = 0.4 + (phase / 4) * 0.5; // 吸气：0.4 → 0.9
    label = "吸气";
  } else if (phase < 11) {
    scale = 0.9; // 屏息
    label = "屏息";
  } else {
    scale = 0.9 - ((phase - 11) / 8) * 0.5; // 呼气：0.9 → 0.4
    label = "呼气";
  }
  const r = Math.min(w, h) * 0.3 * scale;

  // 外层光晕
  const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.4);
  grad.addColorStop(0, "rgba(201,173,167,0.35)");
  grad.addColorStop(1, "rgba(201,173,167,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 圆环
  ctx.strokeStyle = "rgba(232,227,221,0.85)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // 文字
  ctx.fillStyle = "rgba(245,240,232,0.9)";
  ctx.font = "600 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
}

/* ---------------- 深夜城市（星点 + 缓慢移动光带） ---------------- */
function drawNightCity(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#0f0d12";
  ctx.fillRect(0, 0, w, h);

  // 星点
  ctx.fillStyle = "rgba(232,227,221,0.8)";
  for (let i = 0; i < 80; i++) {
    const x = (i * 97 + t * 8) % w;
    const y = (i * 53) % (h * 0.6);
    const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.5 + i));
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // 城市天际线
  ctx.fillStyle = "#1a1620";
  const baseY = h * 0.7;
  ctx.fillRect(0, baseY, w, h - baseY);
  // 建筑
  for (let i = 0; i < 12; i++) {
    const bx = (i / 12) * w;
    const bw = w / 12 - 4;
    const bh = 30 + ((i * 37) % 80);
    ctx.fillRect(bx, baseY - bh, bw, bh);
    // 窗户灯光
    ctx.fillStyle = "rgba(201,173,167,0.6)";
    for (let wy = baseY - bh + 6; wy < baseY - 6; wy += 10) {
      for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
        if ((wx + wy + i) % 3 === 0) ctx.fillRect(wx, wy, 3, 4);
      }
    }
    ctx.fillStyle = "#1a1620";
  }

  // 缓慢移动的光带（列车/车流感）
  const lightX = (t * 60) % (w + 100) - 50;
  const lg = ctx.createLinearGradient(lightX - 60, 0, lightX + 60, 0);
  lg.addColorStop(0, "rgba(201,173,167,0)");
  lg.addColorStop(0.5, "rgba(201,173,167,0.5)");
  lg.addColorStop(1, "rgba(201,173,167,0)");
  ctx.fillStyle = lg;
  ctx.fillRect(lightX - 60, baseY - 30, 120, 8);
}

/* ---------------- 雨夜（下落雨线） ---------------- */
const rainDrops: { x: number; y: number; len: number; spd: number }[] = [];
function ensureRain(w: number, h: number) {
  if (rainDrops.length > 0) return;
  for (let i = 0; i < 150; i++) {
    rainDrops.push({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 10 + Math.random() * 20,
      spd: 400 + Math.random() * 400,
    });
  }
}
function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#14181d";
  ctx.fillRect(0, 0, w, h);
  ensureRain(w, h);

  ctx.strokeStyle = "rgba(180,195,210,0.4)";
  ctx.lineWidth = 1;
  for (const d of rainDrops) {
    d.y += d.spd * 0.016;
    if (d.y > h) {
      d.y = -d.len;
      d.x = Math.random() * w;
    }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 2, d.y + d.len);
    ctx.stroke();
  }
}

/* ---------------- 海浪（正弦波叠加） ---------------- */
function drawOcean(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#0e1a24";
  ctx.fillRect(0, 0, w, h);

  const layers = [
    { amp: 18, freq: 0.012, speed: 0.6, y: h * 0.55, color: "rgba(120,150,170,0.25)" },
    { amp: 14, freq: 0.018, speed: 0.9, y: h * 0.62, color: "rgba(100,130,155,0.35)" },
    { amp: 10, freq: 0.025, speed: 1.2, y: h * 0.7, color: "rgba(80,110,135,0.5)" },
    { amp: 8, freq: 0.035, speed: 1.6, y: h * 0.8, color: "rgba(60,90,115,0.7)" },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const y = L.y + Math.sin(x * L.freq + t * L.speed) * L.amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
}

/* ---------------- 雾中森林（漂浮微粒 + 树干剪影） ---------------- */
const mistParticles: { x: number; y: number; r: number; spd: number }[] = [];
function drawForest(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // 渐变背景
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#1c241c");
  bg.addColorStop(1, "#141a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 树干剪影
  ctx.fillStyle = "rgba(10,14,10,0.7)";
  for (let i = 0; i < 7; i++) {
    const tx = (i / 7) * w + 20;
    const tw = 12 + (i % 3) * 6;
    ctx.fillRect(tx, h * 0.2, tw, h * 0.8);
  }

  // 漂浮微粒
  if (mistParticles.length === 0) {
    for (let i = 0; i < 60; i++) {
      mistParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 3,
        spd: 5 + Math.random() * 15,
      });
    }
  }
  ctx.fillStyle = "rgba(200,210,190,0.4)";
  for (const p of mistParticles) {
    p.x += p.spd * 0.016;
    p.y += Math.sin(t + p.x * 0.01) * 0.3;
    if (p.x > w + 10) p.x = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------------- 篝火（上升火焰粒子） ---------------- */
const fireParticles: { x: number; y: number; vy: number; r: number; life: number; max: number }[] = [];
function drawFire(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#1a0f0a";
  ctx.fillRect(0, 0, w, h);

  const baseX = w / 2;
  const baseY = h * 0.85;

  // 生成新粒子
  if (Math.random() < 0.8) {
    fireParticles.push({
      x: baseX + (Math.random() - 0.5) * 60,
      y: baseY,
      vy: -40 - Math.random() * 80,
      r: 8 + Math.random() * 16,
      life: 0,
      max: 0.8 + Math.random() * 0.8,
    });
  }

  // 绘制与更新
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const p = fireParticles[i];
    p.life += 0.016;
    p.y += p.vy * 0.016;
    p.vy *= 0.98;
    p.x += Math.sin(t * 3 + i) * 0.5;
    const a = Math.max(0, 1 - p.life / p.max);
    if (a <= 0) {
      fireParticles.splice(i, 1);
      continue;
    }
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(255,200,120,${a * 0.9})`);
    grad.addColorStop(0.5, `rgba(220,120,50,${a * 0.5})`);
    grad.addColorStop(1, `rgba(180,60,20,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 木柴
  ctx.fillStyle = "#2a1810";
  ctx.fillRect(baseX - 50, baseY, 100, 12);
}
