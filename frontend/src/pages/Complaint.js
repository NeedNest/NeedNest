import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import './Complaint.css';

const Complaint = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    itemLink: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally you would send this to the backend API here
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ issueType: '', description: '', itemLink: '' });
    }, 5000);
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="complaint-page animate-fade-in glass-card">
          <div className="complaint-header">
            <FiAlertTriangle className="complaint-icon" />
            <h1>Report an Issue</h1>
            <p>Help us keep NeedNest a safe and reliable community. Please provide as much detail as possible.</p>
          </div>

          {submitted ? (
            <div className="success-message animate-scale-in">
              <h3>✅ Complaint Submitted Successfully</h3>
              <p>Our moderation team will review your report shortly. Thank you for making NeedNest a better place!</p>
            </div>
          ) : (
            <form className="complaint-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Issue Type *</label>
                <select 
                  className="form-input" 
                  required
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                >
                  <option value="">-- Select an Issue --</option>
                  <option value="scam">Suspected Scam</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="quality">Poor Item Quality</option>
                  <option value="donor_behavior">Inappropriate Donor Behavior</option>
                  <option value="bug">Platform Bug or Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Related Item Link (Optional)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://localhost:5173/items/123"
                  value={formData.itemLink}
                  onChange={(e) => setFormData({ ...formData, itemLink: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description of the Issue *</label>
                <textarea 
                  className="form-input" 
                  rows="6" 
                  required
                  placeholder="Please describe exactly what happened or what the issue is..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">
                Submit Report
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaint;
