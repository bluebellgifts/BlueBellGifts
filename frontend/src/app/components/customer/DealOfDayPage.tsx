import React, { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { useApp } from "../../context/AppContext";
import { Product } from "../../types";
import { FilterState, SortOption } from "./SortAndFilter";
import { getSellingPrice } from "../../utils/whatsapp";
import { Zap } from "lucide-react";

interface DealOfDayPageProps {
  onNavigate: (page: string, params?: any) => void;
  filters?: FilterState;
  sortBy?: SortOption;
}

export function DealOfDayPage({
  onNavigate,
  filters,
  sortBy,
}: DealOfDayPageProps) {
  const { products } = useApp();
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch deal products on mount
  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        // Filter products where onOffer is true
        const deals = (products || []).filter((product) => product.onOffer);
        setDealProducts(deals);
      } catch (error) {
        console.error("Error fetching deal products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealProducts();
  }, [products]);

  // Filter and sort products
  const filterAndSortProducts = (prods: Product[]): Product[] => {
    return prods
      .filter((product) => {
        // Other filters
        if (filters) {
          const sellingPrice = getSellingPrice(product);
          if (
            sellingPrice < filters.minPrice ||
            sellingPrice > filters.maxPrice
          )
            return false;
          if (filters.ratings.length > 0) {
            const minRating = Math.min(...filters.ratings);
            if ((product.rating ?? 0) < minRating) return false;
          }
          if (
            filters.inStock &&
            (product.stock ?? product.stockQuantity ?? 999) <= 0
          )
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        switch (sortBy) {
          case "price-low":
            return getSellingPrice(a) - getSellingPrice(b);
          case "price-high":
            return getSellingPrice(b) - getSellingPrice(a);
          case "rating":
            return (b.rating ?? 0) - (a.rating ?? 0);
          case "popular":
            return (b.reviews ?? 0) - (a.reviews ?? 0);
          default:
            return 0;
        }
      });
  };

  const filteredProducts = filterAndSortProducts(dealProducts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      {/* Header with Deal Icon */}
      <div className="sticky top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Deal of the Day
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Limited time offers on selected products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredProducts.length} amazing deals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="text-slate-300 mb-4">
              <Zap className="w-20 h-20 mx-auto" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">
              No deals available yet
            </p>
            <p className="text-slate-600 text-sm">
              Check back later for amazing offers!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
