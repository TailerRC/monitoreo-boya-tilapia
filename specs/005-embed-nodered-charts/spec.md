# Feature Specification: Integración e Incrustación de Gráficos de Node-RED en el Dashboard Web

**Feature Branch**: `005-embed-nodered-charts`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "listo ya tengo mis graficos corriendo en http://localhost:1880/ui/#!/0?socketid=IZfXKWE1VjNn886NAAAK, ahora importemoslo a mi dashboard web"

## Clarifications

### Session 2026-11-21
- Q: ¿Cuál es la URL de origen de los gráficos de Node-RED? → A: La URL base del dashboard de Node-RED es `http://localhost:1880/ui/` (específicamente la vista de pestaña `http://localhost:1880/ui/#!/0`).
- Q: ¿Cómo debe comportarse la integración dentro del layout web workbench actual? → A: El marco `<iframe>` preconfigurado en `web/index.html` debe activarse enlazando la URL de Node-RED, ocultando el placeholder temporal y ajustando la altura y escalado visual para que los gráficos se aprecien nítidos, responsivos y sin desbordamientos de scroll horizontal.
- Q: ¿Qué sucede con las pestañas "Calidad de Agua" e "Interior Boya (ESP32)"? → A: Las pestañas deben permitir alternar fluidamente entre las vistas de los gráficos de Node-RED o permitir alternar entre la vista global de telemetría y sub-pestañas si Node-RED las tiene separadas, ofreciendo botón de refresco del marco en caso de reinicio de Node-RED.
- Q: ¿Cómo debe coordinarse la visualización entre los widgets nativos de Node-RED incrustados y las tarjetas métricas del dashboard web? → A: Option A (Renderizado nativo + Tarjetas semánticas centralizadas): El iFrame conserva 100% el renderizado nativo de Node-RED tal como fue diseñado (incluyendo el gauge de temperatura con rango 20–35 °C y sectores en el grupo [Home] Tilapias), mientras que las tarjetas métricas superiores del dashboard web son las que gobiernan y evalúan de forma centralizada los umbrales biológicos oficiales (óptimo, precaución y crítico) para los tres parámetros.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización e Incrustación en Vivo de Gráficos de Node-RED (Priority: P1) 🎯 MVP

Como operario o supervisor del estanque, quiero abrir el dashboard web en mi navegador y observar de inmediato los gráficos interactivos de telemetría generados por Node-RED (`http://localhost:1880/ui/`) incrustados en el contenedor principal, para analizar las tendencias históricas de calidad de agua y ambiente sin salir de la plataforma central.

**Why this priority**: Es la culminación del pipeline IoT visual (Boya ESP32 → Broker MQTT HiveMQ → Node-RED → Dashboard Web). Permite al usuario consultar métricas instantáneas y curvas de tendencias en una única interfaz consolidada.

**Independent Test**: Puede probarse abriendo `web/index.html` con Node-RED corriendo en `http://localhost:1880/ui/`: el contenedor de gráficos debe cargar la interfaz interactiva de Node-RED en el marco responsivo, eliminando el placeholder de espera.

**Acceptance Scenarios**:

1. **Given** Node-RED en ejecución en `http://localhost:1880/ui/`, **When** el usuario accede al dashboard web, **Then** el marco iFrame carga automáticamente los gráficos de telemetría y oculta el mensaje de "Esperando gráficos".
2. **Given** el iFrame incrustado, **When** el usuario interactúa con la interfaz (puntero sobre curvas, zoom o leyenda de series), **Then** los gráficos de Node-RED responden de forma táctil e interactiva sin retrasos ni interferencia con el encabezado o las tarjetas métricas superiores.
3. **Given** una pantalla de escritorio o móvil, **When** se visualiza el contenedor, **Then** el marco se adapta con un 100% de ancho y altura mínima suficiente (mínimo 480px) previniendo scroll horizontal.

---

### User Story 2 - Control de Navegación de Pestañas y Recarga del Marco (Priority: P2)

Como técnico acuícola, quiero alternar entre las pestañas del dashboard ("Calidad de Agua" y "Interior Boya") y contar con un botón para refrescar la conexión del iFrame, para recuperar rápidamente la visualización en caso de reinicio o modificación de flujos en Node-RED.

**Why this priority**: Mejora la experiencia de usuario y la resiliencia operativa en campo, permitiendo restablecer el enlace gráfico con un solo clic sin recargar toda la aplicación web.

**Independent Test**: Puede probarse pulsando el botón de recarga del contenedor gráfico: el iFrame debe reiniciar su sesión con Node-RED de forma instantánea mostrando un indicador sutil de actualización.

**Acceptance Scenarios**:

1. **Given** la barra de herramientas del contenedor gráfico, **When** el usuario hace clic en el botón de refrescar gráfico, **Then** el iFrame recarga la fuente `http://localhost:1880/ui/` sin reiniciar los temporizadores de simulación de las tarjetas métricas.
2. **Given** el selector de pestañas, **When** el operario cambia de pestaña, **Then** la vista conmuta fluidamente manteniendo el estado de carga del dashboard embebido.

---

### User Story 3 - Manejo de Estado Desconectado y Fallback Elegante (Priority: P3)

Como administrador del sistema, quiero que el dashboard muestre un estado visual claro si Node-RED no está en ejecución o el puerto 1880 no responde, para identificar de inmediato si la falla radica en el servicio de Node-RED y cómo solucionarla.

**Why this priority**: Evita marcos en blanco o errores 404 del navegador sin contexto, guiando al operario para verificar el contenedor de Node-RED.

**Independent Test**: Puede probarse deteniendo temporalmente Node-RED o apuntando a un puerto cerrado: la interfaz debe mostrar una tarjeta de advertencia estilizada con la indicación del servicio y botón de reintento.

**Acceptance Scenarios**:

1. **Given** Node-RED detenido o inaccesible, **When** el iFrame no logra conectar, **Then** se presenta una advertencia informativa con la dirección `http://localhost:1880/ui/` y sugerencia de verificar el servicio Docker de Node-RED.

---

### Edge Cases

- ¿Qué sucede si la URL contiene parámetros de socket temporales (`?socketid=...`)? El dashboard debe configurar la URL canónica limpia (`http://localhost:1880/ui/#!/0`) para evitar depender de identificadores de sesión efímeros que expiran al recargar el navegador.
- ¿Cómo se evitan bloqueos de seguridad por políticas de iFrame (*X-Frame-Options* o *CSP*)? Node-RED Dashboard permite por defecto la incrustación en el mismo host (`localhost`); la documentación debe registrar la directiva en caso de acceso desde otra IP de la LAN.
- ¿Qué ocurre en pantallas ultra estrechas (< 480px)? El contenedor debe preservar una altura proporcional mínima para que los controles y escalas de los gráficos de Node-RED sigan siendo operables sin deformaciones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El dashboard web DEBE enlazar e incrustar la interfaz de gráficos de Node-RED utilizando la URL base provista: `http://localhost:1880/ui/#!/0` (con fallback a `http://localhost:1880/ui/`).
- **FR-002**: El controlador de la aplicación (`web/app.js`) DEBE gestionar el ciclo de vida del `<iframe>`, eliminando la clase `hidden` y ocultando el placeholder de espera una vez que se activa la conexión con Node-RED.
- **FR-003**: El contenedor de gráficos en `web/index.html` y `web/style.css` DEBE dimensionar el `<iframe>` con un ancho del 100%, altura mínima de 520px, sin bordes invasivos (`border: none`) y esquinas redondeadas coincidentes con el sistema de tarjetas Workbench (`border-radius: 0.75rem`), conservando íntegro el estilo visual nativo de Node-RED (widgets gauge y chart del grupo `[Home] Tilapias`).
- **FR-004**: La interfaz DEBE permitir configurar o ajustar la URL base de Node-RED mediante una constante centralizada en `web/app.js` (o variable editable), facilitando el cambio si la IP del servidor Node-RED cambia en la red local.
- **FR-005**: El panel de gráficos DEBE incluir un botón de refresco rápido que permita recargar el contenido del `<iframe>` en demanda sin afectar el estado de las tarjetas métricas superiores.
- **FR-006**: La conmutación de pestañas ("Calidad de Agua" vs "Interior Boya (ESP32)") DEBE sincronizarse para mostrar la vista correspondiente de gráficos o enfocar el grupo correspondiente en el panel incrustado.
- **FR-007**: El diseño DEBE mantener plena compatibilidad responsiva móvil y de escritorio con Cumulative Layout Shift (CLS) = 0, reservando el espacio vertical antes y durante la carga del frame.
- **FR-008**: Las tarjetas métricas superiores del dashboard web DEBEN preservar la evaluación autónoma de los umbrales biológicos (óptimo, precaución y crítico) para Temperatura, pH y Humedad interna, actuando como la fuente centralizada de semaforización de salud del estanque y la boya.

### Key Entities *(include if feature involves data)*

- **Configuración de Enlace Node-RED**: Estructura de configuración en el frontend que almacena la URL destino (`http://localhost:1880/ui/#!/0`), estado de carga (`loading`, `active`, `error`) y timestamp del último refresco.
- **Contenedor iFrame de Telemetría**: Elemento DOM desacoplado con controles de recarga, indicador de estado de conexión y marco embebido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los gráficos de Node-RED se visualizan e interactúan completamente dentro del dashboard web en menos de 1 segundo tras la carga de la página.
- **SC-002**: Cero saltos acumulados de diseño (*Cumulative Layout Shift* = 0) en el contenedor de gráficos durante la transición de carga del iFrame.
- **SC-003**: El botón de refresco del iFrame recarga la fuente de Node-RED en un solo clic sin perder la sincronización de telemetría de las tarjetas métricas.
- **SC-004**: El marco se adapta sin desbordamientos horizontales ni barras de scroll parásitas en pantallas desde 360px hasta 2560px de ancho.

## Assumptions

- Node-RED se encuentra ejecutándose localmente con el plugin `node-red-dashboard` instalado y escuchando en el puerto 1880.
- El usuario puede acceder a `http://localhost:1880/ui/` desde el mismo navegador en el que abre `web/index.html`.
