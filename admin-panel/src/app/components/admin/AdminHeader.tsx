import React from "react";
import { Bell } from "lucide-react";
import { pageConfig } from "./PageHeader";

interface AdminHeaderProps {
  activePage?: string;
  headerActions?: React.ReactNode;
}

export function AdminHeader({
  activePage = "admin-dashboard",
  headerActions,
}: AdminHeaderProps) {
  const currentPageConfig = activePage
    ? pageConfig[activePage]
    : pageConfig["admin-dashboard"];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        {/* Left: Title & Description */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {currentPageConfig.icon && (
            <div className="flex-shrink-0 text-blue-600">
              {currentPageConfig.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPageConfig.title}
            </h1>
            {currentPageConfig.description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {currentPageConfig.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Header Actions + Notifications + Profile */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Custom Header Actions */}
          {headerActions && (
            <div className="flex items-center gap-3">{headerActions}</div>
          )}

          {/* Divider */}
          {headerActions && <div className="h-6 w-px bg-slate-200"></div>}

          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-slate-100 hover:text-blue-600 text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md ring-2 ring-white">
              <span className="font-bold text-xs">A</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
