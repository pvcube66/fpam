# FPAMS — Faculty Performance Analysis & Management System

A full-stack, production-ready web application for tracking, validating, and analyzing faculty academic performance across university departments.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up database
npx prisma db push
node prisma/seed.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Demo Credentials

All accounts use password: `password123`

| Role | Email | Dashboard |
|------|-------|-----------|
| Faculty | faculty1@fpams.edu | /dashboard/faculty |
| HOD | hod@fpams.edu | /dashboard/hod |
| Principal | principal@fpams.edu | /dashboard/principal |
| IQAC | iqac@fpams.edu | /dashboard/iqac |
| Exam Cell | exam@fpams.edu | /dashboard/exam |
| Student | student1@fpams.edu | /dashboard/student |

## 🏗 Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Custom Design System
- **Database**: SQLite via Prisma ORM (portable to PostgreSQL)
- **Auth**: NextAuth.js with JWT + Role-Based Access Control
- **Charts**: Recharts (Bar, Pie, Line charts)
- **Reports**: jsPDF + jspdf-autotable (PDF export)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes (12 endpoints)
│   │   ├── activities/         # Faculty activity CRUD
│   │   ├── auth/               # NextAuth handler
│   │   ├── exam/results/       # Exam cell operations
│   │   ├── feedback/           # Student feedback
│   │   ├── hod/                # HOD validation + faculty
│   │   ├── iqac/reports/       # IQAC quality reports
│   │   ├── principal/          # Analytics + submissions
│   │   ├── subjects/           # Subjects listing
│   │   └── teaching-scores/    # Teaching score CRUD
│   ├── dashboard/              # 6 Role-based dashboards
│   │   ├── faculty/
│   │   ├── hod/
│   │   ├── principal/
│   │   ├── iqac/
│   │   ├── exam/
│   │   └── student/
│   ├── login/                  # Login page
│   ├── globals.css             # Design system
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   └── Providers.tsx           # NextAuth SessionProvider
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client singleton
└── middleware.ts               # Route protection (RBAC)

prisma/
├── schema.prisma               # Database schema (7 models)
├── seed.js                     # Sample data
└── dev.db                      # SQLite database
```

## 🔄 Workflow

```
Faculty Submits → HOD Validates & Assigns Marks → Principal Approves → Score Updated → Analytics Reflect Changes
```

Status indicators: `PENDING` → `UNDER_REVIEW` → `APPROVED` / `REJECTED`

## 📊 Features by Role

### Faculty
- Submit activities across 15 categories
- Upload teaching scores per subject
- Track submission status and marks

### HOD
- Filter submissions by year, faculty, category, status
- Validate/reject with marks and comments
- PDF report download

### Principal
- Department-wise analytics (Bar, Pie charts)
- Final approval with override
- PDF reports

### IQAC
- Quality metrics and trend analysis
- NAAC/NBA report export

### Examination Cell
- Upload and verify exam results

### Student
- 5-star faculty rating with anonymous option

## 🔒 Security

- JWT auth with bcrypt password hashing
- Role-based middleware on all routes
- Server-side authorization checks

## 📦 Deployment

For production, migrate to PostgreSQL by updating `DATABASE_URL` in `.env` and changing `provider` in `schema.prisma`.
