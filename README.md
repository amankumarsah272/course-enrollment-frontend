# Course Enrollment System — Frontend

A responsive Course Enrollment System built with Next.js, TypeScript, and Tailwind CSS. It provides separate dashboards for Admin and Student users with a neumorphic (Soft UI) design.

## Live URLs

- **Frontend Application:** https://course-enrollment-frontend-tau.vercel.app/
- **Backend API:** https://course-enrollment-backend-mg4b.onrender.com
- **GitHub Repository:** https://github.com/amankumarsah272/course-enrollment-frontend

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- REST API integration
- JWT authentication

## Features

- Admin and Student login
- Role-based dashboards
- Admin course management
- Update course status
- Browse available courses
- Server-side pagination for course listings
- Six courses per page by default
- Previous and Next page navigation
- Enroll in courses
- View enrolled courses under My Courses
- Prevent duplicate enrollments
- Responsive interface
- Neumorphic Soft UI styling

## Application Pages

- Login
- Admin Dashboard
- Student Dashboard
- My Courses

## Pagination

The Admin and Student dashboards display courses with pagination.

- Six courses per page by default
- Previous and Next navigation
- Pagination data retrieved from the backend API
- Students see available active courses

## UI Design

The application follows the required neumorphic design using:

- Background color: `#dfe6e9`
- Soft raised cards with rounded corners
- Raised buttons and inset input fields
- Responsive layouts and readable form controls

## Demo Login Credentials

### Admin
- Email: `admin@example.com`
- Password: `Admin@123`

### Student
- Email: `student@example.com`
- Password: `Student@123`

These demo accounts are provided for assignment evaluation.

## Run Locally

### Prerequisites
- Node.js and npm
- Running backend API

### Installation

```bash
git clone https://github.com/amankumarsah272/course-enrollment-frontend.git
cd course-enrollment-frontend
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Start the frontend

```bash
npm run dev -- --port 3002
```

Open the application at:

**http://localhost:3002**

Ensure the backend is running on port `3001`.

## Deployment

The frontend is deployed on Vercel and communicates with the NestJS backend hosted on Render. The deployed frontend uses the backend URL configured in Vercel environment variables.

## Author

Course Enrollment System assignment project.