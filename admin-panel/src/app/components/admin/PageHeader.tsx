import React from "react";

export interface PageHeaderConfig {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

interface PageHeaderProps extends PageHeaderConfig {}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
}) => {
  return (
    <div className="bg-white/90 sticky top-0 z-30 border-b border-slate-200 px-6 py-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {icon && <div className="flex-shrink-0 text-blue-600">{icon}</div>}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export const pageConfig: Record<string, PageHeaderConfig> = {
  "admin-dashboard": {
    title: "Dashboard",
    description: "Overview of your business performance",
  },
  "gifts-billing": {
    title: "Gifts Billing & Invoicing",
    description: "Create professional invoices and manage gift sales",
  },
  "admin-invoices": {
    title: "Invoices",
    description: "Manage and view all invoices",
  },
  "admin-products": {
    title: "Product Management",
    description: "Manage your product catalog",
  },
  "admin-inventory": {
    title: "Inventory",
    description: "Track and manage stock levels",
  },
  "admin-categories": {
    title: "Categories",
    description: "Organize products by category",
  },
  "admin-orders": {
    title: "Orders",
    description: "Manage customer orders and fulfillment",
  },
  "admin-customers": {
    title: "Customers",
    description: "View and manage customer information",
  },
  "admin-reports": {
    title: "Reports",
    description: "Analytics and business insights",
  },
  "admin-content": {
    title: "Website Content",
    description: "Manage website pages and content",
  },
  "admin-settings": {
    title: "Settings",
    description: "Configure system settings",
  },
  "admin-offers": {
    title: "Offers & Promotions",
    description: "Create and manage special offers",
  },
  "admin-contact-submissions": {
    title: "Contact Inquiries",
    description: "Manage customer contact submissions",
  },
};
