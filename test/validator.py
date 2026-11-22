"""
Motor de validación de limpieza de telemetría y modelos de datos de prueba.
Feature: 003-telemetry-test-environment
"""

from dataclasses import dataclass, field
import json
import math
import time
from typing import Any, Dict, List, Optional, Tuple


# Umbrales Biológicos y de Protección Operativa
AQUACULTURE_THRESHOLDS = {
    "temperatura": {
        "min": 24.0,
        "max": 32.0,
        "optimal_min": 26.0,
        "optimal_max": 30.0,
        "unit": "°C",
        "description": "Temperatura del agua (Sonda sumergible DS18B20)"
    },
    "ph": {
        "min": 6.00,
        "max": 9.00,
        "optimal_min": 6.50,
        "optimal_max": 8.50,
        "unit": "pH",
        "description": "Nivel de pH del agua (Sonda PHE-45P)"
    },
    "humedad_interna": {
        "min": 40.0,
        "max": 80.0,
        "optimal_max": 70.0,
        "unit": "% HR",
        "description": "Humedad relativa en interior de la boya (Gabinete ESP32)"
    }
}

MANDATORY_KEYS = {"temperatura", "ph", "humedad_interna"}


@dataclass
class ValidationResult:
    """Resultado de la evaluación de un paquete de telemetría."""
    is_clean: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    parsed_data: Optional[Dict[str, float]] = None
    delta_time_ms: Optional[float] = None
    raw_payload: str = ""


@dataclass
class TestSuiteReport:
    """Reporte consolidado de una sesión de pruebas de telemetría."""
    total_samples: int = 0
    clean_samples: int = 0
    corrupted_samples: int = 0
    cleanliness_rate_percent: float = 0.0
    avg_interval_ms: float = 0.0
    overall_verdict: str = "PENDIENTE"
    errors_summary: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "test_session": {
                "feature": "003-telemetry-test-environment",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "total_samples": self.total_samples,
                "clean_samples": self.clean_samples,
                "corrupted_samples": self.corrupted_samples,
                "cleanliness_rate": f"{self.cleanliness_rate_percent:.1f}%",
                "avg_interval_ms": round(self.avg_interval_ms, 1),
                "verdict": self.overall_verdict
            },
            "errors_summary": self.errors_summary
        }


class TelemetryDataValidator:
    """
    Motor de inspección de limpieza de datos en 5 niveles:
    1. Sintaxis JSON válida
    2. Exactitud de claves del esquema contractual
    3. Integridad de tipos numéricos (no null, no NaN, no inf)
    4. Umbrales físicos admisibles
    5. Gradiente o saltos bruscos imposibles
    """

    def __init__(self):
        self.last_valid_data: Optional[Dict[str, float]] = None
        self.last_timestamp: Optional[float] = None

    def validate_payload(self, raw_payload: str, current_time: Optional[float] = None) -> ValidationResult:
        errors: List[str] = []
        warnings: List[str] = []

        if current_time is None:
            current_time = time.time()

        delta_time_ms = None
        if self.last_timestamp is not None:
            delta_time_ms = (current_time - self.last_timestamp) * 1000.0

        # Nivel 1: Sintaxis JSON
        if not raw_payload or not isinstance(raw_payload, str):
            return ValidationResult(
                is_clean=False,
                errors=["Payload vacío o no es una cadena de texto."],
                raw_payload=str(raw_payload)
            )

        try:
            data = json.loads(raw_payload)
        except json.JSONDecodeError as e:
            return ValidationResult(
                is_clean=False,
                errors=[f"Error de sintaxis JSON: {str(e)}"],
                raw_payload=raw_payload
            )

        if not isinstance(data, dict):
            return ValidationResult(
                is_clean=False,
                errors=["El payload JSON raíz debe ser un objeto/diccionario."],
                raw_payload=raw_payload
            )

        # Nivel 2: Claves requeridas y no permitidas
        keys = set(data.keys())
        missing_keys = MANDATORY_KEYS - keys
        extra_keys = keys - MANDATORY_KEYS

        if missing_keys:
            errors.append(f"Claves faltantes obligatorias: {sorted(list(missing_keys))}")
        if extra_keys:
            errors.append(f"Claves desconocidas no autorizadas: {sorted(list(extra_keys))}")

        # Nivel 3: Tipos de datos numéricos y ausencia de null/NaN
        clean_parsed: Dict[str, float] = {}
        for key in MANDATORY_KEYS:
            if key not in data:
                continue
            val = data[key]
            if val is None:
                errors.append(f"El campo '{key}' tiene valor nulo (None/null).")
            elif isinstance(val, bool):
                errors.append(f"El campo '{key}' es booleano, se requiere número.")
            elif not isinstance(val, (int, float)):
                errors.append(f"El campo '{key}' no es numérico (tipo recibido: {type(val).__name__}).")
            elif math.isnan(val) or math.isinf(val):
                errors.append(f"El campo '{key}' contiene un valor inválido ({val}).")
            else:
                clean_parsed[key] = float(val)

        # Si ya hay errores estructurales, no evaluar rangos
        if errors:
            return ValidationResult(
                is_clean=False,
                errors=errors,
                warnings=warnings,
                delta_time_ms=delta_time_ms,
                raw_payload=raw_payload
            )

        # Nivel 4: Umbrales biológicos y operativos
        for key, limits in AQUACULTURE_THRESHOLDS.items():
            val = clean_parsed[key]
            if val < limits["min"] or val > limits["max"]:
                errors.append(
                    f"El valor de '{key}' ({val}) está fuera del rango admisible [{limits['min']}, {limits['max']}]."
                )
            elif "optimal_min" in limits and (val < limits["optimal_min"] or val > limits["optimal_max"]):
                warnings.append(
                    f"El valor de '{key}' ({val}) está fuera del rango óptimo [{limits['optimal_min']}, {limits['optimal_max']}]."
                )
            elif "optimal_max" in limits and val > limits["optimal_max"]:
                warnings.append(
                    f"Humedad interna elevada en gabinete ESP32: {val}% (umbral seguro: <= {limits['optimal_max']}%)."
                )

        # Nivel 5: Gradiente anómalo (si hay muestra previa)
        if self.last_valid_data is not None:
            max_delta_temp = 1.5  # Máximo salto admisible en 1 segundo
            max_delta_ph = 0.5
            max_delta_hum = 10.0

            d_temp = abs(clean_parsed["temperatura"] - self.last_valid_data["temperatura"])
            d_ph = abs(clean_parsed["ph"] - self.last_valid_data["ph"])
            d_hum = abs(clean_parsed["humedad_interna"] - self.last_valid_data["humedad_interna"])

            if d_temp > max_delta_temp:
                errors.append(f"Gradiente anómalo en temperatura: variación brusca de {d_temp:.2f} °C en 1s.")
            if d_ph > max_delta_ph:
                errors.append(f"Gradiente anómalo en pH: variación brusca de {d_ph:.2f} en 1s.")
            if d_hum > max_delta_hum:
                errors.append(f"Gradiente anómalo en humedad: variación brusca de {d_hum:.1f} % en 1s.")

        is_clean = len(errors) == 0

        if is_clean:
            self.last_valid_data = clean_parsed
            self.last_timestamp = current_time

        return ValidationResult(
            is_clean=is_clean,
            errors=errors,
            warnings=warnings,
            parsed_data=clean_parsed if is_clean else None,
            delta_time_ms=delta_time_ms,
            raw_payload=raw_payload
        )
