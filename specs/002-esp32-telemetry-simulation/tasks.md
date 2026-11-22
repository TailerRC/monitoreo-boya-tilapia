# Tasks: Variables Globales Oficiales y Simulación de Telemetría ESP32

**Input**: Design documents from `/specs/002-esp32-telemetry-simulation/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/mqtt-telemetry-contract.md`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification of firmware configuration and environment.

- [X] T001 Inspect and verify PlatformIO configuration flags and dependencies (`PubSubClient`, `ElegantOTA`, `ESPAsyncWebServer`) in `platformio.ini`
- [X] T002 Audit `src/main.cpp` structure to establish exact insertion anchors for global variables and loop routines while preserving all existing services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core variables and timing infrastructure required before implementing simulation routines.

**⚠️ CRITICAL**: Must be completed before user story logic can be finalized.

- [X] T003 Declare official global telemetry variables (`float temperatura_agua = 26.5f`, `float ph_agua = 7.20f`, `float humedad_interna = 55.0f`) under `// ===== TUS VARIABLES GLOBALES =====` in `src/main.cpp`
- [X] T004 Declare non-blocking timer variables (`const unsigned long INTERVALO_SIMULACION = 1000;` and `unsigned long tiempoUltimaSimulacion = 0;`) in `src/main.cpp`

**Checkpoint**: Foundation ready - global state and timer variables exist in memory.

---

## Phase 3: User Story 1 - Declaración y Centralización de Variables Oficiales (Priority: P1) 🎯 MVP

**Goal**: Deliver standardized, centralized global state for the 3 official metrics (DS18B20 water temperature, PHE-45P water pH, and internal buoy humidity) ready for future physical sensor integration.

**Independent Test**: Build and inspect firmware: confirm variables are globally scoped, initialized with biologically valid aquaculture/enclosure values, and logged upon startup.

### Implementation for User Story 1

- [X] T005 [US1] Document future hardware mappings (DS18B20 sumergible en `temperatura_agua`, PHE-45P en `ph_agua`, sensor interior gabinete en `humedad_interna`) in variable comments in `src/main.cpp`
- [X] T006 [US1] Add startup serial logging in `setup()` printing initialized official telemetry variable values at 115200 baud in `src/main.cpp`

**Checkpoint**: User Story 1 is complete. Official variables are declared, documented, and globally available.

---

## Phase 4: User Story 2 - Simulación Dinámica Periódica y Publicación MQTT (Priority: P2)

**Goal**: Generate realistic dynamic fluctuations in the 3 variables every 1 second and publish pure numerical JSON payloads to HiveMQ MQTT broker (`tilapias/estanque1/datos`).

**Independent Test**: Flash firmware and observe serial monitor: verify that every 1000 ms, values fluctuate realistically within safe bounds (25-31 °C, 6.5-8.5 pH, 45-75% HR) and are dispatched to the MQTT broker.

### Implementation for User Story 2

- [X] T007 [US2] Implement bounded random walk simulation step with `constrain` applying gradual fluctuations to `temperatura_agua` (25.0-31.0 °C), `ph_agua` (6.50-8.50), and `humedad_interna` (45.0-75.0%) in `src/main.cpp`
- [X] T008 [US2] Update MQTT payload JSON string serialization in `loop()` to include `temperatura` (%.1f), `ph` (%.2f), and `humedad_interna` (%.1f) per contract in `src/main.cpp`
- [X] T009 [US2] Add serial debug print statement outputting `[TELEMETRIA-1s]` reading and MQTT publish status at 115200 baud in `src/main.cpp`

**Checkpoint**: User Story 2 is complete. ESP32 publishes live simulated 3-variable telemetry at 1 Hz over MQTT.

---

## Phase 5: User Story 3 - Preservación de Servicios y Temporización No Bloqueante (Priority: P3)

**Goal**: Eliminate CPU-blocking calls in `loop()` so that concurrent services (WiFi autoreconnect, AsyncWebServer on port 80, and ElegantOTA on `/update`) operate with zero latency during continuous simulation.

**Independent Test**: Access `http://<IP-ESP32>/` and `http://<IP-ESP32>/update` in a web browser while the 1 Hz simulation is running; verify instantaneous response without timeouts or connection drops.

### Implementation for User Story 3

- [X] T010 [US3] Replace blocking `delay(5000)` in `loop()` with the non-blocking conditional check `if (millis() - tiempoUltimaSimulacion >= INTERVALO_SIMULACION)` in `src/main.cpp`
- [X] T011 [US3] Verify that `ElegantOTA.loop()`, WiFi connection checks, and `client.loop()` execute unblocked on every loop cycle in `src/main.cpp`

**Checkpoint**: All user stories are functional and fully concurrent without blocking delays.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, compilation check, and cleanup.

- [X] T012 Validate compilation of `src/main.cpp` with PlatformIO (`pio run`) ensuring 0 warnings and 0 errors
- [X] T013 Execute end-to-end validation checklist per `specs/002-esp32-telemetry-simulation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks all user stories.
- **Phase 3 (User Story 1 - P1)**: Depends on Phase 2. Delivers MVP baseline.
- **Phase 4 (User Story 2 - P2)**: Depends on Phase 3 completion.
- **Phase 5 (User Story 3 - P3)**: Depends on Phase 4 (integrates non-blocking timing around the simulation block).
- **Phase 6 (Polish)**: Depends on Phases 1-5 completion.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (T001, T002) and Foundational (T003, T004).
2. Complete User Story 1 (T005, T006).
3. Validate compilation to confirm official global state is established.

### Incremental Delivery
1. Add User Story 2: Implement dynamic fluctuation and 3-variable JSON payload.
2. Add User Story 3: Replace `delay(5000)` with `millis()` timer logic, ensuring ElegantOTA and WebServer remain 100% responsive.
3. Validate complete firmware with PlatformIO.
