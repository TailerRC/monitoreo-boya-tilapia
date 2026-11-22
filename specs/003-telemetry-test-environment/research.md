# Research: Arquitectura del Entorno de Pruebas y Validación Limpia

**Feature**: `003-telemetry-test-environment`

## Decision 1: Estrategia de Fork de la Lógica de `main.cpp`

- **Decisión**: Crear una implementación espejo en Python (`test/telemetry_fork.py`) que replique exactamente las operaciones matemáticas, tipos y lógica de generación de `src/main.cpp`:
  - Mismas variables: `temperatura_agua` (inicial 26.5), `ph_agua` (inicial 7.20), `humedad_interna` (inicial 55.0).
  - Misma dinámica de caminata aleatoria: deltas aleatorias acotadas con `constrain` a `[25.0, 31.0]`, `[6.50, 8.50]`, y `[45.0, 75.0]`.
  - Mismo formateo de payload JSON con idénticas claves y decimales (1 decimal para temp y hum, 2 decimales para pH).
- **Razón**: Permite realizar miles de iteraciones por segundo en un entorno de pruebas sin depender del flasheo en hardware físico ni de tiempos de compilación de PlatformIO, manteniendo al 100% la fidelidad de la lógica implementada en C++.
- **Alternativas consideradas**:
  - *Compilar `main.cpp` como binario nativo en C++ con CMake/GCC*: Se descartó porque `main.cpp` incluye dependencias de hardware Arduino/ESP32 (`WiFi.h`, `ESPAsyncWebServer.h`, `ElegantOTA.h`) que requieren mocks pesados de hardware que añaden complejidad innecesaria.
  - *Probar exclusivamente con el ESP32 físico*: Lento, no reproducible automáticamente en pipelines y dependiente de hardware de red.

## Decision 2: Motor de Validación de Datos Limpios (`test/validator.py`)

- **Decisión**: Implementar una clase validadora `TelemetryDataValidator` con 5 niveles de inspección:
  1. **Nivel 1 - Sintaxis JSON**: Parseo estricto; rechaza cadenas truncadas o con caracteres inválidos.
  2. **Nivel 2 - Exhaustividad de Claves**: Requiere exactamente `{"temperatura", "ph", "humedad_interna"}`; rechaza campos faltantes o claves no autorizadas.
  3. **Nivel 3 - Tipos de Datos**: Valida que los tres valores sean instancias numéricas (`int` o `float`), rechazando `None`, `NaN`, `Inf` o strings disfrazados de números.
  4. **Nivel 4 - Umbrales de Seguridad Acuícola y de Boya**: Comprueba que las lecturas no violen los rangos físicos definidos en la especificación.
  5. **Nivel 5 - Gradiente Térmico/Químico**: Detecta saltos bruscos incompatibles con la física del agua (ej. delta > 1.0 °C en 1 segundo).
- **Razón**: Asegura una certificación integral de "datos limpios", previniendo que cualquier fallo de serialización o desbordamiento afecte al broker o al dashboard.

## Decision 3: Framework de Pruebas Automatizadas

- **Decisión**: Utilizar el framework estándar `unittest` de Python en `test/test_telemetry_cleanliness.py`.
- **Batería de Pruebas**:
  - `test_01_json_syntax_validity`: Genera 50 paquetes y verifica que el 100% sean parseables sin error.
  - `test_02_mandatory_schema_keys`: Verifica que cada paquete contenga exactamente las 3 claves oficiales.
  - `test_03_numeric_types_no_nulls`: Comprueba ausencia total de `None`, `null` y `NaN`.
  - `test_04_aquaculture_ranges`: Verifica que todas las muestras caigan en los rangos biológicos seguros.
  - `test_05_continuous_timing_cadence`: Ejecuta una corrida temporal midiendo que la cadencia sea uniforme a 1 Hz.
  - `test_06_fault_injection_detection`: Inyecta deliberadamente 5 tipos de paquetes malformados y comprueba que el validador los rechace con la causa exacta.
- **Razón**: Viene integrado de forma nativa en la instalación existente de Python 3.14 del usuario, sin necesidad de instalar dependencias de terceros (`pip install`).

## Decision 4: Suscriptor de Escucha en Vivo (`test/live_mqtt_listener.py`)

- **Decisión**: Proveer un script utilitario que se conecte opcionalmente al broker MQTT HiveMQ (`10.234.217.133:1883`) y aplique el `TelemetryDataValidator` en tiempo real a los paquetes físicos emitidos por el ESP32 real.
- **Razón**: Permite la validación tanto en modo simulado desacoplado como en modo de campo en vivo con el microcontrolador transmitiendo por WiFi.
