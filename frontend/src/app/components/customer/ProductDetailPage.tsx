import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../ui/button";
import { ProductCard } from "./ProductCard";
import { useApp } from "../../context/AppContext";
import {
  getProductImage,
  getSellingPrice,
  orderProductOnWhatsApp,
} from "../../utils/whatsapp";

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductDetailPage({
  productId,
  onNavigate,
}: ProductDetailPageProps) {
  const { addToCart, products } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 pt-4 md:pt-6 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Product not found
          </h1>
          <Button onClick={() => onNavigate("products")} className="mt-4">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url).filter(Boolean)
      : [getProductImage(product)].filter(Boolean);
  const sellingPrice = getSellingPrice(product);
  const mrpPrice = product.retailPrice || sellingPrice;
  const availableStock = product.stock ?? product.stockQuantity ?? 999;
  const isOutOfStock = availableStock <= 0;
  const discountPercentage =
    mrpPrice > sellingPrice
      ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
      : 0;
  const relatedProducts = products
    .filter((p) =>
      product.category
        ? p.category === product.category && p.id !== product.id
        : p.id !== product.id,
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 md:pt-6 pb-8 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("products")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-200/50 relative group">
            {productImages[selectedImage] ? (
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  No Image
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? "border-blue-600 ring-4 ring-blue-50"
                        : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="inline-block w-fit px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                {product.category}
              </span>
            )}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-blue-700">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                {mrpPrice > sellingPrice && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{mrpPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-lg whitespace-nowrap">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {!isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Check size={14} strokeWidth={3} /> Available
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mb-8 prose prose-slate text-slate-600 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            <div className="mb-8">
              <label className="font-bold text-slate-900 mb-3 block">
                Quantity
              </label>
              <div className="flex items-center border-2 border-slate-200 rounded-xl w-fit bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-50 transition-colors rounded-l-xl"
                >
                  <Minus size={20} />
                </button>
                <span className="px-6 py-3 font-bold text-slate-900 border-x-2 border-slate-200 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(availableStock, quantity + 1))
                  }
                  disabled={quantity >= availableStock}
                  className="p-3 hover:bg-slate-50 transition-colors rounded-r-xl disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingCart size={20} className="mr-2" /> Add to Cart
              </Button>
              <Button
                size="lg"
                onClick={() => orderProductOnWhatsApp(product, quantity)}
                disabled={isOutOfStock}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageCircle size={20} className="mr-2" /> Buy on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
