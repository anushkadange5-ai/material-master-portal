import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, AlertCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Multi-step Form Component
const MaterialRequestFormWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    materialName: '',
    description: '',
    materialType: '',
    
    // Step 2
    valuationClass: '',
    unitOfMeasure: '',
    plants: [],
    
    // Step 3
    acknowledgment: false,
    
    // Step 4
    reviewed: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Material details' },
    { number: 2, title: 'SAP Config', description: 'Classification' },
    { number: 3, title: 'Approvals', description: 'Workflow setup' },
    { number: 4, title: 'Review', description: 'Final check' }
  ];

  const materialTypes = [
    { value: 'raw', label: 'Raw Material' },
    { value: 'finished', label: 'Finished Good' },
    { value: 'service', label: 'Service' },
    { value: 'consumable', label: 'Consumable' }
  ];

  const valuationClasses = {
    raw: ['VAL-001', 'VAL-002', 'VAL-003'],
    finished: ['VAL-004', 'VAL-005'],
    service: ['VAL-006'],
    consumable: ['VAL-007', 'VAL-008']
  };

  const uom = ['PC', 'KG', 'LTR', 'MTR', 'BOX', 'ROLL'];
  const plantList = ['Plant A', 'Plant B', 'Plant C', 'Plant D'];

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.materialName.trim()) {
        newErrors.materialName = 'Material name is required';
      } else if (formData.materialName.length < 3) {
        newErrors.materialName = 'Material name must be at least 3 characters';
      }

      if (!formData.materialType) {
        newErrors.materialType = 'Material type is required';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    }

    if (step === 2) {
      if (!formData.valuationClass) {
        newErrors.valuationClass = 'Valuation class is required';
      }
      if (!formData.unitOfMeasure) {
        newErrors.unitOfMeasure = 'Unit of measure is required';
      }
      if (formData.plants.length === 0) {
        newErrors.plants = 'Select at least one plant';
      }
    }

    if (step === 3) {
      if (!formData.acknowledgment) {
        newErrors.acknowledgment = 'You must acknowledge the workflow';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle plant selection
  const handlePlantChange = (plant) => {
    setFormData(prev => ({
      ...prev,
      plants: prev.plants.includes(plant)
        ? prev.plants.filter(p => p !== plant)
        : [...prev.plants, plant]
    }));
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (validateStep(4)) {
      toast.success('Material request submitted successfully!');
      setTimeout(() => navigate('/requests/my'), 1500);
    }
  };

  // Auto-populate valuation class
  React.useEffect(() => {
    if (formData.materialType && !formData.valuationClass) {
      setFormData(prev => ({
        ...prev,
        valuationClass: ''
      }));
    }
  }, [formData.materialType]);

  const getAvailableValuationClasses = () => {
    return valuationClasses[formData.materialType] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Create Material Request</h1>
          <p className="text-gray-600 mt-2">Follow the steps to create a new material in the system</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => step.number <= currentStep && setCurrentStep(step.number)}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    step.number <= currentStep ? 'cursor-pointer' : ''
                  }`}
                >
                  <motion.div
                    animate={{
                      backgroundColor: step.number < currentStep ? '#10B981' : 
                                      step.number === currentStep ? '#2563EB' : '#E5E7EB',
                      boxShadow: step.number === currentStep ? '0 0 0 8px rgba(37, 99, 235, 0.1)' : 'none'
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all"
                  >
                    {step.number < currentStep ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </motion.div>

                {/* Divider */}
                {index < steps.length - 1 && (
                  <div className="flex-grow h-1 mx-4 mb-8">
                    <motion.div
                      animate={{
                        backgroundColor: step.number < currentStep ? '#10B981' : '#E5E7EB'
                      }}
                      className="h-full rounded-full"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                  <p className="text-gray-600 mb-6">Enter the fundamental details about the material</p>
                </div>

                {/* Material Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Material Name *
                  </label>
                  <input
                    type="text"
                    name="materialName"
                    value={formData.materialName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Steel Pipe A-100"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.materialName && touched.materialName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {touched.materialName && errors.materialName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.materialName}
                    </motion.p>
                  )}
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Material Type *
                  </label>
                  <select
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.materialType && touched.materialType
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a type...</option>
                    {materialTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {touched.materialType && errors.materialType && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.materialType}
                    </motion.p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description * <span className="text-gray-500 text-xs">({formData.description.length}/500)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Provide detailed information about the material..."
                    rows="4"
                    maxLength="500"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                      errors.description && touched.description
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {touched.description && errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: SAP Classification */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">SAP Classification</h2>
                  <p className="text-gray-600 mb-6">Configure SAP-specific parameters for this material</p>
                </div>

                {/* Valuation Class */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Valuation Class *
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      {formData.materialType ? '(Auto-populated)' : '(Select material type first)'}
                    </span>
                  </label>
                  <select
                    name="valuationClass"
                    value={formData.valuationClass}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={!formData.materialType}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.valuationClass && touched.valuationClass
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                    } ${!formData.materialType ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select a valuation class...</option>
                    {getAvailableValuationClasses().map(vc => (
                      <option key={vc} value={vc}>{vc}</option>
                    ))}
                  </select>
                  {touched.valuationClass && errors.valuationClass && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.valuationClass}
                    </motion.p>
                  )}
                </div>

                {/* Unit of Measure */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Unit of Measure *
                  </label>
                  <select
                    name="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.unitOfMeasure && touched.unitOfMeasure
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a unit...</option>
                    {uom.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {touched.unitOfMeasure && errors.unitOfMeasure && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.unitOfMeasure}
                    </motion.p>
                  )}
                </div>

                {/* Plant Assignment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Plant Assignment * <span className="text-xs text-gray-500">(Select at least one)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {plantList.map(plant => (
                      <motion.label
                        key={plant}
                        whileHover={{ backgroundColor: '#F3F4F6' }}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                          formData.plants.includes(plant)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.plants.includes(plant)}
                          onChange={() => handlePlantChange(plant)}
                          className="w-5 h-5 rounded text-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">{plant}</span>
                      </motion.label>
                    ))}
                  </div>
                  {touched.plants && errors.plants && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.plants}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Approval Workflow */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Approval Workflow</h2>
                  <p className="text-gray-600 mb-6">Review the approval chain for this material request</p>
                </div>

                {/* Workflow Stages */}
                <div className="space-y-3">
                  {[
                    { stage: 1, name: 'Plant Head', dept: 'Manufacturing', icon: '🏭' },
                    { stage: 2, name: 'Store Head', dept: 'Warehouse', icon: '📦' },
                    { stage: 3, name: 'Purchase Team', dept: 'Procurement', icon: '🛒' },
                    { stage: 4, name: 'Mechanical Team', dept: 'Engineering', icon: '⚙️' },
                    { stage: 5, name: 'Electrical Team', dept: 'Electrical', icon: '⚡' },
                    { stage: 6, name: 'GST Team', dept: 'Finance', icon: '💰' },
                    { stage: 7, name: 'IT Final Approval', dept: 'IT', icon: '✅' }
                  ].map((stage, index) => (
                    <motion.div
                      key={stage.stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                        {stage.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900">{stage.name}</p>
                        <p className="text-sm text-gray-500">{stage.dept}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                          Pending
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Expected Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm font-semibold text-blue-900 mb-2">⏱️ Expected Timeline</p>
                  <p className="text-sm text-blue-700">
                    This material request will go through 7 approval stages. Expected completion time: 5-7 business days.
                  </p>
                </motion.div>

                {/* Acknowledgment */}
                <motion.label
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    name="acknowledgment"
                    checked={formData.acknowledgment}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded text-blue-500 mt-1 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">I acknowledge the approval workflow</p>
                    <p className="text-sm text-gray-500 mt-1">
                      I understand that this material request will be reviewed by multiple departments and I will be notified of any changes.
                    </p>
                  </div>
                </motion.label>

                {touched.acknowledgment && errors.acknowledgment && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.acknowledgment}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                  <p className="text-gray-600 mb-6">Please review all information before submitting</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">📋</span> Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Material Name</p>
                        <p className="font-medium text-gray-900">{formData.materialName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">
                          {materialTypes.find(t => t.value === formData.materialType)?.label || '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* SAP Config Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">⚙️</span> SAP Configuration
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Valuation Class</p>
                        <p className="font-medium text-gray-900">{formData.valuationClass || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">UOM</p>
                        <p className="font-medium text-gray-900">{formData.unitOfMeasure || '-'}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Plants Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🏭</span> Assigned Plants
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.plants.length > 0 ? (
                        formData.plants.map(plant => (
                          <span key={plant} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {plant}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No plants selected</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Description Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">📝</span> Description
                    </h3>
                    <p className="text-sm text-gray-700 line-clamp-3">{formData.description || '-'}</p>
                  </motion.div>
                </div>

                {/* Final Confirmation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Ready to submit</p>
                      <p className="text-sm text-green-700 mt-1">
                        All information has been validated and is ready for submission. Click the submit button below to proceed with the approval workflow.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </motion.button>

            <div className="text-sm text-gray-600">
              Step <span className="font-semibold">{currentStep}</span> of <span className="font-semibold">4</span>
            </div>

            {currentStep < 4 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center gap-2 shadow-lg"
              >
                <Check className="w-5 h-5" />
                Submit Request
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaterialRequestFormWizard;
