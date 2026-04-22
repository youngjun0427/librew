import { useNavigate, useLocation } from "react-router-dom";

type Tab = {
  label: string;
  path: string;
  isBrew?: boolean;
  icon: React.ReactNode;
};

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function EquipmentIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function BeanIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(-20 12 12)" />
      <path d="M12 2C8 6 8 18 12 22" />
    </svg>
  );
}

function RecipeIcon({ active }: { active: boolean }) {
  const color = active ? "#f59e0b" : "#71717a";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
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
    { label: "추출", path: "/brew/prep", isBrew: true, icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Dripper */}
        <path d="M4.5 13L7 19.5C7.3 20.2 7.8 20.5 8.5 20.5C9.2 20.5 9.7 20.2 10 19.5L12.5 13" />
        <line x1="3.5" y1="13" x2="13.5" y2="13" />
        {/* Server */}
        <path d="M6.5 20.5H10.5V21.5C10.5 22.5 9.5 23.5 8.5 23.5C7.5 23.5 6.5 22.5 6.5 21.5V20.5Z" />
        {/* Kettle Body */}
        <path d="M13.5 10.5V5.5C13.5 4.5 14.5 3.5 15.5 3.5H19.5C20.5 3.5 21.5 4.5 21.5 5.5V10.5C21.5 11.5 20.5 12.5 19.5 12.5H15.5C14.5 12.5 13.5 11.5 13.5 10.5Z" />
        {/* Kettle Spout */}
        <path d="M13.5 9.5C10 9.5 8.5 7 8.5 5.5" />
        {/* Kettle Handle */}
        <path d="M21.5 5.5H22.5C23.5 5.5 23.5 8.5 22.5 8.5H21.5" />
        {/* Water Stream */}
        <line x1="8.5" y1="7" x2="8.5" y2="11.5" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
    )},
    { label: "장비", path: "/equipment", icon: <EquipmentIcon active={isActive("/equipment")} /> },
    { label: "원두", path: "/bean", icon: <BeanIcon active={isActive("/bean")} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900">
      <div className="flex items-end justify-around px-1 pb-safe-6 pt-2">
        {tabs.map((tab) =>
          tab.isBrew ? (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex -translate-y-2 flex-col items-center justify-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/30 active:bg-amber-300">
                {tab.icon}
              </div>
            </button>
          ) : (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1"
            >
              {tab.icon}
              <span
                className={`text-[10px] font-medium ${
                  isActive(tab.path) ? "text-amber-400" : "text-zinc-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
