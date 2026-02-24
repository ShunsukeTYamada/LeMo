"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { VideoCard } from "@/components/VideoCard";
import { Clock, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LibraryPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchLibraryData();
        } else if (!isAuthLoading) {
            setIsLoading(false);
        }
    }, [user, isAuthLoading]);

    const fetchLibraryData = async () => {
        setIsLoading(true);
        try {
            const [favRes, histRes] = await Promise.all([
                api.get("/users/favorites"),
                api.get("/users/history")
            ]);
            setFavorites(favRes.data);
            setHistory(histRes.data);
        } catch (e) {
            console.error("Failed to fetch library data", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading || isLoading) {
        return <div className="p-8 text-center text-slate-500">読み込み中...</div>;
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow border max-w-sm w-full">
                    <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">ライブラリ機能</h1>
                    <p className="text-slate-500 text-sm mb-6">ログインすると、お気に入りの動画を保存하거나再生履歴を見ることができます。</p>
                    <Link href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full">
                        ログイン画面へ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                    マイライブラリ
                </h1>
                <p className="text-muted-foreground mt-2">お気に入りの動画や最近見た動画の一覧</p>
            </header>

            <Tabs defaultValue="favorites" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="favorites" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" /> お気に入り
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> さいきん見た動画
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="favorites" className="space-y-4">
                    {favorites.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">お気に入りの動画がまだありません。</p>
                            <p className="text-sm text-slate-400 mt-1">好きな動画を見つけて、ハートマークを押してみよう！</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {favorites.map((fav) => (
                                <VideoCard
                                    key={fav.id}
                                    id={fav.content.id}
                                    sourceId={fav.content.source_id}
                                    externalContentId={fav.content.external_content_id}
                                    title={fav.content.title}
                                    url={fav.content.url}
                                    thumbnailUrl={fav.content.thumbnail_url}
                                    publishedAt={fav.content.published_at}
                                    metrics={fav.content.metrics}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {history.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">再生履歴がまだありません。</p>
                            <p className="text-sm text-slate-400 mt-1">動画を見ると、ここに履歴が残ります。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {history.map((hist) => (
                                <VideoCard
                                    key={hist.id}
                                    id={hist.content.id}
                                    sourceId={hist.content.source_id}
                                    externalContentId={hist.content.external_content_id}
                                    title={hist.content.title}
                                    url={hist.content.url}
                                    thumbnailUrl={hist.content.thumbnail_url}
                                    publishedAt={hist.content.published_at}
                                    metrics={hist.content.metrics}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
