import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiPackage, FiSearch, FiCheck, FiX, FiTrash2, FiArrowLeft, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Admin.css';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchItems();
  }, [page, search, statusFilter, categoryFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const { data } = await adminAPI.getItems(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveItem(id);
      fetchItems();
    } catch (err) {
      alert('Failed to update item');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this item? The donor will be notified.')) return;
    try {
      await adminAPI.removeItem(id);
      fetchItems();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-page animate-fade-in">
          <Link to="/admin" className="back-link"><FiArrowLeft /> Back to Dashboard</Link>

          <div className="admin-header">
            <div>
              <h1><FiPackage /> Manage Items</h1>
              <p>{total} total items in the system</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar glass-card">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search items by title or donor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                id="admin-item-search"
              />
            </div>
            <select
              className="form-select admin-filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="collected">Collected</option>
              <option value="removed">Removed</option>
            </select>
            <select
              className="form-select admin-filter-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="medicines">Medicines</option>
              <option value="toys">Toys</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : (
            <div className="admin-table-wrapper glass-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Donor</th>
                    <th>Location</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Approved</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      <td><strong>{item.title}</strong></td>
                      <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                      <td>{item.donor?.name || item.donorName}</td>
                      <td>{item.location.city}</td>
                      <td>{item.quantity}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                      <td>
                        <span className={`badge ${item.isApproved ? 'badge-available' : 'badge-removed'}`}>
                          {item.isApproved ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/items/${item._id}`} className="btn btn-ghost btn-sm" title="View">
                            <FiEye />
                          </Link>
                          <button
                            className={`btn btn-sm ${item.isApproved ? 'btn-ghost' : 'btn-primary'}`}
                            onClick={() => handleApprove(item._id)}
                            title={item.isApproved ? 'Disapprove' : 'Approve'}
                          >
                            {item.isApproved ? <FiX /> : <FiCheck />}
                          </button>
                          {item.status !== 'removed' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemove(item._id)}
                              title="Remove Item"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminItems;
