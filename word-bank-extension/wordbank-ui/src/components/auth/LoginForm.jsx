import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';
import './AuthForms.css';

const LoginForm = ({ onSwitchToSignup, onClose }) => {
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
      onClose?.();
    } catch (error) {
      setError('root', {
        message: error.message || 'Failed to sign in'
      });
    }
  };

  return (
    <motion.div
      className="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="auth-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-content">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
          </div>
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>

        {errors.root && (
          <div className="error-banner">
            <span>{errors.root.message}</span>
          </div>
        )}

        <motion.button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </motion.button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToSignup}
            >
              Sign up now
            </button>
          </p>
        </div>
      </form>

      <div className="auth-features">
        <h3>🎓 Join the Learning Community</h3>
        <ul>
          <li>📚 Share words with friends</li>
          <li>🏆 Compete in vocabulary battles</li>
          <li>📊 Track your progress</li>
          <li>🌟 Earn achievements and badges</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default LoginForm; 