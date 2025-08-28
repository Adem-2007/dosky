import nodemailer from 'nodemailer';

// @desc    Send email from contact form
// @route   POST /api/contact/send
// @access  Public
const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }

  // Create a transporter object using the SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Set up email data with a professional and responsive design
  const mailOptions = {
    from: `"${name}" <${email}>`, // sender address
    to: process.env.EMAIL_USER, // list of receivers (your email)
    subject: `New Contact Form Submission from ${name}`, // Subject line
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 10px !important;
            }
            .header, .footer {
              padding: 20px !important;
            }
            .content {
              padding: 20px !important;
            }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center">
              <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin-top: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td class="header" align="center" style="background-color: #007bff; color: #ffffff; padding: 40px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <h1 style="margin: 0; font-size: 24px;">New Message from CogniPDF</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td class="content" style="padding: 40px;">
                    <h2 style="color: #333333; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Submission Details</h2>
                    <p style="font-size: 16px; color: #555555;"><strong>Name:</strong> ${name}</p>
                    <p style="font-size: 16px; color: #555555;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <h3 style="color: #333333;">Message:</h3>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">${message}</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="footer" align="center" style="background-color: #f4f4f4; color: #888888; padding: 20px; font-size: 12px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p>This email was sent from the contact form on your website.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
};

export { sendContactEmail };