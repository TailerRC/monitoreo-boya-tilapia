# Feature Specification: Variables Globales Oficiales y Simulación de Telemetría ESP32

**Feature Branch**: `002-esp32-telemetry-simulation`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "Vamos a crear el sgte spec respecto a mi archivo de codigo C:\Clion\ESP32_Projects\monitoreo-boya-tilapia\src\main.cpp MANTENER EL CODIGO ACTUAL solamente es añadir lo siguiente: En base a los datos que se tienen definir variables para ello, para ellos se debe incorporar variables officiales para los datos puesto que más adelante se incorporada la logica de la obtencion de ellos por mientras debemos ya tener sus variables globales pero como no esta la logica, vamos a incorporar datos simulados que van a ir llegando cada 1 seg."

## Clarifications

### Session 2026-11-21
- Q: ¿Cuáles son las variables exactas que deben declararse formalmente en el firmware? → A: Las 3 variables oficiales analizadas en el sistema:
  1. `temperatura_agua`: Temperatura del agua del estanque (futura sonda DS18B20 sumergible, en °C).
  2. `ph_agua`: Nivel de pH del agua del estanque (futura sonda PHE-45P, rango 0-14).
  3. `humedad_interna`: Humedad relativa en el interior de la boya al lado del ESP32 (monitoreo de estanqueidad y riesgo de condensación, en %).
- Q: ¿Cómo debe realizarse la simulación de datos cada 1 segundo sin comprometer la respuesta del ESP32? → A: La actualización y despacho de datos debe ejecutarse con temporización no bloqueante (`millis()`) a un intervalo de 1000 ms, garantizando que `ElegantOTA.loop()`, el servidor web asíncrono y la conexión MQTT permanezcan reactivos sin bloqueos por `delay()`.
- Q: ¿Qué debe ocurrir con el código preexistente en `src/main.cpp`? → A: Mantener de forma estricta todo el código actual (conexión WiFi con autoreconexión y reinicio por timeout, servidor web asíncrono en puerto 80 con endpoint `/`, servidor OTA en `/update`, cliente PubSubClient y lógica de reconexión MQTT). Solo se incorporan las nuevas variables globales y la temporización de simulación.
- Q: ¿Cuáles deben ser los umbrales operativos exactos (óptimo, precaución y crítico) configurados para las tres variables monitoreadas? → A: Estándar biológico para tilapia del Nilo y protección de gabinete electrónico: Temperatura del agua: Óptimo 26.0–30.0 °C (Precaución: 24.0–25.9 °C o 30.1–32.0 °C; Crítico: <24.0 °C o >32.0 °C); pH del agua: Óptimo 6.5–8.5 (Precaución: 6.0–6.4 o 8.6–9.0; Crítico: <6.0 o >9.0); Humedad interna boya: Óptimo <70.0% HR (Precaución/Condensación: 70.0%–85.0% HR; Crítico/Peligro: >85.0% HR).
- Q: ¿Dónde debe realizarse la evaluación de alertas cuando los datos superen los umbrales definidos? → A: Option A (Arquitectura Desacoplada): El ESP32 publica exclusivamente mediciones numéricas puras por MQTT (`temperatura`, `ph`, `humedad_interna`). La evaluación de estados de salud, semáforos biológicos y disparo de alertas se delega a Node-RED y al Dashboard Web, cumpliendo con el Principio I de la Constitución (Desacoplamiento Hardware-Servicios).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Declaración y Centralización de Variables Oficiales de Telemetría (Priority: P1)

Como desarrollador del firmware de la boya, quiero contar con variables globales oficiales claramente estructuradas para Temperatura del Agua, pH y Humedad Interna de la boya en `main.cpp`, para que la arquitectura de datos del ESP32 quede estandarizada antes de incorporar la lógica de lectura física con las sondas de hardware.

**Why this priority**: Establece el contrato de datos del microcontrolador. Permite que cualquier módulo posterior (sensores reales, filtros, empaquetado JSON o publicación MQTT) trabaje sobre un conjunto unificado de variables oficiales sin refactorizaciones estructurales.

**Independent Test**: Puede probarse compilando e inspeccionando el firmware: las 3 variables deben estar declaradas en el ámbito global del archivo, inicializadas con valores válidos dentro de los rangos biológicos acuícolas y de integridad de la boya, y accesibles a lo largo de todo el ciclo de ejecución.

**Acceptance Scenarios**:

1. **Given** el archivo `src/main.cpp`, **When** se inicializa el firmware, **Then** existen variables oficiales globales dedicadas para almacenar la temperatura del agua (°C), el pH y la humedad interna del recinto de la boya (%).
2. **Given** la necesidad futura de conectar las sondas físicas (DS18B20, PHE-45P y sensor interno), **When** se incorpore la lectura de los pines de hardware, **Then** la asignación se realizará directamente sobre estas variables globales sin alterar el flujo de publicación ni el código base existente.

---

### User Story 2 - Simulación Dinámica Periódica a Intervalo de 1 Segundo (Priority: P2)

Como integrador de sistemas y analista de telemetría acuícola, quiero que el ESP32 genere y actualice datos simulados verosímiles de los 3 parámetros cada 1 segundo de manera automática, para verificar el flujo continuo de telemetría y alimentar a los suscriptores (Node-RED y Dashboard Web) sin requerir aún las sondas físicas conectadas.

**Why this priority**: Permite realizar pruebas funcionales de extremo a extremo (ESP32 → Broker MQTT HiveMQ → Node-RED → Dashboard) con un flujo de datos dinámico a alta frecuencia (1 Hz) antes de disponer del montaje en estanque.

**Independent Test**: Puede probarse observando el log serial del ESP32 y el broker MQTT: cada 1000 ms se genera una nueva lectura con pequeñas variaciones realistas y se emite el payload actualizado sin alterar el funcionamiento normal del microcontrolador.

**Acceptance Scenarios**:

1. **Given** el bucle de ejecución principal `loop()`, **When** transcurre un período exacto de 1 segundo (1000 ms), **Then** las variables de telemetría se actualizan con nuevos valores simulados que presentan pequeñas fluctuaciones dentro de rangos operativos normales.
2. **Given** una lectura simulada generada, **When** se publica al broker MQTT, **Then** el payload JSON incluye los valores actualizados de las 3 variables oficiales (`temperatura`, `ph`, `humedad_interna`).
3. **Given** que transcurren menos de 1000 ms entre ciclos del loop, **When** el procesador evalúa la condición de tiempo, **Then** no se ejecuta una nueva simulación ni se bloquea la CPU, permitiendo la ejecución fluida de otras tareas.

---

### User Story 3 - Preservación de Servicios Concurrente y Temporización No Bloqueante (Priority: P3)

Como administrador u operario técnico en campo, quiero que la incorporación de la simulación continua a 1 segundo no degrade ni congele la operatividad del servidor web local ni las actualizaciones remotas vía ElegantOTA, para poder subir nuevas versiones de firmware o consultar el estado del dispositivo en cualquier momento.

**Why this priority**: El principio constitucional de resiliencia del firmware exige que la temporización sea no bloqueante (`millis()`). El uso de retardos bloqueantes (`delay(1000)` o `delay(5000)`) impediría la respuesta oportuna del servidor OTA y el manejo de reconexiones MQTT.

**Independent Test**: Puede probarse realizando una petición HTTP al endpoint `/` y accediendo a la URL `/update` mientras la simulación está activa cada 1 segundo: la página debe responder de forma instantánea sin tiempos de espera anómalos ni pérdida de paquetes de red.

**Acceptance Scenarios**:

1. **Given** el firmware en ejecución con la simulación a 1 segundo, **When** el usuario accede a la dirección IP del ESP32 en el navegador (`http://<IP-ESP32>/`), **Then** el servidor web responde exitosamente con el mensaje de confirmación sin demoras.
2. **Given** una sesión de actualización de firmware por aire iniciada en `http://<IP-ESP32>/update`, **When** se carga un nuevo binario mientras la telemetría se simula, **Then** ElegantOTA completa la transferencia sin desconexiones causadas por bloqueos en el loop.
3. **Given** una desconexión temporal de la red o del broker MQTT, **When** el firmware detecta la pérdida de enlace, **Then** intenta restablecer la conexión sin colapsar el temporizador de simulación ni congelar el microcontrolador.

---

### Edge Cases

- ¿Qué ocurre si la red WiFi o el broker MQTT no están disponibles al momento de la simulación? La actualización de las variables globales en memoria debe continuar ocurriendo cada 1 segundo de manera autónoma, y el intento de publicación MQTT debe supeditarse a que la conexión esté activa sin bloquear el loop.
- ¿Cómo se evitan desbordamientos en el cálculo de tiempo de `millis()`? La evaluación temporal debe utilizar la resta estándar `millis() - tiempoPrevio >= INTERVALO_SIMULACION` (aritmética sin signo `unsigned long`), la cual es inmune al desbordamiento natural de `millis()` a los ~49.7 días.
- ¿Qué sucede si los valores simulados oscilan fuera de límites físicos plausibles? El algoritmo de simulación debe acotar las fluctuaciones dentro de rangos realistas (Temperatura: 20.0 - 35.0 °C, pH: 5.5 - 9.5, Humedad interna: 30 - 90%) para evitar lecturas incoherentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El firmware DEBE definir variables globales oficiales dedicadas en `src/main.cpp` para almacenar las tres métricas del sistema:
  1. Temperatura del agua (`temperatura_agua` o equivalente, tipo numérico de coma flotante, °C).
  2. pH del agua (`ph_agua` o equivalente, tipo numérico de coma flotante, escala 0-14).
  3. Humedad interna de la boya (`humedad_interna` o equivalente, tipo numérico de coma flotante, %).
- **FR-002**: El firmware DEBE implementar un mecanismo de generación de valores simulados que actualice periódicamente las 3 variables globales oficiales con fluctuaciones graduales y realistas dentro de los umbrales operativos clarificados:
  - **Temperatura del agua**: Óptimo `26.0 - 30.0 °C` (fluctuación simulada acotada en `24.0 - 32.0 °C`).
  - **pH del agua**: Óptimo `6.5 - 8.5` (fluctuación simulada acotada en `6.0 - 9.0`).
  - **Humedad interna de la boya**: Óptimo `< 70.0% HR` (fluctuación simulada acotada en `45.0 - 75.0% HR`).
- **FR-003**: El ciclo de actualización y despacho de la simulación DEBE ocurrir a una cadencia de exactamente 1 segundo (1000 milisegundos).
- **FR-004**: La temporización de 1 segundo DEBE implementarse mediante un esquema no bloqueante basado en `millis()`, prohibiendo el uso de funciones de retardo bloqueantes como `delay(1000)` en el bucle principal.
- **FR-005**: El firmware DEBE preservar intacto todo el código preexistente en `src/main.cpp`:
  - Configuración de red WiFi en modo estación (`WIFI_STA`) con credenciales configuradas y autoreconexión.
  - Temporizador de seguridad de 20 segundos durante la conexión inicial con reinicio del microcontrolador ante falla persistente.
  - Instanciación y servicio del servidor web asíncrono (`AsyncWebServer`) en puerto 80 con respuesta en ruta raíz `/`.
  - Integración y bucle de servicio de actualizaciones de firmware por aire (`ElegantOTA.begin()` y `ElegantOTA.loop()`).
  - Cliente MQTT `PubSubClient`, parámetros de broker (`mqtt_server`, `mqtt_port`) y función de reconexión `reconectarMQTT()`.
- **FR-006**: El payload JSON transmitido al broker MQTT en cada ciclo de 1 segundo DEBE contener exclusivamente las 3 variables numéricas puras (`temperatura`, `ph` y `humedad_interna`) sin incorporar flags de alerta, delegando la evaluación de semáforos y reglas de alarma a las capas de Node-RED y Dashboard Web.
- **FR-007**: El firmware DEBE imprimir por el puerto serial (115200 baudios) la confirmación de la telemetría generada en cada ciclo de 1 segundo para facilitar la depuración en consola.

### Key Entities *(include if feature involves data)*

- **Variables Globales de Telemetría**: Estructura o conjunto de variables en memoria del microcontrolador que almacenan el último valor válido de `temperatura_agua`, `ph_agua` y `humedad_interna`.
- **Temporizador No Bloqueante**: Registro temporal de tipo `unsigned long` que almacena la estampa de `millis()` de la última simulación efectuada y determina cuándo se cumple la ventana de 1000 ms.
- **Payload MQTT**: Cadena con formato JSON compacto que empaqueta las tres métricas para su publicación en el tópico correspondiente (ej. `tilapias/estanque1/datos`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las variables oficiales de telemetría se actualizan exactamente cada 1000 milisegundos (frecuencia de 1 Hz ± 50 ms).
- **SC-002**: El 100% de las funcionalidades previas de `src/main.cpp` (WiFi, Servidor Web, ElegantOTA, MQTT) permanecen operativas sin interrupción ni reinicios inesperados.
- **SC-003**: El servidor web y la interfaz de ElegantOTA (`/update`) responden a solicitudes HTTP en menos de 200 ms, demostrando la ausencia de bloqueos en el loop del microcontrolador.
- **SC-004**: El payload MQTT contiene las 3 variables numéricas estructuradas y válidas en el 100% de las publicaciones generadas durante la simulación continua.
- **SC-005**: El código fuente se compila exitosamente bajo la plataforma ESP32 (PlatformIO / Arduino Framework) sin advertencias de tipos de variables no declaradas.

## Assumptions

- Las credenciales de WiFi (`ssid`, `password`) y la dirección IP del broker MQTT HiveMQ especificadas en el archivo actual se mantienen sin cambios para la ejecución local.
- La lógica de simulación es temporal y diseñada para ser reemplazada posteriormente por las funciones de lectura física de las librerías `OneWire`/`DallasTemperature` (para DS18B20), módulo conversor/ADC para sonda PHE-45P y sensor de humedad interno (DHT/SHT), sin necesidad de cambiar los nombres de las variables globales oficiales.
- El intervalo de 1 segundo es el requerido para pruebas de simulación intensiva; posteriormente podrá ajustarse según la política de telemetría del estanque.
