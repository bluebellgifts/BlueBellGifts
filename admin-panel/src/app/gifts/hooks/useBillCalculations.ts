// Custom hook for bill calculations
import { useState, useCallback, useMemo } from "react";
import { BillItem, Discount, BillCalculations } from "../types";
import {
  calculateBillSubtotal,
  calculateBillTax,
  calculateTotalDiscount,
  createBillItem,
  removeBillItem,
  updateBillItemQuantity,
  generateUniqueId,
} from "../utils/calculations";

export const useBillCalculations = (initialItems: BillItem[] = []) => {
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const calculations: BillCalculations = useMemo(() => {
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
  }, [items, appliedDiscounts, paidAmount]);

  const addItem = useCallback(
    (
      productId: string,
      productName: string,
      quantity: number,
      unitPrice: number,
      taxRate: number,
      variant?: { [key: string]: string },
    ) => {
      const newItem = createBillItem(
        generateUniqueId(),
        productId,
        productName,
        quantity,
        unitPrice,
        taxRate,
        variant,
      );
      setItems((prev) => [...prev, newItem]);
    },
    [],
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => removeBillItem(prev, itemId));
  }, []);

  const updateItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeItem(itemId);
      } else {
        setItems((prev) => updateBillItemQuantity(prev, itemId, newQuantity));
      }
    },
    [removeItem],
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const addDiscount = useCallback((discount: Discount) => {
    setAppliedDiscounts((prev) => [
      ...prev,
      { ...discount, id: generateUniqueId() },
    ]);
  }, []);

  const removeDiscount = useCallback((discountId: string) => {
    setAppliedDiscounts((prev) => prev.filter((d) => d.id !== discountId));
  }, []);

  const clearDiscounts = useCallback(() => {
    setAppliedDiscounts([]);
  }, []);

  const recordPayment = useCallback((amount: number) => {
    setPaidAmount((prev) => prev + amount);
  }, []);

  const resetPayment = useCallback(() => {
    setPaidAmount(0);
  }, []);

  return {
    items,
    appliedDiscounts,
    paidAmount,
    calculations,
    addItem,
    removeItem,
    updateItemQuantity,
    clearItems,
    addDiscount,
    removeDiscount,
    clearDiscounts,
    recordPayment,
    resetPayment,
  };
};
