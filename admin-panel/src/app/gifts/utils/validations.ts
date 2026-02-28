// Validation functions for the billing system
import { GiftProduct, Customer, Bill, PaymentDetails } from "../types";

export const validateProduct = (product: Partial<GiftProduct>): string[] => {
  const errors: string[] = [];

  if (!product.name || product.name.trim() === "") {
    errors.push("Product name is required");
  }

  if (!product.category || product.category.trim() === "") {
    errors.push("Product category is required");
  }

  if (product.price === undefined || product.price < 0) {
    errors.push("Product price must be a positive number");
  }

  if (product.stock === undefined || product.stock < 0) {
    errors.push("Stock quantity must be a positive number");
  }

  if (
    product.taxRate === undefined ||
    product.taxRate < 0 ||
    product.taxRate > 100
  ) {
    errors.push("Tax rate must be between 0 and 100");
  }

  return errors;
};

export const validateCustomer = (customer: Partial<Customer>): string[] => {
  const errors: string[] = [];

  if (!customer.phone || customer.phone.trim() === "") {
    errors.push("Phone number is required");
  } else if (!validatePhoneNumber(customer.phone)) {
    errors.push("Invalid phone number format");
  }

  if (!customer.firstName || customer.firstName.trim() === "") {
    errors.push("First name is required");
  }

  if (customer.email && !validateEmail(customer.email)) {
    errors.push("Invalid email format");
  }

  return errors;
};

export const validateBill = (bill: Partial<Bill>): string[] => {
  const errors: string[] = [];

  if (!bill.items || bill.items.length === 0) {
    errors.push("Bill must contain at least one item");
  }

  if (!bill.billDate) {
    errors.push("Bill date is required");
  }

  if (bill.totalAmount === undefined || bill.totalAmount <= 0) {
    errors.push("Bill amount must be greater than zero");
  }

  return errors;
};

export const validatePaymentDetails = (
  payment: Partial<PaymentDetails>,
): string[] => {
  const errors: string[] = [];

  if (!payment.method) {
    errors.push("Payment method is required");
  }

  if (payment.amount === undefined || payment.amount <= 0) {
    errors.push("Payment amount must be greater than zero");
  }

  if (payment.method === "card" && !payment.reference) {
    errors.push("Card reference number is required");
  }

  if (payment.method === "cheque" && !payment.reference) {
    errors.push("Cheque number is required");
  }

  return errors;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Indian phone number validation (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

export const validateCouponCode = (
  code: string,
  appliedCoupons: string[] = [],
): { valid: boolean; error?: string } => {
  if (!code || code.trim() === "") {
    return { valid: false, error: "Coupon code is required" };
  }

  if (code.length < 3) {
    return { valid: false, error: "Coupon code must be at least 3 characters" };
  }

  if (appliedCoupons.includes(code)) {
    return { valid: false, error: "Coupon code already applied" };
  }

  return { valid: true };
};

export const validateDiscountAmount = (
  discountAmount: number,
  billAmount: number,
): { valid: boolean; error?: string } => {
  if (discountAmount < 0) {
    return { valid: false, error: "Discount amount cannot be negative" };
  }

  if (discountAmount > billAmount) {
    return { valid: false, error: "Discount amount cannot exceed bill amount" };
  }

  return { valid: true };
};

export const validateQuantity = (
  quantity: number,
  availableStock: number,
): { valid: boolean; error?: string } => {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than zero" };
  }

  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Quantity must be a whole number" };
  }

  if (quantity > availableStock) {
    return { valid: false, error: `Only ${availableStock} units available` };
  }

  return { valid: true };
};

export const validateGSTNumber = (gstNumber: string): boolean => {
  // Indian GST number format: 15 alphanumeric characters
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber.toUpperCase());
};

export const validateBillTotal = (
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
): { valid: boolean; error?: string } => {
  const calculated = (subtotal + tax - discount).toFixed(2);
  const expected = total.toFixed(2);

  if (parseFloat(calculated) !== parseFloat(expected)) {
    return {
      valid: false,
      error: `Bill total mismatch. Expected ${expected}, got ${calculated}`,
    };
  }

  return { valid: true };
};

export const validateCustomerSearchInput = (input: string): boolean => {
  // At least 3 characters for name search or valid phone format
  if (input.length >= 3) return true;
  if (/^\d{10}$/.test(input.replace(/\D/g, ""))) return true;
  return false;
};
