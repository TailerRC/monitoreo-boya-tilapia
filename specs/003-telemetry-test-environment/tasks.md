# Tasks: Entorno de Pruebas y Validación Limpia de Telemetría

**Input**: Design documents from `/specs/003-telemetry-test-environment/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/test-suite-contract.md`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test directory initialization and runtime environment verification.

- [X] T001 Create `test/` directory structure and ensure `.gitignore` ignores test logs and temporary report artifacts in `.gitignore`
- [X] T002 [P] Initialize test package and verify Python standard library dependencies (`json`, `time`, `unittest`, `dataclasses`, `math`) in `test/__init__.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation data structures, thresholds, and inspection engine required across all test scenarios.

**⚠️ CRITICAL**: Must be completed before user story test cases can be executed.

- [X] T003 Implement `ValidationResult` and `TestSuiteReport` data models and threshold constants (Temp: 24.0-32.0, pH: 6.00-9.00, Hum: 40.0-80.0) in `test/validator.py`
- [X] T004 Implement `TelemetryDataValidator` engine with 5-level inspection (JSON syntax, mandatory keys, numeric types, bounds, gradient) in `test/validator.py`

**Checkpoint**: Foundation ready - validator engine is available for both simulated and live streams.

---

## Phase 3: User Story 1 - Aislamiento del Entorno de Pruebas y Reproducibilidad (Priority: P1) 🎯 MVP

**Goal**: Deliver a standalone test fork replicating the exact telemetry generator of `src/main.cpp` without hardware dependencies or risk to production code.

**Independent Test**: Execute `python test/telemetry_fork.py --samples 5`: confirm 5 valid payloads are generated and printed without touching `src/main.cpp`.

### Implementation for User Story 1

- [X] T005 [US1] Create standalone telemetry generator fork replicating `src/main.cpp` variables and bounded random walk in `test/telemetry_fork.py`
- [X] T006 [US1] Implement CLI interface in `test/telemetry_fork.py` supporting `--samples` and `--interval` arguments for batch test generation

**Checkpoint**: User Story 1 is functional. The simulation runs autonomously in the test environment.

---

## Phase 4: User Story 2 - Validación de Integridad Estructural y Limpieza de Datos (Priority: P2)

**Goal**: Certify that 100% of telemetry payloads are clean, syntactically sound, strictly typed, and within biological bounds.

**Independent Test**: Run `python -m unittest test/test_telemetry_cleanliness.py`: all schema, type, range, and fault injection tests pass with 0 errors.

### Implementation for User Story 2

- [X] T007 [US2] Implement unit test cases for JSON syntax validity and mandatory keys (`temperatura`, `ph`, `humedad_interna`) in `test/test_telemetry_cleanliness.py`
- [X] T008 [US2] Implement unit test cases for numeric data types, decimal precision, and rejection of `None`/`null`/`NaN` in `test/test_telemetry_cleanliness.py`
- [X] T009 [US2] Implement unit test cases for safe tilapia biological ranges and enclosure humidity thresholds in `test/test_telemetry_cleanliness.py`
- [X] T010 [US2] Implement fault injection test suite verifying immediate detection and rejection of corrupted or truncated payloads in `test/test_telemetry_cleanliness.py`

**Checkpoint**: User Story 2 is functional. Any dirty or corrupt data is immediately detected and rejected.

---

## Phase 5: User Story 3 - Auditoría de Cadencia Temporal y Estabilidad Continua (Priority: P3)

**Goal**: Audit the continuity and time delta of telemetry batches, verifying 1 Hz consistency and generating structured summary reports.

**Independent Test**: Run `python test/telemetry_fork.py --samples 30 --report`: confirm report indicates 100% cleanliness rate and ~1000 ms cadence with verdict "APROBADO".

### Implementation for User Story 3

- [X] T011 [US3] Implement continuous timing measurement and jitter auditor (1000 ms ± 150 ms tolerance) in `test/test_telemetry_cleanliness.py`
- [X] T012 [US3] Implement consolidated test report generator outputting summary metrics to console and JSON format in `test/test_report.json` within `test/validator.py`
- [X] T013 [P] [US3] Implement optional live MQTT stream subscriber and real-time cleanliness validator in `test/live_mqtt_listener.py`

**Checkpoint**: User Story 3 is functional. Flow continuity, timing, and reporting are fully audited.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end execution, documentation alignment, and final validation.

- [X] T014 Execute full automated test suite `python -m unittest test/test_telemetry_cleanliness.py -v` verifying 100% pass rate
- [X] T015 Validate end-to-end quickstart execution per `specs/003-telemetry-test-environment/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks all user stories.
- **Phase 3 (User Story 1 - P1)**: Depends on Phase 2. Delivers MVP baseline.
- **Phase 4 (User Story 2 - P2)**: Depends on Phase 3 (tests evaluate generator outputs).
- **Phase 5 (User Story 3 - P3)**: Depends on Phase 4 (timing and live listener leverage validator).
- **Phase 6 (Polish)**: Depends on Phases 1-5 completion.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (T001, T002) and Foundational (T003, T004).
2. Complete User Story 1 (T005, T006).
3. Validate fork generator independently with `--samples 5`.

### Incremental Delivery
1. Add User Story 2: Implement schema, type, and fault injection tests in `test_telemetry_cleanliness.py`.
2. Add User Story 3: Implement timing auditor, report generator, and optional live listener.
3. Validate complete test harness execution across all scenarios.
