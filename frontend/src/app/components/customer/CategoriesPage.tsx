import React, { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import {
  getCategories,
  getProductsByCategory,
} from "../../services/firestore-service";
import { Category, Product } from "../../types";
import { FilterState, SortOption } from "./SortAndFilter";

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
  filters?: FilterState;
  sortBy?: SortOption;
}

export function CategoriesPage({
  onNavigate,
  filters,
  sortBy,
}: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState<
    Product[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const cats = await getCategories();
        setCategories(cats);
        // Auto-select first category
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
          await loadCategoryProducts(cats[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load products when category is selected
  const loadCategoryProducts = async (category: Category) => {
    try {
      setProductsLoading(true);
      const products = await getProductsByCategory(category.id);
      setSelectedCategoryProducts(products);
      setSelectedCategory(category);
    } catch (error) {
      console.error(`Error fetching products for ${category.name}:`, error);
      setSelectedCategoryProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Filter and sort products
  const filterAndSortProducts = (prods: Product[]): Product[] => {
    return prods
      .filter((product) => {
        // Other filters
        if (filters) {
          if (
            product.sellingPrice < filters.minPrice ||
            product.sellingPrice > filters.maxPrice
          )
            return false;
          if (
            filters.categories.length > 0 &&
            !filters.categories.includes(product.category)
          )
            return false;
          if (filters.ratings.length > 0) {
            const minRating = Math.min(...filters.ratings);
            if ((product.rating ?? 0) < minRating) return false;
          }
          if (filters.onOffer && !product.onOffer) return false;
          if (filters.inStock && product.stock <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        switch (sortBy) {
          case "price-low":
            return a.sellingPrice - b.sellingPrice;
          case "price-high":
            return b.sellingPrice - a.sellingPrice;
          case "rating":
            return (b.rating ?? 0) - (a.rating ?? 0);
          case "popular":
            return (b.reviews ?? 0) - (a.reviews ?? 0);
          default:
            return 0;
        }
      });
  };

  const filteredProducts = filterAndSortProducts(selectedCategoryProducts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      {/* Categories Scroller - Fixed Below AppBar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {loading ? (
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 bg-slate-100 rounded-lg flex-shrink-0 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => loadCategoryProducts(category)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 snap-center group relative ${
                    selectedCategory?.id === category.id
                      ? "ring-2 ring-blue-600 shadow-md"
                      : "border border-slate-200 hover:shadow-sm"
                  }`}
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-1 transition-all ${
                      selectedCategory?.id === category.id
                        ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                        : "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <p className="text-white text-xs font-semibold text-center w-full line-clamp-2">
                      {category.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Category Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
        {selectedCategory && (
          <div>
            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-300 mb-4">
                  <svg
                    className="w-20 h-20 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  No products found
                </p>
                <p className="text-slate-600 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
