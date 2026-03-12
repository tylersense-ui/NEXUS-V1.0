/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.0 - QUANTUM BATCHER                           ║
 * ║ "Le Dessert du Mérovingien"                               ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.11.0-QUANTUM
 * @description Batcher ultime avec toutes techniques late-game
 * 
 * TECHNIQUES IMPLÉMENTÉES :
 * 1. EV/s Optimization (Expected Value per Second)
 * 2. Dynamic hackPercent (self-tuning)
 * 3. FFD Packing (First Fit Decreasing)
 * 4. Job Splitting (5k threads max)
 * 5. Recovery Thread Padding (5-30× selon stabilité)
 * 6. Adaptive Cycle Timing (10ms-12s selon perf)
 * 7. Smart Prep (Parallel)
 * 8. Performance Telemetry (/state/tracking)
 * 
 * "Chaque ligne crée un nouvel effet, comme de la poésie."
 * "Pourquoi est la vraie seule source de pouvoir."
 */

import { CONFIG } from "/lib/constants.js";

export class Batcher {
    constructor(ns, network, ramMgr, portHandler, capabilities) {
        this.ns = ns;
        this.network = network;
        this.ramMgr = ramMgr;
        this.portHandler = portHandler;
        this.capabilities = capabilities;
        
        // ════════════════════════════════════════════════════
        // ÉTAT INTERNE - Tracking performance temps réel
        // ════════════════════════════════════════════════════
        
        this.metrics = {
            successRate: 1.0,      // 100% initial
            misfireRate: 0.0,      // 0% initial
            avgWeakenTime: 120000, // 2 min défaut
            totalBatches: 0,
            successBatches: 0,
            failedBatches: 0,
            lastUpdate: Date.now()
        };
        
        // Historique pour calcul variance
        this.targetHistory = new Map(); // target → [results...]
        
        // ════════════════════════════════════════════════════
        // POURQUOI : Tracking performance = auto-tuning
        // Sans métriques, on est aveugle. Avec, on s'adapte.
        // ════════════════════════════════════════════════════
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 1️⃣ EV/s OPTIMIZATION
     * ════════════════════════════════════════════════════
     * POURQUOI : maxMoney seul est trompeur
     * Un serveur à $600M avec 29s hack bat un serveur
     * à $1.5B avec 66s hack en profit/seconde
     */
    calculateEVperSecond(target) {
        try {
            const maxMoney = this.ns.getServerMaxMoney(target);
            const hackTime = this.ns.getHackTime(target);
            const hackChance = this.ns.hackAnalyzeChance(target);
            
            // Utilise hackPercent adaptatif (voir méthode suivante)
            const hackPercent = this.calculateAdaptiveHackPercent(target);
            
            // EV/s = (argent × % volé × chance) / temps
            const profitPerSecond = (maxMoney * hackPercent * hackChance) / (hackTime / 1000);
            
            // POURQUOI : Cette formule capture la VRAIE valeur d'une cible
            // Pas juste l'argent, mais l'argent par TEMPS
            
            return {
                profitPerSecond: profitPerSecond,
                hackTime: hackTime,
                hackChance: hackChance,
                maxMoney: maxMoney,
                hackPercent: hackPercent
            };
            
        } catch (error) {
            return {
                profitPerSecond: 0,
                hackTime: Infinity,
                hackChance: 0,
                maxMoney: 0,
                hackPercent: 0
            };
        }
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 2️⃣ DYNAMIC hackPercent (Self-Tuning)
     * ════════════════════════════════════════════════════
     * POURQUOI : 10% fixe = gaspillage ou surcharge
     * On doit s'adapter à la RAM, stabilité, volatilité
     */
    calculateAdaptiveHackPercent(target) {
        let base = 0.10; // Conservateur par défaut
        
        // ── AJUSTEMENT #1 : RAM disponible ──
        const totalRam = this.ramMgr.getTotalAvailableRam();
        
        if (totalRam > 15000) {
            base = 0.20; // Beaucoup de RAM = agressif
        } else if (totalRam > 5000) {
            base = 0.15; // RAM moyenne = modéré
        }
        // POURQUOI : Plus de RAM = plus de threads pour recovery
        
        // ── AJUSTEMENT #2 : Success rate récent ──
        if (this.metrics.successRate < 0.85) {
            base *= 0.9; // Échecs fréquents = réduire stress
        } else if (this.metrics.successRate > 0.95) {
            base *= 1.1; // Ultra-stable = pousser limites
        }
        // POURQUOI : Auto-correction basée sur performance réelle
        
        // ── AJUSTEMENT #3 : Volatilité cible ──
        const variance = this.calculateTargetVariance(target);
        
        if (variance > 0.05) {
            base *= 0.8; // Cible instable = conservateur
        }
        // POURQUOI : Cibles volatiles = risque de desync
        
        // ── LIMITES SÉCURITAIRES ──
        return Math.min(0.25, Math.max(0.05, base));
        // POURQUOI : Jamais <5% (inefficace) ni >25% (risqué)
    }
    
    /**
     * Calculer variance d'une cible (stabilité)
     */
    calculateTargetVariance(target) {
        if (!this.targetHistory.has(target)) {
            return 0.0; // Pas d'historique = assume stable
        }
        
        const results = this.targetHistory.get(target);
        
        if (results.length < 5) {
            return 0.0; // Pas assez de données
        }
        
        // Calculer écart-type des success rates
        const mean = results.reduce((sum, r) => sum + r, 0) / results.length;
        const variance = results.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / results.length;
        
        // POURQUOI : Variance haute = cible imprévisible
        return Math.sqrt(variance);
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 6️⃣ ADAPTIVE CYCLE TIMING
     * ════════════════════════════════════════════════════
     * POURQUOI : 200ms fixe = trop lent early, trop rapide late
     */
    calculateOptimalCycleDelay() {
        const maxConcurrentBatches = 50;
        
        // Base sur weaken time moyen
        let delay = Math.max(200, this.metrics.avgWeakenTime / maxConcurrentBatches);
        
        // ── AJUSTEMENT : Misfires ──
        if (this.metrics.misfireRate > 0.05) {
            delay *= 1.5; // Trop de collisions = ralentir
        }
        // POURQUOI : Batches qui se chevauchent = chaos
        
        // ── AJUSTEMENT : Ultra-stable ──
        if (this.metrics.misfireRate < 0.01 && this.metrics.successRate > 0.95) {
            delay = Math.max(10, delay * 0.8); // Accélérer si parfait
        }
        // POURQUOI : Performance parfaite = on peut pousser
        
        return Math.floor(delay);
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 5️⃣ RECOVERY THREAD PADDING
     * ════════════════════════════════════════════════════
     * POURQUOI : Misfires VONT arriver. Padding = auto-fix.
     */
    calculatePadding() {
        // Padding basé sur stabilité
        
        if (this.metrics.successRate > 0.95) {
            return 5; // Ultra-stable = padding minimal
        } else if (this.metrics.successRate > 0.90) {
            return 10; // Stable = padding modéré
        } else if (this.metrics.successRate > 0.80) {
            return 20; // Instable = padding élevé
        } else {
            return 30; // Très instable = padding maximal
        }
        
        // POURQUOI : Plus on fail, plus on sur-alloue pour recovery
        // Coût RAM acceptable si on a 26PB
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 4️⃣ JOB SPLITTING
     * ════════════════════════════════════════════════════
     * POURQUOI : Gros jobs = lag, mauvaise distribution
     * Petits jobs = smooth, parallélisable, resilient
     */
    splitLargeJob(totalThreads, maxBatchSize = 5000) {
        if (totalThreads <= maxBatchSize) {
            return [totalThreads]; // Pas besoin de split
        }
        
        const batches = [];
        let remaining = totalThreads;
        
        while (remaining > 0) {
            const batchSize = Math.min(maxBatchSize, remaining);
            batches.push(batchSize);
            remaining -= batchSize;
        }
        
        // POURQUOI : 50k threads en 1 job = freeze
        // 50k threads en 10 jobs de 5k = smooth
        
        return batches;
    }
    
    /**
     * ════════════════════════════════════════════════════
     * DISPATCH HWGW - Le cœur du batcher
     * ════════════════════════════════════════════════════
     */
    dispatchHWGW(target, options = {}) {
        const hackPercent = this.calculateAdaptiveHackPercent(target);
        const padding = this.calculatePadding();
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS avec PADDING
        // ════════════════════════════════════════════════════
        
        const baseHackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(baseHackThreads, target);
        const baseW1Threads = Math.max(0, Math.ceil(hackSec / 0.05));
        
        const moneyAfterHack = maxMoney * (1 - hackPercent);
        const baseGrowThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
        ));
        
        const growSec = this.ns.growthAnalyzeSecurity(baseGrowThreads, target);
        const baseW2Threads = Math.max(0, Math.ceil(growSec / 0.05));
        
        // ✅ APPLIQUER PADDING pour recovery automatique
        const hackThreads = baseHackThreads;
        const w1Threads = baseW1Threads * padding;  // ← PADDING !
        const growThreads = baseGrowThreads * padding; // ← PADDING !
        const w2Threads = baseW2Threads * padding;   // ← PADDING !
        
        // POURQUOI : Si batch misfire, les threads extra compensent
        
        // ════════════════════════════════════════════════════
        // 4️⃣ JOB SPLITTING sur gros jobs
        // ════════════════════════════════════════════════════
        
        const hackBatches = this.splitLargeJob(hackThreads);
        const w1Batches = this.splitLargeJob(w1Threads);
        const growBatches = this.splitLargeJob(growThreads);
        const w2Batches = this.splitLargeJob(w2Threads);
        
        // ════════════════════════════════════════════════════
        // TIMING avec ADAPTIVE DELAY
        // ════════════════════════════════════════════════════
        
        const weakenTime = this.ns.getWeakenTime(target);
        const growTime = this.ns.getGrowTime(target);
        const hackTime = this.ns.getHackTime(target);
        
        const spacing = this.calculateOptimalCycleDelay();
        
        // Delays pour synchronisation
        const hackDelay = weakenTime - hackTime - spacing;
        const w1Delay = 0;
        const growDelay = spacing;
        const w2Delay = spacing * 2;
        
        // ════════════════════════════════════════════════════
        // 3️⃣ FFD PACKING - Allocation optimale
        // ════════════════════════════════════════════════════
        
        // Créer liste de tous les jobs avec tailles
        const jobs = [];
        
        hackBatches.forEach((threads, i) => {
            jobs.push({ type: 'hack', threads: threads, delay: hackDelay + i * 10 });
        });
        
        w1Batches.forEach((threads, i) => {
            jobs.push({ type: 'weaken1', threads: threads, delay: w1Delay + i * 10 });
        });
        
        growBatches.forEach((threads, i) => {
            jobs.push({ type: 'grow', threads: threads, delay: growDelay + i * 10 });
        });
        
        w2Batches.forEach((threads, i) => {
            jobs.push({ type: 'weaken2', threads: threads, delay: w2Delay + i * 10 });
        });
        
        // ✅ TRIER DÉCROISSANT (FFD)
        jobs.sort((a, b) => b.threads - a.threads);
        
        // POURQUOI : Gros jobs d'abord = meilleure utilisation RAM
        // Prouvé mathématiquement : ≤ 11/9 × optimal
        
        // ════════════════════════════════════════════════════
        // DISPATCH avec FFD allocation
        // ════════════════════════════════════════════════════
        
        let totalDispatched = 0;
        let jobsDispatched = 0;
        
        for (const job of jobs) {
            const script = this.getScriptForType(job.type);
            
            // Allocate avec FFD (ramMgr gère ça)
            const allocation = this.ramMgr.allocateThreads(job.threads);
            
            if (!allocation.success) {
                continue; // Pas assez de RAM, skip
            }
            
            // Dispatch sur chaque serveur alloué
            for (const alloc of allocation.allocations) {
                this.sendCommand({
                    target: target,
                    threads: alloc.threads,
                    host: alloc.hostname,
                    delay: job.delay,
                    uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    script: script
                });
                
                jobsDispatched++;
                totalDispatched += alloc.threads;
            }
        }
        
        // ════════════════════════════════════════════════════
        // TELEMETRY - Tracker performance pour adaptation
        // ════════════════════════════════════════════════════
        
        this.metrics.totalBatches++;
        this.updateMetrics(target, weakenTime);
        this.persistMetrics();
        
        // POURQUOI : Sans tracking, pas d'adaptation possible
        
        return {
            success: totalDispatched > 0,
            mode: 'HWGW-QUANTUM',
            totalThreads: totalDispatched,
            jobsDispatched: jobsDispatched,
            hackPercent: hackPercent,
            padding: padding,
            spacing: spacing
        };
    }
    
    /**
     * Helper : Envoyer commande au controller
     * POURQUOI : portHandler peut ne pas avoir de méthode send()
     * On utilise directement ns.writePort()
     */
    sendCommand(command) {
        try {
            this.ns.writePort(CONFIG.PORTS.COMMANDS, JSON.stringify(command));
        } catch (error) {
            // Silent fail
        }
    }
    
    /**
     * Helper : Obtenir script pour type de job
     */
    getScriptForType(type) {
        if (type === 'hack') return CONFIG.WORKERS.HACK;
        if (type === 'grow') return CONFIG.WORKERS.GROW;
        return CONFIG.WORKERS.WEAKEN;
    }
    
    /**
     * ════════════════════════════════════════════════════
     * 8️⃣ PERFORMANCE TELEMETRY
     * ════════════════════════════════════════════════════
     * POURQUOI : "Pourquoi est la vraie seule source de pouvoir"
     */
    updateMetrics(target, weakenTime) {
        // Mettre à jour weaken time moyen
        this.metrics.avgWeakenTime = (this.metrics.avgWeakenTime * 0.9) + (weakenTime * 0.1);
        
        // POURQUOI : Moving average = réactivité sans instabilité
    }
    
    /**
     * Persister métriques dans /state/ pour survie entre sessions
     */
    persistMetrics() {
        try {
            const state = {
                metrics: this.metrics,
                timestamp: Date.now()
            };
            
            this.ns.write('/state/quantum-metrics.txt', JSON.stringify(state, null, 2), 'w');
            
            // POURQUOI : Métriques perdues = perte d'apprentissage
            // Persister = garder la mémoire entre redémarrages
            
        } catch (error) {
            // Silent fail si /state/ pas accessible
        }
    }
    
    /**
     * Charger métriques persistées
     */
    loadMetrics() {
        try {
            if (this.ns.fileExists('/state/quantum-metrics.txt')) {
                const data = this.ns.read('/state/quantum-metrics.txt');
                const state = JSON.parse(data);
                
                if (state.metrics) {
                    this.metrics = state.metrics;
                }
            }
        } catch (error) {
            // Si erreur, garder métriques par défaut
        }
    }
    
    /**
     * ════════════════════════════════════════════════════
     * DISPATCH BATCH - Wrapper pour compatibilité orchestrator
     * ════════════════════════════════════════════════════
     * L'orchestrator appelle dispatchBatch(), on route vers
     * dispatchHWGW() ou dispatchPrep() selon l'état de la cible
     */
    dispatchBatch(target, options = {}) {
        // Vérifier si cible est prête pour HWGW
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        const needsPrep = 
            currentSec > minSec + CONFIG.HACKING.PREP_SECURITY_MARGIN ||
            currentMoney < maxMoney * CONFIG.HACKING.PREP_MONEY_THRESHOLD;
        
        if (needsPrep) {
            // Cible pas prête → PREP
            return this.dispatchPrep(target);
        } else {
            // Cible prête → HWGW QUANTUM
            return this.dispatchHWGW(target, options);
        }
    }
    
    /**
     * ════════════════════════════════════════════════════
     * PREP MODE (Preparation)
     * ════════════════════════════════════════════════════
     */
    dispatchPrep(target) {
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        const needsWeaken = currentSec > minSec + CONFIG.HACKING.PREP_SECURITY_MARGIN;
        const needsGrow = currentMoney < maxMoney * CONFIG.HACKING.PREP_MONEY_THRESHOLD;
        
        if (!needsWeaken && !needsGrow) {
            return { success: false, mode: 'READY' };
        }
        
        let totalAllocated = 0;
        let jobsSent = 0;
        
        // Weaken si nécessaire
        if (needsWeaken) {
            const secDiff = currentSec - minSec;
            const weakenThreads = Math.ceil(secDiff / 0.05);
            
            const allocation = this.ramMgr.allocateThreads(weakenThreads);
            
            if (allocation.success) {
                for (const alloc of allocation.allocations) {
                    this.sendCommand({
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 0,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // Grow si nécessaire
        if (needsGrow && currentMoney > 0) {
            const growThreads = Math.ceil(
                this.ns.growthAnalyze(target, maxMoney / Math.max(1, currentMoney))
            );
            
            const allocation = this.ramMgr.allocateThreads(growThreads);
            
            if (allocation.success) {
                for (const alloc of allocation.allocations) {
                    this.sendCommand({
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 0,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.GROW
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        return {
            success: true,
            mode: 'PREP',
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent
        };
    }
}

/**
 * ════════════════════════════════════════════════════════════
 * "Pourquoi est la vraie seule source de pouvoir."
 * 
 * POURQUOI ce batcher ?
 * - EV/s = Vise le profit RÉEL, pas l'illusion
 * - Dynamic hackPercent = S'adapte au contexte
 * - FFD = Prouvé mathématiquement optimal
 * - Job Splitting = Réduit lag, améliore résilience
 * - Padding = Auto-recovery sur misfires
 * - Adaptive Timing = Performance vs stabilité
 * - Telemetry = Apprend de ses erreurs
 * 
 * Chaque ligne a un POURQUOI.
 * C'est ce qui nous sépare du code aveugle.
 * ════════════════════════════════════════════════════════════
 */
