"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <nav className="bg-orange-500 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🎪 FestAffitto
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <span className="hidden sm:inline text-orange-100">
                Ciao, {session.user?.name}
              </span>
              {role === "owner" ? (
                <Link href="/dashboard/owner" className="hover:underline font-medium">
                  Dashboard
                </Link>
              ) : (
                <Link href="/dashboard/buyer" className="hover:underline font-medium">
                  I miei ordini
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-50"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:underline">
                Accedi
              </Link>
              <Link
                href="/auth/register"
                className="bg-white text-orange-600 px-3 py-1 rounded-full font-medium hover:bg-orange-50"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
