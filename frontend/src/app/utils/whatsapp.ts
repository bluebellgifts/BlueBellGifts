import { CartItem, Product } from "../types";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || "919876543210";

export const getSellingPrice = (product: Product) =>
  product.sellingPrice || product.retailPrice || 0;

export const getProductImage = (product: Product) =>
  product.images?.[0]?.url || product.image || "";

const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const openWhatsApp = (message: string) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export const orderProductOnWhatsApp = (product: Product, quantity = 1) => {
  const sellingPrice = getSellingPrice(product);
  const mrp = product.retailPrice || sellingPrice;
  const total = sellingPrice * quantity;

  openWhatsApp(
    [
      "Hello Bluebell Gifts, I want to order this product:",
      "",
      `Product: ${product.name}`,
      `Quantity: ${quantity}`,
      `MRP: ${formatCurrency(mrp)}`,
      `Selling Price: ${formatCurrency(sellingPrice)}`,
      `Total: ${formatCurrency(total)}`,
      product.category ? `Category: ${product.category}` : "",
      "",
      "Please confirm availability and next steps.",
    ]
      .filter(Boolean)
      .join("\n"),
  );
};

export const orderCartOnWhatsApp = (cart: CartItem[]) => {
  const subtotal = cart.reduce(
    (sum, item) => sum + getSellingPrice(item.product) * item.quantity,
    0,
  );

  openWhatsApp(
    [
      "Hello Bluebell Gifts, I want to order these cart items:",
      "",
      ...cart.flatMap((item, index) => {
        const sellingPrice = getSellingPrice(item.product);
        return [
          `${index + 1}. ${item.product.name}`,
          `   Quantity: ${item.quantity}`,
          `   MRP: ${formatCurrency(item.product.retailPrice || sellingPrice)}`,
          `   Selling Price: ${formatCurrency(sellingPrice)}`,
          `   Line Total: ${formatCurrency(sellingPrice * item.quantity)}`,
          "",
        ].filter(Boolean);
      }),
      `Cart Total: ${formatCurrency(subtotal)}`,
      "",
      "Please confirm availability and next steps.",
    ].join("\n"),
  );
};
