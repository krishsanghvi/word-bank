import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import './AuthForms.css';

const SignupForm = ({ onSwitchToLogin, onClose }) => {
  const { signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const password = watch('password', '');

  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Very Weak';
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0: return '#ff4757';
      case 1: return '#ff6b6b';
      case 2: return '#ffa502';
      case 3: return '#2ed573';
      case 4: return '#1dd1a1';
      default: return '#ff4757';
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          message: 'Passwords do not match'
        });
        return;
      }

      await signUp(data.email, data.password, data.username);
      onClose?.();
    } catch (error) {
      setError('root', {
        message: error.message || 'Failed to create account'
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
        <h2>Join the Community!</h2>
        <p>Create your account and start learning with friends</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-content">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 20,
                  message: 'Username cannot exceed 20 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
            />
          </div>
          {errors.username && (
            <span className="error-message">{errors.username.message}</span>
          )}
          <div className="input-hint">
            This will be your display name in the community
          </div>
        </div>

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
              placeholder="Create a strong password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
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
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{ 
                    width: `${(passwordStrength / 4) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(passwordStrength)
                  }}
                />
              </div>
              <span 
                className="strength-text"
                style={{ color: getPasswordStrengthColor(passwordStrength) }}
              >
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
          )}
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password'
              })}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className="password-requirements">
          <h4>Password Requirements:</h4>
          <div className="requirements-list">
            <div className={`requirement ${password.length >= 8 ? 'met' : ''}`}>
              {password.length >= 8 ? <Check size={16} /> : <X size={16} />}
              At least 8 characters
            </div>
            <div className={`requirement ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'met' : ''}`}>
              {/[a-z]/.test(password) && /[A-Z]/.test(password) ? <Check size={16} /> : <X size={16} />}
              Upper & lowercase letters
            </div>
            <div className={`requirement ${/\d/.test(password) ? 'met' : ''}`}>
              {/\d/.test(password) ? <Check size={16} /> : <X size={16} />}
              At least one number
            </div>
            <div className={`requirement ${/[^a-zA-Z\d]/.test(password) ? 'met' : ''}`}>
              {/[^a-zA-Z\d]/.test(password) ? <Check size={16} /> : <X size={16} />}
              Special character
            </div>
          </div>
        </div>

        {errors.root && (
          <div className="error-banner">
            <span>{errors.root.message}</span>
          </div>
        )}

        <motion.button
          type="submit"
          className="auth-submit-btn"
          disabled={loading || passwordStrength < 2}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <>
              <UserPlus size={20} />
              Create Account
            </>
          )}
        </motion.button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-switch">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>

      <div className="auth-benefits">
        <h3>🌟 What you'll get:</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">👥</span>
            <span>Join study groups</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🏆</span>
            <span>Compete with friends</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📈</span>
            <span>Track progress</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>Earn achievements</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SignupForm; 