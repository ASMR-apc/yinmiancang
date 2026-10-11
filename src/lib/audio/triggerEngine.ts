import { Howl } from "howler";
import { getSynthUrl, isSynthUrl } from "./synthesizer";
import { unlockAudio, isWeChat } from "./engine";

/** 解析触发音 URL */
function resolveSrc(src: string): string {
  return isSynthUrl(src) ? getSynthUrl(src.slice("synth:".length) as never) : src;
}

/**
 * 触发音效引擎
 * - 用于短音效（颂钵、风铃、铃响等），点击即播、可叠加
 * - 与主播放器/混音引擎解耦，独立运行
 * - 用 HTMLAudioElement 模式避免跨域限制（见经验 100014984）
 */
class TriggerEngine {
  private cache: Map<string, Howl> = new Map();

  /** 播放指定短音效，重复点击会从头重播 */
  play(src: string): void {
    unlockAudio();
    const realSrc = resolveSrc(src);
    let howl = this.cache.get(realSrc);
    if (!howl) {
      const isBlob = realSrc.startsWith("blob:");
      howl = new Howl({
        src: [realSrc],
        // 微信用 html5 模式，其他用 Web Audio
        html5: isBlob ? isWeChat() : true,
        loop: false,
        volume: 0.6,
        ...(isBlob ? { format: ["wav"] } : {}),
      });
      this.cache.set(realSrc, howl);
    }
    // 从头重播，允许叠加
    howl.stop();
    howl.play();
  }

  /** 停止所有正在播放的触发音 */
  stopAll(): void {
    this.cache.forEach((howl) => howl.stop());
  }

  /** 预加载一组音效 */
  preload(srcs: string[]): void {
    srcs.forEach((src) => {
      const realSrc = resolveSrc(src);
      if (!this.cache.has(realSrc)) {
        const isBlob = realSrc.startsWith("blob:");
        const howl = new Howl({
          src: [realSrc],
          html5: isBlob ? isWeChat() : true,
          loop: false,
          volume: 0.6,
          ...(isBlob ? { format: ["wav"] } : {}),
        });
        this.cache.set(realSrc, howl);
      }
    });
  }
}

export const triggerEngine = new TriggerEngine();
