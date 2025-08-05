# File Conversion Service

This is a File Conversion Service application built using the MERN stack (MongoDB, Express.js, React, Node.js). The application allows users to convert files effortlessly with different subscription plans.

## Features

- **User Authentication**
  - Login
  - Register
  - Forgot Password
  - Reset Password
- **Subscription Plans**
  - Free Trial
  - Basic
  - Premium
- **File Conversion Services**
  - Video
  - Document
  - Image
  - Audio
- **User Dashboard**
- **Checkout Process**

## Technologies Used

- **Backend**: MongoDB, Express.js, Node.js
- **Frontend**: React, Axios, React Router DOM
- **Payment Processing**: Stripe
- **Testing**: Selenium for end-to-end testing
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docke (optional)

### Installation

1. Clone the repository

```bash
git clone https://github.com/Ailwei/FileConvertor.git
```

2. Navigate to the project directory

```bash
cd FileConvertor
```

3. Create environment variables file in the server directory

```bash
# server/.env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. Install and run the backend

```bash
cd server
npm install
npm start
```

5. Install and run the frontend

```bash
cd client
npm install
npm start
```

### Docker Setup

Alternatively, you can use Docker to run the application:

```bash
docker-compose up --build
```

## Running Tests

### End-to-End Tests with Selenium

```bash
cd client
npm install selenium-webdriver chromedriver chai mocha
npx mocha tests/tests.cjs
```

### Prerequisites for Testing
- Chrome browser installed
- ChromeDriver (automatically handled by chromedriver package)
- Application running on localhost:3000

## Project Structure

```
FileConvertor/
├── client/                 # React frontend
│   ├── Components/         # React components
│   ├── src/               # Source files
│   ├── tests/             # Selenium tests
│   └── public/            # Static files
├── server/                # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── uploads/           # File uploads
├── docker-compose.yml     # Docker configuration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/forgot-password` - Forgot password

### File Conversion
- `POST /api/convert/upload` - Upload and convert files
- `GET /api/convert/history` - Get conversion history

### Subscription
- `POST /api/subscription/create` - Create subscription
- `GET /api/subscription/status` - Get subscription status