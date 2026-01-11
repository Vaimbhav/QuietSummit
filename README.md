# QuietSummit - Intentional Travel Experiences

A full-stack web application for booking curated travel experiences focused on mindfulness and nature connection.

## Tech Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js (Google OAuth) + JWT
- **Payment:** Razorpay Integration

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **Animations:** Framer Motion
- **Forms:** React Hook Form

## Project Structure

```
QuietSummit/
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Database & environment config
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
│
└── frontend/          # React application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/  # API integration
    │   ├── store/     # Redux store
    │   └── utils/
    └── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- pnpm (recommended) or npm

### Backend Setup

```bash
cd backend
pnpm install

# Create .env file with:
# - MONGODB_URI
# - JWT_SECRET
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - CORS_ORIGIN

pnpm dev
```

### Frontend Setup

```bash
cd frontend
pnpm install

# Create .env file with:
# - VITE_API_URL

pnpm dev
```

## Building for Production

### Backend
```bash
cd backend
pnpm build
pnpm start
```

### Frontend
```bash
cd frontend
pnpm build
pnpm preview
```

## Features

- 🌄 Browse curated travel journeys
- 👤 Member authentication (Email/Password & Google OAuth)
- 📅 Multi-step booking flow
- 💳 Secure payment with Razorpay
- 🎫 Coupon system
- 📱 Fully responsive design
- 🔐 Secure JWT-based authentication
- 📊 Member dashboard with booking history

## Environment Variables

### Backend
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `CORS_ORIGIN` - Frontend URL for CORS
- `PORT` - Server port (default: 5000)

### Frontend
- `VITE_API_URL` - Backend API URL

## License

MIT

---

**Last Updated:** January 11, 2026
**Status:** Production Ready ✅
