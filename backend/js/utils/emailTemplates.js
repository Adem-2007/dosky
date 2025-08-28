export const verificationEmailTemplate = (name, code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background-color: #008080; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; }
            .code { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 4px; padding: 10px; background-color: #f2f2f2; border-radius: 4px; }
            .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Verification</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Thank you for registering. Please use the following 6-digit code to complete your sign-up process:</p>
                <div class="code">${code}</div>
                <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};