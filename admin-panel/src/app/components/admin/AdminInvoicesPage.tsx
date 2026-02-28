import React, { useState, useEffect } from "react";
// @ts-ignore
import { Plus, Download, Eye, Trash2, Printer } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  getAllInvoices,
  getInvoiceStats,
  deleteInvoice,
  getAllProducts,
  getAllUsers,
} from "../../services/firestore-service";
import { Invoice, Product, User } from "../../types";
import { CreateInvoiceForm } from "./invoice/CreateInvoiceForm";
import { InvoiceDetailModal } from "./invoice/InvoiceDetailModal";
import { toast } from "sonner";
// Gifts billing imports
import {
  getAllBillsFromFirestore,
  deleteBillFromFirestore,
} from "../../gifts/services/giftsFirestoreService";
import { Bill } from "../../gifts/types";
import { formatDate } from "../../gifts/utils/calculations";
import {
  downloadInvoice as downloadGiftInvoice,
  printInvoice as printGiftInvoice,
} from "../../gifts/services/pdfGeneratorService";
import { InvoicePreview } from "../../gifts/components/InvoicePreview";

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [giftBills, setGiftBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGiftPreview, setShowGiftPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("regular");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesData, statsData, productsData, customersData, billsData] =
        await Promise.all([
          getAllInvoices(),
          getInvoiceStats(),
          getAllProducts(),
          getAllUsers(),
          getAllBillsFromFirestore().catch(() => []), // Handle error gracefully
        ]);

      setInvoices(invoicesData);
      setGiftBills(billsData || []);
      setStats(statsData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentStatusOptions = [
    { value: "all", label: "All Payment Status" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "partial", label: "Partial" },
  ];

  // Filter regular invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPaymentStatus =
      filterPaymentStatus === "all" ||
      invoice.paymentStatus === filterPaymentStatus;
    return matchesSearch && matchesPaymentStatus;
  });

  // Filter gift bills
  const filteredBills = giftBills.filter((bill) => {
    const customerName = bill.customerDetails?.name || "";
    const customerPhone = bill.customerDetails?.phone || "";
    const billNumber = bill.billNumber || "";

    const matchesSearch =
      billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPhone.includes(searchQuery);

    const matchesPaymentStatus =
      filterPaymentStatus === "all" ||
      bill.paymentStatus === filterPaymentStatus;

    return matchesSearch && matchesPaymentStatus;
  });

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(invoiceId);
        setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
        toast.success("Invoice deleted successfully");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast.error("Failed to delete invoice");
      }
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await deleteBillFromFirestore(billId);
        setGiftBills(giftBills.filter((bill) => bill.id !== billId));
        toast.success("Bill deleted successfully");
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast.error("Failed to delete bill");
      }
    }
  };

  const handleInvoiceCreated = () => {
    setShowCreateModal(false);
    loadData();
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowGiftPreview(true);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  // Calculate combined stats
  const combinedStats = {
    totalInvoices: (stats?.totalInvoices || 0) + giftBills.length,
    totalRevenue:
      (stats?.totalRevenue || 0) +
      giftBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    paidInvoices:
      (stats?.paidInvoices || 0) +
      giftBills.filter((b) => b.paymentStatus === "paid").length,
    pendingInvoices:
      (stats?.pendingInvoices || 0) +
      giftBills.filter((b) => b.paymentStatus === "pending").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
            Invoice Management
          </h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            Manage all invoices and gift billing
          </p>
        </div>
        {activeTab === "regular" && (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus width={20} height={20} className="mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Combined Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card hover className="p-3 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="bg-blue-500 text-white p-2 md:p-3 rounded-lg">
              <span className="text-lg md:text-xl">📊</span>
            </div>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-[#0f1419] mb-1">
            {combinedStats.totalInvoices}
          </h3>
          <p className="text-xs md:text-sm text-[#64748b]">Total Invoices</p>
        </Card>

        <Card hover className="p-3 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="bg-green-500 text-white p-2 md:p-3 rounded-lg">
              <span className="text-lg md:text-xl">₹</span>
            </div>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-[#0f1419] mb-1">
            ₹{combinedStats.totalRevenue.toLocaleString()}
          </h3>
          <p className="text-xs md:text-sm text-[#64748b]">Total Revenue</p>
        </Card>

        <Card hover className="p-3 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="bg-emerald-500 text-white p-2 md:p-3 rounded-lg">
              <span className="text-lg md:text-xl">✓</span>
            </div>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-[#0f1419] mb-1">
            {combinedStats.paidInvoices}
          </h3>
          <p className="text-xs md:text-sm text-[#64748b]">Paid Invoices</p>
        </Card>

        <Card hover className="p-3 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="bg-amber-500 text-white p-2 md:p-3 rounded-lg">
              <span className="text-lg md:text-xl">⏳</span>
            </div>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-[#0f1419] mb-1">
            {combinedStats.pendingInvoices}
          </h3>
          <p className="text-xs md:text-sm text-[#64748b]">Pending Payment</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by invoice number, customer, or phone..."
          />
          <Select
            options={paymentStatusOptions}
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabs for Regular Invoices and Gift Bills */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 border-b">
            <TabsTrigger value="regular">Regular Invoices</TabsTrigger>
            <TabsTrigger value="gift">Gift Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="regular" className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Invoice #</TableHead>
                    <TableHead className="min-w-[120px]">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[60px]">
                      Items
                    </TableHead>
                    <TableHead className="min-w-[80px]">Total</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">
                      Payment Status
                    </TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-500">
                          No invoices found. Create one to get started!
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono font-bold">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {invoice.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {invoice.customerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {invoice.items.length}
                        </TableCell>
                        <TableCell className="font-bold">
                          ₹{invoice.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={getPaymentStatusColor(
                              invoice.paymentStatus,
                            )}
                          >
                            {invoice.paymentStatus.charAt(0).toUpperCase() +
                              invoice.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1 hover:bg-blue-50 rounded"
                              title="View Invoice"
                            >
                              <Eye
                                width={16}
                                height={16}
                                className="text-blue-600"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-1 hover:bg-red-50 rounded"
                              title="Delete Invoice"
                            >
                              <Trash2
                                width={16}
                                height={16}
                                className="text-red-600"
                              />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="gift" className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Bill #</TableHead>
                    <TableHead className="min-w-[120px]">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[80px]">
                      Items
                    </TableHead>
                    <TableHead className="min-w-[80px]">Amount</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-500">No gift bills found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono font-bold">
                          {bill.billNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {bill.customerDetails?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {bill.customerDetails?.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {bill.items.length}
                        </TableCell>
                        <TableCell className="font-bold">
                          ₹{bill.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={getPaymentStatusColor(bill.paymentStatus)}
                          >
                            {bill.paymentStatus.charAt(0).toUpperCase() +
                              bill.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {formatDate(bill.billDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewBill(bill)}
                              className="p-1 hover:bg-blue-50 rounded"
                              title="Preview"
                            >
                              <Eye
                                width={16}
                                height={16}
                                className="text-blue-600"
                              />
                            </button>
                            <button
                              onClick={() => printGiftInvoice(bill)}
                              className="p-1 hover:bg-green-50 rounded"
                              title="Print"
                            >
                              <Printer
                                width={16}
                                height={16}
                                className="text-green-600"
                              />
                            </button>
                            <button
                              onClick={() => downloadGiftInvoice(bill)}
                              className="p-1 hover:bg-purple-50 rounded"
                              title="Download"
                            >
                              <Download
                                width={16}
                                height={16}
                                className="text-purple-600"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill.id)}
                              className="p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2
                                width={16}
                                height={16}
                                className="text-red-600"
                              />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Invoice"
        size="lg"
      >
        <CreateInvoiceForm
          products={products}
          customers={customers}
          onSuccess={handleInvoiceCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Regular Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          isOpen={showDetailModal}
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
          onUpdate={loadData}
        />
      )}

      {/* Gift Bill Preview Modal */}
      {selectedBill && (
        <InvoicePreview
          isOpen={showGiftPreview}
          bill={selectedBill}
          onClose={() => {
            setShowGiftPreview(false);
            setSelectedBill(null);
          }}
          onDownload={() => downloadGiftInvoice(selectedBill)}
          onPrint={() => printGiftInvoice(selectedBill)}
        />
      )}
    </div>
  );
}
