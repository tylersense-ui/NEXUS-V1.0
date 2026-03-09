/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.6-PROMETHEUS - Batcher STABLE                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.6.1
 * @description STABLE MODE - 1 batch optimal par cycle
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
        
        // Tracking des derniers batchs
        this.lastBatchTime = new Map(); // target → timestamp
    }
    
    dispatchBatch(target, options = {}) {
        try {
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            const maxMoney = this.ns.getServerMaxMoney(target);
            const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) : 0;
            
            // ════════════════════════════════════════════════════
            // COOLDOWN : Éviter de spammer le même target
            // ════════════════════════════════════════════════════
            
            const now = Date.now();
            const lastTime = this.lastBatchTime.get(target) || 0;
            const timeSinceLastBatch = now - lastTime;
            const hackTime = this.ns.getHackTime(target);
            
            // Attendre au moins 50% du hackTime avant nouveau batch
            if (timeSinceLastBatch < hackTime * 0.5) {
                return {
                    success: false,
                    error: "Batch cooldown"
                };
            }
            
            // ════════════════════════════════════════════════════
            // MODE SELECTION
            // ════════════════════════════════════════════════════
            
            if (moneyPercent < 0.5) {
                return this.dispatchGrowBatch(target);
            }
            
            return this.dispatchHWGWBatch(target);
            
        } catch (error) {
            this.log.error(`Error dispatching batch: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * GROW BATCH : 1 méga batch de grow
     */
    dispatchGrowBatch(target) {
        // Calculer RAM MAINTENANT (pas 5 secondes avant)
        const totalRam = this.ramMgr.getTotalAvailableRam();
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        
        // Utiliser 80% de la RAM (pas 100% pour éviter race condition)
        const safeRam = totalRam * 0.8;
        const growThreads = Math.floor(safeRam / growRam);
        
        if (growThreads === 0) {
            return {
                success: false,
                error: "No RAM for grow"
            };
        }
        
        this.log.info(`🌱 GROW BATCH sur ${target}`);
        this.log.info(`   RAM: ${totalRam.toFixed(2)}GB (safe: ${safeRam.toFixed(2)}GB)`);
        this.log.info(`   Threads: ${growThreads}`);
        
        // Allouer
        const allocation = this.ramMgr.allocateThreads(growThreads);
        
        if (!allocation.success) {
            this.log.warn(`   Allocation échouée (${allocation.allocated}/${growThreads})`);
            return {
                success: false,
                error: "Allocation failed"
            };
        }
        
        // Générer jobs
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
        
        this.lastBatchTime.set(target, Date.now());
        
        return {
            success: true,
            mode: 'GROW',
            totalThreads: growThreads,
            jobsDispatched: jobs.length
        };
    }
    
    /**
     * HWGW BATCH : 1 méga batch HWGW optimal
     */
    dispatchHWGWBatch(target) {
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const hackPercent = CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        
        // Calculer threads pour 1 batch parfait
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
        
        // RAM nécessaire pour 1 batch
        const hackRam = this.ns.getScriptRam(CONFIG.WORKERS.HACK);
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        const weakenRam = this.ns.getScriptRam(CONFIG.WORKERS.WEAKEN);
        
        const ramPerBatch = 
            (hackThreads * hackRam) +
            (weakenThreads1 * weakenRam) +
            (growThreads * growRam) +
            (weakenThreads2 * weakenRam);
        
        // Calculer combien de fois on peut multiplier ce batch
        const totalRam = this.ramMgr.getTotalAvailableRam();
        const safeRam = totalRam * 0.8; // 80% pour sécurité
        
        const multiplier = Math.floor(safeRam / ramPerBatch);
        
        if (multiplier === 0) {
            return {
                success: false,
                error: "Not enough RAM for 1 batch"
            };
        }
        
        this.log.info(`💰 HWGW BATCH sur ${target}`);
        this.log.info(`   RAM: ${totalRam.toFixed(2)}GB (safe: ${safeRam.toFixed(2)}GB)`);
        this.log.info(`   RAM/batch: ${ramPerBatch.toFixed(2)}GB`);
        this.log.info(`   Multiplier: x${multiplier}`);
        this.log.info(`   H/W1/G/W2: ${hackThreads}/${weakenThreads1}/${growThreads}/${weakenThreads2}`);
        this.log.info(`   Total threads: ${(hackThreads + weakenThreads1 + growThreads + weakenThreads2) * multiplier}`);
        
        // Allouer TOUT d'un coup (atomique)
        const totalHack = hackThreads * multiplier;
        const totalW1 = weakenThreads1 * multiplier;
        const totalGrow = growThreads * multiplier;
        const totalW2 = weakenThreads2 * multiplier;
        
        const jobs = [];
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        
        // Allouer HACK
        const hackAlloc = this.ramMgr.allocateThreads(totalHack);
        if (!hackAlloc.success) {
            this.log.warn(`   Hack allocation failed (${hackAlloc.allocated}/${totalHack})`);
            return { success: false, error: "Hack allocation failed" };
        }
        
        for (const alloc of hackAlloc.allocations) {
            jobs.push({
                type: 'hack',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: 0,
                uuid: this.generateUUID(),
                script: CONFIG.WORKERS.HACK
            });
        }
        
        // Allouer WEAKEN1
        const w1Alloc = this.ramMgr.allocateThreads(totalW1);
        if (!w1Alloc.success) {
            this.log.warn(`   W1 allocation failed (${w1Alloc.allocated}/${totalW1})`);
            return { success: false, error: "W1 allocation failed" };
        }
        
        for (const alloc of w1Alloc.allocations) {
            jobs.push({
                type: 'weaken',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: buffer,
                uuid: this.generateUUID(),
                script: CONFIG.WORKERS.WEAKEN
            });
        }
        
        // Allouer GROW
        const growAlloc = this.ramMgr.allocateThreads(totalGrow);
        if (!growAlloc.success) {
            this.log.warn(`   Grow allocation failed (${growAlloc.allocated}/${totalGrow})`);
            return { success: false, error: "Grow allocation failed" };
        }
        
        for (const alloc of growAlloc.allocations) {
            jobs.push({
                type: 'grow',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: buffer * 2,
                uuid: this.generateUUID(),
                script: CONFIG.WORKERS.GROW
            });
        }
        
        // Allouer WEAKEN2
        const w2Alloc = this.ramMgr.allocateThreads(totalW2);
        if (!w2Alloc.success) {
            this.log.warn(`   W2 allocation failed (${w2Alloc.allocated}/${totalW2})`);
            return { success: false, error: "W2 allocation failed" };
        }
        
        for (const alloc of w2Alloc.allocations) {
            jobs.push({
                type: 'weaken',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: buffer * 3,
                uuid: this.generateUUID(),
                script: CONFIG.WORKERS.WEAKEN
            });
        }
        
        // Envoyer TOUS les jobs
        for (const job of jobs) {
            this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
        }
        
        this.lastBatchTime.set(target, Date.now());
        
        return {
            success: true,
            mode: 'HWGW',
            multiplier: multiplier,
            totalThreads: totalHack + totalW1 + totalGrow + totalW2,
            jobsDispatched: jobs.length
        };
    }
    
    generateUUID() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}