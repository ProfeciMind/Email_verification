const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], authController.login);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, authController.getUser);

module.exports = router;

// server/routes/campaigns.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const campaignController = require('../controllers/campaign.controller');

// @route   POST api/campaigns
// @desc    Create or update a campaign
// @access  Private
router.post('/', auth, campaignController.createOrUpdateCampaign);

// @route   GET api/campaigns
// @desc    Get all campaigns for user
// @access  Private
router.get('/', auth, campaignController.getCampaigns);

// @route   GET api/campaigns/latest
// @desc    Get latest campaign for user
// @access  Private
router.get('/latest', auth, campaignController.getLatestCampaign);

// @route   GET api/campaigns/:id
// @desc    Get campaign by ID
// @access  Private
router.get('/:id', auth, campaignController.getCampaignById);

// @route   DELETE api/campaigns/:id
// @desc    Delete a campaign
// @access  Private
router.delete('/:id', auth, campaignController.deleteCampaign);

module.exports = router;

// server/routes/emails.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const emailController = require('../controllers/email.controller');

// @route   POST api/emails/schedule
// @desc    Schedule an email
// @access  Private
router.post('/schedule', auth, emailController.scheduleEmail);

// @route   GET api/emails/jobs
// @desc    Get all email jobs for user
// @access  Private
router.get('/jobs', auth, emailController.getEmailJobs);

// @route   DELETE api/emails/jobs/:jobId
// @desc    Cancel a scheduled email
// @access  Private
router.delete('/jobs/:jobId', auth, emailController.cancelEmailJob);

module.exports = router;