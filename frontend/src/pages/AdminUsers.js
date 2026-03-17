import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiUsers, FiSearch, FiUserCheck, FiUserX, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the user and ALL their items.')) return;
    try {
      await adminAPI.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-page animate-fade-in">
          <Link to="/admin" className="back-link"><FiArrowLeft /> Back to Dashboard</Link>

          <div className="admin-header">
            <div>
              <h1><FiUsers /> Manage Users</h1>
              <p>{total} total users registered</p>
            </div>
          </div>

          {/* Search */}
          <div className="admin-toolbar glass-card">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                id="admin-user-search"
              />
            </div>
          </div>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : (
            <div className="admin-table-wrapper glass-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Donated</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">{u.name?.charAt(0)}</div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.location?.city}, {u.location?.state}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-electronics' : 'badge-books'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-available' : 'badge-removed'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{u.itemsDonated || 0}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <div className="action-btns">
                            <button
                              className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-primary'}`}
                              onClick={() => handleToggleStatus(u._id)}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {u.isActive ? <FiUserX /> : <FiUserCheck />}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(u._id)}
                              title="Delete User"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
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

export default AdminUsers;
