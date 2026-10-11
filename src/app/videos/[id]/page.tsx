import { MOCK_VIDEOS } from "@/lib/constants";
import { VideoDetailClient } from "@/components/videos/VideoDetailClient";

/** 静态导出：生成所有视频详情页 */
export function generateStaticParams() {
  return MOCK_VIDEOS.map((v) => ({ id: v.id }));
}

export default function VideoDetailPage() {
  return <VideoDetailClient />;
}
