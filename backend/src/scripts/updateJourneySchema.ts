// Update Journey Schema with Booking Fields
import mongoose from 'mongoose'
import 'dotenv/config'

const journeySchema = new mongoose.Schema({}, { strict: false })
const Journey = mongoose.model('Journey', journeySchema)

async function updateJourneys() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quietsummit')
        console.log('✅ Connected to MongoDB')

        const journeys = await Journey.find({})
        console.log(`📊 Found ${journeys.length} journeys to update`)

        let updated = 0
        for (const journey of journeys) {
            const updates: any = {}

            // Add price from basePrice if not exists
            if (!journey.price && journey.basePrice) {
                updates.price = journey.basePrice
            } else if (!journey.price) {
                updates.price = 15000 // Default price
            }

            // Add destination from location.region or title
            if (!journey.destination) {
                updates.destination = journey.location?.region || journey.title.split(':')[0].trim()
            }

            // Add departure dates if not exists
            if (!journey.departureDates || journey.departureDates.length === 0) {
                updates.departureDates = [
                    '2026-02-15',
                    '2026-03-20',
                    '2026-04-25',
                    '2026-05-30',
                    '2026-06-15',
                    '2026-07-10'
                ]
            }

            // Convert duration object to number if needed
            if (journey.duration?.days && typeof journey.duration === 'object') {
                updates.duration = journey.duration.days
            }

            if (Object.keys(updates).length > 0) {
                await Journey.updateOne({ _id: journey._id }, { $set: updates })
                updated++
                console.log(`✓ Updated: ${journey.title}`)
                console.log(`  - price: ₹${updates.price || journey.price}`)
                console.log(`  - destination: ${updates.destination || journey.destination}`)
                console.log(`  - departureDates: ${updates.departureDates ? updates.departureDates.length + ' dates' : 'already set'}`)
            }
        }

        console.log(`\n🎉 Successfully updated ${updated} journeys!`)

        // Show sample updated journey
        const sample = await Journey.findOne({})
        console.log('\n📋 Sample journey structure:')
        console.log({
            title: sample?.title,
            price: sample?.price,
            destination: sample?.destination,
            duration: sample?.duration,
            departureDates: sample?.departureDates?.slice(0, 3)
        })

        await mongoose.disconnect()
        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

updateJourneys()
