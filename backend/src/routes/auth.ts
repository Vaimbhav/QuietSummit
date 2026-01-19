import { Router } from 'express'
import {
    loginMember,
    checkMember,
    getMemberProfile,
    updateMemberPreferences,
    googleCallback,
    googleError,
    refreshAccessToken,
    forgotPassword,
    validateResetToken,
    resetPassword,
} from '../controllers/authController'
import passport from '../config/passport'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/login', loginMember)
router.post('/refresh', refreshAccessToken)
router.get('/check', checkMember)
router.get('/profile', authenticateToken, getMemberProfile)
router.put('/preferences', authenticateToken, updateMemberPreferences)

// Password reset routes
router.post('/forgot-password', forgotPassword)
router.post('/validate-reset-token', validateResetToken)
router.post('/reset-password', resetPassword)

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
