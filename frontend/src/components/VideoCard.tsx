"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";

interface VideoCardProps {
    id: string; // The database Content UUID
    sourceId: string;
    externalContentId: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    publishedAt: string;
    metrics: Record<string, any>;
}

export function VideoCard({
    id,
    title,
    externalContentId,
    thumbnailUrl,
    publishedAt,
    metrics,
    url
}: VideoCardProps) {
    const { user } = useAuth();
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const views = Intl.NumberFormat("ja-JP", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(parseInt(metrics?.viewCount || "0"));

    const timeAgo = formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: ja });

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert("お気に入りに追加するにはログインしてください。");
            return;
        }

        setIsAddingFavorite(true);
        try {
            await api.post(`/users/favorites/${id}`);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000); // 2秒後に戻す
        } catch (error: any) {
            if (error.response?.status === 400 && error.response.data?.detail === "Already favorited") {
                alert("すでにお気に入りに追加されています！");
            } else {
                console.error(error);
                alert("エラーが発生しました。");
            }
        } finally {
            setIsAddingFavorite(false);
        }
    };

    const handleCardClick = () => {
        if (user) {
            // Fire and forget history tracking
            api.post(`/users/history/${id}`).catch(err => console.error(err));
        }
    };

    return (
        <div className="relative flex flex-col group block">
            <Link href={`/w/${externalContentId}`} onClick={handleCardClick} className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-200 mb-3 cursor-pointer block">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center pl-1">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-blue-600 border-b-[8px] border-b-transparent"></div>
                    </div>
                </div>
            </Link>

            <button
                onClick={handleFavorite}
                disabled={isAddingFavorite}
                className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white disabled:opacity-50 z-10`}
                title="お気に入りに追加"
            >
                <Heart className={`w-5 h-5 ${justAdded ? 'fill-pink-500 text-pink-500 scale-110' : 'text-slate-600'} transition-all`} />
            </button>

            <Link href={`/w/${externalContentId}`} onClick={handleCardClick} className="flex gap-3 items-start cursor-pointer block">
                <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>{views} 回視聴</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{timeAgo}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
