const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Basic route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, service, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please fill all required fields' 
    });
  }

  try {
    // Email to admin/business
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission - ${subject} from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Service Type:</strong> ${service || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your Subject:</strong> ${subject}</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Our Team</p>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.json({ 
      success: true, 
      message: 'Email sent successfully! We will contact you soon.' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending email. Please try again.' 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
