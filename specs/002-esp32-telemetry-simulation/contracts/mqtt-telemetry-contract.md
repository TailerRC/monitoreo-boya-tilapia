# Contracts: MQTT Telemetry & Serial Console Interface

**Feature**: `002-esp32-telemetry-simulation`

## Contrato 1: Publicación de Telemetría vía MQTT

Define el canal de comunicación y formato de intercambio entre el microcontrolador ESP32 y los servicios en red (Node-RED, HiveMQ Broker, Dashboard Web).

### 1. Parámetros del Canal MQTT:
- **Broker**: Configurado en `mqtt_server` (`10.234.217.133`), puerto `1883`.
- **Client ID**: `"esp32-tilapias-01"`
- **Tópico de Publicación**: `tilapias/estanque1/datos`
- **Frecuencia de Despacho**: Exactamente cada 1000 ms (1 Hz).
- **Nivel de QoS**: `0` (At most once, estándar para telemetría continua de alta frecuencia).
- **Flag Retain**: `false`.

### 2. Esquema del Payload JSON:
```json
{
  "temperatura": 26.6,
  "ph": 7.23,
  "humedad_interna": 54.8
}
```

### 3. Validación de Tipos y Rangos:
| Propiedad | Tipo | Formato | Rango Admisible | Ejemplo |
| :--- | :--- | :--- | :--- | :--- |
| `temperatura` | Number (float) | 1 decimal (`%.1f`) | `25.0 - 31.0` | `26.6` |
| `ph` | Number (float) | 2 decimales (`%.2f`) | `6.50 - 8.50` | `7.23` |
| `humedad_interna` | Number (float) | 1 decimal (`%.1f`) | `45.0 - 75.0` | `54.8` |

---

## Contrato 2: Salida por Consola Serie (Depuración Local)

Formato de mensaje emitido por el puerto UART Serial a 115200 baudios en cada ciclo de 1 segundo:

### Formato de Salida:
```text
[TELEMETRIA-1s] Temp: 26.6 °C | pH: 7.23 | Hum Int: 54.8 % -> Publicado en tilapias/estanque1/datos
```

---

## Contrato 3: Preservación de Endpoints HTTP Preexistentes

Los endpoints provistos por el microcontrolador DEBEN mantenerse sin ninguna modificación contractual:

1. **Ruta Raíz (`GET /`)**:
   - Puerto: `80`
   - Código HTTP: `200 OK`
   - Tipo MIME: `text/plain`
   - Respuesta: `"Servidor Encendido, puedes subir tu código"`

2. **Servidor ElegantOTA (`GET /update` / `POST /update`)**:
   - Puerto: `80`
   - Mecanismo: Gestión asíncrona de subida de binario `.bin` para actualización remota de firmware.
