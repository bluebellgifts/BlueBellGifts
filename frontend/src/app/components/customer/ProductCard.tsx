import React from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Product } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  getProductImage,
  getSellingPrice,
  orderProductOnWhatsApp,
} from "../../utils/whatsapp";

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { addToCart } = useApp();
  const displayPrice = getSellingPrice(product);
  const productImage = getProductImage(product);
  const isOutOfStock = (product.stock ?? product.stockQuantity ?? 999) <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    orderProductOnWhatsApp(product);
  };

  return (
    <div
      className="cursor-pointer group h-full flex flex-col"
      onClick={() => onNavigate("product-detail", { productId: product.id })}
    >
      {/* Card Container - Fully Responsive */}
      <Card className="overflow-hidden border border-slate-200/40 hover:border-blue-600/50 hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 h-full bg-white/50 backdrop-blur-sm md:group-hover:-translate-y-2 flex flex-col">
        <div className="relative overflow-hidden aspect-square sm:aspect-[4/5] bg-slate-100 flex-shrink-0">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-xs text-slate-400">
              No Image
            </div>
          )}
        </div>

        <CardContent className="flex flex-col flex-grow bg-white relative gap-2 !px-2 !py-2.5 sm:!px-3 sm:!py-3">
          <h3 className="font-bold text-slate-900 line-clamp-2 text-xs sm:text-sm leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm sm:text-base font-black text-blue-700">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {product.retailPrice > displayPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ₹{product.retailPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-1 py-2 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <ShoppingCart size={12} className="shrink-0" />
                Add
              </button>
              <button
                onClick={handleDirectBuy}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-1 py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <MessageCircle size={12} className="shrink-0" />
                Buy
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
