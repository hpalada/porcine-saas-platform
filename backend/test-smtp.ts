import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testSMTP() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Testing SMTP Configuration        ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('📧 Configuration:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***' : 'NOT SET'}\n`);

  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('📤 Sending test email...');
    const testEmail = process.env.SMTP_USER || 'test@example.com';
    
    const result = await transporter.sendMail({
      from: `"Classified Cloud Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ Test Email - SMTP Configuration',
      html: `
        <h2>✅ SMTP is working correctly!</h2>
        <p>This is a test email to verify your SMTP configuration.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}\n`);
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ✅ All tests passed!                 ║');
    console.log('║   Email feature is ready to use        ║');
    console.log('╚════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ SMTP Test Failed:');
    console.error(error instanceof Error ? error.message : error);
    console.error('\n📋 Troubleshooting:');
    console.error('   1. Verify SMTP_USER and SMTP_PASS in .env');
    console.error('   2. Check that Gmail account has "App Passwords" enabled');
    console.error('   3. Ensure firewall allows port 587');
    console.error('   4. Try: npm run test:smtp\n');
    process.exit(1);
  }
}

testSMTP();
