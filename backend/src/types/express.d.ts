// Extend Express Request to allow custom user types from both JWT and Passport
import { ISignUp } from '../models/SignUp'
import 'multer'

declare global {
    namespace Express {
        // Use a union type to support both JWT payload and Passport user
        interface User {
            _id?: any
            id?: string
            email: string
            name?: string
            iat?: number
            exp?: number
        }

        interface Request {
            user?: User
            requestId?: string
        }
    }
}

export { }
