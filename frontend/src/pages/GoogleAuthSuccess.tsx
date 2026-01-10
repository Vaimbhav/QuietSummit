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

                // Store user in Redux
                dispatch(
                    setUser({
                        email: userData.email,
                        name: userData.name,
                        isAuthenticated: true,
                    })
                )

                // Store in localStorage
                localStorage.setItem('quietsummit_user', JSON.stringify(userData))

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            } catch (error) {
                console.error('Error parsing user data:', error)
                navigate('/signup?error=Authentication failed')
            }
        } else {
            navigate('/signup?error=Authentication failed')
        }
    }, [navigate, dispatch])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
            <div className="text-center">
                <Loader size="lg" />
                <p className="mt-4 text-lg text-neutral-700">
                    Completing sign in with Google...
                </p>
            </div>
        </div>
    )
}
