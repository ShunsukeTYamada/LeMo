"use client";

import Link from "next/link"
import { Home, Compass, Library, Search, LogIn, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 border-r bg-card hidden md:block h-screen fixed left-0 top-0">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    KidsTube
                </h2>
            </div>

            <nav className="p-4 space-y-2">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-accent-foreground font-medium transition-colors">
                    <Home className="w-5 h-5" />
                    <span>ホーム</span>
                </Link>
                <Link href="/explore" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium transition-colors">
                    <Compass className="w-5 h-5" />
                    <span>みつける</span>
                </Link>
                <Link href="/search" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium transition-colors">
                    <Search className="w-5 h-5" />
                    <span>さがす</span>
                </Link>
                {user && (
                    <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium transition-colors">
                        <Library className="w-5 h-5" />
                        <span>ライブラリ</span>
                    </Link>
                )}
                {user?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors mt-4">
                        <Settings className="w-5 h-5" />
                        <span>管理画面</span>
                    </Link>
                )}
            </nav>

            <div className="absolute bottom-0 w-full p-4 space-y-3">
                {user ? (
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-medium">ようこそ</span>
                            <span className="text-sm font-bold text-slate-800">{user.account_name}</span>
                        </div>
                        <button onClick={logout} title="ログアウト" className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                        <LogIn className="w-4 h-4" />
                        <span>ログイン</span>
                    </Link>
                )}
                <div className="bg-blue-50p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center p-4">
                    <p className="text-xs text-blue-800 font-medium text-center">安心・安全な<br />動画だけをお届け</p>
                </div>
            </div>
        </aside>
    )
}
