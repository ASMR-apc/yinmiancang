import { Howl } from "howler";
import { getSynthUrl, isSynthUrl } from "./synthesizer";
import { isWeChat, unlockAudio } from "./engine";

/** 解析混音图层 URL */
function resolveSrc(src: string): string {
  return isSynthUrl(src) ? getSynthUrl(src.slice("synth:".length) as never) : src;
}

/**
 * 多轨混音引擎
 * - 管理多条循环背景音图层（雨声/炉火/海浪等环境音）
 * - 每条图层独立 Howl 实例、独立音量、同步播放/暂停
 * - 不开启 Web Audio 分析，仅纯播放（见经验 100014984）
 */
export class MixEngine {
  private layers: Map<string, Howl> = new Map();
  private isPlaying = false;

  /** 添加一条背景图层并立即按音量播放 */
  addLayer(trackId: string, src: string, volume: number): void {
    if (this.layers.has(trackId)) return;
    const realSrc = resolveSrc(src);
    const isBlob = realSrc.startsWith("blob:");
    const howl = new Howl({
      src: [realSrc],
      // 微信用 html5 模式，其他用 Web Audio
      html5: isBlob ? isWeChat() : true,
      loop: true,
      preload: true,
      volume,
      ...(isBlob ? { format: ["wav"] } : {}),
    });
    this.layers.set(trackId, howl);
    if (this.isPlaying) {
      howl.play();
    }
  }

  /** 移除图层 */
  removeLayer(trackId: string): void {
    const howl = this.layers.get(trackId);
    if (howl) {
      howl.stop();
      howl.unload();
      this.layers.delete(trackId);
    }
  }

  /** 设置某图层音量（带 300ms 渐变，避免突变） */
  setLayerVolume(trackId: string, volume: number): void {
    const howl = this.layers.get(trackId);
    if (howl) {
      howl.fade(howl.volume(), volume, 300);
    }
  }

  hasLayer(trackId: string): boolean {
    return this.layers.has(trackId);
  }

  /** 播放所有图层 */
  playAll(): void {
    unlockAudio();
    this.isPlaying = true;
    this.layers.forEach((howl) => {
      if (!howl.playing()) howl.play();
    });
  }

  /** 暂停所有图层 */
  pauseAll(): void {
    this.isPlaying = false;
    this.layers.forEach((howl) => howl.pause());
  }

  /** 停止并清空所有图层 */
  stopAll(): void {
    this.isPlaying = false;
    this.layers.forEach((howl) => {
      howl.stop();
      howl.unload();
    });
    this.layers.clear();
  }
}

/** 混音引擎单例 */
export const mixEngine = new MixEngine();
