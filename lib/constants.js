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
        NETWORK_MAP: 1,     // Carte réseau (liste serveurs)
        TARGET_QUEUE: 2,    // File cibles prioritaires
        LOG_STREAM: 3,      // Logs centralisés
        COMMANDS: 4,        // Bus de commandes (CRITIQUE)
        METRICS: 5,         // Métriques système
        CONFIG_UPDATE: 6    // Updates config dynamiques
    },
    
    // Système
    SYSTEM: {
        DEBUG_MODE: false,
        LOG_LEVEL: "INFO"  // DEBUG | INFO | WARN | ERROR
    },
    
    // Hacking
    HACKING: {
        RESERVED_HOME_RAM: 8,        // GB réservé sur home
        MIN_TARGET_MONEY: 1_000_000, // $1M minimum
        SECURITY_BUFFER: 2,          // +2 sécurité tolérée
        TIME_BUFFER_MS: 100,         // 100ms entre H/W/G/W
        MAX_TARGET_DIFFICULTY: 100   // Difficulté max cible
    },
    
    // Orchestrator
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,  // Refresh réseau 60s
        MIN_TARGETS: 1,              // Minimum cibles
        MAX_TARGETS: 5,              // Maximum cibles
        CYCLE_DELAY_MS: 5000         // Pause entre cycles
    },
    
    // Controller
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,        // Polling port 4
        MAX_RETRIES: 3               // Retries par job
    },
    
    // Batcher
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.1,   // 10% par batch
        MAX_THREADS_PER_JOB: 5000,   // Limit threads
        ENABLE_PREP: true            // Prep auto serveurs
    },
    
    // Workers
    WORKERS: {
        HACK: "/workers/hwgw.js",
        GROW: "/workers/hwgw.js",
        WEAKEN: "/workers/hwgw.js",
        SHARE: "/workers/hwgw.js"
    }
};