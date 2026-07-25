# Oshimiri Production Operations

## Monitoring

- Monitor `GET /api/health` from an external uptime service every minute.
- Alert on non-200 responses, latency above two seconds, container restarts, disk usage above 80%, and database connection exhaustion.
- Retain structured container logs for at least 30 days.

## PostgreSQL backups

Run a daily encrypted database backup outside the application container:

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > "oshimiri-$(date +%F).dump"
```

Copy backups to a private, versioned S3 bucket with lifecycle retention. Never place backups in the public image bucket.

Test restoration monthly in an isolated database:

```bash
createdb oshimiri_restore_test
pg_restore --clean --if-exists --no-owner --dbname=oshimiri_restore_test backup.dump
```

Record the restoration date, duration, backup identifier, and result.

## Deployment order

1. Back up PostgreSQL.
2. Apply Prisma migrations.
3. Create or update the administrator with `npm run admin:create`.
4. Deploy the backend.
5. Deploy the frontend with matching environment variables.
6. Verify health, admin sign-in, product search, seller access, uploads, enquiries, and reports.

Store database, administrator bootstrap, Turnstile, Resend, and AWS credentials in the deployment secret store. Do not commit them or include them in Docker images.
