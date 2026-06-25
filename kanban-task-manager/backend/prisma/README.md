# Database Setup

Run the initial migration:

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database file at `prisma/dev.db` based on `schema.prisma`.
