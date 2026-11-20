#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ElegantOTA.h>

// ===== TUS VARIABLES GLOBALES =====
int led_pin = 2;
unsigned long ultimoCambio = 0;

// Inicialización de WiFi
const char* ssid = "FAMILIA_2.4G";
const char* password = "10517369";

AsyncWebServer server(80);

void setup() {
    Serial.begin(115200);

    // ===== SETUP =====
    pinMode(led_pin, OUTPUT);

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


}

void loop() {
    ElegantOTA.loop();

    // ===== LOOP =====
    if (millis() - ultimoCambio >= 1500) {
        ultimoCambio = millis();
        digitalWrite(led_pin, !digitalRead(led_pin));
    }
}