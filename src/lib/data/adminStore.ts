import { MOCK_TRACKS, MOCK_VIDEOS, MOCK_GOODNIGHT } from "@/lib/constants";
import type { Track, VideoItem, GoodnightMessage } from "@/types";

/**
 * 管理后台内存数据层
 * - 当前用内存数组承载，初始值来自 mock 常量
 * - 接入 Supabase 后，此处可替换为 supabaseServer 的表查询
 *   （例如：sounds 表、videos 表、goodnight_messages 表）
 */

let sounds: Track[] = [...MOCK_TRACKS];
let videos: VideoItem[] = [...MOCK_VIDEOS];
let goodnight: GoodnightMessage[] = [...MOCK_GOODNIGHT];

export const adminStore = {
  // 声音
  getSounds: () => sounds,
  addSound: (t: Track) => {
    sounds = [t, ...sounds];
    return t;
  },
  updateSound: (id: string, patch: Partial<Track>) => {
    sounds = sounds.map((s) => (s.id === id ? { ...s, ...patch } : s));
    return sounds.find((s) => s.id === id) ?? null;
  },
  deleteSound: (id: string) => {
    sounds = sounds.filter((s) => s.id !== id);
  },

  // 视频
  getVideos: () => videos,
  addVideo: (v: VideoItem) => {
    videos = [v, ...videos];
    return v;
  },
  updateVideo: (id: string, patch: Partial<VideoItem>) => {
    videos = videos.map((v) => (v.id === id ? { ...v, ...patch } : v));
    return videos.find((v) => v.id === id) ?? null;
  },
  deleteVideo: (id: string) => {
    videos = videos.filter((v) => v.id !== id);
  },

  // 晚安墙
  getGoodnight: () => goodnight,
  updateGoodnightStatus: (id: string, status: GoodnightMessage["status"]) => {
    goodnight = goodnight.map((m) => (m.id === id ? { ...m, status } : m));
    return goodnight.find((m) => m.id === id) ?? null;
  },
  deleteGoodnight: (id: string) => {
    goodnight = goodnight.filter((m) => m.id !== id);
  },
};
