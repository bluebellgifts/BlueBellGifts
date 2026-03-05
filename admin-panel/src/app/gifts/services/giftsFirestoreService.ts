// Firebase services for gifts billing
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../../services/firebase-config";
import {
  Bill,
  GiftProduct,
  Customer,
  FirestoreBill,
  FirestoreProduct,
} from "../types";

const BILLS_COLLECTION = "gifts-bills";
const PRODUCTS_COLLECTION = "gifts-products";
const CUSTOMERS_COLLECTION = "users"; // Using main users collection
const MAIN_PRODUCTS_COLLECTION = "products"; // Main products collection

// Helper function to convert user document to Customer type
const mapUserToCustomer = (userId: string, userData: any): Customer => {
  const defaultAddress = userData.addresses?.[0] || {};

  return {
    id: userId,
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    phone: userData.phone || "",
    email: userData.email || "",
    address:
      `${defaultAddress.addressLine1 || ""} ${defaultAddress.addressLine2 || ""}`.trim(),
    city: defaultAddress.city || "",
    pincode: defaultAddress.pincode || "",
    totalPurchases: userData.totalPurchases || 0,
    totalSpent: userData.totalSpent || 0,
    lastPurchaseDate: userData.lastPurchaseDate
      ? new Date(userData.lastPurchaseDate)
      : undefined,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
    updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
  };
};

// Helper function to convert main product document to GiftProduct type
const mapMainProductToGiftProduct = (
  productId: string,
  productData: any,
): GiftProduct => {
  const variants =
    productData.variants?.map((variant: any) => ({
      id: variant.id || `variant-${Math.random()}`,
      name: variant.name || "",
      options: variant.name ? [variant.name] : [], // variants are size/type based, use name as option
      affectsPrice: true,
      priceModifier:
        (variant.sellingPrice || 0) - (productData.sellingPrice || 0),
    })) || [];

  return {
    id: productId,
    name: productData.name || "",
    description: productData.description || "",
    category: productData.category || "Uncategorized",
    price: productData.sellingPrice || productData.retailPrice || 0,
    costPrice: productData.costPrice || 0,
    taxRate: 18, // Default GST rate (can be updated based on product category)
    stock: productData.stockQuantity || 0,
    imageUrl: productData.images?.[0]?.url || "",
    variants: variants.length > 0 ? variants : undefined,
    isActive: productData.status === true,
    createdAt: productData.createdAt
      ? typeof productData.createdAt === "string"
        ? new Date(productData.createdAt)
        : productData.createdAt.toDate?.() || new Date()
      : new Date(),
    updatedAt: productData.updatedAt
      ? typeof productData.updatedAt === "string"
        ? new Date(productData.updatedAt)
        : productData.updatedAt.toDate?.() || new Date()
      : new Date(),
  };
};

// ===== BILLS OPERATIONS =====

export const saveBillToFirestore = async (bill: Bill): Promise<string> => {
  try {
    const billData = {
      ...bill,
      billDate: Timestamp.fromDate(new Date(bill.billDate)),
      dueDate: bill.dueDate ? Timestamp.fromDate(new Date(bill.dueDate)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(firestore, BILLS_COLLECTION),
      billData,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving bill to Firestore:", error);
    throw new Error("Failed to save bill");
  }
};

export const updateBillInFirestore = async (
  billId: string,
  updates: Partial<Bill>,
): Promise<void> => {
  try {
    const billRef = doc(firestore, BILLS_COLLECTION, billId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.billDate) {
      updateData.billDate = Timestamp.fromDate(new Date(updates.billDate));
    }
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
    }

    await updateDoc(billRef, updateData);
  } catch (error) {
    console.error("Error updating bill in Firestore:", error);
    throw new Error("Failed to update bill");
  }
};

export const getBillFromFirestore = async (
  billId: string,
): Promise<Bill | null> => {
  try {
    const billRef = doc(firestore, BILLS_COLLECTION, billId);
    const billDoc = await getDoc(billRef);

    if (!billDoc.exists()) {
      return null;
    }

    const data = billDoc.data() as FirestoreBill;
    return {
      ...data,
      id: billDoc.id,
      billDate: new Date(data.billDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as Bill;
  } catch (error) {
    console.error("Error getting bill from Firestore:", error);
    throw new Error("Failed to retrieve bill");
  }
};

export const getAllBillsFromFirestore = async (): Promise<Bill[]> => {
  try {
    const q = query(
      collection(firestore, BILLS_COLLECTION),
      orderBy("billDate", "desc"),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as FirestoreBill;
        return {
          ...data,
          id: doc.id,
          billDate: new Date(data.billDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as Bill;
      },
    );
  } catch (error) {
    console.error("Error getting all bills from Firestore:", error);
    throw new Error("Failed to retrieve bills");
  }
};

export const getBillsByCustomer = async (
  customerId: string,
): Promise<Bill[]> => {
  try {
    const q = query(
      collection(firestore, BILLS_COLLECTION),
      where("customerId", "==", customerId),
      orderBy("billDate", "desc"),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as FirestoreBill;
        return {
          ...data,
          id: doc.id,
          billDate: new Date(data.billDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as Bill;
      },
    );
  } catch (error) {
    console.error("Error getting customer bills:", error);
    throw new Error("Failed to retrieve customer bills");
  }
};

export const searchBills = async (
  searchTerm: string,
  searchBy: "billNumber" | "customerPhone" | "amount" = "billNumber",
): Promise<Bill[]> => {
  try {
    let q;
    if (searchBy === "billNumber") {
      q = query(
        collection(firestore, BILLS_COLLECTION),
        where("billNumber", ">=", searchTerm),
        where("billNumber", "<", searchTerm + "\uf8ff"),
      );
    } else if (searchBy === "customerPhone") {
      q = query(
        collection(firestore, BILLS_COLLECTION),
        where("customerDetails.phone", "==", searchTerm),
      );
    } else {
      // For amount search, fetch all and filter client-side
      const allBills = await getAllBillsFromFirestore();
      return allBills.filter((bill) =>
        bill.totalAmount.toString().includes(searchTerm),
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as FirestoreBill;
        return {
          ...data,
          id: doc.id,
          billDate: new Date(data.billDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as Bill;
      },
    );
  } catch (error) {
    console.error("Error searching bills:", error);
    throw new Error("Failed to search bills");
  }
};

export const deleteBillFromFirestore = async (
  billId: string,
): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, BILLS_COLLECTION, billId));
  } catch (error) {
    console.error("Error deleting bill from Firestore:", error);
    throw new Error("Failed to delete bill");
  }
};

// ===== PRODUCTS OPERATIONS =====

export const saveProductToFirestore = async (
  product: GiftProduct,
): Promise<string> => {
  try {
    const productData = {
      ...product,
      createdAt: Timestamp.fromDate(new Date(product.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(product.updatedAt)),
    };

    const docRef = await addDoc(
      collection(firestore, PRODUCTS_COLLECTION),
      productData,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving product to Firestore:", error);
    throw new Error("Failed to save product");
  }
};

export const updateProductInFirestore = async (
  productId: string,
  updates: Partial<GiftProduct>,
): Promise<void> => {
  try {
    const productRef = doc(firestore, PRODUCTS_COLLECTION, productId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(productRef, updateData);
  } catch (error) {
    console.error("Error updating product in Firestore:", error);
    throw new Error("Failed to update product");
  }
};

export const getProductFromFirestore = async (
  productId: string,
): Promise<GiftProduct | null> => {
  try {
    const productRef = doc(firestore, PRODUCTS_COLLECTION, productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return null;
    }

    const data = productDoc.data() as FirestoreProduct;
    return {
      ...data,
      id: productDoc.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as GiftProduct;
  } catch (error) {
    console.error("Error getting product from Firestore:", error);
    throw new Error("Failed to retrieve product");
  }
};

export const getAllProductsFromFirestore = async (): Promise<GiftProduct[]> => {
  try {
    const q = query(
      collection(firestore, PRODUCTS_COLLECTION),
      where("isActive", "==", true),
      orderBy("name"),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as FirestoreProduct;
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as GiftProduct;
      },
    );
  } catch (error) {
    console.error("Error getting all products from Firestore:", error);
    throw new Error("Failed to retrieve products");
  }
};

/**
 * Get all products from main products collection
 * Converts main Product type to GiftProduct format
 */
export const getMainProductsForBilling = async (): Promise<GiftProduct[]> => {
  try {
    const q = query(
      collection(firestore, MAIN_PRODUCTS_COLLECTION),
      where("status", "==", true), // Only fetch active products
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return mapMainProductToGiftProduct(doc.id, data);
      },
    );
  } catch (error) {
    console.error("Error getting main products:", error);
    throw new Error("Failed to retrieve products from main catalog");
  }
};

export const getProductsByCategory = async (
  categoryId: string,
): Promise<GiftProduct[]> => {
  try {
    const q = query(
      collection(firestore, PRODUCTS_COLLECTION),
      where("category", "==", categoryId),
      where("isActive", "==", true),
      orderBy("name"),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as FirestoreProduct;
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as GiftProduct;
      },
    );
  } catch (error) {
    console.error("Error getting products by category:", error);
    throw new Error("Failed to retrieve products by category");
  }
};

export const deleteProductFromFirestore = async (
  productId: string,
): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    throw new Error("Failed to delete product");
  }
};

// ===== CUSTOMERS OPERATIONS =====

export const saveCustomerToFirestore = async (
  customer: Customer,
): Promise<string> => {
  try {
    // If customer has an ID that seems to be from the users collection (not temporary), update it
    if (customer.id && !customer.id.startsWith("cust-")) {
      // Update existing user document
      await updateCustomerInFirestore(customer.id, {
        totalPurchases: customer.totalPurchases,
        totalSpent: customer.totalSpent,
        lastPurchaseDate: customer.lastPurchaseDate,
      });
      return customer.id;
    }

    // For new customers (with temporary IDs), add to users collection
    const customerData = {
      firstName: customer.firstName,
      lastName: customer.lastName || "",
      phone: customer.phone,
      email: customer.email || "",
      addresses: customer.address
        ? [
            {
              id: `addr-${Date.now()}`,
              addressLine1: customer.address,
              addressLine2: "",
              city: customer.city || "",
              state: "",
              pincode: customer.pincode || "",
              isDefault: true,
            },
          ]
        : [],
      totalPurchases: customer.totalPurchases || 0,
      totalSpent: customer.totalSpent || 0,
      createdAt: Timestamp.fromDate(new Date(customer.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(customer.updatedAt)),
      role: "customer",
    };

    const docRef = await addDoc(
      collection(firestore, CUSTOMERS_COLLECTION),
      customerData,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving customer to Firestore:", error);
    throw new Error("Failed to save customer");
  }
};

export const updateCustomerInFirestore = async (
  customerId: string,
  updates: Partial<Customer>,
): Promise<void> => {
  try {
    const customerRef = doc(firestore, CUSTOMERS_COLLECTION, customerId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.lastPurchaseDate) {
      updateData.lastPurchaseDate = Timestamp.fromDate(
        new Date(updates.lastPurchaseDate),
      );
    }

    await updateDoc(customerRef, updateData);
  } catch (error) {
    console.error("Error updating customer in Firestore:", error);
    throw new Error("Failed to update customer");
  }
};

export const getCustomerFromFirestore = async (
  customerId: string,
): Promise<Customer | null> => {
  try {
    const customerRef = doc(firestore, CUSTOMERS_COLLECTION, customerId);
    const customerDoc = await getDoc(customerRef);

    if (!customerDoc.exists()) {
      return null;
    }

    const data = customerDoc.data() as any;
    return mapUserToCustomer(customerDoc.id, data);
  } catch (error) {
    console.error("Error getting customer from Firestore:", error);
    throw new Error("Failed to retrieve customer");
  }
};

export const searchCustomersByPhone = async (
  phone: string,
): Promise<Customer[]> => {
  try {
    const cleanPhone = phone.replace(/\D/g, "");

    // Fetch all users from the users collection
    const q = query(collection(firestore, CUSTOMERS_COLLECTION));
    const querySnapshot = await getDocs(q);

    // Filter by phone number that starts with the entered digits
    return querySnapshot.docs
      .map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as any;
        return mapUserToCustomer(doc.id, data);
      })
      .filter((customer) =>
        customer.phone.replace(/\D/g, "").includes(cleanPhone),
      )
      .sort((a, b) => {
        // Prioritize exact matches and then by phone similarity
        const aPhone = a.phone.replace(/\D/g, "");
        const bPhone = b.phone.replace(/\D/g, "");
        if (aPhone === cleanPhone && bPhone !== cleanPhone) return -1;
        if (aPhone !== cleanPhone && bPhone === cleanPhone) return 1;
        return 0;
      });
  } catch (error) {
    console.error("Error searching customers by phone:", error);
    throw new Error("Failed to search customers");
  }
};

export const searchCustomersByName = async (
  name: string,
): Promise<Customer[]> => {
  try {
    const cleanName = name.toLowerCase().trim();
    const q = query(collection(firestore, CUSTOMERS_COLLECTION));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as any;
        return mapUserToCustomer(doc.id, data);
      })
      .filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(cleanName) ||
          (customer.lastName &&
            customer.lastName.toLowerCase().includes(cleanName)),
      );
  } catch (error) {
    console.error("Error searching customers by name:", error);
    throw new Error("Failed to search customers");
  }
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(firestore, CUSTOMERS_COLLECTION));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as any;
        return mapUserToCustomer(doc.id, data);
      },
    );
  } catch (error) {
    console.error("Error getting all customers:", error);
    throw new Error("Failed to retrieve customers");
  }
};

export const deleteCustomerFromFirestore = async (
  customerId: string,
): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, CUSTOMERS_COLLECTION, customerId));
  } catch (error) {
    console.error("Error deleting customer from Firestore:", error);
    throw new Error("Failed to delete customer");
  }
};

// ===== FILE STORAGE OPERATIONS =====

export const uploadBillPDFToStorage = async (
  billId: string,
  pdfFile: Blob,
): Promise<string> => {
  try {
    const fileName = `bills/${billId}-${Date.now()}.pdf`;
    const fileRef = ref(storage, fileName);

    await uploadBytes(fileRef, pdfFile);
    const downloadUrl = await getDownloadURL(fileRef);

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading PDF to Storage:", error);
    throw new Error("Failed to upload PDF");
  }
};

// ===== BATCH OPERATIONS =====

export const updateProductStockBatch = async (
  updates: Array<{ productId: string; newStock: number }>,
): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    updates.forEach(({ productId, newStock }) => {
      const productRef = doc(firestore, PRODUCTS_COLLECTION, productId);
      batch.update(productRef, {
        stock: newStock,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error updating product stock in batch:", error);
    throw new Error("Failed to update product stock");
  }
};
