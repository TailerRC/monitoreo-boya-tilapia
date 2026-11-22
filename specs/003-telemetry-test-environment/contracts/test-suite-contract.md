# Contracts: Test Suite & Telemetry Cleanliness Rules

**Feature**: `003-telemetry-test-environment`

## Contrato 1: Reglas de Conformidad de Datos Limpios (`TelemetryCleanlinessContract`)

Todo mensaje de telemetría emitido por la boya debe someterse a las siguientes reglas estrictas de aceptación:

### Regla 1.1: Estructura de Claves JSON
El payload deserializado DEBE contener exactamente el siguiente conjunto de claves de primer nivel:
```json
{
  "temperatura": <float>,
  "ph": <float>,
  "humedad_interna": <float>
}
```
- **Falla Crítica**: Si falta alguna de estas tres claves o si existen claves adicionales no autorizadas.

### Regla 1.2: Integridad de Tipos y Precisión Numérica
- `temperatura`: Debe ser numérico finito (`isinstance(v, (int, float)) and not math.isnan(v) and not math.isinf(v)`), formateado a 1 decimal.
- `ph`: Debe ser numérico finito, formateado a 2 decimales.
- `humedad_interna`: Debe ser numérico finito, formateado a 1 decimal.
- **Falla Crítica**: Valores `null`, `None`, cadenas (`"26.5"`), booleanos o valores infinitos (`Infinity`).

### Regla 1.3: Umbrales Físicos y Biológicos Admisibles
- `24.0 <= temperatura <= 32.0` (Centígrados)
- `6.00 <= ph <= 9.00` (Escala pH)
- `40.0 <= humedad_interna <= 80.0` (% HR)
- **Falla Crítica**: Cualquier lectura que escape a estos límites durante la simulación normal.

---

## Contrato 2: Salida del Reporte de Pruebas

El entorno de pruebas debe generar en stdout y en `test/test_report.json` una estructura con el siguiente formato:

```json
{
  "test_session": {
    "feature": "003-telemetry-test-environment",
    "timestamp": "2026-11-21T19:45:00Z",
    "total_samples": 60,
    "clean_samples": 60,
    "corrupted_samples": 0,
    "cleanliness_rate": "100.0%",
    "avg_interval_ms": 1002.4,
    "verdict": "APROBADO"
  },
  "tests_executed": [
    {"name": "test_json_syntax", "status": "PASS"},
    {"name": "test_mandatory_keys", "status": "PASS"},
    {"name": "test_numeric_types_no_nulls", "status": "PASS"},
    {"name": "test_aquaculture_ranges", "status": "PASS"},
    {"name": "test_timing_cadence_1hz", "status": "PASS"},
    {"name": "test_fault_injection_detection", "status": "PASS"}
  ]
}
```
