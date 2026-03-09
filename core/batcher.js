/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.7.3 - Batcher (FIX multiplier)                   ║
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
            const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) : 0;
            
            // Si moins de 75% d'argent → GROW seulement
            if (moneyPercent < 0.75) {
                return this.dispatchGrow(target);
            }
            
            // Sinon → HWGW
            return this.dispatchHWGW(target);
            
        } catch (error) {
            this.log.error(`Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    
    dispatchGrow(target) {
        const totalRam = this.ramMgr.getTotalAvailableRam();
        const growRam = this.ns.getScriptRam(CONFIG.WORKERS.GROW);
        const growThreads = Math.floor(totalRam / growRam);
        
        if (growThreads === 0) {
            return { success: false, error: "No RAM" };
        }
        
        const allocation = this.ramMgr.allocateThreads(growThreads);
        
        if (allocation.allocations.length === 0) {
            return { success: false, error: "No allocations" };
        }
        
        let jobsSent = 0;
        
        for (const alloc of allocation.allocations) {
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
        }
        
        this.log.info(`🌱 GROW: ${allocation.allocated}/${growThreads} threads (${jobsSent} jobs)`);
        
        return {
            success: true,
            mode: 'GROW',
            totalThreads: allocation.allocated,
            jobsDispatched: jobsSent
        };
    }
    
    dispatchHWGW(target) {
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        // ════════════════════════════════════════════════════
        // FIX : Réduire hackPercent à 5% au lieu de 25%
        // ════════════════════════════════════════════════════
        
        const hackPercent = 0.05;  // ← 5% seulement !
        
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
        
        // ════════════════════════════════════════════════════
        // FIX : NE PAS UTILISER DE MULTIPLIER !
        // ════════════════════════════════════════════════════
        
        // On lance juste 1 batch, c'est tout !
        // Le cycle va se répéter toutes les 500ms de toute façon
        
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
                        delay: 0,
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
                        delay: 50,
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
                        delay: 100,
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