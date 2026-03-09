/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Constants                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/constants.js
 * @version     0.5.0
 * @description Configuration centralisée du système NEXUS
 */

export const CONFIG = {
    // Version
    VERSION: {
        MAJOR: 0,
        MINOR: 5,
        PATCH: 0,
        TAG: "PROMETHEUS",
        FULL: "v0.5.0-PROMETHEUS",
        DATE: "2026-03-08"
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
        RESERVED_HOME_RAM: 8,
        MIN_TARGET_MONEY: 1_000_000,
        SECURITY_BUFFER: 2,
        TIME_BUFFER_MS: 100,
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
        DEFAULT_HACK_PERCENT: 0.1,
        MAX_THREADS_PER_JOB: 5000,
        ENABLE_PREP: false
    },
    
    // Workers
    WORKERS: {
        HACK: "/workers/hack.js",
        GROW: "/workers/grow.js",
        WEAKEN: "/workers/weaken.js",
        SHARE: "/workers/share.js"
    }
};