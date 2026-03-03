import React, { useState } from "react";
import { User, MapPin, Package, LogOut, Edit } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { mockOrders } from "../../data/mockData";

interface AccountPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
  const { user, setUser, orders: contextOrders } = useApp();
  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "addresses"
  >("profile");

  if (!user) {
    onNavigate("login");
    return null;
  }

  // Combine context orders with mock orders for demo
  const allOrders = [
    ...contextOrders,
    ...mockOrders.filter((o) => o.customerId === user.id),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const tabs = [
    { id: "profile" as const, name: "Profile", icon: <User size={18} /> },
    { id: "orders" as const, name: "Orders", icon: <Package size={18} /> },
    { id: "addresses" as const, name: "Addresses", icon: <MapPin size={18} /> },
  ];

  const handleLogout = () => {
    setUser(null);
    onNavigate("home");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProductImageUrl = (product: any): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/80x80?text=No+Image";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
        {/* Modern Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2">
            My Account
          </h1>
          <p className="text-sm text-[#6B7280]">
            Manage your profile, orders, and addresses
          </p>
        </div>

        {/* Tabs - Modern */}
        <div className="flex gap-2 mb-6 bg-[#F3F4F6] p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#2563EB] shadow-sm border border-[#E5E7EB]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* User Card - Compact Header */}
        <Card className="border-0 shadow-sm mb-6 bg-gradient-to-r from-[#EFF6FF] to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#111827]">{user.name}</h3>
                <p className="text-xs text-[#6B7280]">{user.email}</p>
              </div>
            </div>
            {user.role === "reseller" && (
              <Badge variant="info" className="text-xs">
                Reseller
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#111827] uppercase tracking-wide">
                    Profile Information
                  </h2>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-3">
                <div>
                  <p className="text-[#6B7280] font-semibold uppercase mb-1">
                    Full Name
                  </p>
                  <p className="text-[#111827] font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-[#6B7280] font-semibold uppercase mb-1">
                    Email
                  </p>
                  <p className="text-[#111827] font-medium break-all">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] font-semibold uppercase mb-1">
                    Phone
                  </p>
                  <p className="text-[#111827] font-medium">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] font-semibold uppercase mb-1">
                    Account Type
                  </p>
                  <p className="text-[#111827] font-medium capitalize">
                    {user.role}
                  </p>
                </div>
              </CardContent>
            </Card>

            {user.role === "reseller" && (
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-[#1E3A8A] mb-3 text-sm">
                    ✨ Reseller Benefits
                  </h3>
                  <ul className="space-y-2 text-xs text-[#1E3A8A]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E]">✓</span>
                      <span>Exclusive reseller pricing on all products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E]">✓</span>
                      <span>Bulk order discounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E]">✓</span>
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22C55E]">✓</span>
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm py-2"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827] uppercase tracking-wide">
                My Orders ({allOrders.length})
              </h2>
            </CardHeader>
            <CardContent className="p-4">
              {allOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-[#E5E7EB] mx-auto mb-4" />
                  <p className="text-sm text-[#6B7280] mb-4">No orders yet</p>
                  <Button
                    variant="primary"
                    className="text-sm"
                    onClick={() => onNavigate("products")}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() =>
                        onNavigate("order-detail", { orderId: order.id })
                      }
                      className="w-full text-left border border-[#E5E7EB] rounded-lg p-4 hover:bg-[#F9FAFB] hover:border-[#2563EB] hover:shadow-sm transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-[#111827] text-sm">
                            Order #{order.id}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </div>
                          <p className="font-bold text-[#2563EB] text-sm mt-2">
                            ₹{order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                        {order.items.slice(0, 4).map((item, index) => (
                          <img
                            key={index}
                            src={getProductImageUrl(item.product)}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded border border-[#E5E7EB]"
                          />
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-12 h-12 bg-[#EFF6FF] rounded border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] font-semibold text-xs">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Quick Info */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                        <span>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </span>
                        <span>View details →</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] uppercase tracking-wide">
                  Saved Addresses
                </h2>
                <Button variant="primary" size="sm" className="text-xs">
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-center py-12">
                <MapPin size={48} className="text-[#E5E7EB] mx-auto mb-4" />
                <p className="text-sm text-[#6B7280]">No saved addresses yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
