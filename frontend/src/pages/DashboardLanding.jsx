import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MoreVertical, ArrowUp, ArrowDown, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, Eye, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Sample data
const statsData = [
  { label: 'Total Materials', value: '1,245', change: '+12.5%', icon: 'package', trend: 'up' },
  { label: 'Pending Approvals', value: '23', change: '+8.2%', icon: 'clock', trend: 'up' },
  { label: 'Recent Activities', value: '156', change: '+4.1%', icon: 'activity', trend: 'up' },
  { label: 'System Health', value: '98.5%', change: '+0.8%', icon: 'health', trend: 'up' }
];

const recentRequests = [
  { id: 1, material: 'Steel Pipe A-100', status: 'approved', submittedBy: 'John Doe', date: '2024-05-21', priority: 'high' },
  { id: 2, material: 'Aluminum Sheet X2', status: 'pending', submittedBy: 'Jane Smith', date: '2024-05-20', priority: 'medium' },
  { id: 3, material: 'Copper Wire B-50', status: 'in-progress', submittedBy: 'Mike Johnson', date: '2024-05-19', priority: 'high' },
  { id: 4, material: 'PVC Tubing C-75', status: 'approved', submittedBy: 'Sarah Wilson', date: '2024-05-18', priority: 'low' },
  { id: 5, material: 'Stainless Steel D-25', status: 'rejected', submittedBy: 'Tom Brown', date: '2024-05-17', priority: 'medium' },
];

const activityFeed = [
  { id: 1, action: 'Material Approved', user: 'Plant Head', time: '2 hours ago', material: 'Steel Pipe A-100' },
  { id: 2, action: 'Request Submitted', user: 'John Doe', time: '3 hours ago', material: 'Aluminum Sheet X2' },
  { id: 3, action: 'Comment Added', user: 'Purchase Team', time: '5 hours ago', material: 'Copper Wire B-50' },
  { id: 4, action: 'Material Rejected', user: 'IT Team', time: '1 day ago', material: 'Stainless Steel D-25' },
  { id: 5, action: 'Approval Requested', user: 'Store Head', time: '2 days ago', material: 'PVC Tubing C-75' },
];

const chartData = [
  { month: 'Jan', requests: 45, approved: 40, pending: 5 },
  { month: 'Feb', requests: 52, approved: 48, pending: 4 },
  { month: 'Mar', requests: 48, approved: 44, pending: 4 },
  { month: 'Apr', requests: 61, approved: 55, pending: 6 },
  { month: 'May', requests: 58, approved: 52, pending: 6 },
];

const departmentData = [
  { department: 'Plant', approvals: 45 },
  { department: 'Store', approvals: 38 },
  { department: 'Purchase', approvals: 52 },
  { department: 'Mechanical', approvals: 41 },
  { department: 'Electrical', approvals: 35 },
];

const typeDistribution = [
  { name: 'Raw Material', value: 45 },
  { name: 'Finished Good', value: 30 },
  { name: 'Service', value: 15 },
  { name: 'Others', value: 10 }
];

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

// Stat Card Component
const StatCard = ({ label, value, change, icon, trend, delay }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
        <div className="bg-blue-50 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            {change}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Recent Requests Table
const RecentRequestsTable = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Material Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Submitted By</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((request, index) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.material}</td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{request.submittedBy}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toast.success('Viewing details...')}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
        <button className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors">
          View All Requests →
        </button>
      </div>
    </motion.div>
  );
};

// Activity Feed Component
const ActivityFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 h-full"
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
      </div>
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {activityFeed.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.user}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.material}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Quick Action Buttons
const QuickActions = ({ navigate }) => {
  const actions = [
    { icon: Plus, label: 'Create Material', action: () => navigate('/request/new'), color: 'bg-blue-500' },
    { icon: Clock, label: 'View Pending', action: () => navigate('/approvals'), color: 'bg-orange-500' },
    { icon: Download, label: 'Export Data', action: () => toast.success('Exporting...'), color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          onClick={action.action}
          className={`w-full ${action.color} text-white rounded-lg p-3 font-medium flex items-center gap-3 hover:shadow-lg transition-all hover:scale-105`}
        >
          <action.icon className="w-5 h-5" />
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};

// Charts Container
const ChartsSection = () => {
  return (
    <>
      {/* Line Chart - Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Material Creation Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB' }} />
            <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Department Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Approvals by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="department" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
              <Bar dataKey="approvals" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Material Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Material Type Distribution</h3>
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
      </div>
    </>
  );
};

// Main Dashboard Component
const DashboardLanding = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back! 👋</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your materials today</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/request/new')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Material
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              trend={stat.trend}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left Sidebar - Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <QuickActions navigate={navigate} />
            </div>
          </motion.div>

          {/* Center Content - Recent Requests */}
          <div className="lg:col-span-2">
            <RecentRequestsTable />
          </div>

          {/* Right Sidebar - Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <ActivityFeed />
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <ChartsSection />
        </div>
      </div>
    </div>
  );
};

export default DashboardLanding;
