"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { VideoCard } from "@/components/VideoCard";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            // Assuming backend supports /videos/?q=...
            // We will need to add this query parameter to backend later.
            const res = await api.get(`/videos/?q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    さがす
                </h1>
                <p className="text-muted-foreground mt-2">
                    安心な動画の中から、観たいものを検索できます。
                </p>
            </header>

            <form onSubmit={handleSearch} className="flex gap-2 mb-10 max-w-2xl">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="キーワードを入力して検索..."
                        className="pl-10 h-12 text-base rounded-xl"
                    />
                </div>
                <Button type="submit" className="h-12 px-6 rounded-xl w-24">
                    {isSearching ? "検索中" : "検索"}
                </Button>
            </form>

            {hasSearched && (
                <>
                    <h2 className="text-lg font-bold mb-6">
                        「{query}」の検索結果 ({results.length}件)
                    </h2>

                    {results.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                            見つかりませんでした。別のキーワードを試してみてください。
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((video: any) => (
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
                </>
            )}
        </div>
    );
}
