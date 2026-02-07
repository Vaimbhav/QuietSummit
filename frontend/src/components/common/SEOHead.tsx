import { Helmet } from 'react-helmet-async';

interface LodgingBusinessSchema {
    name: string;
    description: string;
    image: string[];
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    priceRange?: string;
    checkinTime?: string;
    checkoutTime?: string;
    amenities?: string[];
    telephone?: string;
    url: string;
}

interface TouristAttractionSchema {
    name: string;
    description: string;
    image: string[];
    address: {
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    offers?: {
        price: number;
        priceCurrency: string;
        availability: string;
        validFrom: string;
    };
    duration?: string;
    url: string;
}

interface SEOHeadProps {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    schema?: LodgingBusinessSchema | TouristAttractionSchema;
    schemaType?: 'LodgingBusiness' | 'TouristAttraction';
}

export default function SEOHead({ title, description, keywords, ogImage, schema, schemaType }: SEOHeadProps) {
    const fullTitle = `${title} | QuietSummit`;
    const canonicalUrl = window.location.href;

    const generateSchema = () => {
        if (!schema || !schemaType) return null;

        const baseSchema = {
            '@context': 'https://schema.org',
            '@type': schemaType,
            ...schema,
        };

        return JSON.stringify(baseSchema);
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:site_name" content="QuietSummit" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Structured Data */}
            {schema && schemaType && (
                <script type="application/ld+json">
                    {generateSchema()}
                </script>
            )}
        </Helmet>
    );
}
