import { Howl, Howler } from "howler";

/**
 * 移动端音频上下文解锁
 * iOS Safari / Android Chrome 的 AudioContext 默认 suspended，
 * 必须在用户手势（click/touchstart/pointerdown）中显式 resume 才能播放。
 * Howler 的 autoUnlock 不一定覆盖所有场景，这里做一次全局兜底。
 */
let audioUnlocked = false;
export function unlockAudio(): void {
  if (audioUnlocked) return;
  try {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        audioUnlocked = true;
      }).catch(() => {});
    } else {
      audioUnlocked = true;
    }
  } catch {
    /* Howler.ctx 可能未就绪 */
  }
}

/**
 * 检测是否为微信内置浏览器（X5 内核）
 * 微信对 Web Audio API 支持有限，合成音需用 HTML5 Audio 模式才能播放
 */
export function isWeChat(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

// 在首次用户交互时解锁音频上下文
if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudio();
    if (audioUnlocked) {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    }
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("click", unlock, { passive: true });
}

/**
 * 播放引擎事件类型
 */
export type EngineEvent =
  | "play"
  | "pause"
  | "stop"
  | "end"
  | "seek"
  | "fade"
  | "load"
  | "error";

/** 引擎事件回调（无参，Howler 的 soundId 由内部消化） */
export type EngineCallback = () => void;

/**
 * 统一播放引擎接口
 * 上层（store/UI）只依赖此接口，不直接触碰 Howler 实现细节
 * 便于后续替换内核（如 Web Audio 3D/8D）或增加降级分支
 */
export interface IAudioEngine {
  load(src: string, options?: { loop?: boolean; html5?: boolean }): void;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  seek(seconds: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  setVolume(v: number): void;
  getVolume(): number;
  fade(from: number, to: number, durationMs: number): void;
  /** 设置立体声声相（-1 左 ~ 1 右），用于 8D 模拟；html5 模式下可能无效果 */
  setPan(pan: number): void;
  on(event: EngineEvent, cb: EngineCallback): void;
  off(event: EngineEvent, cb: EngineCallback): void;
  destroy(): void;
}

/**
 * Howler 播放引擎实现
 * - 使用 html5: true，适配长音频、跨域播放与 Media Session 锁屏控制
 * - 不开启 Web Audio 分析链路，避免 CORS 污染与重复建节点（见经验 100014984）
 */
export class AudioEngine implements IAudioEngine {
  private howl: Howl | null = null;
  private listeners: Map<EngineEvent, Set<EngineCallback>> = new Map();

  /**
   * 加载新音源（卸载旧实例）
   * - loop: 环境音循环
   * - html5: true 用 HTMLAudioElement（长音频/跨域/锁屏）；false 用 Web Audio（支持声相/8D）
   * - blob URL（合成音）需显式指定 format，否则 Howler 无法从扩展名识别格式
   */
  load(src: string, options?: { loop?: boolean; html5?: boolean }): void {
    this.destroy();
    const isBlob = src.startsWith("blob:");
    const wechat = isWeChat();
    // 合成音（blob URL）的模式选择：
    // - 微信(X5内核)：用 html5:true，Web Audio 在微信中不可靠
    // - 其他浏览器：用 html5:false(Web Audio)，避免 html5 自动播放策略导致 play() 失败
    const html5 = isBlob ? wechat : (options?.html5 ?? true);
    this.howl = new Howl({
      src: [src],
      html5,
      preload: true,
      loop: options?.loop ?? false,
      volume: 0, // 初始静音，交由淡入控制
      ...(isBlob ? { format: ["wav"] } : {}),
    });
    this.bindHowlEvents();
    this.emit("load");
  }

  /** 绑定 Howler 事件并转发到统一事件总线 */
  private bindHowlEvents(): void {
    if (!this.howl) return;
    const forward = (event: EngineEvent) => () => this.emit(event);
    this.howl.on("play", forward("play"));
    this.howl.on("pause", forward("pause"));
    this.howl.on("stop", forward("stop"));
    this.howl.on("end", forward("end"));
    this.howl.on("seek", forward("seek"));
    this.howl.on("fade", forward("fade"));
    this.howl.on("loaderror", () => this.emit("error"));
    this.howl.on("playerror", () => this.emit("error"));
  }

  /** 播放；返回 Promise，reject 表示被浏览器策略拦截（如 autoplay） */
  play(): Promise<void> {
    // 移动端：先尝试恢复 AudioContext（用户手势触发时有效）
    unlockAudio();
    return new Promise((resolve, reject) => {
      if (!this.howl) {
        reject(new Error("AudioEngine: no source loaded"));
        return;
      }
      try {
        const id = this.howl.play();
        // Howler play 事件触发视为真实播放开始（经验 100007193：用真实播放态）
        const onPlay = () => {
          this.howl?.off("play", onPlay, id);
          resolve();
        };
        this.howl.on("play", onPlay, id);
        // 兜底：若 playerror 则 reject
        const onError = () => {
          this.howl?.off("playerror", onError, id);
          reject(new Error("AudioEngine: play rejected by browser"));
        };
        this.howl.on("playerror", onError, id);
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  pause(): void {
    this.howl?.pause();
  }

  stop(): void {
    this.howl?.stop();
  }

  seek(seconds: number): void {
    if (!this.howl) return;
    this.howl.seek(seconds);
  }

  getCurrentTime(): number {
    if (!this.howl) return 0;
    const t = this.howl.seek();
    return typeof t === "number" ? t : 0;
  }

  getDuration(): number {
    if (!this.howl) return 0;
    return this.howl.duration() || 0;
  }

  isPlaying(): boolean {
    return this.howl?.playing() ?? false;
  }

  setVolume(v: number): void {
    this.howl?.volume(v);
  }

  getVolume(): number {
    return this.howl?.volume() ?? 0;
  }

  /** 音量渐变（淡入/淡出/音量调节） */
  fade(from: number, to: number, durationMs: number): void {
    this.howl?.fade(from, to, durationMs);
  }

  /**
   * 设置立体声声相（-1 最左 ~ 1 最右），用于 8D 环绕模拟
   * 仅在 Web Audio 模式（html5:false）下生效；html5 模式为安全 no-op
   */
  setPan(pan: number): void {
    try {
      this.howl?.stereo(Math.max(-1, Math.min(1, pan)));
    } catch {
      /* 不支持声相时静默降级，不阻断播放（见经验 100014984） */
    }
  }

  on(event: EngineEvent, cb: EngineCallback): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }

  off(event: EngineEvent, cb: EngineCallback): void {
    this.listeners.get(event)?.delete(cb);
  }

  private emit(event: EngineEvent): void {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb();
      } catch {
        /* 单个监听器错误不影响其他 */
      }
    });
  }

  /** 销毁当前 Howl 实例，释放资源 */
  destroy(): void {
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
  }
}

/** 引擎单例：全局唯一，避免重复创建音频上下文 */
export const audioEngine = new AudioEngine();
