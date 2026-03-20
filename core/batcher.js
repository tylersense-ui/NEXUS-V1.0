/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.1 - Batcher (MATH FIX)                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.9.1-MATH-FIX
 * @changes     FIX growMultiplier avec pipelineDepth
 *              Compense TOUS les hacks en vol dans le pipeline
 *              growMultiplier = 1/(1-h)^d au lieu de 1/(1-h)
 */

import { CONFIG } from "/lib/constants.js";
import { FileLogger } from "/lib/file-logger.js";

export class Batcher {
    constructor(ns, network, ramManager, portHandler, capabilities) {
        this.ns = ns;
        this.network = network;
        this.ramMgr = ramManager;
        this.portHandler = portHandler;
        this.caps = capabilities;
        this.log = new FileLogger(ns, "BATCHER", CONFIG.SYSTEM.LOG_LEVEL);
        
        // Détection Formulas (optionnel)
        this.hasFormulas = ns.fileExists("Formulas.exe");
        
        this.log.info("Batcher initialisé (hasFormulas: " + this.hasFormulas + ")");
    }
    
    dispatchBatch(target, options = {}) {
        try {
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            const maxMoney = this.ns.getServerMaxMoney(target);
            const currentSec = this.ns.getServerSecurityLevel(target);
            const minSec = this.ns.getServerMinSecurityLevel(target);
            
            const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) : 0;
            const secDiff = currentSec - minSec;
            
            const secReady = secDiff <= 5;
            const moneyReady = moneyPercent >= 0.95;
            
            if (!secReady) {
                return this.dispatchWeaken(target);
            }
            
            if (!moneyReady) {
                return this.dispatchGrowPrep(target);
            }
            
            return this.dispatchHWGW(target);
            
        } catch (error) {
            this.log.error(`Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    
    dispatchWeaken(target) {
        const totalRam = this.ramMgr.getTotalAvailableRam();
        const weakenRam = this.ns.getScriptRam(CONFIG.WORKERS.WEAKEN);
        const weakenThreads = Math.floor(totalRam / weakenRam);
        
        if (weakenThreads === 0) {
            return { success: false, error: "No RAM" };
        }
        
        const allocation = this.ramMgr.allocateThreads(weakenThreads);
        
        if (allocation.allocations.length === 0) {
            return { success: false, error: "No allocations" };
        }
        
        let jobsSent = 0;
        
        for (const alloc of allocation.allocations) {
            this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                type: 'weaken',
                target: target,
                threads: alloc.threads,
                host: alloc.hostname,
                delay: 0,
                uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                script: CONFIG.WORKERS.WEAKEN
            });
            jobsSent++;
        }
        
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        
        this.log.info(`🔧 WEAKEN: ${allocation.allocated} threads | Sec: ${currentSec.toFixed(1)}/${minSec.toFixed(1)}`);
        
        return {
            success: true,
            mode: 'WEAKEN',
            totalThreads: allocation.allocated,
            jobsDispatched: jobsSent
        };
    }
    
    dispatchGrowPrep(target) {
        const totalRam = this.ramMgr.getTotalAvailableRam();
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        const weakenRam = this.ns.getScriptRam(CONFIG.WORKERS.WEAKEN);
        
        const growBudget = totalRam * 0.85;
        const weakenBudget = totalRam * 0.15;
        
        const growThreads = Math.floor(growBudget / growRam);
        const weakenThreads = Math.floor(weakenBudget / weakenRam);
        
        if (growThreads === 0) {
            return { success: false, error: "No RAM for grow" };
        }
        
        let jobsSent = 0;
        let totalAllocated = 0;
        
        const gAlloc = this.ramMgr.allocateThreads(growThreads);
        if (gAlloc.allocations.length > 0) {
            for (const alloc of gAlloc.allocations) {
                this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                    type: 'grow',
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
        
        if (weakenThreads > 0) {
            const wAlloc = this.ramMgr.allocateThreads(weakenThreads);
            if (wAlloc.allocations.length > 0) {
                for (const alloc of wAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
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
        
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const moneyPercent = (currentMoney / maxMoney) * 100;
        
        this.log.info(`🌱 GROW+WEAKEN: ${totalAllocated} threads | Money: ${moneyPercent.toFixed(1)}%`);
        
        return {
            success: true,
            mode: 'GROW_PREP',
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent
        };
    }
    
    /**
     * HWGW avec FIX MATHÉMATIQUE du growMultiplier
     * Compense TOUS les hacks en vol dans le pipeline
     */
    dispatchHWGW(target) {
        const hackPercent = CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        this.log.debug(`━━━ dispatchHWGW(${target}) ━━━`);
        this.log.debug(`  maxMoney: $${this.ns.formatNumber(maxMoney)}`);
        this.log.debug(`  hackPercent: ${(hackPercent*100).toFixed(1)}%`);
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS avec FIX PIPELINE
        // ════════════════════════════════════════════════════
        
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const w1Threads = Math.max(0, Math.ceil(hackSec / 0.05));
        
        // ✅ FIX MATHÉMATIQUE : Calculer le pipelineDepth
        const weakenTime = this.ns.getWeakenTime(target);
        const spacing = 200; // ms entre batches
        const pipelineDepth = Math.floor(weakenTime / spacing);
        
        this.log.debug(`  weakenTime: ${(weakenTime/1000).toFixed(1)}s`);
        this.log.debug(`  spacing: ${spacing}ms`);
        this.log.debug(`  pipelineDepth: ${pipelineDepth} batches`);
        
        // ✅ growMultiplier corrigé : compense TOUS les hacks en vol
        const growMultiplier = 1 / Math.pow(1 - hackPercent, pipelineDepth);
        
        this.log.debug(`  growMultiplier: ${growMultiplier.toExponential(2)}`);
        
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, growMultiplier)
        ));
        
        const growSec = this.ns.growthAnalyzeSecurity(growThreads, target);
        const w2Threads = Math.max(0, Math.ceil(growSec / 0.05));
        
        this.log.debug(`  ━━━ THREADS CALCULÉS ━━━`);
        this.log.debug(`  H:  ${hackThreads}`);
        this.log.debug(`  W1: ${w1Threads}`);
        this.log.debug(`  G:  ${growThreads}`);
        this.log.debug(`  W2: ${w2Threads}`);
        this.log.debug(`  TOTAL: ${hackThreads + w1Threads + growThreads + w2Threads}`);
        
        // ════════════════════════════════════════════════════
        // DELAYS FIXES (pas de Formulas requis)
        // ════════════════════════════════════════════════════
        
        const hackDelay = 0;
        const weaken1Delay = 50;
        const growDelay = 100;
        const weaken2Delay = 150;
        
        // ════════════════════════════════════════════════════
        // DISPATCH
        // ════════════════════════════════════════════════════
        
        let jobsSent = 0;
        let totalAllocated = 0;
        
        // HACK
        if (hackThreads > 0) {
            const hAlloc = this.ramMgr.allocateThreads(hackThreads);
            if (hAlloc.allocations.length > 0) {
                for (const alloc of hAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'hack',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: hackDelay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.HACK
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // WEAKEN1
        if (w1Threads > 0) {
            const w1Alloc = this.ramMgr.allocateThreads(w1Threads);
            if (w1Alloc.allocations.length > 0) {
                for (const alloc of w1Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: weaken1Delay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // GROW
        if (growThreads > 0) {
            const gAlloc = this.ramMgr.allocateThreads(growThreads);
            if (gAlloc.allocations.length > 0) {
                for (const alloc of gAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'grow',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: growDelay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.GROW
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // WEAKEN2
        if (w2Threads > 0) {
            const w2Alloc = this.ramMgr.allocateThreads(w2Threads);
            if (w2Alloc.allocations.length > 0) {
                for (const alloc of w2Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: weaken2Delay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        const mode = `HWGW(${(hackPercent*100).toFixed(1)}%, d=${pipelineDepth})`;
        this.log.info(`💰 ${mode}: H:${hackThreads} W1:${w1Threads} G:${growThreads} W2:${w2Threads} = ${totalAllocated} threads`);
        
        return {
            success: true,
            mode: mode,
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent,
            pipelineDepth: pipelineDepth
        };
    }
}