// import PDFDocument from 'pdfkit';
// import { config } from '../config/environment';

// interface BookingPDFData {
//     guestName: string;
//     propertyName: string;
//     checkIn?: string;
//     checkOut?: string;
//     totalPrice: number;
//     hostName?: string;
//     hostEmail?: string;
//     bookingReference: string;
//     numberOfTravelers: number;
//     travelers: Array<{
//         name: string;
//         age: number;
//         gender: string;
//     }>;
//     duration?: number;
//     destination?: string;
//     departureDate?: string;
//     roomPreference?: string;
//     subtotal?: number;
//     discount?: number;
//     paymentMethod?: string;
//     transactionId?: string;
// }

// export const generateBookingReceiptPDF = async (bookingDetails: BookingPDFData): Promise<Buffer> => {
//     return new Promise((resolve, reject) => {
//         try {
//             const doc = new PDFDocument({
//                 size: 'A4',
//                 margin: 0,
//                 bufferPages: true
//             });

//             const chunks: Buffer[] = [];

//             doc.on('data', (chunk) => chunks.push(chunk));
//             doc.on('end', () => resolve(Buffer.concat(chunks)));
//             doc.on('error', reject);

//             const isJourney = !!bookingDetails.departureDate;
//             const travelers = bookingDetails.travelers || [];
//             const bookingRef = bookingDetails.bookingReference;
//             const currencySymbol = 'Rs.';

//             // --- COLOR PALETTE ---
//             const colors = {
//                 primaryGreen: '#10b981',
//                 darkGreen: '#059669',
//                 primaryPurple: '#6366f1',
//                 textDark: '#1f2937',
//                 textMedium: '#6b7280',
//                 textLight: '#9ca3af',
//                 bgLight: '#f9fafb',
//                 bgSection: '#f3f4f6',
//                 border: '#e5e7eb',
//                 white: '#ffffff'
//             };

//             // --- HELPER FUNCTIONS ---

//             const drawSectionHeader = (text: string, y: number) => {
//                 doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.textDark).text(text, 30, y);
//                 doc.moveTo(30, y + 20)
//                     .lineTo(doc.page.width - 30, y + 20)
//                     .lineWidth(2)
//                     .stroke(colors.primaryGreen);
//                 return y + 35;
//             };

//             const drawInfoBox = (x: number, y: number, label: string, value: string, width: number) => {
//                 doc.roundedRect(x, y, width, 44, 6)
//                     .fillAndStroke(colors.bgLight, colors.border);

//                 doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.textMedium)
//                     .text(label.toUpperCase(), x + 12, y + 8);

//                 doc.fontSize(11).font('Helvetica').fillColor(colors.textDark)
//                     .text(value, x + 12, y + 24, {
//                         width: width - 24,
//                         lineBreak: false,
//                         ellipsis: true
//                     });
//             };

//             // --- HEADER SECTION ---
//             doc.rect(0, 0, doc.page.width, 100).fill(colors.primaryGreen);
//             doc.fontSize(10).font('Courier').fillColor(colors.white)
//                 .text('QUIETSUMMIT', 30, 30, { characterSpacing: 2 });
//             doc.fontSize(24).font('Helvetica-Bold').fillColor(colors.white)
//                 .text('Booking Confirmed', 30, 48);
//             doc.fontSize(12).font('Helvetica').fillColor(colors.white)
//                 .text(`Thank you, ${bookingDetails.guestName}!`, 30, 78);

//             // --- BOOKING REFERENCE CARD ---
//             let yPos = 120;
//             const cardHeight = 60;

//             doc.roundedRect(30, yPos, doc.page.width - 60, cardHeight, 8)
//                 .fill(colors.primaryPurple);

//             doc.fontSize(9).font('Helvetica').fillColor(colors.white)
//                 .text('BOOKING REFERENCE', 30, yPos + 12, {
//                     align: 'center',
//                     width: doc.page.width - 60,
//                     characterSpacing: 1
//                 });

//             doc.fontSize(18).font('Courier-Bold').fillColor(colors.white)
//                 .text(bookingRef, 30, yPos + 30, {
//                     align: 'center',
//                     width: doc.page.width - 60,
//                     characterSpacing: 2
//                 });

//             // --- JOURNEY/PROPERTY DETAILS ---
//             yPos += 90;
//             yPos = drawSectionHeader(`${isJourney ? 'Journey' : 'Booking'} Details`, yPos);

//             const col1X = 30;
//             const gap = 15;
//             const boxWidth = (doc.page.width - 60 - gap) / 2;
//             const col2X = col1X + boxWidth + gap;
//             const rowHeight = 55;

//             drawInfoBox(col1X, yPos, isJourney ? 'Journey' : 'Property', bookingDetails.propertyName, boxWidth);
//             if (bookingDetails.destination) {
//                 drawInfoBox(col2X, yPos, 'Destination', bookingDetails.destination, boxWidth);
//             }

//             yPos += rowHeight;
//             if (isJourney) {
//                 drawInfoBox(col1X, yPos, 'Departure Date', bookingDetails.departureDate || '-', boxWidth);
//                 drawInfoBox(col2X, yPos, 'Duration', `${bookingDetails.duration} days`, boxWidth);
//             } else {
//                 drawInfoBox(col1X, yPos, 'Check-in', bookingDetails.checkIn || '-', boxWidth);
//                 drawInfoBox(col2X, yPos, 'Check-out', bookingDetails.checkOut || '-', boxWidth);
//             }

//             yPos += rowHeight;
//             drawInfoBox(col1X, yPos, 'Travelers', `${bookingDetails.numberOfTravelers} ${bookingDetails.numberOfTravelers === 1 ? 'Guest' : 'Guests'}`, boxWidth);
//             if (bookingDetails.roomPreference) {
//                 const roomText = bookingDetails.roomPreference.charAt(0).toUpperCase() + bookingDetails.roomPreference.slice(1);
//                 drawInfoBox(col2X, yPos, 'Room', roomText, boxWidth);
//             }

//             // --- TRAVELERS SECTION ---
//             if (travelers.length > 0) {
//                 yPos += 80;
//                 yPos = drawSectionHeader('Travelers', yPos);

//                 travelers.forEach((traveler, index) => {
//                     doc.roundedRect(30, yPos, doc.page.width - 60, 45, 6)
//                         .fillAndStroke(colors.bgLight, colors.border);

//                     const circleX = 55;
//                     const circleY = yPos + 22.5;
//                     doc.circle(circleX, circleY, 12).fill(colors.primaryPurple);
//                     doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.white)
//                         .text(`${index + 1}`, circleX - 12, circleY - 4, { width: 24, align: 'center' });

//                     doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.textDark)
//                         .text(traveler.name, 85, yPos + 10);

//                     doc.fontSize(9).font('Helvetica').fillColor(colors.textMedium)
//                         .text(`${traveler.age} years • ${traveler.gender}`, 85, yPos + 26);

//                     yPos += 55;
//                 });
//             }

//             // --- PAYMENT SUMMARY ---
//             yPos += 30;

//             if (yPos > doc.page.height - 250) {
//                 doc.addPage();
//                 yPos = 50;
//             }

//             yPos = drawSectionHeader('Payment Summary', yPos);

//             const summaryBoxY = yPos;
//             const summaryContentX = 45;
//             const summaryValueX = doc.page.width - 45;

//             // Removed unused 'summaryWidth' here

//             doc.roundedRect(30, summaryBoxY, doc.page.width - 60, 180, 8)
//                 .fill(colors.bgSection);

//             let currentLineY = summaryBoxY + 20;

//             const drawSummaryLine = (label: string, value: string, isBold = false, color = colors.textDark, fontSize = 11) => {
//                 doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).fillColor(color === colors.textDark && !isBold ? colors.textMedium : color);
//                 doc.text(label, summaryContentX, currentLineY);
//                 doc.text(value, 30, currentLineY, { align: 'right', width: doc.page.width - 75 });
//                 currentLineY += 24;
//             };

//             if (bookingDetails.subtotal) {
//                 drawSummaryLine('Subtotal', `${currencySymbol} ${bookingDetails.subtotal.toLocaleString('en-IN')}`);
//             }

//             if (bookingDetails.discount && bookingDetails.discount > 0) {
//                 drawSummaryLine('Discount', `- ${currencySymbol} ${bookingDetails.discount.toLocaleString('en-IN')}`, false, colors.darkGreen);
//             }

//             currentLineY += 5;
//             doc.moveTo(summaryContentX, currentLineY - 12)
//                 .lineTo(summaryValueX, currentLineY - 12)
//                 .lineWidth(1)
//                 .stroke(colors.primaryGreen);
//             currentLineY += 5;

//             drawSummaryLine('Total Paid', `${currencySymbol} ${bookingDetails.totalPrice.toLocaleString('en-IN')}`, true, colors.darkGreen, 16);

//             currentLineY += 10;

//             drawSummaryLine('Payment Method', bookingDetails.paymentMethod || 'Razorpay', false, colors.textMedium, 10);

//             if (bookingDetails.transactionId) {
//                 doc.font('Helvetica').fontSize(10).fillColor(colors.textMedium).text('Transaction ID', summaryContentX, currentLineY);
//                 doc.font('Courier').text(bookingDetails.transactionId, 30, currentLineY, { align: 'right', width: doc.page.width - 75 });
//                 currentLineY += 24;
//             }

//             const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
//             drawSummaryLine('Date', dateStr, false, colors.textMedium, 10);

//             doc.font('Helvetica').fontSize(10).fillColor(colors.textMedium).text('Status', summaryContentX, currentLineY);
//             doc.font('Helvetica-Bold').fillColor(colors.darkGreen).text('PAID', 30, currentLineY, { align: 'right', width: doc.page.width - 75 });

//             // --- FOOTER ---
//             let footerY = Math.max(yPos + 200, doc.page.height - 100);

//             doc.rect(0, footerY, doc.page.width, 100).fill(colors.bgSection);

//             doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.textDark)
//                 .text('QuietSummit', 0, footerY + 25, { align: 'center' });

//             doc.fontSize(9).font('Helvetica').fillColor(colors.textMedium)
//                 .text('Find Your Peace, Discover Yourself', 0, footerY + 42, { align: 'center' });

//             if (config.email && config.email.user) {
//                 doc.fontSize(9).text(`Support: ${config.email.user}`, 0, footerY + 56, { align: 'center' });
//             }

//             doc.end();

//         } catch (error) {
//             console.error('PDF Generation Error:', error);
//             reject(error);
//         }
//     });
// };



import PDFDocument from 'pdfkit';
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
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 0,
                bufferPages: true
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const isJourney = !!bookingDetails.departureDate;
            const travelers = bookingDetails.travelers || [];
            const bookingRef = bookingDetails.bookingReference;
            const currencySymbol = 'Rs.';

            const colors = {
                primaryGreen: '#10b981',
                darkGreen: '#059669',
                primaryPurple: '#6366f1',
                textDark: '#1f2937',
                textMedium: '#6b7280',
                textLight: '#9ca3af',
                bgLight: '#f9fafb',
                bgSection: '#f3f4f6',
                border: '#e5e7eb',
                white: '#ffffff'
            };

            // --- HELPER: SECTION HEADERS ---
            // Reduced bottom padding from 35 to 28 to save space
            const drawSectionHeader = (text: string, y: number) => {
                doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.textDark).text(text, 30, y);
                doc.moveTo(30, y + 20)
                    .lineTo(doc.page.width - 30, y + 20)
                    .lineWidth(2)
                    .stroke(colors.primaryGreen);
                return y + 28;
            };

            // --- HELPER: INFO BOXES ---
            const drawInfoBox = (x: number, y: number, label: string, value: string, width: number) => {
                // Reduced height from 44 to 40
                doc.roundedRect(x, y, width, 40, 5)
                    .fillAndStroke(colors.bgLight, colors.border);

                doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.textMedium)
                    .text(label.toUpperCase(), x + 10, y + 8);

                doc.fontSize(10).font('Helvetica').fillColor(colors.textDark)
                    .text(value, x + 10, y + 22, {
                        width: width - 20,
                        lineBreak: false,
                        ellipsis: true
                    });
            };

            // --- HEADER (Compact) ---
            // Reduced header height from 100 to 85
            doc.rect(0, 0, doc.page.width, 85).fill(colors.primaryGreen);

            doc.fontSize(10).font('Courier').fillColor(colors.white)
                .text('QUIETSUMMIT', 30, 25, { characterSpacing: 2 });
            doc.fontSize(22).font('Helvetica-Bold').fillColor(colors.white)
                .text('Booking Confirmed', 30, 42);
            doc.fontSize(11).font('Helvetica').fillColor(colors.white)
                .text(`Thank you, ${bookingDetails.guestName}!`, 30, 68);

            // --- BOOKING REFERENCE (Compact) ---
            let yPos = 100; // Moved up from 120
            const cardHeight = 50; // Reduced from 60

            doc.roundedRect(30, yPos, doc.page.width - 60, cardHeight, 6)
                .fill(colors.primaryPurple);

            doc.fontSize(8).font('Helvetica').fillColor(colors.white)
                .text('BOOKING REFERENCE', 30, yPos + 10, {
                    align: 'center',
                    width: doc.page.width - 60,
                    characterSpacing: 1
                });

            doc.fontSize(16).font('Courier-Bold').fillColor(colors.white)
                .text(bookingRef, 30, yPos + 25, {
                    align: 'center',
                    width: doc.page.width - 60,
                    characterSpacing: 2
                });

            // --- JOURNEY DETAILS ---
            yPos += 75; // Reduced gap (was 90)
            yPos = drawSectionHeader(`${isJourney ? 'Journey' : 'Booking'} Details`, yPos);

            const col1X = 30;
            const gap = 15;
            const boxWidth = (doc.page.width - 60 - gap) / 2;
            const col2X = col1X + boxWidth + gap;
            const rowHeight = 48; // Reduced from 55

            // Row 1
            drawInfoBox(col1X, yPos, isJourney ? 'Journey' : 'Property', bookingDetails.propertyName, boxWidth);
            if (bookingDetails.destination) {
                drawInfoBox(col2X, yPos, 'Destination', bookingDetails.destination, boxWidth);
            }

            // Row 2
            yPos += rowHeight;
            if (isJourney) {
                drawInfoBox(col1X, yPos, 'Departure Date', bookingDetails.departureDate || '-', boxWidth);
                drawInfoBox(col2X, yPos, 'Duration', `${bookingDetails.duration} days`, boxWidth);
            } else {
                drawInfoBox(col1X, yPos, 'Check-in', bookingDetails.checkIn || '-', boxWidth);
                drawInfoBox(col2X, yPos, 'Check-out', bookingDetails.checkOut || '-', boxWidth);
            }

            // Row 3
            yPos += rowHeight;
            drawInfoBox(col1X, yPos, 'Travelers', `${bookingDetails.numberOfTravelers} ${bookingDetails.numberOfTravelers === 1 ? 'Guest' : 'Guests'}`, boxWidth);
            if (bookingDetails.roomPreference) {
                const roomText = bookingDetails.roomPreference.charAt(0).toUpperCase() + bookingDetails.roomPreference.slice(1);
                drawInfoBox(col2X, yPos, 'Room', roomText, boxWidth);
            }

            // --- TRAVELERS ---
            // Much tighter gap here (was 80, now 25)
            if (travelers.length > 0) {
                yPos += 55;
                yPos = drawSectionHeader('Travelers', yPos);

                travelers.forEach((traveler, index) => {
                    // Traveler Card
                    doc.roundedRect(30, yPos, doc.page.width - 60, 40, 5)
                        .fillAndStroke(colors.bgLight, colors.border);

                    const circleX = 50;
                    const circleY = yPos + 20;
                    doc.circle(circleX, circleY, 11).fill(colors.primaryPurple);
                    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.white)
                        .text(`${index + 1}`, circleX - 10, circleY - 4, { width: 20, align: 'center' });

                    doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.textDark)
                        .text(traveler.name, 75, yPos + 8);

                    doc.fontSize(9).font('Helvetica').fillColor(colors.textMedium)
                        .text(`${traveler.age} years • ${traveler.gender}`, 75, yPos + 24);

                    yPos += 48; // Reduced traveler row spacing
                });
            }

            // --- PAYMENT SUMMARY ---
            // Gap before payment (was 30, now 20)
            yPos += 15;

            // Check for overflow (unlikely now with compression, but good safety)
            if (yPos > doc.page.height - 200) {
                doc.addPage();
                yPos = 50;
            }

            yPos = drawSectionHeader('Payment Summary', yPos);

            const summaryBoxY = yPos;
            const summaryHeight = 150; // Reduced from 180
            const summaryContentX = 45;

            doc.roundedRect(30, summaryBoxY, doc.page.width - 60, summaryHeight, 6)
                .fill(colors.bgSection);

            let currentLineY = summaryBoxY + 15;

            const drawSummaryLine = (label: string, value: string, isBold = false, color = colors.textDark, fontSize = 10) => {
                doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).fillColor(color === colors.textDark && !isBold ? colors.textMedium : color);
                doc.text(label, summaryContentX, currentLineY);
                doc.text(value, 30, currentLineY, { align: 'right', width: doc.page.width - 75 });
                currentLineY += 20; // Tighter line spacing
            };

            if (bookingDetails.subtotal) {
                drawSummaryLine('Subtotal', `${currencySymbol} ${bookingDetails.subtotal.toLocaleString('en-IN')}`);
            }

            if (bookingDetails.discount && bookingDetails.discount > 0) {
                drawSummaryLine('Discount', `- ${currencySymbol} ${bookingDetails.discount.toLocaleString('en-IN')}`, false, colors.darkGreen);
            }

            // Separator
            currentLineY += 5;
            doc.moveTo(summaryContentX, currentLineY - 10)
                .lineTo(doc.page.width - 45, currentLineY - 10)
                .lineWidth(1)
                .stroke(colors.primaryGreen);
            currentLineY += 5;

            drawSummaryLine('Total Paid', `${currencySymbol} ${bookingDetails.totalPrice.toLocaleString('en-IN')}`, true, colors.darkGreen, 14);
            currentLineY += 8;

            drawSummaryLine('Payment Method', bookingDetails.paymentMethod || 'Razorpay', false, colors.textMedium);

            if (bookingDetails.transactionId) {
                doc.font('Helvetica').fontSize(10).fillColor(colors.textMedium).text('Transaction ID', summaryContentX, currentLineY);
                doc.font('Courier').text(bookingDetails.transactionId, 30, currentLineY, { align: 'right', width: doc.page.width - 75 });
                currentLineY += 20;
            }

            const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            drawSummaryLine('Date', dateStr, false, colors.textMedium);

            doc.font('Helvetica').fontSize(10).fillColor(colors.textMedium).text('Status', summaryContentX, currentLineY);
            doc.font('Helvetica-Bold').fillColor(colors.darkGreen).text('PAID', 30, currentLineY, { align: 'right', width: doc.page.width - 75 });

            // --- FOOTER ---
            // Place footer at the absolute bottom of the page
            const footerHeight = 80;
            const footerY = doc.page.height - footerHeight;

            // Optional: Draw a line separating content from footer if they get close
            // doc.moveTo(0, footerY).lineTo(doc.page.width, footerY).stroke(colors.border);

            doc.rect(0, footerY, doc.page.width, footerHeight).fill(colors.bgSection);

            doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.textDark)
                .text('QuietSummit', 0, footerY + 20, { align: 'center' });

            doc.fontSize(9).font('Helvetica').fillColor(colors.textMedium)
                .text('Find Your Peace, Discover Yourself', 0, footerY + 36, { align: 'center' });

            if (config.email && config.email.user) {
                doc.fontSize(9).text(`Support: Nagendrarajput9753@gmail.com`, 0, footerY + 48, { align: 'center' });
            }

            doc.end();

        } catch (error) {
            console.error('PDF Generation Error:', error);
            reject(error);
        }
    });
};