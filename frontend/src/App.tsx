import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Header from '@components/common/Header'
import Footer from '@components/common/Footer'
import ProtectedRoute from '@components/common/ProtectedRoute'
import AuthStateManager from '@components/common/AuthStateManager'
import SessionManager from '@components/common/SessionManager'
import HealthCheckBanner from '@components/common/HealthCheckBanner'
import SkipToContent from '@components/common/SkipToContent'
import { ToastProvider } from '@components/common/ToastProvider'
import Loader from '@components/common/Loader'
import ScrollToTop from '@components/common/ScrollToTop'

// Eager load critical pages
import Home from '@pages/Home'
import SignUp from '@pages/SignUp'

// Lazy load secondary pages
const Journeys = lazy(() => import('@pages/Journeys'))
const JourneyDetail = lazy(() => import('@pages/JourneyDetail'))
const About = lazy(() => import('@pages/About'))
const Contact = lazy(() => import('@pages/Contact'))
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/ResetPassword'))
const FutureOfferings = lazy(() => import('@pages/FutureOfferings'))
const Dashboard = lazy(() => import('@pages/Dashboard'))
const BookingConfirmation = lazy(() => import('@pages/BookingConfirmation'))
const GoogleAuthSuccess = lazy(() => import('@pages/GoogleAuthSuccess'))
const Homestays = lazy(() => import('@pages/Homestays'))
const HomestayDetail = lazy(() => import('@pages/HomestayDetail'))
const Profile = lazy(() => import('@pages/Profile'))
const MyBookings = lazy(() => import('@pages/MyBookings'))
const Notifications = lazy(() => import('@pages/Notifications'))
const FAQs = lazy(() => import('@pages/FAQs'))
const TermsAndConditions = lazy(() => import('@pages/TermsAndConditions'))
const PrivacyPolicy = lazy(() => import('@pages/PrivacyPolicy'))
const NotFound = lazy(() => import('@pages/NotFound'))

// Lazy load host pages
const HostDashboard = lazy(() => import('@pages/host/HostDashboard'))
const HomestayManagement = lazy(() => import('@pages/host/HomestayManagement'))
const HostBookings = lazy(() => import('@pages/host/HostBookings'))
const PropertyForm = lazy(() => import('@pages/host/PropertyForm'))
const HostCalendar = lazy(() => import('@pages/host/HostCalendar'))

// Lazy load admin pages
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard'))
const BookingOversight = lazy(() => import('@pages/admin/BookingOversight'))
const UserManagement = lazy(() => import('@pages/admin/UserManagement'))
const HomestayApproval = lazy(() => import('@pages/admin/HomestayApproval'))
const ReviewModeration = lazy(() => import('@pages/admin/ReviewModeration'))

function AppContent() {
    const location = useLocation()
    const isJourneyDetailPage = location.pathname.startsWith('/journeys/') && location.pathname !== '/journeys'
    const isHomestayDetailPage = location.pathname.startsWith('/homestays/') || location.pathname.startsWith('/properties/')

    // Initialize auth state on app load
    useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            <SkipToContent />
            <HealthCheckBanner />
            <AuthStateManager />
            <SessionManager />
            <Header />
            <main id="main-content" className="grow">
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <Loader />
                    </div>
                }>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/journeys" element={<Journeys />} />
                        <Route path="/journeys/:id" element={<JourneyDetail />} />
                        <Route path="/homestays" element={<Homestays />} />
                        <Route path="/homestays/:slug" element={<HomestayDetail />} />

                        {/* Redirects for backward compatibility - old property routes */}
                        <Route path="/properties" element={<Navigate to="/homestays" replace />} />

                        <Route path="/about" element={<About />} />
                        <Route path="/future-offerings" element={<FutureOfferings />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                        <Route path="/faqs" element={<FAQs />} />
                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />

                        {/* Protected Routes - Require Authentication */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/my-bookings" element={
                            <ProtectedRoute>
                                <MyBookings />
                            </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking-confirmation/:id" element={
                            <ProtectedRoute>
                                <BookingConfirmation />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/dashboard" element={
                            <ProtectedRoute>
                                <HostDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/homestays" element={
                            <ProtectedRoute>
                                <HomestayManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/homestays/new" element={
                            <ProtectedRoute>
                                <PropertyForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/homestays/:id/edit" element={
                            <ProtectedRoute>
                                <PropertyForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/bookings" element={
                            <ProtectedRoute>
                                <HostBookings />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/calendar" element={
                            <ProtectedRoute>
                                <HostCalendar />
                            </ProtectedRoute>
                        } />
                        <Route path="/host/reviews" element={
                            <ProtectedRoute>
                                <Navigate to="/host/dashboard" replace />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/bookings" element={
                            <ProtectedRoute>
                                <BookingOversight />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute>
                                <UserManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/homestays" element={
                            <ProtectedRoute>
                                <HomestayApproval />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/reviews" element={
                            <ProtectedRoute>
                                <ReviewModeration />
                            </ProtectedRoute>
                        } />

                        {/* 404 - Catch all unknown routes */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            <div className={(isJourneyDetailPage || isHomestayDetailPage) ? 'hidden md:block' : ''}>
                <Footer />
            </div>
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
