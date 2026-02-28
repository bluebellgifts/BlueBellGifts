import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileText,
  Boxes,
  LogOut,
  Menu,
  X,
  Gift,
} from "lucide-react";

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function AdminSidebar({
  activePage,
  onNavigate,
  onLogout,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}: AdminSidebarProps) {
  const menuItems = [
    {
      id: "admin-dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "gifts-billing",
      name: "Gifts Billing",
      icon: <Gift size={20} />,
    },
    {
      id: "admin-invoices",
      name: "Invoices",
      icon: <FileText size={20} />,
    },
    {
      id: "admin-products",
      name: "Products",
      icon: <Package size={20} />,
    },
    {
      id: "admin-inventory",
      name: "Inventory",
      icon: <Boxes size={20} />,
    },
    {
      id: "admin-categories",
      name: "Categories",
      icon: <Boxes size={20} />, // Different icon ideally, but Box is fine
    },
    {
      id: "admin-orders",
      name: "Orders",
      icon: <ShoppingCart size={20} />,
    },
    {
      id: "admin-customers",
      name: "Customers",
      icon: <Users size={20} />,
    },
    {
      id: "admin-reports",
      name: "Reports",
      icon: <BarChart3 size={20} />,
    },
    {
      id: "admin-content",
      name: "Website Content",
      icon: <FileText size={20} />,
    },
    {
      id: "admin-settings",
      name: "Settings",
      icon: <Settings size={20} />,
    },
    {
      id: "admin-offers",
      name: "Offers",
      icon: <FileText size={20} />,
    },
  ];

  const handleMenuClick = (pageId: string) => {
    onNavigate(pageId);
    // Close mobile menu after navigation
    if (mobileMenuOpen && onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-xl">✨</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            GiftShop
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            Admin Console
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                >
                  {item.icon}
                </div>
                <span className="tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 group"
        >
          <LogOut
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-screen fixed left-0 top-0 z-40 bg-slate-900 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button - Floating Fab style */}
      <button
        onClick={onMobileMenuToggle}
        className="fixed md:hidden bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 transition-colors border-2 border-white/10"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 md:hidden z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Mobile Sidebar - Drawer */}
      <div
        className={`fixed md:hidden left-0 top-0 w-[85%] max-w-sm h-screen bg-slate-900 z-50 transform transition-transform duration-300 shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
