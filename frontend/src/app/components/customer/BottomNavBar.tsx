import React from "react";
import { Home, Grid, Zap, Heart, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface BottomNavBarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function BottomNavBar({ onNavigate, currentPage }: BottomNavBarProps) {
  const { user } = useApp();

  const navItems = [
    { name: "Home", path: "home", icon: Home },
    { name: "Categories", path: "categories", icon: Grid },
    { name: "Deal of the Day", path: "deals", icon: Zap },
    { name: "Save", path: "wishlist", icon: Heart },
    { name: "Profile", path: user ? "account" : "login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pointer-events-none pb-2 px-3">
      {/* Premium Bottom Navigation */}
      <nav className="pointer-events-auto bg-white/95 shadow-2xl border border-slate-100 rounded-3xl mx-auto max-w-md overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-around h-[4.5rem] px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.path ||
              (item.path === "account" && currentPage === "login");

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`group relative flex-1 h-full flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-300 ${
                  isActive ? "" : "hover:bg-slate-50/60"
                }`}
              >
                {/* Icon */}
                <div
                  className={`
                  relative p-2 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-400/30 scale-105"
                      : "text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50/60"
                  }
                `}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-300"
                  />
                </div>
                {/* Label */}
                <span
                  className={`text-[9px] font-semibold tracking-tight leading-none transition-all duration-300 ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
                  }`}
                >
                  {item.name === "Deal of the Day" ? "Deals" : item.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
