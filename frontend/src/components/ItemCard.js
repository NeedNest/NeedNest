import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiPackage } from 'react-icons/fi';
import './ItemCard.css';

const categoryIcons = {
  food: '🍲',
  clothes: '👕',
  books: '📚',
  electronics: '💻',
  furniture: '🪑',
  medicines: '💊',
  toys: '🧸',
  other: '📦'
};

const ItemCard = ({ item }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link to={`/items/${item._id}`} className="item-card" id={`item-${item._id}`}>
      <div className="item-card-image">
        {item.image ? (
          <img 
            src={`http://localhost:5000${item.image}`} 
            alt={item.title}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="item-card-placeholder" style={{ display: item.image ? 'none' : 'flex' }}>
          <span className="placeholder-emoji">{categoryIcons[item.category] || '📦'}</span>
        </div>
        <div className="item-card-badges">
          <span className={`badge badge-${item.category}`}>{item.category}</span>
          <span className={`badge badge-${item.condition}`}>{item.condition}</span>
        </div>
      </div>
      <div className="item-card-content">
        <h3 className="item-card-title">{item.title}</h3>
        <p className="item-card-desc">{item.description}</p>
        <div className="item-card-meta">
          <span className="item-meta-item">
            <FiMapPin />
            {item.location.city}, {item.location.state}
          </span>
          <span className="item-meta-item">
            <FiPackage />
            Qty: {item.quantity}
          </span>
        </div>
        <div className="item-card-footer">
          <span className="item-donor">By {item.donorName}</span>
          <span className="item-time">
            <FiClock /> {timeAgo(item.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
