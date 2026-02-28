import React, { useState, useEffect } from "react";
// @ts-ignore
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/input";
import { SearchBar } from "../ui/SearchBar";
import { getCategories } from "../../services/firestore-service";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../services/admin-service";
import { Category } from "../../types";
import { toast } from "sonner";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({ name: category.name });
    setEditingCategory(category);
    setImageFile(null);
    setImagePreview(category.image);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setIsSaving(true);

      if (editingCategory) {
        await adminUpdateCategory(
          editingCategory.id,
          { name: formData.name },
          imageFile || undefined,
        );
        toast.success("Category updated successfully");
      } else {
        await adminCreateCategory(
          {
            name: formData.name,
            image: "",
            productCount: 0,
          },
          imageFile || undefined,
        );
        toast.success("Category added successfully");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminDeleteCategory(categoryId);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error: any) {
        console.error("Error deleting category:", error);
        toast.error(error.message || "Failed to delete category");
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
            Category Management
          </h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            Manage your product categories
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto"
        >
          <Plus size={20} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 md:p-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search categories..."
        />
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Category</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[100px]">
                    Products
                  </TableHead>
                  <TableHead className="min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                            <Upload size={16} className="text-[#6B7280]" />
                          </div>
                        )}
                        <span className="font-medium text-xs sm:text-sm">
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm text-[#64748b]">
                      {category.productCount || 0} products
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 sm:p-2 hover:bg-[#eff6ff] text-[#1e40af] rounded-lg transition-colors flex-shrink-0"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1.5 sm:p-2 hover:bg-[#fef2f2] text-[#dc2626] rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        size="lg"
        footer={
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCategory}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Add Category"
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Gift Sets, Chocolates, Books"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Category Image
            </label>
            <label
              htmlFor="category-image-input"
              className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-4 text-center hover:border-[#2563EB] transition-colors cursor-pointer overflow-hidden min-h-[150px] flex flex-col items-center justify-center gap-2"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[200px] rounded-lg object-contain"
                />
              ) : (
                <>
                  <Upload size={24} className="text-[#6B7280]" />
                  <p className="text-[#6B7280]">
                    Click to upload image or drag and drop
                  </p>
                  <p className="text-xs text-[#6B7280]">PNG, JPG up to 5MB</p>
                </>
              )}
            </label>
            <input
              id="category-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
