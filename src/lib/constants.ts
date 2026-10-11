import type {
  MoodEntry,
  SceneEntry,
  Track,
  VideoItem,
  GoodnightMessage,
  TriggerSound,
} from "@/types";

/**
 * 主导航项（移动端底部导航 / 桌面端侧边）
 */
export const NAV_ITEMS = [
  { id: "home", label: "首页", href: "/", icon: "Home" },
  { id: "sounds", label: "声音库", href: "/sounds", icon: "Music" },
  { id: "videos", label: "视频库", href: "/videos", icon: "Video" },
  { id: "community", label: "晚安社区", href: "/community", icon: "MessageCircle" },
  { id: "profile", label: "我的", href: "/profile", icon: "User" },
] as const;

/**
 * 情绪入口
 */
export const MOOD_ENTRIES: MoodEntry[] = [
  { id: "anxious", label: "有点焦虑", emoji: "🌧️", tagline: "雨声慢慢落下" },
  { id: "tired", label: "疲惫不堪", emoji: "🔥", tagline: "炉火暖一暖" },
  { id: "overwhelmed", label: "思绪纷乱", emoji: "🌊", tagline: "海浪带走杂念" },
  { id: "calm", label: "想放空", emoji: "🌙", tagline: "夜色轻轻包裹" },
];

/**
 * 场景入口
 */
export const SCENE_ENTRIES: SceneEntry[] = [
  {
    id: "rain",
    label: "雨夜窗边",
    emoji: "🌧️",
    gradient: "from-[#4a423c] to-[#3a342f]",
    route: "/videos/v-rain",
  },
  {
    id: "fireplace",
    label: "暖炉旁",
    emoji: "🔥",
    gradient: "from-[#5a4636] to-[#3a342f]",
    route: "/videos/v-fire",
  },
  {
    id: "forest",
    label: "森林深处",
    emoji: "🌲",
    gradient: "from-[#3f4636] to-[#2e2a27]",
    route: "/videos/v-forest",
  },
  {
    id: "ocean",
    label: "深夜海岸",
    emoji: "🌊",
    gradient: "from-[#33404a] to-[#2e2a27]",
    route: "/videos/v-ocean",
  },
];

/**
 * 分类列表
 */
export const CATEGORIES = ["全部", "自然", "环境", "ASMR", "冥想", "白噪音"] as const;

/**
 * 声音数据
 * audioUrl 以 "synth:" 前缀标识由 Web Audio 实时合成（与标题匹配的环境音），
 * 无需外部音频文件，亦利于 PWA 离线使用。
 */
export const MOCK_TRACKS: Track[] = [
  {
    id: "t-rain",
    title: "雨夜窗台",
    description: "细密雨声落在玻璃上，适合平复心绪。",
    category: "自然",
    tags: ["雨声", "放松", "助眠"],
    audioUrl: "synth:rain",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-01",
  },
  {
    id: "t-fire",
    title: "壁炉低语",
    description: "柴火噼啪声，温暖包裹感。",
    category: "环境",
    tags: ["炉火", "温暖", "解压"],
    audioUrl: "synth:fire",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-02",
  },
  {
    id: "t-whisper",
    title: "耳边轻语",
    description: "轻柔耳语，ASMR 触发。",
    category: "ASMR",
    tags: ["耳语", "ASMR"],
    audioUrl: "synth:whisper",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-03",
  },
  {
    id: "t-ocean",
    title: "深夜潮汐",
    description: "规律海浪，引导呼吸。",
    category: "自然",
    tags: ["海浪", "冥想"],
    audioUrl: "synth:ocean",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-04",
  },
  {
    id: "t-forest",
    title: "森林清晨",
    description: "鸟鸣与微风穿过树叶。",
    category: "自然",
    tags: ["森林", "鸟鸣", "放松"],
    audioUrl: "synth:forest",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-05",
  },
  {
    id: "t-thunder",
    title: "远雷隆隆",
    description: "远处闷雷，适合深度睡眠。",
    category: "自然",
    tags: ["雷声", "深沉", "助眠"],
    audioUrl: "synth:thunder",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-06",
  },
  {
    id: "t-white",
    title: "纯白噪音",
    description: "屏蔽环境杂音，专注与助眠。",
    category: "白噪音",
    tags: ["白噪音", "专注", "屏蔽"],
    audioUrl: "synth:white-noise",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-07",
  },
  {
    id: "t-tibet",
    title: "颂钵冥想",
    description: "藏钵泛音，进入深度冥想。",
    category: "冥想",
    tags: ["颂钵", "冥想", "疗愈"],
    audioUrl: "synth:tibet",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-08",
  },
  {
    id: "t-tap",
    title: "指节敲击",
    description: "清脆敲击节奏，ASMR 触发。",
    category: "ASMR",
    tags: ["敲击", "ASMR", "触发"],
    audioUrl: "synth:tap",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-09",
  },
  {
    id: "t-cafe",
    title: "深夜咖啡馆",
    description: "低语与杯碟轻响，安心氛围。",
    category: "环境",
    tags: ["咖啡馆", "氛围", "安心"],
    audioUrl: "synth:cafe",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-10",
  },
  {
    id: "t-wind",
    title: "穿堂风",
    description: "微风拂过走廊，轻柔呼吸感。",
    category: "自然",
    tags: ["风声", "轻柔", "呼吸"],
    audioUrl: "synth:wind",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-11",
  },
  {
    id: "t-pink",
    title: "粉噪音",
    description: "柔和频谱，比白噪音更悦耳。",
    category: "白噪音",
    tags: ["粉噪音", "助眠", "柔和"],
    audioUrl: "synth:pink-noise",
    coverUrl: "",
    duration: 0,
    createdAt: "2026-01-12",
  },
];

/**
 * 触发音效（短音效，一键播放）
 * audioUrl 以 "synth:" 前缀标识由 Web Audio 实时合成
 */
export const MOCK_TRIGGERS: TriggerSound[] = [
  {
    id: "tr-bowl",
    title: "颂钵",
    emoji: "🕉️",
    audioUrl: "synth:bowl",
  },
  {
    id: "tr-bell",
    title: "风铃",
    emoji: "🔔",
    audioUrl: "synth:bell",
  },
  {
    id: "tr-chime",
    title: "磬声",
    emoji: "🎐",
    audioUrl: "synth:chime",
  },
  {
    id: "tr-drop",
    title: "水滴",
    emoji: "💧",
    audioUrl: "synth:drop",
  },
  {
    id: "tr-om",
    title: "嗡鸣",
    emoji: "🌀",
    audioUrl: "synth:om",
  },
  {
    id: "tr-flute",
    title: "竹笛",
    emoji: "🎵",
    audioUrl: "synth:flute",
  },
];

/**
 * 视频数据
 * videoUrl 前缀说明：
 *   "synth:"   → Canvas 实时绘制的氛围动画（无外部文件，离线可用）
 *   "embed:"   → 第三方平台 iframe 嵌入地址（B站/YouTube 等）
 *   http(s):// → 本地或远程 MP4 文件
 * coverUrl 用 Tailwind 渐变类表示卡片封面背景
 * sourceType: embed | file | synth
 */
export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "v-breath",
    title: "4-7-8 呼吸引导",
    description: "跟着圆点慢慢呼吸，平复心绪。",
    category: "呼吸引导",
    tags: ["呼吸", "冥想"],
    videoUrl: "synth:breathing",
    coverUrl: "from-sage/30 to-clay/20",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 1280,
    createdAt: "2026-01-01",
  },
  {
    id: "v-night",
    title: "深夜城市漫游",
    description: "霓虹空镜，安静的城市夜色。",
    category: "氛围",
    tags: ["城市", "夜景"],
    videoUrl: "synth:night-city",
    coverUrl: "from-[#3a3445] to-[#2a2530]",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 960,
    createdAt: "2026-01-02",
  },
  {
    id: "v-rain",
    title: "雨夜列车",
    description: "车窗外的雨，规律又安心。",
    category: "氛围",
    tags: ["雨声", "列车"],
    videoUrl: "synth:rain",
    coverUrl: "from-[#3a424a] to-[#2a3038]",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 2150,
    createdAt: "2026-01-03",
  },
  {
    id: "v-ocean",
    title: "深海微光",
    description: "缓慢海浪与远处灯塔。",
    category: "自然",
    tags: ["海浪", "夜景"],
    videoUrl: "synth:ocean",
    coverUrl: "from-[#2e3a4a] to-[#1e2836]",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 1780,
    createdAt: "2026-01-04",
  },
  {
    id: "v-forest",
    title: "雾中森林",
    description: "晨雾穿过林间，安静空灵。",
    category: "自然",
    tags: ["森林", "雾"],
    videoUrl: "synth:forest",
    coverUrl: "from-[#354035] to-[#252e25]",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 1340,
    createdAt: "2026-01-05",
  },
  {
    id: "v-fire",
    title: "篝火夜话",
    description: "跳动的火光，温暖包裹。",
    category: "氛围",
    tags: ["篝火", "温暖"],
    videoUrl: "synth:fire",
    coverUrl: "from-[#4a3528] to-[#35251c]",
    sourceType: "synth",
    duration: 0,
    author: "音眠舱",
    views: 3020,
    createdAt: "2026-01-06",
  },
];

/** 视频分类 */
export const VIDEO_CATEGORIES = ["全部", "呼吸引导", "氛围", "自然"] as const;

/**
 * 占位晚安墙消息
 */
export const MOCK_GOODNIGHT: GoodnightMessage[] = [
  {
    id: "g1",
    content: "今天也辛苦了，慢慢睡吧。",
    nickname: "匿名",
    status: "approved",
    createdAt: "2026-10-10 23:40",
  },
  {
    id: "g2",
    content: "雨声真好，像被世界轻轻抱住。",
    nickname: "夜行者",
    status: "approved",
    createdAt: "2026-10-10 23:52",
  },
  {
    id: "g3",
    content: "明天会更好的，晚安。",
    nickname: "小星星",
    status: "approved",
    createdAt: "2026-10-11 00:05",
  },
  {
    id: "g4",
    content: "希望梦里有满船星河。",
    nickname: "追光者",
    status: "pending",
    createdAt: "2026-10-11 00:18",
  },
];

/**
 * 定时关闭可选时长（分钟）
 */
export const SLEEP_TIMER_OPTIONS = [15, 30, 60, 90] as const;
