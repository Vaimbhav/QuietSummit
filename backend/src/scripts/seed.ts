import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { config } from '../config/environment'
import Journey from '../models/Journey'
import logger from '../utils/logger'

const seedJourneys = async () => {
    try {
        // Connect to MongoDB
        if (!config.mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables')
        }
        await mongoose.connect(config.mongoUri)
        logger.info('Connected to MongoDB for seeding')

        // Read seed data
        const seedFilePath = path.join(__dirname, '../../seed_journeys.json')
        const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'))

        // Clear existing journeys
        await Journey.deleteMany({})
        logger.info('Cleared existing journeys')

        // Insert new journeys
        await Journey.insertMany(seedData)
        logger.info(`Successfully seeded ${seedData.length} journeys`)

        process.exit(0)
    } catch (error) {
        logger.error('Error seeding database:', error)
        process.exit(1)
    }
}

seedJourneys()
