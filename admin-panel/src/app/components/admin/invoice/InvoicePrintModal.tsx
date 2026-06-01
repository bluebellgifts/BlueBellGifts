// @ts-ignore
import { Download, Printer, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Modal } from "../../ui/Modal";
import { Card } from "../../ui/card";
import {
  generateInvoicePDF,
  downloadPDF,
  openPDFForPrint,
} from "./invoicePdfGenerator";
import { toast } from "sonner";

interface InvoicePrintModalProps {
  isOpen: boolean;
  invoiceData: any;
  onClose: () => void;
}

export function InvoicePrintModal({
  isOpen,
  invoiceData,
  onClose,
}: InvoicePrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateInvoicePDF(invoiceData);
      openPDFForPrint(pdf);
      toast.success("Opening print preview...");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateInvoicePDF(invoiceData);
      downloadPDF(
        pdf,
        `Invoice-${invoiceData.invoiceNumber || "draft"}-${new Date().getTime()}.pdf`,
      );
      toast.success("Invoice downloaded successfully");
      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Created Successfully!"
    >
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            ✓ Invoice #{invoiceData?.invoiceNumber || "draft"} has been created
            for {invoiceData?.customerName}
          </p>
        </div>

        <p className="text-sm text-slate-600">
          Choose an action to proceed with your invoice:
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handlePrint}
          disabled={isGenerating}
          className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {/* @ts-ignore */}
          <Printer width={20} height={20} />
          {isGenerating ? "Generating PDF..." : "Print Invoice"}
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          variant="outline"
          className="w-full h-12 flex items-center justify-center gap-2 border-slate-200"
        >
          {/* @ts-ignore */}
          <Download width={20} height={20} />
          Download PDF
        </Button>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full h-10 border-slate-200"
        >
          Close
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        The invoice has been saved to your system
      </p>
    </Modal>
  );
}
