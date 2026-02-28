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
      imageFields: { [fieldId: string]: { files: File[]; previews: string[] } };
    };
  }>(() => {
    const init: any = {};
    cart.forEach((item) => {
      if (
        item.product.customFields?.length ||
        item.product.requiredImageFields?.length
      ) {
        const customFieldsInit: any = {};
        const imageFieldsInit: any = {};

        item.product.customFields?.forEach((field: any) => {
          customFieldsInit[field.id] = "";
        });

        item.product.requiredImageFields?.forEach((field: any) => {
          imageFieldsInit[field.id] = { files: [], previews: [] };
        });

        init[item.product.id] = {
          customFields: customFieldsInit,
          imageFields: imageFieldsInit,
        };
      }
    });
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

    setCustomizations((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        imageFields: {
          ...prev[productId].imageFields,
          [fieldId]: { files: newFiles, previews },
        },
      },
    }));
  };

  const removeImageFromField = (
    productId: string,
    fieldId: string,
    index: number,
  ) => {
    setCustomizations((prev) => {
      const currentImages = prev[productId].imageFields[fieldId];
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          imageFields: {
            ...prev[productId].imageFields,
            [fieldId]: {
              files: currentImages.files.filter((_, i) => i !== index),
              previews: currentImages.previews.filter((_, i) => i !== index),
            },
          },
        },
      };
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

          // Upload image files
          const uploadedImageFields: { [fieldId: string]: string[] } = {};
          for (const [fieldId, imageData] of Object.entries(
            custom.imageFields,
          )) {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < imageData.files.length; i++) {
              const url = await uploadOrderCustomerPhoto(
                storagePathId,
                `${item.product.id}-${fieldId}-${i}`,
                imageData.files[i],
              );
              uploadedUrls.push(url);
            }
            uploadedImageFields[fieldId] = uploadedUrls;
          }

          return {
            ...item,
            customization: {
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

      const firestoreOrderId = await createOrder(orderData);
      clearCart();
      onNavigate("order-success", { orderId: firestoreOrderId });
    } catch (error) {
      console.error("Error placing order:", error);
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
                        className="border border-slate-200 rounded-xl p-4 space-y-4"
                      >
                        {/* Product Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Custom Text Fields */}
                        {(item.product.customFields?.length ?? 0) > 0 && (
                          <div className="space-y-4">
                            {item.product.customFields?.map((field: any) => (
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
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {custom.imageFields[
                                        field.id
                                      ].previews.map((preview, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-24 h-24 rounded-xl object-cover border-2 border-blue-500"
                                          />
                                          <button
                                            onClick={() =>
                                              removeImageFromField(
                                                item.product.id,
                                                field.id,
                                                index,
                                              )
                                            }
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                          >
                                            <X size={12} />
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
                                      className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-600 hover:text-blue-600 transition-colors w-full"
                                    >
                                      <Camera size={18} />
                                      Upload Image ({field.maxImages} max)
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
                          src={item.product.image}
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
