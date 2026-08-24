# The Pearl Club - Supabase Backend Setup

This folder contains the database schema, SQL migrations, Row Level Security (RLS) policies, and seed data for **The Pearl Club**.

---

## Folder Structure

```
backend/
├── supabase/
│   ├── migrations/
│   │   ├── 01_schema.sql
│   │   └── 02_rls.sql
│   ├── seed/
│   │   └── seed.sql
│   ├── functions/
│   │   └── README.md
│   └── config/
│       └── config.toml
├── docs/
│   └── database.md
└── README.md
```

---

## Applying Migrations

If using the Supabase CLI:

```bash
supabase db push
```

Or manually copy and execute `01_schema.sql` and `02_rls.sql` in the Supabase SQL Editor dashboard.
