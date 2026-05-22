import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, MessageSquare, Send, ThumbsUp, ThumbsDown, AlertCircle, Users, Calendar, Eye, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkflowApprovalPanel = () => {
  const [currentRequest, setCurrentRequest] = useState({
    id: 'MAT-2024-001',
    material: 'Steel Pipe A-100',
    type: 'Raw Material',
    status: 'In Review',
    submittedBy: {
      name: 'John Doe',
      avatar: '👨',
      dept: 'Plant Operations'
    },
    submittedDate: '2024-05-20',
    description: 'High-grade steel pipe for manufacturing applications',
    plants: ['Plant A', 'Plant C']
  });

  const [comments, setComments] = useState([
    { id: 1, user: 'Plant Head', avatar: '🏭', time: '2 hours ago', text: 'Material specifications look good. Moving to next stage.' },
    { id: 2, user: 'Store Head', avatar: '📦', time: '4 hours ago', text: 'Please confirm inventory availability' }
  ]);

  const [newComment, setNewComment] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [actionNote, setActionNote] = useState('');

  const workflowStages = [
    { stage: 1, name: 'Plant Head', status: 'completed', icon: '🏭', time: '2 hours ago' },
    { stage: 2, name: 'Store Head', status: 'completed', icon: '📦', time: '4 hours ago' },
    { stage: 3, name: 'Purchase Team', status: 'current', icon: '🛒' },
    { stage: 4, name: 'Mechanical Team', status: 'pending', icon: '⚙️' },
    { stage: 5, name: 'Electrical Team', status: 'pending', icon: '⚡' },
    { stage: 6, name: 'GST Team', status: 'pending', icon: '💰' },
    { stage: 7, name: 'IT Final Approval', status: 'pending', icon: '✅' }
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, {
      id: comments.length + 1,
      user: 'You',
      avatar: '👤',
      time: 'just now',
      text: newComment
    }]);
    setNewComment('');
    toast.success('Comment added!');
  };

  const handleAction = (action) => {
    if (!actionNote.trim() && action !== 'comment') {
      toast.error('Please add a note for this action');
      return;
    }
    toast.success(`Material ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for changes'}!`);
    setActiveAction(null);
    setActionNote('');
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
          <h1 className="text-3xl font-bold text-gray-900">Workflow Approval Panel</h1>
          <p className="text-gray-600 mt-2">Review and approve material master requests</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentRequest.material}</h2>
                  <p className="text-gray-600 text-sm mt-1">Request ID: {currentRequest.id}</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                  {currentRequest.status}
                </span>
              </div>

              {/* Submitter Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="text-3xl">{currentRequest.submittedBy.avatar}</div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">{currentRequest.submittedBy.name}</p>
                  <p className="text-sm text-gray-600">{currentRequest.submittedBy.dept}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Submitted on</p>
                  <p className="font-semibold text-gray-900">{currentRequest.submittedDate}</p>
                </div>
              </div>

              {/* Request Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Material Type</p>
                  <p className="font-semibold text-gray-900">{currentRequest.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="font-semibold text-gray-900">{currentRequest.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Assigned Plants</p>
                  <div className="flex gap-2">
                    {currentRequest.plants.map(plant => (
                      <span key={plant} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {plant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Workflow Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Approval Timeline</h3>
              <div className="space-y-4">
                {workflowStages.map((stage, index) => (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                      stage.status === 'completed' ? 'border-green-200 bg-green-50' :
                      stage.status === 'current' ? 'border-blue-300 bg-blue-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-full ${
                      stage.status === 'completed' ? 'bg-green-100' :
                      stage.status === 'current' ? 'bg-blue-100' :
                      'bg-gray-200'
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-grow">
                      <p className={`font-semibold ${
                        stage.status === 'completed' ? 'text-green-700' :
                        stage.status === 'current' ? 'text-blue-700' :
                        'text-gray-700'
                      }`}>
                        {stage.name}
                      </p>
                      {stage.status === 'completed' && (
                        <p className="text-xs text-green-600">{stage.time}</p>
                      )}
                    </div>
                    {stage.status === 'completed' && <Check className="w-5 h-5 text-green-600" />}
                    {stage.status === 'current' && <Clock className="w-5 h-5 text-blue-600 animate-pulse" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments & Discussion
              </h3>

              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="text-2xl flex-shrink-0">{comment.avatar}</div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{comment.user}</p>
                        <p className="text-xs text-gray-500">{comment.time}</p>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or note..."
                  className="flex-grow px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-20"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {/* Approve Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveAction('approve')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  <Check className="w-5 h-5" />
                  Approve
                </motion.button>

                {/* Request Changes Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveAction('changes')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  <ArrowUp className="w-5 h-5" />
                  Request Changes
                </motion.button>

                {/* Reject Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveAction('reject')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                >
                  <AlertCircle className="w-5 h-5" />
                  Reject
                </motion.button>
              </div>

              {/* Action Modal */}
              <AnimatePresence>
                {activeAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      {activeAction === 'approve' && '✅ Confirm Approval'}
                      {activeAction === 'changes' && '⚠️ Reason for Changes'}
                      {activeAction === 'reject' && '❌ Rejection Reason'}
                    </label>
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Add your notes here..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleAction(activeAction)}
                        className={`flex-1 px-3 py-2 rounded-lg text-white font-medium transition ${
                          activeAction === 'approve' ? 'bg-green-500 hover:bg-green-600' :
                          activeAction === 'changes' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        Confirm
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => { setActiveAction(null); setActionNote(''); }}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Current Stage</h4>
              <p className="text-sm text-blue-700">
                This request is currently awaiting your review as the Purchase Team. Please review the material details and timeline before approving.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowApprovalPanel;
