# Mily

- `git ls-files -z | xargs -0 wc -l | tail -n 1`
    - 2026-01-01: 28819 total lines

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
