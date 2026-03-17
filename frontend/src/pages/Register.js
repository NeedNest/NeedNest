import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiUserPlus, FiHeart, FiArrowRight, FiArrowLeft, FiPackage, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = role, 2 = details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    userType: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'donor',
      icon: <FiPackage />,
      title: 'Donor',
      desc: 'Share extra food, clothes, books & essentials with people in need',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      emoji: '🎁',
      features: ['List items for donation', 'Track your contributions', 'Get pickup notifications']
    },
    {
      id: 'receiver',
      icon: <FiShoppingBag />,
      title: 'Receiver',
      desc: 'Browse and collect available items in your area for free',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      emoji: '🤲',
      features: ['Search items by location', 'Filter by category', 'Contact donors directly']
    },
    {
      id: 'both',
      icon: <FiRefreshCw />,
      title: 'Both',
      desc: 'Give what you have extra and receive what you need — full access',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      emoji: '🤝',
      features: ['Donate & receive items', 'Full platform access', 'Community participation']
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');

    if (e.target.name === 'email') {
      setOtpSent(false);
      setCountdown(0);
      setOtpVerified(false);
      if (formData.otp) {
        setFormData(prev => ({ ...prev, otp: '' }));
      }
    }
    if (e.target.name === 'otp') {
      setOtpVerified(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, userType: roleId });
    setError('');
  };

  const goToStep2 = () => {
    if (!formData.userType) {
      setError('Please select how you want to use NeedNest');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email to receive an OTP');
      return;
    }
    setOtpLoading(true);
    setError('');

    try {
      await authAPI.sendRegisterOtp({ email: formData.email });
      setOtpSent(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyLoading(true);
    setError('');

    try {
      await authAPI.verifyRegisterOtp({ email: formData.email, otp: formData.otp });
      setOtpVerified(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtpVerified(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otpVerified) {
      setError('Please verify your OTP before creating an account');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        otp: formData.otp,
        location: {
          city: formData.city,
          state: formData.state,
          address: formData.address,
          pincode: formData.pincode
        }
      });
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-elements">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>
      <div className={`auth-container ${step === 1 ? 'auth-container-wide' : ''}`}>
        {/* Step Indicators */}
        <div className="step-indicators">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'filled' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        <div className={`step-panel ${step === 1 ? 'step-active' : 'step-exit'}`}>
          {step === 1 && (
            <div className="auth-card auth-card-wide animate-fade-in-up">
              <div className="auth-header">
                <div className="auth-logo">
                  <FiHeart />
                </div>
                <h1>Join NeedNest</h1>
                <p>How do you want to use NeedNest?</p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <div className="role-selector-register">
                <div className="role-cards-large">
                  {roles.map((role, index) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`role-card-large ${formData.userType === role.id ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect(role.id)}
                      style={{
                        '--role-color': role.color,
                        '--role-gradient': role.gradient,
                        animationDelay: `${index * 0.12}s`
                      }}
                      id={`register-role-${role.id}`}
                    >
                      <div className="role-card-header">
                        <span className="role-emoji-large">{role.emoji}</span>
                        <div className="role-card-check">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <h3 className="role-card-title">{role.title}</h3>
                      <p className="role-card-desc">{role.desc}</p>
                      <ul className="role-features">
                        {role.features.map((f, i) => (
                          <li key={i}>✓ {f}</li>
                        ))}
                      </ul>
                      <div className="role-glow"></div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg auth-submit"
                onClick={goToStep2}
                id="register-next-step"
              >
                Continue <FiArrowRight className="btn-arrow" />
              </button>

              <div className="auth-footer">
                <p>Already have an account? <Link to="/login">Sign In</Link></p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: User Details */}
        <div className={`step-panel ${step === 2 ? 'step-active' : 'step-hidden'}`}>
          {step === 2 && (
            <div className="auth-card auth-card-wide animate-fade-in-up">
              <div className="auth-header">
                <button type="button" className="back-to-role" onClick={() => setStep(1)}>
                  <FiArrowLeft /> Back
                </button>
                <div className="auth-logo">
                  <FiHeart />
                </div>
                <h1>Create Your Account</h1>
                <p>
                  Signing up as{' '}
                  <span className="selected-role-badge" style={{ '--role-color': roles.find(r => r.id === formData.userType)?.color }}>
                    {roles.find(r => r.id === formData.userType)?.emoji} {roles.find(r => r.id === formData.userType)?.title}
                  </span>
                </p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><FiUser /> Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      id="register-name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiMail /> Email Address</label>
                    <div className="email-otp-group" style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                        id="register-email"
                        style={{ flex: 1 }}
                        disabled={(otpSent && countdown > 0) || otpVerified}
                      />
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleSendOtp} 
                        disabled={otpLoading || countdown > 0 || !formData.email || otpVerified}
                        style={{ whiteSpace: 'nowrap', padding: '0 1rem', display: 'flex', alignItems: 'center' }}
                      >
                        {otpLoading ? <span className="btn-spinner" style={{ width: '16px', height: '16px', marginRight: '5px' }}></span> : null}
                        {otpLoading ? 'Sending' : countdown > 0 ? `Resend in ${countdown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                </div>

                {otpSent && (
                  <div className="form-row animate-fade-in-up">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label"><FiLock /> Enter OTP</label>
                      <div className="email-otp-group" style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          name="otp"
                          className="form-input"
                          placeholder="6-digit OTP"
                          value={formData.otp}
                          onChange={handleChange}
                          required
                          id="register-otp"
                          maxLength="6"
                          style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', fontWeight: 'bold', flex: 1 }}
                          disabled={otpVerified}
                        />
                        <button 
                          type="button" 
                          className={`btn ${otpVerified ? 'btn-success' : 'btn-secondary'}`} 
                          onClick={handleVerifyOtp} 
                          disabled={verifyLoading || otpVerified || formData.otp.length < 6}
                          style={{ whiteSpace: 'nowrap', padding: '0 1rem', display: 'flex', alignItems: 'center', backgroundColor: otpVerified ? '#10b981' : undefined, color: otpVerified ? '#fff' : undefined, border: otpVerified ? 'none' : undefined }}
                        >
                          {verifyLoading ? <span className="btn-spinner" style={{ width: '16px', height: '16px', marginRight: '5px' }}></span> : null}
                          {otpVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                      <small style={{ color: otpVerified ? '#10b981' : '#64748b', marginTop: '6px', display: 'block' }}>
                        {otpVerified ? 'Email successfully verified' : `OTP sent to ${formData.email}`}
                      </small>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><FiPhone /> Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      id="register-phone"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiMapPin /> City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      id="register-city"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><FiMapPin /> State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      id="register-state"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode (Optional)</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-input"
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={handleChange}
                      id="register-pincode"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="Street address, area"
                    value={formData.address}
                    onChange={handleChange}
                    id="register-address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><FiLock /> Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      id="register-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiLock /> Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      id="register-confirm-password"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="register-submit">
                  {loading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner"></span> Creating Account...
                    </span>
                  ) : (
                    <><FiUserPlus /> Create Account <FiArrowRight className="btn-arrow" /></>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <p>Already have an account? <Link to="/login">Sign In</Link></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
