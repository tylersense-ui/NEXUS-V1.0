/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.12.1 - Worker Manager (LIFETIME ONLY)            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.12.1
 * @changes     SEULEMENT lifetime (pas threads count)
 *              Les gros threads sont NORMAUX en late-game
 */

import { CONFIG } from "/lib/constants.js";
import { FileLogger } from "/lib/file-logger.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const log = new FileLogger(ns, "WORKER-MGR", CONFIG.SYSTEM.LOG_LEVEL);
    
    const CHECK_INTERVAL_MS = 30000;  // Check toutes les 30s
    const MAX_WORKER_LIFETIME_MS = 600000;  // ✅ AUGMENTÉ à 10 minutes (était 5)
    
    log.info('🧹 Worker Manager v0.12.1 démarré');
    log.info(`⏱️  Check interval: ${CHECK_INTERVAL_MS/1000}s`);
    log.info(`⚰️  Max lifetime: ${MAX_WORKER_LIFETIME_MS/1000}s`);
    
    let totalCleaned = 0;
    let lastReport = Date.now();
    
    while (true) {
        try {
            const servers = getAllServers(ns);
            let cleanedThisCycle = 0;
            
            for (const server of servers) {
                const processes = ns.ps(server);
                const now = Date.now();
                
                for (const proc of processes) {
                    // Skip non-workers
                    if (!proc.filename.startsWith('workers/')) continue;
                    
                    const lifetime = now - proc.onlineRunningTime;
                    
                    // ✅ FIX : Kill SEULEMENT si trop vieux
                    // PAS de vérification threads (599k threads est NORMAL !)
                    if (lifetime > MAX_WORKER_LIFETIME_MS) {
                        ns.kill(proc.pid);
                        cleanedThisCycle++;
                        totalCleaned++;
                        
                        log.info(`🧹 Killed zombie: ${proc.filename} (${ns.formatNumber(proc.threads)}t, ${(lifetime/1000).toFixed(0)}s) on ${server}`);
                    }
                }
            }
            
            // Report toutes les 5 minutes
            if (Date.now() - lastReport > 300000) {
                ns.clearLog();
                
                ns.print(`╔═══════════════════════════════════════════════════╗`);
                ns.print(`║          WORKER MANAGER REPORT v0.12.1            ║`);
                ns.print(`╚═══════════════════════════════════════════════════╝`);
                ns.print(``);
                ns.print(`🧹 STATISTIQUES:`);
                ns.print(`   Total nettoyés : ${totalCleaned}`);
                ns.print(`   Ce cycle       : ${cleanedThisCycle}`);
                ns.print(``);
                ns.print(`ℹ️  NOTE: Gros threads (599k+) sont NORMAUX`);
                ns.print(`   en late-game avec pipelineDepth élevé`);
                ns.print(``);
                
                lastReport = Date.now();
            }
            
        } catch (error) {
            log.error(`Worker Manager error: ${error.message}`);
        }
        
        await ns.sleep(CHECK_INTERVAL_MS);
    }
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ['home'];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}