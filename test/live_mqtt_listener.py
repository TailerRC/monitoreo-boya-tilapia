"""
Suscriptor de escucha en vivo sobre broker MQTT para auditar telemetría de campo.
Feature: 003-telemetry-test-environment
"""

import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validator import TelemetryDataValidator, TestSuiteReport


def run_listener():
    parser = argparse.ArgumentParser(description="Escucha y validación en vivo de telemetría MQTT de la boya.")
    parser.add_argument("--host", type=str, default="10.234.217.133", help="Host del broker MQTT (Docker Local).")
    parser.add_argument("--port", type=int, default=1883, help="Puerto del broker MQTT.")
    parser.add_argument("--topic", type=str, default="tilapias/estanque1/datos", help="Tópico MQTT.")
    parser.add_argument("--max-messages", type=int, default=30, help="Límite de mensajes a auditar antes de cerrar.")
    args = parser.parse_args()

    print(f"[MQTT-LISTENER] Configurado para escuchar en {args.host}:{args.port} en tópico '{args.topic}'")
    print("[MQTT-LISTENER] Verificando disponibilidad de cliente MQTT...")

    try:
        import paho.mqtt.client as mqtt
    except ImportError:
        print("[AVISO] La librería 'paho-mqtt' no está instalada en el entorno Python global.")
        print("[INFO] Para escuchar paquetes en vivo desde la boya física, instale opcionalmente:")
        print("       pip install paho-mqtt")
        print("[INFO] El entorno de pruebas autónomo y la suite 'test_telemetry_cleanliness.py' funcionan al 100% sin esta dependencia.")
        return 0

    validator = TelemetryDataValidator()
    report = TestSuiteReport()
    messages_received = 0

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print(f"[MQTT-LISTENER] Conectado exitosamente al broker. Suscribiendo a '{args.topic}'...")
            client.subscribe(args.topic)
        else:
            print(f"[MQTT-LISTENER] Error de conexión al broker, código rc={rc}")

    def on_message(client, userdata, msg):
        nonlocal messages_received
        payload_str = msg.payload.decode("utf-8", errors="replace")
        now = time.time()
        result = validator.validate_payload(payload_str, current_time=now)

        messages_received += 1
        status = "LIMPIO ✓" if result.is_clean else f"CORRUPTO ✗ ({'; '.join(result.errors)})"
        print(f"[EN VIVO #{messages_received:02d}] {payload_str} -> {status}")

        report.total_samples += 1
        if result.is_clean:
            report.clean_samples += 1
        else:
            report.corrupted_samples += 1

        if messages_received >= args.max_messages:
            client.disconnect()

    client = mqtt.Client(client_id="test-cleanliness-listener")
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(args.host, args.port, 60)
        client.loop_forever()
    except Exception as e:
        print(f"[ERROR-RED] No se pudo conectar al broker MQTT en {args.host}:{args.port}: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(run_listener())
