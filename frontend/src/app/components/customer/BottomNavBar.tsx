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
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pointer-events-none pb-3 px-3">
      {/* Premium Minimalist Bottom Navigation */}
      <nav className="pointer-events-auto bg-white shadow-2xl border border-slate-200 rounded-3xl mx-auto max-w-md overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.path ||
              (item.path === "account" && currentPage === "login");

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`group relative flex-1 h-full flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-50 to-blue-50/20"
                    : "hover:bg-slate-50/50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`
                  relative p-3 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-300/40"
                      : "text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50/50"
                  }
                `}
                >
                  <Icon
                    size={isActive ? 24 : 22}
                    strokeWidth={2.2}
                    className={`transition-all duration-300`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
