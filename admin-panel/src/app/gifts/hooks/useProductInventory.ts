// Custom hook for product inventory management
import { useState, useCallback, useEffect } from "react";
import { GiftProduct } from "../types";
import { getMainProductsForBilling } from "../services/giftsFirestoreService";

interface ProductFilters {
  category?: string;
  searchTerm?: string;
  inStockOnly?: boolean;
}

export const useProductInventory = () => {
  const [products, setProducts] = useState<GiftProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<GiftProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load products from main Firestore collection
      const allProducts = await getMainProductsForBilling();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProducts = useCallback(
    (filters: ProductFilters) => {
      let filtered = [...products];

      if (filters.category) {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term),
        );
      }

      if (filters.inStockOnly) {
        filtered = filtered.filter((p) => p.stock > 0);
      }

      setFilteredProducts(filtered);
      return filtered;
    },
    [products],
  );

  const getProductById = useCallback(
    (productId: string): GiftProduct | undefined => {
      return products.find((p) => p.id === productId);
    },
    [products],
  );

  const getProductsByIds = useCallback(
    (productIds: string[]): GiftProduct[] => {
      return products.filter((p) => productIds.includes(p.id));
    },
    [products],
  );

  const checkAvailability = useCallback(
    (productId: string, quantity: number): boolean => {
      const product = getProductById(productId);
      return !!product && product.stock >= quantity && product.isActive;
    },
    [getProductById],
  );

  const getAvailableStock = useCallback(
    (productId: string): number => {
      const product = getProductById(productId);
      return product?.stock || 0;
    },
    [getProductById],
  );

  const updateLocalStock = useCallback(
    (productId: string, newStock: number) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
      );
      setFilteredProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
      );
    },
    [],
  );

  const reserveStock = useCallback(
    (productId: string, quantity: number): boolean => {
      const product = getProductById(productId);
      if (!product || product.stock < quantity) {
        return false;
      }

      updateLocalStock(productId, product.stock - quantity);
      return true;
    },
    [getProductById, updateLocalStock],
  );

  const releaseStock = useCallback(
    (productId: string, quantity: number) => {
      const product = getProductById(productId);
      if (!product) return;

      updateLocalStock(productId, product.stock + quantity);
    },
    [getProductById, updateLocalStock],
  );

  const getCategories = useCallback((): string[] => {
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const getTopProducts = useCallback(
    (limit: number = 5): GiftProduct[] => {
      return [...products].sort((a, b) => b.stock - a.stock).slice(0, limit);
    },
    [products],
  );

  const getLowStockProducts = useCallback(
    (threshold: number = 10): GiftProduct[] => {
      return products.filter((p) => p.stock > 0 && p.stock <= threshold);
    },
    [products],
  );

  const getOutOfStockProducts = useCallback((): GiftProduct[] => {
    return products.filter((p) => p.stock === 0);
  }, [products]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    filteredProducts,
    loading,
    error,
    loadProducts,
    filterProducts,
    getProductById,
    getProductsByIds,
    checkAvailability,
    getAvailableStock,
    getCategories,
    reserveStock,
    releaseStock,
    updateLocalStock,
    getTopProducts,
    getLowStockProducts,
    getOutOfStockProducts,
  };
};
