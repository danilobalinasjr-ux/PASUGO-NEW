# PASUGO Database Foundation

## Purpose

This directory contains the MySQL 8.0 database foundation for PASUGO. It stores identity references, role profiles, rider verification, bookings, matching offers, location data, messaging records, payments, receipts, ratings, notifications, and audit records.

Authentication is handled later through Firebase Authentication. The database stores the Firebase UID and application data; it does not store passwords, Firebase secrets, or Google API keys.

## Structure

```text
database/
├── README.md
├── schema.sql
├── seed.sql
└── migrations/
    └── README.md
```

`schema.sql` creates the database and all Phase 1 tables. `seed.sql` inserts synthetic development service categories and one development administrator identity reference. No credentials are included.

## Tables

- `users`, `user_roles`, `customers`, `riders`, `administrators`: identity and role-specific profiles.
- `rider_documents`, `vehicles`, `rider_service_categories`, `rider_verification_history`: rider onboarding and verification.
- `service_categories`, `bookings`, `booking_items`, `booking_locations`, `booking_status_history`: services and booking lifecycle.
- `rider_offers`: explainable rider matching and offer records.
- `rider_current_locations`, `rider_location_history`: current and booking-related rider locations.
- `conversations`, `conversation_participants`, `messages`: normalized booking messaging.
- `payments`, `payment_events`, `receipts`: payment and purchase evidence records.
- `ratings`: customer score and feedback for a completed booking.
- `notifications`, `device_tokens`, `notification_deliveries`: in-app and push notification records.
- `audit_logs`: administrative and security-relevant activity history.

## Important Relationships

- Each application identity is stored once in `users`; roles are assigned through `user_roles`.
- `customers`, `riders`, and `administrators` extend `users` through one-to-one primary-key relationships.
- A customer owns many bookings. A booking belongs to one service category and may have one assigned rider.
- Pickup and destination are stored as immutable booking location snapshots.
- A booking has many status-history and rider-offer records, but at most one payment, conversation, and rating.
- Rider documents, vehicles, and supported categories belong to riders.
- Conversations contain users through `conversation_participants`; messages belong to conversations.
- Files are represented by private storage references in `file_url` columns. The files themselves are not stored in MySQL.

## Status Values

- User: `active`, `suspended`, `deleted`
- Rider verification: `pending`, `approved`, `rejected`, `suspended`
- Rider availability: `offline`, `online`, `busy`
- Document verification: `pending`, `approved`, `rejected`, `expired`
- Booking: `requested`, `matching`, `rider_selected`, `confirmed`, `en_route_pickup`, `arrived_pickup`, `in_progress`, `en_route_destination`, `completed_by_rider`, `awaiting_customer_confirmation`, `payment_pending`, `paid`, `rated`, `cancelled`, `expired`, `failed`, `disputed`
- Rider offer: `offered`, `accepted`, `declined`, `expired`, `withdrawn`
- Payment: `pending`, `authorized`, `paid`, `failed`, `refunded`, `cancelled`
- Notification delivery: `pending`, `sent`, `failed`

## Create the Database

Open a MySQL client with an account allowed to create databases:

```powershell
mysql -u root -p
```

Then run:

```sql
SOURCE C:/Users/NEC/OneDrive/Desktop/PASUGO/database/schema.sql;
```

The script creates `pasugo_db` with `utf8mb4`, then creates all tables using InnoDB.

You can also run it directly from PowerShell:

```powershell
mysql -u root -p < database/schema.sql
```

Use `mysql.cmd` instead of `mysql` if PowerShell execution-policy settings interfere with a command wrapper.

## Run Development Seed Data

After the schema exists:

```powershell
mysql -u root -p pasugo_db < database/seed.sql
```

The seed is safe to run repeatedly because category and development-admin inserts are idempotent.

## Verification Queries

```sql
USE pasugo_db;

SHOW TABLES;

SELECT table_name, engine, table_collation
FROM information_schema.tables
WHERE table_schema = 'pasugo_db'
ORDER BY table_name;

SELECT table_name, column_name, constraint_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'pasugo_db'
  AND referenced_table_name IS NOT NULL
ORDER BY table_name, column_name;

SELECT COUNT(*) AS service_category_count FROM service_categories;
SELECT COUNT(*) AS development_admin_count
FROM users
WHERE firebase_uid = 'development-admin-firebase-uid';

SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'pasugo_db'
ORDER BY table_name;
```

## Assumptions

- Firebase Authentication remains the identity provider; `firebase_uid` is required and unique.
- A user may hold more than one application role, so roles are normalized in `user_roles`.
- Booking pickup and destination are required for the workflow and are stored as two location snapshots.
- Each booking has one conversation and one payment record at most; payment events support provider retries and auditing.
- Receipts and identity documents are stored outside MySQL, with private references retained here.
- Payment provider, fee finalization rules, cancellation rules, and document-retention policy remain application-phase decisions.
- MySQL 8.0.16 or later is assumed so `CHECK` constraints are enforced.

Phase 2 backend endpoints are intentionally not included.
