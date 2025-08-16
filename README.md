# Alumni Portal Frontend

## Project Setup Complete! 🎉

Your Next.js frontend is now ready and integrated with your Django backend. Here's what has been configured:

### ✅ What's Included

1. **Next.js 15** with TypeScript and Tailwind CSS
2. **Authentication System**
   - JWT token management with auto-refresh
   - Login/Register pages with role-based access
   - Protected routes and authentication context
3. **API Integration**
   - Axios client configured for Django backend
   - Automatic token handling and error management
   - Type-safe API calls
4. **UI Components**
   - Student and Alumni dashboards
   - Professional landing page
   - Protected route components
   - Toast notifications

### 🚀 Getting Started

1. **Start the Development Server:**

   ```bash
   cd "e:\Semester Project\frontend"
   npm run dev
   ```

2. **Visit Your Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000 (Django)

### 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── student/
│   │   │   └── alumni/
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   └── lib/                   # Utilities and configurations
│       └── api.ts             # API client
├── .env.local                 # Environment variables
└── package.json
```

### 🔧 Environment Configuration

The `.env.local` file is configured for local development:

- Django API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`

### 🎯 Key Features

1. **Role-Based Access:**

   - Students: Profile management, alumni search, job opportunities
   - Alumni: Mentoring, job posting, networking

2. **Authentication Flow:**

   - JWT tokens with automatic refresh
   - Persistent login state
   - Secure logout with token cleanup

3. **API Integration:**
   - Type-safe requests to Django backend
   - Error handling and loading states
   - Automatic authentication headers

### 📝 Next Steps

1. **Start Django Backend:**

   ```bash
   cd "e:\Semester Project\backend"
   python manage.py runserver
   ```

2. **Test the Integration:**

   - Register a new account at http://localhost:3000/auth/register
   - Login and explore the dashboards
   - Check API calls in browser dev tools

3. **Customize:**
   - Update branding in components
   - Add more pages and features
   - Integrate with your Django models

### 🛠 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### 🔍 Troubleshooting

1. **CORS Issues:** Ensure Django CORS settings allow frontend domain
2. **API Errors:** Check Django server is running on port 8000
3. **Token Issues:** Clear browser storage and re-login

Your modern Alumni Portal frontend is ready! 🚀
