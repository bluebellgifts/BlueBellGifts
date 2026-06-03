import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SearchBar } from "../ui/SearchBar";
import { Card, CardContent } from "../ui/card";
import { useApp } from "../../context/AppContext";

interface ProductListPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function ProductListPage({ onNavigate }: ProductListPageProps) {
  const { products, categories, loadProducts, loadCategories, isLoading } =
    useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const selectedCategoryRecord = categories.find(
    (category) => category.id === selectedCategory,
  );

  const filteredProducts = products.filter((product) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      product.category === selectedCategoryRecord?.name;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-4 md:pt-6 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-[#111827] mb-4">
            All Products
          </h1>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
          />
        </div>

        <div className="mb-6 relative">
          {/* Fade edges for scroll hint */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F9FAFB] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-[1.03]"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-[1.03]"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-16 text-center flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-[#6B7280]">No products found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
