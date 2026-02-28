export interface Product {
  id: string;
  name: string;
  category: string;
  retailPrice: number;
  resellerPrice: number;
  sellingPrice: number;
  discountPrice: number;
  costPrice: number;
  onOffer: boolean;
  stock: number;
  sku: string;
  image: string;
  description: string;
  tags: string[];
  rating: number;
  reviews: number;
  discount?: number;
  needsCustomerName?: boolean;
  needsCustomerPhoto?: boolean;
  multipleImagesRequired?: boolean;
  numberOfImagesRequired?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "reseller" | "admin";
  image?: string;
  phone?: string;
  addresses?: Address[];
  disabled?: boolean;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: Address;
  orderType: "online" | "offline" | "reseller";
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: "card" | "upi" | "cheque" | "bank-transfer";
  paymentStatus: "paid" | "pending" | "partial";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  date: Date;
  notes?: string;
}

export interface SiteContent {
  id: string; // 'about', 'contact', 'terms', 'privacy', 'refund'
  title: string;
  content: string; // HTML or Markdown
  lastUpdated: Date;
}

export interface SiteSettings {
  id: string; // 'general'
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  currency: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  logoUrl?: string;
}
