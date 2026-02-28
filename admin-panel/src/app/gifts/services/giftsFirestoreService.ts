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
const CUSTOMERS_COLLECTION = "gifts-customers";

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
    const q = query(collection(firestore, "products"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        // Convert main Product to GiftProduct format
        return {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          category: data.category || "Uncategorized",
          price: data.sellingPrice || data.retailPrice || 0,
          costPrice: data.costPrice || 0,
          taxRate: 18, // Default GST rate
          stock: data.stock || 0,
          imageUrl: data.image || "",
          isActive: true,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as GiftProduct;
      },
    );
  } catch (error) {
    console.error("Error getting main products:", error);
    throw new Error("Failed to retrieve products from main catalog");
  }
};

export const getProductsByCategory = async (
  category: string,
): Promise<GiftProduct[]> => {
  try {
    const q = query(
      collection(firestore, PRODUCTS_COLLECTION),
      where("category", "==", category),
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
    const customerData = {
      ...customer,
      lastPurchaseDate: customer.lastPurchaseDate
        ? Timestamp.fromDate(new Date(customer.lastPurchaseDate))
        : null,
      createdAt: Timestamp.fromDate(new Date(customer.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(customer.updatedAt)),
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
    return {
      ...data,
      id: customerDoc.id,
      lastPurchaseDate: data.lastPurchaseDate
        ? new Date(data.lastPurchaseDate)
        : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as Customer;
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
    const q = query(
      collection(firestore, CUSTOMERS_COLLECTION),
      where("phone", "==", cleanPhone),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as any;
        return {
          ...data,
          id: doc.id,
          lastPurchaseDate: data.lastPurchaseDate
            ? new Date(data.lastPurchaseDate)
            : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as Customer;
      },
    );
  } catch (error) {
    console.error("Error searching customers by phone:", error);
    throw new Error("Failed to search customers");
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
