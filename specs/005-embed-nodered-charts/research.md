# Research: Incrustación e Integración de Gráficos de Node-RED

**Feature**: `005-embed-nodered-charts`

## Decision 1: URL Canónica de Incrustación de Node-RED

- **Decisión**: Utilizar como URL predeterminada `http://localhost:1880/ui/#!/0` y permitir su ajuste dinámico en `web/app.js`:
  ```javascript
  const NODERED_CONFIG = {
      defaultUrl: 'http://localhost:1880/ui/#!/0',
      storageKey: 'tilapia_nodered_url'
  };
  ```
- **Razón**: El parámetro provisto por el usuario incluía un `socketid` de sesión efímero (`?socketid=IZfXKWE1VjNn886NAAAK`). En Node-RED Dashboard, los socket IDs son generados por socket.io en cada conexión del navegador y expiran al desconectarse. Enlazar la ruta canónica `#!/0` asegura que el dashboard cargue la primera pestaña de gráficos de manera perpetua y estable.
- **Alternativas consideradas**:
  - *Usar la URL con socket ID fijo*: Se descartó porque provocaría desconexiones o recargas cíclicas de WebSocket cuando la sesión original expire.
  - *Incrustar SVG o Canvas renderizados por API REST*: Se descartó porque Node-RED Dashboard ya cuenta con gráficos interactivos dinámicos vía WebSocket listos para operar.

## Decision 2: Gestión del Ciclo de Carga del iFrame y Ocultamiento de Placeholders

- **Decisión**: Implementar un detector de evento `load` en el elemento `<iframe>`:
  1. Al iniciar la aplicación, se asigna el atributo `src` con la URL canónica.
  2. Mientras carga, se mantiene una animación sutil de espera en el contenedor.
  3. Al dispararse el evento `load`, se oculta el placeholder (`display: none` o clase `.hidden`) y se hace visible el iframe con una transición suave de opacidad (`fade-in`).
  4. Se incorpora un temporizador de seguridad (8 segundos): si el iframe no responde o falla, se muestra una tarjeta de advertencia con botón de reintento.
- **Razón**: Elimina cualquier salto acumulado de diseño (*CLS = 0*) y proporciona una transición visual limpia y profesional.

## Decision 3: Dimensionamiento y Estilos del Marco (Workbench Aesthetic)

- **Decisión**: Aplicar en `web/style.css`:
  - `min-height: 520px` (altura óptima para contener gráficos de series temporales de Node-RED con controles de leyenda).
  - `width: 100%`.
  - `border: none; border-radius: 0.75rem; background: #ffffff;`.
  - Contenedor con `box-shadow: 0 1px 3px rgba(0,0,0,0.05)` para mantener armonía visual con las tarjetas superiores.
- **Razón**: Maximiza el área visual panorámica permitiendo explorar las curvas de temperatura, pH y humedad sin barras de desplazamiento parásitas.

## Decision 4: Botones de Acción Rápida en la Cabecera del Panel

- **Decisión**: Agregar en la barra de herramientas del contenedor gráfico en `web/index.html`:
  1. **Botón Refrescar Gráfico** (`<button id="btn-refresh-chart">`): Recarga el `src` del iframe sin recargar toda la página web ni alterar el simulador de métricas.
  2. **Botón Abrir en Pestaña Nueva** (`<a id="btn-open-nodered" target="_blank">`): Abre `http://localhost:1880/ui/` directamente para acceso a pantalla completa si el operario lo requiere.
- **Razón**: Otorga control y flexibilidad al usuario para inspeccionar gráficos detallados o recuperar la conexión con un solo clic.
