/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Batcher Phase 4                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.5.3
 * @description Génération jobs HWGW synchronisés (Phase 4)
 */

import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";
import { TimingCalculator } from "/lib/timing.js";

export class Batcher {
    constructor(ns, network, ramManager, portHandler, capabilities) {
        this.ns = ns;
        this.network = network;
        this.ramMgr = ramManager;
        this.portHandler = portHandler;
        this.caps = capabilities;
        this.log = new Logger(ns, "BATCHER");
        this.timing = new TimingCalculator(ns);
        
        // Tracking des derniers batchs par target
        this.lastBatchTimes = new Map();
    }
    
    /**
     * Dispatch un batch HWGW synchronisé
     */
    dispatchBatch(target, options = {}) {
        const hackPercent = options.hackPercent || CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        const maxThreads = options.maxThreadsPerJob || CONFIG.BATCHER.MAX_THREADS_PER_JOB;
        
        try {
            // ═══════════════════════════════════════════════════════
            // PHASE 1 : PREP (si nécessaire)
            // ═══════════════════════════════════════════════════════
            
            if (CONFIG.BATCHER.ENABLE_PREP && !this.isServerReady(target)) {
                return this.prepServer(target);
            }
            
            // ═══════════════════════════════════════════════════════
            // PHASE 2 : VÉRIFIER SI ON PEUT LANCER UN BATCH
            // ═══════════════════════════════════════════════════════
            
            const lastBatchTime = this.lastBatchTimes.get(target);
            
            if (!this.timing.canLaunchBatch(target, lastBatchTime)) {
                return {
                    success: false,
                    error: "Batch cooldown (waiting for previous batch)"
                };
            }
            
            // ═══════════════════════════════════════════════════════
            // PHASE 3 : CALCULER THREADS & TIMINGS
            // ═══════════════════════════════════════════════════════
            
            const threads = this.calculateThreads(target, hackPercent);
            
            if (!threads) {
                return {
                    success: false,
                    error: "Cannot calculate threads"
                };
            }
            
            const timings = this.timing.calculateBatchTimings(target);
            
            // ═══════════════════════════════════════════════════════
            // PHASE 4 : GÉNÉRER JOBS SYNCHRONISÉS
            // ═══════════════════════════════════════════════════════
            
            const jobs = this.generateSynchronizedJobs(target, threads, timings, maxThreads);
            
            if (jobs.length === 0) {
                return {
                    success: false,
                    error: "No jobs generated"
                };
            }
            
            // ═══════════════════════════════════════════════════════
            // PHASE 5 : ENVOYER DANS PORT 4
            // ═══════════════════════════════════════════════════════
            
            for (const job of jobs) {
                this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
            }
            
            // Tracker le temps de ce batch
            this.lastBatchTimes.set(target, Date.now());
            
            return {
                success: true,
                totalThreads: threads.total,
                jobsDispatched: jobs.length,
                batchDuration: timings.totalDuration
            };
            
        } catch (error) {
            this.log.error(`Error dispatching batch: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Prep un serveur (weaken + grow jusqu'à ready)
     */
    prepServer(target) {
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        const jobs = [];
        
        // Besoin de weaken ?
        if (currentSec > minSec + CONFIG.HACKING.SECURITY_BUFFER) {
            const weakenThreads = CONFIG.BATCHER.PREP_WEAKEN_THREADS;
            const allocation = this.ramMgr.allocateThreads(weakenThreads);
            
            if (allocation.success) {
                for (const alloc of allocation.allocations) {
                    jobs.push({
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 0,
                        uuid: this.generateUUID(),
                        script: CONFIG.WORKERS.WEAKEN
                    });
                }
            }
        }
        
        // Besoin de grow ?
        if (currentMoney < maxMoney * 0.9) {
            const growThreads = CONFIG.BATCHER.PREP_GROW_THREADS;
            const allocation = this.ramMgr.allocateThreads(growThreads);
            
            if (allocation.success) {
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
            }
        }
        
        // Envoyer les jobs de prep
        for (const job of jobs) {
            this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
        }
        
        return {
            success: true,
            prep: true,
            jobsDispatched: jobs.length,
            totalThreads: jobs.reduce((sum, j) => sum + j.threads, 0)
        };
    }
    
    /**
     * Vérifie si serveur est prêt
     */
    isServerReady(target) {
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        
        const moneyReady = currentMoney > maxMoney * 0.9;
        const securityReady = currentSec < minSec + CONFIG.HACKING.SECURITY_BUFFER;
        
        return moneyReady && securityReady;
    }
    
    /**
     * Calcule threads nécessaires
     */
    calculateThreads(target, hackPercent) {
        try {
            const maxMoney = this.ns.getServerMaxMoney(target);
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            
            const hackThreads = Math.max(1, Math.floor(
                this.ns.hackAnalyzeThreads(target, currentMoney * hackPercent)
            ));
            
            const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, target);
            const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
            
            const moneyAfterHack = currentMoney * (1 - hackPercent);
            const growThreads = Math.max(1, Math.ceil(
                this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
            ));
            
            const growSecIncrease = this.ns.growthAnalyzeSecurity(growThreads, target);
            const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
            
            return {
                hack: hackThreads,
                weaken1: weakenThreads1,
                grow: growThreads,
                weaken2: weakenThreads2,
                total: hackThreads + weakenThreads1 + growThreads + weakenThreads2
            };
            
        } catch (error) {
            this.log.error(`Error calculating threads: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Génère jobs avec timings synchronisés (Phase 4)
     */
    generateSynchronizedJobs(target, threads, timings, maxThreadsPerJob) {
        const jobs = [];
        
        // Job types avec delays calculés pour synchronisation
        const jobTypes = [
            { 
                action: 'hack', 
                threads: threads.hack, 
                delay: timings.hackDelay,
                script: CONFIG.WORKERS.HACK
            },
            { 
                action: 'weaken', 
                threads: threads.weaken1, 
                delay: timings.weakenDelay1,
                script: CONFIG.WORKERS.WEAKEN
            },
            { 
                action: 'grow', 
                threads: threads.grow, 
                delay: timings.growDelay,
                script: CONFIG.WORKERS.GROW
            },
            { 
                action: 'weaken', 
                threads: threads.weaken2, 
                delay: timings.weakenDelay2,
                script: CONFIG.WORKERS.WEAKEN
            }
        ];
        
        for (const jobType of jobTypes) {
            if (jobType.threads === 0) continue;
            
            const allocation = this.ramMgr.allocateThreads(
                Math.min(jobType.threads, maxThreadsPerJob)
            );
            
            if (!allocation.success) {
                this.log.warn(`Not enough RAM for ${jobType.action}`);
                continue;
            }
            
            for (const alloc of allocation.allocations) {
                const uuid = this.generateUUID();
                
                jobs.push({
                    type: jobType.action,
                    target: target,
                    threads: alloc.threads,
                    host: alloc.hostname,
                    delay: jobType.delay,
                    uuid: uuid,
                    script: jobType.script
                });
            }
        }
        
        return jobs;
    }
    
    generateUUID() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}