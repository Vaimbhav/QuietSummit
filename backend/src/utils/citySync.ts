import IndianCity from '../models/IndianCity';
import logger from './logger';

/**
 * Syncs a city to the IndianCity collection if it doesn't exist
 * This ensures autocomplete always shows cities with actual properties
 */
export async function syncCityToAutocomplete(city: string, state?: string): Promise<void> {
    try {
        if (!city || city.trim() === '') {
            return;
        }

        const cityName = city.trim();
        const stateName = state?.trim() || 'Unknown';

        // Check if city already exists
        const existingCity = await IndianCity.findOne({
            city: { $regex: new RegExp(`^${cityName}$`, 'i') }
        });

        if (!existingCity) {
            // Add new city to autocomplete database
            await IndianCity.create({
                city: cityName,
                state: stateName,
                type: 'city',
            });

            logger.info(`🏙️  Auto-synced new city to autocomplete: ${cityName}, ${stateName}`);
        }
    } catch (error) {
        // Don't fail the main operation if sync fails
        logger.error('Error syncing city to autocomplete:', error);
    }
}
