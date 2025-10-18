# Mily

## Environments

Since Paul is the only one currently developing Mily, I tried to keep environment segregation as simple as possible, with two primary environments: one for development and one for production. If other developers begin contributing to the project, this will need to be expanded.

- Database
    - `test`: Locally hosted (ephemeral and disposable) for test suite
    - `development`: NeonDB
    - `production`: NeonDB
- Backend
    - `local`: Locally hosted (uses development database)
    - `development`: Railway
    - `production`: Railway
- Frontend
    - `local`: Locally hosted (uses local backend)
    - `preview`: Vercel at https://staging.mily.bio (used for CI/CD on pushes to `staging` branch)
    - `production`: Vercel at https://mily.bio
