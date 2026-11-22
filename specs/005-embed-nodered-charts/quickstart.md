# Quickstart & Verification Guide: Verificación de Gráficos Embebidos de Node-RED

**Feature**: `005-embed-nodered-charts`

Esta guía detalla los pasos para validar que los gráficos de Node-RED se visualicen correctamente incrustados en el dashboard web.

---

## Prerrequisitos

1. **Node-RED en Ejecución**: Asegurarse de que Node-RED esté corriendo en `http://localhost:1880/ui/`.
2. **Dashboard Web**: Abrir el archivo `web/index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox).

---

## Paso 1: Apertura del Dashboard Web

Abre el archivo directamente o mediante servidor local:
- Ruta local directa: `C:\Clion\ESP32_Projects\monitoreo-boya-tilapia\web\index.html`
- O vía terminal con Python:
  ```bash
  python -m http.server 8000 --directory web
  ```
  Accediendo a: `http://localhost:8000/`

---

## Paso 2: Verificación Visual de los Gráficos

1. **Carga Automática**:
   - Observar que el mensaje temporal de placeholder desaparece.
   - El contenedor panorámico muestra los gráficos interactivos de Node-RED embebidos con altura adecuada (mínimo 520px).
2. **Interacción**:
   - Pasar el cursor sobre las curvas de Temperatura, pH o Humedad: las leyendas y valores instantáneos de Node-RED deben responder con fluidez.
3. **Botón de Refresco**:
   - Hacer clic en el icono de recarga (`rotate-cw`) en la barra de herramientas del gráfico: el iFrame debe parpadear sutilmente y recargar la conexión en vivo sin que las tarjetas métricas superiores se reinicien.
4. **Enlace Externo**:
   - Hacer clic en el icono de enlace externo (`external-link`): debe abrirse una nueva pestaña del navegador apuntando a `http://localhost:1880/ui/#!/0`.
