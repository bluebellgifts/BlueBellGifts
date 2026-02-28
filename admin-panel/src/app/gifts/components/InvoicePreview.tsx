// Invoice Preview Component
import React from "react";
import { Bill } from "../types";
import { formatCurrency, formatDate } from "../utils/calculations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Download, Printer, Share2, X } from "lucide-react";

interface InvoicePreviewProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
  onDownload: (bill: Bill) => void;
  onPrint: (bill: Bill) => void;
  onShare?: (bill: Bill) => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  isOpen,
  bill,
  onClose,
  onDownload,
  onPrint,
  onShare,
}) => {
  if (!bill) return null;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Invoice Preview</DialogTitle>
              <DialogDescription>
                Bill #{bill.billNumber} - {formatDate(bill.billDate)}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="space-y-6 py-4">
          {/* Header Section */}
          <div className="border-b pb-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
              <p className="text-gray-600">Bluebell Gifts & More</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">
                  📍 123 Gift Street, Mumbai 400001
                </p>
                <p className="text-gray-600">📱 +91-98765-43210</p>
                <p className="text-gray-600">📧 contact@bluebell-gifts.com</p>
              </div>

              <div className="text-right">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Invoice #:</span>{" "}
                    {bill.billNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(bill.billDate)}
                  </p>
                  <p>
                    <span
                      className={`font-semibold px-2 py-1 rounded text-xs ${getPaymentStatusColor(bill.paymentStatus)}`}
                    >
                      {bill.paymentStatus.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold text-sm mb-2">Bill To:</h4>
              {bill.customerDetails ? (
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{bill.customerDetails.name}</p>
                  <p>{bill.customerDetails.phone}</p>
                  {bill.customerDetails.email && (
                    <p>{bill.customerDetails.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Walk-in Customer</p>
              )}
            </Card>

            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold text-sm mb-2">Payment Details:</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-600">Method:</span>{" "}
                  <span className="font-semibold capitalize">
                    {bill.paymentMode?.method || "N/A"}
                  </span>
                </p>
                {bill.paymentDetails && bill.paymentDetails.length > 0 && (
                  <p>
                    <span className="text-gray-600">Payments:</span>{" "}
                    <span className="font-semibold">
                      {bill.paymentDetails.length} method(s)
                    </span>
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Tax</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.taxAmount)}
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <Card className="w-full md:w-80 p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST):</span>
                  <span>{formatCurrency(bill.taxAmount)}</span>
                </div>
                {bill.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(bill.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t-2 font-semibold text-base">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
                {bill.balanceDue > 0 && (
                  <div className="flex justify-between pt-2 border-t text-orange-600 font-semibold">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(bill.balanceDue)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Notes */}
          {bill.notes && (
            <Card className="p-4 bg-yellow-50">
              <h4 className="font-semibold text-sm mb-2">Notes:</h4>
              <p className="text-sm text-gray-700">{bill.notes}</p>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 py-4 border-t">
            Thank you for your purchase! Please retain this invoice for your
            records.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 py-4 border-t">
          <Button
            onClick={() => onPrint(bill)}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={() => onDownload(bill)}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {onShare && (
            <Button
              onClick={() => onShare(bill)}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
