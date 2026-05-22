import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Users, Package, CheckCircle } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');

  const chartData = [
    { month: 'Jan', requests: 45, approved: 40, rejected: 5 },
    { month: 'Feb', requests: 52, approved: 48, rejected: 4 },
    { month: 'Mar', requests: 48, approved: 44, rejected: 4 },
    { month: 'Apr', requests: 61, approved: 55, rejected: 6 },
    { month: 'May', requests: 58, approved: 52, rejected: 6 },
  ];

  const departmentData = [
    { department: 'Plant', requests: 45 },
    { department: 'Store', requests: 38 },
    { department: 'Purchase', requests: 52 },
    { department: 'Mechanical', requests: 41 },
    { department: 'Electrical', requests: 35 },
  ];

  const typeDistribution = [
    { name: 'Raw Material', value: 45 },
    { name: 'Finished Good', value: 30 },
    { name: 'Service', value: 15 },
    { name: 'Consumable', value: 10 }
  ];

  const approvalTimeline = [
    { day: 'Mon', completionTime: 4.2 },
    { day: 'Tue', completionTime: 3.8 },
    { day: 'Wed', completionTime: 4.5 },
    { day: 'Thu', completionTime: 3.9 },
    { day: 'Fri', completionTime: 4.1 },
  ];

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

  const metrics = [
    { label: 'Total Materials', value: '1,245', change: '+12.5%', icon: '📦', color: 'blue' },
    { label: 'Approval Rate', value: '89.5%', change: '+5.2%', icon: '✅', color: 'green' },
    { label: 'Active Users', value: '342', change: '+8.3%', icon: '👥', color: 'purple' },
    { label: 'Avg. Time', value: '4.1 hrs', change: '-2.1%', icon: '⏱️', color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            <Download className="w-5 h-5" />
            Export Report
          </motion.button>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">{metric.label}</h3>
                <div className="text-2xl">{metric.icon}</div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <p className={`text-sm font-semibold mt-2 ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-8"
        >
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateRange === range
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Requests Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Requests Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
                <Area type="monotone" dataKey="requests" stroke="#2563EB" fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Approval Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Approval Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Requests by Department */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Requests by Department</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="department" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="requests" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Average Completion Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Avg. Completion Time (Hours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={approvalTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
                <Line type="monotone" dataKey="completionTime" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Summary Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-semibold">Top Material Type</p>
              <p className="text-2xl font-bold text-gray-900">Raw Material</p>
              <p className="text-xs text-gray-500">45% of all requests</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-semibold">Busiest Department</p>
              <p className="text-2xl font-bold text-gray-900">Purchase Team</p>
              <p className="text-xs text-gray-500">52 requests this month</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-semibold">System Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-xs text-gray-500">Average uptime</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
