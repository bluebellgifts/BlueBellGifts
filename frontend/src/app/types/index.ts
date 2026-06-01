export interface ProductVariant {
  id: string;
  name: string;
  type: string;
  attributes: Array<{ name: string; value: string }>;
  costPrice: number;
  retailPrice: number;
  sellingPrice: number;
  resellerPrice: number;
  offerPrice?: number;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface RequiredImageField {
  id: string;
  label: string;
  required: boolean;
  maxImages: number;
}

export interface CustomTextField {
  id: string;
  label: string;
  fieldType: "text" | "email" | "date" | "number" | "phone" | "textarea";
  required: boolean;
  placeholder: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  slug?: string;
  sku: string;
  status?: boolean;

  // Pricing
  costPrice: number;
  retailPrice: number;
  sellingPrice: number;
  resellerPrice: number;
  offerPrice?: number;
  discountPrice?: number;
  onOffer?: boolean;
  discount?: number;

  // Stock & Inventory
  stockQuantity?: number;
  stock: number;

  // Images & Media
  images?: ProductImage[];
  image?: string; // Fallback for old format
  videos?: Array<{
    url: string;
    type: "url" | "file";
    id?: string;
    name?: string;
  }>;

  // Variants & Customization
  variants?: ProductVariant[];
  requiredImageFields?: RequiredImageField[];
  customTextFields?: CustomTextField[];

  // Shipping
  shippingTamilNadu?: number;
  shippingRestOfIndia?: number;
  freeShipping?: boolean;

  // Old format fields (backwards compatibility)
  tags?: string[];
  rating?: number;
  reviews?: number;
  needsCustomerName?: boolean;
  needsCustomerPhoto?: boolean;
  multipleImagesRequired?: boolean;
  numberOfImagesRequired?: number;
  customFields?: Array<{
    id: string;
    label: string;
    fieldType: "name" | "email" | "phone" | "dob" | "textarea" | "text";
    required: boolean;
    placeholder?: string;
    helpText?: string;
  }>;

  // Timestamps
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItemCustomization {
  selectedVariantId?: string;
  customerName?: string;
  customerPhotoUrl?: string;
  customerImages?: string[];
  customTextFields?: { [fieldId: string]: string };
  requiredImageFields?: { [fieldId: string]: string[] };
  customFields?: { [fieldId: string]: string };
  imageFields?: { [fieldId: string]: string[] };
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: CartItemCustomization;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "reseller" | "admin";
  image?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  cart?: CartItem[];
  savedItems?: string[];
  disabled?: boolean;
  profileComplete?: boolean;
  createdAt?: any;
  updatedAt?: any;
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
  hasCustomizations?: boolean;
}

export interface ContactMessage {
  id: string;
  text: string;
  sender: "customer" | "admin";
  createdAt: any;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  messages?: ContactMessage[];
  createdAt: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
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
