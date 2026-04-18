import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const { signIn } = useGoogleSignIn();
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) navigate("/", { replace: true });
  }, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
      <h1 className="mb-2 text-3xl font-bold text-white">Librew</h1>
      <p className="mb-12 text-base text-zinc-400">핸드드립 레시피 관리 앱</p>
      <button
        className="rounded-xl bg-amber-400 px-8 py-4 font-semibold text-zinc-900"
        onClick={signIn}
      >
        Google로 시작하기
      </button>
    </div>
  );
}
