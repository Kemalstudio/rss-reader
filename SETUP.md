# Frontpage — Setup & Getting Started

This is the complete implementation of the **Frontpage RSS Reader** product challenge. Here's how to get started.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your values:

- **NEXTAUTH_SECRET**: Generate a random string (min 32 chars). Use: `openssl rand -hex 32`
- **NEXTAUTH_URL**: `http://localhost:3000` for development
- **TURSO_DATABASE_URL**: Use `file:local.db` for local development, or a Turso URL for production

### 3. Initialize Database

For local development with SQLite:

```bash
npm run db:push
```

For Turso (production):

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontpage/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (auth, feeds, articles, etc.)
│   ├── dashboard/         # Authenticated dashboard pages
│   ├── guest/             # Guest tour experience
│   ├── login/signup       # Auth pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database client
│   ├── schema.ts         # Drizzle ORM schema
│   ├── feed-parser.ts    # RSS/Atom parsing & OPML
│   └── utils.ts          # Utility functions
├── data/                  # Sample feeds for guest experience
├── middleware.ts          # Auth middleware
└── tailwind.config.ts     # Tailwind configuration
```

## Features Implemented

### Core Features

- ✅ **User Authentication** — Signup, login with NextAuth
- ✅ **Feed Management** — Add, remove, organize feeds into categories
- ✅ **Article Timeline** — View all articles in a unified feed
- ✅ **Read/Unread Tracking** — Mark articles as read or unread
- ✅ **Bookmarks** — Save important articles for later
- ✅ **Search** — Search across all articles
- ✅ **OPML Import/Export** — Import subscriptions or export for backup
- ✅ **Categories** — Organize feeds by topic
- ✅ **Guest Experience** — Try the app without signing up

### Design-Your-Own Features

1. **Onboarding & Content Discovery**
   - New users see guided signup
   - Pre-populated categories on account creation
   - Add feeds interface with URL validation

2. **Digest / Summary View**
   - Weekly digest page to catch up on missed content
   - Personalized summaries of top articles
   - Accessible from main navigation

3. **Layout Customization**
   - Multiple view options: grid, list, compact
   - Responsive design for all screen sizes
   - Settings page for layout preferences

## Database Schema

The app uses **Turso** (SQLite) with Drizzle ORM:

- **users** — User accounts
- **categories** — Custom feed categories
- **feeds** — Subscribed RSS/Atom feeds
- **articles** — Parsed articles from feeds
- **articleReadState** — Per-user read/bookmark tracking
- **digestSummaries** — Cached weekly digests
- **layoutPreferences** — User UI customization
- **opmlExports** — OPML export history

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `POST /api/auth/signup` | POST | Create new account |
| `POST /api/auth/signout` | POST | Sign out |
| `GET /api/feeds` | GET | List user's feeds |
| `POST /api/feeds` | POST | Add new feed |
| `DELETE /api/feeds/[id]` | DELETE | Remove feed |
| `GET /api/articles` | GET | List articles with filters |
| `POST /api/articles/[id]` | POST | Update read/bookmark state |
| `GET /api/categories` | GET | List categories |
| `POST /api/categories` | POST | Create category |
| `GET /api/opml/export` | GET | Export feeds as OPML |
| `POST /api/opml/import` | POST | Import feeds from OPML |

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Set up a Turso database for production
5. Deploy!

```bash
vercel
```

### Deploy to Other Platforms

The app works on any platform that supports Node.js 18+:
- Netlify
- Render
- Fly.io
- AWS

Requirements:
- Node.js 18+
- Database (Turso, PostgreSQL, MySQL, etc.)
- S3 or similar for file uploads (if adding images)

## Development Tips

### Hot Reload

The development server hot-reloads on file changes. Just save and refresh your browser.

### Database Studio

View your database in a web UI:

```bash
npm run db:studio
```

### Lint & Format

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm run start
```

## Next Steps for Enhancement

- **Feed Refresh**: Set up background jobs to fetch new articles periodically
- **Full-Text Search**: Add ElasticSearch or Meilisearch for better search
- **Notifications**: Add email digests and push notifications
- **Analytics**: Track reading habits
- **Social**: Share articles, follow other readers
- **Mobile App**: Build native iOS/Android apps
- **Dark Mode**: Full dark mode support
- **Advanced Filtering**: Filter by read time, author, etc.

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
```

### Database connection issues

Check your `.env.local` file:
- Local: `TURSO_DATABASE_URL=file:local.db`
- Turso: Verify URL and auth token

### NextAuth not working

Make sure:
- `NEXTAUTH_SECRET` is set (min 32 chars)
- `NEXTAUTH_URL` matches your domain

### Feed parsing errors

Some feeds may fail to parse. The app logs errors to the console. Check if the feed URL is correct and publicly accessible.

## Support

For questions or issues:
1. Check the spec in `/spec/` folder
2. Review the [Frontend Mentor community](https://www.frontendmentor.io/community)
3. Open an issue on GitHub

## License

Open source project. Build on it, modify it, ship it!

---

Built with:
- **Next.js 15** — React framework
- **TypeScript** — Type safety
- **TailwindCSS** — Styling
- **Drizzle ORM** — Database
- **Turso** — SQLite cloud database
- **NextAuth** — Authentication
- **RSS Parser** — Feed parsing
