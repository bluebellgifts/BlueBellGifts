// Utility functions for calculations
import { BillItem, Discount, BillCalculations } from "../types";

export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
): number => {
  return quantity * unitPrice;
};

export const calculateTaxAmount = (amount: number, taxRate: number): number => {
  return parseFloat(((amount * taxRate) / 100).toFixed(2));
};

export const calculateItemTax = (
  quantity: number,
  unitPrice: number,
  taxRate: number,
): number => {
  const subtotal = calculateItemTotal(quantity, unitPrice);
  return calculateTaxAmount(subtotal, taxRate);
};

export const calculateBillSubtotal = (items: BillItem[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

export const calculateBillTax = (items: BillItem[]): number => {
  return items.reduce((total, item) => total + item.taxAmount, 0);
};

export const calculateTotalDiscount = (
  subtotal: number,
  discounts: Discount[],
): number => {
  let totalDiscount = 0;

  discounts.forEach((discount) => {
    if (discount.type === "percentage") {
      const discountAmount = (subtotal * discount.value) / 100;
      const maxAmount = discount.maxAmount || discountAmount;
      totalDiscount += Math.min(discountAmount, maxAmount);
    } else if (discount.type === "fixed") {
      totalDiscount += discount.value;
    } else if (discount.type === "coupon" || discount.type === "loyalty") {
      totalDiscount += discount.value;
    }
  });

  return Math.min(totalDiscount, subtotal); // Can't discount more than subtotal
};

export const calculateBillTotals = (
  items: BillItem[],
  appliedDiscounts: Discount[] = [],
  paidAmount: number = 0,
): BillCalculations => {
  const subtotal = calculateBillSubtotal(items);
  const totalTax = calculateBillTax(items);
  const totalDiscount = calculateTotalDiscount(subtotal, appliedDiscounts);
  const total = subtotal + totalTax - totalDiscount;
  const balanceDue = Math.max(0, total - paidAmount);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    balanceDue: parseFloat(balanceDue.toFixed(2)),
  };
};

export const createBillItem = (
  id: string,
  productId: string,
  productName: string,
  quantity: number,
  unitPrice: number,
  taxRate: number,
  variant?: { [key: string]: string },
): BillItem => {
  const subtotal = calculateItemTotal(quantity, unitPrice);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);

  return {
    id,
    productId,
    productName,
    quantity,
    unitPrice,
    taxRate,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
    variant,
  };
};

export const removeBillItem = (
  items: BillItem[],
  itemId: string,
): BillItem[] => {
  return items.filter((item) => item.id !== itemId);
};

export const updateBillItemQuantity = (
  items: BillItem[],
  itemId: string,
  newQuantity: number,
): BillItem[] => {
  return items.map((item) => {
    if (item.id === itemId) {
      const subtotal = calculateItemTotal(newQuantity, item.unitPrice);
      const taxAmount = calculateTaxAmount(subtotal, item.taxRate);
      return {
        ...item,
        quantity: newQuantity,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
      };
    }
    return item;
  });
};

export const formatCurrency = (
  amount: number,
  currency: string = "₹",
): string => {
  return `${currency} ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const generateBillNumber = (): string => {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.floor(Math.random() * 10000);
  return `BILL-${date.getFullYear()}-${timestamp}-${random}`;
};

export const generateInvoiceId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `INV-${year}${month}${day}-${random}`;
};

export const calculateGST = (
  amount: number,
  gstRate: number = 18,
): { slab5: number; slab12: number; slab18: number } => {
  // Example: Distribute amount across different GST slabs
  // This is a simplified version - actual implementation depends on product categories
  return {
    slab5: 0,
    slab12: 0,
    slab18: calculateTaxAmount(amount, gstRate),
  };
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
