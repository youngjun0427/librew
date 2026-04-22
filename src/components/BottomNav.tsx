import { useNavigate, useLocation } from "react-router-dom";

type Tab = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function EquipmentIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function BeanIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(-20 12 12)" />
      <path d="M12 2C8 6 8 18 12 22" />
    </svg>
  );
}

function RecipeIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

function BrewIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const tabs: Tab[] = [
    { label: "홈", path: "/", icon: <HomeIcon active={isActive("/")} /> },
    { label: "레시피", path: "/recipe", icon: <RecipeIcon active={isActive("/recipe")} /> },
    { label: "추출", path: "/brew/prep", icon: <BrewIcon active={isActive("/brew/prep")} /> },
    { label: "장비", path: "/equipment", icon: <EquipmentIcon active={isActive("/equipment")} /> },
    { label: "원두", path: "/bean", icon: <BeanIcon active={isActive("/bean")} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900">
      <div className="flex items-end justify-around px-1 pb-safe-6 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5 py-1"
          >
            {tab.icon}
            <span
              className={`text-xs font-medium ${
                isActive(tab.path) ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}