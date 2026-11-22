# Contracts: Node-RED Embedding & Toolbar Interface

**Feature**: `005-embed-nodered-charts`

## Contrato 1: Enlace y URL Canónica de Incrustación

Define el origen y formato del recurso que se incrusta en el dashboard web.

- **URL Primaria de Incrustación**: `http://localhost:1880/ui/#!/0`
- **URL Base de Acceso Directo**: `http://localhost:1880/ui/`
- **Protocolo de Comunicación Interno**: WebSocket (`/ui/socket.io`) gestionado internamente por Node-RED dentro del sandbox del iframe.

---

## Contrato 2: Controles de Barra de Herramientas del Gráfico

Estructura de controles añadidos a la cabecera del panel panorámico:

```html
<div class="chart-actions-group">
  <!-- Botón de recarga del iframe -->
  <button id="btn-refresh-chart" class="btn-icon-action" title="Recargar gráficos de Node-RED" aria-label="Recargar gráficos">
    <i data-lucide="rotate-cw"></i>
  </button>
  <!-- Enlace para abrir Node-RED en pantalla completa -->
  <a id="btn-open-nodered" href="http://localhost:1880/ui/#!/0" target="_blank" rel="noopener noreferrer" class="btn-icon-action" title="Abrir en pestaña nueva" aria-label="Abrir en pestaña nueva">
    <i data-lucide="external-link"></i>
  </a>
</div>
```

---

## Contrato 3: Evento Personalizado de Refresco en el Navegador

Cuando el usuario hace clic en el botón de refrescar, la aplicación emite el evento global:

```javascript
window.dispatchEvent(new CustomEvent('tilapia:chart-refresh', {
    detail: {
        timestamp: new Date().toISOString(),
        url: 'http://localhost:1880/ui/#!/0'
    }
}));
```
