// Main Gifts Billing Page - MVP
import React, { useState, useEffect } from "react";
import { Bill, PaymentDetails, Customer } from "../types";
import { useBillCalculations } from "../hooks/useBillCalculations";
import { useProductInventory } from "../hooks/useProductInventory";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
import { generateBillNumber, formatDate } from "../utils/calculations";
import {
  generateInvoicePDF,
  downloadInvoice,
  printInvoice,
} from "../services/pdfGeneratorService";
import {
  saveBillToFirestore,
  uploadBillPDFToStorage,
  saveCustomerToFirestore,
} from "../services/giftsFirestoreService";
import { validateBill } from "../utils/validations";
import { ProductListItem } from "../components/ProductListItem";
import { BillSummary } from "../components/BillSummary";
import { CustomerSearch } from "../components/CustomerSearch";
import { PaymentModal } from "../components/PaymentModal";
import { InvoicePreview } from "../components/InvoicePreview";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Plus, RotateCcw, Download, Eye, Loader } from "lucide-react";

export const GiftsBillingPage: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [billId, setBillId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===== CUSTOM HOOKS =====
  const {
    items,
    appliedDiscounts,
    calculations,
    addItem,
    removeItem,
    updateItemQuantity,
    clearItems,
    addDiscount,
    removeDiscount,
  } = useBillCalculations();

  const {
    products,
    filteredProducts,
    loading: productsLoading,
    filterProducts,
    getProductById,
    getCategories,
  } = useProductInventory();

  const {
    searchResults,
    selectedCustomer,
    loading: customerLoading,
    error: customerError,
    searchByPhone,
    searchByName,
    selectCustomer,
    createNewCustomer,
  } = useCustomerSearch();

  // ===== HANDLERS =====
  const handleAddToCart = (product: any, quantity: number) => {
    if (product.stock < quantity) {
      setErrorMessage(`Only ${product.stock} units available`);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    addItem(product.id, product.name, quantity, product.price, product.taxRate);

    setSuccessMessage(`${product.name} added to bill`);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleCreateNewCustomer = () => {
    selectCustomer({
      id: `cust-${Date.now()}`,
      phone: "",
      firstName: "",
      totalPurchases: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Customer);
  };

  const handleClearBill = () => {
    if (items.length > 0 && !confirm("Clear all items from bill?")) {
      return;
    }
    clearItems();
    setErrorMessage("");
  };

  const handlePaymentComplete = async (
    payments: PaymentDetails[],
    totalPaid: number,
  ) => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Validate bill
      const billErrors = validateBill({
        items,
        billDate: new Date(),
        totalAmount: calculations.total,
      });

      if (billErrors.length > 0) {
        setErrorMessage(billErrors[0]);
        setIsProcessing(false);
        return;
      }

      // Create bill object
      const newBill: Bill = {
        id: billId || `bill-${Date.now()}`,
        billNumber: generateBillNumber(),
        customerId: selectedCustomer?.id,
        customerDetails: selectedCustomer
          ? {
              name: `${selectedCustomer.firstName} ${selectedCustomer.lastName || ""}`.trim(),
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
            }
          : undefined,
        items,
        subtotal: calculations.subtotal,
        discounts: appliedDiscounts,
        totalDiscount: calculations.totalDiscount,
        taxAmount: calculations.totalTax,
        totalAmount: calculations.total,
        balanceDue: Math.max(0, calculations.total - totalPaid),
        paymentStatus:
          totalPaid >= calculations.total
            ? "paid"
            : totalPaid > 0
              ? "partial"
              : "pending",
        paymentDetails: payments,
        billDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save bill to Firestore
      const savedBillId = await saveBillToFirestore(newBill);
      newBill.id = savedBillId;

      // Save customer if new
      if (
        selectedCustomer &&
        !selectedCustomer.id.startsWith("cust-") === false
      ) {
        await saveCustomerToFirestore({
          ...selectedCustomer,
          totalPurchases: (selectedCustomer.totalPurchases || 0) + 1,
          totalSpent: (selectedCustomer.totalSpent || 0) + newBill.totalAmount,
          lastPurchaseDate: new Date(),
        });
      }

      // Generate and upload PDF
      try {
        const pdfBlob = generateInvoicePDF(newBill);
        const pdfUrl = await uploadBillPDFToStorage(savedBillId, pdfBlob);
        newBill.pdfUrl = pdfUrl;
      } catch (pdfError) {
        console.error("PDF upload failed:", pdfError);
        // Continue without PDF URL - not critical for UV
      }

      setCompletedBill(newBill);
      setShowPaymentModal(false);
      setShowInvoicePreview(true);
      setSuccessMessage("Bill created successfully!");

      // Clear bill for next transaction
      setTimeout(() => {
        clearItems();
        selectCustomer(null as any);
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to process payment",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = (bill: Bill) => {
    downloadInvoice(bill);
    setSuccessMessage("Invoice downloaded");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handlePrintInvoice = (bill: Bill) => {
    printInvoice(bill);
  };

  // ===== FILTER PRODUCTS =====
  useEffect(() => {
    filterProducts({
      category: categoryFilter || undefined,
      searchTerm: searchTerm || undefined,
      inStockOnly: true,
    });
  }, [categoryFilter, searchTerm, filterProducts]);

  const categories = getCategories();
  const isReadyForPayment = items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a2332] mb-1">
            Gifts Billing & Invoicing
          </h2>
          <p className="text-sm text-[#64748b]">
            Create professional invoices and manage gift sales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="px-4 py-2 bg-blue-100 text-blue-700 border-blue-200">
            {formatDate(new Date())}
          </Badge>
          <div className="text-right text-xs text-[#64748b]">
            <div className="font-semibold text-[#1a2332]">Ready</div>
            <div>System Online</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              ✓
            </div>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
              !
            </div>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Products and Bill */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <CustomerSearch
            searchResults={searchResults}
            selectedCustomer={selectedCustomer}
            loading={customerLoading}
            error={customerError}
            onSearch={(query, type) =>
              type === "phone" ? searchByPhone(query) : searchByName(query)
            }
            onSelectCustomer={selectCustomer}
            onCreateNewCustomer={handleCreateNewCustomer}
          />

          {/* Products Section */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 md:p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-border/50">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="font-bold text-lg text-[#1a2332]">
                  Select Products
                </h3>
              </div>
              <p className="text-xs text-[#64748b] ml-4">
                {filteredProducts.length} products available
              </p>
            </div>
            <div className="p-5 md:p-6 space-y-5">
              {/* Filters */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-white border-border/50 focus:border-primary"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={categoryFilter === "" ? "primary" : "outline"}
                    onClick={() => setCategoryFilter("")}
                    className="transition-all"
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={
                        categoryFilter === category ? "primary" : "outline"
                      }
                      onClick={() => setCategoryFilter(category)}
                      className="transition-all"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Products List */}
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="text-[#64748b] font-medium">
                    Loading products from catalog...
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 rounded-lg border border-dashed border-border/50">
                  <div className="mb-3 text-4xl">📦</div>
                  <p className="text-[#64748b] font-medium mb-1">
                    No products found
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Try adjusting your filters or search term
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 rounded-lg border border-border/50 overflow-hidden">
                  {filteredProducts.map((product) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isDisabled={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Bill Summary */}
        <div className="space-y-6">
          <BillSummary
            items={items}
            calculations={calculations}
            appliedDiscounts={appliedDiscounts}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateItemQuantity}
            onRemoveDiscount={removeDiscount}
            isReadOnly={false}
          />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowInvoicePreview(true)}
              disabled={!isReadyForPayment}
              variant="primary"
              className="w-full font-medium h-11 shadow-sm hover:shadow-md transition-all"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Invoice
            </Button>

            <Button
              onClick={() => setShowPaymentModal(true)}
              disabled={!isReadyForPayment || isProcessing}
              className="w-full font-medium h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </>
              )}
            </Button>

            <Button
              onClick={handleClearBill}
              disabled={items.length === 0}
              variant="outline"
              className="w-full h-10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Bill
            </Button>
          </div>

          {/* Premium Info Card */}
          {items.length > 0 && (
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    Pro Tip
                  </p>
                  <p className="text-xs text-blue-700">
                    Preview your invoice to verify all details before finalizing
                    payment
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          {items.length > 0 && (
            <Card className="p-4 border border-border/50 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[#64748b]">
                    Items in Bill
                  </span>
                  <Badge className="bg-blue-100 text-blue-700 font-semibold">
                    {items.length}
                  </Badge>
                </div>
                <div className="h-px bg-border/50"></div>
                <div className="text-right">
                  <p className="text-xs text-[#64748b] mb-1">Bill Total</p>
                  <p className="text-xl font-bold text-[#1a2332]">
                    ₹{calculations.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        calculations={calculations}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
      />

      {completedBill && (
        <InvoicePreview
          isOpen={showInvoicePreview}
          bill={completedBill}
          onClose={() => {
            setShowInvoicePreview(false);
            setCompletedBill(null);
          }}
          onDownload={handleDownloadInvoice}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
};
