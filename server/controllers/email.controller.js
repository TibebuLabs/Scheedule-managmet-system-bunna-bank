const emailService = require('../services/email.service');

class EmailController {
  // 🧪 Test email service
  async testEmail(req, res) {
    try {
      const { testEmail } = req.query;
      
      const result = await emailService.testEmailService(testEmail);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('❌ Error testing email service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test email service',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📊 Get email statistics
  async getEmailStats(req, res) {
    try {
      const stats = emailService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error getting email stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get email statistics',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔄 Reset email statistics
  async resetEmailStats(req, res) {
    try {
      emailService.resetStats();
      
      res.status(200).json({
        success: true,
        message: 'Email statistics reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error resetting email stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset email statistics',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📧 Send custom email
  async sendCustomEmail(req, res) {
    try {
      const { to, subject, html, options = {} } = req.body;
      
      if (!to || !subject || !html) {
        return res.status(400).json({
          success: false,
          message: 'to, subject, and html are required',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await emailService.sendEmail(to, subject, html, options);
      
      res.status(result.success ? 200 : 500).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error sending custom email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send custom email',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 📧 Send bulk emails
  async sendBulkEmails(req, res) {
    try {
      const { recipients, subject, html, options = {} } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || !subject) {
        return res.status(400).json({
          success: false,
          message: 'recipients (array) and subject are required',
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await emailService.sendBulkEmails(
        recipients,
        subject,
        html,
        options
      );
      
      res.status(result.success ? 200 : 500).json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error sending bulk emails:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk emails',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 🔧 Check email connection
  async checkConnection(req, res) {
    try {
      const isConnected = await emailService.verifyConnection();
      
      res.status(200).json({
        success: true,
        connected: isConnected,
        stats: emailService.getStats(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error checking email connection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check email connection',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new EmailController();