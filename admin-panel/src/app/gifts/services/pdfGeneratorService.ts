// PDF Invoice Generator Service
import jsPDF from "jspdf";
import { Bill, InvoiceTemplate, BillItem } from "../types";
import { formatCurrency, formatDate } from "../utils/calculations";

interface InvoiceOptions {
  isPreview?: boolean;
  logoUrl?: string;
}

export const generateInvoicePDF = (
  bill: Bill,
  options: InvoiceOptions = {},
): Blob => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // ===== HEADER SECTION =====
  // Business name and details
  doc.setFontSize(20);
  doc.setTextColor(25, 73, 150); // Blue color
  doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 12;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Bluebell Gifts & More", margin, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  const businessDetails = [
    "📍 123 Gift Street, Mumbai 400001",
    "📱 +91-98765-43210",
    "📧 contact@bluebell-gifts.com",
  ];

  businessDetails.forEach((detail) => {
    doc.text(detail, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 4;

  // ===== INVOICE DETAILS SECTION =====
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const invoiceDetailsLeft = [
    { label: "Invoice #:", value: bill.billNumber },
    { label: "Date:", value: formatDate(bill.billDate) },
    { label: "Status:", value: capitalizeFirstLetter(bill.paymentStatus) },
  ];

  const invoiceDetailsRight = [
    {
      label: "Due Date:",
      value: bill.dueDate ? formatDate(bill.dueDate) : "N/A",
    },
    { label: "GST#:", value: "27ABCDE1234F1Z0" },
  ];

  const labelX = margin;
  const valueX = margin + 40;
  const rightLabelX = pageWidth / 2 + margin;
  const rightValueX = rightLabelX + 40;

  invoiceDetailsLeft.forEach((item, index) => {
    doc.text(item.label, labelX, yPosition + index * 6);
    doc.text(item.value, valueX, yPosition + index * 6);
  });

  invoiceDetailsRight.forEach((item, index) => {
    doc.text(item.label, rightLabelX, yPosition + index * 6);
    doc.text(item.value, rightValueX, yPosition + index * 6);
  });

  yPosition += 20;

  // ===== CUSTOMER SECTION =====
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill To:", margin, yPosition);

  yPosition += 6;
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  if (bill.customerDetails) {
    const customerLines = [
      bill.customerDetails.name,
      bill.customerDetails.phone,
    ];
    if (bill.customerDetails.email) {
      customerLines.push(bill.customerDetails.email);
    }

    customerLines.forEach((line) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
  } else {
    doc.text("Walk-in Customer", margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 4;

  // ===== ITEMS TABLE =====
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  // Table headers
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(25, 73, 150);

  const tableTop = yPosition;
  const colWidth = [60, 20, 30, 30];
  const colLabels = ["Item Description", "Qty", "Unit Price", "Amount"];
  let xPos = margin;

  colLabels.forEach((label, idx) => {
    doc.rect(xPos, tableTop, colWidth[idx], 8, "F");
    doc.text(label, xPos + 2, tableTop + 6, { align: "left" });
    xPos += colWidth[idx];
  });

  // Table rows
  yPosition = tableTop + 10;
  doc.setTextColor(0, 0, 0);

  bill.items.forEach((item) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    const rowHeight = 8;
    xPos = margin;

    // Item description
    doc.text(item.productName, xPos + 2, yPosition + 4);
    xPos += colWidth[0];

    // Quantity
    doc.text(item.quantity.toString(), xPos + 2, yPosition + 4);
    xPos += colWidth[1];

    // Unit price
    doc.text(
      formatCurrency(item.unitPrice).substring(2),
      xPos + 2,
      yPosition + 4,
    );
    xPos += colWidth[2];

    // Amount
    doc.text(formatCurrency(item.total).substring(2), xPos + 2, yPosition + 4);

    // Light grey background for alternating rows
    if (Math.floor((yPosition - tableTop - 10) / 8) % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition - 3, contentWidth, rowHeight, "F");
    }

    yPosition += rowHeight;
  });

  yPosition += 4;

  // ===== TOTALS SECTION =====
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const totalLabelX = pageWidth - margin - 60;
  const totalValueX = pageWidth - margin - 20;

  const totalsData = [
    { label: "Subtotal:", value: bill.subtotal },
    { label: "Tax (GST):", value: bill.taxAmount },
    { label: "Discount:", value: -bill.totalDiscount },
  ];

  totalsData.forEach((item) => {
    doc.text(item.label, totalLabelX, yPosition);
    doc.text(
      formatCurrency(Math.abs(item.value)).substring(2),
      totalValueX,
      yPosition,
      {
        align: "right",
      },
    );
    yPosition += 6;
  });

  // Total amount box
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(25, 73, 150);
  doc.rect(totalLabelX - 5, yPosition, 60, 10, "F");

  doc.text("TOTAL", totalLabelX, yPosition + 7);
  doc.text(
    formatCurrency(bill.totalAmount).substring(2),
    totalValueX,
    yPosition + 7,
    {
      align: "right",
    },
  );

  yPosition += 14;

  // Payment info
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  if (bill.paymentDetails && bill.paymentDetails.length > 0) {
    doc.text("Payment Details:", margin, yPosition);
    yPosition += 6;

    bill.paymentDetails.forEach((payment) => {
      doc.setTextColor(50, 50, 50);
      const paymentText = `${capitalizeFirstLetter(payment.method)}: ${formatCurrency(
        payment.amount,
      )}`;
      doc.text(paymentText, margin + 5, yPosition);
      yPosition += 5;
    });

    if (bill.balanceDue > 0) {
      yPosition += 2;
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(10);
      doc.text(
        `Balance Due: ${formatCurrency(bill.balanceDue)}`,
        margin,
        yPosition,
      );
    }
  }

  yPosition += 8;

  // Footer
  if (yPosition > pageHeight - 20) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText =
    "Thank you for your purchase! Please retain this invoice for your records.";
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });

  // Return as blob
  return doc.output("blob");
};

export const downloadInvoice = (bill: Bill): void => {
  const pdf = generateInvoicePDF(bill);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${bill.billNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printInvoice = (bill: Bill): void => {
  const pdf = generateInvoicePDF(bill);
  const url = URL.createObjectURL(pdf);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getInvoicePreviewData = (bill: Bill): InvoiceTemplate => {
  return {
    billNumber: bill.billNumber,
    billDate: bill.billDate,
    customerName: bill.customerDetails?.name,
    customerPhone: bill.customerDetails?.phone,
    customerEmail: bill.customerDetails?.email,
    items: bill.items,
    subtotal: bill.subtotal,
    tax: bill.taxAmount,
    discount: bill.totalDiscount,
    total: bill.totalAmount,
    paymentMode: bill.paymentMode?.method,
    paymentStatus: bill.paymentStatus,
    notes: bill.notes,
    businessName: "Bluebell Gifts & More",
    businessPhone: "+91-98765-43210",
    businessEmail: "contact@bluebell-gifts.com",
    gstNumber: "27ABCDE1234F1Z0",
  };
};
