import React, { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export function AdminInventoryPage() {
  const appContext = useContext(AppContext);
  const products = appContext?.products || [];
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockType, setStockType] = useState<"in" | "out">("in");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleOpenStockModal = (type: "in" | "out", product?: any) => {
    setStockType(type);
    setSelectedProduct(product || null);
    setStockQuantity("");
    setNotes("");
    setIsStockModalOpen(true);
  };

  const handleSaveStock = () => {
    // In real app, this would call API to update inventory
    console.log("Stock update:", {
      type: stockType,
      product: selectedProduct,
      quantity: stockQuantity,
      notes,
    });
    setIsStockModalOpen(false);
  };

  const lowStockProducts = products.filter((p) => p.stock < 20);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const inventoryStats = [
    {
      title: "Total Products",
      value: products.length,
      icon: <Package size={24} />,
      color: "bg-[#2563EB]",
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length,
      icon: <TrendingDown size={24} />,
      color: "bg-[#F59E0B]",
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length,
      icon: <TrendingDown size={24} />,
      color: "bg-[#EF4444]",
    },
    {
      title: "Total Stock Value",
      value: `₹${products.reduce((sum, p) => sum + p.retailPrice * p.stock, 0).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: "bg-[#10b981]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
            Inventory Management
          </h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            Track and manage stock levels
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
          <Button
            variant="soft"
            onClick={() => handleOpenStockModal("in")}
            className="text-xs md:text-sm"
          >
            <Plus size={16} className="mr-2" />
            Stock In
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenStockModal("out")}
            className="text-xs md:text-sm"
          >
            <TrendingDown size={16} className="mr-2" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {inventoryStats.map((stat, index) => (
          <Card key={index} hover>
            <CardContent className="py-3 md:py-6 px-3 md:px-6">
              <div className="flex items-start justify-between">
                <div
                  className={`${stat.color} text-white p-2 md:p-3 rounded-lg md:rounded-xl`}
                >
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-[#1a2332] mt-3 md:mt-4 mb-1 line-clamp-1">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm text-[#64748b]">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-l-4 border-l-[#F59E0B]">
          <CardContent className="py-3 md:py-6 px-4 md:px-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="bg-[#FEF3C7] text-[#F59E0B] p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0">
                <TrendingDown size={20} className="md:block hidden" />
                <TrendingDown size={16} className="md:hidden block" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs md:text-sm text-[#1a2332] mb-1 md:mb-2">
                  Low Stock Alert
                </h3>
                <p className="text-xs md:text-sm text-[#64748b]">
                  {lowStockProducts.length} products are running low on stock.
                  Review and restock soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table - Responsive wrapper */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base text-[#1a2332]">
            Current Stock Levels
          </h3>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Product</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[80px]">
                  SKU
                </TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">
                  Category
                </TableHead>
                <TableHead className="min-w-[90px]">Stock</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[110px]">
                  Stock Value
                </TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 md:gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 md:w-10 h-8 md:h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <span className="font-medium text-xs md:text-sm line-clamp-2">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs md:text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs md:text-sm">
                    {product.category}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold text-xs md:text-sm ${
                        product.stock === 0
                          ? "text-[#EF4444]"
                          : product.stock < 20
                            ? "text-[#F59E0B]"
                            : "text-[#10b981]"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs md:text-sm">
                    ₹{((product.retailPrice * product.stock) / 1000).toFixed(0)}
                    K
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock === 0
                          ? "error"
                          : product.stock < 20
                            ? "warning"
                            : "success"
                      }
                      className="text-xs"
                    >
                      {product.stock === 0
                        ? "Out"
                        : product.stock < 20
                          ? "Low"
                          : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => handleOpenStockModal("in", product)}
                        className="text-xs p-1.5 md:p-2"
                      >
                        Add
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stock In/Out Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={stockType === "in" ? "Stock In" : "Stock Out"}
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsStockModalOpen(false)}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveStock}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Save Entry
            </Button>
          </div>
        }
      >
        <div className="space-y-3 md:space-y-4">
          {!selectedProduct && (
            <Select
              label="Select Product"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.sku})`,
              }))}
            />
          )}

          {selectedProduct && (
            <div className="bg-[#EFF6FF] rounded-lg md:rounded-2xl p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-12 md:w-16 h-12 md:h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-xs md:text-sm text-[#1a2332] line-clamp-2">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Current: {selectedProduct.stock} units
                  </p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Quantity"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="Enter quantity"
            required
          />

          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1a2332] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-[#E5E7EB] rounded-lg md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
              rows={3}
              placeholder="Add notes about this stock movement..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
