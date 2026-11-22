# Quickstart & Verification Guide: Variables Globales Oficiales y Simulación de Telemetría ESP32

**Feature**: `002-esp32-telemetry-simulation`

Esta guía detalla el procedimiento para compilar, cargar y validar el comportamiento del firmware en el ESP32 con las 3 variables oficiales y la simulación periódica cada 1 segundo.

---

## Prerrequisitos

1. **Entorno de Desarrollo**: CLion con extensión PlatformIO o PlatformIO CLI instalado.
2. **Hardware**: Placa de desarrollo ESP32 Dev Module conectada vía USB (para flasheo inicial o monitor serie).
3. **Servicios de Red**:
   - Red WiFi activa con SSID `"Kurumi"`.
   - Broker MQTT HiveMQ corriendo en Docker en la dirección IP configurada en `mqtt_server`.

---

## Paso 1: Validación de Compilación

Desde la terminal del proyecto en CLion o PowerShell:

```bash
pio run
```

**Resultado Esperado**:
- Compilación limpia sin errores ni advertencias sobre tipos de datos o funciones bloqueantes.
- El binario `.pio/build/esp32dev/firmware.bin` se genera correctamente.

---

## Paso 2: Flasheo y Verificación por Monitor Serie

1. Conectar el ESP32 y abrir el monitor serie a 115200 baudios:
   ```bash
   pio device monitor -b 115200
   ```
2. Observar la inicialización:
   - Conexión WiFi establecida y reporte de IP local.
   - Mensaje de confirmación: `"Servidor OTA Iniciado"`.
   - Mensaje de conexión al broker MQTT: `"Conectando al broker... OK"`.
3. Observar la emisión continua cada 1 segundo:
   ```text
   [TELEMETRIA-1s] Temp: 26.5 °C | pH: 7.20 | Hum Int: 55.0 % -> Publicado en tilapias/estanque1/datos
   [TELEMETRIA-1s] Temp: 26.6 °C | pH: 7.22 | Hum Int: 55.3 % -> Publicado en tilapias/estanque1/datos
   [TELEMETRIA-1s] Temp: 26.5 °C | pH: 7.21 | Hum Int: 55.1 % -> Publicado en tilapias/estanque1/datos
   ```

---

## Paso 3: Verificación de No Bloqueo en Servidor Web y ElegantOTA

1. Obtener la IP asignada al ESP32 (ej. `192.168.1.150`).
2. Abrir en un navegador web:
   - `http://<IP-ESP32>/`: Debe responder de inmediato `"Servidor Encendido, puedes subir tu código"` sin latencias.
   - `http://<IP-ESP32>/update`: Debe cargar la interfaz web de ElegantOTA con fluidez mientras la telemetría sigue publicándose en segundo plano.

---

## Paso 4: Verificación de Recepción MQTT

Desde una terminal con cliente MQTT (ej. `mosquitto_sub` o desde Node-RED):

```bash
mosquitto_sub -h 10.234.217.133 -p 1883 -t "tilapias/estanque1/datos" -v
```

**Resultado Esperado**:
Se reciben mensajes JSON a una tasa constante de 1 mensaje por segundo conteniendo las 3 variables:
```json
tilapias/estanque1/datos {"temperatura":26.6,"ph":7.22,"humedad_interna":55.3}
```
