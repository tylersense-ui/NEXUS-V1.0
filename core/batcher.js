/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.7.4 - Batcher (ROLLBACK - WORKING VERSION)       ║
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
        
        this.log.info(`🔧 WEAKEN: ${allocation.allocated}/${weakenThreads} threads (${jobsSent} jobs) | Sec: ${currentSec.toFixed(1)}/${minSec.toFixed(1)}`);
        
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
        
        this.log.info(`🌱 GROW+WEAKEN: ${totalAllocated} threads (${jobsSent} jobs) | Money: ${moneyPercent.toFixed(1)}%`);
        
        return {
            success: true,
            mode: 'GROW_PREP',
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent
        };
    }
    
    dispatchHWGW(target) {
        const maxMoney = this.ns.getServerMaxMoney(target);
        const hackPercent = 0.05;
        
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const w1Threads = Math.max(0, Math.ceil(hackSec / 0.05));
        
        const moneyAfterHack = maxMoney * (1 - hackPercent);
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
        ));
        
        const growSec = this.ns.growthAnalyzeSecurity(growThreads, target);
        const w2Threads = Math.max(0, Math.ceil(growSec / 0.05));
        
        let jobsSent = 0;
        let totalAllocated = 0;
        
        if (hackThreads > 0) {
            const hAlloc = this.ramMgr.allocateThreads(hackThreads);
            if (hAlloc.allocations.length > 0) {
                for (const alloc of hAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'hack',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 0,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.HACK
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        if (w1Threads > 0) {
            const w1Alloc = this.ramMgr.allocateThreads(w1Threads);
            if (w1Alloc.allocations.length > 0) {
                for (const alloc of w1Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 50,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        if (growThreads > 0) {
            const gAlloc = this.ramMgr.allocateThreads(growThreads);
            if (gAlloc.allocations.length > 0) {
                for (const alloc of gAlloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'grow',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 100,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.GROW
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        if (w2Threads > 0) {
            const w2Alloc = this.ramMgr.allocateThreads(w2Threads);
            if (w2Alloc.allocations.length > 0) {
                for (const alloc of w2Alloc.allocations) {
                    this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
                        type: 'weaken',
                        target: target,
                        threads: alloc.threads,
                        host: alloc.hostname,
                        delay: 150,
                        uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        script: CONFIG.WORKERS.WEAKEN
                    });
                    jobsSent++;
                    totalAllocated += alloc.threads;
                }
            }
        }
        
        this.log.info(`💰 HWGW(5%): ${totalAllocated} threads (${jobsSent} jobs)`);
        
        return {
            success: true,
            mode: 'HWGW',
            totalThreads: totalAllocated,
            jobsDispatched: jobsSent
        };
    }
}