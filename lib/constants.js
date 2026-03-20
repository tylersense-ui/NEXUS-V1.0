/**
 * VERSION mise à jour
 */
export const CONFIG = {
    VERSION: {
        MAJOR: 0,
        MINOR: 12,
        PATCH: 0,
        TAG: "FORTRESS",
        FULL: "v0.12.0-FORTRESS",
        DATE: "2026-03-20"
    },
    
    // ... (reste identique à v0.10.1)
    
    SYSTEM: {
        DEBUG_MODE: false,
        LOG_LEVEL: "INFO"
    },
    
    RAM: {
        RESERVED_HOME_RAM: 64,
        MIN_FREE_RAM_FOR_DEPLOY: 8,
        WORKER_SCRIPT_RAM: {
            HACK: 1.7,
            GROW: 1.75,
            WEAKEN: 1.75
        }
    },
    
    HACKING: {
        MIN_TARGET_MONEY: 50000000,
        PREP_MONEY_THRESHOLD: 0.95,
        PREP_SECURITY_MARGIN: 5,
        TIME_BUFFER_MS: 20, // ← AJOUTÉ pour v0.12
        
        TOOL_FILES: {
            BRUTESSH: 'BruteSSH.exe',
            FTPCRACK: 'FTPCrack.exe',
            RELAYSMTP: 'relaySMTP.exe',
            HTTPWORM: 'HTTPWorm.exe',
            SQLINJECT: 'SQLInject.exe'
        }
    },
    
    SERVERS: {
        MAX_PURCHASED: 25,
        BASE_PREFIX: 'nexus-',
        MAX_RAM_PER_SERVER: 1048576,
        UPGRADE_INTERVAL_MS: 30000,
        MIN_MONEY_FOR_PURCHASE: 100000000
    },
    
    PORTS: {
        COMMANDS: 1,
        RESULTS: 2,
        TELEMETRY: 3
    },
    
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,
        MAX_RETRIES: 3
    },
    
    WORKERS: {
        HACK: '/workers/hack.js',
        GROW: '/workers/grow.js',
        WEAKEN: '/workers/weaken.js'
    },
    
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        MIN_TARGETS: 1,
        AUTO_SCALE_TARGETS: true,
        CYCLE_DELAY_MS: 200
    },
    
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.05, // ← RÉDUIT à 5% pour stabilité
        MAX_THREADS_PER_JOB: 50000,
        USE_FORMULAS: true,
        ESTIMATED_RAM_PER_BATCH_GB: 30
    },
    
    STOCK: {
        FORECAST_BUY_THRESHOLD: 0.55,
        FORECAST_SELL_THRESHOLD: 0.48,
        VOLATILITY_MAX: 0.05,
        POSITION_SIZE_MIN: 0.05,
        POSITION_SIZE_MAX: 0.15,
        STOP_LOSS_PERCENT: -0.15,
        TAKE_PROFIT_PERCENT: 0.40,
        MAX_POSITIONS: 15,
        CHECK_INTERVAL_MS: 6000
    }
};