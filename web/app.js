/**
 * ============================================================================
 * Boya IoT Monitoreo Tilapia - Application Controller
 * Controlador frontend para 3 secciones independientes de Node-RED Dashboard:
 * - Sección 1: Temperatura (http://localhost:1880/ui/#!/0)
 * - Sección 2: pH del Agua  (http://localhost:1880/ui/#!/1)
 * - Sección 3: Humedad      (http://localhost:1880/ui/#!/2)
 * Sincronización en tiempo real con las tarjetas métricas superiores
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. Configuración de WebSocket y Pestañas de Node-RED
    const WS_CONFIG = {
        url: 'ws://localhost:1880/ws/boya',
        reconnectInterval: 2000
    };

    const NODERED_CONFIG = {
        baseUrl: 'http://localhost:1880',
        tabs: {
            temp: {
                id: 'temp',
                url: 'http://localhost:1880/ui/#!/0',
                slotId: 'slot-temp',
                btnId: 'tab-temp',
                cardId: 'card-temp',
                iframeId: 'iframe-temp',
                label: 'Temperatura del Agua'
            },
            ph: {
                id: 'ph',
                url: 'http://localhost:1880/ui/#!/1',
                slotId: 'slot-ph',
                btnId: 'tab-ph',
                cardId: 'card-ph',
                iframeId: 'iframe-ph',
                label: 'pH del Agua'
            },
            hum: {
                id: 'hum',
                url: 'http://localhost:1880/ui/#!/2',
                slotId: 'slot-hum',
                btnId: 'tab-hum',
                cardId: 'card-humidity',
                iframeId: 'iframe-hum',
                label: 'Humedad Interna'
            }
        }
    };

    // 2. Umbrales y Rangos Biológicos Óptimos para Tilapias e Integridad de Boya
    const AQUACULTURE_THRESHOLDS = {
        water_temp: {
            optimalMin: 26.0,
            optimalMax: 30.0,
            cautionMin: 24.0,
            cautionMax: 32.0,
            unit: '°C'
        },
        ph: {
            optimalMin: 6.5,
            optimalMax: 8.5,
            cautionMin: 6.0,
            cautionMax: 9.0,
            unit: 'pH'
        },
        ambient_hum: {
            optimalMin: 10.0,
            optimalMax: 70.0,   // Menor a 70% HR garantiza estanqueidad sin condensación
            cautionMin: 0.0,
            cautionMax: 85.0,
            unit: '%'
        }
    };

    // 3. Estado Global
    const state = {
        activeTab: 'temp',
        socket: null,
        metrics: {
            water_temp: 27.1,
            ph: 6.67,
            ambient_hum: 69.2
        }
    };

    // 4. Referencias DOM
    const elements = {
        lastSyncText: document.getElementById('last-sync-text'),

        // Tarjetas Métricas Superiores
        cardTemp: document.getElementById('card-temp'),
        valTemp: document.getElementById('val-temp'),
        badgeTemp: document.getElementById('badge-temp'),

        cardPh: document.getElementById('card-ph'),
        valPh: document.getElementById('val-ph'),
        badgePh: document.getElementById('badge-ph'),

        cardHum: document.getElementById('card-humidity'),
        valHum: document.getElementById('val-humidity'),
        badgeHum: document.getElementById('badge-humidity'),

        // Pestañas (3 Secciones por separado)
        tabTemp: document.getElementById('tab-temp'),
        tabPh: document.getElementById('tab-ph'),
        tabHum: document.getElementById('tab-hum'),

        slotTemp: document.getElementById('slot-temp'),
        slotPh: document.getElementById('slot-ph'),
        slotHum: document.getElementById('slot-hum'),

        iframeTemp: document.getElementById('iframe-temp'),
        iframePh: document.getElementById('iframe-ph'),
        iframeHum: document.getElementById('iframe-hum'),

        // Acciones Toolbar
        btnOpenNodeRed: document.getElementById('btn-open-nodered')
    };

    /**
     * Evalúa una lectura de sensor contra los umbrales biológicos acuícolas
     */
    function evaluateAquacultureRange(key, value) {
        const threshold = AQUACULTURE_THRESHOLDS[key];
        if (!threshold || value === null || isNaN(value)) {
            return {
                status: 'unknown',
                label: 'Esperando datos',
                badgeClass: 'badge-secondary'
            };
        }

        if (value >= threshold.optimalMin && value <= threshold.optimalMax) {
            return {
                status: 'optimal',
                label: key === 'ambient_hum' ? 'Estanco' : 'Óptimo',
                badgeClass: 'badge-success'
            };
        } else if (value >= threshold.cautionMin && value <= threshold.cautionMax) {
            return {
                status: 'caution',
                label: key === 'ambient_hum' ? 'Humedad Alta' : 'Precaución',
                badgeClass: 'badge-warning'
            };
        } else {
            return {
                status: 'critical',
                label: key === 'ambient_hum' ? 'Condensación' : 'Crítico',
                badgeClass: 'badge-danger'
            };
        }
    }

    /**
     * Actualiza el badge visual de una tarjeta con texto e icono correspondiente
     */
    function updateBadge(badgeElement, evaluation) {
        if (!badgeElement) return;

        badgeElement.className = `badge ${evaluation.badgeClass}`;

        let iconName = 'check-circle-2';
        if (evaluation.status === 'caution') iconName = 'alert-triangle';
        if (evaluation.status === 'critical') iconName = 'alert-octagon';
        if (evaluation.status === 'unknown') iconName = 'clock';

        badgeElement.innerHTML = `
            <i data-lucide="${iconName}" class="badge-icon"></i>
            <span class="badge-text">${evaluation.label}</span>
        `;
    }

    /**
     * Refresca los iconos Lucide en el DOM
     */
    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    /**
     * Renderiza las métricas en las tarjetas superiores (Cards)
     */
    function renderTelemetry(metrics) {
        if (!metrics) return;

        // Tarjeta 1: Temperatura
        if (elements.valTemp && metrics.water_temp !== null) {
            elements.valTemp.textContent = Number(metrics.water_temp).toFixed(1);
            const evalTemp = evaluateAquacultureRange('water_temp', metrics.water_temp);
            updateBadge(elements.badgeTemp, evalTemp);
        }

        // Tarjeta 2: pH
        if (elements.valPh && metrics.ph !== null) {
            elements.valPh.textContent = Number(metrics.ph).toFixed(2);
            const evalPh = evaluateAquacultureRange('ph', metrics.ph);
            updateBadge(elements.badgePh, evalPh);
        }

        // Tarjeta 3: Humedad
        if (elements.valHum && metrics.ambient_hum !== null) {
            elements.valHum.textContent = Number(metrics.ambient_hum).toFixed(1);
            const evalHum = evaluateAquacultureRange('ambient_hum', metrics.ambient_hum);
            updateBadge(elements.badgeHum, evalHum);
        }

        refreshIcons();

        window.dispatchEvent(new CustomEvent('tilapia:telemetry-update', {
            detail: {
                timestamp: new Date().toISOString(),
                metrics: metrics
            }
        }));
    }

    /**
     * Procesa los datos en vivo emitidos por el WebSocket de Node-RED (/ws/boya)
     * Formato esperado: { "temp": 25.4, "ph": 7.75, "hum": 68.2, "hora": "11:40:45 p. m." }
     */
    function handleIncomingTelemetry(data) {
        if (!data) return;

        let changed = false;

        // 1. Temperatura del agua
        const tempVal = data.temp !== undefined ? Number(data.temp) : (data.temperatura !== undefined ? Number(data.temperatura) : null);
        if (tempVal !== null && !isNaN(tempVal)) {
            state.metrics.water_temp = tempVal;
            changed = true;
        }

        // 2. Nivel de pH del agua
        const phVal = data.ph !== undefined ? Number(data.ph) : null;
        if (phVal !== null && !isNaN(phVal)) {
            state.metrics.ph = phVal;
            changed = true;
        }

        // 3. Humedad interna de la boya
        const humVal = data.hum !== undefined ? Number(data.hum) : (data.humedad !== undefined ? Number(data.humedad) : (data.humedad_interna !== undefined ? Number(data.humedad_interna) : null));
        if (humVal !== null && !isNaN(humVal)) {
            state.metrics.ambient_hum = humVal;
            changed = true;
        }

        // 4. Estampa de hora recibida
        if (data.hora && elements.lastSyncText) {
            elements.lastSyncText.textContent = `Actualizado: ${data.hora}`;
        }

        if (changed) {
            renderTelemetry(state.metrics);
        }
    }

    /**
     * Conexión WebSocket nativa con Node-RED (ws://localhost:1880/ws/boya)
     */
    function initWebSocket() {
        try {
            const ws = new WebSocket(WS_CONFIG.url);

            ws.onopen = () => {
                console.log('[TILAPIA] WebSocket conectado ✅ ws://localhost:1880/ws/boya');
            };

            ws.onmessage = (event) => {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    handleIncomingTelemetry(data);
                } catch (err) {
                    console.warn('[TILAPIA] Error parseando JSON de WebSocket:', err);
                }
            };

            ws.onerror = (err) => {
                console.log('[TILAPIA] WebSocket Error ❌');
            };

            ws.onclose = () => {
                console.log('[TILAPIA] WebSocket cerrado. Reintentando en 2s...');
                setTimeout(initWebSocket, WS_CONFIG.reconnectInterval);
            };
        } catch (e) {
            console.warn('[TILAPIA] Error creando WebSocket:', e);
            setTimeout(initWebSocket, WS_CONFIG.reconnectInterval);
        }
    }

    /**
     * Activa una sección/pestaña específica por su ID ('temp', 'ph', 'hum')
     */
    function activateSection(tabId) {
        const target = NODERED_CONFIG.tabs[tabId];
        if (!target) return;

        // Desactivar todas las pestañas y slots
        Object.values(NODERED_CONFIG.tabs).forEach(tab => {
            const btn = document.getElementById(tab.btnId);
            const slot = document.getElementById(tab.slotId);
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
            if (slot) {
                slot.classList.remove('active');
            }
        });

        // Activar la seleccionada
        const activeBtn = document.getElementById(target.btnId);
        const activeSlot = document.getElementById(target.slotId);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-selected', 'true');
        }
        if (activeSlot) {
            activeSlot.classList.add('active');
        }

        state.activeTab = tabId;

        // Actualizar botón de enlace externo de Node-RED
        if (elements.btnOpenNodeRed) {
            elements.btnOpenNodeRed.href = target.url;
        }

        refreshIcons();

        window.dispatchEvent(new CustomEvent('tilapia:tab-change', {
            detail: { activeTab: tabId, url: target.url }
        }));
    }

    /**
     * Configuración de eventos para botones de pestañas y tarjetas superiores
     */
    function setupInteractions() {
        // 1. Botones del selector de pestañas
        Object.values(NODERED_CONFIG.tabs).forEach(tab => {
            const btn = document.getElementById(tab.btnId);
            if (btn) {
                btn.addEventListener('click', () => activateSection(tab.id));
            }

            // 2. Hacer clic en una tarjeta superior salta a su gráfico
            const card = document.getElementById(tab.cardId);
            if (card) {
                card.style.cursor = 'pointer';
                card.title = `Ver gráfico de ${tab.label}`;
                card.addEventListener('click', () => activateSection(tab.id));
            }
        });
    }

    /**
     * Inicialización del controlador
     */
    function init() {
        setupInteractions();

        // Render inicial de métricas
        renderTelemetry(state.metrics);

        // Conectar a WebSocket de Node-RED (/ws/boya)
        initWebSocket();

        refreshIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.TilapiaDashboard = {
        activateSection: activateSection,
        renderTelemetry: renderTelemetry,
        handleIncomingTelemetry: handleIncomingTelemetry,
        getState: () => ({ ...state })
    };
})();
