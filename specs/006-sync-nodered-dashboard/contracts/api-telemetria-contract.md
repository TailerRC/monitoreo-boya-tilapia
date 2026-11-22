# Contract: Endpoint HTTP de Telemetría Node-RED

**Feature**: `006-sync-nodered-dashboard`

Este contrato formaliza la comunicación HTTP entre el dashboard web (`web/app.js`) y el motor de Node-RED para mantener sincronizadas las tarjetas de métricas superiores.

---

## Endpoint: `GET /api/telemetria`

- **Método**: `GET`
- **Ruta**: `http://localhost:1880/api/telemetria`
- **Propósito**: Retornar la lectura de telemetría más reciente recibida por Node-RED desde el tópico MQTT `tilapias/estanque1/datos`.

---

### Encabezados de Respuesta Requeridos (CORS)

Para permitir que el dashboard web consuma el endpoint desde cualquier origen local (`http://localhost:8000`, archivo directo `file://` o similar), Node-RED DEBE responder con los siguientes encabezados HTTP:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

### Estructura de Respuesta Exitosa (`200 OK`)

```json
{
  "temperatura_agua": 26.3,
  "ph_agua": 7.15,
  "humedad_interna": 56.0,
  "timestamp": "2026-11-21T20:45:00.120Z",
  "dispositivo": "BOYA-TILAPIA-01"
}
```

---

### Configuración del Flujo en Node-RED

Nodo exportable o configuración en Node-RED:

1. **Nodo `http in`**:
   - Method: `GET`
   - URL: `/api/telemetria`
2. **Nodo `function`**:
   ```javascript
   // Extraer última telemetría del contexto global
   var latest = global.get("latest_telemetry") || {
       temperatura_agua: 26.3,
       ph_agua: 7.15,
       humedad_interna: 56.0
   };

   msg.payload = latest;
   msg.headers = {
       "Content-Type": "application/json",
       "Access-Control-Allow-Origin": "*"
   };
   return msg;
   ```
3. **Nodo `http response`**:
   - Status code: `200`
4. **En el nodo `mqtt in` (tópico `tilapias/estanque1/datos`)**:
   - Tras parsear el JSON entrante, agregar:
     ```javascript
     global.set("latest_telemetry", msg.payload);
     ```
