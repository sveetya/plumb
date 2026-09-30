---
id: bot-ingest
title: Harden ingest bots — not the dashboard
allow:
  - src/app/api/send/route.ts
  - src/lib/detect.ts
  - src/tracker/
  - src/queries/sql/events/
  - src/queries/sql/sessions/
deny:
  - src/app/(main)/
  - src/app/api/websites/
  - src/queries/sql/getWebsiteStats.ts
strict: true
node_ids:
  - tracker
  - ingest-api
  - sql-write
---

# Harden ingest bots — not the dashboard

## Problem

Agents keep shipping "helpful" bot logic in the dashboard and stats read path. Umami already rejects bots on ingest with `isbot` in `src/app/api/send/route.ts`. The product bet is to stay on that pipe.

## Outcome

Bot handling lives on the collect/write path only. Read and Present stay untouched.

## In scope

- Browser tracker (`src/tracker/`)
- Ingest HTTP (`src/app/api/send/route.ts`)
- Client detection (`src/lib/detect.ts`)
- Write-side SQL used by send (`src/queries/sql/events/`, `src/queries/sql/sessions/`)

## Out of scope

- Dashboard UI (`src/app/(main)/`)
- Websites read API (`src/app/api/websites/`)
- Stats queries (`src/queries/sql/getWebsiteStats.ts`)

Wrong-layer agent help that edits Read or Present fails this check.
