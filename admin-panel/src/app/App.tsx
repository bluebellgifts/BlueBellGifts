import React, { useState, useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { auth, firestore } from "./services/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Admin Components
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { AdminHeader } from "./components/admin/AdminHeader";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminProductsPage } from "./components/admin/AdminProductsPage";
import { AdminInventoryPage } from "./components/admin/AdminInventoryPage";
import { AdminOrdersPage } from "./components/admin/AdminOrdersPage";
import { AdminCustomersPage } from "./components/admin/AdminCustomersPage";
import { AdminReportsPage } from "./components/admin/AdminReportsPage";
import { AdminCategoriesPage } from "./components/admin/AdminCategoriesPage";
import { AdminContentPage } from "./components/admin/AdminContentPage";
import { AdminSettingsPage } from "./components/admin/AdminSettingsPage";
import { AdminInvoicesPage } from "./components/admin/AdminInvoicesPage";
import { AdminOfferManagement } from "./components/admin/AdminOfferManagement";

// Gifts Billing Components
import { GiftsBillingPage } from "./gifts/pages/GiftsBilling";

type Page = {
  name: string;
  params?: any;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>({
    name: "admin-dashboard",
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminMobileMenuOpen, setAdminMobileMenuOpen] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify if user is admin in Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
        }
      } else {
        setIsAdminLoggedIn(false);
      }
      setIsCheckingAdmin(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle initial route
    const path = window.location.pathname.replace("/", "");
    if (path && path !== "dashboard") {
      setCurrentPage({ name: path });
    }

    // Handle browser back/forward
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.name) {
        setCurrentPage(event.state);
      } else {
        setCurrentPage({ name: "admin-dashboard" });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (pageName: string, params?: any) => {
    const newPage = { name: pageName, params };
    setCurrentPage(newPage);
    window.scrollTo(0, 0);

    // Update URL without full page reload
    const path = pageName === "admin-dashboard" ? "/" : `/${pageName}`;
    window.history.pushState(newPage, "", path);
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setIsAdminLoggedIn(false);
    setCurrentPage({ name: "admin-login" });
  };

  const renderAdminPage = () => {
    if (isCheckingAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAdminLoggedIn && currentPage.name !== "admin-login") {
      return <AdminLoginPage onLogin={() => setIsAdminLoggedIn(true)} />;
    }

    if (currentPage.name === "admin-login") {
      return (
        <AdminLoginPage
          onLogin={() => {
            setIsAdminLoggedIn(true);
            handleNavigate("admin-dashboard");
          }}
        />
      );
    }

    const pageTitle = {
      "admin-dashboard": "Dashboard",
      "admin-products": "Product Management",
      "admin-categories": "Category Management",
      "admin-inventory": "Inventory Management",
      "admin-orders": "Order Management",
      "admin-customers": "Customer Management",
      "admin-reports": "Reports & Analytics",
      "admin-invoices": "Invoices",
      "admin-content": "Website Content",
      "admin-settings": "Settings",
      "gifts-billing": "Gifts Billing System",
    };

    return (
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar
          activePage={currentPage.name}
          onNavigate={handleNavigate}
          onLogout={handleAdminLogout}
          mobileMenuOpen={adminMobileMenuOpen}
          onMobileMenuToggle={() =>
            setAdminMobileMenuOpen(!adminMobileMenuOpen)
          }
        />
        <div className="flex-1 md:ml-72 transition-all duration-300">
          <AdminHeader />
          <div className="p-8 max-w-7xl mx-auto">
            {currentPage.name === "admin-dashboard" && <AdminDashboard />}
            {currentPage.name === "admin-products" && <AdminProductsPage />}
            {currentPage.name === "admin-categories" && <AdminCategoriesPage />}
            {currentPage.name === "admin-inventory" && <AdminInventoryPage />}
            {currentPage.name === "admin-orders" && <AdminOrdersPage />}
            {currentPage.name === "admin-customers" && <AdminCustomersPage />}
            {currentPage.name === "admin-reports" && <AdminReportsPage />}
            {currentPage.name === "admin-invoices" && <AdminInvoicesPage />}
            {currentPage.name === "admin-content" && <AdminContentPage />}
            {currentPage.name === "admin-settings" && <AdminSettingsPage />}
            {currentPage.name === "admin-offers" && <AdminOfferManagement />}
            {currentPage.name === "admin-offer-management" && (
              <AdminOfferManagement />
            )}
            {currentPage.name === "gifts-billing" && <GiftsBillingPage />}
          </div>
        </div>
      </div>
    );
  };

  return <AppProvider>{renderAdminPage()}</AppProvider>;
}
