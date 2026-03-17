import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { FiInbox, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiMapPin, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import './Requests.css';

const categoryIcons = {
  food: '🍲', clothes: '👕', books: '📚', electronics: '💻',
  furniture: '🪑', medicines: '💊', toys: '🧸', other: '📦'
};

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await requestAPI.getMyRequests({ status: filter });
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { icon: <FiClock />, label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    approved: { icon: <FiCheckCircle />, label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    rejected: { icon: <FiXCircle />, label: 'Declined', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    collected: { icon: <FiPackage />, label: 'Collected', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' }
  };

  const filters = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Declined' },
    { value: 'collected', label: 'Collected' }
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="requests-page animate-fade-in">
          <div className="page-header">
            <div className="page-icon"><FiInbox /></div>
            <h1>My Requests</h1>
            <p>Track the status of items you've requested</p>
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
                {f.value !== 'all' && (
                  <span className="filter-dot" style={{ background: statusConfig[f.value]?.color }}></span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No Requests Found</h3>
              <p>{filter === 'all' ? "You haven't requested any items yet." : `No ${filter} requests.`}</p>
              <Link to="/browse" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Browse Items
              </Link>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req, index) => {
                const status = statusConfig[req.status];
                return (
                  <div
                    key={req._id}
                    className="request-card glass-card animate-fade-in-up"
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
                      {req.message && (
                        <p className="request-message">
                          <strong>Your message:</strong> {req.message}
                        </p>
                      )}
                      {req.responseMessage && (
                        <p className="request-response">
                          <strong>Donor response:</strong> {req.responseMessage}
                        </p>
                      )}
                    </div>

                    <div className="request-card-right">
                      {/* Donor info for approved requests */}
                      {req.status === 'approved' && req.donor && (
                        <div className="request-contact">
                          <h4>Contact Donor</h4>
                          <div className="contact-info">
                            <span><FiUser /> {req.donor.name}</span>
                            {req.donor.phone && <span><FiPhone /> {req.donor.phone}</span>}
                            {req.donor.email && <span><FiMail /> {req.donor.email}</span>}
                          </div>
                        </div>
                      )}
                      {req.item?.location && (
                        <div className="request-location">
                          <FiMapPin /> {req.item.location.city}, {req.item.location.state}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
