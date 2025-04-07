const Agenda = require('agenda');
const nodemailer = require('nodemailer');

// Connect Agenda to MongoDB
const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI || 'mongodb://localhost:27017/email-marketing',
    collection: 'emailJobs'
  },
  processEvery: '1 minute'
});

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || 'your_mailtrap_user',
      pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
    }
  });
  
  // Define job to send email
  agenda.define('send email', async job => {
    const { to, subject, body, from, campaignId, nodeId } = job.attrs.data;
    
    try {
      // Send email
      const info = await transporter.sendMail({
        from: from || '"Email Marketing App" <noreply@emailmarketing.com>',
        to,
        subject,
        html: body
      });
      
      console.log('Email sent successfully:', info.messageId);
      
      // Update email job status in database
      const EmailJob = require('../models/EmailJob');
      await EmailJob.findOneAndUpdate(
        { 'jobId': job.attrs._id.toString() },
        { 
          $set: {
            status: 'completed',
            sentAt: new Date(),
            messageId: info.messageId
          }
        }
      );
      
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update job status to error
      const EmailJob = require('../models/EmailJob');
      await EmailJob.findOneAndUpdate(
        { 'jobId': job.attrs._id.toString() },
        { 
          $set: {
            status: 'error',
            error: error.toString()
          }
        }
      );
      
      throw error;
    }
  });
  
  // Schedule email to be sent
  agenda.scheduleEmail = async (emailData, delay = 1) => {
    try {
      // Schedule the job
      const job = await agenda.schedule(
        `in ${delay} hours`, 
        'send email',
        emailData
      );
      
      // Save the job reference
      const EmailJob = require('../models/EmailJob');
      const emailJob = new EmailJob({
        jobId: job.attrs._id.toString(),
        campaignId: emailData.campaignId,
        nodeId: emailData.nodeId,
        recipient: emailData.to,
        subject: emailData.subject,
        scheduledFor: job.attrs.nextRunAt,
        status: 'scheduled'
      });
      
      await emailJob.save();
      
      return {
        jobId: job.attrs._id.toString(),
        scheduledFor: job.attrs.nextRunAt
      };
    } catch (error) {
      console.error('Error scheduling email:', error);
      throw error;
    }
  };
  
  module.exports = agenda;
  