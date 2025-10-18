# Mily

## Environments

Since Paul is the only one currently developing Mily, I decided to keep things simple and only have two primary virtual environments: `development` and `production`. More specifically:

- Database
    - `test`: Locally hosted (ephemeral and disposable) for test suite
    - `development`: NeonDB
    - `production`: NeonDB
- Backend
    - `local`: Locally hosted (uses development database)
    - `development`: Railway
    - `production`: Railway
- Frontend
    - `local`: Locally hosted
    - `development`: Vercel
    - `staging` (called `preview`): Vercel (used for CI/CD on pushes to branch)
    - `production`: Vercel


If other developers eventually contribute to Mily, it'd be best to add true `local` environments (perhaps with a local database) and a true `staging` environment.
