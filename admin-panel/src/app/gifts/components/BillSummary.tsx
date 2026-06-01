// Bill Summary Component
import React from "react";
import { BillItem, BillCalculations, Discount } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Trash2, Edit2 } from "lucide-react";

interface BillSummaryProps {
  items: BillItem[];
  calculations: BillCalculations;
  appliedDiscounts: Discount[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveDiscount: (discountId: string) => void;
  isReadOnly?: boolean;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  items,
  calculations,
  appliedDiscounts,
  onRemoveItem,
  onUpdateQuantity,
  onRemoveDiscount,
  isReadOnly = false,
}) => {
  return (
    <Card className="p-4 bg-white">
      {/* Items List */}
      <div className="mb-6">
        <h3 className="font-semibold text-base mb-4">Bill Items</h3>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-grow">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                    <span>Qty: {item.quantity}</span>
                    <span>{formatCurrency(item.unitPrice)}/unit</span>
                    <span>Tax: {item.taxRate}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      (₹{item.subtotal.toFixed(2)} + ₹
                      {item.taxAmount.toFixed(2)} tax)
                    </p>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applied Discounts */}
      {appliedDiscounts.length > 0 && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-sm mb-2 text-green-700">
            Applied Discounts
          </h4>
          <div className="space-y-2">
            {appliedDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-green-700">
                  {discount.code ? `${discount.code} - ` : ""}
                  {discount.description}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    -{formatCurrency(discount.value)}
                  </span>
                  {!isReadOnly && (
                    <button
                      onClick={() => onRemoveDiscount(discount.id!)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculations Summary */}
      <div className="space-y-3 border-t pt-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {formatCurrency(calculations.subtotal)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (GST)</span>
          <span className="font-medium">
            {formatCurrency(calculations.totalTax)}
          </span>
        </div>

        {/* Discount */}
        {calculations.totalDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(calculations.totalDiscount)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between pt-3 border-t-2 border-blue-200">
          <span className="font-semibold text-base">Total Amount</span>
          <span className="font-bold text-lg text-blue-600">
            {formatCurrency(calculations.total)}
          </span>
        </div>

        {/* Balance Due */}
        {calculations.balanceDue > 0 && (
          <div className="flex justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <span className="font-semibold text-orange-700">Balance Due</span>
            <span className="font-bold text-orange-600">
              {formatCurrency(calculations.balanceDue)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
