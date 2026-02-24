import { notFound } from "next/navigation";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: videoId } = await params;

    if (!videoId) {
        return notFound();
    }

    // ToS compliant official iframe embed
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative">
                <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="YouTube Video Player"
                ></iframe>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold mb-2">安全に動画を楽しもう</h1>
                <p className="text-muted-foreground">
                    この動画はKidsTubeの安全基準を満たしたチャンネルからのみピックアップされています。<br />
                    無関係な動画へのリンク（関連動画）は制限されています。
                </p>
            </div>
        </div>
    );
}
