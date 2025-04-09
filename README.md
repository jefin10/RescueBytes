# RescueBytes

RescueBytes is an end-to-end disaster response platform designed to facilitate efficient emergency management in India. By connecting victims, volunteers, and administrators in real time, RescueBytes aims to reduce response times and ultimately save lives during disasters.

## Table of Contents

- [Overview](#overview)
- [Team Details](#team-details)
- [Problem Statement](#problem-statement)
- [Opportunities](#opportunities)
- [Features](#features)
- [Architecture & Diagrams](#architecture--diagrams)
- [Technologies Used](#technologies-used)
- [Integrations](#integrations)
- [Deployment](#deployment)
- [MVP Snapshots](#mvp-snapshots)
- [Future Development](#future-development)
- [Links](#links)
- [License](#license)

## Overview

RescueBytes is a disaster management solution that addresses the critical gaps in emergency response and communication in India. The platform leverages AI-driven insights and a coordinated network of volunteers and administrators to provide fast and reliable disaster management services.

## Opportunities

RescueBytes stands out by addressing the shortcomings of current solutions:
- **AI-Driven Coordination:** Personalized emergency guidance using Gemini AI.
- **Volunteer-Admin-Victim Triad:** Real-time role-based collaboration where administrators assign volunteers based on proximity and availability.
- **Integrated Essentials:** A single platform that combines SOS alerts, weather updates, news, and supply management.
- **Enhanced Situational Awareness:** Real-time localized news and weather alerts, ensuring precise victim location for effective rescue.

## Features

### User End
- **One-Tap SOS Alert:** Instantly send an emergency request along with your GPS location.
- **Chat with Gemini AI:** Get real-time survival tips (e.g., flood safety, first aid) through an integrated chat.
- **Real-Time Alerts:** Receive push notifications for weather warnings and disaster news.
- **Request Items & Volunteer Signup:** Easily request essential items or sign up to volunteer.

### Admin
- **Centralized Dashboard:** Monitor active SOS requests, volunteer availability, and resource inventory.
- **Volunteer Management:** Assign rescue tasks, manage volunteer communications, and dispatch rescue teams.
- **Broadcast Alerts:** Disseminate priority notifications to ensure rapid community response.
- **Community Report Management:** Oversee and manage reports from various stakeholders.

## Architecture & Diagrams

RescueByte’s architecture is designed to ensure scalability, reliability, and speed in emergency coordination. The solution incorporates:
- A **User App** for real-time communication.
- A **Web-based Dashboard** for administrators.
- AI-driven emergency advice via the Gemini API.
- Integrated services for weather, location, and supply management.


## Technologies Used

### Frontend
- **React Native:** For cross-platform mobile application development (iOS/Android).
- **React.js:** For the admin dashboard and web interfaces.

### Backend
- **Node.js & Express.js:** REST API to handle requests and manage sessions (cookie-based sessions).

### Database
- **MongoDB:** Storing user data, requests, and system logs.

## Integrations

- **Gemini API:** Provides chat-based emergency guidance.
- **OpenWeatherMap API:** Delivers real-time weather forecasts.
- **Google Maps API:** Assists in location tracking and volunteer assignment.

## Deployment

- **Hosting:** The backend and admin panel are hosted on OnRender.
- **Live Links:** 
  - [RescueBytes Admin Web Page](https://rbbackend-hlah.onrender.com/)

## MVP Snapshots

RescueByte’s MVP demonstrates:
1. **AI & Automation:**  
   - Predictive analytics using historical disaster data.
   - Automated volunteer dispatch based on proximity and skill.
2. **Advanced Integrations:**  
   - IoT sensor integration for real-time disaster alerts.
   - Drone support for aerial damage assessment.
3. **Offline & Low-Tech Access:**  
   - SMS-based SOS and voice command support for users without smartphones.
4. **Government & NGO Collaboration:**  
   - APIs to share SOS data with NDMA and State Disaster Cells.
   - Custom portals for NGOs to manage supplies and volunteers.

## Future Development

- Enhance the AI-driven coordination by incorporating more predictive models.
- Expand integrations with additional governmental and NGO platforms.
- Further refine the volunteer management system with advanced analytics.
- Continuously update the system for emerging technologies in disaster management.

## Links

- **GitHub Repository:** [jenjose72/RescueBytes](https://github.com/jenjose72/RescueBytes)
- **User App Demo:** [RescueBytes - Google Drive](https://drive.google.com/your-demo-link)  
- **RescueBytes Admin Web Page:** [https://rbbackend-hlah.onrender.com/](https://rbbackend-hlah.onrender.com/)

