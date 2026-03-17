import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import { FiArrowRight, FiHeart, FiSearch, FiMapPin, FiUsers, FiPackage, FiTrendingUp, FiShield } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalCategories: 8 });

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const { data } = await itemAPI.getItems({ limit: 4 });
      setRecentItems(data.items);
      setStats(prev => ({ ...prev, totalItems: data.total }));
    } catch (err) {
      console.error('Error fetching items');
    }
  };

  const features = [
    {
      icon: <FiHeart />,
      title: 'Easy Donations',
      desc: 'Upload item details, add photos, and specify pickup location in minutes.'
    },
    {
      icon: <FiSearch />,
      title: 'Smart Discovery',
      desc: 'Search by category, location, or keyword to find exactly what you need.'
    },
    {
      icon: <FiMapPin />,
      title: 'Location-Based',
      desc: 'Find available items near your area for convenient pickup.'
    },
    {
      icon: <FiShield />,
      title: 'Admin Monitored',
      desc: 'Verified listings and active moderation ensure quality and trust.'
    }
  ];

  const categories = [
    { name: 'Food', emoji: '🍲', key: 'food', color: '#ef4444' },
    { name: 'Clothes', emoji: '👕', key: 'clothes', color: '#3b82f6' },
    { name: 'Books', emoji: '📚', key: 'books', color: '#a855f7' },
    { name: 'Electronics', emoji: '💻', key: 'electronics', color: '#f59e0b' },
    { name: 'Furniture', emoji: '🪑', key: 'furniture', color: '#22c55e' },
    { name: 'Medicines', emoji: '💊', key: 'medicines', color: '#f43f5e' },
    { name: 'Toys', emoji: '🧸', key: 'toys', color: '#0ea5e9' },
    { name: 'Other', emoji: '📦', key: 'other', color: '#64748b' }
  ];

  const howItWorks = [
    { step: '01', title: 'Sign Up', desc: 'Create your free account with your name, email, and location.' },
    { step: '02', title: 'List or Browse', desc: 'Donors upload items with details. Receivers browse and search.' },
    { step: '03', title: 'Connect', desc: 'Find items you need, view donor details, and arrange pickup.' },
    { step: '04', title: 'Collect', desc: 'Pick up items at the specified location and mark as collected.' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-elements">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge animate-fade-in">
              <FiTrendingUp /> <span>Community-Powered Sharing</span>
            </div>
            <h1 className="hero-title animate-fade-in-up">
              Share What You <span className="gradient-text">Don't Need</span>,<br />
              Give What <span className="gradient-text-accent">Others Need</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up">
              NeedNest connects people with extra essentials — food, clothes, books, and more —
              to those who truly need them. Reduce waste, spread kindness, build community.
            </p>
            <div className="hero-actions animate-fade-in-up">
              <Link to="/donate" className="btn btn-primary btn-lg">
                <FiHeart /> Start Donating
              </Link>
              <Link to="/browse" className="btn btn-outline btn-lg">
                <FiSearch /> Browse Items
              </Link>
            </div>
            <div className="hero-stats animate-fade-in-up">
              <div className="hero-stat">
                <span className="hero-stat-number">{stats.totalItems}+</span>
                <span className="hero-stat-label">Items Shared</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">{stats.totalCategories}</span>
                <span className="hero-stat-label">Categories</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">100%</span>
                <span className="hero-stat-label">Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why NeedNest?</span>
            <h2 className="section-title">A Better Way to <span className="gradient-text">Share</span></h2>
            <p className="section-desc">
              Our platform makes resource sharing simple, location-aware, and community-driven.
            </p>
          </div>
          <div className="features-grid stagger-children">
            {features.map((f, i) => (
              <div className="feature-card glass-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse by Category</span>
            <h2 className="section-title">Find What <span className="gradient-text">You Need</span></h2>
          </div>
          <div className="categories-grid stagger-children">
            {categories.map((cat) => (
              <Link
                to={`/browse?category=${cat.key}`}
                className="category-card"
                key={cat.key}
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Simple <span className="gradient-text">4-Step</span> Process</h2>
          </div>
          <div className="how-grid stagger-children">
            {howItWorks.map((step, i) => (
              <div className="how-card" key={i}>
                <span className="how-step">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < howItWorks.length - 1 && <div className="how-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section className="recent-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Recently Added</span>
              <h2 className="section-title">Latest <span className="gradient-text">Donations</span></h2>
            </div>
            <div className="items-grid stagger-children">
              {recentItems.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
            <div className="section-cta">
              <Link to="/browse" className="btn btn-outline btn-lg">
                View All Items <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow"></div>
            <h2>Ready to Make a Difference?</h2>
            <p>
              Join NeedNest today and be part of a community that cares.
              Every item shared is waste reduced and a need fulfilled.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-accent btn-lg">
                <FiUsers /> Join NeedNest
              </Link>
              <Link to="/browse" className="btn btn-ghost btn-lg">
                Explore Items <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
