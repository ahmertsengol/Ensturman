// Manual SMTP test
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔧 Manual SMTP Test Starting...');
  
  const transporter = nodemailer.createTransport({  // createTransport (without 'er')
    service: 'gmail',  // Try with service instead of host
    auth: {
      user: 'ahmertsengol@gmail.com',
      pass: 'lrhj tmht rhvn kwkb'
    }
  });

  try {
    console.log('🔍 Testing transporter...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    // Try sending a test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: 'ahmertsengol@gmail.com',
      to: 'ahmertsengol@gmail.com', // Send to yourself for testing
      subject: 'EnsAI SMTP Test',
      text: 'This is a test email from EnsAI 2FA system.'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:', error.message);
    console.error('📝 Error Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 AUTHENTICATION ERROR:');
      console.log('1. Ensure 2FA is enabled on your Gmail account');
      console.log('2. Check if App Password is correct: "lrhj tmht rhvn kwkb"');
      console.log('3. Try regenerating the App Password');
      console.log('4. Make sure App Password is created for "Mail" application');
    }
  }
}

testSMTP(); 