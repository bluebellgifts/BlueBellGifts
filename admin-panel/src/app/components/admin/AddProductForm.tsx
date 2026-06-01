import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createProduct, updateProduct } from "../../services/firestore-service";
import { uploadFile } from "../../services/storage-service";

interface ProductFormData {
  name: string;
  retailPrice: number | "";
  sellingPrice: number | "";
}

interface ProductImageDraft {
  id: string;
  url: string;
  file?: File;
}

interface AddProductFormProps {
  onSuccess?: () => void;
  productId?: string;
  editingProduct?: any;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const generateSku = (name: string) => {
  const prefix =
    name
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase() || "PRODUCT";

  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

const readImageFile = (file: File): Promise<ProductImageDraft> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve({
        id: `${Date.now()}-${Math.random()}`,
        url: event.target?.result as string,
        file,
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function AddProductForm({
  onSuccess,
  productId,
  editingProduct,
}: AddProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    retailPrice: "",
    sellingPrice: "",
  });
  const [uploadedImages, setUploadedImages] = useState<ProductImageDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!editingProduct) return;

    setFormData({
      name: editingProduct.name || "",
      retailPrice: editingProduct.retailPrice ?? "",
      sellingPrice: editingProduct.sellingPrice ?? "",
    });

    if (Array.isArray(editingProduct.images)) {
      setUploadedImages(
        editingProduct.images.map((image: any, index: number) => ({
          id: image.id || `existing-${index}`,
          url: image.url || "",
        })),
      );
    }
  }, [editingProduct]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    try {
      const imagePreviews = await Promise.all(files.map(readImageFile));
      setUploadedImages((prev) => [...prev, ...imagePreviews]);
    } catch (error) {
      console.error("Error reading product images:", error);
      toast.error("Failed to read one or more images");
    }

    if (files.length > 0 && errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }

    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((image) => image.id !== id));
  };

  const moveImage = (id: string, direction: -1 | 1) => {
    setUploadedImages((prev) => {
      const currentIndex = prev.findIndex((image) => image.id === id);
      const targetIndex = currentIndex + direction;

      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const reorderedImages = [...prev];
      const [movedImage] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(targetIndex, 0, movedImage);

      return reorderedImages;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (formData.retailPrice === "") {
      newErrors.retailPrice = "MRP price is required";
    }

    if (formData.sellingPrice === "") {
      newErrors.sellingPrice = "Selling price is required";
    }

    if (uploadedImages.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      retailPrice: "",
      sellingPrice: "",
    });
    setUploadedImages([]);
    setErrors({});
  };

  const buildProductData = (imageUrls: { id: string; url: string }[]) => {
    const name = formData.name.trim();
    const mrpPrice = Number(formData.retailPrice);
    const sellingPrice = Number(formData.sellingPrice);
    const existing = editingProduct || {};
    const stock = existing.stock ?? existing.stockQuantity ?? 100;

    const productData: Record<string, unknown> = {
      name,
      slug: existing.slug || generateSlug(name),
      category: existing.category || "",
      description: existing.description || name,
      costPrice: existing.costPrice ?? 0,
      retailPrice: mrpPrice,
      sellingPrice,
      resellerPrice: existing.resellerPrice ?? sellingPrice,
      sku: existing.sku || generateSku(name),
      stock,
      stockQuantity: stock,
      status: existing.status ?? true,
      shippingTamilNadu: existing.shippingTamilNadu ?? 0,
      shippingRestOfIndia: existing.shippingRestOfIndia ?? 0,
      freeShipping: existing.freeShipping ?? false,
      image: imageUrls[0]?.url || existing.image || "",
      images: imageUrls,
      videos: existing.videos || [],
      variants: existing.variants || [],
      requiredImageFields: existing.requiredImageFields || [],
      customTextFields: existing.customTextFields || [],
    };

    if (existing.offerPrice !== undefined && existing.offerPrice !== "") {
      productData.offerPrice = existing.offerPrice;
    }

    if (existing.createdAt) {
      productData.createdAt = existing.createdAt;
    }

    return productData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImageUrls = await Promise.all(
        uploadedImages.map(async (image) => {
          if (!image.file) {
            return { id: image.id, url: image.url };
          }

          const url = await uploadFile("products/images", image.file);
          return { id: image.id, url };
        }),
      );

      const productData = buildProductData(uploadedImageUrls);

      if (productId) {
        await updateProduct(productId, productData as any);
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData as any);
        toast.success("Product saved successfully");
        resetForm();
      }

      setTimeout(() => {
        onSuccess?.();
      }, 700);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Product Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700 font-medium text-sm">
                Product Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                className={`mt-2 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium text-sm">
                MRP Price (Rs.) *
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.retailPrice}
                onChange={(e) =>
                  handleInputChange(
                    "retailPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="Enter MRP price"
                className={`mt-2 ${
                  errors.retailPrice ? "border-red-500" : ""
                }`}
              />
              {errors.retailPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.retailPrice}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium text-sm">
                Selling Price (Rs.) *
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) =>
                  handleInputChange(
                    "sellingPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="Enter selling price"
                className={`mt-2 ${
                  errors.sellingPrice ? "border-red-500" : ""
                }`}
              />
              {errors.sellingPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.sellingPrice}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-green-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Product Images *
          </h2>

          <label className="block border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition">
            <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-gray-700 font-medium">
              Click to upload product images
            </p>
            <p className="text-gray-500 text-sm">
              Select one or many images, then arrange the order below
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {errors.images && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.images}
            </p>
          )}

          {uploadedImages.length > 0 && (
            <div className="mt-5">
              <Label className="text-gray-700 font-medium block mb-3">
                Uploaded Images ({uploadedImages.length})
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition bg-white"
                  >
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <img
                      src={image.url}
                      alt="Uploaded product"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-1 p-2 bg-white">
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, -1)}
                        disabled={index === 0}
                        className="flex items-center justify-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 1)}
                        disabled={index === uploadedImages.length - 1}
                        className="flex items-center justify-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Right
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}