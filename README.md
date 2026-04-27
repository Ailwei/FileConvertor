**FileConvertor — Professional File Conversion Platform**

A full-stack file conversion web application that lets users upload and convert files (documents, images, audio, and video), manage conversion history, and subscribe to paid plans. This repository includes a React frontend, Express/Node backend, MongoDB models, Stripe integration for payments, and Docker support for easy deployment.

**Key Features**
- **User accounts:** Registration, login, password reset, profile management.
- **File conversion:** Upload files and convert them to supported formats with server-side processing.
- **Conversion history:** Store conversion logs and let users review or download past results.
- **Subscriptions & payments:** Stripe-based subscription plans and checkout flow.
- **Dashboard:** User-facing dashboard showing conversions, usage, and billing.
- **Dockerized:** Ready-to-run with `docker-compose` for local or cloud deployment.

**Tech Stack**
- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB / Mongoose
- **Payments:** Stripe
- **Testing:** Mocha/Chai + Selenium (end-to-end)
- **Deployment:** Docker, nginx (client Dockerfile)

**Quick Start (Local)**
Prerequisites: `node` (v14+), `npm`, and access to a MongoDB instance.

- **1) Clone**

```bash
git clone https://github.com/Ailwei/FileConvertor.git
cd FileConvertor
```

- **2) Backend**

```bash
cd server
npm install
cp .env
npm run dev
```

- **3) Frontend**

```bash
cd client
npm install
npm run dev
```

Open the frontend in your browser and point it at the running backend (see environment variables below).

**Docker (Recommended for quick setup)**
Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This will build images for the server and client and start containers. Adjust the compose file if you need to change ports or volumes.

**Environment Variables**
Create a `server/.env` file with the following (example):

- `PORT` — Backend port (e.g. `5000`)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing auth tokens
- `STRIPE_SECRET_KEY` — Stripe secret key for payments

Do not commit secrets to version control.

**API Overview**
Base path: `/api` (backend)

- **Authentication**
  - `POST /api/users/register` — Register a new user
  - `POST /api/users/login` — Authenticate and receive JWT
  - `POST /api/users/forgot-password` — Start password reset

- **Conversion**
  - `POST /api/convert/upload` — Upload file and start conversion (multipart/form-data)
  - `GET /api/convert/history` — Retrieve user's conversion history

- **Subscription**
  - `POST /api/subscription/create` — Create a new subscription (Stripe)
  - `GET /api/subscription/status` — Return subscription status for the user

For implementation details and route handlers, see the backend routes in [server/routes](server/routes).

**Project Layout**

- [client](client) — React front-end (Vite)
  - `Components/` — React components
  - `src/` — app entry and assets

- [server](server) — Express back-end
  - `models/` — Mongoose models (`User.js`, `File.js`, `Subscription.js`)
  - `routes/` — API route handlers (`ConvertFile.js`, `user.js`, `subscription.js`)
  - `middleware/` — file utilities, multer config, subscription confirmation
  - `uploads/` — temporary and converted files storage

- `docker-compose.yml`, `Dockerfile` — Docker configuration

**Running Tests**
- Unit & integration: located under `tests/` and subfolders. Run with Mocha:

```bash
# from project root
npm test
```

- End-to-end browser tests (Selenium) are included under `tests/specificTests` and require the app to be running locally. See `tests/README.md` or test files for specifics.

**Contributing**
- Please open issues or pull requests. For large changes, file an issue first to discuss the approach.
- Follow established code style and run tests before submitting a PR.

**Deployment Notes**
- When deploying, set secure environment variables and use a managed MongoDB instance.
- Configure HTTPS (TLS) on the nginx layer when serving the client in production.

**License & Contact**
- License: specify your license in `LICENSE` (if not present, add one).
- Maintainer: please update contact details here with your email or project link.

If you'd like, I can also add a short `server/.env.example`, CI workflow, or README badges (build, coverage, license). 