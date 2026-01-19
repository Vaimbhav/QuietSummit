import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Property } from '../models/Property';
import IndianCity from '../models/IndianCity';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quietsummit';

async function syncExistingCities() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('✅ Connected to MongoDB');

        // Get all unique cities from approved properties
        const uniqueCities = await Property.aggregate([
            {
                $match: {
                    status: 'approved',
                    'address.city': { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: {
                        city: '$address.city',
                        state: '$address.state'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        logger.info(`📊 Found ${uniqueCities.length} unique cities in properties`);

        let added = 0;
        let skipped = 0;

        for (const cityData of uniqueCities) {
            const { city, state } = cityData._id;

            if (!city || city.trim() === '') {
                skipped++;
                continue;
            }

            // Check if city already exists in IndianCity collection
            const existingCity = await IndianCity.findOne({
                city: { $regex: new RegExp(`^${city.trim()}$`, 'i') }
            });

            if (!existingCity) {
                await IndianCity.create({
                    city: city.trim(),
                    state: state?.trim() || 'Unknown',
                    type: 'city',
                });
                logger.info(`  ➕ Added: ${city}, ${state || 'Unknown'} (${cityData.count} properties)`);
                added++;
            } else {
                skipped++;
            }
        }

        logger.info(`\n✅ Sync complete!`);
        logger.info(`   Added: ${added} new cities`);
        logger.info(`   Skipped: ${skipped} existing cities`);
        logger.info(`   Total cities in autocomplete: ${await IndianCity.countDocuments()}`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error syncing cities:', error);
        process.exit(1);
    }
}

// Run the sync function
syncExistingCities();
