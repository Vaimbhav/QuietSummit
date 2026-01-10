import { Router } from 'express'
import {
    loginMember,
    checkMember,
    getMemberProfile,
    updateMemberPreferences,
    googleCallback,
    googleError,
} from '../controllers/authController'
import passport from '../config/passport'

const router = Router()

router.post('/login', loginMember)
router.get('/check', checkMember)
router.get('/profile', getMemberProfile)
router.put('/preferences', updateMemberPreferences)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/v1/auth/google/error',
        session: false 
    }),
    googleCallback
)
router.get('/google/error', googleError)

export default router
