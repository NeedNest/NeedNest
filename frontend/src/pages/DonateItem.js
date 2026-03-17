import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemAPI } from '../services/api';
import { FiPackage, FiUpload, FiMapPin, FiCheck, FiImage, FiCalendar, FiHeart } from 'react-icons/fi';
import LocationPicker from '../components/LocationPicker';
import './DonateItem.css';

// Generate confetti / particle items once
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 1.2}s`,
  duration: `${1.2 + Math.random() * 1.4}s`,
  color: ['#f43f5e','#fb923c','#facc15','#4ade80','#38bdf8','#a78bfa','#f472b6'][i % 7],
  size: `${8 + Math.random() * 10}px`,
  shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'heart',
}));

const ThankYouOverlay = ({ onDone }) => {
  const [phase, setPhase] = useState('enter'); // enter → show → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(onDone, 3900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`ty-overlay ty-overlay--${phase}`}>
      {/* Confetti particles */}
      <div className="ty-confetti">
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className={`ty-particle ty-particle--${p.shape}`}
            style={{
              left: p.left,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className={`ty-card ty-card--${phase}`}>
        {/* Orbiting hearts */}
        <div className="ty-orbit">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="ty-orbit-heart" style={{ '--i': i }}>
              <FiHeart />
            </span>
          ))}
        </div>

        {/* Check circle */}
        <div className="ty-check-ring">
          <div className="ty-check-circle">
            <FiCheck className="ty-check-icon" />
          </div>
        </div>

        <h2 className="ty-heading">
          {'Thank You!'.split('').map((ch, i) => (
            <span key={i} className="ty-letter" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h2>
        <p className="ty-sub">for your generous donation 💛</p>
        <p className="ty-msg">Your item is now visible to people in need. You're making a real difference!</p>
        <div className="ty-bar-wrap"><div className="ty-bar" /></div>
      </div>
    </div>
  );
};

const DonateItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    quantity: 1,
    expiryDate: '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    address: user?.location?.address || '',
    pincode: user?.location?.pincode || ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'food', label: '🍲 Food', desc: 'Cooked food, groceries, snacks' },
    { value: 'clothes', label: '👕 Clothes', desc: 'Shirts, pants, shoes, etc.' },
    { value: 'books', label: '📚 Books', desc: 'Textbooks, novels, study material' },
    { value: 'electronics', label: '💻 Electronics', desc: 'Phones, laptops, accessories' },
    { value: 'furniture', label: '🪑 Furniture', desc: 'Tables, chairs, shelves' },
    { value: 'medicines', label: '💊 Medicines', desc: 'First aid, medical supplies' },
    { value: 'toys', label: '🧸 Toys', desc: 'Kids toys, games, puzzles' },
    { value: 'other', label: '📦 Other', desc: 'Anything else useful' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLocationChange = ({ city, state, address, pincode }) => {
    setFormData(prev => ({ ...prev, city, state, address, pincode }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('quantity', formData.quantity);
      data.append('location', JSON.stringify({
        city: formData.city,
        state: formData.state,
        address: formData.address,
        pincode: formData.pincode
      }));
      if (['food', 'medicines'].includes(formData.category) && formData.expiryDate) {
        data.append('expiryDate', formData.expiryDate);
      }
      if (!image) {
        setError('Please upload an image of the item before submitting.');
        setLoading(false);
        return;
      }
      data.append('image', image);

      await itemAPI.createItem(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && <ThankYouOverlay onDone={() => navigate('/my-donations')} />}
    <div className="page-wrapper">
      <div className="container">
        <div className="donate-page animate-fade-in-up">
          <div className="page-header">
            <div className="page-icon">
              <FiPackage />
            </div>
            <h1>Donate an Item</h1>
            <p>Share what you don't need. Help someone who does.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="donate-form glass-card">
            {/* Item Details */}
            <div className="form-section">
              <h3 className="form-section-title">📋 Item Details</h3>
              
              <div className="form-group">
                <label className="form-label">Item Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Winter Jackets, Rice Packets, NCERT Books"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  id="donate-title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Describe the item - its condition, quantity details, any special notes..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  id="donate-description"
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <div className="category-selector">
                  {categories.map(cat => (
                    <label 
                      key={cat.value} 
                      className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={formData.category === cat.value}
                        onChange={handleChange}
                        required
                      />
                      <span className="cat-label">{cat.label}</span>
                      <span className="cat-desc">{cat.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="condition"
                    className="form-select"
                    value={formData.condition}
                    onChange={handleChange}
                    id="donate-condition"
                  >
                    <option value="new">Brand New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max="999"
                    id="donate-quantity"
                  />
                </div>
              </div>

              {/* Expiry Date - Food & Medicines */}
              <div className={`expiry-date-section ${['food', 'medicines'].includes(formData.category) ? 'show' : ''}`}>
                <div className="expiry-date-content">
                  <div className="form-group">
                    <label className="form-label"><FiCalendar /> Expiry Date *</label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required={['food', 'medicines'].includes(formData.category)}
                      id="donate-expiry-date"
                    />
                    <p className="expiry-hint">⚠️ Food and medicine items require an expiry date for safety and quality control.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-section">
              <h3 className="form-section-title"><FiImage /> Item Image *</h3>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  id="donate-image"
                  className="image-input"
                  required
                />
                <label htmlFor="donate-image" className="image-upload-label">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <FiUpload className="upload-icon" />
                      <span>Click to upload image</span>
                      <span className="upload-hint">JPEG, PNG, WebP (max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Location — Map Picker */}
            <div className="form-section">
              <h3 className="form-section-title"><FiMapPin /> Pickup Location</h3>
              <p className="form-hint">📍 Drop a pin on the map — address fields will auto-fill. You can edit them manually too.</p>

              <LocationPicker
                onLocationChange={handleLocationChange}
                initialCity={formData.city}
                initialState={formData.state}
              />

              {/* Editable fields for manual correction */}
              <div className="form-row" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="City name"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    id="donate-city"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="State name"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    id="donate-state"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="Street, area, landmark"
                    value={formData.address}
                    onChange={handleChange}
                    id="donate-address"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-input"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    id="donate-pincode"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="donate-submit">
              {loading ? 'Listing Item...' : <><FiPackage /> List Item for Donation</>}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default DonateItem;
