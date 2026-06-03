import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "./ProductCard";
import { OfferBannerCarousel } from "./OfferBannerCarousel";
import { Loader2 } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";
import { FilterState, SortOption } from "./SortAndFilter";
import { getSellingPrice } from "../../utils/whatsapp";

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  filters?: FilterState;
  sortBy?: SortOption;
}

export function HomePage({ onNavigate, filters, sortBy }: HomePageProps) {
  const { products, loadProducts, isLoading } = useApp();
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadProducts();
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      // Search query filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Other filters
      if (filters) {
        const sellingPrice = getSellingPrice(product);
        if (
          sellingPrice < filters.minPrice ||
          sellingPrice > filters.maxPrice
        )
          return false;
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(product.category || "")
        )
          return false;
        if (filters.ratings.length > 0) {
          const minRating = Math.min(...filters.ratings);
          if ((product.rating ?? 0) < minRating) return false;
        }
        if (filters.onOffer && !product.onOffer) return false;
        if (filters.inStock && (product.stock ?? product.stockQuantity ?? 999) <= 0)
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
        case "newest":
        default:
          return 0; // Assuming newest is handled by default order or if there was a date
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white pb-20">
      {/* Offer Banner Carousel */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <OfferBannerCarousel />
      </div>

      {/* Search Bar and Products */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products, categories..."
            className="w-full md:w-96"
          />
        </div>

        {/* Products Grid */}
        {isLoadingProducts || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg text-slate-600 mb-4">
                {products.length === 0
                  ? "No products available"
                  : "No products match your search"}
              </p>
              <p className="text-sm text-slate-500">
                {products.length === 0
                  ? "Check back soon for new items!"
                  : "Try adjusting your search terms"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
