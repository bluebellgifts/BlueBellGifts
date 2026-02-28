import React from "react";
import { Bell } from "lucide-react";

export function AdminHeader() {
  return (
    <div className="bg-white/90 sticky top-0 z-30 border-b border-slate-200 px-6 py-4 shadow-sm backdrop-blur-md transition-all">
      <div className="flex items-center justify-end gap-6">
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-full hover:bg-slate-100 hover:text-blue-600 text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md ring-2 ring-white">
              <span className="font-bold text-sm">A</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
