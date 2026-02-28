import React, { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AdminReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState("this-month");

  const salesData: any[] = [];

  const productSalesData: any[] = [];

  const reportTypeOptions = [
    { value: "daily", label: "Daily Report" },
    { value: "weekly", label: "Weekly Report" },
    { value: "monthly", label: "Monthly Report" },
    { value: "yearly", label: "Yearly Report" },
  ];

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "this-year", label: "This Year" },
  ];

  const summaryStats: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a2332]">
            Reports & Analytics
          </h2>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            View detailed sales and performance reports
          </p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Select
            label="Report Type"
            options={reportTypeOptions}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          />
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1a2332] mb-2">
              Custom Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-[#E5E7EB] rounded-lg md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
              />
              <input
                type="date"
                className="flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-[#E5E7EB] rounded-lg md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {summaryStats.map((stat, index) => (
          <Card key={index} hover>
            <CardContent className="py-3 md:py-6 px-3 md:px-6">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div
                  className={`${stat.color} text-white p-2 md:p-3 rounded-lg md:rounded-xl`}
                >
                  {stat.icon}
                </div>
                <Badge variant="success" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-[#1a2332] mb-1">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm text-[#64748b]">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Comparison Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <h3 className="font-semibold text-sm md:text-base text-[#1a2332]">
            Sales Comparison (Online vs Offline vs Reseller)
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <BarChart
              data={salesData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="online" fill="#1e40af" name="Online Sales" />
              <Bar dataKey="offline" fill="#10b981" name="Offline Sales" />
              <Bar dataKey="reseller" fill="#d4af37" name="Reseller Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product-wise Sales */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="font-semibold text-sm md:text-base text-[#1a2332]">
              Top Products by Revenue
            </h3>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {productSalesData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 pb-3 md:pb-4 border-b border-[#E5E7EB] last:border-0"
              >
                <div className="flex items-center justify-center w-7 md:w-8 h-7 md:h-8 bg-[#EFF6FF] text-[#1e40af] font-semibold rounded-lg text-xs md:text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs md:text-sm text-[#1a2332] line-clamp-2">
                    {item.product}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {item.sales} units sold
                  </p>
                </div>
                <div className="text-right w-full sm:w-auto min-w-[120px]">
                  <p className="font-semibold text-xs md:text-sm text-[#1a2332]">
                    ₹{(item.revenue / 1000).toFixed(0)}K
                  </p>
                  <div className="w-full h-1.5 md:h-2 bg-[#E5E7EB] rounded-full mt-1.5 md:mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#1e40af] to-[#d4af37] rounded-full"
                      style={{ width: `${(item.revenue / 223011) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="p-4 md:p-6">
        <CardHeader className="p-0 mb-4 md:mb-6">
          <h3 className="font-semibold text-sm md:text-base text-[#1a2332]">
            Export Reports
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            <Button
              variant="outline"
              className="w-full text-xs md:text-sm py-2 md:py-3"
            >
              <Download size={14} className="mr-2" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs md:text-sm py-2 md:py-3"
            >
              <Download size={14} className="mr-2" />
              Export as Excel
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs md:text-sm py-2 md:py-3"
            >
              <Download size={14} className="mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
