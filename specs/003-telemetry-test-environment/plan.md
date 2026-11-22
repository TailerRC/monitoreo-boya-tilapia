# Implementation Plan: Entorno de Pruebas y Validación Limpia de Telemetría

**Branch**: `003-telemetry-test-environment` | **Date**: 2026-11-21 | **Spec**: [specs/003-telemetry-test-environment/spec.md](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/specs/003-telemetry-test-environment/spec.md)

**Input**: Feature specification from `/specs/003-telemetry-test-environment/spec.md`

## Summary

Crear una suite y arnés de pruebas desacoplado en el directorio `test/` que tome como base el código de telemetría de `src/main.cpp` (fork de lógica), permitiendo someter la generación y recepción de datos a pruebas exhaustivas de limpieza, integridad sintáctica, conformidad de esquema JSON, cumplimiento de rangos de seguridad y regularidad de la cadencia de 1 Hz. El entorno proporciona un ejecutor de pruebas automatizado en Python (`test/test_telemetry_cleanliness.py`) con capacidad de prueba autónoma sin hardware (mock en memoria) y escucha en vivo sobre el broker MQTT (`tilapias/estanque1/datos`), garantizando que `src/main.cpp` permanezca 100% inalterado en producción.

## Technical Context

**Language/Version**: Python 3.10+ (Framework de pruebas y auditoría de telemetría) y C++ (Lógica de referencia en `src/main.cpp`).

**Primary Dependencies**:
- Python Standard Library (`json`, `time`, `unittest`, `dataclasses`, `math`).
- Opcional: `paho-mqtt` o sockets nativos para escucha en vivo sobre broker HiveMQ (`10.234.217.133:1883`).

**Storage**: Reportes de prueba en consola y archivo de log local (`test/test_report.json`).

**Testing**: Suite de pruebas automatizada ejecutable mediante `python -m unittest test/test_telemetry_cleanliness.py`.

**Target Platform**: Cualquier estación de trabajo de desarrollo (Windows/Linux/macOS) con CLion o terminal.

**Project Type**: Test Suite & Ingestion Quality Harness.

**Performance Goals**:
- Ejecución completa de la suite de pruebas en < 3 segundos en modo autónomo.
- Tasa de limpieza de telemetría: 100% (0 errores sintácticos, 0 valores `null`/`NaN`).
- Tolerancia temporal: 1000 ms ± 150 ms entre paquetes en pruebas de flujo continuo.

**Constraints**:
- `src/main.cpp` DEBE permanecer 100% inalterado: las pruebas se ejecutan en su propio espacio en `test/`.
- No requerir hardware físico ESP32 conectado para validar la lógica matemática y de serialización de telemetría.

**Scale/Scope**: 1 suite de pruebas con 6 baterías de test (sintaxis, esquema, tipos, rangos, cadencia temporal e inyección de anomalías).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Desacoplamiento Hardware-Servicios**: PASA. El arnés de prueba opera como consumidor y validador desacoplado; no interfiere con el ciclo de vida del microcontrolador ni inyecta dependencias al firmware.
- **Principle II: Integridad y Validación de Telemetría**: PASA. Es el núcleo de esta feature: verifica activamente que cada medición cumpla los rangos biológicos para tilapias y estanqueidad del ESP32.
- **Principle III: Protocolo de Comunicación MQTT Estandarizado**: PASA. Valida estrictamente el esquema JSON publicado en `tilapias/estanque1/datos`.
- **Principle IV: Pipeline con Node-RED**: PASA. Asegura que los datos que alimentan los flujos de Node-RED lleguen limpios y sin caracteres corruptos.
- **Principle V: Dashboard Web Ligero y Modular**: PASA. Garantiza que la interfaz web reciba telemetría estructurada acorde a los contratos de la feature 001.

## Project Structure

### Documentation (this feature)

```text
specs/003-telemetry-test-environment/
├── plan.md              # Este archivo (Plan de Implementación)
├── research.md          # Fase 0 (Arquitectura del arnés y validaciones)
├── data-model.md        # Fase 1 (Modelos de validación y reporte)
├── quickstart.md        # Fase 1 (Guía de ejecución de la suite de pruebas)
├── contracts/           # Fase 1 (Contratos de validación de datos limpios)
│   └── test-suite-contract.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
test/
├── telemetry_fork.py           # Fork desacoplado de la lógica de main.cpp
├── validator.py                # Validador de limpieza de datos y esquemas
├── test_telemetry_cleanliness.py # Suite de pruebas automatizadas (unittest)
└── live_mqtt_listener.py       # Suscriptor opcional de escucha en vivo en broker
```

**Structure Decision**: El directorio `test/` alberga la suite completa de pruebas, desacoplando los archivos de testing del código fuente embebido en `src/`.

## Complexity Tracking

*No violations identified. Strictly aligns with Constitution principles.*
