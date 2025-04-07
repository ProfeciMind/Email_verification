const mongoose = require('mongoose');

const EmailJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'error'],
    default: 'scheduled'
  },
  messageId: {
    type: String
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailJob', EmailJobSchema);
