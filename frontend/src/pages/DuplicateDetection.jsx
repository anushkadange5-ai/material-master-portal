import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Eye, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DuplicateDetection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);

  const mockDuplicates = [
    { id: 1, description: 'Steel Pipe A100', code: 'MAT-001', type: 'Raw Material', source: 'SAP', similarity: 98 },
    { id: 2, description: 'Steel Pipe Type A 100', code: 'MAT-002', type: 'Raw Material', source: 'Excel', similarity: 95 },
    { id: 3, description: 'Steel Heavy Pipe A', code: 'MAT-003', type: 'Raw Material', source: 'SAP', similarity: 87 }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a material name');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(mockDuplicates);
      setIsSearching(false);
      toast.success(`Found ${mockDuplicates.length} potential duplicates`);
    }, 1500);
  };

  const getSimilarityColor = (similarity) => {
    if (similarity >= 90) return 'bg-red-100 text-red-800 border-red-300';
    if (similarity >= 80) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Duplicate Detection</h1>
          <p className="text-gray-600 mt-2">Search and identify duplicate materials in the system</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Search Material</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., Steel Pipe A100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  {isSearching ? 'Searching...' : 'Search'}
                </motion.button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 The system will search for similar materials based on name, type, and characteristics.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Start by entering a material name to search for duplicates</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Results</h2>
                  <span className="text-sm text-gray-600">{searchResults.length} duplicates found</span>
                </div>

                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedDuplicate(selectedDuplicate?.id === result.id ? null : result)}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{result.description}</h3>
                        <p className="text-sm text-gray-600 mt-1">Code: {result.code}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getSimilarityColor(result.similarity)}`}>
                        {result.similarity}% Match
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Type</p>
                        <p className="font-semibold text-gray-900">{result.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Source</p>
                        <p className="font-semibold text-gray-900">{result.source}</p>
                      </div>
                    </div>

                    {/* Similarity Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          result.similarity >= 90 ? 'bg-red-500' :
                          result.similarity >= 80 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${result.similarity}%` }}
                      />
                    </div>

                    {/* Expanded View */}
                    {selectedDuplicate?.id === result.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                      >
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 mb-3">Similarity Analysis</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600">Name Match</span>
                              <span className="text-green-600 font-semibold">98%</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600">Type Match</span>
                              <span className="text-green-600 font-semibold">100%</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600">Characteristic Match</span>
                              <span className="text-orange-600 font-semibold">92%</span>
                            </li>
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                          >
                            <Check className="w-5 h-5" />
                            Mark as Duplicate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                          >
                            <Eye className="w-5 h-5" />
                            View Details
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                          >
                            <X className="w-5 h-5" />
                            Not Duplicate
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDetection;
