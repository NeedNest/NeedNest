import { Link } from 'react-router-dom';
import { FiHeart, FiMail, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand">
              <img src="/logo.png" alt="NeedNest Logo" className="footer-brand-logo-img theme-aware-logo" />
              <span className="footer-brand-text">Need<span>Nest</span></span>
            </Link>
            <p className="footer-tagline">
              Connecting people with extra essentials to those who need them. 
              Reduce waste, share kindness.
            </p>
          </div>

          <div className="footer-links-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Items</Link></li>
              <li><Link to="/donate">Donate Items</Link></li>
              <li><Link to="/register">Join NeedNest</Link></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/browse?category=food">Food</Link></li>
              <li><Link to="/browse?category=clothes">Clothes</Link></li>
              <li><Link to="/browse?category=books">Books</Link></li>
              <li><Link to="/browse?category=electronics">Electronics</Link></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li><FiMail /> <span>support@neediest.com</span></li>
              <li><FiMapPin /> <span>India</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 NeedNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

