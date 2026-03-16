import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { TopBar } from "../components/TopBar";

export default function MyPage() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900">
      <TopBar />

      <div className="flex-1 px-4 pt-2 space-y-3">
        <div className="rounded-2xl bg-zinc-800 px-4 py-4">
          <p className="text-xs text-zinc-500 mb-2">로그인 계정</p>
          {user?.displayName && (
            <p className="text-base font-semibold text-white">{user.displayName}</p>
          )}
          <p className="text-sm text-zinc-400">{user?.email ?? "-"}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-zinc-800 py-4 text-sm font-medium text-red-400 active:bg-zinc-700"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
