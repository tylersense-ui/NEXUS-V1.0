/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Constants                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/constants.js
 * @version     0.5.7
 * @description Configuration MODE SIMPLE (early game)
 */

export const CONFIG = {
    // Version
    VERSION: {
        MAJOR: 0,
        MINOR: 5,
        PATCH: 7,
        TAG: "SIMPLE-MODE",
        FULL: "v0.5.7-SIMPLE-MODE",
        DATE: "2026-03-09"
    },
    
    // Ports NetScript
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
        RESERVED_HOME_RAM: 16,
        MIN_TARGET_MONEY: 10_000,        // ← RÉDUIT pour accepter foodnstuff
        SECURITY_BUFFER: 5,              // ← AUGMENTÉ (plus permissif)
        TIME_BUFFER_MS: 50,              // ← RÉDUIT (batching rapide)
        MAX_TARGET_DIFFICULTY: 50,       // ← RÉDUIT (targets faciles)
        MAX_TARGET_LEVEL: 100            // ← NOUVEAU (filtre niveau max)
    },
    
    // Orchestrator
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        MIN_TARGETS: 1,
        MAX_TARGETS: 2,                  // ← RÉDUIT (focus)
        CYCLE_DELAY_MS: 500             // réduits suite a tes conseils
    },
    
    // Controller
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,
        MAX_RETRIES: 3
    },
    
    // Batcher
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.25,      // ← AUGMENTÉ 5% → 25% (agressif)
        MAX_THREADS_PER_JOB: 50000,      // ← AUGMENTÉ (saturation)
        ENABLE_PREP: false,              // ← DÉSACTIVÉ (hack direct)
        ENABLE_PHASE4: false,            // ← NOUVEAU (désactive sync)
        PREP_WEAKEN_THREADS: 200,
        PREP_GROW_THREADS: 300
    },
    
    // Workers
    WORKERS: {
        HACK: "/workers/hack.js",
        GROW: "/workers/grow.js",
        WEAKEN: "/workers/weaken.js",
        SHARE: "/workers/share.js"
    }
};