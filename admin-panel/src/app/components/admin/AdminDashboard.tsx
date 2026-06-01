import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AdminDashboard() {
  const stats: any[] = [];

  const salesData: any[] = [];

  const orderTypeData: any[] = [];

  const topProducts: any[] = [];

  const recentOrders: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-border/50 hover:shadow-lg transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`${stat.bgColor} ${stat.textColor} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                    stat.trend === "up"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUp size={12} strokeWidth={3} />
                  ) : (
                    <ArrowDown size={12} strokeWidth={3} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend */}
        <div className="lg:col-span-2">
          <Card className="h-full border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="px-6 py-5 border-b border-border/50 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                Sales Analytics
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{
                      stroke: "#2563eb",
                      strokeWidth: 2,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={4}
                    dot={{
                      fill: "#ffffff",
                      stroke: "#2563eb",
                      strokeWidth: 3,
                      r: 6,
                    }}
                    activeDot={{ r: 8, stroke: "#1d4ed8", strokeWidth: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Distribution */}
        <Card className="h-full border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="px-6 py-5 border-b border-border/50 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Order Source</h2>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {orderTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-medium text-slate-600">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-border/50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Top Performers</h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
              View Report
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs flex-shrink-0">
                    #{index + 1}
                  </div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-xl shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {product.sales} sales this week
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">
                      ₹{(product.revenue / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      Revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-border/50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
              View All
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center p-4 hover:bg-slate-50/80 transition-colors gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">
                        {order.id}
                      </span>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 h-auto"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {order.customer}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                        order.type === "online"
                          ? "bg-blue-50 text-blue-600"
                          : order.type === "offline"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {order.type}
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      ₹{(order.amount / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="border-l-4 border-l-red-500 shadow-lg bg-red-50/30">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-white text-red-500 p-3 rounded-xl shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Low Stock Warning
            </h3>
            <p className="text-slate-600 text-sm">
              <span className="font-bold text-red-600">12 products</span> are
              running low on stock. Please review your inventory levels to
              ensure business continuity.
            </p>
          </div>
          <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all font-bold text-sm">
            Review Inventory
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
