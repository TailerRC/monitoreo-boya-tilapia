# Data Model: Sincronización y Reorganización de Gráficos y Métricas Node-RED

**Feature**: `006-sync-nodered-dashboard`

Este documento describe las entidades de datos, estados del controlador frontend y esquemas de payload involucrados en la sincronización.

---

## 1. Esquema de Telemetría Sincronizada (`TelemetryPayload`)

Payload recibido desde el endpoint HTTP de Node-RED (`GET /api/telemetria`):

| Campo | Tipo | Requerido | Descripción | Rango Físico / Válido |
|-------|------|-----------|-------------|-----------------------|
| `temperatura_agua` | `number` | Sí | Temperatura del estanque de tilapias (sonda DS18B20) | `10.0` a `45.0` °C |
| `ph_agua` | `number` | Sí | Nivel de acidez/alcalinidad (sonda PHE-45P) | `0.0` a `14.0` pH |
| `humedad_interna` | `number` | Sí | Humedad relativa dentro de la boya/gabinete ESP32 | `0.0` a `100.0` % HR |
| `timestamp` | `string` | Opcional | Marca de tiempo ISO 8601 de la última muestra | Formato ISO 8601 |
| `dispositivo` | `string` | Opcional | Identificador de la boya (ej. `BOYA-TILAPIA-01`) | Texto alfanumérico |

---

## 2. Modelo de Estado Frontend (`AppState`)

Estado reactivo mantenido en `web/app.js`:

```javascript
const state = {
    // Conectividad
    connected: true,
    lastSyncTimestamp: new Date(),
    syncSource: 'nodered-live', // 'nodered-live' | 'simulation-fallback'

    // Pestaña y Rango Activo
    activeTab: 'water',         // 'water' (Tab 0) | 'ambient' (Tab 1)
    timeframe: '1h',

    // URLs de Node-RED
    nodered: {
        baseUrl: 'http://localhost:1880',
        waterTabPath: '/ui/#!/0',
        ambientTabPath: '/ui/#!/1',
        telemetryApiPath: '/api/telemetria'
    },

    // Valores Sincronizados de Sensores
    metrics: {
        water_temp: 26.3,
        ph: 7.15,
        ambient_hum: 56.0
    }
};
```

---

## 3. Estados de Visualización del Marco de Gráficos (`ChartViewState`)

```
               ┌───────────────────────┐
               │    Iniciando Carga    │
               │  (Placeholder visible)│
               └───────────┬───────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [iframe 'load' exitoso]       [Watchdog timeout > 8s]
            ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Marco Activo Vivo     │ │  Tarjeta Fallback Error   │
│ (Barra 'Home' suprimida;  │ │(Node-RED inaccesible;     │
│ 2 columnas en Calidad Agua)│ │ botón de reintento)       │
└───────────────────────────┘ └───────────────────────────┘
```
