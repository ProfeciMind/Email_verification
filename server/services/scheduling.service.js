const agenda = require('../config/agenda');
const EmailJob = require('../models/EmailJob');

/**
 * Service for scheduling email jobs
 */
class SchedulingService {
  /**
   * Schedule an email
   * @param {Object} emailData - Email data
   * @param {number} delay - Delay in hours
   * @returns {Promise} - Job info
   */
  async scheduleEmail(emailData, delay = 1) {
    try {
      return await agenda.scheduleEmail(emailData, delay);
    } catch (error) {
      console.error('Error in scheduling service:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled email job
   * @param {string} jobId - ID of the job to cancel
   * @returns {Promise<boolean>} - Success status
   */
  async cancelJob(jobId) {
    try {
      // Find the Agenda job
      const jobs = await agenda.jobs({ _id: jobId });
      
      if (jobs.length > 0) {
        // Remove the job from Agenda
        await jobs[0].remove();
        
        // Remove the job record from our database
        await EmailJob.findOneAndRemove({ jobId });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error canceling job:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled jobs
   * @returns {Promise<Array>} - List of jobs
   */
  async getAllJobs() {
    try {
      return await agenda.jobs({});
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }
}

module.exports = new SchedulingService();
