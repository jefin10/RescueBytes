# RescueBytes

> A comprehensive disaster management platform connecting victims, volunteers, and rescue coordinators in real-time during emergencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)](https://expo.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)

## Overview

RescueBytes is a full-stack disaster response platform designed to streamline emergency management in India. The system provides real-time coordination between disaster victims, volunteer responders, and administrative rescue centers through a mobile application and web-based admin dashboard.

**Key Capabilities:**
- One-tap SOS emergency alerts with GPS location tracking
- AI-powered emergency guidance using Google Gemini
- Real-time volunteer coordination and task assignment
- Resource inventory management across rescue centers
- Community-driven emergency reporting
- Live weather updates and disaster news broadcasting

## Architecture

```
RescueBytes/
├── RescueBytesWeb/          # Web platform (Admin Dashboard)
│   ├── backend/             # Node.js/Express REST API
│   └── frontend/            # React + TypeScript admin interface
└── RescueBytezApp/          # Mobile application
    └── RescueBytez/         # React Native (Expo) user app
```

## Features

### Mobile Application (User-Facing)

#### Emergency Response
- **One-Tap SOS Alert**: Send emergency distress signals with automatic GPS location capture
- **Emergency Reporting**: Submit detailed emergency reports with type categorization (flooding, fire, medical, power outage, storm damage)
- **AI Emergency Assistant**: Chat with Gemini AI for real-time survival guidance, first aid instructions, and disaster-specific advice
- **Location Services**: Automatic location detection and reverse geocoding for precise emergency positioning

#### Information & Awareness
- **Real-Time Weather**: Current conditions and 7-day forecasts with AI-generated weather summaries
- **News Feed**: Disaster alerts and updates from rescue centers with priority levels
- **Community Reports**: Browse and submit community-verified emergency reports

#### Resource Management
- **Request Essential Supplies**: Submit requests for food, water, medical supplies, shelter, and other necessities
- **Request Tracking**: Monitor approval status of submitted resource requests
- **Quantity Specification**: Specify exact quantities needed for efficient resource allocation

#### Volunteer Features
- **Volunteer Registration**: Sign up with expertise field (medical, rescue, logistics, etc.)
- **Task Assignments**: Receive and view assigned rescue tasks from coordinators
- **Volunteer Messaging**: Direct communication channel with admin coordinators

#### User Profile
- **Profile Management**: Update personal information, contact details, and address
- **Session Management**: Secure authentication with persistent login sessions
- **Rescue Center Assignment**: Automatic assignment to nearest rescue center

### Web Dashboard (Admin Interface)

#### Emergency Operations Center
- **Real-Time Statistics Dashboard**: 
  - Active SOS alert count
  - Total service requests
  - Available volunteer count
  - Live status indicators

#### SOS Management
- **Interactive Map View**: Leaflet-based map displaying all active SOS alerts with markers
- **Alert Details**: User information, coordinates, timestamp, and rescue center assignment
- **Dispatch Actions**: Resolve or dispatch emergency responses
- **Auto-Refresh**: Automatic updates every 5 minutes
- **Alert Table**: Sortable, filterable list view of all SOS requests

#### Inventory Management
- **Stock Tracking**: Real-time inventory levels by item and rescue center
- **Add Items**: Register new supplies in the system
- **Inter-Center Transfers**: Request and transfer items between rescue centers
- **Incoming Requests**: Approve or fulfill inventory requests from other centers
- **Low Stock Alerts**: Visual indicators for critical inventory levels

#### User Request Management
- **Request Queue**: View all community resource requests
- **Status Filtering**: Filter by pending, approved, or rejected status
- **Search Functionality**: Find requests by ID, item name, or category
- **Approval Workflow**: Approve requests with automatic inventory allocation
- **Rejection Handling**: Reject requests with reason tracking

#### Volunteer Coordination
- **Volunteer Directory**: Complete list of registered volunteers with expertise
- **Search & Filter**: Find volunteers by name, skill, or location
- **Task Assignment**: Send specific task assignments and messages to volunteers
- **Contact Management**: Access volunteer phone numbers and addresses
- **Availability Tracking**: Monitor volunteer status and workload

#### News & Alerts
- **News Publishing**: Create and broadcast disaster-related news and instructions
- **Priority Levels**: Set urgency (normal, medium, high) for news items
- **Edit & Delete**: Manage published news content
- **Recent Posts**: View publication history and timestamps

#### Community Report Moderation
- **Report Review**: Approve or reject community-submitted emergency reports
- **Quality Control**: Verify report accuracy before public broadcast
- **Report Management**: Track approved and rejected reports

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Authentication**: bcrypt password hashing, UUID session tokens, cookie-based sessions
- **AI Integration**: Google Gemini 2.0 Flash API
- **Weather Data**: Open-Meteo API
- **Geocoding**: Geoapify API
- **Utilities**: body-parser, cookie-parser, CORS, dotenv

### Web Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Lucide React icons
- **Maps**: Leaflet + React Leaflet
- **HTTP Client**: Axios
- **State Management**: React Context API

### Mobile Application
- **Framework**: React Native (Expo SDK)
- **Navigation**: Expo Router with typed routes
- **Location Services**: expo-location
- **HTTP Client**: Axios
- **Storage**: AsyncStorage for session persistence

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (frontend)
- **Hosting**: Render (backend + frontend)
- **Database**: MongoDB Atlas (production) / Local MongoDB (development)

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- MongoDB 7.0 or higher (or MongoDB Atlas account)
- npm or yarn package manager
- Expo CLI (for mobile app development)
- Docker & Docker Compose (optional, for containerized deployment)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd RescueBytesWeb/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_DB_URI=mongodb://localhost:27017/rescuebytes
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run server

# Production mode
npm start
```

The backend will run on `http://localhost:3000`

### Web Frontend Setup

1. Navigate to the frontend directory:
```bash
cd RescueBytesWeb/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api.tsx`:
```typescript
const api_url = "http://localhost:3000";
export default api_url;
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd RescueBytezApp/RescueBytez
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in the app configuration (check `Auth/apiService.ts` or similar)

4. Start Expo development server:
```bash
npx expo start
```

5. Run on device/emulator:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

### Docker Deployment

1. Navigate to the web platform directory:
```bash
cd RescueBytesWeb
```

2. Ensure `.env` file is configured in `backend/` directory

3. Start all services:
```bash
docker-compose up -d
```

This will start:
- Backend API on port 3000
- MongoDB on port 27017
- Automatic health checks and restart policies

4. Stop services:
```bash
docker-compose down
```

## API Documentation

### Authentication Endpoints

```
POST   /auth/login              # Web admin login
POST   /auth/loginApp           # Mobile app login
POST   /signup                  # User registration
POST   /auth/logout             # Logout (web)
POST   /auth/logout-mobile      # Logout (mobile)
GET    /auth/validate-session   # Check session validity
GET    /auth/users/:id          # Get user details
PUT    /auth/users/:id          # Update user profile
```

### SOS & Emergency Endpoints

```
POST   /sos/create              # Create SOS alert
GET    /sos/all                 # Get all SOS alerts
GET    /sos/user/:userId        # Get user's SOS alerts
POST   /deleteSOS               # Delete/resolve SOS alert
POST   /emergencyReport         # Submit emergency report
```

### Resource Management Endpoints

```
POST   /addUserReq              # Submit resource request
GET    /getUserReq              # Get all user requests
GET    /getUserReqbyId/:userId  # Get requests by user
POST   /approveUserReq          # Approve resource request
POST   /rejectUserReq           # Reject resource request
```

### Inventory Endpoints

```
GET    /getInv                  # Get inventory items
POST   /addInventory            # Add inventory item
POST   /manageInv               # Transfer inventory
POST   /invReqRc                # Request items from center
GET    /getInvReqRc             # Get inventory requests
```

### Volunteer Endpoints

```
POST   /volunteerSignup         # Register as volunteer
GET    /getVolunteers           # Get all volunteers
POST   /addVolunteerMessage     # Send message to volunteer
GET    /getVolMessagebyId/:id   # Get volunteer messages
```

### News & Alerts Endpoints

```
POST   /news/create             # Create news item
GET    /news/all                # Get all news
PUT    /news/:id                # Update news item
DELETE /news/:id                # Delete news item
POST   /addAlert                # Create alert
GET    /getAlerts               # Get all alerts
POST   /getLatestAlerts         # Get recent alerts
POST   /deleteAlert             # Delete alert
```

### Community Reports Endpoints

```
POST   /addComRep               # Submit community report
GET    /getComRepUser           # Get user's reports
GET    /getComRepAdm            # Get all reports (admin)
POST   /approveComReq           # Approve report
POST   /comReportsRejected      # Reject report
```

### AI & Weather Endpoints

```
POST   /chat/chat               # Chat with Gemini AI
GET    /chat/history/:userId    # Get chat history
```

### Statistics Endpoints

```
GET    /getStats                # Get dashboard statistics
GET    /getRC                   # Get rescue centers
GET    /getRCName               # Get rescue center name
GET    /getUsers                # Get all users
```

## Database Schema

### Core Models

**User**
- name, email, password (hashed)
- role: user | admin | volunteer | moderator
- RescueCenters: ObjectId reference
- sessionToken: UUID
- pfpLink: profile picture URL

**SOS Alert**
- location: GPS coordinates string
- user: User reference
- rescueCenter: RescueCenter reference
- timestamps: createdAt, updatedAt

**Emergency Report**
- type: flooding | fire | medical | power_outage | storm_damage | other
- description: text
- location: [latitude, longitude]
- user: User reference

**User Request**
- type: food | water | medical | shelter | clothing | other
- item: string
- count: number
- status: pending | approved | rejected
- user: User reference

**Volunteer**
- name, phone, address
- field: expertise area
- user: User reference

**Inventory**
- item: string
- count: number
- rescueCenter: RescueCenter reference

**News**
- title, content
- priority: normal | medium | high
- rescueCenter: RescueCenter reference
- timestamps

**Community Report**
- type: emergency type
- description: text
- location: coordinates
- approved: boolean
- user: User reference

**Chat**
- userId: User reference
- messages: [{text, isBot, timestamp}]

## Configuration

### Environment Variables

**Backend (.env)**
```env
# Database
MONGO_DB_URI=mongodb://localhost:27017/rescuebytes

# API Keys
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Session
SESSION_SECRET=your_session_secret
```

### CORS Configuration

The backend allows requests from:
- `http://localhost:5173` (web frontend dev)
- `http://localhost:8081` (Expo dev server)
- `http://10.0.2.2:3000` (Android emulator)
- Production frontend URL

## User Roles & Permissions

### Regular User
- Send SOS alerts
- Submit emergency reports
- Request resources
- Chat with AI assistant
- View weather and news
- Submit community reports
- Register as volunteer

### Volunteer
- All user permissions
- Receive task assignments
- View assigned tasks
- Communicate with coordinators

### Admin
- All user permissions
- Access admin dashboard
- Manage SOS alerts
- Approve/reject resource requests
- Manage inventory
- Assign volunteers
- Publish news and alerts
- Moderate community reports
- View statistics

### Moderator
- Review and moderate content
- Approve community reports
- Manage news items

## API Integrations

### Google Gemini AI
- **Purpose**: Emergency guidance, survival tips, weather summaries
- **Model**: gemini-2.0-flash
- **Features**: Context-aware responses, natural language processing
- **Setup**: Requires `GEMINI_API_KEY` in environment

### Open-Meteo Weather API
- **Purpose**: Real-time weather data and forecasts
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data**: Temperature, precipitation, wind speed, weather codes
- **No API key required**

### Geoapify Geocoding
- **Purpose**: Reverse geocoding (coordinates to city name)
- **Used for**: Location identification in emergency reports
- **Endpoint**: `https://api.geoapify.com/v1/geocode/reverse`

## Deployment

### Production Deployment (Render)

**Backend:**
1. Push code to GitHub repository
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set build command: `cd RescueBytesWeb/backend && npm install`
5. Set start command: `cd RescueBytesWeb/backend && npm start`
6. Add environment variables in Render dashboard
7. Deploy

**Frontend:**
1. Build the frontend: `npm run build`
2. Create Static Site on Render
3. Set build command: `cd RescueBytesWeb/frontend && npm install && npm run build`
4. Set publish directory: `RescueBytesWeb/frontend/dist`
5. Deploy

**Database:**
- Use MongoDB Atlas for production database
- Update `MONGO_DB_URI` to Atlas connection string

### Docker Production Deployment

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (caution: deletes data)
docker-compose down -v
```

## Development

### Running Tests
```bash
# Backend tests
cd RescueBytesWeb/backend
npm test

# Frontend tests
cd RescueBytesWeb/frontend
npm test
```

### Code Linting
```bash
# Frontend linting
cd RescueBytesWeb/frontend
npm run lint
```

### Database Seeding

To add a rescue center:
```bash
curl -X POST http://localhost:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{"location": "Kottayam", "contactNumber": "+91-1234567890"}'
```

## Project Structure

```
RescueBytes/
├── RescueBytesWeb/
│   ├── backend/
│   │   ├── config/              # Database configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth middleware
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── server.js            # Express app entry
│   │   ├── Dockerfile           # Backend container
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── contexts/        # React contexts (Auth)
│   │   │   ├── pages/           # Page components
│   │   │   ├── lib/             # Utilities
│   │   │   ├── App.tsx          # Main app component
│   │   │   └── main.tsx         # Entry point
│   │   ├── public/              # Static assets
│   │   ├── Dockerfile           # Frontend container
│   │   ├── nginx.conf           # Nginx configuration
│   │   └── package.json
│   └── docker-compose.yml       # Multi-container setup
└── RescueBytezApp/
    └── RescueBytez/
        ├── app/                 # Expo Router screens
        │   ├── index.tsx        # Landing page
        │   ├── Login.tsx        # Authentication
        │   ├── home.tsx         # Main dashboard
        │   ├── SOS.tsx          # Emergency alert
        │   ├── chat.tsx         # AI assistant
        │   ├── Weather.tsx      # Weather info
        │   ├── News.tsx         # News feed
        │   ├── volunteer.tsx    # Volunteer signup
        │   ├── EmergencyReport.tsx
        │   ├── crowd.tsx        # Community reports
        │   └── Profile.tsx      # User profile
        ├── assets/              # Images, fonts
        ├── components/          # Reusable components
        ├── Auth/                # Auth utilities
        └── app.json             # Expo configuration
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Links

- **Live Demo**: [https://rbbackend-hlah.onrender.com/](https://rbbackend-hlah.onrender.com/)
- **GitHub Repository**: [https://github.com/jenjose72/RescueBytes](https://github.com/jenjose72/RescueBytes)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ for disaster response and community safety
