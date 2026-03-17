import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FiMail, FiLock, FiLogIn, FiHeart, FiArrowRight,
  FiPackage, FiShoppingBag, FiRefreshCw, FiX, FiKey, FiCheckCircle
} from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Forgot Password State ──────────────────────────────────────────────────
  const [fpModal, setFpModal] = useState(false);   // modal open?
  const [fpStep, setFpStep]   = useState(1);       // 1=email, 2=otp+newpass, 3=success
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp]     = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpConfirmPass, setFpConfirmPass] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const roles = [
    {
      id: 'donor', icon: <FiPackage />, title: 'Donor',
      desc: 'I want to donate items', color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)', emoji: '🎁'
    },
    {
      id: 'receiver', icon: <FiShoppingBag />, title: 'Receiver',
      desc: 'I need essential items', color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', emoji: '🤲'
    },
    {
      id: 'both', icon: <FiRefreshCw />, title: 'Both',
      desc: 'I want to give & receive', color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', emoji: '🤝'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select how you want to use NeedNest');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Handlers ───────────────────────────────────────────────
  const openForgotModal = () => {
    setFpModal(true);
    setFpStep(1);
    setFpEmail('');
    setFpOtp('');
    setFpNewPass('');
    setFpConfirmPass('');
    setFpError('');
  };

  const closeForgotModal = () => {
    setFpModal(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Please enter your email'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      await axios.post('/api/auth/forgot-password', { email: fpEmail });
      setFpStep(2);
    } catch (err) {
      setFpError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!fpOtp) { setFpError('Please enter the OTP'); return; }
    if (!fpNewPass) { setFpError('Please enter a new password'); return; }
    if (fpNewPass.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    if (fpNewPass !== fpConfirmPass) { setFpError('Passwords do not match'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      await axios.post('/api/auth/reset-password', {
        email: fpEmail,
        otp: fpOtp,
        newPassword: fpNewPass
      });
      setFpStep(3);
    } catch (err) {
      setFpError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-elements">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card animate-fade-in-up">
          <div className="auth-header">
            <div className="auth-logo"><FiHeart /></div>
            <h1>Welcome Back</h1>
            <p>Sign in to your NeedNest account</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <label className="role-selector-label">I'm signing in as</label>
            <div className="role-cards">
              {roles.map((role, index) => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedRole(role.id); setError(''); }}
                  style={{
                    '--role-color': role.color,
                    '--role-gradient': role.gradient,
                    animationDelay: `${index * 0.1}s`
                  }}
                  id={`role-${role.id}`}
                >
                  <span className="role-emoji">{role.emoji}</span>
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-title">{role.title}</span>
                  <span className="role-desc">{role.desc}</span>
                  <div className="role-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            <div className="form-group">
              <label className="form-label"><FiMail /> Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
                id="login-email"
              />
            </div>

            <div className="form-group">
              <div className="fp-label-row">
                <label className="form-label"><FiLock /> Password</label>
                <button
                  type="button"
                  className="fp-link"
                  onClick={openForgotModal}
                  id="forgot-password-btn"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                id="login-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="login-submit">
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span> Signing in...
                </span>
              ) : (
                <><FiLogIn /> Sign In <FiArrowRight className="btn-arrow" /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create Account</Link></p>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ─────────────────────────────────────────── */}
      {fpModal && (
        <div className="fp-overlay" onClick={closeForgotModal}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>

            {/* Close button */}
            <button className="fp-close" onClick={closeForgotModal} aria-label="Close">
              <FiX />
            </button>

            {/* Step 1 — Enter Email */}
            {fpStep === 1 && (
              <>
                <div className="fp-icon-wrap">
                  <FiMail />
                </div>
                <h2 className="fp-title">Forgot Password?</h2>
                <p className="fp-subtitle">Enter your registered email and we'll send you a 6-digit OTP.</p>

                {fpError && <div className="alert alert-error">{fpError}</div>}

                <form onSubmit={handleSendOtp} className="fp-form">
                  <div className="form-group">
                    <label className="form-label"><FiMail /> Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={fpEmail}
                      onChange={e => { setFpEmail(e.target.value); setFpError(''); }}
                      required
                      id="fp-email"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={fpLoading} id="fp-send-otp">
                    {fpLoading ? (
                      <span className="btn-loading"><span className="btn-spinner"></span> Sending OTP...</span>
                    ) : (
                      <><FiMail /> Send OTP <FiArrowRight className="btn-arrow" /></>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2 — Enter OTP + New Password */}
            {fpStep === 2 && (
              <>
                <div className="fp-icon-wrap fp-icon-key">
                  <FiKey />
                </div>
                <h2 className="fp-title">Enter OTP</h2>
                <p className="fp-subtitle">
                  We sent a 6-digit OTP to <strong>{fpEmail}</strong>. It expires in 10 minutes.
                </p>

                {fpError && <div className="alert alert-error">{fpError}</div>}

                <form onSubmit={handleResetPassword} className="fp-form">
                  <div className="form-group">
                    <label className="form-label"><FiKey /> 6-Digit OTP</label>
                    <input
                      type="text"
                      className="form-input fp-otp-input"
                      placeholder="_ _ _ _ _ _"
                      maxLength={6}
                      value={fpOtp}
                      onChange={e => { setFpOtp(e.target.value.replace(/\D/g, '')); setFpError(''); }}
                      required
                      id="fp-otp"
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiLock /> New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={fpNewPass}
                      onChange={e => { setFpNewPass(e.target.value); setFpError(''); }}
                      required
                      id="fp-new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiLock /> Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repeat new password"
                      value={fpConfirmPass}
                      onChange={e => { setFpConfirmPass(e.target.value); setFpError(''); }}
                      required
                      id="fp-confirm-password"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={fpLoading} id="fp-reset-btn">
                    {fpLoading ? (
                      <span className="btn-loading"><span className="btn-spinner"></span> Resetting...</span>
                    ) : (
                      <><FiKey /> Reset Password <FiArrowRight className="btn-arrow" /></>
                    )}
                  </button>
                  <button type="button" className="fp-resend-link" onClick={() => { setFpStep(1); setFpError(''); }}>
                    Didn't get the OTP? Resend
                  </button>
                </form>
              </>
            )}

            {/* Step 3 — Success */}
            {fpStep === 3 && (
              <div className="fp-success">
                <div className="fp-success-icon">
                  <FiCheckCircle />
                </div>
                <h2 className="fp-title">Password Reset!</h2>
                <p className="fp-subtitle">Your password has been updated successfully. You can now sign in with your new password.</p>
                <button
                  className="btn btn-primary btn-lg auth-submit"
                  onClick={closeForgotModal}
                  id="fp-done-btn"
                >
                  Back to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
