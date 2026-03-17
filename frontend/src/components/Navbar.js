import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { FiMenu, FiX, FiHome, FiSearch, FiPlusCircle, FiUser, FiLogOut, FiBell, FiShield, FiPackage, FiHeart, FiSun, FiMoon, FiInbox, FiSend } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Notification fetch error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="NeedNest Logo" className="brand-logo-img theme-aware-logo" />
          <span className="brand-text">Need<span className="brand-accent">Nest</span></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FiHome /> <span>Home</span>
          </Link>
          <Link 
            to="/browse" 
            className={`nav-link ${isActive('/browse') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FiSearch /> <span>Browse Items</span>
          </Link>
          {user && (
            <>
              <Link 
                to="/donate" 
                className={`nav-link ${isActive('/donate') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiPlusCircle /> <span>Donate</span>
              </Link>
              <Link 
                to="/my-donations" 
                className={`nav-link ${isActive('/my-donations') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiPackage /> <span>My Donations</span>
              </Link>
              <Link 
                to="/my-requests" 
                className={`nav-link ${isActive('/my-requests') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiSend /> <span>My Requests</span>
              </Link>
              <Link 
                to="/donor-requests" 
                className={`nav-link ${isActive('/donor-requests') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiInbox /> <span>Incoming</span>
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`nav-link nav-admin ${isActive('/admin') || location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <FiShield /> <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className={`theme-toggle-btn ${theme === 'light' ? 'light' : 'dark'}`}
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {theme === 'light' ? <FiSun /> : <FiMoon />}
              </span>
              <span className="theme-toggle-stars">
                <span className="star"></span>
                <span className="star"></span>
                <span className="star"></span>
              </span>
            </span>
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="notification-wrapper" ref={notifRef}>
                <button 
                  className="icon-btn notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  id="notification-bell"
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notification-dropdown animate-slide-in">
                    <div className="notif-header">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="mark-read-btn">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <p className="notif-empty">No notifications yet</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                            <p className="notif-title">{n.title}</p>
                            <p className="notif-message">{n.message}</p>
                            <span className="notif-time">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile & Logout */}
              <Link 
                to="/profile" 
                className="icon-btn profile-btn"
                onClick={() => setMobileOpen(false)}
                id="profile-link"
              >
                <FiUser />
              </Link>
              <button className="icon-btn logout-btn" onClick={handleLogout} id="logout-btn">
                <FiLogOut />
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                Join Now
              </Link>
            </div>
          )}

          <button 
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

