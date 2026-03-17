import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import { FiSearch, FiFilter, FiMapPin, FiX } from 'react-icons/fi';
import './BrowseItems.css';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: '🍲 Food' },
    { value: 'clothes', label: '👕 Clothes' },
    { value: 'books', label: '📚 Books' },
    { value: 'electronics', label: '💻 Electronics' },
    { value: 'furniture', label: '🪑 Furniture' },
    { value: 'medicines', label: '💊 Medicines' },
    { value: 'toys', label: '🧸 Toys' },
    { value: 'other', label: '📦 Other' }
  ];

  useEffect(() => {
    fetchItems();
  }, [page, filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;

      const { data } = await itemAPI.getItems(params);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching items');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setFilters({ category: 'all', city: '', search: '' });
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = filters.category !== 'all' || filters.city || filters.search;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="browse-page animate-fade-in">
          {/* Header */}
          <div className="browse-header">
            <div>
              <h1>Browse Items</h1>
              <p>Find available essentials near you</p>
            </div>
            <div className="browse-header-stats">
              <span className="items-count">{total} items available</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="search-filter-bar glass-card">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items by name or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  id="browse-search"
                />
              </div>
              <div className="search-location-wrapper">
                <FiMapPin className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter by city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  id="browse-city"
                />
              </div>
            </form>

            {/* Category Filters */}
            <div className="category-filters">
              <div className="category-chips">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    className={`category-chip ${filters.category === cat.value ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="active-filters">
                <span className="active-filters-label">Active Filters:</span>
                {filters.category !== 'all' && (
                  <span className="filter-tag">
                    {filters.category}
                    <FiX onClick={() => handleFilterChange('category', 'all')} />
                  </span>
                )}
                {filters.city && (
                  <span className="filter-tag">
                    📍 {filters.city}
                    <FiX onClick={() => handleFilterChange('city', '')} />
                  </span>
                )}
                {filters.search && (
                  <span className="filter-tag">
                    🔍 {filters.search}
                    <FiX onClick={() => handleFilterChange('search', '')} />
                  </span>
                )}
                <button className="clear-all-btn" onClick={clearFilters}>Clear All</button>
              </div>
            )}
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No items found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="items-grid stagger-children">
                {items.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={page === p ? 'active' : ''}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Complaint Section */}
          <div className="complaint-section glass-card" style={{ marginTop: '50px', padding: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Report an Issue</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Were you unhappy with an item, or did you encounter suspicious behavior? Let us know.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Complaint submitted successfully. Our team will review it shortly.'); e.target.reset(); }} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select required className="search-input" style={{ width: '100%', cursor: 'pointer' }}>
                <option value="">Select Issue Type</option>
                <option value="item_quality">Poor Item Quality</option>
                <option value="donor_behavior">Inappropriate Donor Behavior</option>
                <option value="fake_listing">Fake or Spam Listing</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Please describe your concern here..." required className="search-input" rows="4" style={{ resize: 'vertical', width: '100%', fontFamily: 'inherit' }}></textarea>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center', padding: '12px 32px' }}>Submit Complaint</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
