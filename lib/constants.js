/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Constants                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/constants.js
 * @version     0.5.4
 * @description Configuration centralisée du système NEXUS
 */

export const CONFIG = {
    // Version
    VERSION: {
        MAJOR: 0,
        MINOR: 5,
        PATCH: 4,
        TAG: "PROMETHEUS-PHASE4",
        FULL: "v0.5.4-PROMETHEUS-PHASE4",
        DATE: "2026-03-09"
    },
    
    // Ports NetScript (communication inter-modules)
    PORTS: {
        NETWORK_MAP: 1,
        TARGET_QUEUE: 2,
        LOG_STREAM: 3,
        COMMANDS: 4,
        METRICS: 5,
        CONFIG_UPDATE: 6
    },
    
    // Système
    SYSTEM: {
        DEBUG_MODE: false,
        LOG_LEVEL: "INFO"
    },
    
    // Hacking
    HACKING: {
        RESERVED_HOME_RAM: 16,       // ← AUGMENTÉ 8 → 16GB
        MIN_TARGET_MONEY: 1_000_000,
        SECURITY_BUFFER: 2,
        TIME_BUFFER_MS: 200,
        MAX_TARGET_DIFFICULTY: 100
    },
    
    // Orchestrator
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        MIN_TARGETS: 1,
        MAX_TARGETS: 5,
        CYCLE_DELAY_MS: 5000
    },
    
    // Controller
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,
        MAX_RETRIES: 3
    },
    
    // Batcher
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.05,
        MAX_THREADS_PER_JOB: 5000,
        ENABLE_PREP: true,
        PREP_WEAKEN_THREADS: 50,
        PREP_GROW_THREADS: 100
    },
    
    // Workers
    WORKERS: {
        HACK: "/workers/hack.js",
        GROW: "/workers/grow.js",
        WEAKEN: "/workers/weaken.js",
        SHARE: "/workers/share.js"
    }
};