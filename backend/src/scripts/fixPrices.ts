import Journey from '../models/Journey'
import { connectDatabase } from '../config/database'

async function fixPrices() {
    try {
        await connectDatabase()

        console.log('✅ Connected to database\n')
        console.log('📊 Current Journey Prices in Database:\n')
        console.log('='.repeat(70) + '\n')

        // Get all journeys from database
        const allJourneys = await Journey.find().select('title slug basePrice price').sort({ title: 1 })

        let needsCleanup = false

        for (const journey of allJourneys) {
            console.log(`${journey.title}`)
            console.log(`  basePrice: ₹${journey.basePrice.toLocaleString()}`)

            if (journey.price !== undefined) {
                console.log(`  ⚠️  Legacy 'price' field found: ₹${journey.price.toLocaleString()}`)
                needsCleanup = true
            }
            console.log('')
        }

        console.log('='.repeat(70))

        // Remove legacy price field if it exists
        if (needsCleanup) {
            console.log('\n🧹 Cleaning up legacy price fields...\n')

            const result = await Journey.updateMany(
                { price: { $exists: true } },
                { $unset: { price: '' } }
            )

            console.log(`✅ Removed legacy price field from ${result.modifiedCount} journeys\n`)
            console.log('='.repeat(70))
            console.log('\n✅ Database cleanup complete!')
            console.log('   All journeys now use only the basePrice field')
        } else {
            console.log('\n✅ Database is clean!')
            console.log('   All journeys are using the basePrice field correctly')
        }

        console.log('\n' + '='.repeat(70) + '\n')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

fixPrices()
