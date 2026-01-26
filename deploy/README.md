# Deployment

This directory contains configuration for deploying the Strapi application to different environments.

## Directory Structure

- `dev`: Development environment configuration (root `.env`).
- `prod`: Production environment.
- `uat`: UAT environment.

## How to Deploy

### Production

Navigate to the `deploy/prod` directory and run:

```bash
cd deploy/prod
docker-compose up -d --build
```

Ensure `deploy/prod/.env` is correctly configured before running.

### UAT

Navigate to the `deploy/uat` directory and run:

```bash
cd deploy/uat
docker-compose up -d --build
```

Ensure `deploy/uat/.env` is correctly configured before running.

### Development

Run from the root or `deploy` folder using `docker-compose.dev.yml`:

```bash
docker-compose -f deploy/docker-compose.dev.yml up -d
```
