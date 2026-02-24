export const dynamic = "force-dynamic";

import { api } from "@/lib/api";
import { VideoCard } from "@/components/VideoCard";

export default async function Home() {
  let videos = [];
  try {
    const res = await api.get("/videos/");
    videos = res.data;
  } catch (error: any) {
    console.error("Failed to fetch videos from API:", error?.message);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          おすすめの動画
        </h1>
        <p className="text-muted-foreground mt-2">
          安心・安全に楽しめる最新の動画をピックアップ！
        </p>
      </header>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">動画がありません</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            表示できる動画が現在ありません。管理者がホワイトリストにチャンネルを追加し、動画データを取得するまでお待ちください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video: any) => (
            <VideoCard
              key={video.id}
              id={video.id}
              sourceId={video.source_id}
              externalContentId={video.external_content_id}
              title={video.title}
              url={video.url}
              thumbnailUrl={video.thumbnail_url}
              publishedAt={video.published_at}
              metrics={video.metrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
