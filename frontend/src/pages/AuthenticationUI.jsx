import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthenticationUI = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill all fields');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Login successful!');
      setIsLoading(false);
      navigate('/');
    }, 2000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Account created successfully!');
      setIsLoading(false);
      setIsLogin(true);
    }, 2000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Password reset link sent to your email!');
    setShowForgot(false);
    setForgotEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block text-white space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Material Master Portal</h1>
              <p className="text-blue-100 text-lg">Enterprise-grade MDM System</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '🔒', text: 'Secure Authentication' },
                { icon: '⚡', text: 'Fast & Reliable' },
                { icon: '🎯', text: 'Enterprise Ready' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-blue-100">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Forgot Password */}
            {showForgot ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-gray-600 mt-1">Enter your email to receive reset instructions</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Send Reset Link
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Back to Login
                  </motion.button>
                </form>
              </motion.div>
            ) : isLogin ? (
              /* Login Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                  <p className="text-gray-600 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </motion.button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-600">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <span>🔵</span> <span className="text-sm font-medium">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <span>👔</span> <span className="text-sm font-medium">Microsoft</span>
                  </button>
                </div>

                <p className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : (
              /* Signup Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-gray-600 mt-1">Join the Material Master Portal</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-1" required />
                    <span className="text-sm text-gray-600">I agree to the terms and conditions</span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>

                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationUI;
