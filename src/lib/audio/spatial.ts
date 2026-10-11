import { audioEngine } from "./engine";

/**
 * 8D 环绕控制器
 * - 通过缓慢振荡立体声声相（-1~1）模拟环绕效果
 * - 不耦合主播放链路：仅调用 engine.setPan，失败静默降级（见经验 100014984）
 * - 需要引擎以 Web Audio 模式（html5:false）加载才能生效
 */
class SpatialController {
  private timer: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  /** 完整环绕一周时长（秒） */
  private readonly CYCLE_SECONDS = 16;
  private readonly TICK_MS = 80;

  /** 开启 8D：启动声相振荡 */
  enable(): void {
    if (this.timer) return;
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      // 正弦波：0→1→0→-1→0，模拟头部环绕
      const pan = Math.sin((elapsed / this.CYCLE_SECONDS) * Math.PI * 2);
      audioEngine.setPan(pan);
    }, this.TICK_MS);
  }

  /** 关闭 8D：停止振荡并归中 */
  disable(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    audioEngine.setPan(0);
  }

  isEnabled(): boolean {
    return this.timer !== null;
  }
}

/** 空间控制器单例 */
export const spatialController = new SpatialController();
