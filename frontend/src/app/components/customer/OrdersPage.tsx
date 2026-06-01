import React from "react";
import { ChevronLeft, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { mockOrders } from "../../data/mockData";

interface OrdersPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { user, orders: contextOrders } = useApp();

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
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => onNavigate("account")}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
            title="Back to Account"
          >
            <ChevronLeft size={20} className="text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">
              My Orders
            </h1>
            <p className="text-sm text-[#6B7280]">
              {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <Card className="border-0 shadow-sm">
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
      </div>
    </div>
  );
}
