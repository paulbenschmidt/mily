# Mily

Mily is a personal timeline app for capturing the moments that make up a life — and, when you choose, sharing them with the people who matter. It's built around the idea of [sonder](https://www.dictionaryofobscuresorrows.com/post/23536922667/sonder): the realization that every person has a life as rich and nuanced as your own. Think shoebox of old photos, not social media feed: private by default, yours to export or delete, never sold to advertisers.

Live at [mily.bio](https://mily.bio). Read more about the why on the [about page](https://mily.bio/about).

## Features

- Build a personal timeline of life events with rich text, dates, and photos
- Selectively share individual events with specific people — grandparents to grandchildren, friends getting to know each other, partners on a date
- Reflection-first: works just as well as a private journal if you never share anything
- Export or delete your data at any time
- Mobile-friendly web app with secure authentication

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS, deployed on Vercel
- **Backend**: Django 5 + Django REST Framework (Python 3.12), managed with Poetry, deployed on Railway
- **Database**: PostgreSQL hosted on Neon
- **Storage**: AWS S3 for user-uploaded photos
- **Auth**: JWT in httpOnly cookies (web) / Authorization header (mobile), with CSRF protection, refresh-token rotation, and blacklisting
- **Email**: Resend
- **Analytics**: Vercel Analytics

## Repository Layout

```
mily/
├── backend/    # Django REST API (see backend/README.md for setup)
├── frontend/   # Next.js app (see frontend/README.md for setup)
├── docs/       # Project documentation
└── journal/    # Working notes and todos
```

Each subdirectory has its own README with setup instructions. Start there if you're getting the project running locally.

## Project Status

Mily is actively developed by a single maintainer (Paul). It's live in production but still evolving — features, schemas, and conventions may change without notice.

## Environments

Since Paul is the only one currently developing Mily, I tried to keep environment segregation as simple as possible, with one semi-local environment and two hosted environments: one for staging and one for production. If other developers begin contributing to the project, this will need to be expanded.

- Database
    - `test`: Locally hosted and ephemeral for test suite
    - `staging`: NeonDB
    - `production`: NeonDB
- Backend
    - `local`: Locally hosted (uses staging database)
    - `staging`: Railway
    - `production`: Railway
- Frontend
    - `local`: Locally hosted (uses local backend)
    - `preview` (staging): Vercel at https://staging.mily.bio (used for CI/CD on pushes to `staging` branch in GitHub)
    - `production`: Vercel at https://mily.bio
