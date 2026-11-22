# Tasks: Integración e Incrustación de Gráficos de Node-RED en el Dashboard Web

**Input**: Design documents from `/specs/005-embed-nodered-charts/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/embed-contract.md`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verification of frontend files and Node-RED URL configuration.

- [X] T001 Define `NODERED_CONFIG` settings with default canonical URL `http://localhost:1880/ui/#!/0` and storage keys in `web/app.js`
- [X] T002 [P] Verify DOM insertion targets for chart action buttons and iframe slots in `web/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core CSS rules and frame transition helpers required for seamless embedding.

**⚠️ CRITICAL**: Must be completed before user story UI behaviors are executed.

- [X] T003 Define `.chart-iframe` layout rules (`min-height: 520px`, `width: 100%`, `border: none`, `border-radius: 0.75rem`) and smooth `.fade-in` animation in `web/style.css`
- [X] T004 Implement iframe load controller function `initNodeRedEmbed()` managing loading states and placeholder toggling in `web/app.js`

**Checkpoint**: Foundation ready - iframe container can receive and display embedded sources smoothly.

---

## Phase 3: User Story 1 - Visualización e Incrustación en Vivo de Gráficos de Node-RED (Priority: P1) 🎯 MVP

**Goal**: Deliver direct in-browser embedding of live Node-RED dashboard charts from `http://localhost:1880/ui/#!/0` inside the main panoramic slot, preserving native Node-RED widget styles while metric cards evaluate official thresholds.

**Independent Test**: Open `web/index.html` with Node-RED running: the placeholder disappears and the live interactive gauge and time-series charts from Node-RED render inside the dashboard.

### Implementation for User Story 1

- [X] T005 [US1] Set initial iframe source attribute and bind `load` event listener to unhide `iframe-water` and hide `placeholder-water` in `web/app.js`
- [X] T006 [US1] Ensure top metric cards maintain their autonomous 5-second simulated updates and aquaculture thresholds independently of iframe loading in `web/app.js`
- [X] T007 [US1] Apply responsive styles ensuring the iframe adapts cleanly without horizontal scrolling across mobile and desktop in `web/style.css`

**Checkpoint**: User Story 1 is functional. Node-RED charts load and display live in the dashboard web.

---

## Phase 4: User Story 2 - Control de Navegación de Pestañas y Recarga del Marco (Priority: P2)

**Goal**: Provide toolbar actions to refresh the iframe source and open Node-RED in a new tab, plus synchronized tab switching between water quality and buoy enclosure views.

**Independent Test**: Click the refresh icon button on the chart toolbar: the iframe reloads its connection to Node-RED without resetting the top telemetry metric cards.

### Implementation for User Story 2

- [X] T008 [US2] Add chart toolbar action buttons (refresh button `#btn-refresh-chart` and open in new tab link `#btn-open-nodered`) in `web/index.html`
- [X] T009 [US2] Style toolbar action buttons with hover states, icon alignment, and responsive placement in `web/style.css`
- [X] T010 [US2] Implement click handler for `#btn-refresh-chart` triggering iframe reload and dispatching `tilapia:chart-refresh` event in `web/app.js`
- [X] T011 [US2] Synchronize tab switcher buttons ('Calidad de Agua' vs 'Interior Boya (ESP32)') with the active iframe slot in `web/app.js`

**Checkpoint**: User Story 2 is functional. Users can refresh and navigate chart views comfortably.

---

## Phase 5: User Story 3 - Manejo de Estado Desconectado y Fallback Elegante (Priority: P3)

**Goal**: Display an informative fallback card with retry guidance if Node-RED is unreachable or takes longer than 8 seconds to load.

**Independent Test**: Load the dashboard with Node-RED offline or with an invalid port: an error card appears explaining that Node-RED is disconnected with a retry button.

### Implementation for User Story 3

- [X] T012 [US3] Implement load timeout watchdog (8-second threshold) displaying connection warning in `web/app.js`
- [X] T013 [US3] Add fallback error card markup with service diagnostic instructions and manual retry trigger in `web/index.html`
- [X] T014 [US3] Style fallback error state with subtle warning badge, clear typography, and action button in `web/style.css`

**Checkpoint**: All user stories are complete and resilient against network or service disruptions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual verification, accessibility, and documentation check.

- [X] T015 Verify visual coherence between top Workbench metric cards and embedded Node-RED panel in `web/index.html`
- [X] T016 Execute end-to-end verification checklist per `specs/005-embed-nodered-charts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks all user stories.
- **Phase 3 (User Story 1 - P1)**: Depends on Phase 2. Delivers MVP baseline.
- **Phase 4 (User Story 2 - P2)**: Depends on Phase 3 (extends toolbar and tab switching).
- **Phase 5 (User Story 3 - P3)**: Depends on Phase 3/4 (adds timeout protection).
- **Phase 6 (Polish)**: Depends on Phases 1-5 completion.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (T001, T002) and Foundational (T003, T004).
2. Complete User Story 1 (T005, T006, T007).
3. Validate in browser that Node-RED charts appear embedded inside the dashboard.

### Incremental Delivery
1. Add User Story 2: Implement refresh button and tab synchronization.
2. Add User Story 3: Implement 8-second watchdog timer and offline fallback card.
3. Polish and validate all viewports (mobile to desktop).
