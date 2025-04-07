
// server/controllers/campaign.controller.js
const Campaign = require('../models/Campaign');
const agenda = require('../config/agenda');

// Create or update a campaign
exports.createOrUpdateCampaign = async (req, res) => {
  try {
    const { name, nodes, edges, sequence, id } = req.body;
    
    let campaign;
    
    if (id) {
      // Update existing campaign
      campaign = await Campaign.findOneAndUpdate(
        { _id: id, user: req.user.id },
        {
          name,
          nodes,
          edges,
          sequence,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!campaign) {
        return res.status(404).json({ msg: 'Campaign not found' });
      }
    } else {
      // Create new campaign
      campaign = new Campaign({
        name,
        nodes,
        edges,
        sequence,
        user: req.user.id
      });
      
      await campaign.save();
    }
    
    // Schedule emails based on the sequence
    await scheduleEmailsFromCampaign(campaign);
    
    res.json(campaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).send('Server error');
  }
};

// Helper function to schedule emails from campaign sequence
async function scheduleEmailsFromCampaign(campaign) {
  try {
    // Process each sequence path
    for (const path of campaign.sequence) {
      let cumulativeDelay = 0;
      
      // Process each node in the path
      for (const node of path) {
        if (node.type === 'waitDelay') {
          // Add delay hours to cumulative delay
          cumulativeDelay += node.data.hours || 24;
        } else if (node.type === 'coldEmail') {
          // Schedule email with cumulative delay
          if (node.data.emailAddress && node.data.subject) {
            await agenda.scheduleEmail({
              to: node.data.emailAddress,
              subject: node.data.subject,
              body: node.data.body || 'No content provided',
              campaignId: campaign._id,
              nodeId: node.id
            }, cumulativeDelay);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling emails from campaign:', error);
    throw error;
  }
}

// Get all campaigns for user
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get latest campaign for user
exports.getLatestCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Campaign not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete a campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }
    
    await campaign.remove();
    
    res.json({ msg: 'Campaign deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Campaign not found' });
    }
    
    res.status(500).send('Server error');
  }
};
