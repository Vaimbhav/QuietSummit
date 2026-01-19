import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import logger from '../utils/logger';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.password, // Use App Password, not regular Gmail password
    },
});

// Verify transporter configuration
transporter.verify((error: Error | null) => {
    if (error) {
        logger.error('Email transporter verification failed:', error);
    } else {
        logger.info('Email service is ready to send messages');
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send email using Gmail
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        const mailOptions = {
            from: `QuietSummit <${config.email.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || '',
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error) {
        logger.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (
    email: string,
    name: string
): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to QuietSummit! 🏔️</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for joining QuietSummit, your gateway to unique and peaceful homestay experiences.</p>
          <p>We're thrilled to have you as part of our community. Here's what you can do now:</p>
          <ul>
            <li>✨ Discover amazing properties in serene locations</li>
            <li>💬 Chat with our AI assistant for personalized recommendations</li>
            <li>🏡 Become a host and list your own property</li>
            <li>🧘 Explore curated wellness retreats and journeys</li>
          </ul>
          <p>Ready to start your journey?</p>
          <a href="${config.clientUrl}" class="button">Explore Properties</a>
        </div>
        <div class="footer">
          <p>QuietSummit - Find Your Peace</p>
          <p>If you have any questions, reply to this email or contact us anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Welcome to QuietSummit! 🏔️',
        html,
        text: `Hello ${name}! Welcome to QuietSummit. Start exploring amazing properties at ${config.clientUrl}`,
    });
};

/**
 * Send booking confirmation email to guest
 */
export const sendBookingConfirmationEmail = async (
    email: string,
    bookingDetails: {
        guestName: string;
        propertyName: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        hostName: string;
        hostEmail: string;
    }
): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Great news, ${bookingDetails.guestName}!</h2>
          <p>Your booking has been confirmed. We can't wait to welcome you!</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Property:</strong>
              <span>${bookingDetails.propertyName}</span>
            </div>
            <div class="detail-row">
              <strong>Check-in:</strong>
              <span>${bookingDetails.checkIn}</span>
            </div>
            <div class="detail-row">
              <strong>Check-out:</strong>
              <span>${bookingDetails.checkOut}</span>
            </div>
            <div class="detail-row">
              <strong>Total Price:</strong>
              <span>$${bookingDetails.totalPrice}</span>
            </div>
            <div class="detail-row">
              <strong>Host:</strong>
              <span>${bookingDetails.hostName}</span>
            </div>
            <div class="detail-row">
              <strong>Host Contact:</strong>
              <span>${bookingDetails.hostEmail}</span>
            </div>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Check your email 24 hours before check-in for directions</li>
            <li>Contact your host if you have any questions</li>
            <li>Review cancellation policy in your dashboard</li>
          </ul>
          
          <a href="${config.clientUrl}/dashboard" class="button">View Booking Details</a>
        </div>
        <div class="footer">
          <p>Have questions? Contact your host at ${bookingDetails.hostEmail}</p>
          <p>QuietSummit - Find Your Peace</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: `Booking Confirmed: ${bookingDetails.propertyName}`,
        html,
    });
};

/**
 * Send new booking notification to host
 */
export const sendNewBookingNotificationToHost = async (
    email: string,
    bookingDetails: {
        hostName: string;
        propertyName: string;
        guestName: string;
        guestEmail: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        guests: number;
    }
): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Booking Received!</h1>
        </div>
        <div class="content">
          <h2>Hello ${bookingDetails.hostName}!</h2>
          <p>Great news! You have a new booking for your property.</p>
          
          <div class="booking-details">
            <h3>Booking Information</h3>
            <div class="detail-row">
              <strong>Property:</strong>
              <span>${bookingDetails.propertyName}</span>
            </div>
            <div class="detail-row">
              <strong>Guest:</strong>
              <span>${bookingDetails.guestName}</span>
            </div>
            <div class="detail-row">
              <strong>Guest Email:</strong>
              <span>${bookingDetails.guestEmail}</span>
            </div>
            <div class="detail-row">
              <strong>Check-in:</strong>
              <span>${bookingDetails.checkIn}</span>
            </div>
            <div class="detail-row">
              <strong>Check-out:</strong>
              <span>${bookingDetails.checkOut}</span>
            </div>
            <div class="detail-row">
              <strong>Number of Guests:</strong>
              <span>${bookingDetails.guests}</span>
            </div>
            <div class="detail-row">
              <strong>Total Earnings:</strong>
              <span>$${bookingDetails.totalPrice}</span>
            </div>
          </div>
          
          <p><strong>Action Required:</strong></p>
          <ul>
            <li>Prepare your property for the arrival date</li>
            <li>Contact the guest if you need additional information</li>
            <li>Review booking details in your dashboard</li>
          </ul>
          
          <a href="${config.clientUrl}/dashboard" class="button">View Dashboard</a>
        </div>
        <div class="footer">
          <p>QuietSummit Host Support</p>
          <p>Need help? Contact us anytime</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: `New Booking: ${bookingDetails.propertyName}`,
        html,
    });
};

/**
 * Send property approval notification
 */
export const sendPropertyApprovalEmail = async (
    email: string,
    hostName: string,
    propertyName: string,
    status: 'approved' | 'rejected',
    reason?: string
): Promise<void> => {
    const isApproved = status === 'approved';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isApproved ? '#10b981' : '#ef4444'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: ${isApproved ? '#10b981' : '#667eea'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .reason-box { background: #fee; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isApproved ? '✓ Property Approved!' : '⚠ Property Needs Revision'}</h1>
        </div>
        <div class="content">
          <h2>Hello ${hostName}!</h2>
          ${isApproved
            ? `
            <p>Congratulations! Your property "<strong>${propertyName}</strong>" has been approved and is now live on QuietSummit! 🎉</p>
            <p>Your property is now visible to thousands of travelers looking for their perfect retreat.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your property appears in search results</li>
              <li>Guests can book directly</li>
              <li>You'll receive notifications for new bookings</li>
              <li>Track performance in your host dashboard</li>
            </ul>
          `
            : `
            <p>Thank you for submitting your property "<strong>${propertyName}</strong>". After careful review, we need you to make some adjustments before we can approve it.</p>
            ${reason ? `<div class="reason-box"><strong>Reason for Revision:</strong><br>${reason}</div>` : ''}
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the feedback above</li>
              <li>Update your property listing</li>
              <li>Resubmit for approval</li>
            </ul>
            <p>We're here to help! If you have questions, please reach out to our support team.</p>
          `
        }
          <a href="${config.clientUrl}/dashboard" class="button">${isApproved ? 'View Live Property' : 'Edit Property'}</a>
        </div>
        <div class="footer">
          <p>QuietSummit Host Support</p>
          <p>Questions? Reply to this email anytime</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: isApproved
            ? `✓ Property Approved: ${propertyName}`
            : `Property Needs Revision: ${propertyName}`,
        html,
    });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password for your QuietSummit account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠ Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>This link expires in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>QuietSummit Security Team</p>
          <p>If you have concerns, contact us immediately</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Reset Your Password - QuietSummit',
        html,
    });
};

/**
 * Send contact form submission acknowledgment
 */
export const sendContactFormAcknowledgment = async (
    email: string,
    name: string,
    subject: string
): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ We Received Your Message!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for contacting QuietSummit. We've received your inquiry regarding:</p>
          <p style="background: white; padding: 15px; border-radius: 5px;"><strong>${subject}</strong></p>
          <p>Our support team will review your message and respond within 24-48 hours.</p>
          <p>In the meantime, you might find these helpful:</p>
          <ul>
            <li>📚 <a href="${config.clientUrl}/help">Help Center</a></li>
            <li>💬 <a href="${config.clientUrl}">Chat with our AI Assistant</a></li>
            <li>📧 Direct email: support@quietsummit.com</li>
          </ul>
        </div>
        <div class="footer">
          <p>QuietSummit Support Team</p>
          <p>We're here to help!</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'We Received Your Message - QuietSummit',
        html,
    });
};

export default { sendEmail };
