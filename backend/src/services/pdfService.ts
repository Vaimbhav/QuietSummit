import puppeteer from 'puppeteer';
import { config } from '../config/environment';

interface BookingPDFData {
    guestName: string;
    propertyName: string;
    checkIn?: string;
    checkOut?: string;
    totalPrice: number;
    hostName?: string;
    hostEmail?: string;
    bookingReference: string;
    numberOfTravelers: number;
    travelers: Array<{
        name: string;
        age: number;
        gender: string;
    }>;
    duration?: number;
    destination?: string;
    departureDate?: string;
    roomPreference?: string;
    subtotal?: number;
    discount?: number;
    paymentMethod?: string;
    transactionId?: string;
}

export const generateBookingReceiptPDF = async (bookingDetails: BookingPDFData): Promise<Buffer> => {
    const isJourney = !!bookingDetails.departureDate;
    const travelers = bookingDetails.travelers || [];
    const bookingRef = bookingDetails.bookingReference;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 12px; background: white; font-size: 13px; }
        .container { max-width: 700px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px 18px; text-align: center; }
        .header h1 { margin: 0 0 4px 0; font-size: 24px; }
        .header p { margin: 0; font-size: 14px; opacity: 0.95; }
        .logo-text { font-size: 12px; font-weight: 600; letter-spacing: 2px; opacity: 0.9; margin-bottom: 8px; }
        .content { padding: 18px; }
        .reference-card { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 12px; border-radius: 8px; text-align: center; margin: 12px 0; }
        .reference-card .label { font-size: 11px; opacity: 0.9; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .reference-card .value { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
        .section-title { font-size: 15px; font-weight: bold; color: #1f2937; margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid #10b981; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
        .info-item { background: #f9fafb; padding: 8px; border-radius: 5px; }
        .info-item strong { display: block; color: #6b7280; font-size: 11px; margin-bottom: 3px; text-transform: uppercase; }
        .info-item span { color: #1f2937; font-weight: 600; font-size: 13px; }
        .traveler-card { background: #f9fafb; padding: 8px; border-radius: 5px; margin: 6px 0; display: flex; align-items: center; gap: 10px; }
        .traveler-number { width: 28px; height: 28px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 13px; }
        .traveler-info { flex: 1; }
        .traveler-name { font-weight: bold; color: #1f2937; font-size: 13px; }
        .traveler-details { font-size: 11px; color: #6b7280; }
        .price-summary { background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 12px 0; }
        .price-row { display: flex; justify-content: space-between; padding: 6px 0; color: #4b5563; font-size: 13px; }
        .price-total { border-top: 2px solid #10b981; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: bold; color: #059669; }
        .footer { background: #f9fafb; padding: 12px; text-align: center; border-top: 2px solid #e5e7eb; margin-top: 16px; }
        .footer p { margin: 4px 0; color: #6b7280; font-size: 11px; }
        .footer .brand { font-weight: 700; color: #1f2937; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">QUIETSUMMIT</div>
          <h1>Booking Confirmed</h1>
          <p>Thank you, ${bookingDetails.guestName}!</p>
        </div>

        <div class="content">
          <div class="reference-card">
            <div class="label">Booking Reference</div>
            <div class="value">${bookingRef}</div>
          </div>

          <h3 class="section-title">${isJourney ? 'Journey' : 'Booking'} Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>${isJourney ? 'Journey' : 'Property'}</strong>
              <span>${bookingDetails.propertyName}</span>
            </div>
            ${bookingDetails.destination ? `
            <div class="info-item">
              <strong>Destination</strong>
              <span>${bookingDetails.destination}</span>
            </div>` : ''}
            ${isJourney ? `
            <div class="info-item">
              <strong>Departure Date</strong>
              <span>${bookingDetails.departureDate}</span>
            </div>
            <div class="info-item">
              <strong>Duration</strong>
              <span>${bookingDetails.duration} days</span>
            </div>` : `
            <div class="info-item">
              <strong>Check-in</strong>
              <span>${bookingDetails.checkIn}</span>
            </div>
            <div class="info-item">
              <strong>Check-out</strong>
              <span>${bookingDetails.checkOut}</span>
            </div>`}
            <div class="info-item">
              <strong>Travelers</strong>
              <span>${bookingDetails.numberOfTravelers || 1} ${(bookingDetails.numberOfTravelers || 1) === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            ${bookingDetails.roomPreference ? `
            <div class="info-item">
              <strong>Room</strong>
              <span style="text-transform: capitalize;">${bookingDetails.roomPreference}</span>
            </div>` : ''}
          </div>

          ${travelers.length > 0 ? `
          <h3 class="section-title">Travelers</h3>
          ${travelers.map((traveler, index) => `
          <div class="traveler-card">
            <div class="traveler-number">${index + 1}</div>
            <div class="traveler-info">
              <div class="traveler-name">${traveler.name}</div>
              <div class="traveler-details">${traveler.age} years • ${traveler.gender.charAt(0).toUpperCase() + traveler.gender.slice(1)}</div>
            </div>
          </div>`).join('')}
          ` : ''}

          <h3 class="section-title">Payment Summary</h3>
          <div class="price-summary">
            ${bookingDetails.subtotal ? `
            <div class="price-row">
              <span>Subtotal</span>
              <span>₹${bookingDetails.subtotal.toLocaleString('en-IN')}</span>
            </div>` : ''}
            ${bookingDetails.discount && bookingDetails.discount > 0 ? `
            <div class="price-row" style="color: #059669;">
              <span>Discount</span>
              <span>- ₹${bookingDetails.discount.toLocaleString('en-IN')}</span>
            </div>` : ''}
            <div class="price-row price-total">
              <span>Total Paid</span>
              <span>₹${bookingDetails.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            ${bookingDetails.paymentMethod ? `
            <div class="price-row" style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px; font-size: 11px;">
              <span>Payment Method</span>
              <span>${bookingDetails.paymentMethod}</span>
            </div>` : ''}
            ${bookingDetails.transactionId ? `
            <div class="price-row" style="font-size: 11px;">
              <span>Transaction ID</span>
              <span style="font-family: monospace;">${bookingDetails.transactionId}</span>
            </div>` : ''}
            <div class="price-row" style="font-size: 11px;">
              <span>Date</span>
              <span>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div class="price-row" style="font-size: 11px;">
              <span>Status</span>
              <span style="color: #059669; font-weight: 700;">✓ PAID</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p class="brand">QuietSummit</p>
          <p>Find Your Peace, Discover Yourself</p>
          <p style="margin-top: 8px;">For support, contact us at ${config.email.user}</p>
          <p style="margin-top: 8px; font-size: 10px; color: #9ca3af;">This is an official booking receipt from QuietSummit</p>
        </div>
      </div>
    </body>
    </html>
  `;

    let browser;
    try {
        // Production-ready Puppeteer configuration
        const isProduction = process.env.NODE_ENV === 'production';
        
        const launchOptions: any = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-web-security',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Important for serverless/container environments
                '--disable-extensions'
            ],
            timeout: 60000 // 60 seconds timeout
        };

        // For production (Render, Railway, etc.), use system Chrome if available
        if (isProduction) {
            // Try to find Chrome executable in common locations
            const possiblePaths = [
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/google-chrome',
                process.env.CHROME_BIN,
                process.env.PUPPETEER_EXECUTABLE_PATH
            ].filter(Boolean);

            for (const path of possiblePaths) {
                try {
                    const fs = require('fs');
                    if (path && fs.existsSync(path)) {
                        launchOptions.executablePath = path;
                        console.log(`Using Chrome at: ${path}`);
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }
        }

        console.log('Launching Puppeteer with options:', { 
            headless: launchOptions.headless,
            executablePath: launchOptions.executablePath || 'default',
            argsCount: launchOptions.args.length
        });

        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();
        await page.setContent(html, { 
            waitUntil: 'networkidle0',
            timeout: 30000 // 30 seconds timeout
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            timeout: 30000 // 30 seconds timeout
        });

        await browser.close();
        console.log('PDF generated successfully, size:', pdf.length, 'bytes');
        return Buffer.from(pdf);
    } catch (error: any) {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
        console.error('PDF generation error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};
