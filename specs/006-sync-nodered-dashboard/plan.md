# Implementation Plan: Sincronización y Reorganización de Gráficos y Métricas Node-RED

**Branch**: `006-sync-nodered-dashboard` | **Date**: 2026-11-21 | **Spec**: [specs/006-sync-nodered-dashboard/spec.md](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/specs/006-sync-nodered-dashboard/spec.md)

**Input**: Feature specification from `/specs/006-sync-nodered-dashboard/spec.md`

## Summary

Reorganizar y sincronizar la experiencia integral del dashboard web y Node-RED. La implementación aborda tres aspectos fundamentales:
1. **Segregación y Layout 2 Columnas**: En la pestaña "Calidad de Agua" se presentan exclusivamente los widgets de Temperatura y pH lado a lado en 2 columnas (1 fila), mientras que la pestaña "Interior Boya" muestra exclusivamente el indicador de Humedad interna.
2. **Supresión Visual de la Barra "Home"**: Se elimina la cabecera/franja azul nativa de Node-RED Dashboard mediante configuración nativa de Node-RED (Site -> Title Bar: Hidden) y estilización con encuadre CSS en el contenedor del iframe (`.chart-iframe-wrapper`).
3. **Sincronización en Tiempo Real de Cards (Opción A)**: El frontend (`web/app.js`) consume periódicamente (`1s`) el endpoint HTTP `GET http://localhost:1880/api/telemetria` expuesto por un flujo ligero en Node-RED, sincronizando inmediatamente los números de las tarjetas superiores con los gráficos interactivos vivos.

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 moderno (Grid, Flexbox, clipping), JavaScript ES2022 vanilla (Fetch API).

**Primary Dependencies**:
- Node-RED Dashboard (`ui_gauge`, `ui_chart`, `http in`, `http response`) en puerto 1880.
- Lucide Icons (CDN).

**Storage**: `localStorage` para parametrizar la URL base de Node-RED (`http://localhost:1880`).

**Testing**: Validación visual responsiva (desde 360px hasta 1920px), verificación de coincidencia numérica exacta entre tarjetas y gráficos, y verificación de alternancia de pestañas.

**Target Platform**: Navegadores modernos (Google Chrome, Microsoft Edge, Mozilla Firefox) en desktop y móvil.

**Project Type**: Web Dashboard frontend desacoplado (`web/`) + Contrato de flujo Node-RED.

**Performance Goals**:
- Sincronización de tarjetas en tiempo real: latencia de sondeo < 1000ms.
- Cambio entre pestañas de gráficos: render instantáneo < 200ms.
- Cero saltos de diseño (*CLS = 0*).

**Constraints**:
- Mantener la arquitectura estática en `web/` sin frameworks ni compiladores pesados.
- Preservar las reglas biológicas acuícolas de evaluación en las tarjetas (badges de estado).
- Desacoplamiento total: si Node-RED está apagado, el dashboard degrada a fallback informativo sin romper el hilo de ejecución.

**Scale/Scope**: 2 pestañas gráficas especializadas y 3 tarjetas sincronizadas en tiempo real.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Desacoplamiento Hardware-Servicios**: PASA. El ESP32 sigue publicando a HiveMQ; el dashboard web interactúa con Node-RED para gráficos y telemetría sin requerir peticiones directas al microcontrolador.
- **Principle II: Integridad y Validación de Telemetría**: PASA. Las tarjetas evalúan exactamente los rangos biológicos (Temp: 26.0–30.0 °C, pH: 6.5–8.5, Humedad: < 70%).
- **Principle III: Protocolo MQTT Estandarizado**: PASA. El flujo se alimenta de `tilapias/estanque1/datos`.
- **Principle IV: Pipeline con Node-RED**: PASA. Node-RED actúa como orquestador exponiendo el endpoint `/api/telemetria` y sirviendo los dashboards tabulares especializados.
- **Principle V: Dashboard Web Ligero y Modular**: PASA. Sin dependencias externas pesadas, HTML/CSS/JS nativo.

## Project Structure

### Documentation (this feature)

```text
specs/006-sync-nodered-dashboard/
├── plan.md              # Este archivo (Plan de Implementación)
├── research.md          # Fase 0 (Investigación técnica de layout, recorte y sincronización)
├── data-model.md        # Fase 1 (Modelos de datos y estados sincronizados)
├── quickstart.md        # Fase 1 (Guía de verificación visual paso a paso)
├── contracts/           # Fase 1 (Contratos de interfaz y layout)
│   ├── api-telemetria-contract.md
│   └── nodered-layout-contract.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
web/
├── index.html           # Estructura del marco con wrapper para supresión de barra y pestañas
├── style.css            # Estilos del wrapper de encuadre, layout de 2 columnas y scroll limpio
└── app.js               # Polling a /api/telemetria, sincronización de tarjetas y cambio de pestañas
```

**Structure Decision**: Se actualizan directamente los componentes en `web/` y se provee el contrato de flujo exportable/configurable para Node-RED.

## Complexity Tracking

*No violations identified. Strictly aligned with project Constitution.*
