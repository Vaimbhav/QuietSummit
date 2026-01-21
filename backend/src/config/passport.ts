import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from './environment'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await SignUp.findOne({ googleId: profile.id })

                if (!user) {
                    // Check if email already exists (user signed up with email/password)
                    user = await SignUp.findOne({ email: profile.emails?.[0]?.value?.toLowerCase() })

                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id
                        user.status = 'confirmed'
                        await user.save()
                        logger.info(`Linked Google account to existing user: ${user.email}`)
                    } else {
                        // Create new user
                        user = await SignUp.create({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails?.[0]?.value?.toLowerCase(),
                            source: 'google',
                            status: 'confirmed',
                            interests: [],
                            subscribeToNewsletter: true,
                            confirmedAt: new Date(),
                        })
                        logger.info(`Created new user via Google: ${user.email}`); // Added semicolon
                        (user as any).isNewUser = true
                    }
                }

                return done(null, user)
            } catch (error) {
                logger.error('Error in Google OAuth strategy:', error)
                return done(error as Error, undefined)
            }
        }
    )
)

// Serialize user for the session
passport.serializeUser((user: any, done) => {
    done(null, user._id)
})

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await SignUp.findById(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

export default passport
