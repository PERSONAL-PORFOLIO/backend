# Portfolio Backend

REST API for the portfolio website, handling content, authentication, file uploads, and contact messages.

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** — admin authentication
- **Cloudinary** + **Multer** — image/file uploads
- **Nodemailer** — contact form emails
- **bcryptjs** — password hashing

## Features

- Auth: login, JWT-protected admin routes
- CRUD endpoints for Profile, Skills, Experience, Projects, Education, Certificates
- File upload to Cloudinary (persistent across restarts)
- Contact form with email notification
- Visit analytics tracking
- Site settings management

## Getting Started

```bash
npm install
npm run dev
```

Seed initial admin user:

```bash
npm run seed
```

## Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm start
```
