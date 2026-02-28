import React, { useState } from "react";
import { Eye, Download, Filter, Plus } from "lucide-react";
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
import { Select } from "../ui/select";
import { Modal } from "../ui/Modal";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export function AdminOrdersPage() {
  const appContext = useContext(AppContext);
  const orders = appContext?.orders || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orderTypes = [
    { value: "all", label: "All Types" },
    { value: "online", label: "Online Orders" },
    { value: "offline", label: "Offline Orders" },
    { value: "reseller", label: "Reseller Orders" },
  ];

  const orderStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || order.orderType === filterType;
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case "online":
        return "info";
      case "offline":
        return "success";
      case "reseller":
        return "warning";
      default:
        return "default";
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    // In real app, this would call API to update order status
    console.log("Updating order status to:", newStatus);
    setSelectedOrder(null);
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
            Manage all orders - Online, Offline, and Reseller
          </p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Create Order
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders..."
          />
          <Select
            options={orderTypes}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <Select
            options={orderStatuses}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Orders Table - Responsive wrapper */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[90px]">Order ID</TableHead>
                <TableHead className="min-w-[120px]">Customer</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[70px]">
                  Type
                </TableHead>
                <TableHead className="min-w-[60px]">Items</TableHead>
                <TableHead className="hidden md:table-cell min-w-[80px]">
                  Total
                </TableHead>
                <TableHead className="hidden lg:table-cell min-w-[90px]">
                  Payment
                </TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[80px]">
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
                      {order.id.substring(0, 6)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#1a2332] text-xs sm:text-sm line-clamp-1">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-[#64748b] hidden sm:block">
                        {order.customerPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={getOrderTypeColor(order.orderType)}
                      className="text-xs"
                    >
                      {order.orderType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {order.items.length}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-semibold text-xs sm:text-sm">
                      ₹{(order.total / 1000).toFixed(0)}K
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(order.status)}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors flex-shrink-0"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors flex-shrink-0"
                        title="Download Invoice"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details - ${selectedOrder.id}`}
          size="xl"
          footer={
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Button variant="soft">
                <Download size={16} className="mr-2" />
                Download Invoice
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-[#6B7280]">
                  Order Type
                </label>
                <Badge
                  variant={getOrderTypeColor(selectedOrder.orderType)}
                  className="mt-2"
                >
                  {selectedOrder.orderType}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-[#6B7280]">
                  Status
                </label>
                <div className="mt-2">
                  <Select
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "processing", label: "Processing" },
                      { value: "shipped", label: "Shipped" },
                      { value: "delivered", label: "Delivered" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#6B7280]">
                  Payment Method
                </label>
                <p className="text-[#111827] mt-2">
                  {selectedOrder.paymentMethod}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="font-semibold text-[#111827] mb-3">
                Customer Details
              </h3>
              <div className="bg-[#F9FAFB] rounded-2xl p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#6B7280]">Name</label>
                    <p className="text-[#111827] font-medium">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7280]">Email</label>
                    <p className="text-[#111827]">
                      {selectedOrder.customerEmail}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#6B7280]">Phone</label>
                    <p className="text-[#111827]">
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-[#111827] mb-3">
                Shipping Address
              </h3>
              <div className="bg-[#F9FAFB] rounded-2xl p-4">
                <p className="text-[#111827]">
                  {selectedOrder.shippingAddress.addressLine1}
                </p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p className="text-[#111827]">
                    {selectedOrder.shippingAddress.addressLine2}
                  </p>
                )}
                <p className="text-[#111827]">
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state} -{" "}
                  {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-[#111827] mb-3">Order Items</h3>
              <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border-b border-[#E5E7EB] last:border-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#111827]">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-[#111827]">
                      ₹{(item.product.retailPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#EFF6FF] rounded-2xl p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[#1E3A8A]">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#1E3A8A] pt-2 border-t border-blue-200">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
