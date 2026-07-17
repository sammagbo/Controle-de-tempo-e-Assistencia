# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeetingManager** is an offline-first PWA (in Portuguese) for individual use during the midweek congregation meeting ("Nossa Vida e Ministério Cristão"): timing meeting parts, tracking the chairman's mandatory comments, counting attendance, and generating a final report. The full product spec — including non-negotiable rules — lives in `PRODUCT_STRATEGY.md` (and a condensed version in `.agent/ANTIGRAVITY_PROMPT.md`). Read it before changing domain behavior.

The repo contains two applications:

- **Frontend** (repo root): React 19 + TypeScript + Vite PWA
- **Backend** (`backend/`): Spring Boot 4 (Java 21) REST API + PostgreSQL + Flyway

## Migration in progress: Supabase → Spring Boot

The codebase is mid-migration away from Supabase toward the self-hosted Spring Boot API. Current state (see git history "Fase 1-5"):

- **Migrated**: `lib/AuthContext.tsx` authenticates via `lib/apiClient.ts` against `/api/v1/auth/*` (session cookie / JSESSIONID, `credentials: 'include'`).
- **Not yet migrated**: all `views/*.tsx` plus `lib/offlineSync.ts`, `lib/calendarSync.ts`, `lib/monthlyReport.ts`, `lib/seedWeeks.ts` still call Supabase directly through `lib/supabaseClient.ts`.
- The REST contract for the migration is defined in `docs/API_CONTRACTS.md`: base URL `/api/v1`, **snake_case JSON** (configured via Jackson `SNAKE_CASE` naming strategy to stay compatible with the existing TypeScript interfaces in `types.ts`), RFC 7807 Problem Details for errors.
- Root-level SQL files (`supabase_setup.sql`, `rls_migration.sql`, `seed_calendar_2026.sql`) are the legacy Supabase schema; the canonical schema for the new backend is in `backend/src/main/resources/db/migration/` (Flyway).

When migrating a view, replace Supabase queries with `api.get/post/put/delete` from `lib/apiClient.ts` following the contracts document.

## Commands

### Frontend (repo root)

```bash
npm install
npm run dev        # Vite dev server on port 3000; proxies /api → http://localhost:8080
npm run build      # Production build (also builds the PWA service worker)
npm run preview
npm run sync:pt    # Scrape jw.org workbook calendar (pt) into Supabase (legacy; needs .env)
npm run sync:fr    # Same, French
```

There is no frontend lint or test setup. Environment variables go in `.env` / `.env.local` (see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. `lib/supabaseClient.ts` falls back to a non-crashing mock client when these are unset.

### Backend (`backend/`)

```bash
docker compose up -d           # From repo root: starts PostgreSQL 16 (port 5432) + runs Flyway migrations
cd backend
./mvnw spring-boot:run         # API on port 8080
./mvnw test                    # All tests
./mvnw test -Dtest=ClassName   # Single test class
```

Database defaults (overridable via `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`): `meeting_db` / `meeting_user` / `meeting_password`. Hibernate runs with `ddl-auto: validate` — schema changes must be made as new Flyway migrations in `backend/src/main/resources/db/migration/` (`V{n}__Description.sql`), never by editing existing migrations or relying on JPA DDL.

## Architecture

### Frontend

Flat structure at the repo root (no `src/`); `@` is aliased to the root in `vite.config.ts` and `tsconfig.json`.

- `App.tsx` — `HashRouter` routes; every route except `/login` is wrapped in `ProtectedRoute` (redirects to `/login` when there is no session from `AuthContext`).
- `views/` — one component per screen/route. The core flow is Dashboard → SetupSession → LiveMeeting, with satellite screens (DisplayMode, CommentTracker, AttendanceCounter, MeetingReport, MeetingHistory, Statistics, Settings).
- `lib/` — everything non-view:
  - `meetingTemplate.ts` — **the official, immutable meeting structure** (`DEFAULT_MEETING_TEMPLATE`, `MEETING_SECTIONS`, `SectionKey`). The user never creates/edits/reorders parts; they only fill in names and record times.
  - `hooks/useMainTimer.ts`, `hooks/useCounselTimer.ts` — timer logic extracted from LiveMeeting.
  - `apiClient.ts` (new backend), `supabaseClient.ts` (legacy), `AuthContext.tsx`.
  - `offlineSync.ts` — localStorage queue of pending writes for offline-first behavior.
  - `translations.ts` — pt/fr string tables; UI strings go through this, not hardcoded.
  - `pdfGenerator.ts`, `monthlyReport.ts` — report/PDF export (jsPDF).
  - `validation.ts` — input validation helpers.
- `types.ts` — shared row types (`Period`, `Week`, `Meeting`, `AgendaItem`, `Attendance`, `Comment`) in **snake_case**, matching both the Supabase tables and the new API JSON. Add shared types here, not inline in views.
- Styling is Tailwind **via CDN script in `index.html`** (with inline `tailwind.config`), not a build-time dependency. Icons are Material Symbols; animations use GSAP.
- PWA config lives in `vite.config.ts` (`vite-plugin-pwa`): `/api` responses use a NetworkFirst runtime cache.

### Backend

Standard layered Spring Boot app under `backend/src/main/java/com/meetingmanager/api/`:

`controller/` → `service/` → `repository/` (Spring Data JPA) over `domain/` entities, with request/response records in `dto/` and `mapper/DtoMapper` converting entities ↔ DTOs. `exception/GlobalExceptionHandler` produces RFC 7807 responses. `security/SecurityConfig` uses session-based auth (form-less JSON login handled by `AuthController`, BCrypt passwords, `/api/v1/auth/login` is the only open endpoint; everything else under `/api/v1/**` requires authentication). CSRF is currently disabled during the migration.

### Domain rules that constrain code (from PRODUCT_STRATEGY.md)

- Timers only count **up** and never stop automatically; green while within estimated time, red with `+mm:ss` when over, `−mm:ss` shown if finished early. Estimated-vs-actual comparison appears **only in the final report**, never live.
- Timed chairman comments exist **only** after Bible reading and after each student part in "Faça Seu Melhor no Ministério" — never for Joias Espirituais, the Congregation Bible Study, songs, or prayers. Flow is automatic: part → comment → next part.
- Songs and prayers are not timed live (`skip_timing` on agenda items).
- Every user is fully independent — no shared or collaborative data.
- The app must work fully offline after first use; login is required for persistence but must never block live meeting use.
