# Contract: Organización de Pestañas y Layout en Node-RED

**Feature**: `006-sync-nodered-dashboard`

Este contrato define la configuración requerida en Node-RED Dashboard para segregar las variables en 2 pestañas, acomodar los gráficos de agua en 2 columnas y ocultar la barra "Home".

---

## 1. Mapeo de Pestañas y URLs

| Pestaña Dashboard Web | Pestaña Node-RED | URL Canónica Embebida | Contenido Gráfico Exclusivo |
|-----------------------|------------------|-----------------------|------------------------------|
| **Calidad de Agua (DS18B20 / PHE-45P)** | Pestaña 1: `Calidad de Agua` | `http://localhost:1880/ui/#!/0` | 2 Columnas: Widget Temperatura + Widget pH |
| **Interior Boya (ESP32)** | Pestaña 2: `Interior Boya` | `http://localhost:1880/ui/#!/1` | 1 Columna: Widget Humedad interna |

---

## 2. Configuración de Layout en Node-RED Dashboard

### Pestaña 1 (`/ui/#!/0`): Calidad de Agua
- **Nombre de la pestaña**: `Calidad de Agua` (icono opcional: `water`).
- **Grupos configurados**:
  1. **Grupo "Temperatura"**:
     - Widget: `ui_gauge` (Sonda DS18B20).
     - Rango: `20` a `35` °C.
     - Ancho del Grupo: **`6`** unidades (50% de la cuadrícula de 12).
  2. **Grupo "pH del agua"**:
     - Widget: `ui_chart` o escala de pH (Sonda PHE-45P).
     - Rango: `0` a `14` (óptimo 6.5–8.5).
     - Ancho del Grupo: **`6`** unidades (50% de la cuadrícula de 12).
- **Resultado visual**: Al tener ancho 6 cada grupo, Node-RED los ubica automáticamente uno al lado del otro formando **1 fila de 2 columnas**.

### Pestaña 2 (`/ui/#!/1`): Interior Boya
- **Nombre de la pestaña**: `Interior Boya` (icono opcional: `shield`).
- **Grupo configurado**:
  1. **Grupo "Humedad Interna"**:
     - Widget: `ui_gauge` o `ui_chart` (Humedad gabinete).
     - Rango: `0` a `100` % HR.
     - Ancho del Grupo: **`6`** o **`12`** unidades.

---

## 3. Ocultamiento de la Barra de Título "Home"

### Método A: Configuración en Node-RED (Recomendado)
1. Abrir el menú lateral derecho en Node-RED -> pestaña **Dashboard** (icono de velocímetro).
2. Seleccionar la subpestaña **Site**.
3. En la sección **Title Bar**, desactivar la casilla **"Show title bar"** (o marcar *Hide*).
4. Hacer clic en **Deploy**.

### Método B: Supresión Automática Frontend (Garantía Visual)
El dashboard web aplica un contenedor wrapper con recorte superior en CSS:
```css
.chart-iframe-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 520px;
    overflow: hidden;
    border-radius: var(--radius-lg);
}

.chart-iframe-wrapper iframe {
    position: absolute;
    top: -48px; /* Recorta la franja superior de 48px si existe */
    left: 0;
    width: 100%;
    height: calc(100% + 48px);
    border: none;
}
```
Con este mecanismo, la barra azul queda excluida visualmente aún si Node-RED la tuviese activa.
