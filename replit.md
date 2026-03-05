# StaffCast - Workforce Planning & Staffing Forecast

## Overview
StaffCast is a workforce planning and forecasting tool for managing a 35-store retail expansion. It helps store leaders plan staffing needs, manage hiring pipelines, track internal bench readiness, monitor attrition, and analyze competitive locations.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend API)
- **State Management**: TanStack React Query

## Key Features
1. **Dashboard** - Overview metrics (stores, employees, pipeline, attrition rate)
2. **Stores Management** - Track 5 existing + 35 planned stores with statuses
3. **Employee Management** - Track employees across stores with performance ratings
4. **Hiring Pipeline** - Kanban-style pipeline (Applied > Screening > Interview > Offer > Accepted)
5. **Attrition Tracking** - Monitor departures, reasons, backfill status
6. **Staffing Forecast** - Monthly timeline with hiring projections, bench vs external needs
7. **Internal Bench** - Track promotion readiness, high-potential employees
8. **Location Intelligence** - Competitive analysis with risk assessment per store
9. **Store Playbook** - Per-store opening preparation guide with 5 phases, position breakdown, and training timeline

## Data Model
- `stores` - Store locations with status, headcount targets, coordinates
- `positions` - Job roles with training requirements and leadership flags
- `employees` - Staff with store/position assignments, bench status, ratings
- `hiring_pipeline` - Candidates tracking through hiring stages
- `attrition_records` - Departure records with backfill tracking
- `competitors` - Competitor locations for competitive analysis

## Project Structure
```
client/src/
  pages/          - Dashboard, Stores, Employees, Pipeline, Attrition, Forecast, Bench, Locations, Playbook
  components/     - AppSidebar, ThemeProvider, shadcn ui components
server/
  routes.ts       - API endpoints for all entities + forecast
  storage.ts      - Database storage layer (CRUD operations)
  seed.ts         - Seed data with 40 stores, employees, pipeline, competitors
  db.ts           - Database connection
shared/
  schema.ts       - Drizzle schema definitions and Zod validation
```

## API Endpoints
- `GET /api/dashboard` - Dashboard statistics
- `GET/POST/PATCH/DELETE /api/stores` - Store CRUD
- `GET/POST/PATCH/DELETE /api/positions` - Position CRUD
- `GET/POST/PATCH/DELETE /api/employees` - Employee CRUD
- `GET/POST/PATCH/DELETE /api/pipeline` - Hiring pipeline CRUD
- `GET/POST/PATCH/DELETE /api/attrition` - Attrition records CRUD
- `GET/POST/DELETE /api/competitors` - Competitor CRUD
- `GET /api/forecast` - Staffing forecast with timeline
