import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemAPI, requestAPI } from '../services/api';
import { FiMapPin, FiClock, FiUser, FiPhone, FiMail, FiPackage, FiCheck, FiArrowLeft, FiTrash2, FiCalendar, FiSend, FiMessageSquare } from 'react-icons/fi';
import './ItemDetails.css';

const categoryIcons = {
  food: '🍲', clothes: '👕', books: '📚', electronics: '💻',
  furniture: '🪑', medicines: '💊', toys: '🧸', other: '📦'
};

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request state
  const [requestMessage, setRequestMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (user && item && !isOwner) {
      checkExistingRequest();
    }
  }, [user, item]);

  const fetchItem = async () => {
    try {
      const { data } = await itemAPI.getItem(id);
      setItem(data);
    } catch (err) {
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRequest = async () => {
    try {
      const { data } = await requestAPI.checkRequest(id);
      if (data.hasRequested) {
        setExistingRequest(data.request);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRequesting(true);
    setError('');
    try {
      const { data } = await requestAPI.createRequest({
        itemId: id,
        message: requestMessage
      });
      setExistingRequest(data);
      setSuccess('Request sent successfully! The donor will be notified.');
      setShowRequestForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeleting(true);
    try {
      await itemAPI.deleteItem(id);
      navigate('/my-donations');
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner-container"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">😔</div>
            <h3>Item Not Found</h3>
            <p>The item you're looking for doesn't exist or has been removed.</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: '16px' }}>
              <FiArrowLeft /> Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && item && user._id === item.donor?._id;
  const isAdmin = user && user.role === 'admin';
  const isAvailable = item?.status === 'available';

  const getRequestStatusBadge = () => {
    if (!existingRequest) return null;
    const statusConfig = {
      pending: { class: 'badge-pending', icon: '⏳', text: 'Request Pending' },
      approved: { class: 'badge-approved', icon: '✅', text: 'Request Approved!' },
      rejected: { class: 'badge-rejected', icon: '❌', text: 'Request Declined' },
      collected: { class: 'badge-collected', icon: '📦', text: 'Item Collected' }
    };
    const config = statusConfig[existingRequest.status];
    return (
      <div className={`request-status-card ${config.class}`}>
        <span className="request-status-icon">{config.icon}</span>
        <div className="request-status-info">
          <strong>{config.text}</strong>
          {existingRequest.status === 'approved' && (
            <p>Contact the donor to arrange pickup!</p>
          )}
          {existingRequest.status === 'rejected' && existingRequest.responseMessage && (
            <p>Reason: {existingRequest.responseMessage}</p>
          )}
          {existingRequest.status === 'pending' && (
            <p>Waiting for donor to respond...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="item-details-page animate-fade-in">
          <Link to="/browse" className="back-link">
            <FiArrowLeft /> Back to Browse
          </Link>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="item-details-grid">
            {/* Image Section */}
            <div className="item-image-section">
              <div className="item-detail-image">
                {item.image ? (
                  <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                ) : (
                  <div className="item-image-placeholder">
                    <span>{categoryIcons[item.category] || '📦'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="item-info-section">
              <div className="item-info-header">
                <div className="item-badges">
                  <span className={`badge badge-${item.category}`}>{item.category}</span>
                  <span className={`badge badge-${item.condition}`}>{item.condition}</span>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
                <h1 className="item-detail-title">{item.title}</h1>
              </div>

              <p className="item-detail-desc">{item.description}</p>

              <div className="item-meta-grid">
                <div className="meta-card">
                  <FiPackage className="meta-icon" />
                  <div>
                    <span className="meta-label">Quantity</span>
                    <span className="meta-value">{item.quantity}</span>
                  </div>
                </div>
                <div className="meta-card">
                  <FiMapPin className="meta-icon" />
                  <div>
                    <span className="meta-label">Location</span>
                    <span className="meta-value">
                      {item.location.address && `${item.location.address}, `}
                      {item.location.city}, {item.location.state}
                      {item.location.pincode && ` - ${item.location.pincode}`}
                    </span>
                  </div>
                </div>
                <div className="meta-card">
                  <FiClock className="meta-icon" />
                  <div>
                    <span className="meta-label">Listed on</span>
                    <span className="meta-value">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                {item.category === 'food' && item.expiresAt && (
                  <div className="meta-card expiry-meta-card">
                    <FiCalendar className="meta-icon" style={{ color: '#ef4444' }} />
                    <div>
                      <span className="meta-label">Expiry Date</span>
                      <span className="meta-value" style={{ color: new Date(item.expiresAt) < new Date() ? '#ef4444' : 'inherit' }}>
                        {new Date(item.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {new Date(item.expiresAt) < new Date() && ' (Expired!)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Donor Info */}
              <div className="donor-card glass-card">
                <h3>Donor Information</h3>
                <div className="donor-info-grid">
                  <div className="donor-info-item">
                    <FiUser /> <span>{item.donor?.name || item.donorName}</span>
                  </div>
                  {item.donor?.email && (
                    <div className="donor-info-item">
                      <FiMail /> <span>{item.donor.email}</span>
                    </div>
                  )}
                  <div className="donor-info-item">
                    <FiPhone /> <span>{item.donor?.phone || item.donorPhone}</span>
                  </div>
                  {item.donor?.location && (
                    <div className="donor-info-item">
                      <FiMapPin /> <span>{item.donor.location.city}, {item.donor.location.state}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="item-actions">
                {/* Request Status Badge */}
                {existingRequest && getRequestStatusBadge()}

                {/* Request Button for non-owners */}
                {isAvailable && !isOwner && !existingRequest && (
                  <>
                    {!showRequestForm ? (
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => user ? setShowRequestForm(true) : navigate('/login')}
                        id="request-item-btn"
                      >
                        <FiSend /> Request This Item
                      </button>
                    ) : (
                      <div className="request-form-card glass-card animate-fade-in-up">
                        <h4><FiMessageSquare /> Send Request to Donor</h4>
                        <p className="request-form-desc">Add an optional message explaining why you need this item.</p>
                        <textarea
                          className="form-input request-textarea"
                          placeholder="Hi, I would really appreciate this item because... (optional)"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          maxLength={500}
                          rows={3}
                          id="request-message"
                        />
                        <div className="request-form-actions">
                          <button
                            className="btn btn-primary"
                            onClick={handleRequest}
                            disabled={requesting}
                            id="send-request-btn"
                          >
                            {requesting ? 'Sending...' : <><FiSend /> Send Request</>}
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => setShowRequestForm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {item.status === 'collected' && !existingRequest && (
                  <div className="collected-badge">
                    <FiCheck /> This item has been collected
                  </div>
                )}
                {(isOwner || isAdmin) && (
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                    id="delete-item-btn"
                  >
                    <FiTrash2 /> {deleting ? 'Deleting...' : 'Delete Item'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
