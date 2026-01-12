import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@components/common/Header'
import Footer from '@components/common/Footer'
import ProtectedRoute from '@components/common/ProtectedRoute'
import AuthStateManager from '@components/common/AuthStateManager'
import SessionManager from '@components/common/SessionManager'
import AIAssistant from '@components/common/AIAssistant'
import { ToastProvider } from '@components/common/ToastProvider'
import Home from '@pages/Home'
import Journeys from '@pages/Journeys'
import JourneyDetail from '@pages/JourneyDetail'
import About from '@pages/About'
import Contact from '@pages/Contact'
import SignUp from '@pages/SignUp'
import FutureOfferings from '@pages/FutureOfferings'
import Dashboard from '@pages/Dashboard'
import BookingConfirmation from '@pages/BookingConfirmation'
import GoogleAuthSuccess from '@pages/GoogleAuthSuccess'

import ScrollToTop from '@components/common/ScrollToTop'

function AppContent() {
    const location = useLocation()
    const isJourneyDetailPage = location.pathname.startsWith('/journeys/') && location.pathname !== '/journeys'
    const isHomePage = location.pathname === '/'

    // Initialize auth state on app load
    useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            <AuthStateManager />
            <SessionManager />
            <Header />
            <main className="grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/journeys" element={<Journeys />} />
                    <Route path="/journeys/:id" element={<JourneyDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/future-offerings" element={<FutureOfferings />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

                    {/* Protected Routes - Require Authentication */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/booking-confirmation/:id" element={
                        <ProtectedRoute>
                            <BookingConfirmation />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <div className={isJourneyDetailPage ? 'hidden md:block' : ''}>
                <Footer />
            </div>

            {/* AI Assistant - Visible only on home page */}
            {isHomePage && <AIAssistant />}
        </div>
    )
}

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <ScrollToTop />
                <AppContent />
            </BrowserRouter>
        </ToastProvider>
    )
}

export default App
