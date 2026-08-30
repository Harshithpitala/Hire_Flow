# HireFlow — Smart Job & Placement Management Platform

HireFlow is a production-grade full-stack MERN SaaS platform engineered to streamline campus placements and modern recruitment pipelines. It connects students, enterprise recruiters, and placement administrators within a unified, real-time ecosystem.

## Key Features
- **Role-Based Workflows**: Tailored, isolated access tiers for Students, Recruiters, and Platform Admins.
- **Dynamic Job Discovery**: Server-side faceted filtering, text search indexing, and pagination.
- **Smart Skill Matching**: Programmatic matching engine displaying alignment percentages and missing skills.
- **Real-Time Notification Pipeline**: Socket.IO integration for instant application state transitions.
- **Cloud-Native Asset Handling**: Direct streaming of resumes and company collateral via Cloudinary.
- **Recruitment Analytics**: Data-driven conversion and funnel metrics computed directly via MongoDB aggregation.

## Tech Stack
- **Frontend**: React (Vite), Context API, Native CSS Variables, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, Nodemailer, Socket.IO
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Cloud Services**: Cloudinary (Assets), Render (API Engine), Vercel (Client UI)

## Getting Started Locally

### 1. Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev

## Production deployment

Deploy the API from the `server` directory to Render, then deploy the `client`
directory to Vercel.

1. Push this repository to GitHub and create a Render Web Service from the
   repository. Render can read `render.yaml`; supply the values marked as
   secrets from `server/.env.example`.
2. After Render gives you an API URL, deploy `client` to Vercel and set
   `VITE_API_BASE_URL` to `https://<your-render-service>.onrender.com/api` and
   `VITE_SOCKET_URL` to `https://<your-render-service>.onrender.com`.
3. Copy the Vercel production URL into the Render `CLIENT_URL` environment
   variable and redeploy the API. This enables browser requests and Socket.IO
   connections from the live client.

Never commit real `.env` files. The checked-in `.env.example` files list all
required settings without exposing credentials.
