import React, { useState } from "react";
import {
  Plus,
  X,
  Trash2,
  Upload,
  Eye,
  AlertCircle,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  name: string;
  type:
    | "size"
    | "color"
    | "theme"
    | "unit"
    | "material"
    | "pattern"
    | "finish"
    | "texture"
    | "weight"
    | "width"
    | "height"
    | "length"
    | "style"
    | "model"
    | "version"
    | "capacity"
    | "brand"
    | "grade"
    | "type"
    | "other";
  attributes: VariantAttribute[];
  costPrice: number;
  retailPrice: number;
  sellingPrice: number;
  resellerPrice: number;
  offerPrice?: number;
  stock: number;
}

interface RequiredImageField {
  id: string;
  label: string;
  required: boolean;
  maxImages: number;
}

interface CustomTextField {
  id: string;
  label: string;
  fieldType: "text" | "email" | "date" | "number" | "phone" | "textarea";
  required: boolean;
  placeholder: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  costPrice: number | "";
  retailPrice: number | "";
  sellingPrice: number | "";
  resellerPrice: number | "";
  offerPrice: number | "";
  sku: string;
  stockQuantity: number | "";
  status: boolean;
  videoUrls: string[];
  variants: ProductVariant[];
  requiredImageFields: RequiredImageField[];
  customTextFields: CustomTextField[];
  shippingTamilNadu: number | "";
  shippingRestOfIndia: number | "";
  freeShipping: boolean;
}

const DEFAULT_IMAGE_FIELDS = [
  "New Born Image",
  "1st Month Image",
  "2nd Month Image",
  "3rd Month Image",
  "4th Month Image",
  "5th Month Image",
  "6th Month Image",
  "7th Month Image",
  "8th Month Image",
  "9th Month Image",
  "10th Month Image",
  "11th Month Image",
  "12th Month Image",
];

export function AddProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    category: "",
    description: "",
    costPrice: "",
    retailPrice: "",
    sellingPrice: "",
    resellerPrice: "",
    offerPrice: "",
    sku: "",
    stockQuantity: "",
    status: true,
    videoUrls: [],
    variants: [
      {
        id: "1",
        name: "",
        type: "size",
        attributes: [{ name: "", value: "" }],
        costPrice: 0,
        retailPrice: 0,
        sellingPrice: 0,
        resellerPrice: 0,
        offerPrice: 0,
        stock: 100,
      },
    ],
    requiredImageFields: [],
    customTextFields: [],
    shippingTamilNadu: "",
    shippingRestOfIndia: "",
    freeShipping: false,
  });

  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string; file: File }[]
  >([]);
  const [uploadedVideos, setUploadedVideos] = useState<
    { id: string; url: string; file: File; name: string }[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Auto-generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = Date.now().toString();
        setUploadedImages((prev) => [
          ...prev,
          {
            id,
            url: event.target?.result as string,
            file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = Date.now().toString() + Math.random();
        setUploadedVideos((prev) => [
          ...prev,
          {
            id,
            url: event.target?.result as string,
            file,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVideo = (id: string) => {
    setUploadedVideos((prev) => prev.filter((vid) => vid.id !== id));
  };

  const addVideoUrl = (url: string) => {
    if (url.trim()) {
      setFormData((prev) => ({
        ...prev,
        videoUrls: [...prev.videoUrls, url],
      }));
    }
  };

  const removeVideoUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index),
    }));
  };

  // Flexible Variants Management
  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id ? { ...v, ...updates } : v,
      ),
    }));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: "",
      type: "size",
      attributes: [{ name: "", value: "" }],
      costPrice: 0,
      retailPrice: 0,
      sellingPrice: 0,
      resellerPrice: 0,
      offerPrice: 0,
      stock: 100,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const removeVariant = (id: string) => {
    if (formData.variants.length > 1) {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.filter((v) => v.id !== id),
      }));
    } else {
      toast.error("Product must have at least one variant");
    }
  };

  const updateVariantAttribute = (
    variantId: string,
    attributeIndex: number,
    updates: Partial<VariantAttribute>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id === variantId) {
          const newAttributes = [...v.attributes];
          newAttributes[attributeIndex] = {
            ...newAttributes[attributeIndex],
            ...updates,
          };
          return { ...v, attributes: newAttributes };
        }
        return v;
      }),
    }));
  };

  const addVariantAttribute = (variantId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            attributes: [...v.attributes, { name: "", value: "" }],
          };
        }
        return v;
      }),
    }));
  };

  const removeVariantAttribute = (
    variantId: string,
    attributeIndex: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            attributes: v.attributes.filter((_, idx) => idx !== attributeIndex),
          };
        }
        return v;
      }),
    }));
  };

  // Image Fields Management
  const updateImageField = (
    id: string,
    updates: Partial<RequiredImageField>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      requiredImageFields: prev.requiredImageFields.map((f) =>
        f.id === id ? { ...f, ...updates } : f,
      ),
    }));
  };
  const addImageField = () => {
    const newField: RequiredImageField = {
      id: Date.now().toString(),
      label: "",
      required: true,
      maxImages: 1,
    };
    setFormData((prev) => ({
      ...prev,
      requiredImageFields: [...prev.requiredImageFields, newField],
    }));
  };

  const removeImageField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredImageFields: prev.requiredImageFields.filter((f) => f.id !== id),
    }));
  };

  // Custom Text Fields Management
  const updateCustomTextField = (
    id: string,
    updates: Partial<CustomTextField>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      customTextFields: prev.customTextFields.map((f) =>
        f.id === id ? { ...f, ...updates } : f,
      ),
    }));
  };

  const addCustomTextField = () => {
    const newField: CustomTextField = {
      id: Date.now().toString(),
      label: "",
      fieldType: "text",
      required: true,
      placeholder: "",
    };
    setFormData((prev) => ({
      ...prev,
      customTextFields: [...prev.customTextFields, newField],
    }));
  };

  const removeCustomTextField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customTextFields: prev.customTextFields.filter((f) => f.id !== id),
    }));
  };
  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.costPrice) newErrors.costPrice = "Cost price is required";
    if (!formData.retailPrice)
      newErrors.retailPrice = "Retail price is required";
    if (!formData.sellingPrice)
      newErrors.sellingPrice = "Selling price is required";
    if (!formData.resellerPrice)
      newErrors.resellerPrice = "Reseller price is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (uploadedImages.length === 0)
      newErrors.images = "At least one image is required";
    if (formData.variants.length === 0)
      newErrors.variants = "At least one variant is required";
    if (!formData.shippingTamilNadu)
      newErrors.shippingTamilNadu = "Tamil Nadu shipping price is required";
    if (!formData.shippingRestOfIndia)
      newErrors.shippingRestOfIndia =
        "Rest of India shipping price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data structure
      const productData = {
        ...formData,
        costPrice: Number(formData.costPrice),
        retailPrice: Number(formData.retailPrice),
        sellingPrice: Number(formData.sellingPrice),
        resellerPrice: Number(formData.resellerPrice),
        offerPrice: formData.offerPrice
          ? Number(formData.offerPrice)
          : undefined,
        stockQuantity: Number(formData.stockQuantity),
        shippingTamilNadu: Number(formData.shippingTamilNadu),
        shippingRestOfIndia: Number(formData.shippingRestOfIndia),
        images: uploadedImages.map((img) => ({
          id: img.id,
          url: img.url,
        })),
        videos: [
          ...formData.videoUrls.map((url) => ({ url, type: "url" })),
          ...uploadedVideos.map((vid) => ({
            id: vid.id,
            url: vid.url,
            name: vid.name,
            type: "file",
          })),
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log to console for demonstration
      console.log("🎉 Product Form Data:", productData);
      console.log("📋 JSON Structure:", JSON.stringify(productData, null, 2));

      // Here you would typically call an API to save the product
      // await saveProductToFirestore(productData);

      toast.success("Product saved successfully!");

      // Reset form
      setFormData({
        name: "",
        slug: "",
        category: "",
        description: "",
        costPrice: "",
        retailPrice: "",
        sellingPrice: "",
        resellerPrice: "",
        offerPrice: "",
        sku: "",
        stockQuantity: "",
        status: true,
        videoUrls: [],
        variants: [
          {
            id: "1",
            name: "",
            type: "size",
            attributes: [{ name: "", value: "" }],
            costPrice: 0,
            retailPrice: 0,
            sellingPrice: 0,
            resellerPrice: 0,
            offerPrice: 0,
            stock: 100,
          },
        ],
        requiredImageFields: [],
        customTextFields: [],
        shippingTamilNadu: "",
        shippingRestOfIndia: "",
        freeShipping: false,
      });
      setUploadedImages([]);
      setUploadedVideos([]);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSizeLabel = (width: number, height: number, tag?: string) => {
    const base = `${width}x${height} Inches`;
    return tag ? `${base} (${tag})` : base;
  };

  const getVariantLabel = (variant: ProductVariant) => {
    if (variant.name) return variant.name;
    const attrStr = variant.attributes
      .map((a) => `${a.name}: ${a.value}`)
      .filter((s) => s !== ": ")
      .join(", ");
    return attrStr || `${variant.type} Variant`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Create a new customizable product with variants and requirements
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Hide" : "Show"} Preview
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ============== BASIC PRODUCT DETAILS ============== */}
        <Card className="p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Basic Product Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700 font-medium text-sm">
                Product Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="12 Month Baby Collage Frame"
                className={`mt-1 text-sm ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium text-sm">
                Product Slug
              </Label>
              <Input
                value={formData.slug}
                disabled
                className="mt-1 bg-gray-50 text-sm"
              />
              <p className="text-gray-500 text-xs mt-0.5">
                Auto-generated from product name
              </p>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Category *</Label>
              <Select
                options={[
                  { value: "", label: "Select a category" },
                  {
                    value: "Personalized Products",
                    label: "Personalized Products",
                  },
                  { value: "Frames", label: "Frames" },
                  { value: "Decor", label: "Decor" },
                  { value: "Gifts", label: "Gifts" },
                ]}
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`mt-2 ${errors.category ? "border-red-500" : ""}`}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.category}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="BBCF-12M-001"
                className={`mt-2 ${errors.sku ? "border-red-500" : ""}`}
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.sku}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Cost Price (₹) *
              </Label>
              <Input
                type="number"
                value={formData.costPrice}
                onChange={(e) =>
                  handleInputChange(
                    "costPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="350"
                className={`mt-2 ${errors.costPrice ? "border-red-500" : ""}`}
              />
              {errors.costPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.costPrice}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Retail Price (₹) *
              </Label>
              <Input
                type="number"
                value={formData.retailPrice}
                onChange={(e) =>
                  handleInputChange(
                    "retailPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="449"
                className={`mt-2 ${errors.retailPrice ? "border-red-500" : ""}`}
              />
              {errors.retailPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.retailPrice}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Selling Price (₹) *
              </Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) =>
                  handleInputChange(
                    "sellingPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="420"
                className={`mt-2 ${errors.sellingPrice ? "border-red-500" : ""}`}
              />
              {errors.sellingPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.sellingPrice}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Reseller Price (₹) *
              </Label>
              <Input
                type="number"
                value={formData.resellerPrice}
                onChange={(e) =>
                  handleInputChange(
                    "resellerPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="399"
                className={`mt-2 ${errors.resellerPrice ? "border-red-500" : ""}`}
              />
              {errors.resellerPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.resellerPrice}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Offer Price (₹)
              </Label>
              <Input
                type="number"
                value={formData.offerPrice}
                onChange={(e) =>
                  handleInputChange(
                    "offerPrice",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="379"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Stock Quantity
              </Label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  handleInputChange(
                    "stockQuantity",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="100"
                className="mt-2"
              />
            </div>

            <div className="lg:col-span-2">
              <Label className="text-gray-700 font-medium">Description *</Label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter product description..."
                className={`w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-24 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) =>
                  handleInputChange("status", checked)
                }
              />
              <Label className="text-gray-700 font-medium">
                {formData.status ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </Card>

        {/* ============== PRODUCT GALLERY ============== */}
        <Card className="p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
              2
            </div>
            <h2 className="text-lg font-bold text-gray-900">Product Gallery</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-gray-700 font-medium block mb-3">
                Main Product Images *
              </Label>
              <label className="block border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition">
                <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-gray-700 font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG, GIF up to 10MB
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
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <Label className="text-gray-700 font-medium block mb-3">
                  Uploaded Images ({uploadedImages.length})
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
                    >
                      <img
                        src={img.url}
                        alt="uploaded"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-gray-700 font-medium block mb-3">
                Product Videos (Optional)
              </Label>
              <div className="space-y-4">
                {/* Video File Upload */}
                <div>
                  <label className="block border-2 border-dashed border-green-300 rounded-lg p-6 text-center cursor-pointer hover:bg-green-50 transition">
                    <Upload className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-gray-700 font-medium text-sm">
                      Click to upload video files
                    </p>
                    <p className="text-gray-500 text-xs">
                      MP4, WebM, MOV up to 100MB
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Videos */}
                {uploadedVideos.length > 0 && (
                  <div>
                    <Label className="text-gray-700 font-medium block mb-2">
                      Uploaded Videos ({uploadedVideos.length})
                    </Label>
                    <div className="space-y-2">
                      {uploadedVideos.map((vid) => (
                        <div
                          key={vid.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                              <Play className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {vid.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(vid.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video URLs */}
                <div>
                  <Label className="text-gray-700 font-medium block mb-2">
                    Video URLs
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVideoUrl((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder*="youtube"]',
                        ) as HTMLInputElement;
                        if (input?.value) {
                          addVideoUrl(input.value);
                          input.value = "";
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* List of Video URLs */}
                {formData.videoUrls.length > 0 && (
                  <div>
                    <Label className="text-gray-700 font-medium block mb-2">
                      Video URLs ({formData.videoUrls.length})
                    </Label>
                    <div className="space-y-2">
                      {formData.videoUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {url}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVideoUrl(idx)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded ml-2 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ============== SIZE VARIANTS ============== */}
        <Card className="p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                3
              </div>
              <h2 className="text-lg font-bold text-gray-900">Size Variants</h2>
            </div>
            <Button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" /> Add Variant
            </Button>
          </div>

          {errors.variants && (
            <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.variants}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {formData.variants.map((variant) => (
              <Card
                key={variant.id}
                className="p-4 border border-gray-200 hover:shadow-md transition relative"
              >
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-3 pr-8">
                  <div>
                    <Label className="text-xs text-gray-600 block mb-1">
                      Variant Name
                    </Label>
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(variant.id, { name: e.target.value })
                      }
                      placeholder={getVariantLabel(variant)}
                      className="text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 block mb-1">
                      Variant Type
                    </Label>
                    <Select
                      options={[
                        { value: "size", label: "Size" },
                        { value: "color", label: "Color" },
                        { value: "theme", label: "Theme" },
                        { value: "unit", label: "Unit" },
                        { value: "material", label: "Material" },
                        { value: "pattern", label: "Pattern" },
                        { value: "finish", label: "Finish" },
                        { value: "texture", label: "Texture" },
                        { value: "weight", label: "Weight" },
                        { value: "width", label: "Width" },
                        { value: "height", label: "Height" },
                        { value: "length", label: "Length" },
                        { value: "style", label: "Style" },
                        { value: "model", label: "Model" },
                        { value: "version", label: "Version" },
                        { value: "capacity", label: "Capacity" },
                        { value: "brand", label: "Brand" },
                        { value: "grade", label: "Grade" },
                        { value: "other", label: "Custom" },
                      ]}
                      value={variant.type}
                      onChange={(e) =>
                        updateVariant(variant.id, {
                          type: e.target.value as ProductVariant["type"],
                        })
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-gray-600">
                        Attributes
                      </Label>
                      <button
                        type="button"
                        onClick={() => addVariantAttribute(variant.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {variant.attributes.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">
                        No attributes added
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {variant.attributes.map((attr, idx) => (
                          <div key={idx} className="flex gap-2 items-end">
                            <Input
                              value={attr.name}
                              onChange={(e) =>
                                updateVariantAttribute(variant.id, idx, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Name (e.g., Size, Color)"
                              className="h-8 text-xs flex-1"
                            />
                            <Input
                              value={attr.value}
                              onChange={(e) =>
                                updateVariantAttribute(variant.id, idx, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Value (e.g., Large, Red)"
                              className="h-8 text-xs flex-1"
                            />
                            {variant.attributes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantAttribute(variant.id, idx)
                                }
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t pt-3">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Cost Price (₹)
                      </Label>
                      <Input
                        type="number"
                        value={variant.costPrice}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            costPrice: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">
                        Retail Price (₹)
                      </Label>
                      <Input
                        type="number"
                        value={variant.retailPrice}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            retailPrice: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Selling Price (₹)
                      </Label>
                      <Input
                        type="number"
                        value={variant.sellingPrice}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            sellingPrice: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">
                        Reseller Price (₹)
                      </Label>
                      <Input
                        type="number"
                        value={variant.resellerPrice}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            resellerPrice: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Offer Price (₹)
                      </Label>
                      <Input
                        type="number"
                        value={variant.offerPrice ?? ""}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            offerPrice: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Stock</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            stock: Number(e.target.value),
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* ============== CUSTOMER UPLOAD REQUIREMENTS ============== */}
        <Card className="p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
                4
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Customer Upload Requirements
              </h2>
            </div>
            <Button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" /> Add Field
            </Button>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Define what images customers must provide when ordering this
            product.
          </p>

          {formData.requiredImageFields.length === 0 ? (
            <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-gray-600 mb-3">No image fields added yet</p>
              <Button
                type="button"
                onClick={addImageField}
                variant="outline"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Create First Field
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {formData.requiredImageFields.map((field) => (
                <Card
                  key={field.id}
                  className="p-4 border border-gray-200 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeImageField(field.id)}
                    className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3 pr-8">
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateImageField(field.id, { label: e.target.value })
                      }
                      placeholder="e.g., New Born Image"
                      className="font-medium"
                    />

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">
                        Required Field
                      </Label>
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateImageField(field.id, { required: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">
                        Max Images
                      </Label>
                      <Input
                        type="number"
                        value={field.maxImages}
                        onChange={(e) =>
                          updateImageField(field.id, {
                            maxImages: Number(e.target.value),
                          })
                        }
                        min="1"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>

                    {field.required && (
                      <div className="flex items-center gap-2 text-green-600 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Required - Min 1 image
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* ============== CUSTOM TEXT FIELDS ============== */}
        <Card className="p-4 border border-cyan-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700 font-semibold text-sm">
                5
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Custom Text Fields
              </h2>
            </div>
            <Button
              type="button"
              onClick={addCustomTextField}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4" /> Add Field
            </Button>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Define custom text fields that customers must fill when ordering
            this product (e.g., Name, Date of Birth, Email, Phone).
          </p>

          {formData.customTextFields.length === 0 ? (
            <div className="text-center py-8 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-gray-600 mb-3">No custom fields added yet</p>
              <Button
                type="button"
                onClick={addCustomTextField}
                variant="outline"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Create First Field
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {formData.customTextFields.map((field) => (
                <Card
                  key={field.id}
                  className="p-4 border border-gray-200 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeCustomTextField(field.id)}
                    className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3 pr-8">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Field Label *
                      </Label>
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateCustomTextField(field.id, {
                            label: e.target.value,
                          })
                        }
                        placeholder="e.g., Full Name, Date of Birth"
                        className="mt-1 font-medium"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">
                        Field Type
                      </Label>
                      <Select
                        options={[
                          { value: "text", label: "Text" },
                          { value: "email", label: "Email" },
                          { value: "date", label: "Date" },
                          { value: "number", label: "Number" },
                          { value: "phone", label: "Phone" },
                          { value: "textarea", label: "Text Area" },
                        ]}
                        value={field.fieldType}
                        onChange={(e) =>
                          updateCustomTextField(field.id, {
                            fieldType: e.target
                              .value as CustomTextField["fieldType"],
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">
                        Placeholder (Optional)
                      </Label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) =>
                          updateCustomTextField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                        placeholder="e.g., Enter your full name"
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label className="text-sm text-gray-600">
                        Required Field
                      </Label>
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateCustomTextField(field.id, { required: checked })
                        }
                      />
                    </div>

                    {field.required && (
                      <div className="flex items-center gap-2 text-green-600 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Required - Customer must fill this field
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* ============== DELIVERY OPTIONS ============== */}
        <Card className="p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              6
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Options
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-700 font-medium">
                Shipping (Inside Tamil Nadu) - ₹ *
              </Label>
              <Input
                type="number"
                value={formData.shippingTamilNadu}
                onChange={(e) =>
                  handleInputChange(
                    "shippingTamilNadu",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="50"
                className={`mt-2 ${
                  errors.shippingTamilNadu ? "border-red-500" : ""
                }`}
              />
              {errors.shippingTamilNadu && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.shippingTamilNadu}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                Shipping (Rest of India) - ₹ *
              </Label>
              <Input
                type="number"
                value={formData.shippingRestOfIndia}
                onChange={(e) =>
                  handleInputChange(
                    "shippingRestOfIndia",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="100"
                className={`mt-2 ${
                  errors.shippingRestOfIndia ? "border-red-500" : ""
                }`}
              />
              {errors.shippingRestOfIndia && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />{" "}
                  {errors.shippingRestOfIndia}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.freeShipping}
                onCheckedChange={(checked) =>
                  handleInputChange("freeShipping", checked)
                }
              />
              <Label className="text-gray-700 font-medium">
                Enable Free Shipping
              </Label>
            </div>
          </div>
        </Card>

        {/* ============== SUBMIT BUTTONS ============== */}
        <div className="flex gap-3 justify-end pt-6">
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

      {/* ============== PREVIEW PANEL ============== */}
      {showPreview && (
        <Card className="p-6 bg-gray-50 border border-gray-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Form Data Preview
          </h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(formData, null, 2)}
          </pre>
          <p className="text-gray-600 text-sm mt-4">
            📋 Check your browser console (F12) for the complete JSON output
            when you submit the form.
          </p>
        </Card>
      )}
    </div>
  );
}
