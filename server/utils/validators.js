
// server/utils/validators.js
const { check } = require('express-validator');

/**
 * User registration validation rules
 */
exports.registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

/**
 * User login validation rules
 */
exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

/**
 * Campaign validation rules
 */
exports.campaignValidation = [
  check('name', 'Campaign name is required').not().isEmpty(),
  check('nodes', 'Nodes are required').isArray(),
  check('edges', 'Edges are required').isArray()
];

/**
 * Email scheduling validation rules
 */
exports.emailValidation = [
  check('to', 'Recipient email is required').isEmail(),
  check('subject', 'Subject is required').not().isEmpty(),
  check('body', 'Email body is required').not().isEmpty()
];
