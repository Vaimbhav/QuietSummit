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
 * Send booking confirmation email to guest with detailed receipt
 */
export const sendBookingConfirmationEmail = async (
    email: string,
    bookingDetails: {
        guestName: string;
        propertyName: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        hostName?: string;
        hostEmail?: string;
        bookingReference?: string;
        numberOfTravelers?: number;
        travelers?: Array<{ name: string; age: number; gender: string }>;
        duration?: number;
        destination?: string;
        departureDate?: string;
        roomPreference?: string;
        subtotal?: number;
        discount?: number;
        paymentMethod?: string;
        transactionId?: string;
    }
): Promise<void> => {
    const bookingRef = bookingDetails.bookingReference || `QS${Date.now().toString().slice(-8).toUpperCase()}`;
    const travelers = bookingDetails.travelers || [];
    const isJourney = !!bookingDetails.departureDate;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
        .header h1 { margin: 0 0 10px 0; font-size: 32px; position: relative; z-index: 1; }
        .header p { margin: 0; font-size: 16px; opacity: 0.95; position: relative; z-index: 1; }
        .logo-text { font-size: 14px; font-weight: 600; letter-spacing: 2px; opacity: 0.9; margin-bottom: 15px; }
        .thank-you { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 30px; border-left: 5px solid #10b981; margin: 0; }
        .thank-you h2 { margin: 0 0 15px 0; color: #059669; font-size: 26px; font-weight: 700; }
        .thank-you p { margin: 0; color: #065f46; font-size: 16px; line-height: 1.8; }
        .content { padding: 35px 30px; }
        .receipt-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px double #e5e7eb; }
        .receipt-header h2 { margin: 0 0 5px 0; color: #1f2937; font-size: 22px; }
        .receipt-header p { margin: 0; color: #6b7280; font-size: 14px; }
        .reference-card { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); }
        .reference-card .label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
        .reference-card .value { font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 5px 0; }
        .reference-card .date { font-size: 13px; opacity: 0.8; margin-top: 10px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #10b981; display: flex; align-items: center; gap: 10px; }
        .section-title::before { content: '▶'; color: #10b981; font-size: 14px; }
        .booking-details { background: #f9fafb; padding: 25px; border-radius: 10px; margin: 15px 0; border: 1px solid #e5e7eb; }
        .detail-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-row strong { color: #4b5563; font-weight: 600; font-size: 14px; }
        .detail-row span { color: #1f2937; text-align: right; max-width: 60%; font-weight: 500; font-size: 14px; }
        .traveler-card { background: white; border: 1px solid #e5e7eb; padding: 18px; border-radius: 10px; margin: 12px 0; display: flex; align-items: center; gap: 15px; transition: all 0.3s; }
        .traveler-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .traveler-number { width: 45px; height: 45px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 18px; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
        .traveler-info { flex: 1; }
        .traveler-name { font-weight: bold; color: #1f2937; margin-bottom: 5px; font-size: 15px; }
        .traveler-details { font-size: 13px; color: #6b7280; }
        .price-summary { background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); padding: 25px; border-radius: 10px; margin: 20px 0; border: 2px solid #e5e7eb; }
        .price-row { display: flex; justify-content: space-between; padding: 12px 0; color: #4b5563; font-size: 15px; }
        .price-total { border-top: 3px solid #10b981; margin-top: 15px; padding-top: 20px; font-size: 22px; font-weight: bold; color: #059669; }
        .price-total span:last-child { color: #059669; font-size: 24px; }
        .invoice-footer { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #d1d5db; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; margin-top: 25px; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); font-size: 15px; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); }
        .timeline { margin: 25px 0; }
        .timeline-item { display: flex; gap: 18px; margin-bottom: 25px; }
        .timeline-dot { width: 36px; height: 36px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3); }
        .timeline-content h4 { margin: 0 0 6px 0; color: #1f2937; font-size: 16px; }
        .timeline-content p { margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; }
        .reminder-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .reminder-box strong { color: #92400e; display: block; margin-bottom: 12px; font-size: 16px; }
        .reminder-box ul { margin: 0; padding-left: 22px; }
        .reminder-box li { color: #78350f; margin: 8px 0; font-size: 14px; }
        .footer { background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 35px 30px; text-align: center; border-top: 3px solid #e5e7eb; }
        .footer-links { margin: 20px 0; }
        .footer-links a { color: #6366f1; text-decoration: none; margin: 0 15px; font-weight: 600; font-size: 14px; transition: color 0.3s; }
        .footer-links a:hover { color: #4f46e5; }
        .footer p { margin: 8px 0; color: #6b7280; font-size: 13px; line-height: 1.6; }
        .footer .brand { margin-top: 25px; font-weight: 700; color: #1f2937; font-size: 16px; }
        .footer .tagline { font-style: italic; color: #059669; margin-top: 5px; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 5px 14px; border-radius: 15px; font-size: 12px; font-weight: 600; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">QUIETSUMMIT</div>
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your adventure begins here</p>
        </div>
        
        <div class="thank-you">
          <h2>Thank You for Choosing QuietSummit, ${bookingDetails.guestName}! 🙏</h2>
          <p>We are absolutely thrilled to have you as our valued guest! Your trust in QuietSummit means the world to us. Your booking has been successfully confirmed, and our team is already working to ensure you have an unforgettable, peaceful, and transformative experience.</p>
        </div>

        <div class="content">
          <div class="receipt-header">
            <h2>📋 BOOKING RECEIPT</h2>
            <p>Official confirmation and payment receipt</p>
          </div>

          <div class="reference-card">
            <div class="label">BOOKING REFERENCE NUMBER</div>
            <div class="value">${bookingRef}</div>
            <div class="date">Issued on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <h3 class="section-title">${isJourney ? 'Journey' : 'Booking'} Information</h3>
          <div class="booking-details">
            <div class="detail-row">
              <strong>${isJourney ? '🏔️ Journey Name' : '🏡 Property Name'}:</strong>
              <span>${bookingDetails.propertyName}</span>
            </div>
            ${bookingDetails.destination ? `
            <div class="detail-row">
              <strong>📍 Destination:</strong>
              <span>${bookingDetails.destination}</span>
            </div>` : ''}
            ${isJourney ? `
            <div class="detail-row">
              <strong>🗓️ Departure Date:</strong>
              <span>${bookingDetails.departureDate}</span>
            </div>
            <div class="detail-row">
              <strong>⏱️ Duration:</strong>
              <span>${bookingDetails.duration} days of adventure</span>
            </div>` : `
            <div class="detail-row">
              <strong>📅 Check-in:</strong>
              <span>${bookingDetails.checkIn}</span>
            </div>
            <div class="detail-row">
              <strong>📅 Check-out:</strong>
              <span>${bookingDetails.checkOut}</span>
            </div>`}
            <div class="detail-row">
              <strong>👥 Number of Travelers:</strong>
              <span>${bookingDetails.numberOfTravelers || 1} ${(bookingDetails.numberOfTravelers || 1) === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            ${bookingDetails.roomPreference ? `
            <div class="detail-row">
              <strong>🛏️ Room Preference:</strong>
              <span style="text-transform: capitalize;">${bookingDetails.roomPreference}</span>
            </div>` : ''}
            ${bookingDetails.hostName ? `
            <div class="detail-row">
              <strong>🤝 Your Host:</strong>
              <span>${bookingDetails.hostName}</span>
            </div>
            <div class="detail-row">
              <strong>📧 Host Contact:</strong>
              <span>${bookingDetails.hostEmail}</span>
            </div>` : ''}
          </div>

          ${travelers.length > 0 ? `
          <h3 class="section-title">Traveler Details</h3>
          ${travelers.map((traveler, index) => `
          <div class="traveler-card">
            <div class="traveler-number">${index + 1}</div>
            <div class="traveler-info">
              <div class="traveler-name">${traveler.name}</div>
              <div class="traveler-details">${traveler.age} years old • ${traveler.gender.charAt(0).toUpperCase() + traveler.gender.slice(1)}</div>
            </div>
          </div>`).join('')}
          ` : ''}

          <h3 class="section-title">Payment Receipt</h3>
          <div class="price-summary">
            ${bookingDetails.subtotal ? `
            <div class="price-row">
              <span>Subtotal:</span>
              <span>₹${bookingDetails.subtotal.toLocaleString('en-IN')}</span>
            </div>` : ''}
            ${bookingDetails.discount && bookingDetails.discount > 0 ? `
            <div class="price-row" style="color: #059669;">
              <span>💚 Discount Applied:</span>
              <span>- ₹${bookingDetails.discount.toLocaleString('en-IN')}</span>
            </div>` : ''}
            <div class="price-row price-total">
              <span>Total Amount Paid:</span>
              <span>₹${bookingDetails.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="invoice-footer">
              ${bookingDetails.paymentMethod ? `
              <div class="price-row" style="font-size: 13px; padding: 8px 0;">
                <span>Payment Method:</span>
                <span><strong>${bookingDetails.paymentMethod}</strong></span>
              </div>` : ''}
              ${bookingDetails.transactionId ? `
              <div class="price-row" style="font-size: 13px; padding: 8px 0;">
                <span>Transaction ID:</span>
                <span style="font-family: monospace; font-size: 12px;">${bookingDetails.transactionId}</span>
              </div>` : ''}
              <div class="price-row" style="font-size: 13px; padding: 8px 0;">
                <span>Payment Date:</span>
                <span>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div class="price-row" style="font-size: 13px; padding: 8px 0;">
                <span>Payment Status:</span>
                <span style="color: #059669; font-weight: 700;">✓ PAID</span>
              </div>
            </div>
          </div>

          <h3 class="section-title">What Happens Next? 🚀</h3>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot">✓</div>
              <div class="timeline-content">
                <h4>Confirmation Received</h4>
                <p>Your booking is confirmed and payment has been successfully processed. You're all set!</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">2</div>
              <div class="timeline-content">
                <h4>Pre-Trip Information Package</h4>
                <p>We'll send you a comprehensive travel guide and packing list 30 days before ${isJourney ? 'departure' : 'check-in'}</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">3</div>
              <div class="timeline-content">
                <h4>Final Details & Check-in Instructions</h4>
                <p>Our team will reach out 7 days before with all the final details, directions, and important information</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot">🎯</div>
              <div class="timeline-content">
                <h4>Experience Begins!</h4>
                <p>Get ready for an incredible ${isJourney ? 'journey' : 'stay'} at ${bookingDetails.destination || bookingDetails.propertyName}. We can't wait to welcome you!</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.clientUrl}/booking-confirmation/${bookingDetails.bookingReference}" class="button">📱 View Full Booking Details</a>
          </div>

          <div class="reminder-box">
            <strong>📋 Important Reminders & Next Steps:</strong>
            <ul>
              <li><strong>Save this email</strong> - Keep this confirmation for your records and easy reference</li>
              <li><strong>Check your inbox</strong> - Watch for updates and pre-trip information (check spam/promotions folder)</li>
              ${bookingDetails.hostEmail ? `<li><strong>Connect with your host</strong> - Feel free to reach out to ${bookingDetails.hostEmail} with any questions</li>` : ''}
              <li><strong>Review policies</strong> - Check cancellation and modification policies in your dashboard</li>
              <li><strong>Travel insurance</strong> - Consider purchasing travel insurance for peace of mind</li>
              <li><strong>Questions?</strong> - Our support team is here 24/7 to help you</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 5px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px; font-weight: 600;">💙 Share Your Excitement!</p>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">Tell your friends and family about your upcoming adventure. We'd love to host them too!</p>
          </div>
        </div>

        <div class="footer">
          <div class="footer-links">
            <a href="${config.clientUrl}/dashboard">📊 My Bookings</a>
            <a href="${config.clientUrl}/support">💬 Help & Support</a>
            <a href="${config.clientUrl}/contact">📞 Contact Us</a>
          </div>
          <p class="brand">QuietSummit 🏔️</p>
          <p class="tagline">Find Your Peace, Discover Yourself</p>
          <p style="margin-top: 20px; font-weight: 600; color: #1f2937;">Thank you for choosing QuietSummit!</p>
          <p>We're honored to be part of your journey and committed to making it extraordinary.</p>
          <p style="margin-top: 15px;">Questions or need assistance? Reply to this email or contact us at <a href="mailto:${config.email.user}" style="color: #6366f1; text-decoration: none;">${config.email.user}</a></p>
          <p style="margin-top: 20px; font-size: 11px; color: #9ca3af;">This is an automated confirmation email. Please do not reply to this message. For support, use the contact information above.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: `🎉 Thank You! Booking Confirmed - ${bookingDetails.propertyName} | Ref: ${bookingRef}`,
        html,
        text: `Thank you for your booking!\n\nBooking Reference: ${bookingRef}\n${isJourney ? 'Journey' : 'Property'}: ${bookingDetails.propertyName}\n${isJourney ? 'Departure' : 'Check-in'}: ${isJourney ? bookingDetails.departureDate : bookingDetails.checkIn}\nTotal: ₹${bookingDetails.totalPrice}\n\nView details: ${config.clientUrl}/booking-confirmation/${bookingDetails.bookingReference}`,
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
            <li>📧 Direct email: Nagendrarajput9753@gmail.com</li>
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
