import mongoose from 'mongoose'
import Journey from '../models/Journey'
import { connectDatabase } from '../config/database'

async function updateBasePrices() {
    try {
        await connectDatabase()

        console.log('✅ Connected to database\n')
        console.log('🔄 Updating basePrice values to match seed data...\n')

        // Correct prices from seed data
        const correctPrices = [
            { slug: 'himalayan-silence-manali', basePrice: 24000 },
            { slug: 'monastic-spiti-stillness', basePrice: 35000 },
            { slug: 'wayanad-forest-coffee', basePrice: 18000 },
            { slug: 'ladakh-high-desert', basePrice: 32000 },
            { slug: 'kashmir-silent-valley', basePrice: 28000 },
            { slug: 'meghalaya-roots', basePrice: 22000 },
            { slug: 'coorg-coffee-mist', basePrice: 15000 },
            { slug: 'varkala-cliff-calm', basePrice: 12000 },
            { slug: 'rishikesh-yoga-source', basePrice: 16000 },
            { slug: 'jaisalmer-desert-stars', basePrice: 14000 },
            { slug: 'andaman-blue-solitude', basePrice: 45000 },
            { slug: 'sikkim-hidden-kingdom', basePrice: 30000 },
            { slug: 'hampi-ruins-boulders', basePrice: 10000 },
            { slug: 'gokarna-coastal-trek', basePrice: 9000 },
            { slug: 'valley-of-flowers', basePrice: 18000 },
            { slug: 'pondicherry-french', basePrice: 12000 },
            { slug: 'zanskar-chadar', basePrice: 65000 },
            { slug: 'darjeeling-tea', basePrice: 20000 },
            { slug: 'munnar-tea-solitude', basePrice: 14000 },
            { slug: 'tirthan-secret-river', basePrice: 16000 }
        ]

        for (const { slug, basePrice } of correctPrices) {
            const journey = await Journey.findOne({ slug })

            if (!journey) {
                console.log(`⚠️  Not found: ${slug}`)
                continue
            }

            if (journey.basePrice !== basePrice) {
                console.log(`📝 ${journey.title}`)
                console.log(`   Old: ₹${journey.basePrice.toLocaleString()} → New: ₹${basePrice.toLocaleString()}`)

                await Journey.updateOne(
                    { slug },
                    { $set: { basePrice } }
                )
            } else {
                console.log(`✓ ${journey.title}: ₹${basePrice.toLocaleString()}`)
            }
        }

        console.log('\n✅ All basePrice values updated!')

        // Verification
        console.log('\n' + '='.repeat(70))
        console.log('📊 VERIFICATION\n')
        const allJourneys = await Journey.find().select('title basePrice').sort({ title: 1 })
        allJourneys.forEach(j => {
            console.log(`${j.title}: ₹${j.basePrice.toLocaleString()}`)
        })
        console.log('='.repeat(70))

        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

updateBasePrices()
