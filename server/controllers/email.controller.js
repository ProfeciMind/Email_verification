
// server/controllers/email.controller.js
const EmailJob = require('../models/EmailJob');
const Campaign = require('../models/Campaign');
const agenda = require('../config/agenda');

// Schedule an email
exports.scheduleEmail = async (req, res) => {
  try {
    const { to, subject, body, delay } = req.body;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({ msg: 'Please provide email address, subject, and body' });
    }
    
    // Schedule the email
    const scheduledJob = await agenda.scheduleEmail({
      to,
      subject,
      body,
      campaignId: req.body.campaignId || null,
      nodeId: req.body.nodeId || null
    }, delay || 1);
    
    res.json({
      message: 'Email scheduled successfully',
      jobId: scheduledJob.jobId,
      scheduledFor: scheduledJob.scheduledFor
    });
  } catch (err) {
    console.error('Error scheduling email:', err);
    res.status(500).send('Server error');
  }
};

// Get all email jobs for user
exports.getEmailJobs = async (req, res) => {
  try {
    // Find all campaigns for this user
    const userCampaigns = await Campaign.find({ user: req.user.id }).select('_id');
    const campaignIds = userCampaigns.map(campaign => campaign._id);
    
    // Get email jobs for user's campaigns
    const emailJobs = await EmailJob.find({
      campaignId: { $in: campaignIds }
    }).sort({ scheduledFor: -1 });
    
    res.json(emailJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Cancel a scheduled email
exports.cancelEmailJob = async (req, res) => {
  try {
    // Find the email job
    const emailJob = await EmailJob.findOne({ jobId: req.params.jobId });
    
    if (!emailJob) {
      return res.status(404).json({ msg: 'Email job not found' });
    }
    
    // Check if user owns the campaign
    const campaign = await Campaign.findOne({
      _id: emailJob.campaignId,
      user: req.user.id
    });
    
    if (!campaign) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Cancel the job
    const jobs = await agenda.jobs({ _id: emailJob.jobId });
    
    if (jobs.length > 0) {
      await jobs[0].remove();
    }
    
    // Delete the job record
    await emailJob.remove();
    
    res.json({ msg: 'Email canceled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
