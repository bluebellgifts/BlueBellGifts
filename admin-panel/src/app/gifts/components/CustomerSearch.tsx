// Customer Search Component
import React, { useState, useEffect, useRef } from "react";
import { Customer } from "../types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  X,
  Loader,
} from "lucide-react";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);

    // Debounce the search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.trim()) {
      const timer = setTimeout(() => {
        onSearch(value, searchType);
      }, 300);
      setDebounceTimer(timer);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleClearSelected = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const getReturningStatus = (customer: Customer) => {
    return customer.totalPurchases > 0;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Card className="p-4 bg-white">
      <h3 className="font-semibold text-base mb-4">Customer Information</h3>

      {!selectedCustomer ? (
        <>
          {/* Search Input with Suggestions */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value as "phone" | "name");
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
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
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="pl-10 pr-8"
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                {searchQuery && (
                  <button
                    onClick={() => handleInputChange("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {loading ? (
                      <div className="p-4 flex items-center justify-center text-gray-500">
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    ) : error ? (
                      <div className="p-4 text-sm text-orange-600 bg-orange-50">
                        {error}
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full text-left p-3 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <p className="font-semibold text-sm">
                                  {customer.firstName} {customer.lastName || ""}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                              </div>
                              {getReturningStatus(customer) && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Returning
                                </Badge>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No customers found
                      </div>
                    )}

                    {/* Create New Customer Option */}
                    {searchQuery &&
                      (!searchResults || searchResults.length === 0) &&
                      !loading && (
                        <button
                          onClick={onCreateNewCustomer}
                          className="w-full text-left p-3 hover:bg-blue-50 border-t border-gray-100 text-blue-600 font-medium text-sm flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create new customer "{searchQuery}"
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create New Customer Button */}
          {!searchQuery && (
            <Button
              onClick={onCreateNewCustomer}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Customer
            </Button>
          )}
        </>
      ) : (
        <>
          {/* Selected Customer Display */}
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">
                {selectedCustomer.firstName} {selectedCustomer.lastName || ""}
              </h4>
              <button
                onClick={handleClearSelected}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {getReturningStatus(selectedCustomer) && (
              <Badge className="mb-3 bg-green-100 text-green-700">
                Returning Customer
              </Badge>
            )}

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

          {/* Change Customer Button */}
          <Button
            onClick={handleClearSelected}
            variant="outline"
            className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Different Customer
          </Button>
        </>
      )}
    </Card>
  );
};
