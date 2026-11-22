# Quickstart & Verification Guide: Sincronización y Reorganización de Gráficos

**Feature**: `006-sync-nodered-dashboard`

Esta guía detalla los pasos para validar que los gráficos de Node-RED se visualicen en 2 columnas, sin la barra "Home", y con las tarjetas superiores sincronizadas con los datos de telemetría viva.

---

## Prerrequisitos

1. **Node-RED en Ejecución**: En `http://localhost:1880/ui/`.
2. **Endpoint de Telemetría**: El endpoint `GET /api/telemetria` configurado en Node-RED respondiendo el último JSON de telemetría.
3. **Pestañas en Node-RED**:
   - Pestaña 0 (`/ui/#!/0`): Grupos Temperatura (ancho 6) y pH (ancho 6).
   - Pestaña 1 (`/ui/#!/1`): Grupo Humedad interna.

---

## Verificación 1: Supresión de la Barra Azul "Home"

1. Abrir `web/index.html` en el navegador.
2. Observar el área del gráfico en la pestaña "Calidad de Agua":
   - **Criterio de Aprobación**: No se observa ninguna franja azul superior con el texto "Home". El marco inicia limpiamente con los títulos de los grupos e instrumentos.

---

## Verificación 2: Layout en 2 Columnas (Calidad de Agua)

1. En la pestaña "Calidad de Agua", verificar en una pantalla de escritorio (ancho > 768px):
   - **Criterio de Aprobación**: Los 2 widgets (Temperatura y pH) aparecen alineados horizontalmente en 1 fila de 2 columnas (50% de ancho cada uno).
   - **Criterio de Aprobación**: El indicador de humedad NO aparece en esta vista.

---

## Verificación 3: Segregación de Interior Boya

1. Hacer clic en la pestaña **"Interior Boya (ESP32)"** en el dashboard web.
2. Observar el contenido del marco:
   - **Criterio de Aprobación**: Solo se muestra el indicador de Humedad interna del gabinete. Los sensores de agua no aparecen en esta pestaña.

---

## Verificación 4: Sincronización Numérica de las Tarjetas Superiores

1. Observar el valor numérico en el widget de Temperatura de Node-RED (ej. `26.3 °C`).
2. Observar la tarjeta superior "Temperatura del Agua":
   - **Criterio de Aprobación**: La tarjeta superior muestra exactamente `26.3 °C`.
3. Observar el valor en el widget de pH (ej. `7.15 pH`):
   - **Criterio de Aprobación**: La tarjeta superior "Nivel de pH del Agua" muestra exactamente `7.15 pH`.
4. Observar la tarjeta superior "Humedad Interna":
   - **Criterio de Aprobación**: Muestra exactamente el valor del sensor de humedad interna reportado por Node-RED.
