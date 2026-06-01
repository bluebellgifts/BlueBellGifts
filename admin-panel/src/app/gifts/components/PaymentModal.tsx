import React, { useEffect, useMemo, useState } from "react";
import { BillCalculations, PaymentDetails } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Button } from "../../components/ui/button";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Smartphone,
  X,
} from "lucide-react";

type PaymentMethod = PaymentDetails["method"];

interface PaymentModalProps {
  isOpen: boolean;
  calculations: BillCalculations;
  onClose: () => void;
  onPaymentComplete: (payments: PaymentDetails[], totalPaid: number) => void;
}

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  helper: string;
  icon: React.ElementType;
}> = [
  { value: "upi", label: "UPI", helper: "GPay, PhonePe", icon: Smartphone },
  { value: "cash", label: "Cash", helper: "Cash received", icon: Banknote },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  calculations,
  onClose,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [error, setError] = useState("");

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );
  const balanceRemaining = Math.max(0, calculations.total - totalPaid);
  const isFullyPaid = balanceRemaining <= 0;

  useEffect(() => {
    if (!isOpen) return;

    setPayments([]);
    setReference("");
    setError("");
    setAmount(calculations.total.toString());
    setPaymentMethod("upi");
  }, [isOpen, calculations.total]);

  if (!isOpen) return null;

  const setQuickAmount = (value: number) => {
    setAmount(Math.max(0, value).toFixed(2));
    setError("");
  };

  const handleAddPayment = () => {
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Enter a valid payment amount");
      return;
    }

    if (paymentAmount > balanceRemaining) {
      setError(`Amount cannot exceed ${formatCurrency(balanceRemaining)}`);
      return;
    }

    const payment: PaymentDetails = {
      id: `payment-${Date.now()}`,
      method: paymentMethod,
      amount: Math.round(paymentAmount * 100) / 100,
      reference: reference.trim() || undefined,
      timestamp: new Date(),
    };

    setPayments((prev) => [...prev, payment]);
    setAmount(Math.max(0, balanceRemaining - paymentAmount).toFixed(2));
    setReference("");
    setError("");
  };

  const handleRemovePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== paymentId));
    setError("");
  };

  const handleComplete = () => {
    if (payments.length === 0) {
      setError("Add at least one payment before completing the bill");
      return;
    }

    if (!isFullyPaid) {
      const confirmed = window.confirm(
        `Balance due is ${formatCurrency(balanceRemaining)}. Complete as partial payment?`,
      );
      if (!confirmed) return;
    }

    onPaymentComplete(payments, totalPaid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">
              Complete Payment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Record payment by UPI or cash.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] overflow-hidden">
          <div className="overflow-y-auto p-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-slate-900">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(({ value, label, helper, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(value);
                      setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === value
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`mb-3 h-6 w-6 ${
                        paymentMethod === value
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                    />
                    <p className="text-sm font-extrabold text-slate-900">
                      {label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div
                className={`grid gap-4 ${
                  paymentMethod === "upi"
                    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                    : "grid-cols-1"
                }`}
              >
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setError("");
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-lg font-bold text-slate-950 focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                {paymentMethod === "upi" && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Reference optional
                  </label>
                  <input
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 focus:border-blue-500 focus:outline-none"
                    placeholder="Transaction ID or note"
                  />
                </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAmount(balanceRemaining)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Remaining
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAmount(calculations.total)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Exact Total
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAmount(calculations.total / 2)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Half
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleAddPayment}
                disabled={isFullyPaid}
                className="mt-4 h-12 w-full rounded-xl bg-blue-600 font-extrabold text-white hover:bg-blue-700"
              >
                {isFullyPaid ? "Payment Fully Recorded" : "Add Payment"}
              </Button>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Recorded Payments
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {payments.length} entries
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                  No payment has been added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-extrabold capitalize text-slate-950">
                          {payment.method}
                        </p>
                        {payment.reference && (
                          <p className="mt-1 text-xs text-slate-500">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold text-emerald-700">
                          {formatCurrency(payment.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePayment(payment.id)}
                          className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col border-l border-slate-200 bg-slate-50 p-6">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-slate-300">Bill Total</p>
              <p className="mt-2 text-3xl font-extrabold">
                {formatCurrency(calculations.total)}
              </p>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Paid</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Balance</span>
                <span
                  className={`font-bold ${
                    balanceRemaining > 0 ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {formatCurrency(balanceRemaining)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      100,
                      calculations.total > 0
                        ? (totalPaid / calculations.total) * 100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {isFullyPaid ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Ready to complete</p>
                  <p className="mt-1 text-xs">
                    Full payment has been recorded for this bill.
                  </p>
                </div>
              </div>
            ) : payments.length > 0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Partial payment</p>
                  <p className="mt-1 text-xs">
                    Balance due will remain on the invoice.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-auto flex gap-3 pt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="h-12 flex-1 border-slate-300 text-slate-700 hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleComplete}
                disabled={payments.length === 0}
                className="h-12 flex-1 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
              >
                Complete Bill
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
