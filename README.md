# Smart Kisan Assistant

## Overview
Smart Kisan Assistant is an AI-powered digital platform designed to revolutionize Indian agriculture. It provides instant crop disease diagnosis, real-time market intelligence, AI voice assistant, and government scheme navigation in multiple languages.

## Architecture
- **Frontend:** React (Vite), modular components, Tailwind CSS, React Router, Chart.js, Lucide React icons, React Toastify, JWT Authentication.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT authentication, bcrypt, Cloudinary, Google Cloud AI, Firebase Admin.
- **AI/ML Services:** Google Vertex AI, custom ML models for disease and market prediction, voice assistant (Gemini API, local LLMs), NLP, and web scraping.

## Project Structure
```
googlehack/
├── kisan/                # Frontend React app
│   ├── src/
│   │   ├── components/   # UI components (Dashboard, MarketPrices, VoiceAssistant, etc.)
│   │   ├── context/      # Auth context
│   │   ├── services/     # API service layer
│   │   ├── styles/       # Global and component CSS
│   │   └── assets/       # Images, datasets (if any)
│   ├── index.html        # App entry
│   ├── vite.config.js    # Vite config
│   └── eslint.config.js  # Linting config
├── server/               # Backend Node.js app
│   ├── controllers/      # Route controllers
│   ├── models/           # Mongoose models
│   ├── routs/            # Express routes
│   ├── services/         # AI, ML, and utility services
│   ├── scripts/          # Seeding and training scripts
│   ├── config/           # Environment configs
│   ├── uploads/          # Uploaded documents
│   ├── utils/            # Utility functions
│   └── server.js         # App entry
```

## Key Features
- **Crop Disease Diagnosis:** Upload images for instant AI-based disease detection and treatment suggestions.
- **Market Prices:** Real-time commodity prices, trends, and analytics for Indian states.
- **Voice Assistant:** Multilingual AI assistant for queries, document uploads, and navigation.
- **Government Schemes:** Discover, filter, and apply for relevant agricultural schemes.
- **Document Management:** Secure upload, view, and download of important documents.
- **User Dashboard:** Personalized dashboard with quick access to all features.

## Setup Instructions
### Prerequisites
- Node.js (v16+)
- MongoDB
- (Optional) Google Cloud/Firebase credentials for AI features

### Frontend (kisan/)
```bash
cd kisan
npm install
npm run dev
```
- App runs at `http://localhost:5173`

### Backend (server/)
```bash
cd server
npm install
node server.js
```
- API runs at `http://localhost:4000`

### Environment Variables
- Configure `server/config/config.env` with MongoDB URI, JWT secret, Cloudinary, and Google API keys as needed.

## Usage
- Register/login as a user.
- Access dashboard, upload documents, diagnose crop diseases, check market prices, and interact with the voice assistant.
- Admins can manage users, schemes, and market data.

## Contributing
- Fork the repo, create a feature branch, and submit a pull request.
- Follow code style and commit guidelines.

## License
MIT License

---
For detailed API documentation, see the backend route and controller files. 

# Deployment Instructions

## Backend (Render)
1. Push your code to GitHub.
2. Create a new Web Service on [Render](https://render.com/).
3. Set the root directory to `server/`.
4. Set the build command: `npm install`
5. Set the start command: `node server.js`
6. Add environment variables (see `server/.env.example`):
   - `PORT` (Render sets this automatically)
   - `MONGO_URI`
   - `FRONTEND_URL` (your Netlify site URL, e.g. `https://your-frontend.netlify.app`)
   - Any other secrets (SMTP, Cloudinary, etc.)

## Frontend (Netlify)
1. Push your code to GitHub.
2. Create a new site on [Netlify](https://netlify.com/) from your GitHub repo.
3. Set the base directory to `kisan/`.
4. Set the build command: `npm run build`
5. Set the publish directory: `dist` (Vite default)
6. Add environment variable (see `kisan/.env.example`):
   - `VITE_API_BASE_URL` (your Render backend URL, e.g. `https://your-backend.onrender.com/api/v1`)

## Environment Variables
- Copy `.env.example` files to `.env` in both `server/` and `kisan/` and fill in real values.
- Never commit real secrets to GitHub.

## CORS
- The backend uses the `FRONTEND_URL` variable to allow requests from your Netlify site.

## API URLs
- The frontend uses `VITE_API_BASE_URL` to call the backend. Update this in Netlify settings after deploying backend.

## Notes
- After deploying backend, update the frontend’s API URL and redeploy if needed.
- For local development, defaults are set for localhost. 
