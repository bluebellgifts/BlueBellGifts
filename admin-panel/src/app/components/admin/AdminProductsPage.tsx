import React, { useRef, useState } from "react";
import { Check, Edit, Loader2, Plus, Trash2, X, Zap } from "lucide-react";
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
import { SearchBar } from "../ui/SearchBar";
import { useApp } from "../../context/AppContext";
import { adminDeleteProduct } from "../../services/admin-service";
import { updateProduct } from "../../services/firestore-service";
import { toast } from "sonner";
import { AddProductForm } from "./AddProductForm";

export function AdminProductsPage() {
  const { products } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [togglingDeal, setTogglingDeal] = useState<string | null>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Inline stock editing state
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockEditValue, setStockEditValue] = useState("");
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  const filteredProducts = (products || []).filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminDeleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  const handleToggleDealOfDay = async (product: any) => {
    try {
      setTogglingDeal(product.id);
      const newStatus = !product.onOffer;
      await updateProduct(product.id, { onOffer: newStatus });
      toast.success(
        newStatus
          ? "Product added to Deal of the Day"
          : "Product removed from Deal of the Day",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setTogglingDeal(null);
    }
  };

  // ── Inline stock helpers ──────────────────────────────────────────────────
  const beginStockEdit = (product: any) => {
    const current = product.stock ?? product.stockQuantity ?? 0;
    setStockEditId(product.id);
    setStockEditValue(String(current));
  };

  const cancelStockEdit = () => {
    setStockEditId(null);
    setStockEditValue("");
  };

  const commitStockEdit = async (productId: string) => {
    const qty = parseInt(stockEditValue, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid stock quantity (0 or more)");
      return;
    }
    setSavingStockId(productId);
    try {
      await updateProduct(productId, { stock: qty, stockQuantity: qty });
      toast.success("Stock updated");
      setStockEditId(null);
      setStockEditValue("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock");
    } finally {
      setSavingStockId(null);
    }
  };

  const handleStockKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    productId: string,
  ) => {
    if (e.key === "Enter") commitStockEdit(productId);
    if (e.key === "Escape") cancelStockEdit();
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleCloseForm = () => {
    setShowAdvancedForm(false);
    setEditingProductId(null);
  };

  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId)
    : null;

  return (
    <div className="space-y-6">
      {/* Add / Edit Product Form */}
      {showAdvancedForm && (
        <div className="w-full bg-white rounded-lg shadow-lg">
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-600 hover:text-gray-900 hover:bg-white p-2 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <AddProductForm
              onSuccess={handleCloseForm}
              productId={editingProductId || undefined}
              editingProduct={editingProduct}
            />
          </div>
        </div>
      )}

      {!showAdvancedForm && (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <Card className="p-4 md:p-6">
              <div className="flex gap-4 items-center">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search products by name..."
                />
                <Button
                  variant="primary"
                  onClick={() => setShowAdvancedForm(true)}
                  className="flex-shrink-0"
                >
                  <Plus size={20} className="mr-2" />
                  Add New Product
                </Button>
              </div>
            </Card>
          </div>

          <div className="min-h-[600px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  All Products ({filteredProducts.length})
                </h3>
                <Button
                  variant="primary"
                  onClick={() => setShowAdvancedForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Product
                </Button>
              </div>

              <div
                ref={rightScrollRef}
                className="bg-white rounded-lg border border-gray-200 overflow-y-auto max-h-[600px] flex flex-col"
              >
                {filteredProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="sticky top-0 bg-gray-50">
                        <TableHead className="min-w-[150px]">Product</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[100px]">
                          MRP Price
                        </TableHead>
                        <TableHead className="min-w-[100px]">
                          Selling Price
                        </TableHead>
                        <TableHead className="min-w-[130px]">
                          Stock{" "}
                          <span className="text-[10px] font-normal text-gray-400">
                            (click to edit)
                          </span>
                        </TableHead>
                        <TableHead className="min-w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const qty =
                          product.stock ?? product.stockQuantity ?? 0;
                        const isEditingStock = stockEditId === product.id;
                        const isSavingStock = savingStockId === product.id;

                        const badgeCls =
                          qty === 0
                            ? "bg-red-100 text-red-700 border-red-200"
                            : qty < 10
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200";

                        return (
                          <TableRow key={product.id}>
                            {/* Product name + image */}
                            <TableCell>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                  src={
                                    product.images?.length
                                      ? product.images[0].url
                                      : product.image || ""
                                  }
                                  alt={product.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                                />
                                <span className="font-medium text-xs sm:text-sm line-clamp-2">
                                  {product.name}
                                </span>
                              </div>
                            </TableCell>

                            {/* MRP */}
                            <TableCell className="hidden md:table-cell text-xs sm:text-sm font-semibold text-gray-900">
                              ₹{product.retailPrice || 0}
                            </TableCell>

                            {/* Selling price */}
                            <TableCell className="text-xs sm:text-sm font-semibold text-blue-700">
                              ₹{product.sellingPrice || 0}
                            </TableCell>

                            {/* Stock — click badge to edit inline */}
                            <TableCell>
                              {isEditingStock ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={stockEditValue}
                                    onChange={(e) =>
                                      setStockEditValue(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      handleStockKeyDown(e, product.id)
                                    }
                                    onBlur={() => commitStockEdit(product.id)}
                                    className="w-20 rounded-md border border-blue-400 px-2 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  {isSavingStock ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin text-blue-500"
                                    />
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          commitStockEdit(product.id)
                                        }
                                        className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50"
                                        title="Save"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelStockEdit}
                                        className="rounded p-0.5 text-red-500 hover:bg-red-50"
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  title="Click to update stock"
                                  onClick={() => beginStockEdit(product)}
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-80 ${badgeCls}`}
                                >
                                  {qty === 0 ? "Out of stock" : `${qty} units`}
                                </button>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <button
                                  onClick={() => handleToggleDealOfDay(product)}
                                  disabled={togglingDeal === product.id}
                                  className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                                    product.onOffer
                                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                      : "hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  title={
                                    product.onOffer
                                      ? "Remove from Deal of the Day"
                                      : "Add to Deal of the Day"
                                  }
                                >
                                  <Zap size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProductId(product.id);
                                    setShowAdvancedForm(true);
                                  }}
                                  className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors flex-shrink-0"
                                  title="Edit product"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="p-1.5 sm:p-2 hover:bg-[#fef2f2] text-[#dc2626] rounded-lg transition-colors flex-shrink-0"
                                  title="Delete product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-gray-500 font-medium">
                        No products found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try different search terms or add a new product
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
