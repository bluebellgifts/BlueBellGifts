import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
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
import { Select } from "../ui/select";
import { SearchBar } from "../ui/SearchBar";
import { useApp } from "../../context/AppContext";
import { adminDeleteProduct } from "../../services/admin-service";
import { toast } from "sonner";
import { AddProductForm } from "./AddProductForm";

export function AdminProductsPage() {
  const { products, categories: fetchedCategories, loadCategories } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const rightScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Scroll to top when category changes
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = 0;
    }
  }, [selectedCategory]);

  const categories = fetchedCategories.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="space-y-6">
      {/* Advanced Form Modal */}
      {showAdvancedForm && (
        <div className="w-full bg-white rounded-lg shadow-lg">
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h2>
            <button
              onClick={() => setShowAdvancedForm(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-white p-2 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <AddProductForm />
          </div>
        </div>
      )}
      {!showAdvancedForm && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
                Product Management
              </h2>
              <p className="text-xs md:text-sm text-[#64748b] mt-1">
                Manage your product catalog
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={() => setShowAdvancedForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus size={20} className="mr-2" />
                Add New Product
              </Button>
            </div>
          </div>
          {/* Search Bar */}
          <Card className="p-4 md:p-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products by name or SKU..."
              />
            </div>
          </Card>

          {/* Two Column Layout: Categories (Left) and Products (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
            {/* Left Column: Categories */}
            <div>
              <Card className="p-4 md:p-5 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Products */}
            <div className="lg:col-span-3">
              <div className="flex flex-col gap-4">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedCategory === "all"
                      ? "All Products"
                      : `${selectedCategory} (${filteredProducts.length})`}
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

                {/* Scrollable Products Container */}
                <div
                  ref={rightScrollRef}
                  className="bg-white rounded-lg border border-gray-200 overflow-y-auto max-h-[600px] flex flex-col"
                >
                  {filteredProducts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 bg-gray-50">
                          <TableHead className="min-w-[150px]">
                            Product
                          </TableHead>
                          <TableHead className="min-w-[80px]">SKU</TableHead>
                          <TableHead className="hidden sm:table-cell min-w-[100px]">
                            Category
                          </TableHead>
                          <TableHead className="hidden md:table-cell min-w-[100px]">
                            Retail/Reseller
                          </TableHead>
                          <TableHead className="min-w-[60px]">Stock</TableHead>
                          <TableHead className="hidden sm:table-cell min-w-[90px]">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[70px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                                />
                                <span className="font-medium text-xs sm:text-sm line-clamp-2">
                                  {product.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {product.sku}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                              {product.category}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">
                                  ₹{product.retailPrice}
                                </span>
                                {product.resellerPrice > 0 && (
                                  <span className="text-[10px] text-blue-600 font-medium">
                                    Reseller: ₹{product.resellerPrice}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm font-medium">
                              {product.stock}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant={
                                  product.onOffer ? "warning" : "default"
                                }
                                className="text-xs"
                              >
                                {product.onOffer ? "OFFER" : "NORMAL"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    toast.info(
                                      "Use Advanced Add form to edit products",
                                    )
                                  }
                                  className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="p-1.5 sm:p-2 hover:bg-[#fef2f2] text-[#dc2626] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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
          </div>
        </>
      )}
    </div>
  );
}
