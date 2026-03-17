import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiPackage, FiHeart, FiAlertTriangle } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        address: user.location?.address || '',
        pincode: user.location?.pincode || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: {
          city: formData.city,
          state: formData.state,
          address: formData.address,
          pincode: formData.pincode
        }
      });
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="profile-page animate-fade-in-up">
          <div className="page-header">
            <div className="page-icon"><FiUser /></div>
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="profile-grid">
            {/* Profile Card */}
            <div className="profile-card glass-card">
              <div className="profile-avatar">
                <span>{user.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              <span className={`badge ${user.role === 'admin' ? 'badge-electronics' : 'badge-available'}`}>
                {user.role}
              </span>
              <div className="profile-stats-row">
                <div className="profile-stat">
                  <FiPackage />
                  <div>
                    <span className="profile-stat-num">{user.itemsDonated || 0}</span>
                    <span className="profile-stat-label">Donated</span>
                  </div>
                </div>
                <div className="profile-stat">
                  <FiHeart />
                  <div>
                    <span className="profile-stat-num">{user.itemsReceived || 0}</span>
                    <span className="profile-stat-label">Received</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', width: '100%' }}>
                <Link to="/complaint" className="btn btn-ghost" style={{ width: '100%', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <FiAlertTriangle style={{ marginRight: '8px' }} /> Report an Issue
                </Link>
              </div>
            </div>

            {/* Edit Form */}
            <div className="profile-edit-card glass-card">
              <div className="edit-card-header">
                <h3>Account Details</h3>
                {!editing && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    <FiEdit3 /> Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label"><FiUser /> Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    id="profile-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiMail /> Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user.email}
                    disabled
                    id="profile-email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiPhone /> Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    id="profile-phone"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><FiMapPin /> City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!editing}
                      id="profile-city"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!editing}
                      id="profile-state"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      id="profile-address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-input"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!editing}
                      id="profile-pincode"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="edit-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
