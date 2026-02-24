"use client";

import Link from "next/link"
import { Home, Compass, Library, Search, LogIn, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function MobileNav() {
    const { user } = useAuth();

    return (
        <div className="fixed bottom-0 w-full bg-white border-t md:hidden flex justify-around p-3 pb-safe z-50">
            <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-blue-600">
                <Home className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">ホーム</span>
            </Link>
            <Link href="/explore" className="flex flex-col items-center text-muted-foreground hover:text-blue-600">
                <Compass className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">みつける</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center text-muted-foreground hover:text-blue-600">
                <Search className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">さがす</span>
            </Link>

            {user ? (
                <>
                    <Link href="/library" className="flex flex-col items-center text-muted-foreground hover:text-blue-600">
                        <Library className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">ライブラリ</span>
                    </Link>
                    {user.role === 'admin' && (
                        <Link href="/admin" className="flex flex-col items-center text-red-500 hover:text-red-700">
                            <Settings className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-medium">管理</span>
                        </Link>
                    )}
                </>
            ) : (
                <Link href="/login" className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                    <LogIn className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">ログイン</span>
                </Link>
            )}
        </div>
    )
}
