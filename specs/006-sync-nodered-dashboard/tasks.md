# Tasks: Sincronización y Reorganización de Gráficos y Métricas Node-RED

**Input**: Design documents from `/specs/006-sync-nodered-dashboard/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-telemetria-contract.md`, `contracts/nodered-layout-contract.md`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuration constants, URLs, and DOM structure preparation for the multi-tab and synchronized layout.

- [X] T001 Define updated `NODERED_CONFIG` with dedicated tab paths (`waterTabPath: '/ui/#!/0'`, `ambientTabPath: '/ui/#!/1'`, `telemetryApiPath: '/api/telemetria'`) in `web/app.js`
- [X] T002 [P] Structure chart view slots and wrapper containers for water quality and enclosure views in `web/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base wrapper clipping styles and HTTP synchronization client required before user story features.

**⚠️ CRITICAL**: Must be completed before UI transitions and telemetry fetching are wired up.

- [X] T003 Define `.chart-iframe-wrapper` layout rules (`overflow: hidden`, `position: relative`, `border-radius: var(--radius-lg)`, `min-height: 520px`) in `web/style.css`
- [X] T004 Implement telemetry polling client function `fetchTelemetrySync()` with error recovery in `web/app.js`

**Checkpoint**: Foundation ready - containers can clip header bars and frontend has HTTP fetching primitives.

---

## Phase 3: User Story 1 - Segregación y Distribución de Gráficos en Dos Columnas (Priority: P1) 🎯 MVP

**Goal**: Present solely Water Temperature and pH widgets side-by-side in 2 columns on the "Calidad de Agua" tab, and internal humidity solely on the "Interior Boya" tab.

**Independent Test**: Open the dashboard and switch between tabs: "Calidad de Agua" displays only Temperature and pH side-by-side (2 columns on desktop), while "Interior Boya" displays solely the buoy enclosure humidity chart.

### Implementation for User Story 1

- [X] T005 [US1] Implement dynamic iframe URL routing pointing to `/ui/#!/0` for water quality and `/ui/#!/1` for buoy enclosure in `web/app.js`
- [X] T006 [US1] Update tab switcher click handlers (`#tab-water` and `#tab-ambient`) to switch active slot and synchronize target iframe view in `web/app.js`
- [X] T007 [US1] [P] Document exact Node-RED group width settings (Group "Temperatura" width 6, Group "pH del agua" width 6) in `specs/006-sync-nodered-dashboard/contracts/nodered-layout-contract.md`
- [X] T008 [US1] Apply responsive grid layout for multi-column chart slots ensuring single-column stacking on mobile viewports (< 768px) in `web/style.css`

**Checkpoint**: User Story 1 is functional. Views are strictly segregated and water charts display in 2 columns.

---

## Phase 4: User Story 2 - Integración Visual Limpia sin Barra Superior "Home" (Priority: P2)

**Goal**: Eliminate the blue "Home" header bar of Node-RED Dashboard so embedded charts blend seamlessly into the clean white Workbench design.

**Independent Test**: Observe the embedded iframe on both tabs: the blue "Home" navigation bar is completely invisible, and charts start immediately with instrument gauges/graphs.

### Implementation for User Story 2

- [X] T009 [US2] Apply CSS negative top displacement (`top: -48px`, `height: calc(100% + 48px)`) to `.chart-iframe-wrapper iframe` to cleanly crop out the Node-RED title bar in `web/style.css`
- [X] T010 [US2] Wrap `#iframe-water` and `#iframe-ambient` inside `.chart-iframe-wrapper` elements in `web/index.html`
- [X] T011 [US2] Add smooth visual fade-in transition and clean background styling to prevent white flashes during iframe load in `web/style.css`

**Checkpoint**: User Story 2 is functional. Node-RED header bar is completely suppressed from the view.

---

## Phase 5: User Story 3 - Sincronización en Tiempo Real entre Tarjetas Superiores y Gráficos (Priority: P3)

**Goal**: Keep top metric cards (Temperature, pH, Humidity) in exact 1:1 real-time synchronization with Node-RED's live data via periodic `GET /api/telemetria` polling.

**Independent Test**: When Node-RED receives a telemetry payload (e.g., 26.3 °C and 7.15 pH), the top metric cards update to the identical values within 1 second and evaluate corresponding biological thresholds.

### Implementation for User Story 3

- [X] T012 [US3] Replace autonomous random simulation with 1-second interval calling `fetchTelemetrySync()` against `http://localhost:1880/api/telemetria` in `web/app.js`
- [X] T013 [US3] Parse received JSON fields (`temperatura_agua`, `ph_agua`, `humedad_interna`) and update DOM metric values and status badges in `web/app.js`
- [X] T014 [US3] Implement fallback to graceful simulation or previous known reading if `GET /api/telemetria` is unreachable in `web/app.js`
- [X] T015 [US3] Update status pill display to show "En línea (Sincronizado con Node-RED)" upon successful HTTP telemetry reception in `web/app.js`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end visual coherence, responsive checks, and documentation validation.

- [X] T016 Verify layout coherence and touch targets across screen sizes (360px mobile, tablet, 1080p desktop) in `web/index.html`
- [X] T017 Execute full verification checklist per `specs/006-sync-nodered-dashboard/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks all user stories.
- **Phase 3 (User Story 1 - P1)**: Depends on Phase 2. Delivers MVP baseline (2 columns & tab separation).
- **Phase 4 (User Story 2 - P2)**: Depends on Phase 3 (refines iframe wrapper styling to hide "Home").
- **Phase 5 (User Story 3 - P3)**: Depends on Phase 2 (activates live telemetry polling for cards).
- **Phase 6 (Polish)**: Depends on Phases 1-5 completion.

---

## Parallel Execution Opportunities

- `T001` (`web/app.js`) and `T002` (`web/index.html`) can run in parallel.
- `T007` (`nodered-layout-contract.md`) can run in parallel with frontend styling (`T008`).
- `T009`/`T011` (`web/style.css`) can run alongside JS controller updates (`T012`/`T013`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (T001, T002) and Foundational (T003, T004).
2. Complete User Story 1 (T005, T006, T007, T008).
3. Validate that water quality shows Temp + pH in 2 columns and interior boya shows humidity.

### Incremental Delivery
1. Add User Story 2: Apply iframe wrapper clipping to eliminate the blue "Home" bar (T009–T011).
2. Add User Story 3: Wire up 1 Hz polling to `GET /api/telemetria` to synchronize cards with charts (T012–T015).
3. Polish and validate end-to-end per `quickstart.md` (T016–T017).
