// @ts-ignore
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  QueryConstraint,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  onSnapshot,
  // @ts-ignore
} from "firebase/firestore";
import { firestore } from "./firebase-config";
import {
  Product,
  User,
  Order,
  Invoice,
  Category,
  Address,
  CartItem,
  InventoryLog,
  SiteContent,
  SiteSettings,
  ContactSubmission,
} from "../types";

// ========== CONTACT SUBMISSIONS ==========

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const contactRef = collection(firestore, "contact_submissions");
    const q = query(contactRef, orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
        messages: (data.messages || []).map((msg: any) => ({
          ...msg,
          createdAt: msg.createdAt?.toDate
            ? msg.createdAt.toDate()
            : msg.createdAt,
        })),
      } as ContactSubmission;
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    throw error;
  }
}

export function subscribeToAllContactSubmissions(
  onUpdate: (submissions: ContactSubmission[]) => void,
) {
  const contactRef = collection(firestore, "contact_submissions");
  const q = query(contactRef, orderBy("updatedAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const submissions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
        messages: (data.messages || []).map((msg: any) => ({
          ...msg,
          createdAt: msg.createdAt?.toDate
            ? msg.createdAt.toDate()
            : msg.createdAt,
        })),
      } as ContactSubmission;
    });
    onUpdate(submissions);
  });
}

export async function addContactMessage(
  submissionId: string,
  text: string,
  sender: "customer" | "admin",
): Promise<void> {
  try {
    const docRef = doc(firestore, "contact_submissions", submissionId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        id: "msg_" + Date.now(),
        text,
        sender,
        createdAt: Timestamp.now(),
      }),
      updatedAt: Timestamp.now(),
      status: sender === "admin" ? "replied" : "unread",
    });
  } catch (error) {
    console.error("Error adding contact message:", error);
    throw error;
  }
}

export async function updateContactStatus(
  id: string,
  status: "unread" | "read" | "replied",
): Promise<void> {
  try {
    const contactRef = doc(firestore, "contact_submissions", id);
    await updateDoc(contactRef, { status });
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
}

export async function deleteContactSubmission(id: string): Promise<void> {
  try {
    const contactRef = doc(firestore, "contact_submissions", id);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    throw error;
  }
}

// ========== USERS (Common for Admin and Customers) ==========

export async function createOrUpdateUserInFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(firestore, "users", user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        addresses: user.addresses || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as any;
      return {
        id: userSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>,
): Promise<void> {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function getAllUsers(roleFilter?: string): Promise<User[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (roleFilter && roleFilter !== "all") {
      constraints.push(where("role", "==", roleFilter));
    }
    const q = query(collection(firestore, "users"), ...constraints);
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      const data = doc.data() as any;
      users.push({
        id: doc.id,
        ...(data || {}),
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
      } as User);
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// ========== PRODUCTS ==========

export async function getProducts(
  constraints: QueryConstraint[] = [],
): Promise<Product[]> {
  try {
    const q = query(collection(firestore, "products"), ...constraints);
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getProductById(
  productId: string,
): Promise<Product | null> {
  try {
    const productRef = doc(firestore, "products", productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function getProductsByCategory(
  categoryId: string,
): Promise<Product[]> {
  try {
    return getProducts([where("category", "==", categoryId)]);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    // Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia for better search
    const q = query(collection(firestore, "products"));
    const querySnapshot = await getDocs(q);
    const results: Product[] = [];

    const lowerSearchTerm = searchTerm.toLowerCase();
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      const product = doc.data() as Product;
      if (
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.description.toLowerCase().includes(lowerSearchTerm) ||
        product.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
      ) {
        results.push({ id: doc.id, ...doc.data() } as Product);
      }
    });

    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

export async function createProduct(
  product: Omit<Product, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, "products"), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>,
): Promise<void> {
  try {
    const productRef = doc(firestore, "products", productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, "products", productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// ========== CATEGORIES ==========

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(firestore, "categories"));
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      categories.push({ id: doc.id, ...(doc.data() || {}) } as Category);
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function createCategory(
  category: Omit<Category, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, "categories"), {
      ...category,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Category>,
): Promise<void> {
  try {
    const categoryRef = doc(firestore, "categories", categoryId);
    await updateDoc(categoryRef, updates);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function incrementProductCount(categoryId: string): Promise<void> {
  try {
    const categoryRef = doc(firestore, "categories", categoryId);
    await updateDoc(categoryRef, {
      productCount: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing product count:", error);
    throw error;
  }
}

export async function decrementProductCount(categoryId: string): Promise<void> {
  try {
    const categoryRef = doc(firestore, "categories", categoryId);
    await updateDoc(categoryRef, {
      productCount: increment(-1),
    });
  } catch (error) {
    console.error("Error decrementing product count:", error);
    throw error;
  }
}

export async function incrementProductCountByName(
  categoryName: string,
): Promise<void> {
  try {
    const q = query(
      collection(firestore, "categories"),
      where("name", "==", categoryName),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const categoryDoc = querySnapshot.docs[0];
      const categoryRef = doc(firestore, "categories", categoryDoc.id);
      await updateDoc(categoryRef, {
        productCount: increment(1),
      });
    }
  } catch (error) {
    console.error("Error incrementing product count by name:", error);
    throw error;
  }
}

export async function decrementProductCountByName(
  categoryName: string,
): Promise<void> {
  try {
    const q = query(
      collection(firestore, "categories"),
      where("name", "==", categoryName),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const categoryDoc = querySnapshot.docs[0];
      const categoryRef = doc(firestore, "categories", categoryDoc.id);
      await updateDoc(categoryRef, {
        productCount: increment(-1),
      });
    }
  } catch (error) {
    console.error("Error decrementing product count by name:", error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, "categories", categoryId));
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// ========== ORDERS ==========

export async function createOrder(order: Omit<Order, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, "orders"), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(firestore, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(firestore, "orders"),
      where("customerId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      orders.push({ id: doc.id, ...(doc.data() || {}) } as Order);
    });
    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}

export async function getAllOrders(filters?: {
  status?: string;
  orderType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Order[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    }

    if (filters?.orderType) {
      constraints.push(where("orderType", "==", filters.orderType));
    }

    const q = query(collection(firestore, "orders"), ...constraints);
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      orders.push({ id: doc.id, ...(doc.data() || {}) } as Order);
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): Promise<void> {
  try {
    const orderRef = doc(firestore, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Order>,
): Promise<void> {
  try {
    const orderRef = doc(firestore, "orders", orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, "orders", orderId));
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

// ========== CARTS ==========

export async function saveUserCart(
  userId: string,
  cartItems: CartItem[],
): Promise<void> {
  try {
    const cartRef = doc(firestore, "carts", userId);
    await setDoc(
      cartRef,
      {
        userId,
        items: cartItems,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error saving cart:", error);
    throw error;
  }
}

export async function getUserCart(userId: string): Promise<CartItem[]> {
  try {
    const cartRef = doc(firestore, "carts", userId);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      return cartSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

export async function clearUserCart(userId: string): Promise<void> {
  try {
    const cartRef = doc(firestore, "carts", userId);
    await setDoc(cartRef, {
      userId,
      items: [],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// ========== ADDRESSES ==========

export async function addUserAddress(
  userId: string,
  address: Address,
): Promise<string> {
  try {
    const addressRef = doc(firestore, "users", userId);
    await updateDoc(addressRef, {
      addresses: arrayUnion(address),
      updatedAt: Timestamp.now(),
    });
    return address.id;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
}

export async function updateUserAddress(
  userId: string,
  address: Address,
): Promise<void> {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const user = userSnap.data();
      const addresses = user.addresses || [];
      const updatedAddresses = addresses.map((addr: Address) =>
        addr.id === address.id ? address : addr,
      );
      await updateDoc(userRef, {
        addresses: updatedAddresses,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
}

export async function deleteUserAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const user = userSnap.data();
      const addresses = user.addresses || [];
      const updatedAddresses = addresses.filter(
        (addr: Address) => addr.id !== addressId,
      );
      await updateDoc(userRef, {
        addresses: updatedAddresses,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}

// ========== INVENTORY LOGS ==========

export async function logInventoryChange(log: InventoryLog): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, "inventoryLogs"), {
      ...log,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error logging inventory change:", error);
    throw error;
  }
}

export async function getInventoryLogs(
  productId?: string,
): Promise<InventoryLog[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy("date", "desc")];

    if (productId) {
      constraints.push(where("productId", "==", productId));
    }

    const q = query(collection(firestore, "inventoryLogs"), ...constraints);
    const querySnapshot = await getDocs(q);
    const logs: InventoryLog[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      logs.push({ id: doc.id, ...doc.data() } as InventoryLog);
    });
    return logs;
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    throw error;
  }
}

// ========== REAL-TIME LISTENERS ==========

export function listenToProducts(callback: (products: Product[]) => void) {
  const q = query(collection(firestore, "products"));
  return onSnapshot(q, (querySnapshot: any) => {
    const products: Product[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      products.push({ id: doc.id, ...(doc.data() || {}) } as Product);
    });
    callback(products);
  });
}

export function listenToUserOrders(
  userId: string,
  callback: (orders: Order[]) => void,
) {
  const q = query(
    collection(firestore, "orders"),
    where("customerId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (querySnapshot: any) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      orders.push({ id: doc.id, ...(doc.data() || {}) } as Order);
    });
    callback(orders);
  });
}

// ========== ANALYTICS & REPORTS ==========

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}> {
  try {
    const orders = await getAllOrders();

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      ordersByStatus[order.status]++;
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
}

export async function getProductStats(): Promise<{
  totalProducts: number;
  lowStockProducts: number;
  topProducts: Product[];
  totalInventoryValue: number;
}> {
  try {
    const products = await getAllProducts();

    const lowStockProducts = products.filter((p) => p.stock < 10).length;
    const topProducts = products
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    const totalInventoryValue = products.reduce(
      (sum, product) => sum + product.retailPrice * product.stock,
      0,
    );

    return {
      totalProducts: products.length,
      lowStockProducts,
      topProducts,
      totalInventoryValue,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
}

// ========== SITE CONTENT ==========

export async function getSiteContent(
  pageId: string,
): Promise<SiteContent | null> {
  try {
    const docRef = doc(firestore, "pages", pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SiteContent;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching content for ${pageId}:`, error);
    throw error;
  }
}

export async function updateSiteContent(
  pageId: string,
  content: Partial<SiteContent>,
): Promise<void> {
  try {
    const docRef = doc(firestore, "pages", pageId);
    await setDoc(
      docRef,
      {
        ...content,
        lastUpdated: Timestamp.now(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error(`Error updating content for ${pageId}:`, error);
    throw error;
  }
}

// ========== SITE SETTINGS ==========

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(firestore, "settings", "general");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    throw error;
  }
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>,
): Promise<void> {
  try {
    const docRef = doc(firestore, "settings", "general");
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error("Error updating site settings:", error);
    throw error;
  }
}

// ========== INVOICES ==========

export async function createInvoice(
  invoice: Omit<Invoice, "id">,
): Promise<string> {
  try {
    // Generate invoice number based on current date and sequence
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const invoiceNumber = `INV-${today}-${Date.now().toString().slice(-6)}`;

    const docRef = await addDoc(collection(firestore, "invoices"), {
      ...invoice,
      invoiceNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Reduce product stock
    for (const item of invoice.items) {
      await updateProductStock(item.product.id, -item.quantity);
      // Log the inventory out
      await logInventoryChange({
        id: `${Date.now()}`,
        productId: item.product.id,
        productName: item.product.name,
        type: "out",
        quantity: item.quantity,
        date: new Date(),
        notes: `Sold via invoice ${invoiceNumber}`,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

export async function getInvoiceById(
  invoiceId: string,
): Promise<Invoice | null> {
  try {
    const invoiceRef = doc(firestore, "invoices", invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    if (invoiceSnap.exists()) {
      return { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
    }
    return null;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
}

export async function getInvoiceByNumber(
  invoiceNumber: string,
): Promise<Invoice | null> {
  try {
    const q = query(
      collection(firestore, "invoices"),
      where("invoiceNumber", "==", invoiceNumber),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Invoice;
    }
    return null;
  } catch (error) {
    console.error("Error fetching invoice by number:", error);
    throw error;
  }
}

export async function getAllInvoices(filters?: {
  customerId?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Invoice[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filters?.customerId) {
      constraints.push(where("customerId", "==", filters.customerId));
    }

    if (filters?.paymentStatus) {
      constraints.push(where("paymentStatus", "==", filters.paymentStatus));
    }

    const q = query(collection(firestore, "invoices"), ...constraints);
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      const data = doc.data() as any;
      invoices.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Invoice);
    });

    // Client-side date filtering if needed
    if (filters?.startDate && filters?.endDate) {
      invoices.filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= filters.startDate! && invDate <= filters.endDate!;
      });
    }

    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Invoice>,
): Promise<void> {
  try {
    const invoiceRef = doc(firestore, "invoices", invoiceId);
    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  try {
    const invoice = await getInvoiceById(invoiceId);
    if (invoice) {
      // Restore product stock
      for (const item of invoice.items) {
        await updateProductStock(item.product.id, item.quantity);
      }
    }
    await deleteDoc(doc(firestore, "invoices", invoiceId));
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

export async function getInvoicesByCustomerId(
  customerId: string,
): Promise<Invoice[]> {
  try {
    const q = query(
      collection(firestore, "invoices"),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      const data = doc.data() as any;
      invoices.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Invoice);
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    throw error;
  }
}

export async function getInvoiceStats(): Promise<{
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  averageInvoiceValue: number;
}> {
  try {
    const invoices = await getAllInvoices();

    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(
      (inv) => inv.paymentStatus === "paid",
    ).length;
    const pendingInvoices = invoices.filter(
      (inv) => inv.paymentStatus === "pending",
    ).length;
    const averageInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      averageInvoiceValue,
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    throw error;
  }
}

// Helper function to update product stock
async function updateProductStock(
  productId: string,
  quantityChange: number,
): Promise<void> {
  try {
    const productRef = doc(firestore, "products", productId);
    await updateDoc(productRef, {
      stock: increment(quantityChange),
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}

// ========== OFFER MANAGEMENT ==========

export async function saveOfferText(text: string): Promise<void> {
  try {
    const docRef = doc(firestore, "offers", "offerText");
    await setDoc(docRef, { text, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error saving offer text:", error);
    throw error;
  }
}

export async function getOfferText(): Promise<string | null> {
  try {
    const docRef = doc(firestore, "offers", "offerText");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().text || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching offer text:", error);
    throw error;
  }
}

export async function uploadOfferBannerImage(file: File): Promise<string> {
  try {
    // Import uploadFile from storage-service
    const storageModule = await import("./storage-service");
    const downloadUrl = await storageModule.uploadFile("offer-banners", file);

    // Save to Firestore nested offers/banners/images collection
    const bannerId = `banner-${Date.now()}`;
    const docRef = doc(firestore, "offers", "banners", "images", bannerId);
    await setDoc(docRef, {
      id: bannerId,
      imageUrl: downloadUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading offer banner image:", error);
    throw error;
  }
}

export async function getOfferBannerImages(): Promise<any[]> {
  try {
    const collectionRef = collection(firestore, "offers", "banners", "images");
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const banners: any[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<unknown>) => {
      const data = doc.data() as any;
      banners.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
      });
    });
    return banners;
  } catch (error) {
    console.error("Error fetching offer banner images:", error);
    throw error;
  }
}

export async function deleteOfferBanner(bannerId: string): Promise<void> {
  try {
    const docRef = doc(firestore, "offers", "banners", "images", bannerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting offer banner:", error);
    throw error;
  }
}

export async function refreshOfferBannerURL(bannerId: string): Promise<string> {
  try {
    const docRef = doc(firestore, "offerbanners", bannerId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Banner not found");
    }

    const data = docSnap.data() as any;
    const imageUrl = data.imageUrl;

    // If the URL already exists and is valid, return it
    // Otherwise try to refresh it from storage
    if (imageUrl) {
      return imageUrl;
    }

    throw new Error("No image URL found");
  } catch (error) {
    console.error("Error refreshing offer banner URL:", error);
    throw error;
  }
}
