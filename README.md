# Node Meta Careers Portal

Production-ready careers website for **Node Meta**, deployable to Vercel with support for custom domains such as `careers.nodemeta.com` or `jobs.nodemeta.com`.

## Features

- Public careers landing page, job listings, job details, and application flow
- Resume uploads via Vercel Blob
- MongoDB Atlas persistence with Mongoose
- Candidate confirmation and recruiter notification emails via Resend
- Protected admin dashboard for job and application management
- Auth.js credentials-based admin authentication
- Server-side validation, rate limiting, honeypot spam protection, and optional Cloudflare Turnstile
- SEO metadata, sitemap, robots.txt, and JobPosting JSON-LD

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MongoDB Atlas + Mongoose
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- Vercel Blob
- Resend
- Vitest

## Local Installation

```bash
git clone <repository-url>
cd nodemeta
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your environment values (see below).

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Public careers site URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_MAIN_WEBSITE_URL` | Official company website (`https://www.node-meta.com`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Random secret (32+ characters) for Auth.js |
| `ADMIN_EMAIL` | Initial admin login email |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `RESEND_API_KEY` | Resend API key |
| `RECRUITMENT_FROM_EMAIL` | Verified sender address in Resend |
| `RECRUITMENT_NOTIFICATION_EMAIL` | Internal recruiter notification inbox |
| `RECRUITMENT_CONTACT_EMAIL` | Public recruitment contact for fraud verification page |
| `TURNSTILE_SITE_KEY` | Optional Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Optional Cloudflare Turnstile secret key |
| `DUPLICATE_APPLICATION_HOURS` | Hours before duplicate applications are blocked (default: 24) |

## MongoDB Atlas Setup

1. Create a free or paid MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Allow network access for your development IP and Vercel deployment IPs (or `0.0.0.0/0` for testing only).
4. Copy the connection string into `MONGODB_URI`.

Example:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nodemeta-careers
```

## Vercel Blob Setup

1. Create a Vercel project for this repository.
2. Open the Vercel dashboard → Storage → Blob.
3. Create a Blob store and connect it to the project.
4. Add `BLOB_READ_WRITE_TOKEN` to your environment variables.

Resumes are stored with unique filenames and are only downloadable through protected admin routes.

## Resend Setup

1. Create a Resend account and verify your sending domain.
2. Generate an API key and set `RESEND_API_KEY`.
3. Configure:
   - `RECRUITMENT_FROM_EMAIL` – verified sender (e.g. `careers@yourdomain.com`)
   - `RECRUITMENT_NOTIFICATION_EMAIL` – internal hiring inbox

Emails are skipped gracefully in development if Resend variables are not configured.

## Admin Password Hashing

Generate a bcrypt hash for your admin password:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-strong-password', 12).then(console.log)"
```

Add the output to `.env.local`:

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>
AUTH_SECRET=<random-32-char-secret>
```

Never commit real credentials to Git.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin dashboard: [http://localhost:3000/admin-nodemeta-mateoandres/login](http://localhost:3000/admin-nodemeta-mateoandres/login)

## Seeding Example Jobs

The seed script creates three **draft** sample jobs clearly marked as `[SAMPLE]`:

```bash
npm run seed
```

Sample jobs are not auto-published in production. Review and publish manually from the admin dashboard when ready.

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # ESLint
npm run typecheck   # TypeScript check
npm run test        # Run Vitest tests
npm run seed        # Seed sample draft jobs
```

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example`.
4. Deploy.

Vercel will automatically build and host the Next.js application.

## Custom Domain Setup

To use `careers.nodemeta.com` or `jobs.nodemeta.com`:

1. In Vercel → Project → Settings → Domains, add the custom domain.
2. Create the DNS record Vercel provides (usually a CNAME).
3. Set `NEXT_PUBLIC_SITE_URL` to the production careers URL.
4. Redeploy after updating environment variables.

## Testing Application Submission

1. Seed sample jobs: `npm run seed`
2. Log in to `/admin-nodemeta-mateoandres/login`
3. Publish a job from `/admin-nodemeta-mateoandres/jobs`
4. Visit `/jobs`, open the job, and submit an application with a PDF resume
5. Confirm redirect to `/application-success`
6. Verify the application appears in `/admin-nodemeta-mateoandres/applications`

## Testing Email Notifications

1. Configure Resend environment variables
2. Submit a test application
3. Confirm:
   - Candidate receives confirmation email
   - Recruiter notification email arrives with admin review link

## Security Considerations

- All write operations are validated server-side with Zod
- Admin routes and APIs require authentication
- Login attempts are rate-limited with generic error messages
- Resume uploads validate extension, MIME type, and size
- Honeypot field blocks basic bot submissions
- Optional Cloudflare Turnstile support
- Security headers and CSP configured in `next.config.ts`
- Resume URLs are not exposed on public pages
- Secrets are stored only in environment variables

## Production Launch Checklist

- [ ] Configure all required environment variables in Vercel
- [ ] Review privacy notice with qualified legal counsel
- [ ] Set `RECRUITMENT_CONTACT_EMAIL` for fraud verification page
- [ ] Verify Resend domain and email deliverability
- [ ] Test application flow end-to-end in production
- [ ] Publish only reviewed job postings (not sample drafts)
- [ ] Connect custom domain (`careers.nodemeta.com` or `jobs.nodemeta.com`)
- [ ] Confirm MongoDB Atlas network access for Vercel
- [ ] Enable optional Turnstile for additional spam protection
- [ ] Rotate `AUTH_SECRET` and admin credentials before launch

## Project Structure

```text
src/
  app/              # App Router pages and API routes
  components/       # UI, layout, jobs, applications, admin
  config/           # Site config and environment validation
  lib/              # Auth, database, email, validation, security
  models/           # Mongoose models
  types/            # Shared TypeScript types
scripts/
  seed.ts           # Sample draft job seeder
```

## License

Private – Node Meta internal use.
