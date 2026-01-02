# FinSmart Admin Dashboard

Related:

- https://github.com/mikhlasnr/FinSmart
- https://github.com/mikhlasnr/FinSmart-AI

Admin Dashboard for FinSmart Financial Literacy Platform.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript
- **UI Framework**: Shadcn UI (Tailwind CSS)
- **Backend/Database**: Firebase (Authentication & Firestore)
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context
- **Rich Text Editor**: Tiptap

## Features

1. **Authentication (Admin Only)**
   - Login with Email & Password
   - Forgot Password
   - Protected Routes with middleware and AdminGuard

2. **Module Management (CRUD)**
   - List modules with Table
   - Create/Edit modules with Dialog
   - Delete with confirmation AlertDialog
   - Navigate to exam page per module
   - Rich Text Editor for module content

3. **Exam Management (CRUD per Module)**
   - List exam questions per module
   - Create/Edit exam questions
   - Delete exam questions with confirmation

4. **Event Category Management (CRUD)**
   - List event categories
   - Create/Edit categories with auto-generate slug
   - Delete categories with confirmation

5. **Program/Event Management (CRUD)**
   - List events with complete information
   - Create/Edit events with Date Picker for startDate and endDate
   - Select category from dropdown (displays category name)
   - Rich Text Editor for event description
   - Date validation (end date must be >= start date)
   - Auto-correct end date if it's before start date
   - Delete events with confirmation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy Firebase configuration to `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Folder Structure

```
FinSmart-Admin/
├── app/
│   ├── (admin)/
│   │   ├── login/          # Login page
│   │   ├── modules/        # Module management
│   │   │   └── [moduleId]/
│   │   │       └── exams/  # Exam management per module
│   │   ├── categories/     # Event category management
│   │   ├── events/         # Event management
│   │   └── layout.tsx      # Admin layout with navigation
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Redirect to /login
├── components/
│   ├── ui/                 # Shadcn UI components
│   │   ├── form-field.tsx  # Reusable form field component
│   │   ├── rich-text-editor.tsx  # Rich text editor component
│   │   └── ...             # Other UI components
│   └── admin-guard.tsx     # Component for protected routes
├── firebase/
│   └── config.ts           # Firebase configuration
├── lib/
│   ├── auth-context.tsx    # Context for authentication
│   ├── types.ts            # Type definitions
│   └── utils.ts            # Utility functions
└── middleware.ts           # Middleware for protected routes
```

## Firestore Collections

- `modules`: Learning modules
  - `title` (string)
  - `description` (string)
  - `content` (string - HTML from Rich Text Editor)
  - `createdAt` (Timestamp)

- `exams`: Exam questions
  - `moduleId` (string)
  - `question` (string)
  - `keyAnswer` (string)
  - `maxScore` (number)

- `eventCategories`: Event categories
  - `name` (string)
  - `slug` (string)

- `events`: Events/Programs
  - `title` (string)
  - `description` (string - HTML from Rich Text Editor)
  - `categoryId` (string)
  - `startDate` (Timestamp)
  - `endDate` (Timestamp)
  - `registrationLink` (string)

## Notes

- Make sure to configure appropriate Firestore Security Rules
- All admin routes (except `/login`) require authentication
- Middleware will redirect to `/login` if user is not logged in
- The application uses light mode theme (dark mode is disabled)
- Form fields use reusable `FormField` component for consistent error handling
- Date validation ensures end date is always >= start date
- Calendar component supports min/max date restrictions
