import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const CampaignList = ({ campaigns, setCampaigns }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const deleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem('token');
        
        await axios.delete(`/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update campaigns list
        setCampaigns(campaigns.filter(campaign => campaign._id !== id));
        setIsDeleting(false);
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('Error deleting campaign');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="campaigns-list">
      {campaigns.map(campaign => (
        <div key={campaign._id} className="campaign-card">
          <div className="campaign-header">
            <h3>{campaign.name}</h3>
            <span className={`campaign-status status-${campaign.status}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          
          <div className="campaign-meta">
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span className="meta-value">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last Updated:</span>
              <span className="meta-value">{formatDate(campaign.updatedAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Nodes:</span>
              <span className="meta-value">{campaign.nodes.length}</span>
            </div>
          </div>
          
          <div className="campaign-actions">
            <Link 
              to={`/email-flow/${campaign._id}`} 
              className="campaign-action edit"
            >
              Edit
            </Link>
            <button
              onClick={() => deleteCampaign(campaign._id)}
              className="campaign-action delete"
              disabled={isDeleting}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignList;