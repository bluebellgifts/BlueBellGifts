// @ts-ignore
import { X, Download, Printer, Edit2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Modal } from "../../ui/Modal";
import { Select } from "../../ui/select";
import { Invoice } from "../../../types";
import { updateInvoice } from "../../../services/firestore-service";
import { toast } from "sonner";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}

export function InvoiceDetailModal({
  isOpen,
  invoice,
  onClose,
  onUpdate,
}: InvoiceDetailModalProps) {
  const [paymentStatus, setPaymentStatus] = useState(invoice.paymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const paymentStatuses = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "partial", label: "Partial" },
  ];

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methods: Record<string, string> = {
      card: "💳 Card",
      upi: "📱 UPI",
      cheque: "📄 Cheque",
      "bank-transfer": "🏦 Bank Transfer",
    };
    return methods[method] || method;
  };

  const handleUpdatePaymentStatus = async () => {
    if (paymentStatus === invoice.paymentStatus) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateInvoice(invoice.id, { paymentStatus });
      toast.success("Payment status updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-number { font-size: 24px; font-weight: bold; }
              .invoice-date { color: #666; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .customer-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f0f0f0; }
              .total-row { font-weight: bold; }
              .final-total { font-size: 18px; font-weight: bold; color: #0066cc; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="invoice-number">INVOICE ${invoice.invoiceNumber}</div>
              <div class="invoice-date">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
            </div>

            <div class="section customer-info">
              <div class="section-title">CUSTOMER INFORMATION</div>
              <p><strong>${invoice.customerName}</strong></p>
              <p>Phone: ${invoice.customerPhone}</p>
              ${invoice.customerEmail ? `<p>Email: ${invoice.customerEmail}</p>` : ""}
              ${invoice.customerAddress ? `<p>Address: ${invoice.customerAddress}</p>` : ""}
            </div>

            <div class="section">
              <div class="section-title">INVOICE ITEMS</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
                    .map(
                      (item) =>
                        `<tr>
                    <td>${item.product.name}</td>
                    <td>₹${item.product.retailPrice.toLocaleString()}</td>
                    <td>${item.quantity}</td>
                    <td>₹${(item.product.retailPrice * item.quantity).toLocaleString()}</td>
                  </tr>`,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div style="text-align: right; width: 300px; margin-left: auto;">
                <div style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                  <span>Subtotal:</span>
                  <span style="float: right; font-weight: bold;">₹${invoice.subtotal.toLocaleString()}</span>
                </div>
                ${
                  invoice.tax > 0
                    ? `
                <div style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                  <span>Tax:</span>
                  <span style="float: right; font-weight: bold;">₹${invoice.tax.toLocaleString()}</span>
                </div>`
                    : ""
                }
                ${
                  invoice.discount && invoice.discount > 0
                    ? `
                <div style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                  <span>Discount:</span>
                  <span style="float: right; font-weight: bold;">-₹${invoice.discount.toLocaleString()}</span>
                </div>`
                    : ""
                }
                <div style="padding: 12px 0; font-size: 16px;">
                  <span>Total Amount:</span>
                  <span style="float: right; font-weight: bold; color: #0066cc;">₹${invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">PAYMENT INFORMATION</div>
              <p>Payment Method: ${getPaymentMethodLabel(invoice.paymentMethod)}</p>
              <p>Payment Status: ${invoice.paymentStatus.toUpperCase()}</p>
            </div>

            ${
              invoice.notes
                ? `
            <div class="section">
              <div class="section-title">NOTES</div>
              <p>${invoice.notes}</p>
            </div>`
                : ""
            }

            <div class="footer">
              <p>This is a computer-generated invoice. Thank you for your business!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF library like jsPDF
    toast.info("PDF download feature coming soon");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Invoice Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Invoice Number</p>
            <p className="text-lg font-bold text-slate-800 font-mono">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Date</p>
            <p className="text-lg font-semibold text-slate-800">
              {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <Card className="p-4 bg-slate-50">
          <h4 className="font-semibold text-slate-800 mb-2">
            Customer Information
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Name:</span> {invoice.customerName}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {invoice.customerPhone}
            </p>
            {invoice.customerEmail && (
              <p>
                <span className="font-medium">Email:</span>{" "}
                {invoice.customerEmail}
              </p>
            )}
            {invoice.customerAddress && (
              <p>
                <span className="font-medium">Address:</span>{" "}
                {invoice.customerAddress}
              </p>
            )}
          </div>
        </Card>

        {/* Invoice Items */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800">Invoice Items</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Product</th>
                  <th className="px-3 py-2 text-center font-semibold">Price</th>
                  <th className="px-3 py-2 text-center font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr
                    key={item.product.id}
                    className="border-t border-slate-200"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU: {item.product.sku}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center">
                      ₹{item.product.retailPrice.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      ₹
                      {(
                        item.product.retailPrice * item.quantity
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">
                ₹{invoice.subtotal.toLocaleString()}
              </span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold">
                  ₹{invoice.tax.toLocaleString()}
                </span>
              </div>
            )}
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Discount</span>
                <span className="font-semibold">
                  -₹{invoice.discount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-slate-300 pt-2 text-lg">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-bold text-blue-600">
                ₹{invoice.total.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Payment Method</p>
            <p className="font-medium text-slate-800">
              {getPaymentMethodLabel(invoice.paymentMethod)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Payment Status</p>
            <Badge variant={getPaymentStatusColor(paymentStatus)}>
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Update Payment Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Update Payment Status
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as typeof paymentStatus)
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            {paymentStatus !== invoice.paymentStatus && (
              <Button
                type="button"
                variant="primary"
                onClick={handleUpdatePaymentStatus}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-sm text-slate-800">
              <span className="font-semibold">Notes:</span> {invoice.notes}
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer size={18} className="mr-2" />
            Print
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleDownloadPDF}
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
