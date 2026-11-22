# Feature Specification: Contratos de Umbrales y Formato de Datos para Gráficos en Node-RED

**Feature Branch**: `004-nodered-chart-contracts`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "darme solo elc ontrato de umbrales de los datos que tengo para definir los graficos en node red yo mismo manualmente darme el foramto de de datos y umbrales de cada grafico"

## Clarifications

### Session 2026-11-21
- Q: ¿Cuáles son los gráficos requeridos en Node-RED? → A: Dos vistas gráficas principales sincronizadas con el dashboard web:
  1. **Gráfico de Calidad de Agua**: Series temporales para Temperatura del Agua (DS18B20) y pH del Agua (PHE-45P).
  2. **Gráfico de Ambiente Interno de la Boya**: Serie temporal para Humedad Interna del Gabinete del ESP32 (% HR).
- Q: ¿Cómo se ingieren los datos en Node-RED? → A: Mediante un nodo `mqtt in` suscrito al tópico `tilapias/estanque1/datos`, recibiendo el payload JSON de la boya.
- Q: ¿Qué umbrales semánticos rigen cada gráfico? → A: Estándares biológicos de tilapia del Nilo (*Oreochromis niloticus*) y protección de hardware contra condensación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configuración Manual de Gráficos de Calidad de Agua en Node-RED (Priority: P1) 🎯 MVP

Como desarrollador de flujos en Node-RED, quiero disponer de la especificación contractual exacta de los tópicos, formato JSON, rangos de ejes (min/max) y líneas de umbral (óptimo, alerta y crítico) para Temperatura y pH, para configurar manualmente los nodos de visualización (`ui_chart` o Chart.js) sin dudas sobre los valores de referencia biológica.

**Why this priority**: Es la base del monitoreo de los peces en el estanque. Permite crear gráficos claros que informen visualmente si las condiciones del agua son seguras para las tilapias.

**Independent Test**: Puede probarse configurando un nodo chart en Node-RED con los umbrales definidos e inyectando un mensaje de prueba: las líneas de referencia deben reflejar 26-30 °C para temperatura y 6.5-8.5 para pH.

**Acceptance Scenarios**:

1. **Given** un mensaje MQTT en `tilapias/estanque1/datos`, **When** Node-RED parsea el JSON, **Then** extrae `msg.payload.temperatura` y `msg.payload.ph` como valores numéricos para graficar.
2. **Given** el gráfico de temperatura, **When** el valor oscila entre 26.0 y 30.0 °C, **Then** se ubica dentro de la zona de umbral óptimo (verde).
3. **Given** el gráfico de pH, **When** el valor desciende de 6.50 o supera 8.50, **Then** cruza la línea de advertencia (amarillo) y alerta si pasa de 6.0/9.0 (rojo).

---

### User Story 2 - Configuración Manual del Gráfico de Integridad de la Boya (Priority: P2)

Como técnico responsable de la estación flotante, quiero contar con la especificación de formato y umbrales para la Humedad Interna del gabinete del ESP32, para configurar el gráfico de supervisión de estanqueidad y condensación en Node-RED.

**Why this priority**: Protege el hardware físico de la boya evitando que daños por condensación o ingreso de agua pasen desapercibidos.

**Independent Test**: Puede probarse inyectando valores de humedad en Node-RED: valores inferiores al 70% HR se muestran en zona segura; valores superiores al 70% disparan la franja de precaución de condensación.

**Acceptance Scenarios**:

1. **Given** el mensaje MQTT entrante, **When** Node-RED extrae `msg.payload.humedad_interna`, **Then** representa la serie temporal en un gráfico con eje Y de 0 a 100%.
2. **Given** una lectura mayor a 70% HR, **When** se visualiza en el gráfico, **Then** se ubica sobre el umbral de advertencia por riesgo de condensación en el ESP32.

---

### Edge Cases

- ¿Cómo debe manejar Node-RED la llegada de mensajes con valores nulos o campos faltantes? Los nodos de función previa al gráfico deben filtrar o descartar mensajes malformados para no quebrar la serie temporal continua.
- ¿Cómo graficar Temperatura (°C) y pH juntos en Node-RED? Se debe configurar un gráfico con doble eje Y (eje izquierdo para Temperatura 20-35 °C y eje derecho para pH 5-10) o dos gráficos desacoplados para evitar distorsión de escala.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El contrato DEBE documentar el tópico MQTT de entrada exacto: `tilapias/estanque1/datos`.
- **FR-002**: El contrato DEBE especificar la estructura del payload JSON entrante emitido por el ESP32:
  - `temperatura`: float (1 decimal, °C).
  - `ph`: float (2 decimales, escala 0-14).
  - `humedad_interna`: float (1 decimal, % HR).
- **FR-003**: El contrato DEBE definir para el **Gráfico 1 (Temperatura del Agua)**:
  - Eje Y sugerido: `20.0 °C` a `35.0 °C`.
  - Zona Óptima: `26.0 °C` a `30.0 °C`.
  - Zona Precaución: `24.0 °C - 25.9 °C` y `30.1 °C - 32.0 °C`.
  - Zona Crítica: `< 24.0 °C` o `> 32.0 °C`.
- **FR-004**: El contrato DEBE definir para el **Gráfico 2 (Nivel de pH del Agua)**:
  - Eje Y sugerido: `5.00` a `10.00`.
  - Zona Óptima: `6.50` a `8.50`.
  - Zona Precaución: `6.00 - 6.49` y `8.51 - 9.00`.
  - Zona Crítica: `< 6.00` o `> 9.00`.
- **FR-005**: El contrato DEBE definir para el **Gráfico 3 (Humedad Interna Gabinete ESP32)**:
  - Eje Y sugerido: `0 %` a `100 % HR`.
  - Zona Óptima / Estanco: `< 70.0 % HR`.
  - Zona Precaución / Condensación: `70.0 %` a `85.0 % HR`.
  - Zona Crítica / Filtración: `> 85.0 % HR`.
- **FR-006**: El contrato DEBE proporcionar ejemplos de código en sintaxis de función JavaScript para Node-RED (`function node`) que extraiga y asigne las cargas útiles a `msg.payload` y `msg.topic` para alimentar los gráficos de `node-red-dashboard`.

### Key Entities *(include if feature involves data)*

- **Contrato de Gráfico**: Especificación técnica que define identificador de sensor, tópico MQTT, variable JSON, límites de eje y umbrales semánticos.
- **Mensaje Node-RED (`msg`)**: Objeto estándar de mensajería con `payload` numérico y `topic` asignado a la serie temporal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El desarrollador dispone de la totalidad de umbrales y tipos de datos necesarios para configurar los nodos gráficos en Node-RED sin ambigüedades.
- **SC-002**: El 100% de los umbrales especificados guardan estricta concordancia con las constantes definidas en el firmware [src/main.cpp](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/src/main.cpp) y el dashboard web [web/app.js](file:///C:/Clion/ESP32_Projects/monitoreo-boya-tilapia/web/app.js).
- **SC-003**: Los ejemplos de función de Node-RED son compatibles directamente con los nodos estándar de visualización (`node-red-dashboard`).

## Assumptions

- El usuario configurará manualmente los nodos gráficos en su instancia local de Node-RED.
- Los gráficos se embeberán o visualizarán de acuerdo a la proporción de 340px establecida en la arquitectura del dashboard web.
