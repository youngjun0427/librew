import { useLocation, useNavigate } from "react-router-dom";

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className="flex items-center px-5 pb-3 pt-14">
      {!isHome && (
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 active:bg-zinc-800 ml-auto"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      )}

      <h1 className="text-base font-bold text-white">{isHome ? "Librew" : ""}</h1>

      {isHome && (
        <button
          onClick={() => navigate("/mypage")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 active:bg-zinc-800 ml-auto"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
