"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { VideoCard } from "@/components/VideoCard";

const CATEGORIES = [
    { id: "all", label: "すべて" },
    { id: "10", label: "おんがく" },
    { id: "24", label: "エンタメ" },
    { id: "27", label: "まなび" },
    { id: "28", label: "かがく" },
    { id: "17", label: "スポーツ" },
];

export default function ExplorePage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            setIsLoading(true);
            try {
                // In a real app, the API should filter by content.source.category
                // For now, we simulate by fetching all and filtering client-side if needed,
                // or passing a category param to the backend.
                const res = await api.get(`/videos/?category=${activeCategory === 'all' ? '' : activeCategory}`);

                // This is a mock filter since our backend doesn't support ?category= yet
                // A full implementation would update the backend videos router to accept category.
                setVideos(res.data);
            } catch (error) {
                console.error("Failed to fetch videos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [activeCategory]);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    みつける
                </h1>
                <p className="text-muted-foreground mt-2">
                    ジャンルごとに好きな動画を探してみよう！
                </p>
            </header>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-3 pb-4 mb-8 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${activeCategory === cat.id
                                ? "bg-slate-900 text-white shadow-md scale-105"
                                : "bg-white text-slate-600 border hover:bg-slate-50 hover:border-slate-300"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                    {CATEGORIES.find(c => c.id === activeCategory)?.label} の動画はまだありません。
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
