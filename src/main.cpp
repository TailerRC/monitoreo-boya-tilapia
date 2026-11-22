#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ElegantOTA.h>
#include <PubSubClient.h>

// ===== TUS VARIABLES GLOBALES =====

// Variables Oficiales de Telemetría (preparadas para futura lectura física de sensores)
float temperatura_agua = 26.5f; // Sonda sumergible DS18B20 (°C, rango óptimo: 26.0 - 30.0 °C)
float ph_agua = 7.20f;          // Sonda de pH PHE-45P (escala 0-14, rango óptimo: 6.5 - 8.5)
float humedad_interna = 55.0f;  // Sensor interior gabinete ESP32 (% HR, rango seguro: < 70.0% HR)

// Control de Temporización No Bloqueante (Simulación a 1 segundo / 1 Hz)
const unsigned long INTERVALO_SIMULACION = 1000;
unsigned long tiempoUltimaSimulacion = 0;


// Inicialización de WiFi
const char* ssid = "FAMILIA_2.4G";
const char* password = "10517369";
// Servidor MQTT Broker Docker Local
const char* mqtt_server = "192.168.100.128"; //IPv4 Red Movil
const int mqtt_port  = 1883;

AsyncWebServer server(80);
WiFiClient esp32Client;
PubSubClient client(esp32Client);

// Funciones
void reconectarMQTT() {
    while (!client.connected()) {
        Serial.print("Conectando al broker...");
        if (client.connect("esp32-tilapias-01")) {   // Client ID único
            Serial.println("OK");
        } else {
            Serial.print("falló, rc=");
            Serial.println(client.state());
            delay(3000);
        }
    }
}

void setup() {
    Serial.begin(115200);

    // ===== SETUP =====


    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.begin(ssid, password);
    Serial.println("");
    unsigned long inicio = millis();
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        if (millis() - inicio > 20000) {
            ESP.restart();
        }
    }
    Serial.println("");
    Serial.print("Red Conectada: ");
    Serial.println(ssid);
    Serial.print("IP ESP32: ");
    Serial.println(WiFi.localIP());

    server.on("/", WebRequestMethod::HTTP_GET , [](AsyncWebServerRequest *request) {
      request->send(200, "text/plain", "Servidor Encendido, puedes subir tu código");
    });

    // Inicio de Servidor OTA
    ElegantOTA.begin(&server);
    server.begin();
    Serial.print("Servidor OTA Iniciado \n");
    Serial.println("http://" + WiFi.localIP().toString() + "/update");
    // ===== SETUP (SENSORES QUE PUEDAN PRESENTAR FALLAS) =====
    client.setServer(mqtt_server, mqtt_port);

    Serial.println("--- Variables Oficiales Inicializadas ---");
    Serial.print("Temp Agua Inicial: "); Serial.print(temperatura_agua, 1); Serial.println(" °C");
    Serial.print("pH Agua Inicial: "); Serial.print(ph_agua, 2); Serial.println("");
    Serial.print("Humedad Interna Inicial: "); Serial.print(humedad_interna, 1); Serial.println(" %");
    Serial.println("-----------------------------------------");

}

void loop() {
    ElegantOTA.loop();

    // ===== LOOP =====
    if (!client.connected()) reconectarMQTT();
    client.loop();

    // Temporizador no bloqueante: simulación y despacho cada 1000 ms (1 Hz)
    unsigned long tiempoActual = millis();
    if (tiempoActual - tiempoUltimaSimulacion >= INTERVALO_SIMULACION) {
        tiempoUltimaSimulacion = tiempoActual;

        // Simulación con caminata aleatoria restringida (fluctuaciones leves realistas)
        temperatura_agua += (random(-10, 11) / 100.0f); // +/- 0.1 °C
        ph_agua          += (random(-5, 6)   / 100.0f); // +/- 0.05 pH
        humedad_interna  += (random(-15, 16) / 10.0f);  // +/- 1.5 % HR

        // Acotamiento dentro de límites operativos verosímiles
        temperatura_agua = constrain(temperatura_agua, 25.0f, 31.0f);
        ph_agua          = constrain(ph_agua, 6.50f, 8.50f);
        humedad_interna  = constrain(humedad_interna, 45.0f, 75.0f);

        // Construcción del payload JSON con las 3 variables oficiales
        String payload = "{\"temperatura\":" + String(temperatura_agua, 1) +
                         ",\"ph\":" + String(ph_agua, 2) +
                         ",\"humedad_interna\":" + String(humedad_interna, 1) + "}";

        // Publicación al broker MQTT HiveMQ
        client.publish("tilapias/estanque1/datos", payload.c_str());

        // Reporte por monitor serie UART a 115200 baudios
        Serial.print("[TELEMETRIA-1s] Temp: ");
        Serial.print(temperatura_agua, 1);
        Serial.print(" °C | pH: ");
        Serial.print(ph_agua, 2);
        Serial.print(" | Hum Int: ");
        Serial.print(humedad_interna, 1);
        Serial.println(" % -> Publicado en tilapias/estanque1/datos");
    }
}