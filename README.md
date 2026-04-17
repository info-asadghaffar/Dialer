# NexaDial

A production-grade VoIP dialer application built with React Native (Expo), Node.js, Supabase, and Twilio.

## Features
-   **Voice Calls**: High-quality VoIP calls via Twilio Voice SDK.
-   **SMS Messaging**: Real-time SMS threads using Twilio Messaging API.
-   **Call History**: Persistent log of all incoming and outgoing calls.
-   **Contact Management**: Native-style contact list Integration.
-   **Settings**: Secure Twilio credential management powered by Supabase.

## Tech Stack
-   **Frontend**: React Native + Expo SDK 51, NativeWind v4, Zustand, Axios, TanStack Query.
-   **Backend**: Node.js 20+, Express 4+, TypeScript.
-   **Database**: Supabase (PostgreSQL).
-   **Voice/SMS**: Twilio REST API & @twilio/voice-react-native-sdk.

## Prerequisites
-   Node.js 20.x or later
-   Expo Go (for development) or physical devices
-   Supabase Account & Project
-   Twilio Account (Trial or Paid)

## Setup Instructions

### 1. Database Setup (Supabase)
-   Create a new Supabase project.
-   Run the migration script provided in `server/src/db/migrations/001_initial.sql`.
-   Note your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.

### 2. Twilio Configuration
-   **TwiML App**: Create a TwiML App in the Twilio Console.
    -   Voice URL: `https://your-server-domain.com/webhooks/call/voice`
    -   Status Callback URL: `https://your-server-domain.com/webhooks/call/status`
-   **API Key**: Create a standard API Key and secret.
-   **Phone Number**: Purchase/Rent a Twilio number and set his Messaging URL:
    -   Messaging Incoming URL: `https://your-server-domain.com/webhooks/sms/incoming`
    -   SMS Status Callback: `https://your-server-domain.com/webhooks/sms/status`

### 3. Backend Setup
```bash
cd server
npm install
# Configure .env based on .env.example
npm run dev
```

### 4. Frontend Setup
```bash
cd app
npm install
# Configure .env based on .env.example (or EXPO_PUBLIC_ prefixed vars)
npx expo start
```

## API Reference
-   `POST /api/v1/call/token`: Get Twilio Access Token.
-   `POST /api/v1/call/make`: Initiate a call.
-   `POST /api/v1/sms/send`: Send an SMS.
-   `GET /api/v1/history/calls`: Get call logs.

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | Environment (development/production) |
| `PORT` | Local server port |
| `SUPABASE_URL` | Supabase API URL |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_TWIML_APP_SID` | SID of your created TwiML App |
