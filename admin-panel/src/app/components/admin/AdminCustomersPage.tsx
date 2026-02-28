import React, { useState, useEffect } from "react";
// @ts-ignore
import {
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import { Card } from "../ui/card";
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
import { Button } from "../ui/button";
import { SearchBar } from "../ui/SearchBar";
import { Select } from "../ui/select";
import { getAllUsers } from "../../services/firestore-service";
import { updateUserProfile } from "../../services/firestore-service";
import { toast } from "sonner";

export function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    customerId: string;
    customerName: string;
    newRole: "customer" | "reseller";
  }>({
    isOpen: false,
    customerId: "",
    customerName: "",
    newRole: "customer",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const allCustomers = await getAllUsers();

      // Enrich customer data
      const customersData = allCustomers.map((customer) => {
        return {
          ...customer,
          fullName:
            customer.name ||
            `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        };
      });

      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (
    customerId: string,
    customerName: string,
    newRole: "customer" | "reseller",
  ) => {
    // Show confirmation modal instead of window.confirm
    setConfirmDialog({
      isOpen: true,
      customerId,
      customerName,
      newRole,
    });
  };

  const confirmRoleChange = async () => {
    const { customerId, customerName, newRole } = confirmDialog;
    const currentCustomer = customers.find((c) => c.id === customerId);
    const currentRole = currentCustomer?.role;

    try {
      setIsChangingRole(true);
      await updateUserProfile(customerId, { role: newRole });

      // Update the local state
      setCustomers(
        customers.map((c) =>
          c.id === customerId ? { ...c, role: newRole } : c,
        ),
      );

      toast.success(
        `${customerName} is now a ${newRole === "reseller" ? "Reseller" : "Customer"}`,
      );
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change customer role");
    } finally {
      setIsChangingRole(false);
      setConfirmDialog({
        isOpen: false,
        customerId: "",
        customerName: "",
        newRole: "customer",
      });
    }
  };

  const roleOptions = [
    { value: "all", label: "All Customers" },
    { value: "customer", label: "Retail Customers" },
    { value: "reseller", label: "Resellers" },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (customer.phone || "").includes(searchQuery);
    const matchesRole = filterRole === "all" || customer.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      title: "Total Customers",
      value: customers.filter((c) => c.role === "customer").length,
      icon: <UserIcon width={24} height={24} />,
      color: "bg-[#2563EB]",
    },
    {
      title: "Total Resellers",
      value: customers.filter((c) => c.role === "reseller").length,
      icon: <Award width={24} height={24} />,
      color: "bg-[#F59E0B]",
    },
    {
      title: "Profile Complete",
      value: customers.filter((c) => c.profileComplete).length,
      icon: <CheckCircle width={24} height={24} />,
      color: "bg-[#10b981]",
    },
    {
      title: "Incomplete Profiles",
      value: customers.filter((c) => !c.profileComplete).length,
      icon: <AlertCircle width={24} height={24} />,
      color: "bg-[#ef4444]",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Customer Management
        </h2>
        <p className="text-muted-foreground">Manage customers and resellers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} hover className="p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search customers..."
          />
          <Select
            options={roleOptions}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden rounded-xl border border-border shadow-sm w-full">
        <div className="w-full">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="px-1 sm:px-2 w-20 sm:w-24 truncate text-xs">
                  Name
                </TableHead>
                <TableHead className="hidden sm:table-cell px-1 sm:px-2 w-20 truncate text-xs">
                  Email
                </TableHead>
                <TableHead className="hidden sm:table-cell px-1 sm:px-2 w-16 truncate text-xs">
                  Phone
                </TableHead>
                <TableHead className="hidden md:table-cell px-1 sm:px-2 w-14 truncate text-xs">
                  DOB
                </TableHead>
                <TableHead className="hidden lg:table-cell px-1 sm:px-2 w-20 truncate text-xs">
                  Address
                </TableHead>
                <TableHead className="px-1 sm:px-2 w-16 truncate text-xs">
                  Role
                </TableHead>
                <TableHead className="hidden md:table-cell px-1 sm:px-2 w-16 truncate text-xs">
                  Status
                </TableHead>
                <TableHead className="hidden sm:table-cell px-1 sm:px-2 w-14 truncate text-xs">
                  Updated
                </TableHead>
                <TableHead className="px-1 sm:px-2 w-12 truncate text-xs">
                  View
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {customers.length === 0
                        ? "No customers found"
                        : "No matching customers"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-1 sm:px-2">
                      <div className="flex items-center gap-1 truncate">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {(customer.name || customer.firstName || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="truncate min-w-0">
                          <span className="font-medium text-xs block truncate">
                            {customer.name ||
                              `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-1 sm:px-2">
                      <p className="text-xs truncate">
                        {customer.email || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-1 sm:px-2">
                      <p className="text-xs truncate">
                        {customer.phone || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell px-1 sm:px-2">
                      <p className="text-xs truncate">
                        {customer.dateOfBirth
                          ? new Date(customer.dateOfBirth).toLocaleDateString(
                              "en-IN",
                            )
                          : "N/A"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell px-1 sm:px-2">
                      <div className="text-xs truncate">
                        {customer.addresses && customer.addresses.length > 0 ? (
                          <p className="text-xs truncate">
                            {customer.addresses[0].addressLine1}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-xs">-</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-1 sm:px-2">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={
                            customer.role === "reseller" ? "warning" : "info"
                          }
                          className="text-xs whitespace-nowrap"
                        >
                          {customer.role === "reseller" ? "Re." : "Cust."}
                        </Badge>
                        <button
                          onClick={() =>
                            handleChangeRole(
                              customer.id,
                              customer.name ||
                                `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
                              customer.role === "reseller"
                                ? "customer"
                                : "reseller",
                            )
                          }
                          disabled={isChangingRole}
                          className="text-primary hover:text-primary/80 text-xs px-2 py-1 rounded border border-primary/20 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`Change to ${customer.role === "reseller" ? "Customer" : "Reseller"}`}
                        >
                          <span className="text-lg">⇄</span>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell px-1 sm:px-2">
                      <Badge
                        variant={
                          customer.profileComplete ? "success" : "warning"
                        }
                        className="text-xs whitespace-nowrap"
                      >
                        {customer.profileComplete ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-1 sm:px-2 text-xs truncate">
                      {customer.updatedAt
                        ? new Date(customer.updatedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            },
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-1 sm:px-2">
                      <button className="text-primary hover:text-primary/80 text-xs font-medium whitespace-nowrap">
                        <span className="hidden sm:inline">View</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({
            isOpen: false,
            customerId: "",
            customerName: "",
            newRole: "customer",
          })
        }
        title="Confirm Role Change"
        footer={
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  isOpen: false,
                  customerId: "",
                  customerName: "",
                  newRole: "customer",
                })
              }
              disabled={isChangingRole}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.newRole === "reseller" ? "destructive" : "primary"
              }
              onClick={confirmRoleChange}
              disabled={isChangingRole}
            >
              {isChangingRole ? "Changing..." : "Confirm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <strong>{confirmDialog.customerName}</strong> will be changed to a{" "}
              <strong>
                {confirmDialog.newRole === "reseller" ? "Reseller" : "Customer"}
              </strong>
              {confirmDialog.newRole === "reseller" && (
                <span className="block mt-2 text-blue-700">
                  ℹ️ Resellers have access to bulk ordering and special pricing.
                </span>
              )}
            </p>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to proceed with this change?
          </p>
        </div>
      </Modal>
    </div>
  );
}
