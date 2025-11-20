# FinSmart Admin Dashboard

Admin Dashboard untuk Platform Literasi Keuangan FinSmart.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript
- **UI Framework**: Shadcn UI (Tailwind CSS)
- **Backend/Database**: Firebase (Authentication & Firestore)
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context

## Fitur

1. **Authentication (Admin Only)**
   - Login dengan Email & Password
   - Forgot Password
   - Protected Routes dengan middleware dan AdminGuard

2. **Manajemen Modul (CRUD)**
   - Daftar modul dengan Table
   - Create/Edit modul dengan Dialog
   - Delete dengan konfirmasi AlertDialog
   - Navigasi ke halaman ujian per modul

3. **Manajemen Ujian (CRUD per Modul)**
   - Daftar soal ujian per modul
   - Create/Edit soal ujian
   - Delete soal ujian dengan konfirmasi

4. **Manajemen Kategori Event (CRUD)**
   - Daftar kategori event
   - Create/Edit kategori dengan auto-generate slug
   - Delete kategori dengan konfirmasi

5. **Manajemen Program/Event (CRUD)**
   - Daftar event dengan informasi lengkap
   - Create/Edit event dengan Date Picker untuk showAt dan hideAt
   - Select kategori dari dropdown
   - Delete event dengan konfirmasi

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup Firebase:
   - Buat project Firebase di [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Buat Firestore Database
   - Copy konfigurasi Firebase ke file `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka [http://localhost:3000](http://localhost:3000) di browser

## Struktur Folder

```
FinSmart-Admin/
├── app/
│   ├── (admin)/
│   │   ├── login/          # Halaman login
│   │   ├── modules/        # Manajemen modul
│   │   │   └── [moduleId]/
│   │   │       └── exams/  # Manajemen ujian per modul
│   │   ├── categories/     # Manajemen kategori event
│   │   ├── events/         # Manajemen event
│   │   └── layout.tsx      # Layout admin dengan navigation
│   ├── layout.tsx          # Root layout dengan AuthProvider
│   └── page.tsx            # Redirect ke /login
├── components/
│   ├── ui/                 # Komponen Shadcn UI
│   └── admin-guard.tsx     # Komponen untuk protected routes
├── firebase/
│   └── config.ts           # Konfigurasi Firebase
├── lib/
│   ├── auth-context.tsx    # Context untuk authentication
│   ├── types.ts            # Type definitions
│   └── utils.ts            # Utility functions
└── middleware.ts           # Middleware untuk protected routes
```

## Firestore Collections

- `modules`: Modul pembelajaran
  - `title` (string)
  - `description` (string)
  - `content` (string - markdown)
  - `createdAt` (Timestamp)

- `exams`: Soal ujian
  - `moduleId` (string)
  - `question` (string)
  - `keyAnswer` (string)
  - `maxScore` (number)

- `eventCategories`: Kategori event
  - `name` (string)
  - `slug` (string)

- `events`: Event/Program
  - `title` (string)
  - `description` (string)
  - `categoryId` (string)
  - `showAt` (Timestamp)
  - `hideAt` (Timestamp)
  - `registrationLink` (string)

## Catatan

- Pastikan untuk mengatur Firestore Security Rules yang sesuai
- Semua route admin (kecuali `/login`) memerlukan authentication
- Middleware akan redirect ke `/login` jika user belum login
# FinSmart-Admin
