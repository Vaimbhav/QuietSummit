import { Request, Response } from 'express'
import Contact from '../models/Contact'
import logger from '../utils/logger'
import { sendContactFormAcknowledgment } from '../services/emailService'

export const createContact = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, subject, message } = req.body

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
        })

        // Send acknowledgment email (non-blocking)
        sendContactFormAcknowledgment(email, name, subject).catch((error) => {
            logger.error('Failed to send contact acknowledgment email:', error)
        })

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: contact,
        })
    } catch (error) {
        logger.error('Error creating contact:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to submit contact form',
        })
    }
}

export const getAllContacts = async (_req: Request, res: Response) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 })

        res.json({
            success: true,
            count: contacts.length,
            data: contacts,
        })
    } catch (error) {
        logger.error('Error fetching contacts:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contacts',
        })
    }
}
