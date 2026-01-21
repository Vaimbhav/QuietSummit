import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import logger from '../utils/logger';
import { generateBookingReceiptPDF } from './pdfService';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.password,
    },
});

// Verify transporter configuration
transporter.verify((error: Error | null) => {
    if (error) {
        logger.error('Email transporter verification failed:', error);
        console.error('Email config:', {
            host: config.email.host,
            port: config.email.port,
            user: config.email.user,
            secure: config.email.port === 465
        });
    } else {
        logger.info(`Email service is ready sent from ${config.email.user}`);
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

/**
 * Send email using configured transport
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        const mailOptions = {
            from: `"QuietSummit" <${config.email.from || config.email.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || '',
            attachments: options.attachments,
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
    const isJourney = !!bookingDetails.departureDate;

    // Generate PDF Receipt
    let pdfBuffer: Buffer | undefined;
    try {
        pdfBuffer = await generateBookingReceiptPDF({
            guestName: bookingDetails.guestName,
            propertyName: bookingDetails.propertyName,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            totalPrice: bookingDetails.totalPrice,
            hostName: bookingDetails.hostName,
            hostEmail: bookingDetails.hostEmail,
            bookingReference: bookingRef,
            numberOfTravelers: bookingDetails.numberOfTravelers || 1,
            travelers: bookingDetails.travelers || [],
            duration: bookingDetails.duration,
            destination: bookingDetails.destination,
            departureDate: bookingDetails.departureDate,
            roomPreference: bookingDetails.roomPreference,
            subtotal: bookingDetails.subtotal,
            discount: bookingDetails.discount,
            paymentMethod: bookingDetails.paymentMethod,
            transactionId: bookingDetails.transactionId,
        });
    } catch (error) {
        logger.error('Failed to generate PDF for email:', error);
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; -webkit-font-smoothing: antialiased; }
        .container { max-width: 720px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; }
        
        /* Header */
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 48px 30px; text-align: center; color: white; position: relative; }
        .logo { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 4px; margin-bottom: 20px; text-transform: uppercase; color: #ffffff; backdrop-filter: blur(4px); }
        .header h1 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .subheader { font-size: 15px; color: #e6fffa; margin-top: 10px; font-weight: 500; opacity: 0.95; }
        
        /* Welcome Block */
        .welcome-block { background: #f0fdf4; padding: 30px; text-align: center; border-bottom: 1px solid #dcfce7; }
        .welcome-title { color: #065f46; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .welcome-text { color: #047857; font-size: 15px; margin: 0; max-width: 500px; margin-inline: auto; line-height: 1.5; }
        .highlight { background: #fef08a; padding: 0 4px; border-radius: 2px; color: #854d0e; font-weight: 600; }
        .ref-badge { display: inline-block; background: white; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 700; color: #059669; border: 1px solid #6ee7b7; margin-top: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); letter-spacing: 0.02em; }

        .content { padding: 40px 32px; }

        /* Grid Layout */
        .grid-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 40px; }
        .grid-col { flex: 1; min-width: 280px; }
        
        /* Cards */
        .card-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; display: block; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; height: 100%; box-sizing: border-box; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        
        /* Details List */
        .detail-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px dashed #f3f4f6; }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; font-size: 13px; font-weight: 600; min-width: 100px; padding-right: 12px; }
        .detail-value { color: #111827; font-size: 13px; font-weight: 600; text-align: right; flex: 1; line-height: 1.4; }
        
        /* Price List */
        .price-list .detail-item { padding: 10px 0; }
        .price-total { margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e5e7eb; display: flex; justify-content: space-between; align-items: baseline; }
        .total-label { font-size: 15px; font-weight: 700; color: #374151; }
        .total-value { font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.03em; }
        
        .receipt-meta { margin-top: 24px; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #f3f4f6; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #6b7280; }
        .meta-row:last-child { margin-bottom: 0; }
        .status-badge { color: #047857; font-weight: 700; background: #d1fae5; padding: 3px 10px; border-radius: 4px; font-size: 11px; letter-spacing: 0.03em; text-transform: uppercase; }

        /* Timeline */
        .timeline-section { margin-top: 30px; padding: 0 10px; }
        .timeline-header { text-align: center; margin-bottom: 30px; }
        .timeline-title { font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
        
        .timeline-item { display: flex; gap: 24px; margin-bottom: 30px; position: relative; }
        .timeline-item:last-child { margin-bottom: 0; }
        .timeline-icon-container { position: relative; z-index: 2; width: 44px; height: 44px; flex-shrink: 0; }
        .timeline-icon { width: 44px; height: 44px; background: white; border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #059669; font-weight: 800; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15); }
        .timeline-line { position: absolute; left: 21px; top: 44px; bottom: -30px; width: 2px; background: #e5e7eb; z-index: 1; }
        .timeline-item:last-child .timeline-line { display: none; }
        
        /* Timeline checkmark fix */
        .checkmark { display: inline-block; width: 6px; height: 10px; border: solid #059669; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -3px; }
        
        .timeline-body { padding-top: 2px; }
        .timeline-body h4 { margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #111827; }
        .timeline-body p { margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5; }

        /* CTA */
        .cta-section { text-align: center; margin: 50px 0 20px; border-top: 1px solid #f3f4f6; padding-top: 40px; }
        .btn-primary { background: #059669; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3), 0 2px 4px -1px rgba(5, 150, 105, 0.06); border: 1px solid #047857; letter-spacing: 0.01em; }
        .btn-primary:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); }
        
        /* Footer */
        .footer { background: #f9fafb; padding: 48px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-brand { color: #111827; font-weight: 800; font-size: 16px; margin-bottom: 8px; letter-spacing: -0.02em; }
        .footer-tagline { color: #6b7280; font-size: 14px; margin-bottom: 32px; font-style: italic; }
        .footer-links { margin-bottom: 32px; }
        .footer-links a { color: #4b5563; text-decoration: none; font-size: 13px; margin: 0 12px; font-weight: 600; transition: color 0.15s; }
        .footer-links a:hover { color: #059669; }
        .copyright { color: #9ca3af; font-size: 12px; line-height: 1.6; }
        
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; border: none; }
            .content { padding: 32px 20px; }
            .card { padding: 20px; }
            .header h1 { font-size: 26px; }
            .total-value { font-size: 22px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">QUIETSUMMIT</div>
          <h1>Adventure Awaits!</h1>
          <div class="subheader">Your booking is secure &amp; confirmed</div>
        </div>
        
        <div class="welcome-block">
          <div class="welcome-title">Hi ${bookingDetails.guestName},</div>
          <div class="welcome-text">Get ready for an unforgettable experience at <span class="highlight">${bookingDetails.propertyName}</span> in ${bookingDetails.destination}.</div>
          <div class="ref-badge">Ref: ${bookingRef}</div>
        </div>

        <div class="content">
          
          <div class="grid-row">
            <!-- Booking Details Card -->
            <div class="grid-col">
              <span class="card-label">Booking Details</span>
              <div class="card">
                <div class="detail-item">
                  <span class="detail-label">${isJourney ? 'Journey' : 'Property'}</span>
                  <span class="detail-value">${bookingDetails.propertyName}</span>
                </div>
                ${bookingDetails.destination ? `
                <div class="detail-item">
                  <span class="detail-label">Destination</span>
                  <span class="detail-value">${bookingDetails.destination}</span>
                </div>` : ''}
                <div class="detail-item">
                  <span class="detail-label">${isJourney ? 'Departure' : 'Check-in'}</span>
                  <span class="detail-value">${isJourney ? bookingDetails.departureDate : bookingDetails.checkIn}</span>
                </div>
                ${!isJourney ? `
                <div class="detail-item">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${bookingDetails.checkOut}</span>
                </div>` : ''}
                <div class="detail-item">
                  <span class="detail-label">Travelers</span>
                  <span class="detail-value">${bookingDetails.numberOfTravelers || 1} ${(bookingDetails.numberOfTravelers || 1) === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                ${bookingDetails.hostName ? `
                <div class="detail-item">
                  <span class="detail-label">Host</span>
                  <span class="detail-value">${bookingDetails.hostName}</span>
                </div>` : ''}
              </div>
            </div>

            <!-- Receipt Card -->
            <div class="grid-col">
              <span class="card-label">Payment Receipt</span>
              <div class="card">
                <div class="price-list">
                  ${bookingDetails.subtotal ? `
                  <div class="detail-item">
                    <span class="detail-label">Subtotal</span>
                    <span class="detail-value">₹${bookingDetails.subtotal.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  ${bookingDetails.discount && bookingDetails.discount > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label" style="color: #059669;">Discount</span>
                    <span class="detail-value" style="color: #059669;">- ₹${bookingDetails.discount.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  
                  <div class="price-total">
                    <span class="total-label">Total Paid</span>
                    <span class="total-value">₹${bookingDetails.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div class="receipt-meta">
                    <div class="meta-row">
                      <span>Status</span>
                      <span class="status-badge">PAID</span>
                    </div>
                    <div class="meta-row">
                      <span>Date</span>
                      <span>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    ${bookingDetails.transactionId ? `
                    <div class="meta-row">
                      <span>Trans ID</span>
                      <span style="font-family: monospace; letter-spacing: -0.5px;">${bookingDetails.transactionId.slice(-8)}...</span>
                    </div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline-section">
            <div class="timeline-header">
              <div class="timeline-title">What Happens Next?</div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon-container">
                <div class="timeline-icon"><div class="checkmark"></div></div>
                <div class="timeline-line"></div>
              </div>
              <div class="timeline-body">
                <h4>Booking Confirmed</h4>
                <p>You're all set! A PDF receipt is attached to this email for your records.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon-container">
                <div class="timeline-icon">2</div>
                <div class="timeline-line"></div>
              </div>
              <div class="timeline-body">
                <h4>Prepare for your Trip</h4>
                <p>We'll send you a comprehensive packing list &amp; local guide 30 days before departure.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon-container">
                <div class="timeline-icon">3</div>
              </div>
              <div class="timeline-body">
                <h4>Check-in Details</h4>
                <p>Unlock your final itinerary and check-in instructions 7 days before your trip.</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <a href="${config.clientUrl}/booking-confirmation/${bookingDetails.bookingReference}" class="btn-primary">Manage My Booking</a>
            <p style="margin-top: 15px; font-size: 13px; color: #6b7280;">Need to make changes? You can update your booking online.</p>
          </div>

        </div>

        <div class="footer">
          <div class="footer-brand">QUIETSUMMIT</div>
          <div class="footer-tagline">Find Your Peace, Discover Yourself</div>
          
          <div class="footer-links">
            <a href="${config.clientUrl}/dashboard">My Trips</a>
            <a href="${config.clientUrl}/support">Help Center</a>
            <a href="${config.clientUrl}/contact">Contact Us</a>
          </div>
          
          <div class="copyright">
            &copy; ${new Date().getFullYear()} QuietSummit Inc. All rights reserved.<br>
            Sent with 💚 from the mountains.
          </div>
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
        attachments: pdfBuffer ? [{
            filename: `QuietSummit-Receipt-${bookingRef}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }] : undefined,
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
