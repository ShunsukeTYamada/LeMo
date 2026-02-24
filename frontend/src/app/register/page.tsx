"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accountName, setAccountName] = useState("");
    const [birthYearMonth, setBirthYearMonth] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation for YYYY-MM
        if (!/^\d{4}-\d{2}$/.test(birthYearMonth)) {
            setError("生年月は「2010-04」の形式で入力してください。");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Register User
            await api.post("/auth/register", {
                username,
                password,
                account_name: accountName,
                birth_year_month: birthYearMonth
            });

            // 2. Login Auto
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const res = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            const token = res.data.access_token;
            const userRes = await api.get("/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });

            login(token, userRes.data);
            router.push("/");

        } catch (err: any) {
            console.error("Register Error:", err);
            if (err.response?.status === 400) {
                setError("このユーザーIDは既に使われています。別のIDをお試しください。");
            } else {
                setError("登録中にエラーが発生しました。");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">アカウント作成</h1>
                        <p className="text-sm text-slate-500 mt-2">自分だけのお気に入りを作成しよう</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                アカウントの名前 (ニックネーム)
                            </label>
                            <input
                                type="text"
                                required
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="たろう"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                ユーザーID (ログイン用)
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="taro2024"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                パスワード
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="6文字以上"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                生まれた年月
                            </label>
                            <input
                                type="text"
                                required
                                value={birthYearMonth}
                                onChange={(e) => setBirthYearMonth(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="例: 2010-04"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? "登録中..." : "アカウントを作成する"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        すでにアカウントを持っていますか？{" "}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            ログインはこちら
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
