# Feature Specification: Dashboard Web Layout and Visual Design

**Feature Branch**: `001-dashboard-web-layout`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Vamos a realizar el dashboard web, sober todo dejar el diseño ya definido para luego incorporar los graficos"

## Clarifications

### Session 2026-11-20
- Q: ¿Cómo deben distribuirse espacialmente los contenedores de gráficos en la vista de escritorio para los reportes de Node-RED? → A: Option C: Un solo contenedor panorámico principal con pestañas intercambiables (Tabs) para alternar entre "Calidad de Agua" y "Ambiente".
- Q: ¿Cómo debe la interfaz manejar la simulación de estados de telemetría durante esta fase de diseño previa a la conexión del hardware físico? → A: Option C: Simulador automático mediante un temporizador en JavaScript que genera pequeñas oscilaciones realistas de telemetría cada 5 segundos de forma automática.
- Q: ¿Qué mecanismo de integración principal debe dejarse maquetado en el contenedor de gráficos para recibir las visualizaciones de Node-RED? → A: Option A: Marco `<iframe>` desacoplado con dimensiones responsivas (100% de ancho, altura mínima de 340px y sin bordes invasivos) listo para enlazar la URL generada por Node-RED.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización del Panel Principal y Métricas Clave (Priority: P1)

Como operario o piscicultor del estanque de tilapias, quiero acceder al dashboard web y observar de forma inmediata las métricas críticas del agua (Temperatura, pH y Humedad) junto con el estado de conexión de la boya, para evaluar la salud del estanque en pocos segundos.

**Why this priority**: Es la función primordial del sistema de monitoreo. Proporciona valor inmediato como interfaz visual de supervisión, permitiendo saber si las variables acuícolas están en condiciones normales.

**Independent Test**: Puede probarse de forma autónoma abriendo la interfaz en cualquier navegador: el usuario debe visualizar la cabecera del estanque, el indicador de conectividad y tres tarjetas de métricas formateadas con sus unidades correspondientes (°C, pH, %) y códigos visuales de estado (óptimo/advertencia).

**Acceptance Scenarios**:

1. **Given** que el usuario carga el dashboard web, **When** la página inicializa, **Then** se muestran tres tarjetas métricas destacadas para Temperatura del Agua, pH y Humedad con valores numéricos formateados, etiquetas y estado de salud visible.
2. **Given** un valor de telemetría fuera del rango recomendado de tilapias (ej. pH < 6.5 o > 8.5), **When** se evalúa el estado visual de la tarjeta, **Then** la tarjeta cambia su acento de color a advertencia/alerta para señalar la condición anómala.
3. **Given** la barra superior del dashboard, **When** el operario la visualiza, **Then** observa el nombre del estanque/boya, una insignia (*badge*) del estado de conexión (En línea / Sin señal) y la estampa de tiempo de la última actualización.
4. **Given** la interfaz en ejecución sin hardware conectado, **When** transcurren 5 segundos en el temporizador automático, **Then** las lecturas numéricas y la hora de última sincronización se actualizan reflejando pequeñas oscilaciones naturales del estanque.

---

### User Story 2 - Contenedores Modulares y Placeholders para Gráficos de Node-RED (Priority: P2)

Como desarrollador e integrador de la solución, quiero que el layout disponga de un panel gráfico principal con pestañas intercambiables (*tabs*), controles de rango temporal y un espacio reservado para gráficos con marco `<iframe>` desacoplado, para integrar posteriormente los gráficos dinámicos de Node-RED sin desestructurar la interfaz.

**Why this priority**: Prepara la arquitectura visual para la siguiente fase de integración de gráficos de Node-RED, maximizando la legibilidad panorámica de las series de tiempo mediante pestañas y garantizando compatibilidad plug-and-play con las vistas web de Node-RED.

**Independent Test**: Puede probarse verificando que el contenedor de gráficos mantenga su proporción fija o responsiva, permita alternar entre las pestañas "Calidad de Agua" y "Ambiente", muestre botones de rango temporal y exhiba un estado visual claro (placeholder informativo con marco iframe listo) indicando la preparación para recibir el gráfico.

**Acceptance Scenarios**:

1. **Given** la sección de gráficos del dashboard, **When** no se han inyectado aún los gráficos de Node-RED, **Then** el contenedor muestra un marco estilizado con selector de pestañas (Calidad de Agua / Ambiente), selector de período (1h, 6h, 24h) y un estado de marcador de posición (*placeholder*) indicando "Esperando conexión con gráficos de telemetría".
2. **Given** la interacción con las pestañas de gráficos, **When** el operario hace clic en "Ambiente", **Then** la vista activa conmuta instantáneamente al espacio reservado para humedad ambiental conservando las dimensiones del contenedor.
3. **Given** la futura incrustación de un componente gráfico de Node-RED vía iframe, **When** se enlaza la URL en el panel activo, **Then** el marco ocupa el 100% del ancho del contenedor sin desbordamiento horizontal ni saltos de contenido.

---

### User Story 3 - Adaptabilidad Responsiva para Operación en Campo (Mobile & Desktop) (Priority: P3)

Como técnico acuícola en campo, quiero consultar el dashboard tanto desde un smartphone o tablet al borde del estanque como desde una computadora de escritorio en la estación de control, para monitorear el sistema cómodamente desde cualquier dispositivo.

**Why this priority**: En entornos de piscicultura, las inspecciones se realizan directamente en campo mediante dispositivos móviles, requiriendo que la disposición visual se adapte fluidamente a pantallas estrechas.

**Independent Test**: Puede probarse redimensionando la ventana del navegador a anchos de pantalla móvil (< 768px) y escritorio (> 1024px): las tarjetas de métricas y los contenedores de gráficos deben reorganizarse de múltiples columnas a una sola columna legible sin pérdida de contenido ni desplazamiento horizontal.

**Acceptance Scenarios**:

1. **Given** una pantalla de dispositivo móvil (ancho ≤ 768px), **When** el usuario visualiza el dashboard, **Then** las tarjetas de métricas se apilan verticalmente y el panel de gráficos ocupa el ancho completo disponible con tipografía legible.
2. **Given** una pantalla de escritorio (ancho ≥ 1024px), **When** el usuario visualiza el dashboard, **Then** el layout organiza las tarjetas en una cuadrícula horizontal superior y despliega el contenedor de gráficos en formato panorámico aprovechando el ancho de la estación de trabajo.

---

### Edge Cases

- ¿Qué sucede cuando la pantalla del dispositivo es ultra estrecha (menos de 360px de ancho)? El diseño debe mantener márgenes mínimos de seguridad, ajustar el tamaño de fuente de los valores numéricos y evitar que los textos se trunquen o desborden la tarjeta.
- ¿Cómo maneja la interfaz la ausencia temporal de telemetría? Cada tarjeta métrica debe mostrar un valor neutro ("--") con indicador de estado "En espera" en lugar de mostrar errores de ejecución o valores indefinidos.
- ¿Qué ocurre si un gráfico embebido falla o demora en responder? El contenedor del gráfico debe preservar su altura mínima preestablecida (340px) sin colapsar el resto de la página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La interfaz DEBE presentar una barra de encabezado principal que identifique claramente el sistema ("Boya IoT - Monitoreo de Estanque de Tilapias"), el identificador de la boya activa y la hora de última lectura.
- **FR-002**: La interfaz DEBE incluir una insignia visual de estado de conectividad que indique claramente los estados: "En línea", "Desconectado" y "Advertencia".
- **FR-003**: El dashboard DEBE proveer tarjetas de métricas dedicadas para:
  1. Temperatura del Agua (expresada en °C).
  2. pH del Agua (expresado en escala de 0 a 14 con precisión decimal).
  3. Humedad Ambiental (expresada en %).
- **FR-004**: Cada tarjeta de métrica DEBE exhibir un indicador visual de salud basado en rangos biológicos para tilapias (Óptimo, Precaución, Crítico) y el rango de referencia ideal visible para el operador.
- **FR-005**: El layout DEBE destinar un contenedor gráfico panorámico modular principal equipado con pestañas (*tabs*) intercambiables para alternar fluidamente entre la vista de "Calidad de Agua (Temperatura vs. pH)" y "Registro Ambiental (Humedad)", maximizando el espacio de visualización sin sobrecargar la pantalla.
- **FR-006**: El contenedor de gráficos DEBE incorporar una barra de herramientas superior con selector de intervalo de tiempo simulado (1 Hora, 6 Horas, 24 Horas) y botón de refresco.
- **FR-007**: El contenedor de gráficos DEBE incluir un marco `<iframe>` responsivo (con ancho 100%, altura mínima de 340px y sin bordes invasivos) preparado para recibir la URL de Node-RED, mostrando un placeholder visual informativo y estilizado mientras la URL no esté configurada o esté en proceso de carga.
- **FR-008**: La estructura visual DEBE ser totalmente adaptativa (*responsive*), utilizando una cuadrícula flexible que reorganice los elementos entre vistas de escritorio, tabletas y teléfonos móviles sin necesidad de desplazamiento horizontal.
- **FR-009**: La paleta de colores DEBE basarse en un tema sobre fondo blanco puro (#FFFFFF / Clean White Workbench) con tarjetas de superficie blanca, bordes sutiles de delimitación (#E2E8F0), sombras difusas suaves (`shadow-sm`), acentos acuícolas en azul cielo (#0284C7) y códigos semánticos de semáforo (verde/amarillo/rojo) para la salud biológica de las tilapias.
- **FR-010**: La interfaz DEBE implementar en su controlador JavaScript un temporizador de simulación local (intervalo de 5 segundos) que genere fluctuaciones leves y verosímiles en las lecturas de telemetría y actualice la marca de tiempo de sincronización de forma continua, demostrando el dinamismo de las tarjetas y badges sin requerir hardware físico en esta fase.

### Key Entities *(include if feature involves data)*

- **Lectura de Telemetría**: Representa el paquete de datos del estanque; contiene temperatura de agua, nivel de pH, porcentaje de humedad, estampa temporal y estado de validez de sensor.
- **Rango Parámetro Tilapia**: Entidad de configuración visual que define los umbrales seguros (ej. Temperatura: 26-30 °C; pH: 6.5-8.5) y asocia estilos de color (verde = óptimo, amarillo = alerta, rojo = peligro).
- **Contenedor de Gráfico con Pestañas e Iframe**: Bloque visual modular con selector de pestaña activa ("Calidad de Agua" vs "Ambiente"), controles de rango temporal, dimensiones fijadas/elásticas y marco `<iframe>` listo para incrustación de Node-RED.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede identificar el estado general de salud del estanque y sus tres variables en menos de 5 segundos tras abrir el dashboard.
- **SC-002**: El diseño de la interfaz se adapta fluidamente sin desbordamiento horizontal en pantallas desde 360px hasta 2560px de ancho (100% de cumplimiento en pruebas de adaptabilidad).
- **SC-003**: El tiempo de renderizado visual inicial de la interfaz en navegador es inferior a 1 segundo en conexiones locales o estándar de campo.
- **SC-004**: Los contenedores para gráficos previenen el salto de diseño (*Cumulative Layout Shift* cercano a 0) reservando el espacio exacto (mínimo 340px de alto) para las visualizaciones de Node-RED.
- **SC-005**: El 100% de las tarjetas métricas comunican con claridad su unidad de medida y rango de normalidad sin requerir manual de usuario.

## Assumptions

- El dashboard correrá inicialmente en un servidor web local (o servido estáticamente) accesible dentro de la misma red local que la boya y el servidor de Node-RED.
- La incorporación activa de los gráficos interactivos reales desde Node-RED (mediante iframe, websocket o canvas) se implementará en una feature posterior sobre estos contenedores ya diseñados y reservados.
- No se requiere autenticación de usuarios multi-rol en esta primera etapa de diseño del panel visual.
- Los rangos óptimos de referencia corresponden a los estándares biológicos convencionales para cultivo de tilapia del Nilo (*Oreochromis niloticus*).
