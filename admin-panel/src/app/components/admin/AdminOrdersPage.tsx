import React, { useState, useEffect } from "react";
import { Eye, Download, Filter, ChevronDown, FileDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { SearchBar } from "../ui/SearchBar";
import { Modal } from "../ui/Modal";
import { firestore } from "../../services/firebase-config";
import JSZip from "jszip";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

const STATUS_TABS = [
  { id: "pending", label: "Pending", color: "#FBBF24" },
  { id: "processing", label: "Processing", color: "#3B82F6" },
  { id: "shipped", label: "Shipped", color: "#8B5CF6" },
  { id: "in-transit", label: "In Transit", color: "#06B6D4" },
  { id: "delivered", label: "Delivered", color: "#10B981" },
  { id: "cancelled", label: "Cancelled", color: "#EF4444" },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Firestore
  useEffect(() => {
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    const matchesTab = order.status === selectedTab;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    const tab = STATUS_TABS.find((t) => t.id === status);
    if (!tab) return "default";

    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "warning";
      case "in-transit":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    let date;

    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") {
      // Milliseconds
      date = new Date(timestamp);
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    }

    if (!date || isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  // Download customization as ZIP
  const downloadCustomizationAsZip = async (item: any, itemIndex: number) => {
    try {
      const zip = new JSZip();
      const customizationFolder = zip.folder("customization");

      if (!customizationFolder) return;

      // Add text fields
      if (item.customization?.customTextFields) {
        let textContent = "=== CUSTOMIZATION TEXT FIELDS ===\n\n";
        Object.entries(item.customization.customTextFields).forEach(
          ([key, value]: any) => {
            textContent += `Field ID: ${key}\nValue: ${value}\n\n`;
          },
        );
        customizationFolder.file("text_fields.txt", textContent);
      }

      // Add images
      if (item.customization?.imageFields) {
        const imagesFolder = customizationFolder.folder("images");
        if (!imagesFolder) return;

        let imageIndex = 1;
        for (const [key, urls] of Object.entries(
          item.customization.imageFields,
        )) {
          if (Array.isArray(urls)) {
            for (const url of urls) {
              const response = await fetch(url as string);
              const blob = await response.blob();
              const filename = `image_field_${key}_${imageIndex}.jpg`;
              imagesFolder.file(filename, blob);
              imageIndex++;
            }
          }
        }
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customization_${selectedOrder.id}_item_${itemIndex + 1}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading customization:", error);
      alert("Failed to download customization");
    }
  };

  // Update order status in both collections
  const updateOrderStatus = async (newStatus: string, order?: any) => {
    const targetOrder = order || selectedOrder;
    if (!targetOrder) return;

    try {
      // Update in orders collection
      const orderRef = doc(firestore, "orders", targetOrder.id);
      await updateDoc(orderRef, { status: newStatus });

      // Update in users subcollection
      const userOrderRef = doc(
        firestore,
        "users",
        targetOrder.customerId,
        "orders",
        targetOrder.id,
      );
      await updateDoc(userOrderRef, { status: newStatus });

      if (selectedOrder?.id === targetOrder.id) {
        setSelectedOrder(null);
      }
      alert("✓ Order status updated in both orders & user collections!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
            Order Management
          </h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            Manage all customer orders - Update status and track progress
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                selectedTab === tab.id
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-[#f3f4f6] text-[#1a2332] hover:bg-[#e5e7eb]"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  selectedTab === tab.id ? "bg-white/30" : "bg-[#d1d5db]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <Card className="p-4 md:p-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order ID, customer name, or phone..."
        />
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-[#64748b]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#64748b]">
              No orders found in {selectedTab} status
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Order ID</TableHead>
                  <TableHead className="min-w-[140px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Phone</TableHead>
                  <TableHead className="min-w-[60px]">Items</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[70px]">
                    Total
                  </TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">
                    Payment
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[90px]">
                    Date
                  </TableHead>
                  <TableHead className="min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-semibold text-[#1e40af] text-xs sm:text-sm">
                        {order.id.substring(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1a2332] text-xs sm:text-sm line-clamp-1">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-[#64748b] hidden sm:block">
                          {order.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.customerPhone}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-medium">
                      {order.items?.length || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-semibold text-xs sm:text-sm">
                        ₹{order.total?.toFixed(0) || 0}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                      {order.paymentMethod || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusColor(order.status)}
                          className="text-xs whitespace-nowrap"
                        >
                          {order.status}
                        </Badge>
                        {(() => {
                          const currentIdx = STATUS_TABS.findIndex(
                            (tab) => tab.id === order.status,
                          );
                          const nextTab = STATUS_TABS[currentIdx + 1];

                          if (!nextTab) {
                            return null;
                          }

                          return (
                            <button
                              onClick={() =>
                                updateOrderStatus(nextTab.id, order)
                              }
                              className="px-2 py-1 text-xs bg-[#2563eb] text-white rounded hover:bg-[#1e40af] transition-colors font-medium"
                              title={`Move to ${nextTab.label}`}
                            >
                              Next →
                            </button>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id.substring(0, 8).toUpperCase()}`}
          size="xl"
          footer={
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Order Header Info */}
            <div className="bg-gradient-to-r from-[#EFF6FF] to-white rounded-xl p-4 border border-[#e5e7eb]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] uppercase font-semibold">
                    Order Date
                  </p>
                  <p className="text-[#111827] font-semibold mt-1">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] uppercase font-semibold">
                    Status
                  </p>
                  <Badge
                    variant={getStatusColor(selectedOrder.status)}
                    className="mt-1 text-xs"
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] uppercase font-semibold">
                    Payment
                  </p>
                  <p className="text-[#111827] font-semibold mt-1 text-sm">
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] uppercase font-semibold">
                    Total Items
                  </p>
                  <p className="text-[#111827] font-semibold mt-1 text-sm">
                    {selectedOrder.items?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Change Note */}
            <div className="border border-[#bfdbfe] rounded-xl p-4 bg-[#eff6ff]">
              <div className="flex items-start gap-2">
                <div className="text-[#1e40af] font-bold mt-0.5">ℹ</div>
                <div>
                  <p className="text-sm font-semibold text-[#1e40af]">
                    Change Status From Table
                  </p>
                  <p className="text-xs text-[#1e3a8a] mt-1">
                    Click the status badge in the orders list above to change
                    status. Updates are saved to both <strong>orders</strong>{" "}
                    and <strong>users/orders</strong> collections automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div>
                <h3 className="font-semibold text-[#111827] mb-3 text-sm uppercase tracking-wider">
                  <span className="text-[#1e40af]">●</span> Customer
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold">Name</p>
                    <p className="text-[#111827] font-medium mt-0.5">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold">
                      Email
                    </p>
                    <p className="text-[#111827] break-all text-xs mt-0.5">
                      {selectedOrder.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold">
                      Phone
                    </p>
                    <p className="text-[#111827] font-medium mt-0.5">
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="font-semibold text-[#111827] mb-3 text-sm uppercase tracking-wider">
                    <span className="text-[#1e40af]">●</span> Shipping Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[#111827] font-medium">
                        {selectedOrder.shippingAddress.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#111827]">
                        {selectedOrder.shippingAddress.addressLine1}
                      </p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p className="text-[#111827]">
                          {selectedOrder.shippingAddress.addressLine2}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[#111827]">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state} -{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">
                        Ph: {selectedOrder.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items - Enhanced with Customization */}
            <div>
              <h3 className="font-semibold text-[#111827] mb-3 text-sm uppercase tracking-wider">
                <span className="text-[#1e40af]">●</span> Order Items
              </h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="border border-[#e5e7eb] rounded-lg overflow-hidden"
                  >
                    {/* Item Main Info */}
                    <div className="p-4 bg-white">
                      <div className="flex gap-4">
                        <img
                          src={
                            item.product?.images?.[0]?.url ||
                            "https://via.placeholder.com/80"
                          }
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg border border-[#e5e7eb]"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-[#111827]">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-[#6B7280] mt-1">
                                SKU: {item.product?.sku || "N/A"}
                              </p>
                              <p className="text-sm font-medium text-[#111827] mt-2">
                                Qty:{" "}
                                <span className="text-[#1e40af]">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#6B7280]">Price</p>
                              <p className="font-bold text-[#111827] text-lg">
                                ₹{item.product?.sellingPrice?.toFixed(2) || 0}
                              </p>
                              <p className="text-xs text-[#6B7280] mt-1">
                                Total: ₹
                                {(
                                  item.product?.sellingPrice * item.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customization Details - Expandable */}
                    {item.customization && (
                      <button
                        onClick={() =>
                          setStatusDropdown(
                            statusDropdown === `custom-${index}`
                              ? null
                              : `custom-${index}`,
                          )
                        }
                        className="w-full px-4 py-3 bg-[#f3f4f6] border-t border-[#e5e7eb] text-left hover:bg-[#e5e7eb] transition-colors flex items-center justify-between"
                      >
                        <p className="text-sm font-medium text-[#1e40af] flex items-center gap-2">
                          <span>✓</span> View Customization Details
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadCustomizationAsZip(item, index);
                            }}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#1e40af]"
                            title="Download as ZIP"
                          >
                            <FileDown size={18} />
                          </button>
                          <ChevronDown
                            size={18}
                            className={`transition-transform text-[#1e40af] ${statusDropdown === `custom-${index}` ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                    )}

                    {/* Customization Content - Expandable */}
                    {item.customization &&
                      statusDropdown === `custom-${index}` && (
                        <div className="bg-[#f9fafb] border-t border-[#e5e7eb] p-4 space-y-4">
                          <div>
                            <p className="text-xs text-[#6B7280] font-semibold uppercase mb-2">
                              Custom Text Fields
                            </p>
                            {item.customization.customTextFields ? (
                              <div className="space-y-2">
                                {Object.entries(
                                  item.customization.customTextFields,
                                ).map(([key, value]: any) => (
                                  <div
                                    key={key}
                                    className="bg-white rounded p-2 border border-[#e5e7eb]"
                                  >
                                    <p className="text-xs text-[#6B7280]">
                                      Field {key}
                                    </p>
                                    <p className="text-sm text-[#111827] font-medium">
                                      {value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#6B7280]">
                                No text fields
                              </p>
                            )}
                          </div>

                          {/* Custom Images */}
                          {item.customization.imageFields &&
                            Object.keys(item.customization.imageFields).length >
                              0 && (
                              <div>
                                <p className="text-xs text-[#6B7280] font-semibold uppercase mb-2">
                                  Custom Images
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(
                                    item.customization.imageFields,
                                  ).map(([key, urls]: any) => (
                                    <div key={key}>
                                      {Array.isArray(urls) &&
                                        urls.map((url: string, idx: number) => (
                                          <img
                                            key={idx}
                                            src={url}
                                            alt={`Custom ${key}`}
                                            className="w-full h-20 object-cover rounded border border-[#e5e7eb]"
                                          />
                                        ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-[#eff6ff] to-[#f0f9ff] rounded-xl p-6 border border-[#bfdbfe]">
              <div className="space-y-3">
                <div className="flex justify-between text-[#1e3a8a]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">
                    ₹{selectedOrder.total?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="border-t border-[#bfdbfe] pt-3 flex justify-between text-lg font-bold text-[#1e40af]">
                  <span>Order Total</span>
                  <span>₹{selectedOrder.total?.toFixed(2) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
