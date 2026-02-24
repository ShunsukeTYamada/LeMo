"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
    { id: "all", label: "すべて" },
    { id: "10", label: "おんがく" },
    { id: "24", label: "エンタメ" },
    { id: "27", label: "まなび" },
    { id: "28", label: "かがく" },
    { id: "17", label: "スポーツ" },
];

// Helper to determine highly safe channels based on keywords in title or description
function isHighlySafe(channel: any) {
    const text = (channel.name + " " + (channel.metadata_?.description || "")).toLowerCase();
    const safeKeywords = ["公式", "official", "tv", "テレビ", "放送", "省", "庁", "機構", "財団", "npo", "japan", "日本", "協会", "連盟", "office", "プロダクション", "エンタテインメント", "entertainment", "jst", "jfa"];
    return safeKeywords.some(kw => text.includes(kw));
}

export default function AdminPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [sources, setSources] = useState<any[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [sortOrder, setSortOrder] = useState<"subsDesc" | "subsAsc">("subsDesc");

    const fetchSources = async () => {
        try {
            const res = await api.get("/channels/");
            setSources(res.data);
        } catch (e) {
            console.error("Failed to fetch sources", e);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSources();
        }
    }, [user?.role]);

    if (isAuthLoading) {
        return <div className="p-8 text-center text-slate-500">認証情報を確認中...</div>;
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow border max-w-sm w-full">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">アクセス拒否</h1>
                    <p className="text-slate-500 text-sm mb-6">管理者権限のあるアカウントでログインしてください。</p>
                    <Link href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        ログイン画面へ
                    </Link>
                </div>
            </div>
        );
    }

    const handleDiscover = async () => {
        setIsDiscovering(true);
        try {
            await api.post("/channels/discover");
            await fetchSources();
        } catch (e) {
            console.error(e);
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleFetchVideos = async () => {
        try {
            await api.post("/videos/fetch-updates");
            alert("最新動画の取得バッチを実行しました。");
        } catch (e) {
            console.error(e);
            alert("動画の取得に失敗しました。");
        }
    };

    const updateStatus = async (id: string, action: "approve" | "reject") => {
        try {
            await api.put(`/channels/${id}/${action}`);
            await fetchSources();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredAndSortedSources = useMemo(() => {
        let filtered = sources;
        if (activeTab !== "all") {
            filtered = sources.filter(s => s.category === activeTab);
        }

        return filtered.sort((a, b) => {
            const subsA = parseInt(a.metadata_?.subscriberCount || "0");
            const subsB = parseInt(b.metadata_?.subscriberCount || "0");
            return sortOrder === "subsDesc" ? subsB - subsA : subsA - subsB;
        });
    }, [sources, activeTab, sortOrder]);

    const formatSubs = (count: string) => {
        return Intl.NumberFormat("ja-JP", { notation: "compact" }).format(parseInt(count || "0"));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
                    <p className="text-muted-foreground mt-1">集めたチャンネルの確認と承認</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleDiscover} disabled={isDiscovering}>
                        {isDiscovering ? "チャンネル探索中..." : "新規自動探索"}
                    </Button>
                    <Button variant="outline" onClick={handleFetchVideos}>
                        動画バッチ実行
                    </Button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
                <div className="flex overflow-x-auto gap-2 max-w-full pb-2 md:pb-0 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === cat.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <span className="text-sm font-medium text-slate-500">並び順:</span>
                    <select
                        value={sortOrder}
                        onChange={(e: any) => setSortOrder(e.target.value)}
                        className="text-sm border rounded-lg px-3 py-2 bg-slate-50 outline-none"
                    >
                        <option value="subsDesc">登録者数が多い順</option>
                        <option value="subsAsc">登録者数が少ない順</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    一覧 ({filteredAndSortedSources.length}件)
                </h2>

                {filteredAndSortedSources.map((src: any) => {
                    const isSafe = isHighlySafe(src);
                    return (
                        <Card key={src.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 shadow-sm transition-all ${isSafe ? 'border-blue-300 bg-blue-50/30' : ''}`}>
                            <div className="flex items-start gap-4 mb-4 md:mb-0">
                                {src.metadata_?.thumbnail && (
                                    <img src={src.metadata_.thumbnail} alt={src.name} className="w-14 h-14 rounded-full border shadow-sm" />
                                )}
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2 break-all">
                                        {src.name}
                                        {isSafe && (
                                            <span title="TV局・公的組織・大手公式の可能性が高いアカウント" className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                <ShieldCheck className="w-3 h-3" /> 高安全性
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                                            {CATEGORIES.find(c => c.id === src.category)?.label || "不明"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            👥 {formatSubs(src.metadata_?.subscriberCount)} 登録
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🎬 {src.metadata_?.videoCount || 0} 本
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${src.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    src.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {src.status === 'pending' ? '承認待ち' : src.status === 'approved' ? '承認済' : '拒否'}
                                </span>

                                {src.status === 'pending' && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(src.id, "approve")}>承認</Button>
                                        <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => updateStatus(src.id, "reject")}>拒否</Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {filteredAndSortedSources.length === 0 && (
                    <div className="p-12 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50">
                        該当するチャンネルがありません。
                    </div>
                )}
            </div>
        </div>
    );
}
