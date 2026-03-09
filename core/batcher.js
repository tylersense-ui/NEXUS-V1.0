/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Batcher SATURATION                ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.6.0
 * @description SATURATION MODE - Utilise TOUTE la RAM
 */

import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";

export class Batcher {
    constructor(ns, network, ramManager, portHandler, capabilities) {
        this.ns = ns;
        this.network = network;
        this.ramMgr = ramManager;
        this.portHandler = portHandler;
        this.caps = capabilities;
        this.log = new Logger(ns, "BATCHER");
    }
    
    dispatchBatch(target, options = {}) {
        try {
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            const maxMoney = this.ns.getServerMaxMoney(target);
            const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) : 0;
            
            // ════════════════════════════════════════════════════
            // MODE 1 : SERVEUR VIDE → GROW SATURATION
            // ════════════════════════════════════════════════════
            
            if (moneyPercent < 0.1) {
                return this.saturateGrow(target);
            }
            
            // ════════════════════════════════════════════════════
            // MODE 2 : SERVEUR PLEIN → HWGW SATURATION
            // ════════════════════════════════════════════════════
            
            return this.saturateHWGW(target);
            
        } catch (error) {
            this.log.error(`Error dispatching batch: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * SATURATION GROW : Utiliser TOUTE la RAM pour grow
     */
    saturateGrow(target) {
        this.log.info(`🌱 SATURATION GROW sur ${target}`);
        
        // Calculer TOUTE la RAM disponible
        const totalRamAvailable = this.ramMgr.getTotalAvailableRam();
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        const maxGrowThreads = Math.floor(totalRamAvailable / growRam);
        
        if (maxGrowThreads === 0) {
            return {
                success: false,
                error: "No RAM for grow"
            };
        }
        
        this.log.info(`   RAM dispo: ${totalRamAvailable.toFixed(2)}GB`);
        this.log.info(`   Grow threads: ${maxGrowThreads}`);
        
        // Allouer TOUT
        const allocation = this.ramMgr.allocateThreads(maxGrowThreads);
        
        if (!allocation.success) {
            return {
                success: false,
                error: "Allocation failed"
            };
        }
        
        const jobs = [];
        
        for (const alloc of allocation.allocations) {
            jobs.push({
                type: 'grow',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: 0,
                uuid: this.generateUUID(),
                script: CONFIG.WORKERS.GROW
            });
        }
        
        // Envoyer
        for (const job of jobs) {
            this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
        }
        
        return {
            success: true,
            mode: 'GROW_SATURATION',
            totalThreads: maxGrowThreads,
            jobsDispatched: jobs.length
        };
    }
    
    /**
     * SATURATION HWGW : Utiliser TOUTE la RAM pour HWGW
     */
    saturateHWGW(target) {
        this.log.info(`💰 SATURATION HWGW sur ${target}`);
        
        // Calculer ratio HWGW optimal
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const hackPercent = CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        
        // Calculer threads pour 1 batch
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
        
        const moneyAfterHack = maxMoney * (1 - hackPercent);
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
        ));
        
        const growSecIncrease = this.ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
        
        // RAM par batch
        const hackRam = this.ns.getScriptRam(CONFIG.WORKERS.HACK);
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        const weakenRam = this.ns.getScriptRam(CONFIG.WORKERS.WEAKEN);
        
        const ramPerBatch = 
            (hackThreads * hackRam) +
            (weakenThreads1 * weakenRam) +
            (growThreads * growRam) +
            (weakenThreads2 * weakenRam);
        
        // Combien de batchs on peut lancer ?
        const totalRamAvailable = this.ramMgr.getTotalAvailableRam();
        const numBatches = Math.floor(totalRamAvailable / ramPerBatch);
        
        if (numBatches === 0) {
            return {
                success: false,
                error: "No RAM for batch"
            };
        }
        
        this.log.info(`   RAM dispo: ${totalRamAvailable.toFixed(2)}GB`);
        this.log.info(`   RAM/batch: ${ramPerBatch.toFixed(2)}GB`);
        this.log.info(`   Batchs: ${numBatches}`);
        this.log.info(`   Total H/W1/G/W2: ${hackThreads * numBatches}/${weakenThreads1 * numBatches}/${growThreads * numBatches}/${weakenThreads2 * numBatches}`);
        
        const jobs = [];
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        
        // Générer N batchs
        for (let i = 0; i < numBatches; i++) {
            const batchDelay = i * (buffer * 4); // Décaler chaque batch
            
            // Hack
            const hackAlloc = this.ramMgr.allocateThreads(hackThreads);
            if (hackAlloc.success) {
                for (const alloc of hackAlloc.allocations) {
                    jobs.push({
                        type: 'hack',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batchDelay,
                        uuid: this.generateUUID(),
                        script: CONFIG.WORKERS.HACK
                    });
                }
            }
            
            // Weaken1
            const w1Alloc = this.ramMgr.allocateThreads(weakenThreads1);
            if (w1Alloc.success) {
                for (const alloc of w1Alloc.allocations) {
                    jobs.push({
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batchDelay + buffer,
                        uuid: this.generateUUID(),
                        script: CONFIG.WORKERS.WEAKEN
                    });
                }
            }
            
            // Grow
            const growAlloc = this.ramMgr.allocateThreads(growThreads);
            if (growAlloc.success) {
                for (const alloc of growAlloc.allocations) {
                    jobs.push({
                        type: 'grow',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batchDelay + (buffer * 2),
                        uuid: this.generateUUID(),
                        script: CONFIG.WORKERS.GROW
                    });
                }
            }
            
            // Weaken2
            const w2Alloc = this.ramMgr.allocateThreads(weakenThreads2);
            if (w2Alloc.success) {
                for (const alloc of w2Alloc.allocations) {
                    jobs.push({
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batchDelay + (buffer * 3),
                        uuid: this.generateUUID(),
                        script: CONFIG.WORKERS.WEAKEN
                    });
                }
            }
        }
        
        // Envoyer
        for (const job of jobs) {
            this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
        }
        
        return {
            success: true,
            mode: 'HWGW_SATURATION',
            batches: numBatches,
            totalThreads: hackThreads + weakenThreads1 + growThreads + weakenThreads2,
            jobsDispatched: jobs.length
        };
    }
    
    generateUUID() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}