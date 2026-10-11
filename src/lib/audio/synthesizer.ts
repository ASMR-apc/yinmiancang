/**
 * Web Audio 环境音合成器
 * - 根据声音类型生成与标题匹配的 WAV 音频（PCM 16-bit）
 * - 环境音为可循环短片段（~6s），触发音为短音效（~1-2s）
 * - 生成结果缓存为 blob URL，供 Howler 播放
 */

export type SoundType =
  | "rain"
  | "fire"
  | "whisper"
  | "ocean"
  | "forest"
  | "thunder"
  | "white-noise"
  | "tibet"
  | "tap"
  | "cafe"
  | "wind"
  | "pink-noise"
  | "bowl"
  | "bell"
  | "chime"
  | "drop"
  | "om"
  | "flute";

const SAMPLE_RATE = 44100;
const cache = new Map<SoundType, string>();

/** 判断是否为合成音源标识 */
export function isSynthUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("synth:");
}

/** 从 synth:xxx 中提取类型 */
export function parseSynthType(url: string): SoundType | null {
  if (!isSynthUrl(url)) return null;
  const type = url.slice("synth:".length) as SoundType;
  return type;
}

/** 获取合成音的 blob URL（带缓存） */
export function getSynthUrl(type: SoundType): string {
  const cached = cache.get(type);
  if (cached) return cached;
  const samples = generate(type);
  const blob = encodeWav(samples, SAMPLE_RATE);
  const url = URL.createObjectURL(blob);
  cache.set(type, url);
  return url;
}

/* ---------------- WAV 编码 ---------------- */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

/* ---------------- 基础噪声 ---------------- */
function whiteNoise(n: number): Float32Array {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

/** 柔和噪声：白噪声经低通+轻微衰减，去除刺耳高频沙沙声 */
function softNoise(n: number, cutoff = 3500): Float32Array {
  const raw = whiteNoise(n);
  const lp = lowpass(raw, cutoff, SAMPLE_RATE);
  // 整体衰减 20%，避免底噪过亮
  for (let i = 0; i < n; i++) lp[i] *= 0.8;
  return lp;
}

/** 粉噪音（Voss-McCartney 近似） */
function pinkNoise(n: number): Float32Array {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return out;
}

/** 棕噪音（积分白噪音，低频为主） */
function brownNoise(n: number): Float32Array {
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = last * 3.5;
  }
  return out;
}

/** 简单一阶低通滤波 */
function lowpass(input: Float32Array, cutoff: number, sampleRate: number): Float32Array {
  const out = new Float32Array(input.length);
  const dt = 1 / sampleRate;
  const rc = 1 / (2 * Math.PI * cutoff);
  const alpha = dt / (rc + dt);
  let y = 0;
  for (let i = 0; i < input.length; i++) {
    y += alpha * (input[i] - y);
    out[i] = y;
  }
  return out;
}

/** 一阶高通滤波 */
function highpass(input: Float32Array, cutoff: number, sampleRate: number): Float32Array {
  const out = new Float32Array(input.length);
  const dt = 1 / sampleRate;
  const rc = 1 / (2 * Math.PI * cutoff);
  const alpha = rc / (rc + dt);
  let y = 0;
  let prev = 0;
  for (let i = 0; i < input.length; i++) {
    y = alpha * (y + input[i] - prev);
    out[i] = y;
    prev = input[i];
  }
  return out;
}

/** 带通滤波（低通 - 更低截止的低通） */
function bandpass(input: Float32Array, lowCut: number, highCut: number, sampleRate: number): Float32Array {
  const lp = lowpass(input, highCut, sampleRate);
  const hp = highpass(lp, lowCut, sampleRate);
  return hp;
}

/** 对数组做淡入淡出，使循环更平滑 */
function fadeEdges(input: Float32Array, fadeMs: number, sampleRate: number): Float32Array {
  const out = new Float32Array(input.length);
  const fade = Math.floor((fadeMs / 1000) * sampleRate);
  for (let i = 0; i < input.length; i++) {
    let gain = 1;
    if (i < fade) gain = i / fade;
    else if (i > input.length - fade) gain = (input.length - i) / fade;
    out[i] = input[i] * gain;
  }
  return out;
}

/** 求数组绝对值最大值（避免 Math.max(...大数组) 撑爆调用栈） */
function maxAbs(arr: Float32Array): number {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i] < 0 ? -arr[i] : arr[i];
    if (v > max) max = v;
  }
  return max;
}

/** 缓慢幅度调制（模拟自然呼吸感，让噪声不那么机械） */
function slowModulate(input: Float32Array, rate: number, depth: number, sampleRate: number): Float32Array {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const t = i / sampleRate;
    const mod = 1 - depth + depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * rate * t));
    out[i] = input[i] * mod;
  }
  return out;
}

/* ---------------- 环境音生成（6s 循环） ---------------- */
const AMBIENT_SEC = 6;

function genRain(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  // 打底噪声先降到 4000Hz，减少沙沙底噪
  const noise = softNoise(n, 4000);
  // 主体雨声：带通 300-3200Hz，进一步收窄高频
  let body: Float32Array = bandpass(noise, 300, 3200, SAMPLE_RATE);
  // 二级低通，柔化 3kHz 以上的尖锐成分
  body = lowpass(body, 2800, SAMPLE_RATE);
  // 缓慢呼吸调制
  body = slowModulate(body, 0.12, 0.22, SAMPLE_RATE);
  // 偶发水滴：频率下移到 800-2000Hz，数量减半，避免尖锐
  for (let i = 0; i < 22; i++) {
    const pos = Math.floor(Math.random() * (n - 100));
    const freq = 800 + Math.random() * 1200;
    const dropEnv = new Float32Array(60);
    for (let j = 0; j < 60; j++) {
      const t = j / SAMPLE_RATE;
      dropEnv[j] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 100) * 0.06;
    }
    // 水滴也做低通，去掉高频毛刺
    const lpDrop = lowpass(dropEnv, 2200, SAMPLE_RATE);
    for (let j = 0; j < 60; j++) body[pos + j] += lpDrop[j];
  }
  // 最终整体低通，确保无尖锐高频
  body = lowpass(body, 3000, SAMPLE_RATE);
  const max = maxAbs(body) || 1;
  return fadeEdges(body.map((v) => (v / max) * 0.3), 50, SAMPLE_RATE);
}

function genFire(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const noise = softNoise(n, 2500);
  // 极轻的底噪（仅做氛围铺垫，音量很低）
  const base = lowpass(noise, 120, SAMPLE_RATE).map((v) => v * 0.08);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = base[i];
  // 柴火噼啪声：放大、加密、更有质感
  for (let i = 0; i < 90; i++) {
    const pos = Math.floor(Math.random() * (n - 200));
    const dur = 15 + Math.floor(Math.random() * 60);
    // 噼啪主体：放大到 0.5
    const crackle = new Float32Array(dur);
    for (let j = 0; j < dur; j++) {
      crackle[j] = (Math.random() * 2 - 1) * Math.exp(-j / 22) * 0.5;
    }
    const lpCrackle = lowpass(crackle, 2200, SAMPLE_RATE);
    for (let j = 0; j < dur; j++) out[pos + j] += lpCrackle[j];
    // 部分噼啪附加一个高频"刺"音，增加木头爆裂的真实感
    if (Math.random() < 0.35) {
      const snapDur = 5 + Math.floor(Math.random() * 12);
      const snap = new Float32Array(snapDur);
      for (let j = 0; j < snapDur; j++) {
        snap[j] = (Math.random() * 2 - 1) * Math.exp(-j / 4) * 0.35;
      }
      const lpSnap = lowpass(snap, 3000, SAMPLE_RATE);
      const snapPos = pos + Math.floor(Math.random() * Math.min(dur, 30));
      for (let j = 0; j < snapDur && snapPos + j < n; j++) {
        out[snapPos + j] += lpSnap[j];
      }
    }
  }
  // 最终低通，保留噼啪的清脆感同时去掉毛刺
  const filtered = lowpass(out, 2400, SAMPLE_RATE);
  const max = maxAbs(filtered) || 1;
  return fadeEdges(filtered.map((v) => (v / max) * 0.38), 40, SAMPLE_RATE);
}

function genWhisper(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  // 耳语风：柔和噪声经带通 + 呼吸节奏调制，无拟人声
  const noise = softNoise(n, 3500);
  let body = bandpass(noise, 700, 2800, SAMPLE_RATE);
  body = slowModulate(body, 0.25, 0.4, SAMPLE_RATE);
  // 叠加极轻的呼吸底噪
  const breath = bandpass(softNoise(n, 2000), 500, 1400, SAMPLE_RATE).map((v) => v * 0.05);
  const breathMod = slowModulate(breath, 0.22, 0.6, SAMPLE_RATE);
  for (let i = 0; i < n; i++) body[i] += breathMod[i];
  body = lowpass(body, 3000, SAMPLE_RATE);
  const max = maxAbs(body) || 1;
  return fadeEdges(body.map((v) => (v / max) * 0.26), 50, SAMPLE_RATE);
}

function genOcean(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const noise = brownNoise(n);
  // 海浪：棕噪音受慢 LFO 调制
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const wave = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1667 * t - Math.PI / 2));
    out[i] = noise[i] * wave;
  }
  // 柔和高频，去掉刺耳浪花声
  const filtered = lowpass(out, 2500, SAMPLE_RATE);
  const max = maxAbs(filtered) || 1;
  return fadeEdges(filtered.map((v) => (v / max) * 0.32), 60, SAMPLE_RATE);
}

function genForest(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const noise = softNoise(n, 2800);
  // 微风穿过树叶：极柔的带通
  let body: Float32Array = bandpass(noise, 200, 2200, SAMPLE_RATE).map((v) => v * 0.18);
  body = slowModulate(body, 0.08, 0.3, SAMPLE_RATE);
  // 偶发鸟鸣（更柔和、更稀疏）
  for (let i = 0; i < 18; i++) {
    const pos = Math.floor(Math.random() * (n - 4000));
    const baseFreq = 1800 + Math.random() * 1800;
    const chirpDur = 0.12 + Math.random() * 0.12;
    for (let j = 0; j < chirpDur * SAMPLE_RATE; j++) {
      const t = j / SAMPLE_RATE;
      const freq = baseFreq + Math.sin(t * 25) * 300;
      body[pos + j] += Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10) * 0.15;
    }
  }
  const max = maxAbs(body) || 1;
  return fadeEdges(body.map((v) => (v / max) * 0.28), 40, SAMPLE_RATE);
}

function genThunder(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const noise = brownNoise(n);
  let body = noise.map((v) => v * 0.4);
  // 低频轰鸣（更少、更柔）
  for (let i = 0; i < 2; i++) {
    const pos = Math.floor((n / 3) * (i + 1));
    const dur = SAMPLE_RATE * 1.2;
    for (let j = 0; j < dur && pos + j < n; j++) {
      const t = j / SAMPLE_RATE;
      body[pos + j] += Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 1.8) * 0.3;
    }
  }
  const max = maxAbs(body) || 1;
  return fadeEdges(body.map((v) => (v / max) * 0.3), 60, SAMPLE_RATE);
}

function genWhiteNoise(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  // 白噪音也柔和化处理
  const filtered = lowpass(whiteNoise(n), 6000, SAMPLE_RATE);
  return fadeEdges(filtered.map((v) => v * 0.18), 20, SAMPLE_RATE);
}

function genPinkNoise(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  return fadeEdges(pinkNoise(n).map((v) => v * 0.25), 20, SAMPLE_RATE);
}

function genCafe(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  // 环境底噪：人声频段的柔和噪声（模拟远处人群的模糊嗡嗡声，非可辨人声）
  const noise = softNoise(n, 2800);
  let body: Float32Array = bandpass(noise, 200, 1800, SAMPLE_RATE).map((v) => v * 0.3);
  body = slowModulate(body, 0.1, 0.2, SAMPLE_RATE);

  // 杯碟轻响：用多谐波正弦模拟陶瓷/玻璃的清脆共鸣
  for (let i = 0; i < 14; i++) {
    const pos = Math.floor(Math.random() * (n - 2000));
    const dur = 0.15 + Math.random() * 0.25;
    const durSamples = Math.floor(dur * SAMPLE_RATE);
    const baseFreq = 1800 + Math.random() * 1200;
    const clink = new Float32Array(durSamples);
    for (let j = 0; j < durSamples; j++) {
      const t = j / SAMPLE_RATE;
      const s =
        Math.sin(2 * Math.PI * baseFreq * t) * 0.5 +
        Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.25 +
        Math.sin(2 * Math.PI * baseFreq * 2.1 * t) * 0.15;
      clink[j] = s * Math.exp(-t * 18) * 0.12;
    }
    const lpClink = lowpass(clink, 3500, SAMPLE_RATE);
    for (let j = 0; j < durSamples && pos + j < n; j++) {
      body[pos + j] += lpClink[j];
    }
  }

  // 偶发杯碟碰撞（双音）
  for (let i = 0; i < 4; i++) {
    const pos = Math.floor(Math.random() * (n - 3000));
    const freqs = [1500 + Math.random() * 800, 2000 + Math.random() * 800];
    for (let f = 0; f < 2; f++) {
      const offset = Math.floor(Math.random() * 0.05 * SAMPLE_RATE);
      const durSamples = Math.floor(0.2 * SAMPLE_RATE);
      for (let j = 0; j < durSamples && pos + offset + j < n; j++) {
        const t = j / SAMPLE_RATE;
        body[pos + offset + j] +=
          Math.sin(2 * Math.PI * freqs[f] * t) * Math.exp(-t * 15) * 0.08;
      }
    }
  }

  body = lowpass(body, 2600, SAMPLE_RATE);
  const max = maxAbs(body) || 1;
  return fadeEdges(body.map((v) => (v / max) * 0.24), 50, SAMPLE_RATE);
}

function genWind(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  // 用棕噪音+低通模拟柔和风声，不用白噪声
  const noise = brownNoise(n);
  const lp = lowpass(noise, 800, SAMPLE_RATE);
  // 缓慢幅度调制，模拟风的强弱变化
  const out = slowModulate(lp, 0.07, 0.45, SAMPLE_RATE);
  const max = maxAbs(out) || 1;
  return fadeEdges(out.map((v) => (v / max) * 0.28), 60, SAMPLE_RATE);
}

function genTibet(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const out = new Float32Array(n);
  // 颂钵：基频 180Hz + 泛音，缓慢幅度呼吸
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const breath = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.12 * t);
    out[i] =
      (Math.sin(2 * Math.PI * 180 * t) * 0.5 +
        Math.sin(2 * Math.PI * 360 * t) * 0.25 +
        Math.sin(2 * Math.PI * 540 * t) * 0.15) *
      breath;
  }
  return fadeEdges(out.map((v) => v * 0.28), 60, SAMPLE_RATE);
}

function genTap(): Float32Array {
  const n = SAMPLE_RATE * AMBIENT_SEC;
  const noise = softNoise(n, 2000);
  const out = new Float32Array(n);
  const tapInterval = SAMPLE_RATE * 0.8;
  for (let start = 0; start < n; start += tapInterval) {
    for (let j = 0; j < 600 && start + j < n; j++) {
      const t = j / SAMPLE_RATE;
      out[start + j] +=
        (Math.sin(2 * Math.PI * 110 * t) + noise[start + j] * 0.4) *
        Math.exp(-t * 50) *
        0.4;
    }
  }
  return fadeEdges(out.map((v) => v * 0.5), 30, SAMPLE_RATE);
}

/* ---------------- 触发音效（1-2s，非循环） ---------------- */
function genBowl(): Float32Array {
  const n = SAMPLE_RATE * 1.8;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] =
      (Math.sin(2 * Math.PI * 174 * t) * 0.5 +
        Math.sin(2 * Math.PI * 348 * t) * 0.3 +
        Math.sin(2 * Math.PI * 522 * t) * 0.2) *
      Math.exp(-t * 0.8) * 0.6;
  }
  return out;
}

function genBell(): Float32Array {
  const n = SAMPLE_RATE * 1.5;
  const out = new Float32Array(n);
  const freqs = [880, 1320, 1760, 2200];
  const gains = [0.4, 0.3, 0.2, 0.1];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (let k = 0; k < freqs.length; k++) {
      s += Math.sin(2 * Math.PI * freqs[k] * t) * gains[k];
    }
    out[i] = s * Math.exp(-t * 2.5) * 0.5;
  }
  return out;
}

function genChime(): Float32Array {
  const n = SAMPLE_RATE * 2;
  const out = new Float32Array(n);
  const freqs = [523, 784, 1046, 1318];
  const gains = [0.45, 0.3, 0.15, 0.1];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (let k = 0; k < freqs.length; k++) {
      s += Math.sin(2 * Math.PI * freqs[k] * t) * gains[k];
    }
    out[i] = s * Math.exp(-t * 1.8) * 0.5;
  }
  return out;
}

function genDrop(): Float32Array {
  // 真实水滴：撞击噪声 + 气泡谐振（频率快速下降后稳定，强指数衰减）
  const n = SAMPLE_RATE * 0.45;
  const out = new Float32Array(n);

  // Phase 1：撞击声 —— 极短宽带噪声 burst，模拟水滴砸到水面
  const impactLen = Math.floor(0.012 * SAMPLE_RATE);
  const impact = new Float32Array(impactLen);
  for (let i = 0; i < impactLen; i++) {
    const t = i / SAMPLE_RATE;
    impact[i] = (Math.random() * 2 - 1) * Math.exp(-t * 500) * 0.7;
  }
  const lpImpact = lowpass(impact, 2500, SAMPLE_RATE);
  for (let i = 0; i < impactLen; i++) out[i] = lpImpact[i];

  // Phase 2：气泡共鸣 —— 频率从 ~2200Hz 快速降到 ~850Hz 后稳定，强衰减
  for (let i = impactLen; i < n; i++) {
    const t = (i - impactLen) / SAMPLE_RATE;
    const freq = 850 + 1350 * Math.exp(-t * 55);
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.8 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
    out[i] = s * Math.exp(-t * 7) * 0.55;
  }

  const lp = lowpass(out, 4000, SAMPLE_RATE);
  const max = maxAbs(lp) || 1;
  return lp.map((v) => (v / max) * 0.5);
}

function genOm(): Float32Array {
  const n = SAMPLE_RATE * 2;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] =
      (Math.sin(2 * Math.PI * 110 * t) * 0.5 +
        Math.sin(2 * Math.PI * 220 * t) * 0.3 +
        Math.sin(2 * Math.PI * 330 * t) * 0.2) *
      (t < 0.3 ? t / 0.3 : 1) *
      (t > n / SAMPLE_RATE - 0.4 ? (n / SAMPLE_RATE - t) / 0.4 : 1) * 0.5;
  }
  return out;
}

function genFlute(): Float32Array {
  // 竹笛（dizi）：基频 + 偶次谐波（膜鸣亮感）+ 气息噪声 + 慢起音 + 颤音
  const n = SAMPLE_RATE * 1.8;
  const baseFreq = 523.25; // C5
  const tone = new Float32Array(n);

  // 谐波结构：竹笛以基频 + 偶次谐波为主，笛膜带来明亮泛音
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const pitchVibrato = 1 + 0.008 * Math.sin(2 * Math.PI * 5.5 * t);
    const ampVibrato = 1 + 0.05 * Math.sin(2 * Math.PI * 5.5 * t + 0.5);
    const f = baseFreq * pitchVibrato;
    tone[i] =
      (Math.sin(2 * Math.PI * f * t) * 0.55 +
        Math.sin(2 * Math.PI * f * 2 * t) * 0.18 +
        Math.sin(2 * Math.PI * f * 3 * t) * 0.08 +
        Math.sin(2 * Math.PI * f * 4 * t) * 0.04) *
      ampVibrato;
  }

  // 气息噪声：带通白噪模拟竹笛气声（起音时更浓）
  const noise = whiteNoise(n);
  const breath = bandpass(noise, 800, 3500, SAMPLE_RATE);

  // 包络：慢起音 0.3s → 持续 → 释音 0.3s
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1;
    if (t < 0.3) env = t / 0.3;
    else if (t > 1.5) env = Math.max(0, (1.8 - t) / 0.3);
    const breathGain = (t < 0.15 ? 0.4 : 0.1) * env;
    out[i] = (tone[i] * env + breath[i] * breathGain) * 0.5;
  }

  const max = maxAbs(out) || 1;
  return out.map((v) => (v / max) * 0.5);
}

/* ---------------- 分发 ---------------- */
function generate(type: SoundType): Float32Array {
  switch (type) {
    case "rain": return genRain();
    case "fire": return genFire();
    case "whisper": return genWhisper();
    case "ocean": return genOcean();
    case "forest": return genForest();
    case "thunder": return genThunder();
    case "white-noise": return genWhiteNoise();
    case "pink-noise": return genPinkNoise();
    case "cafe": return genCafe();
    case "wind": return genWind();
    case "tibet": return genTibet();
    case "tap": return genTap();
    case "bowl": return genBowl();
    case "bell": return genBell();
    case "chime": return genChime();
    case "drop": return genDrop();
    case "om": return genOm();
    case "flute": return genFlute();
    default: return genWhiteNoise();
  }
}
