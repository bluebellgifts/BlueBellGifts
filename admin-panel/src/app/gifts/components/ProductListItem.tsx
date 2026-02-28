// Compact Product List Item Component
import React from "react";
import { GiftProduct } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface ProductListItemProps {
  product: GiftProduct;
  onAddToCart: (product: GiftProduct, quantity: number) => void;
  isDisabled?: boolean;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onAddToCart,
  isDisabled = false,
}) => {
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="border-b border-border/50 last:border-b-0 py-4 px-4 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h4 className="font-semibold text-sm text-[#1a2332] truncate">
              {product.name}
            </h4>
            {isOutOfStock && (
              <Badge className="bg-red-100 text-red-700 text-xs flex-shrink-0">
                Out of Stock
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge className="bg-orange-100 text-orange-700 text-xs flex-shrink-0">
                Low Stock
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#64748b]">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-medium">
              {product.category}
            </span>
            <span className="text-[#64748b]">
              Stock: <strong>{product.stock}</strong>
            </span>
            <span className="text-[#64748b]">
              GST: <strong>{product.taxRate}%</strong>
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-[#1a2332] text-lg">
            ₹{product.price.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Quantity and Add Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOutOfStock || isDisabled ? (
            <Button disabled size="sm" variant="outline">
              <AlertCircle className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <div className="flex items-center border border-border/50 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        product.stock,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  className="w-12 text-center text-sm border-l border-r border-border/50 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                size="sm"
                variant="primary"
                className="flex-shrink-0 h-9 px-4 font-medium"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
