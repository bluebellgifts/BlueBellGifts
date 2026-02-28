// Types for Gifts Billing & POS System

export interface GiftProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice?: number;
  taxRate: number; // Percentage
  stock: number;
  imageUrl?: string;
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Size"
  options: string[]; // e.g., ["Red", "Blue", "Green"]
  affectsPrice?: boolean;
  priceModifier?: number; // Additional price for this variant
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number; // Quantity * unitPrice
  taxAmount: number;
  total: number; // Subtotal + taxAmount
  variant?: {
    [key: string]: string; // Selected variant options
  };
  notes?: string;
}

export interface Customer {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName?: string;
  address?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discount {
  id?: string;
  type: "percentage" | "fixed" | "coupon" | "loyalty";
  value: number; // Percentage value or fixed amount
  code?: string; // For coupon
  description: string;
  minOrderAmount?: number; // Minimum order for discount
  validUpto?: Date;
  maxAmount?: number; // Maximum discount amount for percentage
}

export interface Bill {
  id: string;
  billNumber: string;
  customerId?: string;
  customerDetails?: {
    name: string;
    phone: string;
    email?: string;
  };
  items: BillItem[];
  subtotal: number;
  discounts: Discount[];
  totalDiscount: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: "pending" | "partial" | "paid";
  paymentMode?: PaymentMode;
  paymentDetails?: PaymentDetails[];
  notes?: string;
  billDate: Date;
  dueDate?: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMode {
  method: "card" | "upi" | "bank" | "cheque" | "wallet";
  amount: number;
  reference?: string;
  date: Date;
}

export interface PaymentDetails {
  id: string;
  method: "card" | "upi" | "bank" | "cheque" | "wallet";
  amount: number;
  reference?: string;
  transactionId?: string;
  timestamp: Date;
}

export interface BillCalculations {
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  total: number;
  balanceDue: number;
}

export interface InvoiceTemplate {
  billNumber: string;
  billDate: Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMode?: string;
  paymentStatus: string;
  notes?: string;
  businessName: string;
  businessPhone: string;
  businessEmail?: string;
  businessLogo?: string;
  gstNumber?: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalBills: number;
  totalItems: number;
  averageBillValue: number;
  totalTax: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: {
    [key: string]: number; // card: 2000, upi: 1000, etc.
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface FirestoreBill extends Omit<
  Bill,
  "billDate" | "dueDate" | "createdAt" | "updatedAt"
> {
  billDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreProduct extends Omit<
  GiftProduct,
  "createdAt" | "updatedAt"
> {
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreCustomer extends Omit<
  Customer,
  "createdAt" | "updatedAt" | "lastPurchaseDate"
> {
  createdAt: string;
  updatedAt: string;
  lastPurchaseDate?: string;
}
