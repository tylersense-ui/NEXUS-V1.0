/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.0 - Batcher (FIXED)                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.11.0
 * @changes     BASE: v0.9.1 (math fix, pipelineDepth)
 *              NEW: Envoie BATCH MESSAGES au lieu de jobs individuels
 *              FIX: PORT OVERFLOW (division trafic par 4)
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
        
        this.log.info("Batcher v0.11.0 initialisé (hasFormulas: " + this.hasFormulas + ")");
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
        
        // ✅ NOUVEAU v0.11.0 : Envoyer UN batch complet au lieu de jobs individuels
        this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
            type: 'WEAKEN_BATCH',
            target: target,
            allocations: allocation.allocations,
            script: CONFIG.WORKERS.WEAKEN,
            uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        
        this.log.info(`🔧 WEAKEN: ${allocation.allocated} threads | Sec: ${currentSec.toFixed(1)}/${minSec.toFixed(1)}`);
        
        return {
            success: true,
            mode: 'WEAKEN',
            totalThreads: allocation.allocated,
            jobsDispatched: 1  // ← v0.11.0: 1 batch au lieu de N jobs
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
        
        let totalAllocated = 0;
        
        const gAlloc = this.ramMgr.allocateThreads(growThreads);
        totalAllocated += gAlloc.allocated;
        
        const wAlloc = weakenThreads > 0 ? this.ramMgr.allocateThreads(weakenThreads) : { allocated: 0, allocations: [] };
        totalAllocated += wAlloc.allocated;
        
        // ✅ NOUVEAU v0.11.0 : Envoyer UN batch complet
        this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
            type: 'GROW_PREP_BATCH',
            target: target,
            growAllocations: gAlloc.allocations,
            weakenAllocations: wAlloc.allocations,
            growScript: CONFIG.WORKERS.GROW,
            weakenScript: CONFIG.WORKERS.WEAKEN,
            uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const moneyPercent = (currentMoney / maxMoney) * 100;
        
        this.log.info(`🌱 GROW+WEAKEN: ${totalAllocated} threads | Money: ${moneyPercent.toFixed(1)}%`);
        
        return {
            success: true,
            mode: 'GROW_PREP',
            totalThreads: totalAllocated,
            jobsDispatched: 1  // ← v0.11.0: 1 batch au lieu de N jobs
        };
    }
    
    /**
     * HWGW avec FIX MATHÉMATIQUE du growMultiplier (v0.9.1)
     * + BATCH MESSAGES (v0.11.0)
     */
    dispatchHWGW(target) {
        const hackPercent = CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        this.log.debug(`━━━ dispatchHWGW(${target}) ━━━`);
        this.log.debug(`  maxMoney: $${this.ns.formatNumber(maxMoney)}`);
        this.log.debug(`  hackPercent: ${(hackPercent*100).toFixed(1)}%`);
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS avec FIX PIPELINE (v0.11.0)
        // ════════════════════════════════════════════════════
        
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const w1Threads = Math.max(0, Math.ceil(hackSec / 0.05));
        
        // ✅ FIX MATHÉMATIQUE v0.11.0 : Calculer le pipelineDepth
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
        // ALLOCATIONS (v0.11.0)
        // ════════════════════════════════════════════════════
        
        const hAlloc = this.ramMgr.allocateThreads(hackThreads);
        const w1Alloc = w1Threads > 0 ? this.ramMgr.allocateThreads(w1Threads) : { allocated: 0, allocations: [] };
        const gAlloc = this.ramMgr.allocateThreads(growThreads);
        const w2Alloc = w2Threads > 0 ? this.ramMgr.allocateThreads(w2Threads) : { allocated: 0, allocations: [] };
        
        const totalAllocated = hAlloc.allocated + w1Alloc.allocated + gAlloc.allocated + w2Alloc.allocated;
        
        // ════════════════════════════════════════════════════
        // DISPATCH (v0.11.0: BATCH MESSAGE au lieu de jobs individuels)
        // ════════════════════════════════════════════════════
        
        // ✅ NOUVEAU v0.11.0 : UN SEUL message avec toutes les allocations
        this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, {
            type: 'HWGW_BATCH',
            target: target,
            hackAllocations: hAlloc.allocations,
            weaken1Allocations: w1Alloc.allocations,
            growAllocations: gAlloc.allocations,
            weaken2Allocations: w2Alloc.allocations,
            delays: {
                hack: hackDelay,
                weaken1: weaken1Delay,
                grow: growDelay,
                weaken2: weaken2Delay
            },
            scripts: {
                hack: CONFIG.WORKERS.HACK,
                weaken: CONFIG.WORKERS.WEAKEN,
                grow: CONFIG.WORKERS.GROW
            },
            uuid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        
        const mode = `HWGW(${(hackPercent*100).toFixed(1)}%, d=${pipelineDepth})`;
        this.log.info(`💰 ${mode}: H:${hackThreads} W1:${w1Threads} G:${growThreads} W2:${w2Threads} = ${totalAllocated} threads`);
        
        return {
            success: true,
            mode: mode,
            totalThreads: totalAllocated,
            jobsDispatched: 1,  // ← v0.11.0: 1 batch au lieu de 4 jobs
            pipelineDepth: pipelineDepth
        };
    }
}