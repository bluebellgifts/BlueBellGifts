// Custom hook for customer search and management
import { useState, useCallback } from "react";
import { Customer } from "../types";
import {
  searchCustomersByPhone,
  searchCustomersByName,
  getAllCustomers,
  getCustomerFromFirestore,
} from "../services/giftsFirestoreService";
import { validateCustomerSearchInput } from "../utils/validations";

export const useCustomerSearch = () => {
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchByPhone = useCallback(async (phone: string) => {
    if (!phone.trim()) {
      setSearchResults([]);
      return;
    }

    // Allow partial phone numbers for search suggestions
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 0) {
      setError("Please enter at least one digit");
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchCustomersByPhone(phone);

      setSearchResults(results);

      // Add to search history
      setSearchHistory((prev) => {
        const updated = [phone, ...prev.filter((p) => p !== phone)];
        return updated.slice(0, 10);
      });

      if (results.length === 0) {
        setError("No customers found with this phone number");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByName = useCallback(async (name: string) => {
    if (!name.trim()) {
      setSearchResults([]);
      return;
    }

    if (name.length < 3) {
      setError("Please enter at least 3 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchCustomersByName(name);

      setSearchResults(results);
      setError(null);

      if (results.length === 0) {
        setError("No customers found with this name");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setError(null);
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedCustomer(null);
    setSearchResults([]);
    setError(null);
  }, []);

  const createNewCustomer = useCallback(
    (
      customerData: Omit<
        Customer,
        "id" | "createdAt" | "updatedAt" | "totalPurchases" | "totalSpent"
      >,
    ) => {
      const newCustomer: Customer = {
        ...customerData,
        id: `cust-${Date.now()}`,
        totalPurchases: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSelectedCustomer(newCustomer);
      return newCustomer;
    },
    [],
  );

  const validateSearchInput = useCallback((input: string): boolean => {
    return validateCustomerSearchInput(input);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const getSearchHistory = useCallback(() => {
    return searchHistory;
  }, [searchHistory]);

  const getReturningCustomerInfo = useCallback((customer: Customer) => {
    return {
      isReturning: customer.totalPurchases > 0,
      totalPurchases: customer.totalPurchases,
      totalSpent: customer.totalSpent,
      lastPurchaseDate: customer.lastPurchaseDate,
      averageOrderValue:
        customer.totalPurchases > 0
          ? customer.totalSpent / customer.totalPurchases
          : 0,
    };
  }, []);

  return {
    searchResults,
    selectedCustomer,
    loading,
    error,
    searchHistory,
    searchByPhone,
    searchByName,
    selectCustomer,
    clearSelected,
    createNewCustomer,
    validateSearchInput,
    clearHistory,
    getSearchHistory,
    getReturningCustomerInfo,
  };
};
