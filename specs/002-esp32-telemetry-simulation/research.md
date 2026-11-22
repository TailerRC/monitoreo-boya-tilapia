# Research: Variables Globales Oficiales y Simulación de Telemetría ESP32

**Feature**: `002-esp32-telemetry-simulation`

## Decision 1: Declaración y Tipos de las Variables Globales Oficiales

- **Decisión**: Declarar variables globales de tipo `float` en `src/main.cpp` bajo la sección comentada `// ===== TUS VARIABLES GLOBALES =====`:
  ```cpp
  // Variables Oficiales de Telemetría
  float temperatura_agua = 26.5f; // Sonda sumergible DS18B20 (°C)
  float ph_agua = 7.20f;          // Sonda de pH PHE-45P (escala 0-14)
  float humedad_interna = 55.0f;  // Sensor interior gabinete ESP32 (% HR)
  ```
- **Razón**: Los tipos de datos de punto flotante de 32 bits (`float`) en ESP32 ofrecen la precisión suficiente para instrumentación acuícola y humedad sin incurrir en la sobrecarga innecesaria de `double`. La ubicación en el scope global garantiza que cuando se incorporen las librerías físicas (`DallasTemperature`, ADC para PHE-45P y sensor de humedad), solo se requiera actualizar estas variables en sus respectivas funciones sin modificar los consumidores (MQTT, Web, Serial).
- **Alternativas consideradas**:
  - *Estructura `struct TelemetryData`*: Útil para empaquetar, pero el usuario solicitó específicamente "variables globales para ellos", siendo más directo y legible para el nivel actual del código en `main.cpp`.
  - *Enteros multiplicados por 10 o 100 (punto fijo)*: Se descartó porque `float` en ESP32 cuenta con FPU por hardware y no penaliza el rendimiento.

## Decision 2: Temporización No Bloqueante con `millis()` para 1 Segundo

- **Decisión**: Reemplazar `delay(5000)` por una máquina de temporización no bloqueante usando `millis()` con intervalo de 1000 ms:
  ```cpp
  unsigned long tiempoUltimaSimulacion = 0;
  const unsigned long INTERVALO_SIMULACION = 1000; // 1 segundo en milisegundos

  // En loop():
  unsigned long tiempoActual = millis();
  if (tiempoActual - tiempoUltimaSimulacion >= INTERVALO_SIMULACION) {
      tiempoUltimaSimulacion = tiempoActual;
      // Actualizar simulación y publicar MQTT
  }
  ```
- **Razón**:
  - El uso de `delay(1000)` o `delay(5000)` detiene el hilo de ejecución de la CPU, impidiendo que `ElegantOTA.loop()` gestione los paquetes de actualización de firmware por HTTP y haciendo que `client.loop()` pierda el `keep-alive` con el broker MQTT.
  - La resta `tiempoActual - tiempoUltimaSimulacion >= INTERVALO_SIMULACION` maneja de forma natural el desbordamiento de 32 bits sin signo que ocurre tras ~49.7 días continuos de funcionamiento del ESP32.
- **Alternativas consideradas**:
  - *Ticker de ESP32 o temporizador por interrupción de hardware (hw_timer)*: Descartado porque la publicación MQTT y operaciones de red no deben invocarse dentro de rutinas de servicio de interrupción (ISR) por riesgo de *kernel panic* o *Watchdog timeout*.
  - *FreeRTOS Task con `vTaskDelayUntil`*: Viable en ESP32, pero introduce complejidad de hilos innecesaria para el flujo actual de `src/main.cpp`.

## Decision 3: Algoritmo de Simulación de Fluctuaciones Realistas

- **Decisión**: Emplear un generador de caminata aleatoria restringida (*bounded random walk*) ejecutado cada 1 segundo:
  ```cpp
  // Fluctuaciones suaves cada segundo
  temperatura_agua += (random(-10, 11) / 100.0f); // +/- 0.1 °C
  ph_agua          += (random(-5, 6)   / 100.0f); // +/- 0.05 pH
  humedad_interna  += (random(-15, 16) / 10.0f);  // +/- 1.5 % HR

  // Acotamiento dentro de límites operativos verosímiles
  temperatura_agua = constrain(temperatura_agua, 25.0f, 31.0f);
  ph_agua          = constrain(ph_agua, 6.50f, 8.50f);
  humedad_interna  = constrain(humedad_interna, 45.0f, 75.0f);
  ```
- **Razón**: Asegura que los datos no sean estáticos ni presenten picos abruptos, simulando el comportamiento físico real de la inercia térmica del estanque, la estabilidad química del agua y las variaciones sutiles dentro del recinto de la boya.
- **Alternativas consideradas**:
  - *Funciones trigonométricas `sin(t)`*: Generan patrones demasiado periódicos y matemáticamente artificiales.
  - *Generación estática de números fijos*: No permite probar dinamismo en gráficos de Node-RED ni en el dashboard.

## Decision 4: Formateo de Payload JSON y Transmisión MQTT

- **Decisión**: Construir el payload JSON mediante concatenación de `String` con 1 decimal para temperatura y humedad, y 2 decimales para pH:
  ```cpp
  String payload = "{\"temperatura\":" + String(temperatura_agua, 1) +
                   ",\"ph\":" + String(ph_agua, 2) +
                   ",\"humedad_interna\":" + String(humedad_interna, 1) + "}";
  client.publish("tilapias/estanque1/datos", payload.c_str());
  ```
- **Razón**: Conserva el mismo estilo ya presente en el `main.cpp` del usuario sin añadir nuevas librerías dependientes (como `ArduinoJson`), consumiendo menos de 100 bytes de memoria.

## Decision 5: Preservación Absoluta del Código Base

- **Decisión**: Mantener intactos:
  1. Librerías incluidas (`Arduino.h`, `WiFi.h`, `ESPAsyncWebServer.h`, `ElegantOTA.h`, `PubSubClient.h`).
  2. Credenciales y constantes de conexión WiFi y broker MQTT.
  3. Declaración de `server`, `esp32Client`, `client`.
  4. Función `reconectarMQTT()`.
  5. Contenido completo de `setup()` (reconexión WiFi, reinicio de 20s, ruta web `/`, `ElegantOTA.begin(&server)` y `client.setServer()`).
  6. Llamadas a `ElegantOTA.loop()`, verificación de conexión MQTT y `client.loop()` en `loop()`.
- **Razón**: Cumple estrictamente la instrucción del usuario: "MANTENER EL CODIGO ACTUAL solamente es añadir lo siguiente".
