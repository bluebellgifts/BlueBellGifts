import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bill, Customer, Discount, PaymentDetails } from "../types";
import { useBillCalculations } from "../hooks/useBillCalculations";
import { useProductInventory } from "../hooks/useProductInventory";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
import {
  downloadInvoice,
  generateInvoicePDF,
  printInvoice,
} from "../services/pdfGeneratorService";
import {
  saveBillToFirestore,
  saveCustomerToFirestore,
  uploadBillPDFToStorage,
} from "../services/giftsFirestoreService";
import {
  formatCurrency,
  formatDate,
  generateBillNumber,
} from "../utils/calculations";
import { validateBill } from "../utils/validations";
import { InvoicePreview } from "../components/InvoicePreview";
import { PaymentModal } from "../components/PaymentModal";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader,
  Minus,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";

type DiscountMode = "fixed" | "percentage";

const createEmptyCustomerDraft = () => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
});

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
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [customerDraft, setCustomerDraft] = useState(createEmptyCustomerDraft);
  const [discountMode, setDiscountMode] = useState<DiscountMode>("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [showDiscountControls, setShowDiscountControls] = useState(false);
  const [billNote, setBillNote] = useState("");
  const [debounceTimer, setDebounceTimer] =
    useState<ReturnType<typeof setTimeout> | null>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const {
    items,
    appliedDiscounts,
    calculations,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemUnitPrice,
    clearItems,
    applyBillDiscount,
  } = useBillCalculations();

  const {
    products,
    filteredProducts,
    loading: productsLoading,
    error: productsError,
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
    clearSelected,
  } = useCustomerSearch();

  const [billNumber, setBillNumber] = useState(generateBillNumber);
  const categories = getCategories();
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    filterProducts({
      category: categoryFilter || undefined,
      searchTerm: searchTerm || undefined,
      inStockOnly: true,
    });
  }, [categoryFilter, searchTerm, filterProducts]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCustomerInput = (value: string) => {
    setCustomerQuery(value);
    setShowCustomerDropdown(value.trim().length > 0);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (value.trim()) {
      const timer = setTimeout(() => {
        if (customerSearchType === "phone") {
          searchByPhone(value);
        } else {
          searchByName(value);
        }
      }, 300);
      setDebounceTimer(timer);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    selectCustomer(customer);
    setCustomerQuery("");
    setShowCustomerDropdown(false);
    setShowNewCustomerForm(false);
  };

  const handleClearCustomer = () => {
    clearSelected();
    setCustomerQuery("");
    setCustomerDraft(createEmptyCustomerDraft());
    setShowCustomerDropdown(false);
    setShowNewCustomerForm(false);
  };

  const handleCreateCustomer = () => {
    const firstName = customerDraft.firstName.trim();
    const phone = customerDraft.phone.trim();

    if (!firstName && !phone) {
      showToast("Enter a customer name or phone number", "error");
      return;
    }

    const customer: Customer = {
      id: `cust-${Date.now()}`,
      firstName: firstName || "Walk-in",
      lastName: customerDraft.lastName.trim(),
      phone,
      email: customerDraft.email.trim() || undefined,
      totalPurchases: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    selectCustomer(customer);
    setCustomerDraft(createEmptyCustomerDraft());
    setShowNewCustomerForm(false);
    setCustomerQuery("");
    setShowCustomerDropdown(false);
  };

  const handleAddProduct = (product: any) => {
    const availableStock = product.stock ?? 999;

    if (availableStock <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }

    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      if (existing.quantity >= availableStock) {
        showToast(`Only ${availableStock} in stock`, "error");
        return;
      }
      updateItemQuantity(existing.id, existing.quantity + 1);
    } else {
      addItem(product.id, product.name, 1, product.price, product.taxRate);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = items.find((billItem) => billItem.id === itemId);
    if (!item) return;

    const product = productById.get(item.productId);
    const maxStock = product?.stock ?? 999;
    const safeQuantity = Math.max(0, Math.min(quantity || 0, maxStock));

    if (quantity > maxStock) {
      showToast(`Only ${maxStock} in stock`, "error");
    }

    updateItemQuantity(itemId, safeQuantity);
  };

  const handleApplyDiscount = () => {
    const value = Number(discountValue);

    if (!value || value <= 0) {
      applyBillDiscount(null);
      setDiscountValue("");
      return;
    }

    const discount: Discount = {
      type: discountMode,
      value,
      description:
        discountMode === "percentage"
          ? `${value}% bill discount`
          : `${formatCurrency(value)} bill discount`,
    };

    applyBillDiscount(discount);
    setShowDiscountControls(false);
  };

  const handleClearDiscount = () => {
    setDiscountValue("");
    applyBillDiscount(null);
    setShowDiscountControls(false);
  };

  const handleNewBill = () => {
    if (items.length > 0 && !window.confirm("Start a new bill?")) return;

    clearItems();
    handleClearCustomer();
    handleClearDiscount();
    setBillNote("");
    setBillNumber(generateBillNumber());
  };

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
        return;
      }

      let savedCustomerId = selectedCustomer?.id;
      let customerDetails = selectedCustomer
        ? {
            name:
              `${selectedCustomer.firstName} ${selectedCustomer.lastName || ""}`.trim() ||
              "Walk-in Customer",
            phone: selectedCustomer.phone,
            email: selectedCustomer.email,
          }
        : undefined;

      if (selectedCustomer) {
        savedCustomerId = await saveCustomerToFirestore({
          ...selectedCustomer,
          totalPurchases: (selectedCustomer.totalPurchases || 0) + 1,
          totalSpent: (selectedCustomer.totalSpent || 0) + calculations.total,
          lastPurchaseDate: new Date(),
          updatedAt: new Date(),
        });

        customerDetails = {
          ...customerDetails!,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
        };
      }

      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        billNumber,
        customerId: savedCustomerId,
        customerDetails,
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
        notes: billNote.trim() || undefined,
        billDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedBillId = await saveBillToFirestore(newBill);
      newBill.id = savedBillId;

      try {
        const pdfBlob = generateInvoicePDF(newBill);
        const pdfUrl = await uploadBillPDFToStorage(savedBillId, pdfBlob);
        newBill.pdfUrl = pdfUrl;
      } catch (error) {
        console.error("Invoice PDF upload failed:", error);
      }

      setCompletedBill(newBill);
      setShowPaymentModal(false);
      setShowInvoicePreview(true);
      showToast("Bill created successfully");

      clearItems();
      handleClearCustomer();
      handleClearDiscount();
      setBillNote("");
      setBillNumber(generateBillNumber());
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
    <div className="min-h-[calc(100vh-96px)] bg-slate-50">
      {toastMsg && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${
            toastMsg.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toastMsg.text}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
        <main className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      Create Bill
                    </h2>
                    <p className="text-sm text-slate-500">
                      {billNumber} | {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNewBill}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                New Bill
              </button>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_240px] gap-4">
              <div ref={customerDropdownRef} className="relative">
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {selectedCustomer.firstName}{" "}
                        {selectedCustomer.lastName || ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedCustomer.phone || "No phone added"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p className="font-semibold text-slate-700">
                        {selectedCustomer.totalPurchases || 0} bills
                      </p>
                      <p>{formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <select
                        value={customerSearchType}
                        onChange={(event) => {
                          setCustomerSearchType(event.target.value as any);
                          setCustomerQuery("");
                          setShowCustomerDropdown(false);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="phone">Phone</option>
                        <option value="name">Name</option>
                      </select>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          value={customerQuery}
                          onChange={(event) =>
                            handleCustomerInput(event.target.value)
                          }
                          placeholder={
                            customerSearchType === "phone"
                              ? "Search customer phone"
                              : "Search customer name"
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        {customerQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerQuery("");
                              setShowCustomerDropdown(false);
                            }}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {showCustomerDropdown && (
                      <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        {customerLoading ? (
                          <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                            <Loader className="h-4 w-4 animate-spin" />
                            Searching customers...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                            {searchResults.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleSelectCustomer(customer)}
                                className="flex w-full items-center gap-3 p-3 text-left hover:bg-blue-50"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                  <User className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {customer.firstName}{" "}
                                    {customer.lastName || ""}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {customer.phone}
                                  </p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                  {customer.totalPurchases || 0} bills
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">
                            {customerError || "No matching customers found"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowNewCustomerForm((value) => !value)}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                {showNewCustomerForm ? "Hide Customer Form" : "New Customer"}
              </button>
            </div>

            {showNewCustomerForm && !selectedCustomer && (
              <div className="mt-4 grid grid-cols-5 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  value={customerDraft.firstName}
                  onChange={(event) =>
                    setCustomerDraft((prev) => ({
                      ...prev,
                      firstName: event.target.value,
                    }))
                  }
                  placeholder="First name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={customerDraft.lastName}
                  onChange={(event) =>
                    setCustomerDraft((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                  placeholder="Last name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={customerDraft.phone}
                  onChange={(event) =>
                    setCustomerDraft((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="Phone"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={customerDraft.email}
                  onChange={(event) =>
                    setCustomerDraft((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email optional"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Use Customer
                </button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Products</h3>
                <p className="text-sm text-slate-500">
                  Search, filter, and click a product to add it to the bill.
                </p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p className="font-bold text-slate-900">
                  {filteredProducts.length} products
                </p>
                <p>{categories.length} categories</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search product name or description"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("")}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    categoryFilter === ""
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setCategoryFilter(
                        category === categoryFilter ? "" : category,
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      categoryFilter === category
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5">
              {productsLoading ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <Loader className="mb-3 h-8 w-8 animate-spin" />
                  <p className="text-sm font-semibold">Loading products...</p>
                </div>
              ) : productsError ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                  <AlertCircle className="mb-3 h-8 w-8" />
                  <p className="text-sm font-semibold">{productsError}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <Package className="mb-3 h-10 w-10" />
                  <p className="text-sm font-semibold">No products found</p>
                  <p className="mt-1 text-xs">Try another search or category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const cartItem = items.find(
                      (item) => item.productId === product.id,
                    );
                    const availableStock = product.stock ?? 999;
                    const isOutOfStock = availableStock <= 0;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        disabled={isOutOfStock}
                        className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                          isOutOfStock
                            ? "cursor-not-allowed border-slate-200 opacity-50"
                            : cartItem
                              ? "border-blue-400 ring-2 ring-blue-100"
                              : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-9 w-9 text-slate-300" />
                            </div>
                          )}
                          {cartItem && (
                            <span className="absolute right-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                              {cartItem.quantity}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="line-clamp-2 min-h-10 text-sm font-bold text-slate-900">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-extrabold text-blue-700">
                              {formatCurrency(product.price)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                                availableStock <= 5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {availableStock} left
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="sticky top-24 h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">Current Bill</h3>
                    <p className="text-xs text-slate-500">
                      {items.length} lines | {totalQuantity} items
                    </p>
                  </div>
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearItems()}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <ShoppingBag className="mb-3 h-12 w-12" />
                  <p className="font-bold text-slate-600">No items yet</p>
                  <p className="mt-1 text-sm">
                    Add products from the catalog to start billing.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                              {item.productName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 items-start gap-2">
                            <span className="whitespace-nowrap text-base font-extrabold text-slate-950">
                              {formatCurrency(item.total)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-[116px_1fr] gap-2">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(event) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(event.target.value),
                                )
                              }
                              className="h-8 w-10 border-x border-slate-100 text-center text-sm font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              Unit
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(event) =>
                                updateItemUnitPrice(
                                  item.id,
                                  Number(event.target.value),
                                )
                              }
                              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                              aria-label="Unit price"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-5">
              <div className="space-y-3">
                {showDiscountControls ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">
                        Bill Discount
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDiscountControls(false)}
                        className="text-xs font-semibold text-slate-500"
                      >
                        Hide
                      </button>
                    </div>
                    <div className="grid grid-cols-[110px_1fr_72px] gap-2">
                      <select
                        value={discountMode}
                        onChange={(event) =>
                          setDiscountMode(event.target.value as DiscountMode)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percent</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(event) => setDiscountValue(event.target.value)}
                        placeholder="0"
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-sm font-bold text-slate-800">
                      {calculations.totalDiscount > 0
                        ? `Discount: -${formatCurrency(calculations.totalDiscount)}`
                        : "No discount applied"}
                    </span>
                    <div className="flex items-center gap-3">
                      {appliedDiscounts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearDiscount}
                          className="text-xs font-semibold text-red-600"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowDiscountControls(true)}
                        className="text-xs font-semibold text-blue-700"
                      >
                        {appliedDiscounts.length > 0 ? "Edit" : "Add Discount"}
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  value={billNote}
                  onChange={(event) => setBillNote(event.target.value)}
                  placeholder="Bill note optional"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />

                <div className="space-y-2 rounded-xl bg-slate-950 p-4 text-white">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>GST</span>
                    <span>{formatCurrency(calculations.totalTax)}</span>
                  </div>
                  {calculations.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-300">
                      <span>Discount</span>
                      <span>-{formatCurrency(calculations.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-end justify-between">
                      <span className="text-sm text-slate-300">Total</span>
                      <span className="text-2xl font-extrabold">
                        {formatCurrency(calculations.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={items.length === 0 || isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Checkout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

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
