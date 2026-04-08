/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.12.4.3 - Controller (JOB SPLIT IN CONTROLLER)   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.12.4.3
 * @location    /core/controller.js (moved from /hack/)
 * @changes     BASE: v0.11.1 (RAM-AWARE)
 *              NEW: Job splitting IN controller (not batcher)
 *              SPLIT: Max 2000 threads per exec() call
 *              GAIN: -80% lag, +20-40% performance
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
    
    log.info(`🎮 Controller v0.12.4.3 démarré (Job Splitting IN Controller)`);
    log.info(`📨 Écoute port ${COMMAND_PORT} | Polling: ${POLL_INTERVAL}ms`);
    
    let totalBatchesReceived = 0;
    let totalJobsDispatched = 0;
    let totalJobsSuccess = 0;
    let totalJobsFailed = 0;
    let totalJobsSkipped = 0;
    let totalJobsSplit = 0; // ✅ NOUVEAU : tracker splits
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
                        totalJobsSplit += jobs.split || 0;
                        
                    } else if (batch.type === 'WEAKEN_BATCH') {
                        const jobs = await processWeakenBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                        totalJobsSplit += jobs.split || 0;
                        
                    } else if (batch.type === 'GROW_PREP_BATCH') {
                        const jobs = await processGrowPrepBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                        totalJobsSplit += jobs.split || 0;
                        
                    } else if (batch.type === 'GROW_BATCH') {
                        const jobs = await processGrowBatch(ns, batch, failureReasons);
                        totalJobsDispatched += jobs.dispatched;
                        totalJobsSuccess += jobs.success;
                        totalJobsFailed += jobs.failed;
                        totalJobsSkipped += jobs.skipped;
                        totalJobsSplit += jobs.split || 0;
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
                ns.print(`║          CONTROLLER REPORT v0.12.4.3              ║`);
                ns.print(`╚═══════════════════════════════════════════════════╝`);
                ns.print(``);
                ns.print(`📊 STATISTIQUES:`);
                ns.print(`   Batches reçus     : ${totalBatchesReceived}`);
                ns.print(`   Jobs dispatchés   : ${totalJobsDispatched}`);
                ns.print(`   Jobs splittés     : ${totalJobsSplit} 🆕`);
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
 * ✅ NOUVEAU v0.12.4.3 : Split large allocations dans controller
 */
function splitAllocation(alloc, maxSize = 2000) {
    if (alloc.threads <= maxSize) {
        return [alloc]; // Pas de split nécessaire
    }
    
    const chunks = [];
    let remaining = alloc.threads;
    
    while (remaining > 0) {
        const size = Math.min(remaining, maxSize);
        chunks.push({
            hostname: alloc.hostname,
            threads: size
        });
        remaining -= size;
    }
    
    return chunks;
}

/**
 * Process HWGW batch avec job splitting
 */
async function processHWGWBatch(ns, batch, failureReasons) {
    const { target, hackAllocations, weaken1Allocations, growAllocations, weaken2Allocations, delays, scripts } = batch;
    
    const MAX_DISPATCH_SIZE = 2000; // ✅ 2k threads max par exec
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let split = 0;
    
    // HACK
    for (const alloc of hackAllocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, scripts.hack, chunks[i].hostname, chunks[i].threads, target, delays.hack + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    // WEAKEN1
    for (const alloc of weaken1Allocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, scripts.weaken, chunks[i].hostname, chunks[i].threads, target, delays.weaken1 + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    // GROW
    for (const alloc of growAllocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, scripts.grow, chunks[i].hostname, chunks[i].threads, target, delays.grow + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    // WEAKEN2
    for (const alloc of weaken2Allocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, scripts.weaken, chunks[i].hostname, chunks[i].threads, target, delays.weaken2 + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    return { dispatched, success, failed, skipped, split };
}

/**
 * Process WEAKEN batch avec job splitting
 */
async function processWeakenBatch(ns, batch, failureReasons) {
    const { target, allocations, script } = batch;
    const MAX_DISPATCH_SIZE = 2000;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let split = 0;
    
    for (const alloc of allocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, script, chunks[i].hostname, chunks[i].threads, target, (batch.delay || 0) + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    return { dispatched, success, failed, skipped, split };
}

/**
 * Process GROW batch avec job splitting
 */
async function processGrowBatch(ns, batch, failureReasons) {
    const { target, allocations, script } = batch;
    const MAX_DISPATCH_SIZE = 2000;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let split = 0;
    
    for (const alloc of allocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, script, chunks[i].hostname, chunks[i].threads, target, (batch.delay || 0) + (i * 10), failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    return { dispatched, success, failed, skipped, split };
}

/**
 * Process GROW_PREP batch avec job splitting
 */
async function processGrowPrepBatch(ns, batch, failureReasons) {
    const { target, growAllocations, weakenAllocations, growScript, weakenScript } = batch;
    const MAX_DISPATCH_SIZE = 2000;
    
    let dispatched = 0;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let split = 0;
    
    for (const alloc of growAllocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, growScript, chunks[i].hostname, chunks[i].threads, target, i * 10, failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    for (const alloc of weakenAllocations || []) {
        const chunks = splitAllocation(alloc, MAX_DISPATCH_SIZE);
        if (chunks.length > 1) split++;
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await execWorkerSafe(ns, weakenScript, chunks[i].hostname, chunks[i].threads, target, i * 10, failureReasons);
            dispatched++;
            if (result === true) success++;
            else if (result === false) failed++;
            else skipped++;
        }
    }
    
    return { dispatched, success, failed, skipped, split };
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
