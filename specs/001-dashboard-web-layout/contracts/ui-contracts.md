# UI & Integration Contracts: Dashboard Web Layout

**Feature**: `001-dashboard-web-layout`

## Contract 1: Contrato de Actualización de Telemetría (DOM Binding)

Define la estructura de datos JavaScript esperada por el controlador del dashboard (`app.js`) para actualizar las tarjetas métricas y la barra de estado sin recargar la página.

```typescript
interface TelemetryUpdatePayload {
  device_id: string;             // ej. "BOYA-TILAPIA-01"
  timestamp: string;             // ISO-8601 o fecha local legible
  connected: boolean;            // true si la boya reporta señal
  metrics: {
    water_temperature: {
      value: number | null;      // Grados Celsius (ej. 28.5)
      status: "optimal" | "caution" | "critical" | "unknown";
    };
    ph_level: {
      value: number | null;      // Nivel de pH (ej. 7.3)
      status: "optimal" | "caution" | "critical" | "unknown";
    };
    ambient_humidity: {
      value: number | null;      // Porcentaje (ej. 72)
      status: "optimal" | "caution" | "critical" | "unknown";
    };
  };
}
```

### Evento Global en el Navegador:
El dashboard escuchará actualizaciones emitiendo o recibiendo el evento:
```javascript
window.dispatchEvent(new CustomEvent('tilapia:telemetry-update', {
  detail: payload
}));
```

---

## Contract 2: Contrato de Incrustación de Gráficos de Node-RED

Define cómo los contenedores modulares (`ChartSlot`) reservan su espacio y reciben la fuente gráfica desde Node-RED:

### 1. Marcador HTML en la Plantilla:
```html
<div class="card chart-card" id="slot-water-quality">
  <div class="card-header">
    <div class="card-title-group">
      <h3 class="card-title">Tendencia de Calidad de Agua</h3>
      <p class="card-description">Temperatura del agua (°C) vs. pH en el tiempo</p>
    </div>
    <div class="timeframe-selector" role="group" aria-label="Rango de tiempo">
      <button class="btn-timeframe active" data-range="1h">1H</button>
      <button class="btn-timeframe" data-range="6h">6H</button>
      <button class="btn-timeframe" data-range="24h">24H</button>
    </div>
  </div>
  <div class="card-content chart-container">
    <!-- Placeholder activo mientras no haya URL configurada -->
    <div class="chart-placeholder" id="placeholder-water-quality">
      <div class="placeholder-icon">
        <i data-lucide="line-chart"></i>
      </div>
      <p class="placeholder-title">Esperando integración con gráficos de Node-RED</p>
      <span class="badge badge-secondary">Tópico: boya/tilapia/telemetria/graficos</span>
    </div>
    <!-- Espacio preparado para inyección de iframe de Node-RED -->
    <iframe class="chart-frame hidden" id="frame-water-quality" src="" frameborder="0"></iframe>
  </div>
</div>
```

### 2. Evento de Cambio de Rango Temporal:
Cuando el usuario pulsa un botón de tiempo (`1H`, `6H`, `24H`), el contenedor emite:
```javascript
window.dispatchEvent(new CustomEvent('tilapia:timeframe-change', {
  detail: {
    slotId: "slot-water-quality",
    timeframe: "6h"
  }
}));
```
Esto permitirá que, al conectarse Node-RED en la siguiente etapa, se solicite dinámicamente el rango de datos correspondiente sin alterar el layout visual.
