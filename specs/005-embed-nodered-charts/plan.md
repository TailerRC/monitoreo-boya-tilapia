# Implementation Plan: Integración e Incrustación de Gráficos de Node-RED en el Dashboard Web

**Branch**: `005-embed-nodered-charts` | **Date**: 2026-11-21 | **Spec**: [specs/005-embed-nodered-charts/spec.md](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/specs/005-embed-nodered-charts/spec.md)

**Input**: Feature specification from `/specs/005-embed-nodered-charts/spec.md`

## Summary

Conectar e incrustar la interfaz de gráficos en vivo servida por Node-RED (`http://localhost:1880/ui/#!/0`) en los contenedores panorámicos desacoplados del dashboard web existente (`web/index.html`, `web/app.js`, `web/style.css`). La implementación activa los marcos `<iframe>` preconfigurados, añade controles de recarga rápida y enlace externo, oculta los marcadores temporales tras la carga exitosa y garantiza un dimensionamiento responsivo fluido (mínimo 520px de alto, sin desbordamiento horizontal y con CLS = 0).

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 moderno (Custom Properties, Flexbox, Grid), JavaScript vanilla ES2022.

**Primary Dependencies**:
- Node-RED Dashboard (`http://localhost:1880/ui/#!/0`) corriendo en puerto 1880.
- Lucide Icons (CDN preconfigurado en `web/index.html`).

**Storage**: `localStorage` opcional para almacenar URLs personalizadas de Node-RED en caso de cambio de IP.

**Testing**: Validación visual en navegador (resoluciones desde 360px hasta 2560px), interacción táctil con gráficos de Node-RED embebidos y prueba de botón de recarga.

**Target Platform**: Cualquier navegador web moderno en escritorio y dispositivos móviles.

**Project Type**: Single-page Web Interface (`web/`).

**Performance Goals**:
- Tiempo de renderizado e inicialización del iframe < 1 segundo en red local.
- Cero saltos acumulados de diseño (*CLS = 0*).
- Altura reservada mínima de 520px para evitar colapso visual.

**Constraints**:
- La integración debe ser puramente frontend estática, sin requerir compiladores Node.js ni backend intermedio.
- Las tarjetas métricas superiores deben continuar actualizándose de forma autónoma cada 5 segundos sin reiniciar su estado al refrescar el iframe.

**Scale/Scope**: 1 panel gráfico panorámico con pestañas sincronizadas a Node-RED.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Desacoplamiento Hardware-Servicios**: PASA. El dashboard web consume los gráficos generados por Node-RED mediante un marco desacoplado; el ESP32 no participa en la renderización gráfica.
- **Principle II: Integridad y Validación de Telemetría**: PASA. Los gráficos visualizados en Node-RED reflejan exactamente los rangos y umbrales pactados en las features 002 y 004.
- **Principle III: Protocolo MQTT Estandarizado**: PASA. Node-RED se alimenta del tópico `tilapias/estanque1/datos`.
- **Principle IV: Pipeline con Node-RED**: PASA. Cumple de forma directa el principio constitucional: Node-RED es el motor gráfico y el dashboard web actúa como visualizador modular.
- **Principle V: Dashboard Web Ligero y Modular**: PASA. Incrustación limpia mediante iframe responsivo sobre fondo blanco puro Workbench, sin frameworks pesados.

## Project Structure

### Documentation (this feature)

```text
specs/005-embed-nodered-charts/
├── plan.md              # Este archivo (Plan de Implementación)
├── research.md          # Fase 0 (Decisiones de incrustación, seguridad y layout)
├── data-model.md        # Fase 1 (Modelos de estado del iFrame y configuración)
├── quickstart.md        # Fase 1 (Guía de verificación visual en navegador)
├── contracts/           # Fase 1 (Contratos de interacción y URLs)
│   └── embed-contract.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
web/
├── index.html           # Estructura HTML con iframes y controles de recarga
├── style.css            # Estilos del marco iframe (520px min-height, borderless, fade-in)
└── app.js               # Controlador JS que gestiona src, carga y eventos de recarga
```

**Structure Decision**: Se modifican directamente los archivos existentes en `web/` aprovechando los slots maquetados en la feature 001.

## Complexity Tracking

*No violations identified. Architecture follows Constitution principles strictly.*
