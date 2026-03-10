/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.8.0 - Batcher (FORMULAS INTEGRATED)              ║
 * ╚═══════════════════════════════════════════════════════════╝
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
        this.hasFormulas = ns.fileExists("Formulas.exe");
    }
    
    /**
     * Calculer un batch HWGW optimal (INTÉGRÉ)
     */
    calculateHWGW(target, hackPercent = 0.10) {
        if (!this.hasFormulas) {
            return this.calculateHWGWFallback(target, hackPercent);
        }
        
        const server = this.ns.getServer(target);
        const player = this.ns.getPlayer();
        
        server.hackDifficulty = server.minDifficulty;
        server.moneyAvailable = server.moneyMax;
        
        // THREADS HACK
        const hackPercentPerThread = this.ns.formulas.hacking.hackPercent(server, player);
        const hackThreads = Math.max(1, Math.floor(hackPercent / hackPercentPerThread));
        
        // THREADS WEAKEN1
        const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
        
        // THREADS GROW
        const moneyAfterHack = server.moneyMax * (1 - hackPercent);
        const growMultiplier = server.moneyMax / Math.max(1, moneyAfterHack);
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, growMultiplier)
        ));
        
        // THREADS WEAKEN2
        const growSecIncrease = this.ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
        
        // TIMINGS PRÉCIS
        const hackTime = this.ns.formulas.hacking.hackTime(server, player);
        const growTime = this.ns.formulas.hacking.growTime(server, player);
        const weakenTime = this.ns.formulas.hacking.weakenTime(server, player);
        
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        const endTime = Date.now() + weakenTime + (buffer * 4);
        
        const hackDelay = Math.max(0, endTime - Date.now() - hackTime - (buffer * 3));
        const weaken1Delay = Math.max(0, endTime - Date.now() - weakenTime - (buffer * 2));
        const growDelay = Math.max(0, endTime - Date.now() - growTime - buffer);
        const weaken2Delay = 0;
        
        return {
            hackThreads,
            weakenThreads1,
            growThreads,
            weakenThreads2,
            hackDelay,
            weaken1Delay,
            growDelay,
            weaken2Delay,
            hackTime,
            growTime,
            weakenTime,
            totalTime: weakenTime + (buffer * 4),
            hackChance: this.ns.formulas.hacking.hackChance(server, player)
        };
    }
    
    /**
     * Fallback sans Formulas
     */
    calculateHWGWFallback(target, hackPercent) {
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const weakenThreads1 = Math.ceil(hackSec / 0.05);
        
        const moneyAfterHack = maxMoney * (1 - hackPercent);
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
        ));
        
        const growSec = this.ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads2 = Math.ceil(growSec / 0.05);
        
        const hackTime = this.ns.getHackTime(target);
        const growTime = this.ns.getGrowTime(target);
        const weakenTime = this.ns.getWeakenTime(target);
        
        return {
            hackThreads,
            weakenThreads1,
            growThreads,
            weakenThreads2,
            hackDelay: 0,
            weaken1Delay: 50,
            growDelay: 100,
            weaken2Delay: 150,
            hackTime,
            growTime,
            weakenTime,
            totalTime: weakenTime + 200,
            hackChance: this.ns.hackAnalyzeChance(target)
        };
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
            
            return this.dispatchHWGWFormulas(target);
            
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
    
    dispatchHWGWFormulas(target) {
        const batch = this.calculateHWGW(target, CONFIG.BATCHER.DEFAULT_HACK_PERCENT);
        
        let jobsSent = 0;
        let totalAllocated = 0;
        
        // HACK
        if (batch.hackThreads > 0) {
            const hAlloc = this.ramMgr.allocateThreads(batch.hackThreads);
            if (hAlloc.allocations.length > 0) {
                for (const alloc of hAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'hack',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batch.hackDelay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.HACK
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // WEAKEN1
        if (batch.weakenThreads1 > 0) {
            const w1Alloc = this.ramMgr.allocateThreads(batch.weakenThreads1);
            if (w1Alloc.allocations.length > 0) {
                for (const alloc of w1Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batch.weaken1Delay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // GROW
        if (batch.growThreads > 0) {
            const gAlloc = this.ramMgr.allocateThreads(batch.growThreads);
            if (gAlloc.allocations.length > 0) {
                for (const alloc of gAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'grow',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batch.growDelay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.GROW
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        // WEAKEN2
        if (batch.weakenThreads2 > 0) {
            const w2Alloc = this.ramMgr.allocateThreads(batch.weakenThreads2);
            if (w2Alloc.allocations.length > 0) {
                for (const alloc of w2Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: batch.weaken2Delay,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        const mode = this.hasFormulas ? 'HWGW-F(10%)' : 'HWGW(10%)';
        const chanceStr = batch.hackChance ? ` | Chance: ${(batch.hackChance * 100).toFixed(1)}%` : '';
        
        this.log.info(`💰 ${mode}: ${totalAllocated} threads${chanceStr}`);
        
        return {
            success: true,
            mode: 'HWGW_FORMULAS',
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent,
            batch: batch
        };
    }
}