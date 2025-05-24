// Test email service
require('dotenv').config();
const { testEmailConnection } = require('./src/services/emailService');

async function testEmail() {
  console.log('🧪 Testing email connection...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD);
  console.log('🔑 Email Password Length:', process.env.EMAIL_PASSWORD?.length || 0);
  /*    
        EMAIL_USER=ahmertsengol@gmail.com
        EMAIL_PASSWORD=lrhj tmht rhvn kwkb 
  */
  try {
    const result = await testEmailConnection();
    if (result) {
      console.log('✅ Email connection successful!');
      console.log('📨 Ready to send verification emails');
    } else {
      console.log('❌ Email connection failed!');
      console.log('⚠️  Check your Gmail App Password');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('📝 Full error:', error);
    
    if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
      console.log('\n🔧 COMMON FIXES:');
      console.log('1. App Password should have spaces: "lrhj tmht rhvn kwkb"');
      console.log('2. Check 2FA is enabled on Gmail account');
      console.log('3. Ensure App Password is for "Mail" application');
      console.log('4. Try regenerating App Password');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('\n🌐 NETWORK ISSUE:');
      console.log('1. Check internet connection');
      console.log('2. Check if Gmail SMTP is blocked by firewall');
    }
  }
}

testEmail(); 