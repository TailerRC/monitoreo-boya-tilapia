# Implementation Plan: Variables Globales Oficiales y Simulación de Telemetría ESP32

**Branch**: `002-esp32-telemetry-simulation` | **Date**: 2026-11-21 | **Spec**: [specs/002-esp32-telemetry-simulation/spec.md](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/specs/002-esp32-telemetry-simulation/spec.md)

**Input**: Feature specification from `/specs/002-esp32-telemetry-simulation/spec.md`

## Summary

Incorporar la definición formal de las variables globales oficiales para los 3 parámetros de monitoreo (`temperatura_agua`, `ph_agua`, `humedad_interna`) en `src/main.cpp`, junto con un mecanismo de simulación dinámica que actualice y publique estos valores en el broker MQTT cada 1 segundo (1 Hz). La implementación reemplaza el `delay(5000)` bloqueante actual por una temporización no bloqueante basada en `millis()`, garantizando la preservación estricta y reactividad total de los servicios existentes: conectividad WiFi con autoreconexión, servidor web asíncrono en puerto 80 (`/`), actualizaciones por aire ElegantOTA en `/update` y reconexión a PubSubClient.

## Technical Context

**Language/Version**: C++11 / C++14 (Framework Arduino para ESP32).

**Primary Dependencies**:
- `PubSubClient@^2.8` (cliente MQTT para publicación al broker HiveMQ).
- `ayushsharma82/ElegantOTA@^4.0.0` (servidor de actualizaciones de firmware vía web).
- `ESP32Async/ESPAsyncWebServer` (servidor web asíncrono en puerto 80).
- `WiFi.h` (pila de red WiFi nativa de ESP32).

**Storage**: N/A (datos en memoria RAM volatile para telemetría en tiempo real).

**Testing**: Compilación PlatformIO (`pio run`), monitor serie a 115200 baudios y suscripción al tópico MQTT `tilapias/estanque1/datos`.

**Target Platform**: Microcontrolador ESP32 Dev Module (`platform = espressif32`, `board = esp32dev`).

**Project Type**: Embedded Firmware (C++ / PlatformIO).

**Performance Goals**:
- Ciclo de simulación y despacho cada 1000 ms (1 Hz ± 20 ms).
- Cero llamadas a `delay()` dentro del ciclo recurrente de `loop()`.
- Tiempo de respuesta HTTP en ElegantOTA y WebServer < 50 ms.

**Constraints**:
- MANTENER EL CÓDIGO ACTUAL: No modificar credenciales WiFi, rutas web existentes, configuración de ElegantOTA ni la arquitectura de reconexión MQTT.
- Solo añadir variables globales en la sección designada e implementar la lógica de simulación/despacho cada 1s en `loop()`.

**Scale/Scope**: 1 microcontrolador emitiendo 3 métricas en 1 tópico MQTT.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Desacoplamiento Hardware-Servicios**: PASA. El microcontrolador solo actualiza variables internas y emite mensajes JSON desacoplados por MQTT. No depende de ningún frontend ni servicio externo para mantener su ciclo de vida.
- **Principle II: Integridad y Validación de Telemetría Acuícola**: PASA. Los datos simulados se acotan dentro de los rangos admisibles de tilapia (25-31 °C para temperatura, 6.5-8.5 para pH) y de seguridad de la electrónica (< 70% para humedad interna). Se elimina el bloqueo por delay, asegurando resiliencia.
- **Principle III: Protocolo de Comunicación MQTT Estandarizado**: PASA. Publicación en formato JSON estructurado hacia el broker HiveMQ en `tilapias/estanque1/datos`.
- **Principle IV: Pipeline con Node-RED**: PASA. Los datos emitidos respetan la estructura requerida para ingesta directa en flujos de Node-RED.
- **Principle V: Dashboard Web Ligero y Modular**: PASA. La telemetría simulada se alinea exactamente con los contratos UI del dashboard web desarrollado en la feature 001.

## Project Structure

### Documentation (this feature)

```text
specs/002-esp32-telemetry-simulation/
├── plan.md              # Este archivo (Plan de Implementación)
├── research.md          # Fase 0 (Decisiones de temporización, tipos y simulación)
├── data-model.md        # Fase 1 (Variables globales y estructuras de datos)
├── quickstart.md        # Fase 1 (Guía de compilación y prueba de la simulación)
├── contracts/           # Fase 1 (Contratos de payload MQTT y salida Serial)
│   └── mqtt-telemetry-contract.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
src/
└── main.cpp             # Archivo principal de firmware ESP32
platformio.ini           # Configuración de compilación PlatformIO
```

**Structure Decision**: El proyecto es un firmware monolítico embebido centrado en `src/main.cpp`. Se mantendrán las secciones claramente comentadas para variables globales, setup y loop.

## Complexity Tracking

*No violations identified. Strictly complies with all principles.*
