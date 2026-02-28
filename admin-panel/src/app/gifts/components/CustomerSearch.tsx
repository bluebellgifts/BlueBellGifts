// Customer Search Component
import React, { useState } from "react";
import { Customer } from "../types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Search, Plus, Phone, Mail, MapPin, TrendingUp } from "lucide-react";

interface CustomerSearchProps {
  searchResults: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  onSearch: (query: string, searchType: "phone" | "name") => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateNewCustomer: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchResults,
  selectedCustomer,
  loading,
  error,
  onSearch,
  onSelectCustomer,
  onCreateNewCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"phone" | "name">("phone");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, searchType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getReturningStatus = (customer: Customer) => {
    return customer.totalPurchases > 0;
  };

  return (
    <Card className="p-4 bg-white">
      <h3 className="font-semibold text-base mb-4">Customer Information</h3>

      {/* Search Input */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "phone" | "name")}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="phone">By Phone</option>
            <option value="name">By Name</option>
          </select>

          <div className="flex-grow relative">
            <Input
              type="text"
              placeholder={
                searchType === "phone"
                  ? "Enter phone number..."
                  : "Enter customer name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            {error}
          </p>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
          {searchResults.map((customer) => (
            <button
              key={customer.id}
              onClick={() => onSelectCustomer(customer)}
              className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {customer.firstName} {customer.lastName || ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                </div>
                {getReturningStatus(customer) && (
                  <Badge className="bg-green-500">Returning</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold">
              {selectedCustomer.firstName} {selectedCustomer.lastName || ""}
            </h4>
            {getReturningStatus(selectedCustomer) && (
              <Badge className="bg-green-500">Returning Customer</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>{selectedCustomer.phone}</span>
            </div>

            {selectedCustomer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>{selectedCustomer.email}</span>
              </div>
            )}

            {selectedCustomer.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>
                  {selectedCustomer.city}, {selectedCustomer.pincode}
                </span>
              </div>
            )}
          </div>

          {/* Customer Stats */}
          {selectedCustomer.totalPurchases > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Purchases:</span>
                <span className="font-semibold">
                  {selectedCustomer.totalPurchases}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Spent:</span>
                <span className="font-semibold">
                  ₹{selectedCustomer.totalSpent}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg. Order Value:</span>
                <span className="font-semibold">
                  ₹
                  {(
                    selectedCustomer.totalSpent /
                    selectedCustomer.totalPurchases
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Customer Button */}
      {!selectedCustomer && (
        <Button
          onClick={onCreateNewCustomer}
          variant="outline"
          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Customer
        </Button>
      )}
    </Card>
  );
};
