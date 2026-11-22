# Implementation Plan: Dashboard Web Layout and Visual Design

**Branch**: `001-dashboard-web-layout` | **Date**: 2026-11-20 | **Spec**: [specs/001-dashboard-web-layout/spec.md](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/specs/001-dashboard-web-layout/spec.md)

**Input**: Feature specification from `/specs/001-dashboard-web-layout/spec.md`

## Summary

Implementar la arquitectura visual y maquetación completa del dashboard web para el monitoreo de estanques de tilapias. La interfaz adopta la estética de ingeniería limpia "Workbench" (inspirada en la estructura modular de `SWGEPA-staging`), basada en una paleta luminosa sobre fondo blanco puro (`#FFFFFF` / `oklch`), tres tarjetas métricas principales correspondientes a los 3 sensores del sistema:
1. **pH del Agua**: Sonda PHE-45P (SKU: Q004-SNS-PC-000) con módulo acondicionador.
2. **Temperatura del Agua**: Sonda sumergible DS18B20 (Digital, 1-Wire).
3. **Humedad Interna de la Boya**: Sensor ubicado junto al microcontrolador ESP32 para verificar estanqueidad y condensación interna.

Incluye insignias semánticas de estado operativo/acuícola y contenedores modulares con proporción reservada para la futura incrustación de gráficos de Node-RED (pestañas "Calidad de Agua" y "Ambiente Interno Boya"). La solución se desarrolla en HTML5 semántico, CSS3 con tokens y variables personalizadas, y JavaScript vanilla ligero sin dependencias pesadas ni frameworks de servidor.

## Technical Context

**Language/Version**: HTML5, CSS3 (Modern Flexbox/Grid + Variables CSS), JavaScript ES2022 (Vanilla, sin compilador ni runtime externo).

**Primary Dependencies**: 
- Lucide Icons (vía CDN o SVGs embebidos, para iconografía técnica consistente con SWGEPA).
- Ninguna dependencia pesada de frontend (sin Node.js/Vite en producción para el cliente web básico).

**Color Palette & Visual Tokens (Paleta Fondo Blanco)**:
- Fondo Principal (`--bg-page`): `#FFFFFF` (Blanco nítido) con soporte para superficie de panel `#F8FAFC` (Slate 50).
- Superficie de Tarjetas (`--bg-card`): `#FFFFFF` con borde sutil `#E2E8F0` (Slate 200) y sombra difusa `shadow-sm` (`0 1px 3px rgba(0,0,0,0.05)`).
- Texto Principal (`--text-primary`): `#0F172A` (Slate 900, alto contraste).
- Texto Secundario/Muted (`--text-muted`): `#64748B` (Slate 500).
- Acento Acuícola / Marca (`--color-primary`): `#0284C7` (Sky 600 - azul acuático estanque).
- Estados de Salud Biológica para Tilapia:
  - Óptimo / Normal (`--color-success`): `#10B981` (Emerald 500) / Fondo badge: `#ECFDF5`.
  - Advertencia / Precaución (`--color-warning`): `#F59E0B` (Amber 500) / Fondo badge: `#FFFBEB`.
  - Crítico / Peligro (`--color-danger`): `#EF4444` (Red 500) / Fondo badge: `#FEF2F2`.

**Storage**: LocalStorage opcional para persistir la selección del rango temporal preferido (1h, 6h, 24h). N/A para base de datos.

**Testing**: Pruebas de renderizado visual cross-browser (Chrome, Firefox, Edge, Safari móvil) y validación de diseño adaptativo en resoluciones de 360px a 2560px.

**Target Platform**: Cualquier navegador web moderno en escritorio (estación de control) y dispositivos móviles (operación en borde de estanque).

**Project Type**: Single-page Web Interface (SPA estática ligera en carpeta `web/`).

**Performance Goals**: 
- Tiempo de carga inicial < 500 ms en red local.
- Cero saltos acumulados de diseño (*Cumulative Layout Shift* = 0).

**Constraints**:
- Independiente de backend: Debe renderizarse correctamente como página estática sin requerir PHP, Laravel ni base de datos local.
- Respetar la proporción de los contenedores de gráficos para que Node-RED pueda integrarse mediante `<iframe>` o llamadas API sin rediseño posterior.

**Scale/Scope**: 1 vista principal unificada (Dashboard) con 3 tarjetas de telemetría, 2 contenedores de gráficos y barra de estado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Desacoplamiento Hardware-Servicios**: PASA. El dashboard web se implementa como capa de presentación independiente; no contiene lógica embebida ni dependencias de firmware.
- **Principle II: Integridad y Validación de Telemetría**: PASA. Se contemplan rangos y estados biológicos específicos para tilapias (Temp: 26-30 °C, pH: 6.5-8.5).
- **Principle III: Protocolo de Comunicación MQTT**: PASA. La interfaz prepara los contratos de datos desacoplados que luego se mapearán a los tópicos MQTT.
- **Principle IV: Pipeline con Node-RED**: PASA. Se crean contenedores modulares con dimensiones estandarizadas específicamente preparados para recibir los gráficos de Node-RED.
- **Principle V: Dashboard Web Ligero y Modular**: PASA. Uso estricto de HTML5, CSS3 y JS vanilla sobre fondo blanco limpio, sin frameworks pesados ni lógica de autenticación innecesaria.

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard-web-layout/
├── plan.md              # Este archivo (Plan de Implementación)
├── research.md          # Fase 0 (Decisiones de diseño y arquitectura de estilos)
├── data-model.md        # Fase 1 (Modelos de datos y estados de la interfaz)
├── quickstart.md        # Fase 1 (Guía de validación y prueba visual)
├── contracts/           # Fase 1 (Contratos de interfaz y eventos de gráficos)
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
web/
├── index.html           # Estructura semántica del dashboard (Shell, Métricas, Gráficos)
├── style.css            # Tokens de diseño fondo blanco, variables CSS, layout Grid/Flex
└── app.js               # Controlador JS ligero para renderizado de métricas y eventos
```

**Structure Decision**: Aplicación web estática simple en el directorio `web/` existente del repositorio, manteniendo la modularidad y facilitando su hosting por cualquier servidor HTTP ligero o directamente por Node-RED/Docker si se desea en el futuro.

## Complexity Tracking

*No violations identified. Architecture follows Constitution principles strictly.*
