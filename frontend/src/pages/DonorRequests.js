import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { FiInbox, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiMapPin, FiUser, FiPhone, FiMail, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import './Requests.css';

const categoryIcons = {
  food: '🍲', clothes: '👕', books: '📚', electronics: '💻',
  furniture: '🪑', medicines: '💊', toys: '🧸', other: '📦'
};

const DonorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [responseModal, setResponseModal] = useState(null); // { requestId, action }
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await requestAPI.getDonorRequests({ status: filter });
      setRequests(data);
    } catch (err) {
      console.error('Error fetching donor requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    setActionLoading(prev => ({ ...prev, [requestId]: action }));
    try {
      if (action === 'approve') {
        await requestAPI.approveRequest(requestId, { responseMessage });
      } else if (action === 'reject') {
        await requestAPI.rejectRequest(requestId, { responseMessage });
      } else if (action === 'collect') {
        await requestAPI.markCollected(requestId);
      }
      setResponseModal(null);
      setResponseMessage('');
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const openResponseModal = (requestId, action) => {
    setResponseModal({ requestId, action });
    setResponseMessage('');
  };

  const statusConfig = {
    pending: { icon: <FiClock />, label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    approved: { icon: <FiCheckCircle />, label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    rejected: { icon: <FiXCircle />, label: 'Declined', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    collected: { icon: <FiPackage />, label: 'Collected', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'rejected', label: '❌ Declined' },
    { value: 'collected', label: '📦 Collected' }
  ];

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="requests-page animate-fade-in">
          <div className="page-header">
            <div className="page-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><FiInbox /></div>
            <h1>Incoming Requests</h1>
            <p>Manage requests from people who need your donated items</p>
            {pendingCount > 0 && (
              <div className="pending-counter">
                {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="request-filters">
            {filters.map(f => (
              <button
                key={f.value}
                className={`filter-chip ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📬</div>
              <h3>No Requests</h3>
              <p>{filter === 'all' ? "No one has requested your items yet." : `No ${filter} requests.`}</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req, index) => {
                const status = statusConfig[req.status];
                return (
                  <div
                    key={req._id}
                    className={`request-card glass-card animate-fade-in-up ${req.status === 'pending' ? 'request-card-pending' : ''}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="request-card-left">
                      <Link to={`/items/${req.item?._id}`} className="request-item-image">
                        {req.item?.image ? (
                          <img src={`http://localhost:5000${req.item.image}`} alt={req.item.title} />
                        ) : (
                          <span className="request-item-emoji">{categoryIcons[req.item?.category] || '📦'}</span>
                        )}
                      </Link>
                    </div>

                    <div className="request-card-center">
                      <Link to={`/items/${req.item?._id}`} className="request-item-title">
                        {req.item?.title || 'Item removed'}
                      </Link>
                      <div className="request-meta">
                        <span className="badge" style={{ background: status.bg, color: status.color }}>
                          {status.icon} {status.label}
                        </span>
                        <span className="request-date">
                          <FiClock /> {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Receiver Info */}
                      <div className="requester-info">
                        <span className="requester-label">Requested by:</span>
                        <div className="requester-details">
                          <span><FiUser /> {req.receiver?.name}</span>
                          {req.receiver?.phone && <span><FiPhone /> {req.receiver.phone}</span>}
                          {req.receiver?.location && (
                            <span><FiMapPin /> {req.receiver.location.city}, {req.receiver.location.state}</span>
                          )}
                        </div>
                      </div>

                      {req.message && (
                        <p className="request-message">
                          <FiMessageSquare /> <strong>Message:</strong> {req.message}
                        </p>
                      )}
                    </div>

                    <div className="request-card-actions">
                      {req.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn btn-approve"
                            onClick={() => openResponseModal(req._id, 'approve')}
                            disabled={actionLoading[req._id]}
                            id={`approve-${req._id}`}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            className="btn btn-reject"
                            onClick={() => openResponseModal(req._id, 'reject')}
                            disabled={actionLoading[req._id]}
                            id={`reject-${req._id}`}
                          >
                            <FiX /> Decline
                          </button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <button
                          className="btn btn-collected"
                          onClick={() => handleAction(req._id, 'collect')}
                          disabled={actionLoading[req._id]}
                          id={`collect-${req._id}`}
                        >
                          {actionLoading[req._id] === 'collect' ? 'Processing...' : <><FiPackage /> Mark Collected</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal && (
        <div className="modal-overlay" onClick={() => setResponseModal(null)}>
          <div className="modal-card glass-card animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h3>
              {responseModal.action === 'approve' ? '✅ Approve Request' : '❌ Decline Request'}
            </h3>
            <p className="modal-desc">
              {responseModal.action === 'approve'
                ? 'The requester will be notified and can contact you for pickup.'
                : 'Add an optional reason for declining this request.'
              }
            </p>
            <textarea
              className="form-input request-textarea"
              placeholder={responseModal.action === 'approve'
                ? 'Optional: Add a message (pickup time, location details...)'
                : 'Optional: Explain why (already given away, not available...)'
              }
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="modal-actions">
              <button
                className={`btn ${responseModal.action === 'approve' ? 'btn-approve' : 'btn-reject'}`}
                onClick={() => handleAction(responseModal.requestId, responseModal.action)}
                disabled={actionLoading[responseModal.requestId]}
              >
                {actionLoading[responseModal.requestId]
                  ? 'Processing...'
                  : responseModal.action === 'approve'
                    ? <><FiCheck /> Confirm Approval</>
                    : <><FiX /> Confirm Decline</>
                }
              </button>
              <button className="btn btn-outline" onClick={() => setResponseModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorRequests;
