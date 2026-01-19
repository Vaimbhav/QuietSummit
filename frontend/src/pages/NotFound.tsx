import { Link } from 'react-router-dom'
import { Home, Search, MapPin } from 'lucide-react'
import Button from '@components/common/Button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 Animation */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-stone-300 mb-4">404</h1>
                    <div className="flex items-center justify-center gap-2 text-stone-400">
                        <MapPin className="w-6 h-6" />
                        <span className="text-xl">Lost in the mountains?</span>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl font-bold text-stone-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-stone-600 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved to a different trail.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/">
                        <Button size="lg" className="flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link to="/journeys">
                        <Button variant="outline" size="lg" className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Explore Journeys
                        </Button>
                    </Link>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-stone-200">
                    <p className="text-sm text-stone-500 mb-4">Looking for something specific?</p>
                    <div className="flex flex-wrap gap-4 justify-center text-sm">
                        <Link to="/homestays" className="text-stone-600 hover:text-stone-900 transition-colors">
                            Homestays
                        </Link>
                        <Link to="/about" className="text-stone-600 hover:text-stone-900 transition-colors">
                            About Us
                        </Link>
                        <Link to="/contact" className="text-stone-600 hover:text-stone-900 transition-colors">
                            Contact
                        </Link>
                        <Link to="/signup" className="text-stone-600 hover:text-stone-900 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
