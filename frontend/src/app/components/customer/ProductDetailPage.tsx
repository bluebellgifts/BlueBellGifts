import React, { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  Check,
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ProductCard } from "./ProductCard";
import { useApp } from "../../context/AppContext";
import { Product, ProductVariant } from "../../types";
import { toast } from "sonner";

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductDetailPage({
  productId,
  onNavigate,
}: ProductDetailPageProps) {
  const { addToCart, user, products } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [customTextFieldValues, setCustomTextFieldValues] = useState<
    Record<string, string>
  >({});
  const [requiredImageFieldValues, setRequiredImageFieldValues] = useState<
    Record<string, string[]>
  >({});
  const [showCustomizationForm, setShowCustomizationForm] = useState(false);

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

  // Get product images
  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [product.image || ""];

  // Get selected variant
  const selectedVariant =
    product.variants && selectedVariantId
      ? product.variants.find((v) => v.id === selectedVariantId)
      : product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

  // Initialize selected variant on mount
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product.id]);

  const getPrice = () => {
    if (selectedVariant) {
      if (user?.role === "reseller") return selectedVariant.resellerPrice;
      if (product.onOffer && selectedVariant.offerPrice)
        return selectedVariant.offerPrice;
      return selectedVariant.sellingPrice || selectedVariant.retailPrice;
    }

    if (user?.role === "reseller") return product.resellerPrice;
    if (product.onOffer && product.discountPrice) return product.discountPrice;
    return product.sellingPrice || product.retailPrice;
  };

  const getDiscount = () => {
    const basePrice = selectedVariant
      ? selectedVariant.retailPrice
      : product.retailPrice;
    const sellPrice = selectedVariant
      ? selectedVariant.sellingPrice
      : product.sellingPrice;

    if (basePrice && sellPrice) {
      return Math.round(((basePrice - sellPrice) / basePrice) * 100);
    }
    return product.discount || 0;
  };

  const displayPrice = getPrice();
  const discountPercentage = getDiscount();
  const showResellerPrice = user?.role === "reseller";
  const showOfferPrice =
    !showResellerPrice && product.onOffer && product.discountPrice;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const hasVariants = product.variants && product.variants.length > 0;
  const hasCustomization =
    (product.customTextFields && product.customTextFields.length > 0) ||
    (product.requiredImageFields && product.requiredImageFields.length > 0);

  const handleAddToCart = () => {
    if (!user) {
      onNavigate("login", {
        redirect: "product-detail",
        productId: product.id,
      });
      toast.error("Please login to add items to cart");
      return;
    }

    if (hasCustomization) {
      setShowCustomizationForm(true);
    } else {
      addToCartWithCustomization();
    }
  };

  const addToCartWithCustomization = () => {
    addToCart(product, quantity, {
      selectedVariantId: selectedVariantId || undefined,
      customTextFields:
        Object.keys(customTextFieldValues).length > 0
          ? customTextFieldValues
          : undefined,
      requiredImageFields:
        Object.keys(requiredImageFieldValues).length > 0
          ? requiredImageFieldValues
          : undefined,
    });

    toast.success("Product added to cart!");
    setShowCustomizationForm(false);
  };

  const handleImageUpload = (fieldId: string, files: FileList | null) => {
    if (!files) return;

    const urls: string[] = [];
    let completed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        urls.push(event.target?.result as string);
        completed++;

        if (completed === files.length) {
          setRequiredImageFieldValues((prev) => ({
            ...prev,
            [fieldId]: [...(prev[fieldId] || []), ...urls],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeRequiredImage = (fieldId: string, index: number) => {
    setRequiredImageFieldValues((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 md:pt-6 pb-8 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate("home")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          title="Back to Home"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium">
          <button
            onClick={() => onNavigate("home")}
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </button>
          <span className="mx-2 text-slate-300">/</span>
          <button
            onClick={() => onNavigate("products")}
            className="hover:text-blue-600 transition-colors"
          >
            Products
          </button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-200/50 relative group">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button className="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg text-slate-600 hover:text-red-500 transition-all hover:scale-110">
                <Heart size={20} />
              </button>
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
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                {product.category}
              </span>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  <span className="text-sm md:text-base text-slate-400 line-through decoration-slate-400">
                    ₹
                    {(
                      selectedVariant?.retailPrice || product.retailPrice
                    ).toLocaleString()}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-lg whitespace-nowrap">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {(selectedVariant?.stock || product.stock) > 10 ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Check size={14} strokeWidth={3} /> In Stock & Ready to
                      Ship
                    </span>
                  ) : (selectedVariant?.stock || product.stock) > 0 ? (
                    <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                      Only {selectedVariant?.stock || product.stock} items left
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Variants Selection */}
            {hasVariants && (
              <div className="mb-8">
                <Label className="font-bold text-slate-900 mb-3 block">
                  Select Variant
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants?.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedVariantId === variant.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <p className="font-bold text-slate-900">{variant.name}</p>
                      {variant.attributes.length > 0 && (
                        <p className="text-sm text-slate-600">
                          {variant.attributes
                            .map((a) => `${a.name}: ${a.value}`)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        ₹{variant.sellingPrice.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 prose prose-slate text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-slate-200 rounded-full h-12 w-fit bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full hover:bg-slate-50 rounded-l-full transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        selectedVariant?.stock || product.stock || 1,
                        quantity + 1,
                      ),
                    )
                  }
                  className="px-4 h-full hover:bg-slate-50 rounded-r-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-1 gap-2 items-center">
                <Button
                  variant="primary"
                  className="flex-1 bg-blue-600 text-white rounded-2xl h-12 text-base font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  onClick={handleAddToCart}
                  disabled={(selectedVariant?.stock || product.stock) === 0}
                >
                  <ShoppingCart size={20} className="mr-2" /> Add to Cart
                </Button>
              </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              {[
                {
                  icon: Truck,
                  label: "Free Delivery",
                  sub: "On orders > ₹999",
                },
                {
                  icon: Shield,
                  label: "Secure Payment",
                  sub: "100% Protected",
                },
                { icon: RotateCcw, label: "Easy Returns", sub: "7 Day Policy" },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
                    <feat.icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {feat.label}
                    </p>
                    <p className="text-xs text-slate-500">{feat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Form Modal */}
        {showCustomizationForm && hasCustomization && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Customize Your Order
                </h2>
                <button
                  onClick={() => setShowCustomizationForm(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <CardContent className="p-6 space-y-8">
                {/* Custom Text Fields */}
                {product.customTextFields &&
                  product.customTextFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-slate-900">
                        Additional Information
                      </h3>
                      {product.customTextFields.map((field) => (
                        <div key={field.id}>
                          <Label className="font-medium">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {field.fieldType === "textarea" ? (
                            <textarea
                              value={customTextFieldValues[field.id] || ""}
                              onChange={(e) =>
                                setCustomTextFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder}
                              className="w-full mt-2 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                            />
                          ) : (
                            <Input
                              type={
                                field.fieldType === "date"
                                  ? "date"
                                  : field.fieldType
                              }
                              value={customTextFieldValues[field.id] || ""}
                              onChange={(e) =>
                                setCustomTextFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder}
                              className="mt-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Required Image Fields */}
                {product.requiredImageFields &&
                  product.requiredImageFields.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-lg text-slate-900">
                        Upload Images
                      </h3>
                      {product.requiredImageFields.map((imageField) => (
                        <div key={imageField.id} className="space-y-3">
                          <Label className="font-medium">
                            {imageField.label}
                            {imageField.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                            <span className="text-sm text-slate-500 ml-2">
                              (Max {imageField.maxImages} images)
                            </span>
                          </Label>

                          {/* Upload Area */}
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm font-medium text-slate-600">
                              Click to upload
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(imageField.id, e.target.files)
                              }
                              className="hidden"
                            />
                          </label>

                          {/* Uploaded Images Preview */}
                          {requiredImageFieldValues[imageField.id] &&
                            requiredImageFieldValues[imageField.id].length >
                              0 && (
                              <div className="grid grid-cols-3 gap-3">
                                {requiredImageFieldValues[imageField.id].map(
                                  (img, idx) => (
                                    <div
                                      key={idx}
                                      className="relative aspect-square rounded-lg overflow-hidden"
                                    >
                                      <img
                                        src={img}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        onClick={() =>
                                          removeRequiredImage(
                                            imageField.id,
                                            idx,
                                          )
                                        }
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCustomizationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={addToCartWithCustomization}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-slate-200 pt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
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
