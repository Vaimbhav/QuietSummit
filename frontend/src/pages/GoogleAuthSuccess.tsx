import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@store/hooks'
import { setUser } from '@store/slices/userSlice'
import Loader from '../components/common/Loader'

export default function GoogleAuthSuccess() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    useEffect(() => {
        // Get user data from URL params
        const params = new URLSearchParams(window.location.search)
        const dataParam = params.get('data')

        if (dataParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(dataParam))

                // Store user in Redux with token
                dispatch(
                    setUser({
                        email: userData.email,
                        name: userData.name,
                        token: userData.token,
                        isAuthenticated: true,
                    })
                )

                // Store in localStorage with token
                localStorage.setItem('quietsummit_user', JSON.stringify(userData))

                // Check if there's a redirect URL
                const redirectUrl = localStorage.getItem('redirectAfterLogin')
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin')
                    // Use window.location for full page reload to ensure state is loaded
                    setTimeout(() => {
                        window.location.href = redirectUrl
                    }, 1000)
                } else {
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = '/dashboard'
                    }, 1000)
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
                navigate('/signup?error=Authentication failed')
            }
        } else {
            navigate('/signup?error=Authentication failed')
        }
    }, [navigate, dispatch])

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
            <div className="text-center">
                <Loader size="lg" />
                <p className="mt-4 text-lg text-neutral-700">
                    Completing sign in with Google...
                </p>
            </div>
        </div>
    )
}
