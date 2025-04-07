import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CampaignList from './CampaignList';
import './Dashboard.css';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmails: 0,
    sentEmails: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // Fetch campaigns
        const campaignsRes = await axios.get('/api/campaigns', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch email jobs
        const emailJobsRes = await axios.get('/api/emails/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCampaigns(campaignsRes.data);
        
        // Calculate stats
        const activeCampaigns = campaignsRes.data.filter(
          campaign => campaign.status === 'active'
        ).length;
        
        const sentEmails = emailJobsRes.data.filter(
          job => job.status === 'completed'
        ).length;
        
        setStats({
          totalCampaigns: campaignsRes.data.length,
          activeCampaigns,
          totalEmails: emailJobsRes.data.length,
          sentEmails
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching dashboard data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Email Marketing Dashboard</h1>
        <Link to="/email-flow" className="new-campaign-btn">
          Create New Campaign
        </Link>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Campaigns</h3>
          <div className="stat-value">{stats.totalCampaigns}</div>
        </div>
        <div className="stat-card">
          <h3>Active Campaigns</h3>
          <div className="stat-value">{stats.activeCampaigns}</div>
        </div>
        <div className="stat-card">
          <h3>Total Emails</h3>
          <div className="stat-value">{stats.totalEmails}</div>
        </div>
        <div className="stat-card">
          <h3>Sent Emails</h3>
          <div className="stat-value">{stats.sentEmails}</div>
        </div>
      </div>
      
      <div className="campaigns-section">
        <h2>Your Campaigns</h2>
        {campaigns.length > 0 ? (
          <CampaignList campaigns={campaigns} setCampaigns={setCampaigns} />
        ) : (
          <div className="no-campaigns">
            <p>You don't have any campaigns yet.</p>
            <Link to="/email-flow" className="empty-state-button">
              Create Your First Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;