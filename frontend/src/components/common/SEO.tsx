import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title?: string
    description?: string
    keywords?: string
    ogType?: string
    ogImage?: string
    ogUrl?: string
    canonical?: string
}

export default function SEO({
    title = 'QuietSummit - Intentional Travel & Nature Retreats',
    description = 'Discover transformative journeys and serene homestays across India. Authentic experiences in the mountains, designed for mindful travelers seeking connection with nature.',
    keywords = 'travel, nature, mountains, retreats, homestays, India, adventure, mindful travel, transformative journeys',
    ogType = 'website',
    ogImage = 'https://quietsummit.com/og-image.jpg',
    ogUrl,
    canonical,
}: SEOProps) {
    const fullTitle = title.includes('QuietSummit') ? title : `${title} | QuietSummit`
    const currentUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '')
    const canonicalUrl = canonical || currentUrl

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            {currentUrl && <meta property="og:url" content={currentUrl} />}
            <meta property="og:site_name" content="QuietSummit" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Additional Meta */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="author" content="QuietSummit Team" />
        </Helmet>
    )
}
