import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a professional, premium gift shop invoice PDF.
 * Optimized for full A4 page width without clipping or blank margins.
 */
export const generateInvoicePDF = async (invoiceData) => {
  let container = null;
  try {
    window.scrollTo(0, 0);

    container = document.createElement("div");
    container.innerHTML = getInvoiceHTML(invoiceData);

    const captureWidth = 1024;
    container.style.width = `${captureWidth}px`;
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.zIndex = "-9999";
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: captureWidth,
      windowWidth: captureWidth,
      onclone: (clonedDoc) => {
        const allElements = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i];
          if (el.classList.contains("invoice-root")) {
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
          }
        }
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const originalWidth = 1024;
    const originalHeight = canvas.height / 2;

    const mmPerPixel = 210 / originalWidth;
    const dynamicHeightMm = originalHeight * mmPerPixel;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [210, Math.max(297, dynamicHeightMm)],
    });

    const pdfWidth = 210;
    const pdfHeight = dynamicHeightMm;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, null, "FAST");

    return pdf;
  } catch (error) {
    console.error("PDF Generation Failed:", error);
    throw error;
  } finally {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const getPaidStatus = (paymentStatus, total, paidAmount) => {
  if (paymentStatus === "paid" || (paidAmount && paidAmount >= total)) {
    return "Paid";
  } else if (paymentStatus === "pending") {
    return "Pending";
  } else if (paymentStatus === "partial") {
    return "Partial";
  }
  return "Pending";
};

const getInvoiceHTML = (invoiceData) => {
  const items = invoiceData.items || [];
  const itemsHTML = items
    .map(
      (item, index) => `
      <tr class="item-row">
        <td class="cell sn">${(index + 1).toString().padStart(2, "0")}</td>
        <td class="cell description">
          <div class="item-name">${item.product?.name || item.name}</div>
          <div class="item-type">SKU: ${item.product?.sku || "N/A"}</div>
        </td>
        <td class="cell qty">${item.quantity}</td>
        <td class="cell price">${formatCurrency(item.product?.retailPrice || item.price || 0)}</td>
        <td class="cell total">${formatCurrency((item.product?.retailPrice || item.price || 0) * (item.quantity || 1))}</td>
      </tr>
    `,
    )
    .join("");

  const subtotal = invoiceData.subtotal || 0;
  const tax = invoiceData.tax || 0;
  const discount = invoiceData.discount || 0;
  const total = invoiceData.total || subtotal + tax - discount;
  const paidAmount = invoiceData.paidAmount || 0;
  const isPartialPayment = paidAmount < total;
  const balance = isPartialPayment ? Math.max(0, total - paidAmount) : 0;
  const paymentStatus = getPaidStatus(
    invoiceData.paymentStatus,
    total,
    paidAmount,
  );

  const paymentMethodMap = {
    card: "Card",
    upi: "UPI",
    "bank-transfer": "Bank Transfer",
    cheque: "Cheque",
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        /* Invoice Specific Styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .invoice-root {
          width: 1024px;
          min-height: 1448px;
          background: #ffffff;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0c0c0c;
          padding: 60px 80px;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Premium Blue Gradient Bar */
        .top-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          background: linear-gradient(90deg, #1a3a52 0%, #2563eb 50%, #1a3a52 100%);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .brand-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .salon-name {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
          text-transform: uppercase;
          margin: 0;
          color: #1a3a52;
        }

        .salon-tag {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: #2563eb;
        }

        .receipt-section {
          text-align: right;
        }

        .receipt-title {
          font-size: 64px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #1a1a1a;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 15px;
        }

        .meta-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-id {
          font-size: 16px;
          font-weight: 800;
          color: #000;
        }

        .meta-date {
          font-size: 13px;
          color: #777;
          font-weight: 500;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 25px;
          background: #fcfcfc;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
        }

        .info-col h3 {
          font-size: 14px;
          font-weight: 900;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .info-content {
          font-size: 15px;
          line-height: 1.5;
        }

        .info-content strong {
          font-size: 18px;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
          color: #000;
        }

        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
          background: #000;
          color: #fff;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .items-table th {
          text-align: left;
          padding: 12px 0;
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #333;
          border-bottom: 2px solid #000;
        }

        .cell {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 15px;
        }

        .sn { width: 60px; font-size: 14px; color: #aaa; }
        .description { }
        .item-name { font-size: 15px; font-weight: 800; color: #000; margin-bottom: 4px; }
        .item-type { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #2563eb; }
        .qty { width: 80px; text-align: center; font-weight: 700; }
        .price { width: 150px; text-align: right; font-weight: 500; }
        .total { width: 150px; text-align: right; font-weight: 900; font-size: 18px; }

        .summary-box {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .signature-block {
          flex: 0 0 auto;
          padding: 12px 14px;
          background: #ffffff;
          border: 1px solid #333;
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 200px;
        }

        .signature-checkmark {
          font-size: 40px;
          color: #10b981;
          margin-bottom: 6px;
          line-height: 1;
          order: -1;
        }

        .signature-details {
          font-size: 11px;
          color: #333;
          line-height: 1.35;
          margin-bottom: 6px;
        }

        .signature-details strong {
          font-weight: 700;
          display: block;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .signature-date {
          font-size: 9px;
          color: #666;
          margin-bottom: 0;
          font-weight: 600;
          line-height: 1.3;
        }

        .summary-card {
          width: 340px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #000;
          border-radius: 4px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          font-size: 15px;
          color: #444;
          font-weight: 500;
        }

        .summary-row.discount { color: #2563eb; font-weight: 700; }

        .summary-row.final {
          padding-top: 20px;
          margin-top: 12px;
          border-top: 2px solid #000;
          color: #000;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .summary-row.balance {
          color: #dc3545;
          font-weight: 800;
          padding-top: 15px;
          margin-top: 10px;
          border-top: 1px dashed #ddd;
        }

        .membership-banner {
          margin-bottom: 20px;
          padding: 25px;
          background: #1a3a52;
          color: #fff;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .banner-text h4 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .banner-text p {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }

        .banner-link {
          text-align: right;
        }

        .banner-url {
          font-size: 20px;
          font-weight: 900;
          color: #2563eb;
        }

        .banner-info {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
        }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
          margin-top: auto;
        }

        .salon-info {
          font-size: 15px;
          color: #888;
          line-height: 2;
        }

        .thanks-section {
          text-align: right;
        }

        .thanks-msg {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 4px;
        }

        .legal-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: #2563eb;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: 900;
          color: #fbfbfb;
          z-index: -1;
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 20px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-root">
        <div class="top-gradient"></div>
        <div class="watermark">GIFT SHOP</div>

        <div class="header">
          <div class="brand-section">
            <div class="logo-box">
              <img src="" alt="Gift Shop" onerror="this.style.visibility='hidden'">
            </div>
            <span class="salon-name">Gift Shop</span>
            <span class="salon-tag">Premium Gifts & Collections</span>
          </div>
          <div class="receipt-section">
            <div class="receipt-title">Invoice</div>
            <div class="meta-group">
              <span class="meta-id">${invoiceData.invoiceNumber || "#" + String(new Date().getTime()).slice(-8)}</span>
              <span class="meta-date">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <h3>Customer Details</h3>
            <div class="info-content">
              <strong>${invoiceData.customerName || "Valued Customer"}</strong>
              ${invoiceData.customerPhone || "Contact on file"}<br>
              ${invoiceData.customerEmail || "email on file"}<br>
              ${invoiceData.customerAddress ? "<span style='font-size: 13px; color: #666;'>" + invoiceData.customerAddress + "</span>" : ""}
            </div>
          </div>
          <div class="info-col">
            <h3>Payment Information</h3>
            <div class="info-content">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span>Method: <strong>${paymentMethodMap[invoiceData.paymentMethod] || "Card"}</strong></span>
                <span class="status-pill">${paymentStatus}</span>
              </div>
              ${invoiceData.notes ? '<span style="color: #2563eb; font-weight: 700; display: block; margin-top: 8px;">Note: ' + invoiceData.notes + "</span>" : ""}
            </div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="signature-block">
            <div class="signature-checkmark">✓</div>
            <div class="signature-details">
              <strong>Invoice Generated by</strong>
              Gift Shop Admin
            </div>
            <div class="signature-date">
              Date: ${new Date().toLocaleDateString("en-IN")}<br>
              Time: ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${
              tax > 0
                ? `
            <div class="summary-row">
              <span>Tax (${((tax / subtotal) * 100).toFixed(0)}%)</span>
              <span>${formatCurrency(tax)}</span>
            </div>
            `
                : ""
            }
            ${
              discount > 0
                ? `
            <div class="summary-row discount">
              <span>Discount</span>
              <span>-${formatCurrency(discount)}</span>
            </div>
            `
                : ""
            }
            <div class="summary-row">
              <span>Amount Paid</span>
              <span>${formatCurrency(paidAmount)}</span>
            </div>
            <div class="summary-row final">
              <span>Total Bill</span>
              <span>${formatCurrency(total)}</span>
            </div>
            ${
              balance > 0
                ? `
            <div class="summary-row balance">
              <span>Balance Due</span>
              <span>${formatCurrency(balance)}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="footer-pinned" style="margin-top: auto; padding-top: 40px;">
          <div class="membership-banner">
            <div class="banner-text">
              <h4>Shop Premium Gifts</h4>
              <p>Explore our curated collection of premium gifts and<br>special collections for every occasion.</p>
            </div>
            <div class="banner-link">
              <div class="banner-url">Gift Shop</div>
              <div class="banner-info">Premium Collections</div>
            </div>
          </div>

          <div class="footer">
            <div class="salon-info">
              Gift Shop Admin<br>
              Online Store<br>
              Support Team
            </div>
            <div class="thanks-section">
              <div class="thanks-msg">Thank You</div>
              <div class="legal-tag">Gift Shop Admin Panel</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadPDF = (pdf, fileName) => {
  pdf.save(fileName);
};

/**
 * Open PDF in a new window for printing
 */
export const openPDFForPrint = (pdf) => {
  const pdfDataUrl = pdf.output("datauri");
  const printWindow = window.open(pdfDataUrl);
  if (printWindow) {
    printWindow.focus();
  }
};
