/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.1 - Controller (RAM-AWARE)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.11.1
 * @changes     Vérifie RAM AVANT exec + Adaptive threading
 */

import { CONFIG } from "/lib/constants.js";
import { FileLogger } from "/lib/file-logger.js";
import { PortHandler } from "/core/port-handler.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const log = new FileLogger(ns, "CONTROLLER", CONFIG.SYSTEM.LOG_LEVEL);
    const portHandler = new PortHandler(ns);
    
    const POLL_INTERVAL = CONFIG.CONTROLLER.POLL_INTERVAL_MS;
    const COMMAND_PORT = CONFIG.PORTS.COMMANDS;
    
    log.info(`🎮 Controller v0.11.1 démarré (RAM-AWARE)`);
    log.info(`📨 Écoute port ${COMMAND_PORT} | Polling: ${POLL_INTERVAL}ms`);
    
    let totalBatchesReceived = 0;
    let totalJobsDispatched = 0;
    let totalJobsSuccess = 0;
    let totalJobsFailed = 0;
    let totalJobsSkipped = 0;
    let lastReport = Date.now();
    
    const failureReasons = new Map();
    
    while (true) {
        try {
            // ════════════════════════════════════════════════════
            // TRAITER BATCHES
            // ════════════════════════════════════════════════════
            
            while (!portHandler.isEmpty(COMMAND_PORT)) {
                const batch = portHandler.readJSON(COMMAND_PORT);
                
                if (!batch) continue;
                
                totalBatchesReceived++;
                
                // Dispatch selon type
                try {
                    if (batch.type === 'HWGW_BATCH') {
                        const jobs = await processHWGWBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                        
                    } else if (batch.type === 'WEAKEN_BATCH') {
                        const jobs = await processWeakenBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                        
                    } else if (batch.type === 'GROW_PREP_BATCH') {
                        const jobs = await processGrowPrepBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                    }
                } catch (error) {
                    log.error(`Error processing batch: ${error.message}`);
                    totalJobsFailed++;
                }
                
                // Small delay entre batches
                await ns.sleep(5);
            }
            
            // ════════════════════════════════════════════════════
            // RAPPORT
            // ════════════════════════════════════════════════════
            
            if (Date.now() - lastReport > 30000) {
                ns.clearLog();
                
                ns.print(`╔═══════════════════════════════════════════════════╗`);
                ns.print(`║          CONTROLLER REPORT v0.11.1                ║`);
                ns.print(`╚═══════════════════════════════════════════════════╝`);
                ns.print(``);
                ns.print(`📊 STATISTIQUES:`);
                ns.print(`   Batches reçus     : ${totalBatchesReceived}`);
                ns.print(`   Jobs dispatchés   : ${totalJobsDispatched}`);
                ns.print(`   ✅ Succès  : ${totalJobsSuccess} (${totalJobsDispatched > 0 ? ((totalJobsSuccess / totalJobsDispatched) * 100).toFixed(1) : 0}%)`);
                ns.print(`   ❌ Échecs  : ${totalJobsFailed}`);
                ns.print(`   ⏭️  Skipped: ${totalJobsSkipped}`);
                ns.print(``);
                
                // Top 3 raisons d'échec
                if (failureReasons.size > 0) {
                    ns.print(`🔴 TOP 3 ÉCHECS:`);
                    const sorted = Array.from(failureReasons.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3);
                    
                    for (const [reason, count] of sorted) {
                        ns.print(`   ${reason}: ${count}`);
                    }
                    ns.print(``);
                }
                
                lastReport = Date.now();
            }
            
        } catch (error) {
            log.error(`Controller loop error: ${error.message}`);
        }
        
        await ns.sleep(POLL_INTERVAL);
    }
}

// ════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════

function trackFailure(reasons, reason) {
    reasons.set(reason, (reasons.get(reason) || 0) + 1);
}

/**
 * Process HWGW batch
 */
async function processHWGWBatch(ns, batch, failureReasons) {
    const { target, hackAllocations, weaken1Allocations, growAllocations, weaken2Allocations, delays, scripts } = batch;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    
    // HACK
    for (const alloc of hackAllocations || []) {
        const result = await execWorkerSafe(ns, scripts.hack, alloc.hostname, alloc.threads, target, delays.hack, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    // WEAKEN1
    for (const alloc of weaken1Allocations || []) {
        const result = await execWorkerSafe(ns, scripts.weaken, alloc.hostname, alloc.threads, target, delays.weaken1, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    // GROW
    for (const alloc of growAllocations || []) {
        const result = await execWorkerSafe(ns, scripts.grow, alloc.hostname, alloc.threads, target, delays.grow, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    // WEAKEN2
    for (const alloc of weaken2Allocations || []) {
        const result = await execWorkerSafe(ns, scripts.weaken, alloc.hostname, alloc.threads, target, delays.weaken2, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    return { dispatched, success, failed, skipped };
}

/**
 * Process WEAKEN batch
 */
async function processWeakenBatch(ns, batch, failureReasons) {
    const { target, allocations, script } = batch;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const alloc of allocations || []) {
        const result = await execWorkerSafe(ns, script, alloc.hostname, alloc.threads, target, 0, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    return { dispatched, success, failed, skipped };
}

/**
 * Process GROW_PREP batch
 */
async function processGrowPrepBatch(ns, batch, failureReasons) {
    const { target, growAllocations, weakenAllocations, growScript, weakenScript } = batch;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const alloc of growAllocations || []) {
        const result = await execWorkerSafe(ns, growScript, alloc.hostname, alloc.threads, target, 0, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    for (const alloc of weakenAllocations || []) {
        const result = await execWorkerSafe(ns, weakenScript, alloc.hostname, alloc.threads, target, 0, failureReasons);
        dispatched++;
        if (result === true) success++;
        else if (result === false) failed++;
        else skipped++;
    }
    
    return { dispatched, success, failed, skipped };
}

/**
 * Execute worker avec vérification RAM
 * @returns {boolean|null} true=success, false=failed, null=skipped
 */
async function execWorkerSafe(ns, script, host, threads, target, delay, failureReasons) {
    try {
        // Vérifier RAM AVANT exec
        const scriptRam = ns.getScriptRam(script, 'home');
        const neededRam = scriptRam * threads;
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        const availableRam = maxRam - usedRam;
        
        // Si pas assez de RAM, skip
        if (neededRam > availableRam) {
            // Essayer avec moins de threads
            const maxThreads = Math.floor(availableRam / scriptRam);
            
            if (maxThreads < 1) {
                trackFailure(failureReasons, "RAM_EXHAUSTED");
                return null; // Skip
            }
            
            // Réduire threads
            threads = maxThreads;
            trackFailure(failureReasons, "RAM_REDUCED");
        }
        
        // Vérifier existence du script
        if (!ns.fileExists(script, host)) {
            const scpResult = await ns.scp(script, host, 'home');
            if (!scpResult) {
                trackFailure(failureReasons, "SCP_FAILED");
                return false;
            }
        }
        
        // Exec
        const uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const pid = ns.exec(script, host, threads, target, delay, uuid);
        
        if (pid === 0) {
            trackFailure(failureReasons, "EXEC_FAILED");
            return false;
        }
        
        return true;
        
    } catch (error) {
        trackFailure(failureReasons, `ERROR_${error.message.substr(0, 20)}`);
        return false;
    }
}