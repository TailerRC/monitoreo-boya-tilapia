<!--
Sync Impact Report:
- Version change: Unversioned Template -> 1.0.0
- List of modified principles:
  - Initialized I. Desacoplamiento Hardware-Servicios (Hardware & Service Decoupling)
  - Initialized II. Integridad y Validación de Telemetría Acuícola (Telemetry Integrity & Aquaculture Reliability)
  - Initialized III. Protocolo de Comunicación MQTT Estandarizado (Standardized MQTT Protocol)
  - Initialized IV. Pipeline de Procesamiento con Node-RED (Node-RED Data Pipeline & Graph Integration)
  - Initialized V. Dashboard Web Ligero y Modular (Lightweight & Modular Web Dashboard)
- Added sections:
  - Pila Tecnológica y Restricciones de Infraestructura
  - Flujo de Desarrollo y Control de Calidad
- Removed sections: None
- Follow-up TODOs: None
-->

# Boya IoT Monitoreo Tilapia Constitution

## Core Principles

### I. Desacoplamiento Hardware-Servicios (Hardware & Service Decoupling)
El firmware del microcontrolador ESP32 y las capas de presentación/servicios DEBEN operar de forma completamente desacoplada. El ESP32 sólo es responsable de la lectura, acondicionamiento y publicación de telemetría vía red, sin depender de la lógica interna del frontend ni del backend. Toda interacción externa se realiza mediante eventos y mensajes en red asíncronos.
*Razón*: Garantiza la resiliencia del sistema de campo; una caída o rediseño del dashboard web o de Node-RED no debe congelar ni alterar el ciclo de monitoreo del estanque ni reiniciar el microcontrolador.

### II. Integridad y Validación de Telemetría Acuícola (Telemetry Integrity & Aquaculture Reliability)
Todas las lecturas de sensores (Temperatura del agua, Humedad ambiental y pH) DEBEN validarse contra rangos físicos y biológicos admisibles para el cultivo de tilapias antes de su despacho. En caso de falla, lectura espuria o desconexión de sonda, el firmware DEBE reportar un estado de advertencia (`sensor_error` o flag de validez) en lugar de transmitir valores anómalos silenciosos. Las reconexiones WiFi y MQTT DEBEN implementar temporizadores no bloqueantes (*non-blocking retries*).
*Razón*: Decisiones críticas sobre el ecosistema de las tilapias dependen de la veracidad de los datos de calidad del agua; datos inválidos no tratados pueden causar falsas alarmas o muertes de biomasa.

### III. Protocolo de Comunicación MQTT Estandarizado (Standardized MQTT Protocol)
La comunicación de telemetría DEBE utilizar MQTT a través del broker local HiveMQ (desplegado en Docker). Los tópicos DEBEN seguir una taxonomía jerárquica clara (ej. `boya/tilapia/{device_id}/telemetria`, `boya/tilapia/{device_id}/estado`). Los mensajes de telemetría DEBEN codificarse en payloads JSON compactos y consistentes, incluyendo marca de tiempo relativa/absoluta, identificador del nodo y mediciones numéricas estructuradas.
*Razón*: Proporciona interoperabilidad plug-and-play entre el ESP32, Node-RED y cualquier servicio suscriptor local con baja sobrecarga de ancho de banda.

### IV. Pipeline de Procesamiento con Node-RED (Node-RED Data Pipeline & Graph Integration)
Node-RED DEBE actuar como el orquestador y motor de flujo intermedio encargado de suscribirse al broker MQTT HiveMQ, transformar/acumular datos históricos y exponer gráficos o endpoints visuales listos para ser consumidos o embebidos por la interfaz de usuario. Ninguna lógica analítica pesada o de persistencia gráfica compleja debe implementarse dentro del ESP32.
*Razón*: Centraliza las transformaciones de datos y generación de gráficos en un entorno modular, acelerando la iteración de la visualización sin requerir reprogramación física del hardware.

### V. Dashboard Web Ligero y Modular (Lightweight & Modular Web Dashboard)
El dashboard web DEBE construirse utilizando tecnologías web estándar (HTML5 semántico, CSS3 responsivo y JavaScript moderno vanilla o dependencias mínimas). La interfaz DEBE integrar los gráficos y componentes de datos provistos por Node-RED de forma modular y asíncrona, priorizando la legibilidad rápida de los parámetros clave (Temperatura, pH, Humedad) desde dispositivos móviles y de escritorio.
*Razón*: Asegura máxima accesibilidad para los operarios del estanque sin requerir frameworks pesados ni configuraciones complejas en tiempo de despliegue en campo.

## Pila Tecnológica y Restricciones de Infraestructura

- **Microcontrolador & Firmware**: ESP32 programado en C++ utilizando el framework Arduino sobre PlatformIO (`platform = espressif32`, `framework = arduino`), empleando `PubSubClient` para la conectividad MQTT.
- **Broker MQTT**: HiveMQ CE ejecutado en contenedor Docker local con puertos estándar (1883 para MQTT, 8083/8000 para websockets si aplica).
- **Procesamiento y Gráficos**: Node-RED ejecutado localmente, con flujos dedicados para ingesta de tópicos MQTT, buffers temporales y generación de dashboards/gráficos exportables.
- **Frontend / Dashboard**: HTML5, CSS3 y JavaScript moderno con soporte para iframes/web components o llamadas directas a las APIs/gráficos generados por Node-RED.
- **Ambiente de Monitoreo**: Parámetros dirigidos a estanques de tilapias (Temperatura de agua: óptima ~26-30 °C; pH: óptimo ~6.5-8.5; Humedad ambiental en entorno de boya).

## Flujo de Desarrollo y Control de Calidad

- **Spec-Driven Development (SDD)**: Cualquier cambio en la definición de variables, esquemas JSON de MQTT, frecuencias de muestreo o integración de gráficos DEBE ser especificado previamente en los artefactos de Spec Kit (`spec.md`, `plan.md`, `tasks.md`).
- **Verificación en Capas**:
  1. *Capa Local / Servicios*: Validación del contenedor Docker de HiveMQ y flujos de Node-RED mediante pruebas de publicación/suscripción simuladas antes de conectar hardware.
  2. *Capa Firmware*: Compilación limpia con PlatformIO, comprobación de manejo de reconexiones y emisión correcta de JSON.
  3. *Capa Interfaz*: Verificación de renderizado responsivo y actualización fluida de gráficos en el dashboard web.
- **Control de Versiones**: Se utilizarán mensajes de commit semánticos y ramas de características para cambios en firmware y dashboard.

## Governance

Esta Constitución rige el diseño, arquitectura y desarrollo del proyecto Boya IoT Monitoreo Tilapia y prevalece sobre cualquier otra decisión informal.

1. **Procedimiento de Enmienda**: Cualquier cambio a los principios fundamentales o restricciones tecnológicas requiere la actualización documentada de esta constitución, indicando la justificación de la modificación y evaluando su impacto en el hardware o software existente.
2. **Versionado Semántico del Proyecto y Gobernanza**:
   - **MAJOR**: Modificaciones que rompan la compatibilidad arquitectónica (ej. cambio de broker, reemplazo total del microcontrolador, alteración incompatible del esquema de tópicos o protocolo de transporte).
   - **MINOR**: Incorporación de nuevos sensores (ej. oxígeno disuelto, conductividad), nuevos servicios intermedios o nuevos módulos del dashboard sin alterar los contratos existentes.
   - **PATCH**: Ajustes de redacción, correcciones en rangos de advertencia o refinamientos en la documentación de principios.
3. **Revisión de Cumplimiento**: Todas las tareas implementadas mediante Spec Kit y PRs deben auditar el cumplimiento estricto de los Principios I a V antes de ser dadas por concluidas.

**Version**: 1.0.0 | **Ratified**: 2026-11-20 | **Last Amended**: 2026-11-20
