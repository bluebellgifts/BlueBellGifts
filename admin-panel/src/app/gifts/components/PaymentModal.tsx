// Payment Modal Component
import React, { useState } from "react";
import { BillCalculations, PaymentDetails } from "../types";
import { formatCurrency } from "../utils/calculations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { CreditCard, Smartphone } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  calculations: BillCalculations;
  onClose: () => void;
  onPaymentComplete: (payments: PaymentDetails[], totalPaid: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  calculations,
  onClose,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [amount, setAmount] = useState(calculations.total.toString());
  const [reference, setReference] = useState("");
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  const paymentMethods = [
    { value: "card", label: "Card", icon: CreditCard },
    { value: "upi", label: "UPI", icon: Smartphone },
    { value: "bank", label: "Bank Transfer", icon: CreditCard },
    { value: "wallet", label: "Digital Wallet", icon: Smartphone },
  ];

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount) || 0;

    if (paymentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (totalPaid + paymentAmount > calculations.total) {
      alert(
        `Payment cannot exceed total amount of ${formatCurrency(calculations.total)}`,
      );
      return;
    }

    const payment: PaymentDetails = {
      id: `payment-${Date.now()}`,
      method: paymentMethod as any,
      amount: Math.round(paymentAmount * 100) / 100,
      reference: reference || undefined,
      timestamp: new Date(),
    };

    setPayments([...payments, payment]);
    setTotalPaid(totalPaid + paymentAmount);
    setAmount("");
    setReference("");
  };

  const handleRemovePayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      setPayments(payments.filter((p) => p.id !== paymentId));
      setTotalPaid(totalPaid - payment.amount);
    }
  };

  const handleComplete = () => {
    if (totalPaid < calculations.total) {
      const remaining = calculations.total - totalPaid;
      if (
        !confirm(
          `Balance of ${formatCurrency(remaining)} will be due. Continue?`,
        )
      ) {
        return;
      }
    }
    onPaymentComplete(payments, totalPaid);
  };

  const balanceRemaining = calculations.total - totalPaid;
  const isFullyPaid = balanceRemaining <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Bill Amount: {formatCurrency(calculations.total)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setPaymentMethod(value);
                    setReference("");
                  }}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Reference Number (for card/bank) */}
            {["card", "bank"].includes(paymentMethod) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {paymentMethod === "card"
                    ? "Card/Transaction #"
                    : "Reference #"}
                </label>
                <Input
                  type="text"
                  placeholder="Enter reference number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Add Payment Button */}
          <Button
            onClick={handleAddPayment}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isFullyPaid}
          >
            {isFullyPaid ? "Payment Complete" : "Add Payment"}
          </Button>

          {/* Applied Payments */}
          {payments.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="font-semibold text-sm mb-3 text-green-700">
                Payments Recorded
              </h4>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {payment.method}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-600">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Summary */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Bill Total:</span>
              <span className="font-semibold">
                {formatCurrency(calculations.total)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>
                {balanceRemaining > 0 ? "Balance Due:" : "Change Due:"}
              </span>
              <span
                className={
                  balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                }
              >
                {formatCurrency(Math.abs(balanceRemaining))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={payments.length === 0}
            >
              {isFullyPaid ? "Complete Sale" : "Allow Partial Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
