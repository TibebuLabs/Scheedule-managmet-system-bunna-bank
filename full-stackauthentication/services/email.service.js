const nodemailer = require('nodemailer');
const { format, addDays } = require('date-fns');

class EmailService {
  constructor() {
    // 🔥 FIXED: Use service:'gmail' instead of host/port - This is the KEY FIX
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development',
      logger: true
    });

    // Stats tracking
    this.stats = {
      emailsSent: 0,
      emailsFailed: 0,
      lastSent: null
    };

    // Verify connection on initialization
    this.verifyConnection();
  }

  // 🔧 Verify email connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready to send messages');
      console.log(`📧 Using: service='gmail', user=${process.env.EMAIL_USER}`);
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      console.log('🔧 Try these fixes:');
      console.log('   1. Use a Google App Password (not regular password)');
      console.log('   2. Enable 2FA on your Google account');
      console.log('   3. Check if port 587/465 is blocked by firewall');
      return false;
    }
  }

  // 🚀 Send single email - WITH RETRY LOGIC
  async sendEmail(to, subject, html, options = {}, retryCount = 0) {
    try {
      const mailOptions = {
        from: `"Task Management System" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        replyTo: process.env.EMAIL_USER,
        ...options,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          ...options.headers
        }
      };

      console.log(`📤 Sending email to: ${mailOptions.to} (attempt ${retryCount + 1})`);
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
      
      // Update stats
      this.stats.emailsSent++;
      this.stats.lastSent = new Date();
      
      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        envelope: info.envelope,
        sentAt: new Date()
      };
      
    } catch (error) {
      console.error(`❌ Email sending failed:`, error.message);
      console.log(`🔧 Error code: ${error.code}`);
      
      // Update stats
      this.stats.emailsFailed++;
      
      // Try again with different configuration if it's a timeout
      if (error.code === 'ETIMEDOUT' && retryCount < 2) {
        console.log(`🔄 Retrying with different configuration (attempt ${retryCount + 1})...`);
        
        // Try alternative configuration
        const altConfig = retryCount === 0 ? 
          { service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } } :
          { 
            host: 'smtp.gmail.com', 
            port: 465, 
            secure: true,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
          };
        
        this.transporter = nodemailer.createTransport(altConfig);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return this.sendEmail(to, subject, html, options, retryCount + 1);
      }
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        command: error.command,
        failedAt: new Date()
      };
    }
  }

  // 📧 Send bulk emails - SIMPLIFIED VERSION
  async sendBulkEmails(recipients, subject, htmlGenerator, options = {}) {
    console.log(`📧 Starting bulk email sending to ${recipients.length} recipients`);
    
    const results = [];
    let successCount = 0;
    
    for (const recipient of recipients) {
      try {
        const personalizedHtml = typeof htmlGenerator === 'function' 
          ? htmlGenerator(recipient) 
          : htmlGenerator;
        
        const result = await this.sendEmail(
          recipient.email,
          subject,
          personalizedHtml,
          {
            ...options,
            headers: {
              ...options.headers,
              'X-Recipient-Id': recipient.id || 'unknown'
            }
          }
        );
        
        result.recipient = recipient;
        results.push(result);
        
        if (result.success) {
          successCount++;
        }
        
        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
        results.push({
          success: false,
          recipient,
          error: error.message
        });
      }
    }
    
    console.log(`📧 Bulk email summary:`);
    console.log(`   Total: ${recipients.length}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${recipients.length - successCount}`);
    
    return {
      success: successCount > 0,
      total: recipients.length,
      successful: successCount,
      failed: recipients.length - successCount,
      results
    };
  }

  // 🧪 Test email service - SIMPLE VERSION
  async testEmailService(testEmail = null) {
    try {
      console.log('🔧 Testing email service...');
      console.log('Email User:', process.env.EMAIL_USER);
      
      const targetEmail = testEmail || process.env.EMAIL_USER;
      
      const testResult = await this.sendEmail(
        targetEmail,
        '📋 Test Email - Task Scheduler System',
        this.generateTestEmailTemplate()
      );

      if (!testResult.success) {
        throw new Error(testResult.error);
      }

      console.log('✅ Test email sent successfully!');
      
      return {
        success: true,
        message: 'Test email sent successfully',
        details: testResult,
        time: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      
      return {
        success: false,
        message: 'Test email failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper function to calculate duration dates (7-day range)
  calculateDurationDates(startDate) {
    const start = new Date(startDate);
    const end = addDays(start, 6); // 7 days total (start date + 6 days)
    
    return {
      startDate: format(start, 'MMMM do, yyyy'),
      endDate: format(end, 'MMMM do, yyyy'),
      durationRange: `${format(start, 'MMM do')} to ${format(end, 'MMM do, yyyy')} (7 days)`,
      totalDays: 7
    };
  }

  // Helper function to get simple week identifier
  getWeekIdentifier(date) {
    const startDate = new Date(date);
    const endDate = addDays(startDate, 6);
    return `Week of ${format(startDate, 'MMM do')} - ${format(endDate, 'MMM do')}`;
  }

  // 📄 Generate test email template
  generateTestEmailTemplate() {
    const today = new Date();
    const durationDates = this.calculateDurationDates(today);
    const weekIdentifier = this.getWeekIdentifier(today);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Assignment Letter</title>
        <style>
          /* Monochromatic theme with shades of gray */
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            background-color: #f5f5f5; 
            margin: 0; 
            padding: 20px;
          }
          .letter-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: #ffffff; 
            border: 1px solid #e0e0e0; 
            border-radius: 3px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            overflow: hidden;
          }
          .letter-header { 
            background: linear-gradient(to right, #f8f8f8, #ffffff); 
            padding: 40px 50px 20px; 
            border-bottom: 1px solid #e0e0e0;
          }
          .company-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: 300; 
            color: #222222; 
            letter-spacing: 1px;
          }
          .company-tagline { 
            font-size: 14px; 
            color: #666666; 
            margin-top: 5px;
          }
          .letter-date { 
            font-size: 14px; 
            color: #666666;
          }
          .letter-title { 
            text-align: center; 
            padding: 25px 0 15px; 
            border-top: 1px solid #e0e0e0; 
            border-bottom: 1px solid #e0e0e0; 
            margin: 20px 50px;
          }
          .letter-title h1 { 
            margin: 0; 
            font-size: 22px; 
            font-weight: 400; 
            color: #222222; 
            letter-spacing: 0.5px;
          }
          .letter-title .subtitle { 
            font-size: 16px; 
            color: #666666; 
            margin-top: 8px;
          }
          .letter-body { 
            padding: 40px 50px; 
            background: #ffffff;
          }
          .letter-salutation { 
            font-size: 16px; 
            margin-bottom: 30px; 
            color: #222222;
          }
          .letter-content { 
            font-size: 15px; 
            color: #444444; 
            line-height: 1.7;
          }
          .assignment-block { 
            background: #f9f9f9; 
            padding: 25px; 
            margin: 30px 0; 
            border-left: 3px solid #222222;
          }
          .assignment-title { 
            font-size: 18px; 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 15px;
          }
          .assignment-details { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-top: 20px;
          }
          .detail-item { 
            padding: 15px; 
            background: #ffffff; 
            border: 1px solid #e0e0e0; 
            border-radius: 2px;
          }
          .detail-label { 
            font-size: 12px; 
            color: #777777; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 5px;
          }
          .detail-value { 
            font-size: 15px; 
            color: #222222; 
            font-weight: 500;
          }
          .responsibilities-section { 
            margin: 40px 0;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: 500; 
            color: #222222; 
            padding-bottom: 10px; 
            border-bottom: 2px solid #e0e0e0; 
            margin-bottom: 20px;
          }
          .responsibility-item { 
            margin-bottom: 20px; 
            padding-left: 20px; 
            position: relative;
          }
          .responsibility-item:before { 
            content: "•"; 
            position: absolute; 
            left: 0; 
            color: #222222; 
            font-size: 20px;
          }
          .responsibility-title { 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 5px;
          }
          .responsibility-desc { 
            color: #555555; 
            font-size: 14.5px;
          }
          .notice-box { 
            background: #f0f0f0; 
            padding: 20px; 
            border: 1px solid #d0d0d0; 
            margin: 30px 0; 
            border-left: 3px solid #222222;
          }
          .notice-title { 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 10px;
          }
          .letter-closing { 
            margin-top: 50px;
          }
          .signature-block { 
            margin-top: 40px; 
            padding-top: 30px; 
            border-top: 1px solid #e0e0e0;
          }
          .signature { 
            font-size: 16px; 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 5px;
          }
          .signature-title { 
            font-size: 14px; 
            color: #666666;
          }
          .footer { 
            background: #f8f8f8; 
            padding: 25px 50px; 
            text-align: center; 
            border-top: 1px solid #e0e0e0; 
            font-size: 12px; 
            color: #777777;
          }
          .contact-info { 
            margin-top: 10px; 
            font-size: 11px; 
            color: #888888;
          }
          /* Specific styles for selected staff */
          .staff-highlight { 
            background: #f0f0f0; 
            padding: 15px; 
            margin: 20px 0; 
            border: 1px dashed #b0b0b0; 
            border-radius: 2px;
          }
          .staff-name { 
            font-size: 17px; 
            font-weight: 600; 
            color: #222222; 
            text-align: center; 
            margin-bottom: 10px;
          }
          .staff-notice { 
            font-size: 13px; 
            color: #666666; 
            text-align: center; 
            font-style: italic;
          }
          @media print {
            body { background: white; padding: 0; }
            .letter-container { box-shadow: none; border: 1px solid #ccc; }
          }
          @media (max-width: 768px) {
            .letter-header, .letter-body { padding: 30px; }
            .company-header { flex-direction: column; align-items: flex-start; }
            .assignment-details { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="letter-container">
          <!-- Letter Header -->
          <div class="letter-header">
            <div class="company-header">
              <div>
                <div class="company-name">TASK MANAGEMENT SYSTEM</div>
                <div class="company-tagline">Bunna Bank Headquarters • IT Operations Division</div>
              </div>
              <div class="letter-date">${format(today, 'MMMM do, yyyy')}</div>
            </div>
          </div>
          
          <!-- Letter Title -->
          <div class="letter-title">
            <h1>OFFICIAL TASK ASSIGNMENT NOTIFICATION</h1>
            <div class="subtitle">${weekIdentifier} • Schedule ID: SCH-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}</div>
          </div>
          
          <!-- Letter Body -->
          <div class="letter-body">
            <!-- Salutation -->
            <div class="letter-salutation">
              <strong>TO: Selected Staff Member</strong><br>
              <strong>FROM: IT Operations Division</strong><br>
              <strong>DATE: ${format(today, 'MMMM do, yyyy')}</strong><br>
              <strong>SUBJECT: Task Assignment - ${scheduleType || 'Weekly Support Schedule'}</strong>
            </div>
            
            <!-- Selected Staff Highlight -->
            <div class="staff-highlight">
              <div class="staff-name">SELECTED STAFF: [Staff Name Here]</div>
              <div class="staff-notice">This letter confirms your selection for the following assignment</div>
            </div>
            
            <!-- Main Content -->
            <div class="letter-content">
              <p>This letter serves as official notification of your task assignment within the IT Operations Division. The assignment details, responsibilities, and expectations are outlined below for your reference and compliance.</p>
              
              <!-- Assignment Block -->
              <div class="assignment-block">
                <div class="assignment-title">📋 ASSIGNMENT OVERVIEW</div>
                <p>You have been assigned to support the ${new Date().getFullYear()} IT Operations schedule. This assignment requires your full attention and adherence to the protocols established by the division.</p>
                
                <div class="assignment-details">
                  <div class="detail-item">
                    <div class="detail-label">Schedule Type</div>
                    <div class="detail-value">${Math.random() > 0.5 ? 'Weekly Rotation' : 'Daily Support'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${durationDates.totalDays} Days</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Period</div>
                    <div class="detail-value">${durationDates.startDate} to ${durationDates.endDate}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Primary Task</div>
                    <div class="detail-value">IT Support & PM Activities</div>
                  </div>
                </div>
              </div>
              
              <!-- Responsibilities Section -->
              <div class="responsibilities-section">
                <div class="section-title">RESPONSIBILITIES & EXPECTATIONS</div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">End of Day (EOD) Support Team</div>
                  <div class="responsibility-desc">
                    All EOD assigned staff are responsible for assigning ITOP requests upon arrival to appropriate teams or staff while providing EOD support. Timely assignment and proper documentation are mandatory.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Weekly Reporting Protocol</div>
                  <div class="responsibility-desc">
                    The designated team member at HQ (marked with ✓) is responsible for submitting a summarized weekly Head Office support report based on the provided template. Required records include: date, directorate, contact phone number, PC/printer model, status, and any identified issues or resources used.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Preventive Maintenance (PM) Activities</div>
                  <div class="responsibility-desc">
                    PM assigned staff are responsible for conducting PM activities at branches per the checklist and collecting data using the format distributed via email. Compliance with safety protocols and documentation standards is required.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Status Updates & Communication</div>
                  <div class="responsibility-desc">
                    PM assigned staff with the asterisk (*) designation are responsible for providing daily status updates and reporting any challenges encountered during PM activities to the division. Clear and timely communication is essential.
                  </div>
                </div>
              </div>
              
              <!-- Important Notice -->
              <div class="notice-box">
                <div class="notice-title">⚠️ IMPORTANT NOTICE</div>
                <p>This assignment requires strict adherence to all IT Operations protocols. Any deviations from standard procedures must be communicated and approved in advance. Failure to comply with reporting requirements may result in disciplinary action.</p>
                <p>For detailed guidelines and procedural clarifications, refer to the official documentation sent to your institutional email address.</p>
              </div>
              
              <!-- Closing Paragraph -->
              <p>Your commitment to these responsibilities ensures the smooth operation of our IT infrastructure and supports the bank's overall mission. We appreciate your dedication and professionalism in fulfilling this assignment.</p>
            </div>
            
            <!-- Signature Block -->
            <div class="letter-closing">
              <p>Respectfully,</p>
              
              <div class="signature-block">
                <div class="signature">IT Operations Division Management</div>
                <div class="signature-title">Bunna Bank Headquarters</div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>© ${new Date().getFullYear()} Bunna Bank Task Management System. All Rights Reserved.</div>
            <div class="contact-info">
              Bunna Bank Headquarters • Addis Ababa, Ethiopia • 📞 0920267834 • ✉️ tibe13d2144@gmail.com
            </div>
            <div style="margin-top: 15px; font-size: 11px; color: #999;">
              This is an official automated notification. Please retain this letter for your records.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 📧 Generate task assignment email template
  generateTaskAssignmentTemplate(schedule, assignment) {
    const scheduledDate = new Date(schedule.scheduledDate);
    const durationDates = this.calculateDurationDates(scheduledDate);
    const weekIdentifier = this.getWeekIdentifier(scheduledDate);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Assignment Letter</title>
        <style>
          /* Monochromatic theme with shades of gray */
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            background-color: #f5f5f5; 
            margin: 0; 
            padding: 20px;
          }
          .letter-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: #ffffff; 
            border: 1px solid #e0e0e0; 
            border-radius: 3px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            overflow: hidden;
          }
          .letter-header { 
            background: linear-gradient(to right, #f8f8f8, #ffffff); 
            padding: 40px 50px 20px; 
            border-bottom: 1px solid #e0e0e0;
          }
          .company-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: 300; 
            color: #222222; 
            letter-spacing: 1px;
          }
          .company-tagline { 
            font-size: 14px; 
            color: #666666; 
            margin-top: 5px;
          }
          .letter-date { 
            font-size: 14px; 
            color: #666666;
          }
          .letter-title { 
            text-align: center; 
            padding: 25px 0 15px; 
            border-top: 1px solid #e0e0e0; 
            border-bottom: 1px solid #e0e0e0; 
            margin: 20px 50px;
          }
          .letter-title h1 { 
            margin: 0; 
            font-size: 22px; 
            font-weight: 400; 
            color: #222222; 
            letter-spacing: 0.5px;
          }
          .letter-title .subtitle { 
            font-size: 16px; 
            color: #666666; 
            margin-top: 8px;
          }
          .letter-body { 
            padding: 40px 50px; 
            background: #ffffff;
          }
          .letter-salutation { 
            font-size: 16px; 
            margin-bottom: 30px; 
            color: #222222;
          }
          .letter-content { 
            font-size: 15px; 
            color: #444444; 
            line-height: 1.7;
          }
          .assignment-block { 
            background: #f9f9f9; 
            padding: 25px; 
            margin: 30px 0; 
            border-left: 3px solid #222222;
          }
          .assignment-title { 
            font-size: 18px; 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 15px;
          }
          .assignment-details { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-top: 20px;
          }
          .detail-item { 
            padding: 15px; 
            background: #ffffff; 
            border: 1px solid #e0e0e0; 
            border-radius: 2px;
          }
          .detail-label { 
            font-size: 12px; 
            color: #777777; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 5px;
          }
          .detail-value { 
            font-size: 15px; 
            color: #222222; 
            font-weight: 500;
          }
          .responsibilities-section { 
            margin: 40px 0;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: 500; 
            color: #222222; 
            padding-bottom: 10px; 
            border-bottom: 2px solid #e0e0e0; 
            margin-bottom: 20px;
          }
          .responsibility-item { 
            margin-bottom: 20px; 
            padding-left: 20px; 
            position: relative;
          }
          .responsibility-item:before { 
            content: "•"; 
            position: absolute; 
            left: 0; 
            color: #222222; 
            font-size: 20px;
          }
          .responsibility-title { 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 5px;
          }
          .responsibility-desc { 
            color: #555555; 
            font-size: 14.5px;
          }
          .notice-box { 
            background: #f0f0f0; 
            padding: 20px; 
            border: 1px solid #d0d0d0; 
            margin: 30px 0; 
            border-left: 3px solid #222222;
          }
          .notice-title { 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 10px;
          }
          .letter-closing { 
            margin-top: 50px;
          }
          .signature-block { 
            margin-top: 40px; 
            padding-top: 30px; 
            border-top: 1px solid #e0e0e0;
          }
          .signature { 
            font-size: 16px; 
            font-weight: 500; 
            color: #222222; 
            margin-bottom: 5px;
          }
          .signature-title { 
            font-size: 14px; 
            color: #666666;
          }
          .footer { 
            background: #f8f8f8; 
            padding: 25px 50px; 
            text-align: center; 
            border-top: 1px solid #e0e0e0; 
            font-size: 12px; 
            color: #777777;
          }
          .contact-info { 
            margin-top: 10px; 
            font-size: 11px; 
            color: #888888;
          }
          /* Specific styles for selected staff */
          .staff-highlight { 
            background: #f0f0f0; 
            padding: 15px; 
            margin: 20px 0; 
            border: 1px dashed #b0b0b0; 
            border-radius: 2px;
          }
          .staff-name { 
            font-size: 17px; 
            font-weight: 600; 
            color: #222222; 
            text-align: center; 
            margin-bottom: 10px;
          }
          .staff-notice { 
            font-size: 13px; 
            color: #666666; 
            text-align: center; 
            font-style: italic;
          }
          @media print {
            body { background: white; padding: 0; }
            .letter-container { box-shadow: none; border: 1px solid #ccc; }
          }
          @media (max-width: 768px) {
            .letter-header, .letter-body { padding: 30px; }
            .company-header { flex-direction: column; align-items: flex-start; }
            .assignment-details { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="letter-container">
          <!-- Letter Header -->
          <div class="letter-header">
            <div class="company-header">
              <div>
                <div class="company-name">TASK MANAGEMENT SYSTEM</div>
                <div class="company-tagline">Bunna Bank Headquarters • IT Operations Division</div>
              </div>
              <div class="letter-date">${format(scheduledDate, 'MMMM do, yyyy')}</div>
            </div>
          </div>
          
          <!-- Letter Title -->
          <div class="letter-title">
            <h1>OFFICIAL TASK ASSIGNMENT NOTIFICATION</h1>
            <div class="subtitle">${weekIdentifier} • Schedule ID: ${schedule.scheduleId || `SCH-${new Date().getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}`}</div>
          </div>
          
          <!-- Letter Body -->
          <div class="letter-body">
            <!-- Salutation -->
            <div class="letter-salutation">
              <strong>TO: ${assignment.staffName}</strong><br>
              <strong>FROM: IT Operations Division</strong><br>
              <strong>DATE: ${format(scheduledDate, 'MMMM do, yyyy')}</strong><br>
              <strong>SUBJECT: Task Assignment - ${schedule.taskTitle || 'Weekly Support Schedule'}</strong>
            </div>
            
            <!-- Selected Staff Highlight -->
            <div class="staff-highlight">
              <div class="staff-name">SELECTED STAFF: ${assignment.staffName}</div>
              <div class="staff-notice">This letter confirms your selection for the following assignment</div>
            </div>
            
            <!-- Main Content -->
            <div class="letter-content">
              <p>This letter serves as official notification of your task assignment within the IT Operations Division. The assignment details, responsibilities, and expectations are outlined below for your reference and compliance.</p>
              
              <!-- Assignment Block -->
              <div class="assignment-block">
                <div class="assignment-title">📋 ASSIGNMENT OVERVIEW</div>
                <p>You have been assigned to support the ${new Date().getFullYear()} IT Operations schedule. This assignment requires your full attention and adherence to the protocols established by the division.</p>
                
                <div class="assignment-details">
                  <div class="detail-item">
                    <div class="detail-label">Schedule Type</div>
                    <div class="detail-value">${schedule.scheduleType || 'Weekly Rotation'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Task Title</div>
                    <div class="detail-value">${schedule.taskTitle || 'IT Support & PM Activities'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${durationDates.totalDays} Days</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Period</div>
                    <div class="detail-value">${durationDates.startDate} to ${durationDates.endDate}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Assignment Date</div>
                    <div class="detail-value">${format(scheduledDate, 'EEEE, MMMM do, yyyy')}</div>
                  </div>
                </div>
              </div>
              
              <!-- Responsibilities Section -->
              <div class="responsibilities-section">
                <div class="section-title">RESPONSIBILITIES & EXPECTATIONS</div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">End of Day (EOD) Support Team</div>
                  <div class="responsibility-desc">
                    All EOD assigned staff are responsible for assigning ITOP requests upon arrival to appropriate teams or staff while providing EOD support. Timely assignment and proper documentation are mandatory.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Weekly Reporting Protocol</div>
                  <div class="responsibility-desc">
                    The designated team member at HQ (marked with ✓) is responsible for submitting a summarized weekly Head Office support report based on the provided template. Required records include: date, directorate, contact phone number, PC/printer model, status, and any identified issues or resources used.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Preventive Maintenance (PM) Activities</div>
                  <div class="responsibility-desc">
                    PM assigned staff are responsible for conducting PM activities at branches per the checklist and collecting data using the format distributed via email. Compliance with safety protocols and documentation standards is required.
                  </div>
                </div>
                
                <div class="responsibility-item">
                  <div class="responsibility-title">Status Updates & Communication</div>
                  <div class="responsibility-desc">
                    PM assigned staff with the asterisk (*) designation are responsible for providing daily status updates and reporting any challenges encountered during PM activities to the division. Clear and timely communication is essential.
                  </div>
                </div>
              </div>
              
              <!-- Important Notice -->
              <div class="notice-box">
                <div class="notice-title">⚠️ IMPORTANT NOTICE</div>
                <p>This assignment requires strict adherence to all IT Operations protocols. Any deviations from standard procedures must be communicated and approved in advance. Failure to comply with reporting requirements may result in disciplinary action.</p>
                <p>For detailed guidelines and procedural clarifications, refer to the official documentation sent to your institutional email address or contact your supervisor at ${process.env.SUPERVISOR_EMAIL || 'supervisor@bunnabank.com'}.</p>
              </div>
              
              <!-- Closing Paragraph -->
              <p>Your commitment to these responsibilities ensures the smooth operation of our IT infrastructure and supports the bank's overall mission. We appreciate your dedication and professionalism in fulfilling this assignment.</p>
            </div>
            
            <!-- Signature Block -->
            <div class="letter-closing">
              <p>Respectfully,</p>
              
              <div class="signature-block">
                <div class="signature">IT Operations Division Management</div>
                <div class="signature-title">Bunna Bank Headquarters</div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>© ${new Date().getFullYear()} Bunna Bank Task Management System. All Rights Reserved.</div>
            <div class="contact-info">
              Bunna Bank Headquarters • Addis Ababa, Ethiopia • 📞 0920267834 • ✉️ tibe13d2144@gmail.com
            </div>
            <div style="margin-top: 15px; font-size: 11px; color: #999;">
              This is an official automated notification. Please retain this letter for your records.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 📈 Get email statistics
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.emailsSent > 0 
        ? ((this.stats.emailsSent / (this.stats.emailsSent + this.stats.emailsFailed)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

module.exports = new EmailService();