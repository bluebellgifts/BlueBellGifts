// Payment Modal Component - Modern POS Style
import React, { useState } from "react";
import { BillCalculations, PaymentDetails } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  CreditCard,
  Smartphone,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Solid Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Process Payment</h2>
            <p className="text-sm text-blue-100 mt-1">
              Bill Amount: {formatCurrency(calculations.total)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-4 gap-3">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setPaymentMethod(value);
                    setReference("");
                  }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                    paymentMethod === value
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${paymentMethod === value ? "text-blue-600" : "text-gray-600"}`}
                  />
                  <span
                    className={`text-xs font-semibold text-center ${paymentMethod === value ? "text-blue-600" : "text-gray-700"}`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input Section */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                  Payment Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="text-lg font-semibold h-10"
                />
              </div>

              {/* Reference Number */}
              {["card", "bank"].includes(paymentMethod) && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    {paymentMethod === "card" ? "Card/Trans #" : "Ref #"}
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="text-sm h-10"
                  />
                </div>
              )}
            </div>

            {/* Add Payment Button */}
            <Button
              onClick={handleAddPayment}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              disabled={isFullyPaid}
            >
              {isFullyPaid ? "✓ Payment Complete" : "+ Add Payment"}
            </Button>
          </div>

          {/* Applied Payments List */}
          {payments.length > 0 && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-900">
                  Payments Recorded
                </h4>
              </div>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {payment.method}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-500">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </span>
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          <div className="space-y-3 bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bill Total</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(calculations.total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Paid</span>
              <span className="font-bold text-lg text-emerald-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-semibold ${balanceRemaining > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {balanceRemaining > 0 ? "Balance Due" : "Change Due"}
              </span>
              <span
                className={`text-2xl font-bold ${balanceRemaining > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {formatCurrency(Math.abs(balanceRemaining))}
              </span>
            </div>
          </div>

          {/* Warnings */}
          {balanceRemaining > 0 && payments.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Partial Payment
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Balance of {formatCurrency(balanceRemaining)} will be due
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-11 font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={payments.length === 0}
            >
              {isFullyPaid ? "✓ Complete Sale" : "Allow Partial"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
