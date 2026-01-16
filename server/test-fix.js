require('dotenv').config();

// ✅ CORRECT: Import the existing instance
const EmailService = require('./services/email.service');

async function testFix() {
  console.log('🚀 Testing Email Fix...\n');
  
  // Create new instance
  const emailService = new EmailService();
  
  // Test connection
  console.log('1. Testing connection...');
  const connected = await emailService.verifyConnection();
  console.log(`   Connection: ${connected ? '✅ SUCCESS' : '❌ FAILED'}\n`);
  
  if (connected) {
    // Send test email
    console.log('2. Sending test email...');
    const result = await emailService.sendEmail(
      process.env.EMAIL_USER,
      'Test Fix - Email Service',
      '<h1>Test Email</h1><p>If you see this, the fix worked!</p>'
    );
    
    console.log(`   Result: ${result.success ? '✅ EMAIL SENT' : '❌ FAILED'}`);
    console.log(`   Message: ${result.error || 'Check your inbox!'}\n`);
  }
  
  console.log('3. Stats:', emailService.getStats());
}

testFix().catch(console.error);