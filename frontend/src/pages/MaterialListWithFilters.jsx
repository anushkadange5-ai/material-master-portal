import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, Download, Trash2, ChevronDown, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MaterialListWithFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    plant: 'all',
    sortBy: 'date'
  });
  const [showFilters, setShowFilters] = useState(false);

  const materials = [
    { id: 1, name: 'Steel Pipe A-100', type: 'Raw Material', status: 'approved', plant: 'Plant A', date: '2024-05-21', priority: 'high' },
    { id: 2, name: 'Aluminum Sheet X2', type: 'Raw Material', status: 'pending', plant: 'Plant B', date: '2024-05-20', priority: 'medium' },
    { id: 3, name: 'Copper Wire B-50', type: 'Consumable', status: 'approved', plant: 'Plant A', date: '2024-05-19', priority: 'high' },
    { id: 4, name: 'PVC Tubing C-75', type: 'Service', status: 'approved', plant: 'Plant C', date: '2024-05-18', priority: 'low' },
    { id: 5, name: 'Stainless Steel D-25', type: 'Raw Material', status: 'rejected', plant: 'Plant D', date: '2024-05-17', priority: 'medium' },
    { id: 6, name: 'Plastic Component E-10', type: 'Finished Good', status: 'pending', plant: 'Plant A', date: '2024-05-16', priority: 'low' },
    { id: 7, name: 'Rubber Seal F-30', type: 'Consumable', status: 'approved', plant: 'Plant B', date: '2024-05-15', priority: 'medium' },
    { id: 8, name: 'Electronic Module G-50', type: 'Raw Material', status: 'in-progress', plant: 'Plant C', date: '2024-05-14', priority: 'high' },
  ];

  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedFilters.status === 'all' || material.status === selectedFilters.status;
      const matchesType = selectedFilters.type === 'all' || material.type === selectedFilters.type;
      const matchesPlant = selectedFilters.plant === 'all' || material.plant === selectedFilters.plant;
      return matchesSearch && matchesStatus && matchesType && matchesPlant;
    });

    filtered.sort((a, b) => {
      if (selectedFilters.sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (selectedFilters.sortBy === 'name') return a.name.localeCompare(b.name);
      if (selectedFilters.sortBy === 'priority') {
        const priority = { high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedFilters]);

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-50 text-green-700 border-green-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityIcon = (priority) => {
    const icons = { high: '🔴', medium: '🟡', low: '🟢' };
    return icons[priority];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Material Inventory</h1>
          <p className="text-gray-600 mt-2">Search and filter materials across all plants</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters {selectedFilters.status !== 'all' || selectedFilters.type !== 'all' ? '(Active)' : ''}
            </motion.button>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success('Exporting data...')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              <Download className="w-5 h-5" />
              Export
            </motion.button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Type</label>
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="Finished Good">Finished Good</option>
                  <option value="Service">Service</option>
                  <option value="Consumable">Consumable</option>
                </select>
              </div>

              {/* Plant Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Plant</label>
                <select
                  value={selectedFilters.plant}
                  onChange={(e) => setSelectedFilters({...selectedFilters, plant: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Plants</option>
                  <option value="Plant A">Plant A</option>
                  <option value="Plant B">Plant B</option>
                  <option value="Plant C">Plant C</option>
                  <option value="Plant D">Plant D</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Sort By</label>
                <select
                  value={selectedFilters.sortBy}
                  onChange={(e) => setSelectedFilters({...selectedFilters, sortBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Latest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 mb-4"
        >
          Showing {filteredAndSortedMaterials.length} of {materials.length} materials
        </motion.p>

        {/* Materials Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Material Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Plant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedMaterials.map((material, index) => (
                  <motion.tr
                    key={material.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(material.status)}`}>
                        {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.plant}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-lg">{getPriorityIcon(material.priority)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toast.success('Opening details...')}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toast.success('Editing material...')}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toast.error('Material deleted')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedMaterials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No materials found matching your filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MaterialListWithFilters;
