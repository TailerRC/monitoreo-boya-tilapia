"""
Fork desacoplado de la lógica de telemetría de src/main.cpp para pruebas.
Feature: 003-telemetry-test-environment
"""

import argparse
import json
import os
import random
import sys
import time
from typing import Dict, Generator, List, Tuple

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validator import TelemetryDataValidator, TestSuiteReport


class TelemetryGeneratorFork:
    """
    Replica fielmente la lógica de variables globales y generación
    de telemetría implementada en src/main.cpp.
    """

    def __init__(self, temp_init: float = 26.5, ph_init: float = 7.20, hum_init: float = 55.0):
        # Variables Globales Oficiales
        self.temperatura_agua: float = temp_init
        self.ph_agua: float = ph_init
        self.humedad_interna: float = hum_init
        self.iteration: int = 0

    def step(self) -> Tuple[str, Dict[str, float]]:
        """
        Ejecuta un paso de simulación exactamente igual al loop() de main.cpp:
        caminata aleatoria y acotamiento por constrain().
        """
        self.iteration += 1

        # Fluctuaciones aleatorias (mismos rangos que en main.cpp)
        delta_temp = random.randint(-10, 10) / 100.0   # +/- 0.1 °C
        delta_ph = random.randint(-5, 5) / 100.0       # +/- 0.05 pH
        delta_hum = random.randint(-15, 15) / 10.0     # +/- 1.5 % HR

        self.temperatura_agua += delta_temp
        self.ph_agua += delta_ph
        self.humedad_interna += delta_hum

        # Acotamiento idéntico al firmware (constrain)
        self.temperatura_agua = max(25.0, min(31.0, self.temperatura_agua))
        self.ph_agua = max(6.50, min(8.50, self.ph_agua))
        self.humedad_interna = max(45.0, min(75.0, self.humedad_interna))

        # Construcción del payload JSON idéntica a String payload de main.cpp
        # temperatura (1 decimal), ph (2 decimales), humedad_interna (1 decimal)
        payload = (
            f'{{"temperatura":{self.temperatura_agua:.1f},'
            f'"ph":{self.ph_agua:.2f},'
            f'"humedad_interna":{self.humedad_interna:.1f}}}'
        )

        numeric_state = {
            "temperatura": round(self.temperatura_agua, 1),
            "ph": round(self.ph_agua, 2),
            "humedad_interna": round(self.humedad_interna, 1)
        }

        return payload, numeric_state

    def generate_batch(self, count: int, delay_sec: float = 0.0) -> List[Tuple[str, float]]:
        """Genera un lote de payloads con sus respectivas marcas de tiempo."""
        results = []
        for _ in range(count):
            now = time.time()
            payload, _ = self.step()
            results.append((payload, now))
            if delay_sec > 0:
                time.sleep(delay_sec)
        return results


def run_cli():
    parser = argparse.ArgumentParser(description="Arnés de prueba y fork de telemetría de boya tilapia.")
    parser.add_argument("--samples", type=int, default=10, help="Cantidad de muestras a generar.")
    parser.add_argument("--interval", type=float, default=0.0, help="Intervalo de pausa entre muestras en segundos.")
    parser.add_argument("--report", action="store_true", help="Generar reporte de limpieza al finalizar.")
    parser.add_argument("--json-report", type=str, default=None, help="Ruta para guardar el reporte JSON.")
    args = parser.parse_args()

    print(f"[TEST-HARNESS] Iniciando sesión de pruebas con {args.samples} muestras...")
    generator = TelemetryGeneratorFork()
    validator = TelemetryDataValidator()
    report = TestSuiteReport(total_samples=args.samples)

    intervals = []

    for i in range(1, args.samples + 1):
        payload, _ = generator.step()
        result = validator.validate_payload(payload)

        status_text = "LIMPIO ✓" if result.is_clean else "FALLA ✗"
        if result.is_clean:
            report.clean_samples += 1
        else:
            report.corrupted_samples += 1
            report.errors_summary.extend(result.errors)

        if result.delta_time_ms is not None:
            intervals.append(result.delta_time_ms)

        print(
            f"[MUESTRA #{i:02d}] {payload} -> {status_text}"
        )

        if args.interval > 0 and i < args.samples:
            time.sleep(args.interval)

    # Consolidar reporte
    report.cleanliness_rate_percent = (report.clean_samples / report.total_samples) * 100.0
    report.avg_interval_ms = (sum(intervals) / len(intervals)) if intervals else 1000.0
    report.overall_verdict = "APROBADO" if report.corrupted_samples == 0 else "RECHAZADO"

    if args.report:
        print("\n" + "=" * 60)
        print("REPORTE DE LIMPIEZA DE TELEMETRÍA (003-telemetry-test-environment)")
        print("=" * 60)
        print(f"Total de Muestras Analizadas : {report.total_samples}")
        print(f"Muestras Conformes / Limpias : {report.clean_samples} ({report.cleanliness_rate_percent:.1f}%)")
        print(f"Muestras Rechazadas / Falla  : {report.corrupted_samples}")
        print(f"Intervalo Promedio           : {report.avg_interval_ms:.1f} ms")
        print(f"Veredicto Final              : {report.overall_verdict} {'✓' if report.overall_verdict == 'APROBADO' else '✗'}")
        print("=" * 60)

    if args.json_report:
        with open(args.json_report, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, indent=2)
        print(f"[REPORTE] Guardado en: {args.json_report}")


if __name__ == "__main__":
    run_cli()
