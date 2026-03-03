import React from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  Truck,
  CreditCard,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { useApp } from "../../context/AppContext";
import { Order } from "../../types";

interface OrderDetailPageProps {
  orderId: string;
  onNavigate: (page: string, params?: any) => void;
}

// Helper to format date and time
const formatDateTime = (dateInput: any): string => {
  try {
    let date: Date;

    // Handle Firestore Timestamp object
    if (dateInput && typeof dateInput === "object" && "toDate" in dateInput) {
      date = dateInput.toDate();
    }
    // Handle milliseconds timestamp
    else if (typeof dateInput === "number") {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    // Handle string
    else if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else {
      return "Date Unavailable";
    }

    if (isNaN(date.getTime())) {
      return "Date Unavailable";
    }

    return (
      date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Date Unavailable";
  }
};

export function OrderDetailPage({ orderId, onNavigate }: OrderDetailPageProps) {
  const { orders } = useApp();
  const order = orders.find((o) => o.id === orderId);
  const [expandedItems, setExpandedItems] = React.useState<Set<number>>(
    new Set(),
  );

  const toggleItemExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate("account", { tab: "orders" })}
            className="mb-6 flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] font-medium text-sm"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>

          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <Package size={64} className="text-[#E5E7EB] mx-auto mb-4" />
                <p className="text-base text-[#6B7280]">Order not found</p>
                <Button
                  variant="primary"
                  className="mt-6 text-sm"
                  onClick={() => onNavigate("account", { tab: "orders" })}
                >
                  Back to Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "shipped":
        return <Truck size={16} className="text-blue-600" />;
      case "processing":
        return <Clock size={16} className="text-amber-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const getProductImageUrl = (product: any): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/100x100?text=No+Image";
  };

  const subtotal = order.items.reduce((sum, item) => {
    return sum + item.product.sellingPrice * item.quantity;
  }, 0);

  const shipping = subtotal > 999 ? 0 : 50;
  const tax = subtotal * 0.18;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
        {/* Back Button */}
        <button
          onClick={() => onNavigate("account", { tab: "orders" })}
          className="mb-4 flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] font-medium text-sm"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        {/* Compact Header */}
        <Card className="border-0 shadow-sm mb-4 bg-white">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-[#6B7280] uppercase font-semibold tracking-wide mb-1">
                  Order Number
                </p>
                <p className="text-lg font-bold text-[#111827]">#{order.id}</p>
              </div>
              <div
                className={`rounded-lg border px-3 py-2 flex items-center gap-2 text-xs font-semibold ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                <span>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-[#6B7280]">
                <p className="uppercase font-semibold text-[#111827] mb-1">
                  Date
                </p>
                <p>{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-[#6B7280]">
                <p className="uppercase font-semibold text-[#111827] mb-1">
                  Delivery
                </p>
                <p>5-7 business days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items - Compact List */}
        <Card className="border-0 shadow-sm mb-4 bg-white">
          <CardHeader className="p-4 pb-3">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wide">
              Order Items ({order.items.length})
            </h2>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index}>
                  {/* Compact Item Row */}
                  <button
                    onClick={() => toggleItemExpand(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F3F4F6] transition-colors border border-[#E5E7EB]"
                  >
                    <img
                      src={getProductImageUrl(item.product)}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[#111827] text-sm line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        Qty: {item.quantity} × ₹{item.product.sellingPrice}
                      </p>
                      <p className="text-sm font-bold text-[#2563EB] mt-1">
                        ₹
                        {(item.product.sellingPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-[#6B7280]">
                      {expandedItems.has(index) ? "▼" : "▶"}
                    </div>
                  </button>

                  {/* Expanded Customization Details */}
                  {expandedItems.has(index) && item.customization && (
                    <div className="mt-2 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-xs space-y-2">
                      {/* Custom Text Fields */}
                      {item.customization.customTextFields &&
                        Object.keys(item.customization.customTextFields)
                          .length > 0 && (
                          <div>
                            <p className="font-semibold text-[#111827] mb-1">
                              Text Fields:
                            </p>
                            {Object.entries(
                              item.customization.customTextFields,
                            ).map(([fieldId, value]) => {
                              const field = item.product.customTextFields?.find(
                                (f: any) => f.id === fieldId,
                              );
                              return (
                                <div key={fieldId} className="text-[#6B7280]">
                                  <span className="font-medium text-[#111827]">
                                    {field?.label || fieldId}:
                                  </span>{" "}
                                  {value as string}
                                </div>
                              );
                            })}
                          </div>
                        )}

                      {/* Required Image Fields */}
                      {item.customization.requiredImageFields &&
                        Object.keys(item.customization.requiredImageFields)
                          .length > 0 && (
                          <div>
                            <p className="font-semibold text-[#111827] mb-1">
                              Uploaded Images:
                            </p>
                            {Object.entries(
                              item.customization.requiredImageFields,
                            ).map(([fieldId, urls]) => {
                              const field =
                                item.product.requiredImageFields?.find(
                                  (f: any) => f.id === fieldId,
                                );
                              return (
                                <div key={fieldId} className="text-[#6B7280]">
                                  <span className="font-medium text-[#111827]">
                                    {field?.label || fieldId}:
                                  </span>{" "}
                                  {(urls as string[]).length} image
                                  {(urls as string[]).length > 1 ? "s" : ""}
                                </div>
                              );
                            })}
                          </div>
                        )}

                      {/* Selected Variant */}
                      {item.customization.selectedVariantId && (
                        <div className="text-[#6B7280]">
                          <span className="font-medium text-[#111827]">
                            Variant:{" "}
                          </span>
                          {item.product.variants?.find(
                            (v: any) =>
                              v.id === item.customization?.selectedVariantId,
                          )?.name || item.customization.selectedVariantId}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Order Summary */}

        {/* Shipping Address - Compact */}
        <Card className="border-0 shadow-sm mb-4 bg-white">
          <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wide flex items-center gap-2">
              <MapPin size={16} className="text-[#2563EB]" />
              Shipping Address
            </h2>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-2">
            <p className="font-semibold text-[#111827]">
              {order.shippingAddress.name}
            </p>
            <p className="text-[#6B7280]">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && (
                <>, {order.shippingAddress.addressLine2}</>
              )}
            </p>
            <p className="text-[#6B7280]">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </p>
            <p className="font-semibold text-[#111827]">
              📱 {order.shippingAddress.phone}
            </p>
          </CardContent>
        </Card>

        {/* Order Summary - Compact */}
        <Card className="border-0 shadow-sm mb-4 bg-white">
          <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wide flex items-center gap-2">
              <CreditCard size={16} className="text-[#2563EB]" />
              Order Summary
            </h2>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-semibold text-[#111827]">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">
                Shipping{" "}
                {subtotal > 999 && (
                  <span className="text-emerald-600 font-semibold">(Free)</span>
                )}
              </span>
              <span className="font-semibold text-[#111827]">
                ₹{shipping.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Tax (GST 18%)</span>
              <span className="font-semibold text-[#111827]">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-bold">
              <span className="text-[#111827]">Total</span>
              <span className="text-[#2563EB]">₹{order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info - Compact */}
        <Card className="border-0 shadow-sm mb-6 bg-white">
          <CardContent className="p-4 text-xs space-y-2">
            <div>
              <p className="text-[#6B7280] font-semibold uppercase mb-1">
                Payment Method
              </p>
              <p className="font-semibold text-[#111827]">
                {order.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-[#6B7280] font-semibold uppercase mb-1">
                Order Type
              </p>
              <p className="font-semibold text-[#111827]">
                {order.orderType.charAt(0).toUpperCase() +
                  order.orderType.slice(1)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Contact Info - Compact */}
        <Card className="border-0 shadow-sm mb-6 bg-white">
          <CardHeader className="p-4 pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wide flex items-center gap-2">
              <User size={16} className="text-[#2563EB]" />
              Contact Information
            </h2>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-2">
            <div>
              <p className="text-[#6B7280] font-semibold uppercase mb-1">
                Name
              </p>
              <p className="text-[#111827] font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[#6B7280] font-semibold uppercase mb-1">
                Email
              </p>
              <p className="text-[#111827] font-medium break-all">
                {order.customerEmail}
              </p>
            </div>
            <div>
              <p className="text-[#6B7280] font-semibold uppercase mb-1">
                Phone
              </p>
              <p className="text-[#111827] font-medium">
                {order.customerPhone}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            className="flex-1 py-2 rounded-lg font-semibold text-sm"
            onClick={() => onNavigate("account", { tab: "orders" })}
          >
            Back to Orders
          </Button>
          <Button
            variant="outline"
            className="flex-1 py-2 rounded-lg font-semibold text-sm"
            onClick={() => onNavigate("home")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
