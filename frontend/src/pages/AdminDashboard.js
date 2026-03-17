import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { FiUsers, FiPackage, FiCheckCircle, FiXCircle, FiTrendingUp, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner-container"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers, color: '#3b82f6', sub: `${stats.activeUsers} active` },
    { icon: <FiPackage />, label: 'Total Items', value: stats.totalItems, color: '#10b981', sub: `${stats.availableItems} available` },
    { icon: <FiCheckCircle />, label: 'Collected', value: stats.collectedItems, color: '#f59e0b', sub: 'Items distributed' },
    { icon: <FiXCircle />, label: 'Removed', value: stats.removedItems, color: '#ef4444', sub: 'Items removed' }
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-page animate-fade-in">
          <div className="admin-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Monitor and manage the NeedNest platform</p>
            </div>
            <div className="admin-nav-links">
              <Link to="/admin/users" className="btn btn-ghost btn-sm">
                <FiUsers /> Manage Users
              </Link>
              <Link to="/admin/items" className="btn btn-ghost btn-sm">
                <FiPackage /> Manage Items
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="admin-stats-grid stagger-children">
            {statCards.map((card, i) => (
              <div className="admin-stat-card glass-card" key={i} style={{ '--stat-color': card.color }}>
                <div className="stat-card-icon" style={{ background: `${card.color}20`, color: card.color }}>
                  {card.icon}
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{card.value}</span>
                  <span className="stat-card-label">{card.label}</span>
                  <span className="stat-card-sub">{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-grid">
            {/* Category Breakdown */}
            <div className="admin-section glass-card">
              <div className="admin-section-header">
                <h3><FiBarChart2 /> Category Breakdown</h3>
              </div>
              <div className="category-breakdown">
                {stats.categoryStats.map(cat => (
                  <div className="category-bar-item" key={cat._id}>
                    <div className="category-bar-info">
                      <span className="category-bar-name">{cat._id}</span>
                      <span className="category-bar-count">{cat.count}</span>
                    </div>
                    <div className="category-bar-track">
                      <div 
                        className="category-bar-fill" 
                        style={{ width: `${(cat.count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="admin-section glass-card">
              <div className="admin-section-header">
                <h3><FiUsers /> Recent Users</h3>
                <Link to="/admin/users" className="btn btn-ghost btn-sm">
                  View All <FiArrowRight />
                </Link>
              </div>
              <div className="recent-list">
                {stats.recentUsers.map(user => (
                  <div className="recent-item" key={user._id}>
                    <div className="recent-avatar">{user.name?.charAt(0)}</div>
                    <div className="recent-info">
                      <span className="recent-name">{user.name}</span>
                      <span className="recent-meta">{user.email}</span>
                    </div>
                    <span className={`badge ${user.isActive ? 'badge-available' : 'badge-removed'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Items */}
          <div className="admin-section glass-card">
            <div className="admin-section-header">
              <h3><FiTrendingUp /> Recent Items</h3>
              <Link to="/admin/items" className="btn btn-ghost btn-sm">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="admin-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Donor</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentItems.map(item => (
                    <tr key={item._id}>
                      <td><strong>{item.title}</strong></td>
                      <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                      <td>{item.donor?.name || item.donorName}</td>
                      <td>{item.location.city}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
