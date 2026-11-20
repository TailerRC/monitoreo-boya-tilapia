/**
 * ============================================================================
 * Boya IoT Monitoreo Tilapia - Application Controller
 * Controlador frontend ligero para renderizado de métricas y eventos
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. Umbrales y Rangos Biológicos Óptimos para Tilapias (Oreochromis niloticus)
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
            optimalMin: 50.0,
            optimalMax: 80.0,
            cautionMin: 40.0,
            cautionMax: 90.0,
            unit: '%'
        }
    };

    // 2. Estado Global de la Interfaz
    const state = {
        connected: true,
        lastSyncTimestamp: new Date(),
        activeTab: 'water',
        timeframe: '1h',
        simulationActive: true,
        simulationIntervalId: null,
        metrics: {
            water_temp: 28.4,
            ph: 7.42,
            ambient_hum: 68.0
        }
    };

    // 3. Referencias DOM
    const elements = {
        // Cabecera y Conectividad
        connectionPill: document.getElementById('connection-pill'),
        connectionText: document.getElementById('connection-text'),
        lastSyncText: document.getElementById('last-sync-text'),

        // Métricas de Telemetría
        valTemp: document.getElementById('val-temp'),
        badgeTemp: document.getElementById('badge-temp'),
        valPh: document.getElementById('val-ph'),
        badgePh: document.getElementById('badge-ph'),
        valHum: document.getElementById('val-humidity'),
        badgeHum: document.getElementById('badge-humidity'),

        // Gráficos y Pestañas
        tabWater: document.getElementById('tab-water'),
        tabAmbient: document.getElementById('tab-ambient'),
        slotWater: document.getElementById('slot-water'),
        slotAmbient: document.getElementById('slot-ambient'),
        timeframeButtons: document.querySelectorAll('.timeframe-btn')
    };

    /**
     * Evalúa una lectura de sensor contra los umbrales biológicos acuícolas
     * @param {string} key - Clave del parámetro (water_temp, ph, ambient_hum)
     * @param {number} value - Valor medido
     * @returns {{ status: 'optimal'|'caution'|'critical', label: string, badgeClass: string }}
     */
    function evaluateAquacultureRange(key, value) {
        const threshold = AQUACULTURE_THRESHOLDS[key];
        if (!threshold || value === null || isNaN(value)) {
            return {
                status: 'unknown',
                label: 'Sin datos',
                badgeClass: 'badge-secondary'
            };
        }

        if (value >= threshold.optimalMin && value <= threshold.optimalMax) {
            return {
                status: 'optimal',
                label: 'Óptimo',
                badgeClass: 'badge-success'
            };
        } else if (value >= threshold.cautionMin && value <= threshold.cautionMax) {
            return {
                status: 'caution',
                label: 'Precaución',
                badgeClass: 'badge-warning'
            };
        } else {
            return {
                status: 'critical',
                label: 'Crítico',
                badgeClass: 'badge-danger'
            };
        }
    }

    /**
     * Actualiza el badge visual de una tarjeta con texto e icono correspondiente
     */
    function updateBadge(badgeElement, evaluation) {
        if (!badgeElement) return;

        // Limpiar clases de estado previas
        badgeElement.className = `badge ${evaluation.badgeClass}`;

        let iconName = 'check-circle-2';
        if (evaluation.status === 'caution') iconName = 'alert-triangle';
        if (evaluation.status === 'critical') iconName = 'alert-octagon';
        if (evaluation.status === 'unknown') iconName = 'help-circle';

        badgeElement.innerHTML = `
            <i data-lucide="${iconName}" class="badge-icon"></i>
            <span class="badge-text">${evaluation.label}</span>
        `;
    }

    /**
     * Inicializa o refresca los iconos Lucide en el documento
     */
    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    /**
     * Actualiza el estado de conectividad en la barra superior
     */
    function renderConnectivity(connected) {
        if (!elements.connectionPill || !elements.connectionText) return;

        if (connected) {
            elements.connectionPill.className = 'status-pill status-online';
            elements.connectionText.textContent = 'En línea';
        } else {
            elements.connectionPill.className = 'status-pill status-offline';
            elements.connectionText.textContent = 'Desconectado';
        }
    }

    /**
     * Actualiza la estampa de tiempo transcurrido desde la última sincronización
     */
    function updateSyncTimeDisplay() {
        if (!elements.lastSyncText || !state.lastSyncTimestamp) return;

        const diffSeconds = Math.max(0, Math.floor((new Date() - state.lastSyncTimestamp) / 1000));
        if (diffSeconds < 5) {
            elements.lastSyncText.textContent = 'Sincronizado hace un momento';
        } else if (diffSeconds < 60) {
            elements.lastSyncText.textContent = `Sincronizado hace ${diffSeconds}s`;
        } else {
            const minutes = Math.floor(diffSeconds / 60);
            elements.lastSyncText.textContent = `Sincronizado hace ${minutes}m`;
        }
    }

    /**
     * Renderiza las métricas en las tarjetas de la interfaz
     * @param {Object} metrics - Objeto con water_temp, ph, ambient_hum
     */
    function renderTelemetry(metrics) {
        if (!metrics) return;

        // 1. Temperatura
        if (elements.valTemp) {
            elements.valTemp.textContent = Number(metrics.water_temp).toFixed(1);
            const evalTemp = evaluateAquacultureRange('water_temp', metrics.water_temp);
            updateBadge(elements.badgeTemp, evalTemp);
        }

        // 2. pH
        if (elements.valPh) {
            elements.valPh.textContent = Number(metrics.ph).toFixed(2);
            const evalPh = evaluateAquacultureRange('ph', metrics.ph);
            updateBadge(elements.badgePh, evalPh);
        }

        // 3. Humedad
        if (elements.valHum) {
            elements.valHum.textContent = Math.round(metrics.ambient_hum);
            const evalHum = evaluateAquacultureRange('ambient_hum', metrics.ambient_hum);
            updateBadge(elements.badgeHum, evalHum);
        }

        state.lastSyncTimestamp = new Date();
        updateSyncTimeDisplay();
        refreshIcons();

        // Disparar evento global desacoplado para cualquier consumidor
        window.dispatchEvent(new CustomEvent('tilapia:telemetry-update', {
            detail: {
                timestamp: state.lastSyncTimestamp.toISOString(),
                metrics: metrics,
                connected: state.connected
            }
        }));
    }

    /**
     * Gestión del cambio de pestañas de gráficos ('water' vs 'ambient')
     */
    function setupTabs() {
        const tabs = [
            { btn: elements.tabWater, slot: elements.slotWater, id: 'water' },
            { btn: elements.tabAmbient, slot: elements.slotAmbient, id: 'ambient' }
        ];

        tabs.forEach(({ btn, slot, id }) => {
            if (!btn || !slot) return;

            btn.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.btn.classList.remove('active');
                    t.btn.setAttribute('aria-selected', 'false');
                    t.slot.classList.remove('active');
                });

                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                slot.classList.add('active');
                state.activeTab = id;

                refreshIcons();

                window.dispatchEvent(new CustomEvent('tilapia:tab-change', {
                    detail: { activeTab: id }
                }));
            });
        });
    }

    /**
     * Gestión de botones de rango de tiempo ('1h', '6h', '24h')
     */
    function setupTimeframeControls() {
        if (!elements.timeframeButtons) return;

        elements.timeframeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.timeframeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const range = btn.getAttribute('data-range') || '1h';
                state.timeframe = range;

                window.dispatchEvent(new CustomEvent('tilapia:timeframe-change', {
                    detail: {
                        slotId: state.activeTab,
                        timeframe: range
                    }
                }));
            });
        });
    }

    /**
     * Temporizador de simulación local (intervalo de 5 segundos)
     * Produce leves oscilaciones realistas de calidad de agua y ambiente
     */
    function runSimulationStep() {
        if (!state.simulationActive) return;

        // Variaciones realistas pequeñas
        const deltaTemp = (Math.random() - 0.5) * 0.2; // +/- 0.1 °C
        const deltaPh = (Math.random() - 0.5) * 0.08;  // +/- 0.04 pH
        const deltaHum = (Math.random() - 0.5) * 1.0;  // +/- 0.5 %

        state.metrics.water_temp = Math.max(25.0, Math.min(31.0, state.metrics.water_temp + deltaTemp));
        state.metrics.ph = Math.max(6.2, Math.min(8.8, state.metrics.ph + deltaPh));
        state.metrics.ambient_hum = Math.max(45.0, Math.min(85.0, state.metrics.ambient_hum + deltaHum));

        renderTelemetry(state.metrics);
    }

    function startSimulation() {
        if (state.simulationIntervalId) clearInterval(state.simulationIntervalId);
        state.simulationActive = true;
        state.simulationIntervalId = setInterval(runSimulationStep, 5000);
    }

    function stopSimulation() {
        state.simulationActive = false;
        if (state.simulationIntervalId) {
            clearInterval(state.simulationIntervalId);
            state.simulationIntervalId = null;
        }
    }

    /**
     * Inicialización del controlador
     */
    function init() {
        // 1. Configurar eventos de interacción
        setupTabs();
        setupTimeframeControls();

        // 2. Render inicial con datos representativos
        renderConnectivity(state.connected);
        renderTelemetry(state.metrics);

        // 3. Iniciar temporizador de simulación dinámica cada 5s
        startSimulation();

        // 4. Actualizar estampa de tiempo cada segundo
        setInterval(updateSyncTimeDisplay, 1000);

        // 5. Render inicial de iconos
        refreshIcons();
    }

    // Ejecutar al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer API pública en window para pruebas, consola o integración MQTT externa
    window.TilapiaDashboard = {
        renderTelemetry: renderTelemetry,
        evaluateRange: evaluateAquacultureRange,
        startSimulation: startSimulation,
        stopSimulation: stopSimulation,
        getState: () => ({ ...state }),
        setConnectionStatus: (connected) => {
            state.connected = Boolean(connected);
            renderConnectivity(state.connected);
        }
    };
})();
