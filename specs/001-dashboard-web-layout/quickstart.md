# Quickstart & Validation Guide: Dashboard Web Layout

**Feature**: `001-dashboard-web-layout`

Este documento detalla los pasos para verificar y validar de forma interactiva el diseño visual del dashboard web sobre fondo blanco puro.

---

## 1. Requisitos Previos

- Cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge o Safari).
- No requiere Node.js, PHP ni servidores web complejos.

---

## 2. Ejecución y Visualización Local

Puedes abrir el archivo directamente en tu navegador o mediante un servidor HTTP local de desarrollo:

### Opción A: Abrir directamente el archivo
Abrir con doble clic o desde el navegador:
`C:\Clion\ESP32_Projects\monitoreo-boya-tilapia\web\index.html`

### Opción B: Servidor HTTP local rápido (Python)
```bash
cd C:\Clion\ESP32_Projects\monitoreo-boya-tilapia\web
python -m http.server 8080
```
Luego abrir: `http://localhost:8080`

---

## 3. Escenarios de Validación Visual

### Escenario 1: Verificación de Paleta sobre Fondo Blanco y Estética Workbench
1. Comprobar que el fondo general de la página sea blanco nítido (`#FFFFFF`), sin fondos oscuros ni sombras excesivas.
2. Verificar que las tarjetas tengan un borde sutil (`#E2E8F0`), esquinas redondeadas modernas (`12px` / `rounded-xl`) y sombra suave (`shadow-sm`).
3. Verificar que los textos principales estén en tipografía clara y números en formato tabular (`tabular-nums`).

### Escenario 2: Inspección de Tarjetas de Telemetría Acuícola
1. Localizar las 3 tarjetas de métricas en la parte superior:
   - **Temperatura del Agua**: Indicador numérico (ej. `28.2 °C`), rango recomendado visible (`26.0 - 30.0 °C`), badge en verde (`Óptimo`).
   - **pH del Agua**: Indicador decimal (ej. `7.4`), rango recomendado (`6.5 - 8.5`), badge de estado.
   - **Humedad Ambiental**: Indicador porcentual (ej. `68 %`), etiqueta descriptiva de ambiente.
2. Confirmar que los iconos Lucide correspondientes (termómetro, gota de agua, nube/humedad) se muestren alineados y nítidos.

### Escenario 3: Contenedores Modulares para Gráficos de Node-RED
1. Verificar que existan dos paneles de gráficos amplios debajo de las tarjetas métricas:
   - Panel 1: *Tendencia de Calidad de Agua*.
   - Panel 2: *Registro Ambiental del Estanque*.
2. Comprobar que cada panel cuente con sus botones de selector de tiempo (`1H`, `6H`, `24H`).
3. Comprobar que el área central muestre el *placeholder* estilizado indicando la preparación para recibir los gráficos de Node-RED sin desbordamiento.

### Escenario 4: Prueba de Adaptabilidad Responsiva (Responsive)
1. Abrir las Herramientas de Desarrollador (`F12`) en el navegador y activar la vista de dispositivo (*Device Mode*).
2. **Prueba Móvil (375px - 414px)**:
   - Las 3 tarjetas métricas deben apilarse ordenadamente una debajo de otra.
   - Los contenedores de gráficos deben ocupar el ancho completo sin generar barra de desplazamiento horizontal.
3. **Prueba Escritorio (1024px - 1440px)**:
   - Las tarjetas de telemetría deben distribuirse en una fila horizontal equilibrada.
   - Los paneles de gráficos deben mostrarse con suficiente altura y proporción panorámica.
