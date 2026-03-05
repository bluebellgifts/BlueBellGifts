// Main Gifts Billing Page - POS Style
import React, { useState, useEffect, useRef } from "react";
import { Bill, PaymentDetails, Customer } from "../types";
import { useBillCalculations } from "../hooks/useBillCalculations";
import { useProductInventory } from "../hooks/useProductInventory";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
import {
  generateBillNumber,
  formatDate,
  formatCurrency,
} from "../utils/calculations";
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
import { InvoicePreview } from "../components/InvoicePreview";
import { PaymentModal } from "../components/PaymentModal";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  User,
  X,
  Phone,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Loader,
  RotateCcw,
  ChevronRight,
  Package,
} from "lucide-react";

export const GiftsBillingPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSearchType, setCustomerSearchType] = useState<
    "phone" | "name"
  >("phone");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const {
    items,
    appliedDiscounts,
    calculations,
    addItem,
    removeItem,
    updateItemQuantity,
    clearItems,
    removeDiscount,
  } = useBillCalculations();

  const {
    products,
    filteredProducts,
    loading: productsLoading,
    filterProducts,
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
  } = useCustomerSearch();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Customer search debounce
  const handleCustomerInput = (value: string) => {
    setCustomerQuery(value);
    setShowCustomerDropdown(value.trim().length > 0);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (value.trim()) {
      const t = setTimeout(() => {
        customerSearchType === "phone"
          ? searchByPhone(value)
          : searchByName(value);
      }, 300);
      setDebounceTimer(t);
    }
  };

  const handleSelectCustomer = (c: Customer) => {
    selectCustomer(c);
    setCustomerQuery("");
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    selectCustomer(null as any);
    setCustomerQuery("");
    setShowCustomerDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      )
        setShowCustomerDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle adding product
  const handleAddProduct = (product: any) => {
    if (product.stock === 0) {
      showToast("Out of stock", "error");
      return;
    }
    // If already in cart, increment qty
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast(`Max stock: ${product.stock}`, "error");
        return;
      }
      updateItemQuantity(existing.id, existing.quantity + 1);
    } else {
      addItem(product.id, product.name, 1, product.price, product.taxRate);
    }
    showToast(`${product.name} added`, "success");
  };

  // Product filter
  useEffect(() => {
    filterProducts({
      category: categoryFilter || undefined,
      searchTerm: searchTerm || undefined,
      inStockOnly: true,
    });
  }, [categoryFilter, searchTerm, filterProducts]);

  const categories = getCategories();

  const handlePaymentComplete = async (
    payments: PaymentDetails[],
    totalPaid: number,
  ) => {
    setIsProcessing(true);
    try {
      const billErrors = validateBill({
        items,
        billDate: new Date(),
        totalAmount: calculations.total,
      });
      if (billErrors.length > 0) {
        showToast(billErrors[0], "error");
        setIsProcessing(false);
        return;
      }

      const newBill: Bill = {
        id: `bill-${Date.now()}`,
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

      const savedBillId = await saveBillToFirestore(newBill);
      newBill.id = savedBillId;

      if (selectedCustomer && !selectedCustomer.id.startsWith("cust-")) {
        await saveCustomerToFirestore({
          ...selectedCustomer,
          totalPurchases: (selectedCustomer.totalPurchases || 0) + 1,
          totalSpent: (selectedCustomer.totalSpent || 0) + newBill.totalAmount,
          lastPurchaseDate: new Date(),
        });
      }

      try {
        const pdfBlob = generateInvoicePDF(newBill);
        const pdfUrl = await uploadBillPDFToStorage(savedBillId, pdfBlob);
        newBill.pdfUrl = pdfUrl;
      } catch {}

      setCompletedBill(newBill);
      setShowPaymentModal(false);
      setShowInvoicePreview(true);
      showToast("Bill created successfully!");
      setTimeout(() => {
        clearItems();
        handleClearCustomer();
      }, 1500);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to process payment",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* ===== TOAST ===== */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toastMsg.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
        >
          {toastMsg.type === "success" ? "âœ“" : "!"} {toastMsg.text}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Gifts Billing
            </h1>
            <p className="text-xs text-gray-400">{formatDate(new Date())}</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all items?")) {
                clearItems();
                handleClearCustomer();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Bill
          </button>
        )}
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ===== LEFT: PRODUCTS ===== */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          {/* Customer Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex gap-2 items-center" ref={customerDropdownRef}>
              {selectedCustomer ? (
                <div className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedCustomer.firstName}{" "}
                      {selectedCustomer.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  {selectedCustomer.totalPurchases > 0 && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex-shrink-0">
                      {selectedCustomer.totalPurchases} orders
                    </Badge>
                  )}
                  <button
                    onClick={handleClearCustomer}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 relative">
                  <div className="flex gap-2">
                    <select
                      value={customerSearchType}
                      onChange={(e) => {
                        setCustomerSearchType(e.target.value as any);
                        setCustomerQuery("");
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 focus:outline-none"
                    >
                      <option value="phone">📞 Phone</option>
                      <option value="name">👤 Name</option>
                    </select>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={customerQuery}
                        onChange={(e) => handleCustomerInput(e.target.value)}
                        placeholder={
                          customerSearchType === "phone"
                            ? "Search by phone..."
                            : "Search by name..."
                        }
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                      {customerQuery && (
                        <button
                          onClick={() => {
                            setCustomerQuery("");
                            setShowCustomerDropdown(false);
                          }}
                          className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer dropdown */}
                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {customerLoading ? (
                        <div className="p-3 flex items-center gap-2 text-sm text-gray-500">
                          <Loader className="w-4 h-4 animate-spin" />{" "}
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                          {searchResults.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleSelectCustomer(c)}
                              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-3"
                            >
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {c.firstName} {c.lastName || ""}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {c.phone}
                                </p>
                              </div>
                              {c.totalPurchases > 0 && (
                                <span className="text-xs text-green-600 font-medium flex-shrink-0">
                                  {c.totalPurchases} orders
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : customerError ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          {customerError}
                        </div>
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No customers found
                        </div>
                      )}
                      <button
                        onClick={() => {
                          selectCustomer({
                            id: `cust-${Date.now()}`,
                            phone: customerQuery,
                            firstName: "Walk-in",
                            totalPurchases: 0,
                            totalSpent: 0,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          } as Customer);
                          setCustomerQuery("");
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full p-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t border-gray-100 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Walk-in / New Customer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search + Category Filter */}
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex-shrink-0 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {categories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                <button
                  onClick={() => setCategoryFilter("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${categoryFilter === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCategoryFilter(cat === categoryFilter ? "" : cat)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${categoryFilter === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Loader className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Package className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const cartItem = items.find(
                    (i) => i.productId === product.id,
                  );
                  const isOutOfStock = product.stock === 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      disabled={isOutOfStock}
                      className={`relative bg-white rounded-xl border transition-all text-left group ${
                        isOutOfStock
                          ? "border-gray-200 opacity-50 cursor-not-allowed"
                          : cartItem
                            ? "border-blue-400 shadow-md shadow-blue-100 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95"
                      }`}
                    >
                      {/* Product image */}
                      {product.imageUrl ? (
                        <div className="w-full aspect-square rounded-t-xl overflow-hidden bg-gray-100">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square rounded-t-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <Package className="w-8 h-8 text-blue-300" />
                        </div>
                      )}

                      {/* Cart badge */}
                      {cartItem && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow">
                          {cartItem.quantity}
                        </div>
                      )}

                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: BILL PANEL ===== */}
        <div className="w-80 xl:w-96 flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
          {/* Bill Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">
                Current Bill
              </span>
              {items.length > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={() => clearItems()}
                className="text-xs text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bill Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-6">
                <ShoppingBag className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Bill is empty</p>
                <p className="text-xs mt-1">Click products to add them</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 flex-1 leading-tight">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{item.total.toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        ₹{item.unitPrice.toLocaleString("en-IN")} ×{" "}
                        {item.quantity}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItemQuantity(item.id, item.quantity - 1)
                              : removeItem(item.id)
                          }
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill Totals + Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 flex-shrink-0">
              {/* Totals */}
              <div className="px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{calculations.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>GST</span>
                  <span>₹{calculations.totalTax.toLocaleString("en-IN")}</span>
                </div>
                {calculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount</span>
                    <span>
                      -₹{calculations.totalDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{calculations.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Checkout – ₹
                      {calculations.total.toLocaleString("en-IN")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
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
          onDownload={(bill) => {
            downloadInvoice(bill);
            showToast("Invoice downloaded");
          }}
          onPrint={printInvoice}
        />
      )}
    </div>
  );
};
