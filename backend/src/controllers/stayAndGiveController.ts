import { Request, Response } from 'express'
import StayAndGive from '../models/StayAndGive'
import { sendEmail } from '../services/emailService'
import logger from '../utils/logger'

/**
 * Submit Stay & Give application
 */
export const submitApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const applicationData = req.body

        // Validate required fields
        if (!applicationData.motivationLetter || applicationData.motivationLetter.length < 200) {
            res.status(400).json({
                success: false,
                message: 'Motivation letter must be at least 200 characters long'
            })
            return
        }

        if (!applicationData.skills || applicationData.skills.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please select at least one skill'
            })
            return
        }

        // Create new application
        const application = new StayAndGive({
            ...applicationData,
            applicant: (req.user as any)?._id || (req.user as any)?.id, // Optional - may not be logged in
            submittedAt: new Date(),
            status: 'pending'
        })

        await application.save()

        // Send confirmation email to applicant (if email provided)
        if (applicationData.emergencyContact?.email) {
            try {
                await sendEmail({
                    to: applicationData.emergencyContact.email,
                    subject: 'Stay & Give Application Received - QuietSummit',
                    html: `
                        <h2>Thank you for applying to Stay & Give!</h2>
                        <p>We've received your application and our team will review it carefully.</p>
                        <p>You can expect to hear back from us within 7-10 business days.</p>
                        <p>Application ID: ${application._id}</p>
                        <br />
                        <p>Best regards,<br />The QuietSummit Team</p>
                    `
                })
            } catch (emailError) {
                logger.error('Failed to send confirmation email:', emailError)
                // Don't fail the application submission if email fails
            }
        }

        // Send notification email to admin
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@quietsummit.com',
                subject: `New Stay & Give Application - ${application._id}`,
                html: `
                    <h2>New Stay & Give Application</h2>
                    <p><strong>Application ID:</strong> ${application._id}</p>
                    <p><strong>Skills:</strong> ${applicationData.skills.join(', ')}</p>
                    <p><strong>Motivation (first 200 chars):</strong></p>
                    <p>${applicationData.motivationLetter.substring(0, 200)}...</p>
                    <p><a href="${process.env.FRONTEND_URL}/admin/stay-and-give/${application._id}">View Full Application</a></p>
                `
            })
        } catch (emailError) {
            logger.error('Failed to send admin notification email:', emailError)
        }

        logger.info(`New Stay & Give application submitted: ${application._id}`)

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: application._id
        })
    } catch (error) {
        logger.error('Error submitting Stay & Give application:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to submit application. Please try again.'
        })
    }
}

/**
 * Get all applications (admin only)
 */
export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const { status, page = 1, limit = 20 } = req.query

        const query: any = {}
        if (status && status !== 'all') {
            query.status = status
        }

        const applications = await StayAndGive.find(query)
            .sort({ submittedAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('userId', 'name email')

        const total = await StayAndGive.countDocuments(query)

        res.json({
            success: true,
            applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        logger.error('Error fetching Stay & Give applications:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        })
    }
}

/**
 * Get single application by ID (admin only)
 */
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        const application = await StayAndGive.findById(id).populate('userId', 'name email')

        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found'
            })
            return
        }

        res.json({
            success: true,
            application
        })
    } catch (error) {
        logger.error('Error fetching Stay & Give application:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application'
        })
    }
}

/**
 * Update application status (admin only)
 */
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { status, reviewNotes } = req.body

        const validStatuses = ['pending', 'under-review', 'approved', 'rejected', 'waitlisted']
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
            return
        }

        const application = await StayAndGive.findByIdAndUpdate(
            id,
            {
                status,
                reviewNotes,
                reviewedAt: new Date(),
                reviewedBy: (req.user as any)?._id || (req.user as any)?.id
            },
            { new: true }
        )

        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found'
            })
            return
        }

        // Send status update email to applicant
        if (application.emergencyContact?.email) {
            try {
                let emailContent = ''
                switch (status) {
                    case 'approved':
                        emailContent = 'Congratulations! Your Stay & Give application has been approved. We will be in touch shortly with next steps.'
                        break
                    case 'rejected':
                        emailContent = 'Thank you for your interest in Stay & Give. Unfortunately, we are unable to move forward with your application at this time.'
                        break
                    case 'waitlisted':
                        emailContent = 'Your Stay & Give application has been placed on our waitlist. We will contact you if a spot becomes available.'
                        break
                    case 'under-review':
                        emailContent = 'Your Stay & Give application is currently under review. We will notify you of our decision soon.'
                        break
                }

                await sendEmail({
                    to: application.emergencyContact.email,
                    subject: `Stay & Give Application Update - QuietSummit`,
                    html: `
                        <h2>Application Status Update</h2>
                        <p>${emailContent}</p>
                        <p>Application ID: ${application._id}</p>
                        <br />
                        <p>Best regards,<br />The QuietSummit Team</p>
                    `
                })
            } catch (emailError) {
                logger.error('Failed to send status update email:', emailError)
            }
        }

        logger.info(`Stay & Give application ${id} status updated to ${status}`)

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application
        })
    } catch (error) {
        logger.error('Error updating Stay & Give application status:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update application status'
        })
    }
}
