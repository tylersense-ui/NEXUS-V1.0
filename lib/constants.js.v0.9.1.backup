/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.1 - Constants (CALCULS DYNAMIQUES)             ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

export const CONFIG = {
    VERSION: {
        MAJOR: 0,
        MINOR: 9,
        PATCH: 1,
        TAG: "DYNAMIC",
        FULL: "v0.9.1-DYNAMIC",
        DATE: "2026-03-10"
    },
    
    PORTS: {
        NETWORK_MAP: 1,
        TARGET_QUEUE: 2,
        LOG_STREAM: 3,
        COMMANDS: 4,
        METRICS: 5,
        CONFIG_UPDATE: 6
    },
    
    SYSTEM: {
        DEBUG_MODE: false,
        LOG_LEVEL: "INFO"
    },
    
    HACKING: {
        // ✅ DYNAMIQUE : 5% de home RAM (8GB → 0.4GB | 131TB → 6.5TB)
        RESERVED_HOME_RAM_PERCENT: 0.05,
        MIN_RESERVED_HOME_RAM: 16,  // Minimum 16GB
        
        MIN_TARGET_MONEY: 50_000_000,
        SECURITY_BUFFER: 5,
        TIME_BUFFER_MS: 20,
        MAX_TARGET_DIFFICULTY: 100
    },
    
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        
        // ✅ DYNAMIQUE : Calculé selon RAM disponible
        // MIN = toujours au moins 1 cible
        // MAX = calculé dans orchestrator
        MIN_TARGETS: 1,
        AUTO_SCALE_TARGETS: true,  // Active le calcul auto
        
        CYCLE_DELAY_MS: 200
    },
    
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,
        MAX_RETRIES: 3
    },
    
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.10,
        MAX_THREADS_PER_JOB: 50000,
        ENABLE_PREP: false,
        ENABLE_PHASE4: false,
        PREP_WEAKEN_THREADS: 200,
        PREP_GROW_THREADS: 300,
        USE_FORMULAS: true,
        
        // Estimation RAM par batch (pour calcul auto-targets)
        ESTIMATED_RAM_PER_BATCH_GB: 30  // Ajustable
    },
    
    WORKERS: {
        HACK: "/workers/hack.js",
        GROW: "/workers/grow.js",
        WEAKEN: "/workers/weaken.js",
        SHARE: "/workers/share.js"
    },
    
    STOCK: {
        // ✅ ÉQUILIBRE PARFAIT
        FORECAST_BUY_THRESHOLD: 0.55,   // Acheter si forecast > 55%
        FORECAST_SELL_THRESHOLD: 0.48,  // Vendre si forecast < 48%
        
        VOLATILITY_MAX: 0.05,           // Éviter si volatilité > 5%
        
        POSITION_SIZE_MIN: 0.05,        // 5% du cash minimum
        POSITION_SIZE_MAX: 0.15,        // 15% du cash maximum
        
        STOP_LOSS_PERCENT: -0.15,       // Vendre si -15%
        TAKE_PROFIT_PERCENT: 0.40,      // Vendre si +40%
        
        MAX_POSITIONS: 15,              // Maximum 15 stocks simultanés
        CHECK_INTERVAL_MS: 6000         // Check toutes les 6s
    }
};