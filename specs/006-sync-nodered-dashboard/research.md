# Research: Sincronización y Reorganización de Gráficos y Métricas Node-RED

**Feature**: `006-sync-nodered-dashboard`

Este documento consolida las decisiones técnicas para:
1. Eliminar la barra azul superior "Home" de Node-RED.
2. Distribuir Temperatura y pH en 2 columnas en la pestaña "Calidad de Agua" y segregar Humedad en "Interior Boya".
3. Sincronizar en tiempo real las tarjetas superiores con la telemetría viva de Node-RED.

---

## Decisión 1: Eliminación y Supresión de la Barra Azul "Home"

### Contexto
En Node-RED Dashboard (`node-red-dashboard` v2 / angular / 1.x), cada página incluye una barra de navegación superior (Navbar) que muestra el título de la página (por defecto "Home") con fondo azul (`#009688` o `#03a9f4`). Al embeberlo en un `<iframe>`, esta barra duplica títulos y rompe la continuidad visual limpia del dashboard web.

### Alternativas Evaluadas
1. **Configuración en Node-RED (Site -> Title Bar: Hidden)**:
   - *Ventaja*: La página no renderiza el elemento `<md-toolbar>` o cabecera.
   - *Desventaja*: Requiere que el usuario lo active manualmente en la interfaz de Node-RED.
2. **Encuadre CSS mediante Contenedor Wrapper (`overflow: hidden` + offset negativo)**:
   - *Ventaja*: El dashboard web oculta de forma 100% determinista la barra superior de 48px/56px sin importar la configuración interna de Node-RED, desplazando el inicio del iframe hacia arriba (`margin-top: -48px`).
   - *Desventaja*: Debe calibrarse la altura para no ocultar controles útiles.
3. **Estrategia Combinada (Recomendada)**:
   - Se implementa el contenedor wrapper con compensación visual en `web/style.css` (`.chart-iframe-wrapper`) que garantiza la supresión de la barra "Home", complementado con la instrucción en Node-RED para ocultar la barra de título en `Site`.

### Decisión
Se adopta la **Estrategia Combinada**. El contenedor `.chart-iframe-wrapper` en `web/style.css` recortará la barra superior azul de forma automática, garantizando que el usuario vea de inmediato los gráficos limpios sin requerir cambios complejos.

---

## Decisión 2: Segregación de Gráficos en Pestañas y Disposición en 2 Columnas

### Contexto
Actualmente, los 3 gráficos (Humedad, Temperatura y pH) se muestran apilados verticalmente en una sola columna bajo la misma página. El usuario requiere:
- **Pestaña Calidad de Agua**: Solo Temperatura y pH organizados en 2 columnas (lado a lado).
- **Pestaña Interior Boya**: Solo Humedad interna de la boya.

### Solución Técnica
1. **Estructura en Node-RED**:
   - Pestaña 1 (`/ui/#!/0`): "Calidad de Agua".
     - Grupo 1: "Temperatura" (ancho 6 unidades).
     - Grupo 2: "pH del agua" (ancho 6 unidades).
     - En una cuadrícula estándar de 12 columnas de Node-RED, dos grupos de ancho 6 se acomodan automáticamente en 1 fila de 2 columnas horizontales.
   - Pestaña 2 (`/ui/#!/1`): "Interior Boya".
     - Grupo 1: "Humedad Interna" (ancho 6 o 12 unidades).
2. **Sincronización de Pestañas en el Dashboard Web**:
   - Al pulsar la pestaña **"Calidad de Agua"** (`#tab-water`), el iframe carga `http://localhost:1880/ui/#!/0`.
   - Al pulsar la pestaña **"Interior Boya (ESP32)"** (`#tab-ambient`), el iframe conmuta a `http://localhost:1880/ui/#!/1`.

---

## Decisión 3: Sincronización en Tiempo Real de las Tarjetas Superiores (Opción A)

### Contexto
Las tarjetas superiores mostraban lecturas independientes generadas por un `setInterval` aleatorio (`runSimulationStep`), provocando discrepancias visibles con los gráficos de Node-RED.

### Solución Técnica
1. **Endpoint en Node-RED (`GET /api/telemetria`)**:
   - Flujo simple en Node-RED:
     `[mqtt in: tilapias/estanque1/datos] -> [function: guardar en context.global] -> [http in: GET /api/telemetria] -> [http response]`
   - Responde con JSON:
     ```json
     {
       "temperatura_agua": 26.3,
       "ph_agua": 7.15,
       "humedad_interna": 56.0,
       "timestamp": "2026-11-21T20:45:00Z"
     }
     ```
   - Headers: `Access-Control-Allow-Origin: *` para evitar problemas de CORS.
2. **Controlador Frontend (`web/app.js`)**:
   - Cada 1 segundo, `fetchTelemetrySync()` consulta `http://localhost:1880/api/telemetria`.
   - Si la petición tiene éxito:
     - Actualiza `state.metrics.water_temp`, `state.metrics.ph`, `state.metrics.ambient_hum`.
     - Llama a `renderTelemetry()`.
     - Actualiza el indicador de sincronización a "En línea (Sincronizado con Node-RED)".
   - Si Node-RED no responde o el endpoint aún no está montado:
     - Mantiene el último valor conocido o activa modo simulación fallback sin detener la interfaz.
