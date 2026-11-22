# Feature Specification: Entorno de Pruebas y Validación Limpia de Telemetría

**Feature Branch**: `003-telemetry-test-environment`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "en base a lo planteado en C:\Clion\ESP32_Projects\monitoreo-boya-tilapia\src\main.cpp, realizar un fork del codigo y someterlo a un entorno de pruebas para realizar todos los testeos y validarlo como llegan los datos de manera limpia"

## Clarifications

### Session 2026-11-21
- Q: ¿Qué alcance tiene el "fork del código" para las pruebas? → A: Crear una suite y harness de pruebas aislada que replique la lógica de generación y despacho de `src/main.cpp` sin alterar el código de producción, permitiendo someter los datos a verificación estricta de formato, tipos y llegada limpia.
- Q: ¿Qué constituye "llegada limpia de datos"? → A: Validación sintáctica de JSON (cero caracteres corruptos o truncados), comprobación de los 3 campos oficiales obligatorios (`temperatura`, `ph`, `humedad_interna`), valores numéricos válidos (sin `NaN` ni `null`), respeto a los rangos de seguridad y frecuencia temporal constante de 1 segundo (1 Hz).
- Q: ¿Cómo se ejecutará el entorno de pruebas? → A: Mediante un harness de pruebas automatizado ejecutable localmente capaz de simular el ciclo de telemetría y suscribirse/auditar los paquetes emitidos al broker MQTT o interfaz de red local en tiempo real.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aislamiento del Entorno de Pruebas y Reproducibilidad (Priority: P1) 🎯 MVP

Como desarrollador e integrador de la boya IoT, quiero disponer de un entorno de pruebas desacoplado (fork/harness de pruebas) basado en la lógica de `src/main.cpp`, para ejecutar ciclos continuos de simulación y telemetría de forma reproducible sin riesgo de romper el código fuente de producción.

**Why this priority**: Es la base del aseguramiento de calidad (*QA*). Permite correr pruebas automáticas y manuales de manera segura, aislando los experimentos y validaciones de datos del firmware principal.

**Independent Test**: Puede probarse de forma autónoma ejecutando la suite de pruebas: debe inicializar el entorno de pruebas, instanciar las variables de telemetría y generar el flujo de paquetes de prueba sin modificar el archivo `src/main.cpp`.

**Acceptance Scenarios**:

1. **Given** el repositorio del proyecto, **When** se inicia el entorno de pruebas, **Then** el código de producción en `src/main.cpp` permanece inalterado y los experimentos se confinan al entorno de test.
2. **Given** el arnés de pruebas en ejecución, **When** se solicita una corrida de generación de datos, **Then** se produce un flujo continuo de telemetría replicando fielmente la temporización de 1 segundo y las fluctuaciones del firmware.

---

### User Story 2 - Validación de Integridad Estructural y Limpieza de Datos (Priority: P2)

Como analista de datos y responsable del pipeline IoT, quiero someter cada paquete recibido a una validación estricta de esquema, tipos y rangos, para certificar que los datos lleguen limpios, completos y libres de anomalías hacia Node-RED y el Dashboard Web.

**Why this priority**: Evita que datos corruptos, cadenas rotas o valores indefinidos (`NaN`, `null`) lleguen a las capas de visualización y almacenamiento, previniendo caídas silenciosas en Node-RED o errores en los gráficos.

**Independent Test**: Puede probarse inyectando un flujo de al menos 30 paquetes continuos en el validador: el 100% de los paquetes debe cumplir el esquema JSON con las 3 variables numéricas dentro de los rangos válidos sin ningún error de deserialización.

**Acceptance Scenarios**:

1. **Given** un paquete de telemetría recibido en el entorno de pruebas, **When** el validador analiza el mensaje, **Then** verifica que el formato sea JSON válido y contenga exactamente las 3 claves oficiales: `temperatura`, `ph` y `humedad_interna`.
2. **Given** las mediciones contenidas en el paquete, **When** se inspeccionan sus valores, **Then** se valida que sean números válidos (`float`) dentro de los límites operativos (Temp: 25.0 - 31.0 °C, pH: 6.50 - 8.50, Humedad: 45.0 - 75.0 % HR) y sin valores `null` o indefinidos.
3. **Given** una anomalía intencional o paquete corrupto introducido en la prueba, **When** el validador lo procesa, **Then** lo marca de inmediato como paquete rechazado, registrando la causa exacta del fallo.

---

### User Story 3 - Auditoría de Cadencia Temporal y Estabilidad Continua (Priority: P3)

Como operador del sistema acuícola, quiero auditar la estabilidad temporal del flujo de datos durante una corrida continua (ej. 60 segundos), para verificar que la cadencia de 1 segundo se mantenga constante sin pérdidas de paquetes ni fluctuaciones de latencia.

**Why this priority**: La temporización no bloqueante y la frecuencia constante de 1 Hz son esenciales para la alimentación de gráficos en tiempo real y la detección de anomalías biológicas oportunas.

**Independent Test**: Puede probarse corriendo una sesión de monitoreo de 60 segundos: el sistema debe registrar una tasa de recepción de aproximadamente 60 muestras (1 por segundo ± 100 ms) sin desconexiones forzadas del broker.

**Acceptance Scenarios**:

1. **Given** una sesión de prueba en curso, **When** transcurre un período de 60 segundos, **Then** se reciben aproximadamente 60 paquetes secuenciales con un intervalo promedio de 1000 ms.
2. **Given** la finalización de la corrida de pruebas, **When** se concluye el análisis, **Then** el entorno genera un reporte consolidado con: total de paquetes recibidos, tasa de limpieza (100% requerida), intervalos promedio y estado final de aprobación.

---

### Edge Cases

- ¿Qué sucede si el broker MQTT está desconectado al iniciar la prueba? El arnés de prueba debe reportar un error claro de conectividad y ofrecer modo de prueba local desacoplado (validación de generación en memoria / salida serial) sin colapsar el entorno.
- ¿Cómo se detectan paquetes truncados por buffer insuficiente? El validador debe capturar excepciones de parseo JSON (`JSONDecodeError`) e identificar si el tamaño del payload supera el buffer asignado.
- ¿Qué ocurre si se detecta un salto de valor anómalo (ej. temperatura cambia de 26 °C a 80 °C en 1 segundo)? El validador debe registrar una advertencia de tasa de cambio biológicamente imposible (*gradient threshold violation*).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El entorno de pruebas DEBE estructurarse en un directorio o módulo de pruebas dedicado (ej. `test/` o suite de validación de telemetría), garantizando el desacoplamiento total del código fuente de producción en `src/main.cpp`.
- **FR-002**: El arnés de pruebas DEBE implementar un validador de esquema que compruebe que cada mensaje contenga exclusivamente los 3 campos oficiales:
  1. `temperatura`: numérico de punto flotante con 1 decimal.
  2. `ph`: numérico de punto flotante con 2 decimales.
  3. `humedad_interna`: numérico de punto flotante con 1 decimal.
- **FR-003**: El validador DEBE rechazar y registrar como anomalía cualquier paquete que:
  - Presente sintaxis JSON rota o truncada.
  - Contenga campos con valor `null`, `NaN` o cadenas de texto en lugar de números.
  - Omita cualquiera de las 3 variables obligatorias.
  - Incorpore claves desconocidas no documentadas en el contrato.
- **FR-004**: El entorno de pruebas DEBE verificar que los valores de telemetría se mantengan dentro de los umbrales operativos y de simulación válidos:
  - Temperatura del agua: entre `24.0 °C` y `32.0 °C`.
  - pH del agua: entre `6.00` y `9.00`.
  - Humedad interna de la boya: entre `40.0 %` y `80.0 % HR`.
- **FR-005**: El entorno de pruebas DEBE incluir un suscriptor de validación en tiempo real capaz de escuchar el tópico MQTT `tilapias/estanque1/datos` o validar la salida directa del simulador.
- **FR-006**: El entorno de pruebas DEBE medir y auditar el delta de tiempo entre mensajes consecutivos, verificando que el intervalo nominal de 1000 ms se cumpla con una tolerancia máxima de ± 150 ms en red local.
- **FR-007**: Al término de la ejecución, el entorno DEBE emitir un reporte resumen legible con estadísticas clave: paquetes totales procesados, paquetes conformes (limpios), paquetes fallidos, latencia/frecuencia promedio y veredicto general (**APROBADO** / **RECHAZADO**).

### Key Entities *(include if feature involves data)*

- **Paquete de Telemetría**: Objeto de datos que representa una lectura individual recibida; contiene `temperatura`, `ph`, `humedad_interna` y estampa de tiempo de recepción.
- **Criterio de Validación de Limpieza**: Conjunto de reglas booleanas aplicadas a cada paquete (sintaxis JSON, campos obligatorios, tipos numéricos, rangos seguros).
- **Reporte de Validación de Pruebas**: Estructura consolidada que contabiliza el total de muestras analizadas, porcentaje de conformidad (limpieza de datos), deltas temporales y lista detallada de anomalías (si las hubiera).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los paquetes generados y recibidos en una sesión estándar de prueba (mínimo 30 muestras) cumplen el esquema JSON contractual sin errores de análisis.
- **SC-002**: Tasa de datos limpios del 100%: 0 mensajes con valores nulos, campos faltantes o tipos incompatibles durante la corrida de prueba.
- **SC-003**: El 100% de los intervalos entre muestras consecutivas se sitúan en 1000 ms ± 150 ms durante la prueba de flujo continuo.
- **SC-004**: La suite de pruebas puede ejecutarse de forma autónoma y reportar resultados cuantitativos en menos de 5 segundos tras finalizar la captura de datos.
- **SC-005**: El archivo de código de producción `src/main.cpp` permanece 100% intacto y funcional antes, durante y después de la ejecución de las pruebas.

## Assumptions

- El broker MQTT HiveMQ en Docker (o un broker de pruebas local) está accesible en la red local para las pruebas de transmisión en vivo.
- Si no hay broker disponible o no hay conexión física, el entorno de pruebas dispondrá de un modo de prueba autónomo (simulación de flujo en memoria) para validar la limpieza de la lógica sin dependencias de red externas.
- El formato de las 3 variables oficiales corresponde al acordado en la feature `002-esp32-telemetry-simulation`.
