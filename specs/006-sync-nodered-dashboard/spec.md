# Feature Specification: Sincronización y Reorganización de Gráficos y Métricas Node-RED

**Feature Branch**: `006-sync-nodered-dashboard`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: ", los 3 graficos no se van a mostrar de esta manera, ya que interior de agua solo debe haber ph y temperatura, interiro boya debe ir el de humedad aparte los numeros representantes noe stan sincronizadas con las cards y eliminemos ese linea de home q aparece, los 2 graficos se asenturaran en una fila de 2 columnas"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Segregación y Distribución de Gráficos en Dos Columnas (Priority: P1) 🎯 MVP

Como operario o técnico acuícola que supervisa el estanque de tilapias,
quiero ver en la pestaña de "Calidad de Agua" exclusivamente los indicadores de Temperatura y pH organizados lado a lado en una fila de dos columnas, y en la pestaña de "Interior Boya" exclusivamente el indicador de Humedad interna,
para analizar de un vistazo los factores críticos del agua de forma compacta y sin mezclar variables del gabinete físico de la boya.

**Why this priority**: Es la reorganización visual central solicitada por el usuario: elimina el amontonamiento vertical de 3 widgets y ubica cada variable en su contexto operativo adecuado.

**Independent Test**: Al ingresar al dashboard web y seleccionar "Calidad de Agua", se visualizan únicamente los gráficos de Temperatura y pH lado a lado en 2 columnas; al alternar a la pestaña "Interior Boya", se visualiza únicamente el indicador de humedad de la boya.

**Acceptance Scenarios**:
1. **Given** que el usuario abre la pestaña "Calidad de Agua", **When** el panel carga los gráficos, **Then** solo se muestran los widgets de Temperatura y pH distribuidos en una cuadrícula de dos columnas sin mostrar humedad interna.
2. **Given** que el usuario hace clic en la pestaña "Interior Boya (ESP32)", **When** cambia la vista activa, **Then** se despliega el gráfico o indicador de humedad interna del gabinete y no se muestran los sensores de agua.
3. **Given** una pantalla de escritorio o tablet amplia, **When** se observa la pestaña de agua, **Then** ambos gráficos ocupan el 50% del ancho útil en la misma fila horizontal.

---

### User Story 2 - Integración Visual Limpia sin Barra Superior "Home" (Priority: P2)

Como usuario del dashboard web unificado,
quiero que los marcos embebidos de Node-RED se muestren sin la franja o barra azul superior que contiene el texto "Home",
para que la interfaz luzca como una aplicación continua y profesional sin encabezados repetitivos o discordantes.

**Why this priority**: La barra azul "Home" rompe la estética Workbench blanca y agrega ruido visual redundante a la cabecera ya existente del dashboard.

**Independent Test**: Al cargar el dashboard, el contenedor de gráficos no muestra la barra azul con el texto "Home" ni márgenes superiores innecesarios, integrándose directamente desde los títulos de los widgets.

**Acceptance Scenarios**:
1. **Given** el panel de gráficos activo, **When** el marco de Node-RED se renderiza, **Then** la barra azul superior con el título "Home" queda oculta o suprimida de la vista incrustada.
2. **Given** que el usuario recarga la vista, **When** el iframe termina de cargar, **Then** el contenido inicia directamente con los widgets de instrumentación sin saltos visuales ni cabeceras ajenas.

---

### User Story 3 - Sincronización en Tiempo Real entre Tarjetas Superiores y Gráficos (Priority: P3)

Como supervisor del estanque,
quiero que los valores numéricos y badges de estado mostrados en las tarjetas superiores (Temperatura, pH, Humedad) coincidan exactamente en tiempo real con las lecturas reportadas por los gráficos de Node-RED,
para evitar discrepancias donde la tarjeta indique un valor y el gráfico represente otro.

**Why this priority**: Garantiza la coherencia de datos (*Single Source of Truth*); actualmente las tarjetas ejecutaban una oscilación simulada desconectada de la telemetría viva.

**Independent Test**: Al actualizarse el valor de temperatura a 26.3 °C en Node-RED, la tarjeta superior "Temperatura del Agua" muestra inmediatamente 26.3 °C y evalúa su umbral correspondiente (Óptimo).

**Acceptance Scenarios**:
1. **Given** una lectura reportada por el flujo de telemetría hacia Node-RED, **When** el widget gráfico actualiza su aguja o aguja a un valor determinado, **Then** la tarjeta superior correspondiente actualiza su valor textual al mismo valor en un intervalo menor a 1 segundo.
2. **Given** que se recibe una lectura fuera del rango óptimo, **When** se actualiza la tarjeta superior, **Then** el badge semántico (Óptimo, Precaución, Crítico) refleja el umbral biológico pactado para ese valor sincrónico.

---

### Edge Cases

- ¿Qué sucede si la pantalla es muy estrecha (móvil < 640px) y no caben 2 columnas?
  - El sistema adaptará responsivamente la fila de dos columnas a una sola columna apilada verticalmente en dispositivos móviles, manteniendo la separación temática de pestañas.
- ¿Qué ocurre si la conexión con Node-RED se interrumpe momentáneamente?
  - Las tarjetas superiores mantienen el último valor recibido válido y la barra de estado superior refleja el estado de advertencia o desconexión.
- ¿Qué ocurre si los datos de un sensor específico llegan nulos o con retraso?
  - La tarjeta afectada muestra el estado previo con marca de tiempo o advertencia de datos incompletos sin congelar los otros dos indicadores.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La vista "Calidad de Agua" DEBE contener exclusivamente los componentes gráficos de Temperatura y pH, excluyendo cualquier indicador de humedad interna.
- **FR-002**: En pantallas medianas y de escritorio (>= 768px), los componentes gráficos de Temperatura y pH DEBEN presentarse en una disposición de 2 columnas dentro de una sola fila.
- **FR-003**: La vista "Interior Boya" DEBE contener exclusivamente el indicador gráfico de Humedad interna de la boya.
- **FR-004**: El contenedor embebido DEBE eliminar la visibilidad de la barra superior de navegación/título "Home" nativa de Node-RED Dashboard en la visualización integrada.
- **FR-005**: Las tarjetas métricas superiores del dashboard web DEBEN sincronizar sus valores numéricos instantáneos con los datos vivos reflejados en los gráficos de Node-RED.
- **FR-006**: La sincronización de datos entre las tarjetas superiores y Node-RED DEBE operar mediante una consulta periódica (polling ligero de 1s con `fetch`) hacia un endpoint HTTP expuesto en Node-RED (`GET /api/telemetria`), el cual retorna el último payload JSON de telemetría (`temperatura_agua`, `ph_agua`, `humedad_interna`) recibido de MQTT.
- **FR-007**: El cambio entre pestañas ("Calidad de Agua" e "Interior Boya") DEBE conmutar fluidamente entre la vista de 2 columnas de agua y la vista individual de interior boya sin recargas de página completa.

---

### Key Entities

- **Panel de Calidad de Agua**: Entidad visual compuesta por 2 columnas (Widget Temperatura + Widget pH), vinculada a las métricas del estanque.
- **Panel de Interior Boya**: Entidad visual individual vinculada a la métrica de humedad y estanqueidad del gabinete ESP32.
- **Tarjeta Métrica Superior**: Indicador numérico sincronizado con evaluación biológica autónoma según los umbrales de cultivo de tilapias.
- **Canal de Sincronización Telemetría**: Flujo de datos que alimenta simultáneamente a las tarjetas del dashboard y a los widgets visuales.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los accesos a "Calidad de Agua" muestran únicamente Temperatura y pH en cuadrícula de 2 columnas en pantallas de escritorio.
- **SC-002**: La diferencia temporal entre la actualización de un widget gráfico en Node-RED y la tarjeta superior correspondiente es menor a 1 segundo.
- **SC-003**: Cero elementos visuales de la barra de título "Home" de Node-RED son visibles dentro del marco del dashboard web.
- **SC-004**: El cambio entre la pestaña de agua y la pestaña de interior boya toma menos de 200 ms sin parpadeos perceptibles.

---

## Assumptions

- Node-RED Dashboard v2 o Dashboard 1.x permite organizar los widgets en grupos o sub-pestañas (`tabs` / `groups`) o el contenedor web ajusta el encuadre/enrutamiento a pestañas dedicadas (`/ui/#!/0` y `/ui/#!/1`).
- La supresión de la barra "Home" puede configurarse en Node-RED Dashboard desactivando la barra de título ("Title Bar" -> Hidden) o mediante ajuste de encuadre en el contenedor frontend.
- Los datos de telemetría originados en MQTT (`tilapias/estanque1/datos`) están disponibles para su lectura sincrónica en el frontend.
