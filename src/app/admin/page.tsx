"use client";

import { useEffect, useState } from "react";
import {
  Music,
  Video,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Lock,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Track, VideoItem, GoodnightMessage } from "@/types";

const ADMIN_PWD_KEY = "ymc-admin-pwd";

/** 带鉴权头的 fetch；401 时清除登录态 */
async function adminFetch(url: string, init: RequestInit = {}) {
  const pwd = localStorage.getItem(ADMIN_PWD_KEY) ?? "";
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "x-admin-password": pwd,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem(ADMIN_PWD_KEY);
    window.location.reload();
  }
  return res;
}

type TabKey = "sounds" | "videos" | "goodnight";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "sounds", label: "声音", icon: <Music className="h-4 w-4" /> },
  { key: "videos", label: "视频", icon: <Video className="h-4 w-4" /> },
  { key: "goodnight", label: "晚安墙", icon: <MessageSquare className="h-4 w-4" /> },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // 启动时校验已保存的密码
  useEffect(() => {
    const pwd = localStorage.getItem(ADMIN_PWD_KEY);
    if (!pwd) {
      setChecking(false);
      return;
    }
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "x-admin-password": pwd },
    })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else localStorage.removeItem(ADMIN_PWD_KEY);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="py-6 text-center text-sm text-text-muted">校验中…</div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminContent
      onLogout={() => {
        localStorage.removeItem(ADMIN_PWD_KEY);
        setAuthed(false);
      }}
    />
  );
}

/* ---------------- 登录表单 ---------------- */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "x-admin-password": pwd },
    });
    setLoading(false);
    if (res.ok) {
      localStorage.setItem(ADMIN_PWD_KEY, pwd);
      onSuccess();
    } else {
      setErr("密码错误，请重试");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-6">
      <Card className="w-full max-w-sm space-y-4 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay/15">
            <Lock className="h-6 w-6 text-clay" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            管理后台登录
          </h1>
          <p className="text-center text-xs text-text-muted">
            请输入管理员密码以访问后台
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="管理员密码"
            autoFocus
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading || !pwd}
            className="w-full rounded-full bg-clay py-2 text-sm font-medium text-bg-deep disabled:opacity-50"
          >
            {loading ? "校验中…" : "登录"}
          </button>
        </form>
      </Card>
    </div>
  );
}

/* ---------------- 后台主体 ---------------- */
function AdminContent({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("sounds");
  const [sounds, setSounds] = useState<Track[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [goodnight, setGoodnight] = useState<GoodnightMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/sounds").then((r) => r.json()),
      fetch("/api/admin/videos").then((r) => r.json()),
      fetch("/api/admin/goodnight").then((r) => r.json()),
    ]).then(([s, v, g]) => {
      setSounds(s.data);
      setVideos(v.data);
      setGoodnight(g.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            管理后台
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            管理声音、视频内容，审核晚安墙留言。
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
        >
          <LogOut className="h-3.5 w-3.5" /> 退出
        </button>
      </div>

      {/* Tab */}
      <div className="mt-5 flex gap-1 rounded-full bg-bg-soft/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm transition-colors ${
              tab === t.key ? "bg-clay text-bg-deep" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="text-center text-sm text-text-muted">加载中…</p>
        ) : (
          <>
            {tab === "sounds" && (
              <SoundsPanel sounds={sounds} setSounds={setSounds} />
            )}
            {tab === "videos" && (
              <VideosPanel videos={videos} setVideos={setVideos} />
            )}
            {tab === "goodnight" && (
              <GoodnightPanel goodnight={goodnight} setGoodnight={setGoodnight} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- 声音管理 ---------------- */
function SoundsPanel({
  sounds,
  setSounds,
}: {
  sounds: Track[];
  setSounds: React.Dispatch<React.SetStateAction<Track[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("自然");
  const [audioUrl, setAudioUrl] = useState("");

  const handleAdd = async () => {
    if (!title.trim() || !audioUrl.trim()) return;
    const res = await adminFetch("/api/admin/sounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, audioUrl }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setSounds([data, ...sounds]);
      setTitle("");
      setAudioUrl("");
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/admin/sounds/${id}`, { method: "DELETE" });
    setSounds(sounds.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-1.5 rounded-full bg-clay px-4 py-1.5 text-sm text-bg-deep hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> 新增声音
      </button>

      {showForm && (
        <Card className="space-y-3 p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="分类"
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          <input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="音频 URL"
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          <button
            onClick={handleAdd}
            className="rounded-full bg-clay px-4 py-1.5 text-sm text-bg-deep"
          >
            保存
          </button>
        </Card>
      )}

      {sounds.map((s) => (
        <Card key={s.id} className="flex items-center gap-3 p-3">
          <Music className="h-5 w-5 shrink-0 text-clay" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text-primary">{s.title}</p>
            <p className="truncate text-[11px] text-text-muted">
              {s.category} · {s.audioUrl.slice(0, 40)}
            </p>
          </div>
          <button
            onClick={() => handleDelete(s.id)}
            className="text-text-muted hover:text-clay"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- 视频管理 ---------------- */
function VideosPanel({
  videos,
  setVideos,
}: {
  videos: VideoItem[];
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleAdd = async () => {
    if (!title.trim() || !videoUrl.trim()) return;
    const res = await adminFetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, videoUrl }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setVideos([data, ...videos]);
      setTitle("");
      setVideoUrl("");
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    setVideos(videos.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-1.5 rounded-full bg-clay px-4 py-1.5 text-sm text-bg-deep hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> 新增视频
      </button>

      {showForm && (
        <Card className="space-y-3 p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="视频 URL"
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-clay"
          />
          <button
            onClick={handleAdd}
            className="rounded-full bg-clay px-4 py-1.5 text-sm text-bg-deep"
          >
            保存
          </button>
        </Card>
      )}

      {videos.map((v) => (
        <Card key={v.id} className="flex items-center gap-3 p-3">
          <Video className="h-5 w-5 shrink-0 text-sage" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text-primary">{v.title}</p>
            <p className="truncate text-[11px] text-text-muted">
              {v.category} · {v.videoUrl.slice(0, 40)}
            </p>
          </div>
          <button
            onClick={() => handleDelete(v.id)}
            className="text-text-muted hover:text-clay"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- 晚安墙审核 ---------------- */
function GoodnightPanel({
  goodnight,
  setGoodnight,
}: {
  goodnight: GoodnightMessage[];
  setGoodnight: React.Dispatch<React.SetStateAction<GoodnightMessage[]>>;
}) {
  const moderate = async (id: string, status: GoodnightMessage["status"]) => {
    await adminFetch(`/api/admin/goodnight/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setGoodnight((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    );
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/admin/goodnight/${id}`, { method: "DELETE" });
    setGoodnight((prev) => prev.filter((m) => m.id !== id));
  };

  const statusBadge = (s: GoodnightMessage["status"]) => {
    const map: Record<string, string> = {
      approved: "bg-sage/15 text-sage",
      pending: "bg-clay/15 text-clay",
      hidden: "bg-red-500/15 text-red-400",
    };
    const label: Record<string, string> = {
      approved: "已通过",
      pending: "待审核",
      hidden: "已隐藏",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] ${map[s]}`}>
        {label[s]}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {goodnight.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex-1 text-sm text-text-primary">“{m.content}”</p>
            {statusBadge(m.status)}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-muted">
              — {m.nickname} · {m.createdAt}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => moderate(m.id, "approved")}
                className="flex items-center gap-1 rounded-full bg-sage/15 px-3 py-1 text-xs text-sage hover:bg-sage/25"
              >
                <Check className="h-3 w-3" /> 通过
              </button>
              <button
                onClick={() => moderate(m.id, "hidden")}
                className="flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-400 hover:bg-red-500/25"
              >
                <X className="h-3 w-3" /> 隐藏
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-text-muted hover:text-clay"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
