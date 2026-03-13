import { signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-14">
      <div className="w-10">
        {!isHome && (
          <button
            onClick={() => navigate("/")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </button>
        )}
      </div>

      <h1 className="text-base font-bold text-white">
        {isHome ? "BrewNote" : ""}
      </h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-zinc-800 p-1 shadow-xl ring-1 ring-zinc-700">
            <div className="px-3 py-2.5">
              <p className="text-xs text-zinc-500">로그인 계정</p>
              <p className="mt-0.5 truncate text-sm font-medium text-white">{user?.email ?? "-"}</p>
            </div>
            <div className="mx-2 h-px bg-zinc-700" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-zinc-700"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
