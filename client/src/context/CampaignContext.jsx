
import React, { createContext, useState } from 'react';
import axios from 'axios';

export const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await axios.get('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCampaigns(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching campaigns');
      setLoading(false);
    }
  };

  // Fetch a single campaign by ID
  const fetchCampaign = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await axios.get(`/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentCampaign(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.message || 'Error fetching campaign');
      setLoading(false);
      return null;
    }
  };

  // Create or update a campaign
  const saveCampaign = async (campaignData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await axios.post('/api/campaigns', campaignData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update current campaign state
      setCurrentCampaign(res.data);
      
      // Update campaigns list if we're updating an existing campaign
      if (campaignData.id) {
        setCampaigns(campaigns.map(campaign => 
          campaign._id === res.data._id ? res.data : campaign
        ));
      } else {
        // Add new campaign to list
        setCampaigns([...campaigns, res.data]);
      }
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.message || 'Error saving campaign');
      setLoading(false);
      throw err;
    }
  };

  // Delete a campaign
  const deleteCampaign = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.delete(`/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update campaigns list
      setCampaigns(campaigns.filter(campaign => campaign._id !== id));
      
      // Clear current campaign if we deleted it
      if (currentCampaign && currentCampaign._id === id) {
        setCurrentCampaign(null);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Error deleting campaign');
      setLoading(false);
      throw err;
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        currentCampaign,
        loading,
        error,
        fetchCampaigns,
        fetchCampaign,
        saveCampaign,
        deleteCampaign,
        setCampaigns
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};
