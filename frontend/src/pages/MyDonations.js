import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../services/api';
import { FiPackage, FiTrash2, FiEye, FiPlusCircle } from 'react-icons/fi';
import './MyDonations.css';

const statusColors = {
  available: '#4ade80',
  collected: '#60a5fa',
  reserved: '#fbbf24',
  removed: '#f87171',
  expired: '#94a3b8'
};

const categoryIcons = {
  food: '🍲', clothes: '👕', books: '📚', electronics: '💻',
  furniture: '🪑', medicines: '💊', toys: '🧸', other: '📦'
};

const MyDonations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data } = await itemAPI.getMyDonations();
      setItems(data);
    } catch (err) {
      console.error('Error fetching donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemAPI.deleteItem(id);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.status === filter);

  const counts = {
    all: items.length,
    available: items.filter(i => i.status === 'available').length,
    collected: items.filter(i => i.status === 'collected').length,
    removed: items.filter(i => i.status === 'removed').length
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="my-donations-page animate-fade-in">
          <div className="page-header">
            <div className="page-icon"><FiPackage /></div>
            <h1>My Donations</h1>
            <p>Track all items you've donated</p>
          </div>

          {/* Stats */}
          <div className="donation-stats">
            {Object.entries(counts).map(([key, count]) => (
              <button
                key={key}
                className={`stat-tab ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <span className="stat-tab-label">{key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="stat-tab-count">{count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No donations yet</h3>
              <p>Start sharing your extra essentials with those in need</p>
              <Link to="/donate" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <FiPlusCircle /> Donate Now
              </Link>
            </div>
          ) : (
            <div className="donations-list stagger-children">
              {filteredItems.map(item => (
                <div className="donation-item glass-card" key={item._id}>
                  <div className="donation-item-left">
                    <div className="donation-emoji">{categoryIcons[item.category]}</div>
                    <div className="donation-info">
                      <h3>{item.title}</h3>
                      <p>{item.location.city}, {item.location.state}</p>
                      <div className="donation-badges">
                        <span className={`badge badge-${item.category}`}>{item.category}</span>
                        <span className={`badge badge-${item.status}`}>{item.status}</span>
                        <span className="donation-date">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="donation-item-actions">
                    <Link to={`/items/${item._id}`} className="btn btn-ghost btn-sm">
                      <FiEye /> View
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDonations;
