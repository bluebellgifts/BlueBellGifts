import React, { useRef, useState } from "react";
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Banknote,
  Check,
  User,
  Camera,
  Loader2,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Order, CartItem } from "../../types";
import { uploadOrderCustomerPhoto } from "../../services/storage-service";
import { createOrder } from "../../services/firestore-service";

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cart, user, clearCart } = useApp();
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Enhanced customization state to handle custom fields and image fields
  const [customizations, setCustomizations] = useState<{
    [productId: string]: {
      customFields: { [fieldId: string]: string };
      imageFields: {
        [fieldId: string]: {
          files: File[];
          previews: string[];
          savedUrls: string[];
        };
      };
    };
  }>(() => {
    const init: any = {};
    cart.forEach((item) => {
      // Use existing customization from cart if available
      const existingCustom = item.customization;

      if (
        item.product.customFields?.length ||
        item.product.customTextFields?.length ||
        item.product.requiredImageFields?.length
      ) {
        const customFieldsInit: any = {};
        const imageFieldsInit: any = {};

        // Prefer cart customization, then initialize if needed
        item.product.customFields?.forEach((field: any) => {
          customFieldsInit[field.id] =
            existingCustom?.customFields?.[field.id] || "";
        });

        item.product.customTextFields?.forEach((field: any) => {
          customFieldsInit[field.id] =
            existingCustom?.customTextFields?.[field.id] || "";
        });

        item.product.requiredImageFields?.forEach((field: any) => {
          // Get saved URLs from cart if available
          const savedUrls =
            existingCustom?.requiredImageFields?.[field.id] || [];
          console.log(
            `📸 Loading images for ${item.product.name} - ${field.label}:`,
            savedUrls,
          );
          imageFieldsInit[field.id] = {
            files: [],
            previews: savedUrls, // Use saved URLs as previews
            savedUrls: savedUrls, // Track which are saved
          };
        });

        init[item.product.id] = {
          customFields: customFieldsInit,
          imageFields: imageFieldsInit,
        };
      }
    });
    console.log("✓ Checkout customizations initialized:", init);
    return init;
  });

  const fileInputRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});

  const itemsNeedingCustomization = cart.filter(
    (item) =>
      (item.product.customFields?.length ?? 0) > 0 ||
      (item.product.requiredImageFields?.length ?? 0) > 0,
  );

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const getItemPrice = (product: any) => {
    if (user?.role === "reseller") return product.resellerPrice;
    if (product.onOffer && product.discountPrice) return product.discountPrice;
    return product.sellingPrice || product.retailPrice;
  };

  const subtotal = cart.reduce((sum, item) => {
    return sum + getItemPrice(item.product) * item.quantity;
  }, 0);

  const shipping = subtotal > 999 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: <Smartphone size={24} /> },
    { id: "card", name: "Credit/Debit Card", icon: <CreditCard size={24} /> },
    { id: "netbanking", name: "Net Banking", icon: <Building size={24} /> },
    { id: "wallet", name: "Wallet", icon: <Wallet size={24} /> },
    { id: "cod", name: "Cash on Delivery", icon: <Banknote size={24} /> },
  ];

  const getProductImageUrl = (product: any): string => {
    // Try to get from images array first (primary source)
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    // Fallback to image property
    if (product.image) {
      return product.image;
    }
    // Default placeholder
    return "https://via.placeholder.com/400x400?text=No+Image";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomFieldChange = (
    productId: string,
    fieldId: string,
    value: string,
  ) => {
    setCustomizations((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        customFields: {
          ...prev[productId].customFields,
          [fieldId]: value,
        },
      },
    }));
  };

  const handleImageFieldChange = (
    productId: string,
    fieldId: string,
    files: FileList,
    maxImages: number,
  ) => {
    const newFiles = Array.from(files).slice(0, maxImages);
    const previews = newFiles.map((file) => URL.createObjectURL(file));

    setCustomizations((prev) => {
      const currentData = prev[productId].imageFields[fieldId];
      const savedUrls = currentData.savedUrls || [];

      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          imageFields: {
            ...prev[productId].imageFields,
            [fieldId]: {
              files: newFiles,
              previews: [...savedUrls, ...previews], // Combine saved + new
              savedUrls, // Keep track of saved
            },
          },
        },
      };
    });
  };

  const removeImageFromField = (
    productId: string,
    fieldId: string,
    index: number,
  ) => {
    setCustomizations((prev) => {
      const currentData = prev[productId].imageFields[fieldId];
      const savedCount = currentData.savedUrls?.length || 0;

      // If removing a saved image (from cart)
      if (index < savedCount) {
        const newSavedUrls = currentData.savedUrls.filter(
          (_, i) => i !== index,
        );
        return {
          ...prev,
          [productId]: {
            ...prev[productId],
            imageFields: {
              ...prev[productId].imageFields,
              [fieldId]: {
                files: currentData.files,
                previews: [
                  ...newSavedUrls,
                  ...currentData.previews.slice(savedCount),
                ],
                savedUrls: newSavedUrls,
              },
            },
          },
        };
      }
      // If removing a newly uploaded image
      else {
        const newFileIndex = index - savedCount;
        const newFiles = currentData.files.filter((_, i) => i !== newFileIndex);
        const newPreviews = currentData.previews.filter((_, i) => i !== index);

        return {
          ...prev,
          [productId]: {
            ...prev[productId],
            imageFields: {
              ...prev[productId].imageFields,
              [fieldId]: {
                files: newFiles,
                previews: newPreviews,
                savedUrls: currentData.savedUrls,
              },
            },
          },
        };
      }
    });
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const storagePathId = `order-${Date.now()}`;

      // Upload images for custom fields and build customized cart items
      const enrichedItems: CartItem[] = await Promise.all(
        cart.map(async (item): Promise<CartItem> => {
          const custom = customizations[item.product.id];
          if (!custom) return item;

          // Combine saved and newly uploaded images
          const uploadedImageFields: { [fieldId: string]: string[] } = {};
          for (const [fieldId, imageData] of Object.entries(
            custom.imageFields,
          )) {
            const uploadedUrls: string[] = [];

            // First add the saved URLs (from cart)
            const savedUrls = imageData.savedUrls || [];
            uploadedUrls.push(...savedUrls);
            console.log(
              `📦 Using saved images for field ${fieldId}:`,
              savedUrls,
            );

            // Then upload only new files
            console.log(
              `📤 Uploading ${imageData.files.length} new images for field ${fieldId}`,
            );
            for (let i = 0; i < imageData.files.length; i++) {
              const url = await uploadOrderCustomerPhoto(
                storagePathId,
                `${item.product.id}-${fieldId}-${i}`,
                imageData.files[i],
              );
              uploadedUrls.push(url);
              console.log(`✓ Uploaded image ${i + 1}:`, url);
            }
            uploadedImageFields[fieldId] = uploadedUrls;
          }

          console.log(
            `✓ All images ready for ${item.product.name}:`,
            uploadedImageFields,
          );

          return {
            ...item,
            customization: {
              ...item.customization,
              customFields: custom.customFields,
              imageFields: uploadedImageFields,
            },
          };
        }),
      );

      const hasCustomizations = enrichedItems.some((i) => i.customization);

      const orderData: Omit<Order, "id"> = {
        customerId: user?.id || "guest",
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: enrichedItems,
        total,
        status: "pending",
        paymentMethod:
          paymentMethods.find((pm) => pm.id === selectedPayment)?.name || "UPI",
        shippingAddress: {
          id: `addr-${Date.now()}`,
          name: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          isDefault: false,
        },
        orderType: user?.role === "reseller" ? "reseller" : "online",
        hasCustomizations,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("📋 Final order data:", orderData);
      const firestoreOrderId = await createOrder(orderData);
      clearCart();
      onNavigate("order-success", { orderId: firestoreOrderId });
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    onNavigate("cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-4 md:pt-6 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-[#111827] mb-6 md:mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">
                  Contact Information
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                    className="md:col-span-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">
                  Shipping Address
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. box"
                    required
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      required
                    />
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Details */}
            {itemsNeedingCustomization.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-[#111827]">
                    Personalization Details
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Please provide information for customized items
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {itemsNeedingCustomization.map((item) => {
                    const custom = customizations[item.product.id] || {
                      customFields: {},
                      imageFields: {},
                    };
                    return (
                      <div
                        key={item.product.id}
                        className="border border-slate-200 rounded-xl p-4 space-y-4 bg-gradient-to-br from-blue-50 to-white"
                      >
                        {/* Product Header - More Visible */}
                        <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-300">
                          <img
                            src={getProductImageUrl(item.product)}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500 shadow-md"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-base">
                              Personalization for: {item.product.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Custom Text Fields */}
                        {((item.product.customFields?.length ?? 0) > 0 ||
                          (item.product.customTextFields?.length ?? 0) > 0) && (
                          <div className="space-y-4">
                            {[
                              ...(item.product.customFields || []),
                              ...(item.product.customTextFields || []),
                            ]?.map((field: any) => (
                              <div key={field.id}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  {field.label}
                                  {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </label>
                                <div className="space-y-1">
                                  {field.fieldType === "textarea" ? (
                                    <textarea
                                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                      placeholder={field.placeholder}
                                      value={
                                        custom.customFields?.[field.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleCustomFieldChange(
                                          item.product.id,
                                          field.id,
                                          e.target.value,
                                        )
                                      }
                                      rows={3}
                                    />
                                  ) : (
                                    <input
                                      type={
                                        field.fieldType === "email"
                                          ? "email"
                                          : field.fieldType === "phone"
                                            ? "tel"
                                            : field.fieldType === "dob"
                                              ? "date"
                                              : "text"
                                      }
                                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={field.placeholder}
                                      value={
                                        custom.customFields?.[field.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleCustomFieldChange(
                                          item.product.id,
                                          field.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  )}
                                  {field.helpText && (
                                    <p className="text-xs text-slate-500">
                                      {field.helpText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Image Upload Fields */}
                        {(item.product.requiredImageFields?.length ?? 0) >
                          0 && (
                          <div className="space-y-4 pt-4 border-t border-slate-200">
                            {item.product.requiredImageFields?.map(
                              (field: any) => (
                                <div key={field.id}>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Camera size={14} className="inline mr-1" />
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    )}
                                  </label>

                                  {/* Image Previews */}
                                  {custom.imageFields?.[field.id]?.previews
                                    ?.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                                      {custom.imageFields[
                                        field.id
                                      ].previews.map((preview, index) => (
                                        <div
                                          key={index}
                                          className="relative group"
                                        >
                                          <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full aspect-square rounded-lg object-cover border-2 border-green-500 shadow-md"
                                          />
                                          <button
                                            onClick={() =>
                                              removeImageFromField(
                                                item.product.id,
                                                field.id,
                                                index,
                                              )
                                            }
                                            className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Upload Button */}
                                  {(custom.imageFields?.[field.id]?.previews
                                    ?.length || 0) < field.maxImages && (
                                    <button
                                      onClick={() =>
                                        fileInputRefs.current[
                                          `${item.product.id}-${field.id}`
                                        ]?.click()
                                      }
                                      className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all w-full"
                                    >
                                      <Camera size={18} />
                                      Upload Image (
                                      {custom.imageFields?.[field.id]?.previews
                                        ?.length || 0}
                                      /{field.maxImages})
                                    </button>
                                  )}

                                  <input
                                    ref={(el) => {
                                      fileInputRefs.current[
                                        `${item.product.id}-${field.id}`
                                      ] = el;
                                    }}
                                    type="file"
                                    accept="image/*"
                                    multiple={field.maxImages > 1}
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        handleImageFieldChange(
                                          item.product.id,
                                          field.id,
                                          e.target.files,
                                          field.maxImages,
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">
                  Payment Method
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#E5E7EB] hover:border-[#2563EB]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-[#2563EB]">{method.icon}</div>
                      <span className="flex-1 font-medium text-[#111827]">
                        {method.name}
                      </span>
                      {selectedPayment === method.id && (
                        <Check size={20} className="text-[#2563EB]" />
                      )}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="text-xl font-bold text-[#111827]">
                  Order Summary
                </h2>
              </CardHeader>
              <CardContent>
                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {cart.map((item) => {
                    const price = getItemPrice(item.product);
                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <img
                          src={getProductImageUrl(item.product)}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#111827] mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-[#6B7280]">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-[#111827]">
                            ₹{price * item.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#E5E7EB] pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-3 flex justify-between text-lg font-bold text-[#111827]">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-xs text-[#6B7280] text-center mt-4">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
