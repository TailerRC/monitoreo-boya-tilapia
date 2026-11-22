# Research: Dashboard Web Layout & White Workbench Aesthetic

**Feature**: `001-dashboard-web-layout`

## Decision 1: Sistema de Diseño y Paleta Visual sobre Fondo Blanco Puro (White Aesthetic)

- **Decisión**: Implementar una paleta de diseño clara, minimalista y de alto contraste ("Clean White Workbench") adaptando los tokens visuales de `SWGEPA-staging` a un tema blanco.
- **Detalle de Tokens**:
  - Superficie base (`--bg-page`): `#FFFFFF` (Blanco puro) para máxima luminosidad y legibilidad bajo luz diurna.
  - Superficie de paneles y tarjetas (`--bg-card`): `#FFFFFF` con micro-bordes `#E2E8F0` y elevación suave `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05)`.
  - Contraste tipográfico: Títulos en `#0F172A` (Slate 900) y subtítulos en `#64748B` (Slate 500).
  - Acento acuícola: Azul marino/cian `#0284C7` (Sky 600) para elementos activos, botones y foco.
  - Insignias de semáforo biológico:
    - Normal/Óptimo: Texto `#059669` / Fondo `#ECFDF5` / Borde `#A7F3D0`.
    - Alerta/Precaución: Texto `#D97706` / Fondo `#FFFBEB` / Borde `#FDE68A`.
    - Crítico/Peligro: Texto `#DC2626` / Fondo `#FEF2F2` / Borde `#FECACA`.
- **Razón**: Los dashboards utilizados en estaciones de control acuícola o al aire libre requieren fondos blancos y contrastes altos para evitar reflejos. Elimina la estética oscura de desarrollo y proporciona una apariencia profesional, limpia y estructurada.
- **Alternativas consideradas**:
  - *Modo Oscuro como predeterminado*: Rechazado; la indicación explícita del usuario requiere un dashboard blanco para mejor visibilidad y estética corporativa.
  - *Fondos grisáceos pesados (#D1D5DB)*: Rechazado por generar una interfaz pesada y menos moderna.

## Decision 2: Arquitectura de Estilos (Variables CSS Nativas vs. Framework Compilado)

- **Decisión**: Utilizar CSS3 nativo moderno estructurado con Variables CSS (`:root`), Flexbox y CSS Grid en `web/style.css`, extrayendo las convenciones de clases de shadcn/Tailwind sin obligar a un proceso de compilación Node.js en tiempo de desarrollo.
- **Razón**: El microcontrolador y el servidor local de la boya se benefician de archivos estáticos que se puedan servir directamente o abrir como archivos locales (`file://` o servidor estático rápido como `python -m http.server`), sin sobrecarga de dependencias ni herramientas de build complejas.
- **Alternativas consideradas**:
  - *Vite + Vue 3 / Inertia (como en SWGEPA)*: Rechazado porque añade un runtime innecesario de Node.js, dependencias PHP/Laravel descartadas y mayor consumo de recursos.
  - *Tailwind CDN en tiempo de ejecución*: Evaluado como viable pero con posible latencia en redes desconectadas de campo. El CSS nativo con variables asegura autonomía offline 100%.

## Decision 3: Modularidad y Reserva de Espacio para Gráficos de Node-RED

- **Decisión**: Diseñar los contenedores de gráficos con alturas mínimas fijas (`min-height: 340px`) y relación de aspecto consistente, incorporando un marco con `iframe-wrapper` y un estado de *placeholder* visual elegante ("Cargando gráfico de Node-RED...").
- **Razón**: Cumple con el principio de cero saltos acumulados de diseño (*CLS = 0*). Cuando Node-RED exponga sus gráficos mediante `node-red-dashboard` o endpoints UI, solo se requerirá apuntar el `src` del iframe o el selector al contenedor, sin desajustar el diseño existente.
- **Alternativas consideradas**:
  - *Generar gráficos directamente con librerías JS en el frontend*: Rechazado en esta fase porque el requerimiento del proyecto establece que Node-RED generará y gestionará los gráficos para su posterior incrustación.

## Decision 4: Sistema de Iconografía Técnica

- **Decisión**: Integrar **Lucide Icons** mediante script ligero CDN con soporte para reemplazo automático (`lucide.createIcons()`), garantizando la misma familia iconográfica limpia que utiliza `SWGEPA-staging`.
- **Iconos seleccionados**:
  - `activity` / `pulse`: Estado general del sistema.
  - `thermometer`: Temperatura del agua.
  - `droplet` / `flask-conical`: Nivel de pH.
  - `wind` / `cloud-rain`: Humedad ambiental.
  - `wifi` / `wifi-off`: Estado de conectividad de la boya.
  - `clock`: Última sincronización.
- **Razón**: Iconografía técnica nítida de trazo fino (1.5px - 2px) que refuerza la estética de instrumentación.

## Decision 5: Selección de Sensores de Hardware y Rangos Operativos

- **Decisión**: El sistema analiza exclusivamente 3 variables mediante hardware específico:
  1. **pH del Agua**: Sensor de pH con sonda **PHE-45P** (Código/SKU: **Q004-SNS-PC-000**) mediante módulo acondicionador de señal.
     - *Rango óptimo para tilapia*: `6.5 - 8.5` (Precaución: `6.0 - 6.4` o `8.6 - 9.0`; Crítico: `< 6.0` o `> 9.0`).
  2. **Temperatura del Agua**: Sonda sumergible **DS18B20** en encapsulado de acero inoxidable (protocolo digital 1-Wire).
     - *Rango óptimo para tilapia*: `26.0 - 30.0 °C` (Precaución: `24.0 - 25.9 °C` o `30.1 - 32.0 °C`; Crítico: `< 24.0 °C` o `> 32.0 °C`).
  3. **Humedad Interna de la Boya (Carcasa ESP32)**: Sensor de humedad no sumergible montado en el interior de la boya al lado del ESP32 para verificar estanqueidad y prevenir condensación perjudicial.
     - *Rango operativo seguro para electrónica*: `< 70.0% HR` (Precaución por condensación: `70.0% - 85.0% HR`; Crítico/Riesgo de filtración: `> 85.0% HR`).
- **Razón**: Asegura claridad total entre variables biológicas del estanque (agua) y la salud física/estanqueidad del equipo electrónico flotante (ESP32). Evita falsas lecturas de humedad ambiental abierta concentrándose en la seguridad del microcontrolador dentro de la boya.
