import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Product,
  CartItem,
  User,
  Order,
  Category,
  CartItemCustomization,
} from "../types";
import {
  getCurrentUser,
  signOut as firebaseSignOut,
} from "../services/auth-service";
import {
  saveUserCart,
  getUserCart,
  clearUserCart as clearFirebaseCart,
  getCategories,
  getAllProducts,
  getOrdersByUserId,
  listenToProducts,
  saveProductToWishlist,
  removeProductFromWishlist,
  getUserSavedItems,
} from "../services/firestore-service";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;

  // Cart operations
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity: number,
    customization?: CartItemCustomization,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;

  // Orders
  orders: Order[];
  loadUserOrders: () => Promise<void>;

  // Products & Categories
  products: Product[];
  categories: Category[];
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;

  // Wishlist
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Auth
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Initialize auth and load user
  useEffect(() => {
    const unsubscribe = getCurrentUser(async (currentUser) => {
      console.log("🔐 Auth state changed - Current user:", currentUser?.id);
      setUser(currentUser);
      if (currentUser) {
        // Load user's cart from Firestore
        try {
          const userCart = await getUserCart(currentUser.id);
          console.log("📦 Cart loaded from Firestore:", userCart);
          setCart(userCart);
        } catch (error) {
          console.error("❌ Error loading cart from Firestore:", error);
        }
        // Load user's wishlist from Firestore
        try {
          const userWishlist = await getUserSavedItems(currentUser.id);
          setWishlist(userWishlist);
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
        // Load user's orders from Firestore
        try {
          const userOrders = await getOrdersByUserId(currentUser.id);
          setOrders(userOrders);
        } catch (error) {
          console.error("Error loading orders:", error);
        }
      } else {
        console.log("👤 User logged out");
        setCart([]);
        setOrders([]);
        setWishlist([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load products with real-time listener
  useEffect(() => {
    const unsubscribe = listenToProducts((loadedProducts) => {
      setProducts(loadedProducts);
    });
    return () => unsubscribe();
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const addToCart = (
    product: Product,
    quantity: number,
    customization?: CartItemCustomization,
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id,
      );
      const newCart = existingItem
        ? prevCart.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  customization: customization || item.customization,
                }
              : item,
          )
        : [...prevCart, { product, quantity, customization }];

      // Save to Firestore if user is logged in
      if (user && user.id) {
        saveUserCart(user.id, newCart)
          .then(() => {
            console.log("✓ Cart saved to Firestore:", newCart);
          })
          .catch((error) => {
            console.error("✗ Error saving cart to Firestore:", error);
          });
      } else {
        console.warn("⚠ User not logged in - cart not synced to Firestore");
      }

      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product.id !== productId);

      // Save to Firestore if user is logged in
      if (user && user.id) {
        saveUserCart(user.id, newCart)
          .then(() => {
            console.log("✓ Cart updated in Firestore (item removed):", newCart);
          })
          .catch((error) => {
            console.error("✗ Error saving cart to Firestore:", error);
          });
      } else {
        console.warn("⚠ User not logged in - cart not synced to Firestore");
      }

      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );

      // Save to Firestore if user is logged in
      if (user && user.id) {
        saveUserCart(user.id, newCart)
          .then(() => {
            console.log(
              "✓ Cart updated in Firestore (quantity changed):",
              newCart,
            );
          })
          .catch((error) => {
            console.error("✗ Error saving cart to Firestore:", error);
          });
      } else {
        console.warn("⚠ User not logged in - cart not synced to Firestore");
      }

      return newCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try {
        await clearFirebaseCart(user.id);
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  const syncCart = async () => {
    if (user) {
      try {
        const userCart = await getUserCart(user.id);
        setCart(userCart);
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    }
  };

  const loadUserOrders = async () => {
    if (user) {
      try {
        const userOrders = await getOrdersByUserId(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    }
  };

  const loadProducts = async () => {
    try {
      const loadedProducts = await getAllProducts();
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const addToWishlist = async (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });

    if (user?.id) {
      await saveProductToWishlist(user.id, product);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));

    if (user?.id) {
      await removeProductFromWishlist(user.id, productId);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const logout = async () => {
    try {
      await clearCart();
      await firebaseSignOut();
      setUser(null);
      setCart([]);
      setOrders([]);
      setWishlist([]);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        syncCart,
        orders,
        loadUserOrders,
        products,
        categories,
        loadProducts,
        loadCategories,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
