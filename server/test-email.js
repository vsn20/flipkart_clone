require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***set***' : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (e) {
    console.error('❌ SMTP verify failed:', e.message);
    process.exit(1);
  }

  // Send test email
  try {
    const info = await transporter.sendMail({
      from: '"Flipkart Clone" <' + process.env.SMTP_USER + '>',
      to: process.env.SMTP_USER,
      subject: 'Test Email - Flipkart Clone Order',
      html: '<h1>Email is working!</h1><p>If you see this, order confirmation emails will work too.</p>',
    });
    console.log('✅ Test email sent! Message ID:', info.messageId);
  } catch (e) {
    console.error('❌ Email send failed:', e.message);
    console.error('Full error:', e);
  }
  process.exit(0);
}

test();
