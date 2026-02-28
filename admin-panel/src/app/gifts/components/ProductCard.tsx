// Product Card Component
import React from "react";
import { GiftProduct } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface ProductCardProps {
  product: GiftProduct;
  onAddToCart: (product: GiftProduct, quantity: number) => void;
  isDisabled?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
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
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Out of Stock
          </Badge>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge className="absolute top-2 right-2 bg-orange-500">
            Low Stock
          </Badge>
        )}

        {/* Category Badge */}
        <Badge className="absolute bottom-2 left-2 bg-blue-500">
          {product.category}
        </Badge>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Price and Tax Info */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              +{product.taxRate}% GST
            </span>
          </div>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <p className="text-xs text-gray-600">
            Stock: <strong>{product.stock}</strong> units available
          </p>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto">
          {isOutOfStock || isDisabled ? (
            <Button disabled className="w-full" variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Unavailable
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
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
                  className="flex-1 text-center border rounded py-1"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Bill
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
