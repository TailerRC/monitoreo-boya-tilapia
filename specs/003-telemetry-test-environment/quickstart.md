# Quickstart & Verification Guide: Entorno de Pruebas de Telemetría

**Feature**: `003-telemetry-test-environment`

Esta guía detalla cómo ejecutar la suite de pruebas automatizada para validar que los datos generados por la lógica del ESP32 lleguen 100% limpios y estructurados.

---

## Prerrequisitos

- Python 3.10+ instalado y disponible en la consola (`python --version`).
- No se requiere hardware físico conectado ni dependencias externas para correr la suite autónoma.

---

## Paso 1: Ejecutar la Suite de Pruebas Automatizada

Desde la raíz del proyecto (`C:\Clion\ESP32_Projects\monitoreo-boya-tilapia`):

```bash
python -m unittest test/test_telemetry_cleanliness.py -v
```

### Salida Esperada:
```text
test_01_json_syntax_validity (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok
test_02_mandatory_schema_keys (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok
test_03_numeric_types_no_nulls (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok
test_04_aquaculture_ranges (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok
test_05_continuous_timing_cadence (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok
test_06_fault_injection_detection (test.test_telemetry_cleanliness.TestTelemetryCleanliness) ... ok

----------------------------------------------------------------------
Ran 6 tests in 1.250s

OK
```

---

## Paso 2: Ejecutar el Generador y Validador con Reporte Detallado

Para ejecutar una sesión de simulación interactiva con reporte estadístico:

```bash
python test/telemetry_fork.py --samples 30 --report
```

### Salida Esperada:
```text
[TEST-HARNESS] Iniciando sesión de pruebas con 30 muestras de telemetría...
[MUESTRA #01] Temp: 26.5 °C | pH: 7.20 | Hum Int: 55.0 % -> LIMPIO
[MUESTRA #02] Temp: 26.6 °C | pH: 7.22 | Hum Int: 54.8 % -> LIMPIO
...
[MUESTRA #30] Temp: 26.8 °C | pH: 7.24 | Hum Int: 55.1 % -> LIMPIO

============================================================
REPORTE DE LIMPIEZA DE TELEMETRÍA (003-telemetry-test-environment)
============================================================
Total de Muestras Analizadas : 30
Muestras Conformes / Limpias : 30 (100.0%)
Muestras Rechazadas / Falla  : 0 (0.0%)
Intervalo Promedio           : 1000.0 ms
Veredicto Final              : APROBADO ✓
============================================================
```

---

## Paso 3: Validación Opcional en Vivo con Broker MQTT

Cuando el broker HiveMQ Docker esté en ejecución y el ESP32 esté transmitiendo:

```bash
python test/live_mqtt_listener.py --host 10.234.217.133 --port 1883 --topic "tilapias/estanque1/datos"
```
El listener validará en tiempo real cada mensaje recibido desde la boya física, reportando si algún paquete llega corrupto.
