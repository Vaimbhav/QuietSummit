import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import IndianCity from '../models/IndianCity';
import { INDIAN_CITIES } from '../data/indianCitiesData';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quietsummit';

async function seedIndianCities() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('✅ Connected to MongoDB for seeding');

        // Check if cities already exist
        const existingCount = await IndianCity.countDocuments();

        if (existingCount > 0) {
            logger.info(`📊 Database already has ${existingCount} cities. Skipping seed.`);
            logger.info('💡 To reseed, first run: db.indiancities.deleteMany({})');
            process.exit(0);
        }

        // Insert all cities
        logger.info(`📍 Seeding ${INDIAN_CITIES.length} Indian cities...`);
        await IndianCity.insertMany(INDIAN_CITIES);

        logger.info(`✅ Successfully seeded ${INDIAN_CITIES.length} Indian cities!`);
        logger.info('📋 Cities include: Major metros, towns, hill stations, and popular localities');

        // Show sample cities
        const samples = await IndianCity.find().limit(5);
        logger.info('🏙️  Sample cities:');
        samples.forEach(city => {
            logger.info(`   - ${city.city}, ${city.state} (${city.type})`);
        });

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error seeding cities:', error);
        process.exit(1);
    }
}

// Run the seed function
seedIndianCities();
