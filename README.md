# File Conversion Service

This is a File Conversion Service application built using the MERN stack (MongoDB, Express.js, React, Node.js). The application allows users to convert files effortlessly with different subscription plans. 

## Features

- User Authentication
  - Login
  - Register
  - Forgot Password
  - Reset Password
- Subscription Plans
  - Free Trial
  - Basic
  - Premium
- File Conversion Services
  - Video
  - Document
  - Image
  - Audio
- User Dashboard
- Checkout Process

## Technologies Used

- MongoDB
- Express.js
- React
- Node.js
- Axios
- React Router DOM
- Selemiun for end to end testing
-Stripe for payment


## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-repo/file-conversion-service.git

cd file-conversion-service


PORT=5000
MONGODB_URI=mongodb://localhost:27017/yourdbname
JWT_SECRET=your_jwt_secret

cd backend
npm install
npm start

cd frontend
npm install
npm start

# Running Tests

cd client/tests
npx mocha tests/tests.cjs





