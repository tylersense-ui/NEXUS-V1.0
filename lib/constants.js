/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.10.1 - Constants (HOTFIX RESERVED_HOME_RAM)      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * HOTFIX CRITIQUE :
 * - RESERVED_HOME_RAM_PERCENT (5%) → RESERVED_HOME_RAM (64GB FIXE)
 * - Évite crash après HARD RESET (home = 32GB)
 * 
 * VERSION: 0.10.1-HOTFIX
 */

export const CONFIG = {
    // ════════════════════════════════════════════════════
    // RAM MANAGEMENT - HOTFIX v0.10.1
    // ════════════════════════════════════════════════════
    
    RAM: {
        // ✅ RETOUR À CONSTANTE FIXE (était 0.05 = 5%)
        // Raison : Après HARD RESET BN1→BN2, home = 32GB
        // 5% de 32GB = 1.6GB → CRASH boot.js !
        RESERVED_HOME_RAM: 64,  // GB (fixe, sécuritaire)
        
        MIN_FREE_RAM_FOR_DEPLOY: 8,
        WORKER_SCRIPT_RAM: {
            HACK: 1.7,
            GROW: 1.75,
            WEAKEN: 1.75
        }
    },
    
    // ════════════════════════════════════════════════════
    // HACKING
    // ════════════════════════════════════════════════════
    
    HACKING: {
        MIN_TARGET_MONEY: 50000000,
        PREP_MONEY_THRESHOLD: 0.95,
        PREP_SECURITY_MARGIN: 5,
        
        TOOL_FILES: {
            BRUTESSH: 'BruteSSH.exe',
            FTPCRACK: 'FTPCrack.exe',
            RELAYSMTP: 'relaySMTP.exe',
            HTTPWORM: 'HTTPWorm.exe',
            SQLINJECT: 'SQLInject.exe'
        }
    },
    
    // ════════════════════════════════════════════════════
    // SERVERS
    // ════════════════════════════════════════════════════
    
    SERVERS: {
        MAX_PURCHASED: 25,
        BASE_PREFIX: 'nexus-',
        MAX_RAM_PER_SERVER: 1048576,  // 1PB
        UPGRADE_INTERVAL_MS: 30000,
        MIN_MONEY_FOR_PURCHASE: 100000000
    },
    
    // ════════════════════════════════════════════════════
    // PORTS
    // ════════════════════════════════════════════════════
    
    PORTS: {
        COMMANDS: 1,
        RESULTS: 2,
        TELEMETRY: 3
    },
    
    // ════════════════════════════════════════════════════
    // WORKERS
    // ════════════════════════════════════════════════════
    
    WORKERS: {
        HACK: '/workers/hack.js',
        GROW: '/workers/grow.js',
        WEAKEN: '/workers/weaken.js',
        POLL_INTERVAL_MS: 50
    },
    
    // ════════════════════════════════════════════════════
    // ORCHESTRATOR
    // ════════════════════════════════════════════════════
    
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        
        // ✅ DYNAMIQUE : Calculé selon RAM
        MIN_TARGETS: 1,
        AUTO_SCALE_TARGETS: true,
        
        CYCLE_DELAY_MS: 200
    },
    
    // ════════════════════════════════════════════════════
    // BATCHER
    // ════════════════════════════════════════════════════
    
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.10,
        MAX_THREADS_PER_JOB: 50000,
        USE_FORMULAS: true,
        
        // Pour calcul auto-targets
        ESTIMATED_RAM_PER_BATCH_GB: 30
    },
    
    // ════════════════════════════════════════════════════
    // STOCK MARKET
    // ════════════════════════════════════════════════════
    
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
