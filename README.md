# Acquisitions API: Docker + Neon

This project supports separate development and production docker environments.

## Development (Neon Local)

Development uses Neon Local proxy in Docker and the app connects to:

`postgres://neon:npg@neon-local:5432/acquisitions`

Neon Local is configured for ephemeral branches using `PARENT_BRANCH_ID` and `DELETE_BRANCH=true`.

### Configure development env

Edit `.env.development` and set:

- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- optional `PARENT_BRANCH_ID`

### Start development

```bash
docker compose up --build
```

or explicitly:

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Production (Neon Cloud)

Production does not use Neon Local. The app connects directly to Neon Cloud via `DATABASE_URL` in `.env.production`.

### Configure production env

Set in `.env.production`:

- `DATABASE_URL=postgres://...neon.tech...`
- `USE_NEON_LOCAL=false`

### Start production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Environment switching summary

- `docker-compose.dev.yml` loads `.env.development`, which points `DATABASE_URL` to `neon-local`.
- `docker-compose.prod.yml` loads `.env.production`, which points `DATABASE_URL` to Neon Cloud.
- `src/config/db.js` enables Neon Local HTTP endpoint behavior only when `USE_NEON_LOCAL=true`.