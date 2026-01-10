import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from '@store/hooks'
import { setUser } from '@store/slices/userSlice'
import Header from '@components/common/Header'
import Footer from '@components/common/Footer'
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

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/journeys" element={<Journeys />} />
                    <Route path="/journeys/:id" element={<JourneyDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/future-offerings" element={<FutureOfferings />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                    <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                </Routes>
            </main>
            <div className={isJourneyDetailPage ? 'hidden md:block' : ''}>
                <Footer />
            </div>
        </div>
    )
}

function App() {
    const dispatch = useAppDispatch()

    // Check for existing user session on app load
    useEffect(() => {
        const storedUser = localStorage.getItem('quietsummit_user')
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser)
                dispatch(setUser({
                    email: userData.email,
                    name: userData.name,
                    isAuthenticated: true,
                }))
            } catch (error) {
                console.error('Error parsing stored user:', error)
                localStorage.removeItem('quietsummit_user')
            }
        }
    }, [dispatch])

    return (
        <BrowserRouter>
            <ScrollToTop />
            <AppContent />
        </BrowserRouter>
    )
}

export default App
