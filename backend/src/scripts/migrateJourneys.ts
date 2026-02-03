import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Journey from '../models/Journey';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateJourneys = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const journeys = await Journey.find({}).lean();
        console.log(`Found ${journeys.length} journeys to check.`);

        for (const journey of journeys) {
            let modified = false;
            const newDepartureDates: any[] = [];
            // @ts-ignore
            const checkDates = journey.departureDates || [];

            if (checkDates.length > 0) {
                for (const dateEntry of checkDates) {
                    // Check if it's a string (old format)
                    if (typeof dateEntry === 'string') {
                        console.log(`Migrating date string: ${dateEntry} for journey: ${journey.title}`);
                        newDepartureDates.push({
                            date: new Date(dateEntry),
                            totalSeats: 20,
                            bookedSeats: 0
                        });
                        modified = true;
                    } else if (dateEntry && typeof dateEntry === 'object' && !('totalSeats' in dateEntry)) {
                        console.log(`Migrating date object for journey: ${journey.title}`);
                        // Handle if it's just a Date object or partial
                        const d = (dateEntry as any).date || dateEntry;
                        newDepartureDates.push({
                            date: new Date(d),
                            totalSeats: 20,
                            bookedSeats: 0
                        });
                        modified = true;
                    } else {
                        // Already in correct format
                        newDepartureDates.push(dateEntry);
                    }
                }
            }

            if (modified) {
                await Journey.updateOne(
                    { _id: journey._id },
                    { $set: { departureDates: newDepartureDates } }
                );
                console.log(`Updated journey: ${journey.title}`);
            }
        }

        console.log('Migration completed.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateJourneys();
