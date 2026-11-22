"""
Suite de Pruebas Automatizadas de Limpieza e Integridad de Telemetría.
Feature: 003-telemetry-test-environment
"""

import json
import math
import os
import sys
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from telemetry_fork import TelemetryGeneratorFork
from validator import TelemetryDataValidator, MANDATORY_KEYS, AQUACULTURE_THRESHOLDS


class TestTelemetryCleanliness(unittest.TestCase):
    """Batería de pruebas que certifica la llegada limpia de los datos de telemetría."""

    def setUp(self):
        self.validator = TelemetryDataValidator()
        self.generator = TelemetryGeneratorFork()

    def test_01_json_syntax_validity(self):
        """Verifica que el 100% de los payloads emitidos por el generador sean JSON válidos."""
        samples_count = 50
        for _ in range(samples_count):
            payload, _ = self.generator.step()
            result = self.validator.validate_payload(payload)
            self.assertTrue(result.is_clean, f"Fallo de limpieza en payload: {payload}. Errores: {result.errors}")
            # Verificación redundante con parser estándar
            try:
                parsed = json.loads(payload)
                self.assertIsInstance(parsed, dict)
            except Exception as e:
                self.fail(f"Payload no parseable como JSON: {payload}. Error: {e}")

    def test_02_mandatory_schema_keys(self):
        """Verifica la presencia exacta de las 3 claves obligatorias sin campos desconocidos."""
        for _ in range(30):
            payload, _ = self.generator.step()
            parsed = json.loads(payload)
            keys = set(parsed.keys())
            self.assertEqual(keys, MANDATORY_KEYS, f"Claves discrepantes en payload: {keys} != {MANDATORY_KEYS}")

    def test_03_numeric_types_no_nulls(self):
        """Verifica que los valores sean números flotantes finitos sin valores null ni NaN."""
        for _ in range(30):
            payload, _ = self.generator.step()
            parsed = json.loads(payload)
            for k in MANDATORY_KEYS:
                val = parsed[k]
                self.assertIsNotNone(val, f"Campo {k} es None")
                self.assertIsInstance(val, (int, float), f"Campo {k} ({val}) no es numérico")
                self.assertFalse(math.isnan(val), f"Campo {k} es NaN")
                self.assertFalse(math.isinf(val), f"Campo {k} es Infinity")

    def test_04_aquaculture_ranges(self):
        """Verifica que los datos simulados se mantengan siempre dentro de los umbrales seguros."""
        for _ in range(50):
            payload, _ = self.generator.step()
            parsed = json.loads(payload)
            temp = parsed["temperatura"]
            ph = parsed["ph"]
            hum = parsed["humedad_interna"]

            self.assertTrue(
                AQUACULTURE_THRESHOLDS["temperatura"]["min"] <= temp <= AQUACULTURE_THRESHOLDS["temperatura"]["max"],
                f"Temperatura fuera de límites: {temp}"
            )
            self.assertTrue(
                AQUACULTURE_THRESHOLDS["ph"]["min"] <= ph <= AQUACULTURE_THRESHOLDS["ph"]["max"],
                f"pH fuera de límites: {ph}"
            )
            self.assertTrue(
                AQUACULTURE_THRESHOLDS["humedad_interna"]["min"] <= hum <= AQUACULTURE_THRESHOLDS["humedad_interna"]["max"],
                f"Humedad interna fuera de límites: {hum}"
            )

    def test_05_continuous_timing_cadence(self):
        """Audita que la simulación por pasos continuos mantenga consistencia temporal."""
        t_base = time.time()
        for i in range(5):
            payload, _ = self.generator.step()
            sim_time = t_base + (i * 1.0)  # Simular intervalo nominal de 1.0s
            result = self.validator.validate_payload(payload, current_time=sim_time)
            self.assertTrue(result.is_clean)
            if i > 0:
                self.assertIsNotNone(result.delta_time_ms)
                # Debe situarse en 1000 ms con tolerancia de prueba
                self.assertAlmostEqual(result.delta_time_ms, 1000.0, delta=10.0)

    def test_06_fault_injection_detection(self):
        """Verifica que el validador detecte y rechace anomalías deliberadas."""
        corrupted_payloads = [
            # 1. JSON sintácticamente roto
            ('{"temperatura": 26.5, "ph": 7.2', "sintaxis"),
            # 2. Clave obligatoria faltante
            ('{"temperatura": 26.5, "ph": 7.20}', "faltante"),
            # 3. Clave extra no autorizada
            ('{"temperatura": 26.5, "ph": 7.20, "humedad_interna": 55.0, "voltaje": 3.3}', "extra"),
            # 4. Valor nulo
            ('{"temperatura": null, "ph": 7.20, "humedad_interna": 55.0}', "null"),
            # 5. Valor en formato de texto
            ('{"temperatura": "26.5", "ph": 7.20, "humedad_interna": 55.0}', "string"),
            # 6. Valor fuera de límites extremos
            ('{"temperatura": 99.0, "ph": 7.20, "humedad_interna": 55.0}', "rango"),
        ]

        for payload, description in corrupted_payloads:
            v = TelemetryDataValidator()
            res = v.validate_payload(payload)
            self.assertFalse(res.is_clean, f"El validador debió rechazar la anomalía '{description}': {payload}")
            self.assertGreater(len(res.errors), 0, f"Debe reportar al menos un error para '{description}'")


if __name__ == "__main__":
    unittest.main()
