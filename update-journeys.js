// Quick Journey Update Script
// Run this in MongoDB Compass or mongosh

// Update all journeys with required booking fields
db.journeys.updateMany(
	{},
	{
		$set: {
			// Add departure dates (customize these dates as needed)
			departureDates: [
				'2026-02-15',
				'2026-03-20',
				'2026-04-25',
				'2026-05-30',
				'2026-06-15',
			],
			// Set base price per person (customize as needed)
			price: 15000,
			// Ensure destination exists (if not already set)
			destination: 'Adventure Trek',
		},
	}
);

// Verify the update
db.journeys.find({}, {title: 1, price: 1, departureDates: 1, destination: 1});

// If you want to set different prices for different journeys:
// db.journeys.updateOne(
//   { title: 'Himalayan Trek' },
//   { $set: { price: 18000, destination: 'Himalayas' } }
// )
