// @ts-ignore
import { X, Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card } from "../../ui/card";
import { Modal } from "../../ui/Modal";
import { User } from "../../../types";
import { createOrUpdateUserInFirestore } from "../../../services/firestore-service";
import { toast } from "sonner";

interface CustomerSelectModalProps {
  isOpen: boolean;
  customers: User[];
  onSelect: (customer: User) => void;
  onClose: () => void;
  onCreateNew: (customer: User) => void;
}

interface NewCustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function CustomerSelectModal({
  isOpen,
  customers,
  onSelect,
  onClose,
  onCreateNew,
}: CustomerSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<NewCustomerForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery),
  );

  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please enter customer name and phone number");
      return;
    }

    setIsCreating(true);
    try {
      const newCustomer: User = {
        id: `customer_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "customer",
        addresses: formData.address
          ? [
              {
                id: `addr_${Date.now()}`,
                name: "Default",
                phone: formData.phone,
                addressLine1: formData.address,
                city: "",
                state: "",
                pincode: "",
                isDefault: true,
              },
            ]
          : [],
      };

      await createOrUpdateUserInFirestore(newCustomer);
      toast.success("Customer created successfully");
      onCreateNew(newCustomer);
      setFormData({ name: "", email: "", phone: "", address: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    } finally {
      setIsCreating(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {!showCreateForm ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create New Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} className="mr-2" />
            Create New Customer
          </Button>

          {/* Customers List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">
                  No customers found. Create a new one!
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => onSelect(customer)}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <p className="font-medium text-slate-800">{customer.name}</p>
                  <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                    {customer.email && <p>Email: {customer.email}</p>}
                    {customer.phone && <p>Phone: {customer.phone}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Create Customer Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">
              Create New Customer
            </h3>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Customer Name *
              </label>
              <Input
                type="text"
                placeholder="Enter customer name..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="Enter phone number..."
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter email address..."
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Address
              </label>
              <Input
                type="text"
                placeholder="Enter address..."
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: "", email: "", phone: "", address: "" });
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={handleCreateCustomer}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showCreateForm ? "Create New Customer" : "Select Customer"}
      size="md"
    >
      {content}
    </Modal>
  );
}
