/**
 * Accessibility component with skip-to-content link
 * Allows keyboard users to skip navigation and jump to main content
 */
export default function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all"
        >
            Skip to main content
        </a>
    )
}
