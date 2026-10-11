/**
 * 全局类型定义
 */

// 音频曲目
export interface Track {
  id: string;
  title: string;
  description?: string;
  category: string; // 分类：白噪音 / ASMR / 冥想 / 自然 / ...
  tags: string[];
  audioUrl: string; // 真实播放地址（Phase 8 接 Supabase Storage）
  coverUrl: string;
  duration: number; // 秒
  createdAt: string;
}

// 触发音效（短音效，一次性播放）
export interface TriggerSound {
  id: string;
  title: string;
  emoji: string;
  audioUrl: string;
}

// 视频（对应 videos 表结构）
export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  videoUrl: string; // synth: 前缀为 Canvas 动画；http(s) 为 MP4/嵌入地址
  coverUrl: string; // Tailwind 渐变类或图片 URL
  sourceType: "embed" | "file" | "synth"; // 嵌入 iframe / 本地 MP4 / Canvas 合成
  duration: number; // 秒（0 表示循环动画无固定时长）
  author?: string;
  views?: number;
  createdAt: string;
}

// 混音配方（保存到本地）
export interface MixFormula {
  id: string;
  name: string;
  tracks: { trackId: string; volume: number }[]; // 多轨音量 0-1
  createdAt: number;
}

// 晚安墙消息
export interface GoodnightMessage {
  id: string;
  content: string;
  nickname: string;
  status: "pending" | "approved" | "hidden";
  createdAt: string;
}

// 呼吸引导模式
export type BreathingPattern = "478" | "box";

// 情绪入口
export interface MoodEntry {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
}

// 场景入口
export interface SceneEntry {
  id: string;
  label: string;
  emoji: string;
  gradient: string; // Tailwind 渐变类
  route: string;    // 点击后跳转的路由
}
