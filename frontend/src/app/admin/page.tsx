"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck, AlertCircle, Search } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
    { id: "all", label: "すべて" },
    { id: "10", label: "おんがく" },
    { id: "24", label: "エンタメ" },
    { id: "27", label: "まなび" },
    { id: "28", label: "かがく" },
    { id: "17", label: "スポーツ" },
];

function isHighlySafe(channel: any) {
    const text = (channel.name + " " + (channel.metadata_?.description || "")).toLowerCase();
    const safeKeywords = ["公式", "official", "tv", "テレビ", "放送", "省", "庁", "機構", "財団", "npo", "japan", "日本", "協会", "連盟", "office", "プロダクション", "エンタテインメント", "entertainment", "jst", "jfa"];
    return safeKeywords.some(kw => text.includes(kw));
}

export default function AdminPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [sources, setSources] = useState<any[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [isManualDiscovering, setIsManualDiscovering] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [activeTab, setActiveTab] = useState("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
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

    const handleManualDiscover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsManualDiscovering(true);
        try {
            await api.post("/channels/manual-discover", { query: searchQuery });
            setSearchQuery("");
            setStatusFilter("pending"); // Show PENDING so they can approve the searched ones
            await fetchSources();
            alert("検索結果のチャンネルを追加しました。リストから確認して「承認」してください。");
        } catch (e) {
            console.error(e);
            alert("検索に失敗しました。");
        } finally {
            setIsManualDiscovering(false);
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
            filtered = filtered.filter(s => s.category === activeTab);
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        return filtered.sort((a, b) => {
            const subsA = parseInt(a.metadata_?.subscriberCount || "0");
            const subsB = parseInt(b.metadata_?.subscriberCount || "0");
            return sortOrder === "subsDesc" ? subsB - subsA : subsA - subsB;
        });
    }, [sources, activeTab, statusFilter, sortOrder]);

    const formatSubs = (count: string) => {
        return Intl.NumberFormat("ja-JP", { notation: "compact" }).format(parseInt(count || "0"));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
                    <p className="text-muted-foreground mt-1">集めたチャンネルの確認と承認</p>
                </div>

                <div className="flex flex-col gap-3">
                    <form onSubmit={handleManualDiscover} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="特定のチャンネル名で検索..."
                                className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isManualDiscovering || !searchQuery.trim()} size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                            {isManualDiscovering ? "検索中..." : "検索・追加"}
                        </Button>
                    </form>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={handleDiscover} disabled={isDiscovering}>
                            {isDiscovering ? "おまかせ探索中..." : "自動おまかせ探索"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleFetchVideos}>
                            全動画更新バッチ
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-xl border">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
                    {[{ id: "all", label: "すべて" }, { id: "pending", label: "承認待ち" }, { id: "approved", label: "承認済" }, { id: "rejected", label: "拒否" }].map(status => (
                        <button
                            key={status.id}
                            onClick={() => setStatusFilter(status.id as any)}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${statusFilter === status.id ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                        >
                            {status.label}
                            <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border">
                                {sources.filter(s => status.id === "all" ? true : s.status === status.id).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex overflow-x-auto gap-1 max-w-full lg:max-w-md scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === cat.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <select
                        value={sortOrder}
                        onChange={(e: any) => setSortOrder(e.target.value)}
                        className="text-sm border rounded-lg px-3 py-1.5 bg-slate-50 outline-none text-slate-700"
                    >
                        <option value="subsDesc">登録者数が多い順</option>
                        <option value="subsAsc">登録者数が少ない順</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    一覧 ({filteredAndSortedSources.length}件)
                </h2>

                {filteredAndSortedSources.map((src: any) => {
                    const isSafe = isHighlySafe(src);
                    return (
                        <Card key={src.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 shadow-sm transition-all hover:bg-slate-50/50 ${isSafe ? 'border-blue-200 bg-blue-50/20' : ''}`}>
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                {src.metadata_?.thumbnail ? (
                                    <img src={src.metadata_.thumbnail} alt={src.name} className="w-12 h-12 rounded-full border shadow-sm shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full border bg-slate-200 shrink-0" />
                                )}
                                <div>
                                    <h3 className="font-bold text-base flex items-center gap-2 break-all line-clamp-1">
                                        {src.name}
                                        {isSafe && (
                                            <span title="TV局・公的組織・大手公式の可能性が高いアカウント" className="inline-flex items-center gap-1 text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                                <ShieldCheck className="w-3 h-3" /> 公式系
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                            {CATEGORIES.find(c => c.id === src.category)?.label || "その他"}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            👥 {formatSubs(src.metadata_?.subscriberCount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${src.status === 'approved' ? 'bg-green-100/80 text-green-700 border border-green-200' :
                                    src.status === 'rejected' ? 'bg-red-50 text-red-500 border border-red-100' :
                                        'bg-yellow-100/80 text-yellow-700 border border-yellow-200'
                                    }`}>
                                    {src.status === 'pending' ? '承認待ち' : src.status === 'approved' ? '承認済' : '拒否'}
                                </span>

                                {src.status === 'pending' && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => updateStatus(src.id, "approve")}>承認</Button>
                                        <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 h-8" onClick={() => updateStatus(src.id, "reject")}>拒否</Button>
                                    </div>
                                )}
                                {src.status === 'approved' && (
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => updateStatus(src.id, "reject")}>除外</Button>
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
