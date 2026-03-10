/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.7.3 - Controller (SILENT MODE)                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";
import { PortHandler } from "/core/port-handler.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const log = new Logger(ns, "CONTROLLER");
    const portHandler = new PortHandler(ns);
    
    const POLL_INTERVAL = CONFIG.CONTROLLER.POLL_INTERVAL_MS;
    const COMMAND_PORT = CONFIG.PORTS.COMMANDS;
    
    log.info(`🎮 Controller démarré (SILENT MODE)`);
    log.info(`📨 Écoute port ${COMMAND_PORT} | Polling: ${POLL_INTERVAL}ms`);
    
    let totalJobsReceived = 0;
    let totalJobsSuccess = 0;
    let totalJobsFailed = 0;
    let lastReport = Date.now();
    
    const failureReasons = new Map();
    
    while (true) {
        try {
            while (!portHandler.isEmpty(COMMAND_PORT)) {
                const job = portHandler.readJSON(COMMAND_PORT);
                
                if (!job) {
                    continue;
                }
                
                totalJobsReceived++;
                
                const { type, target, threads, host, delay, uuid, script } = job;
                
                // ════════════════════════════════════════════════════
                // VÉRIFICATIONS SILENCIEUSES
                // ════════════════════════════════════════════════════
                
                if (!ns.serverExists(host)) {
                    totalJobsFailed++;
                    if (!failureReasons.has(host)) failureReasons.set(host, []);
                    failureReasons.get(host).push(`Host n'existe pas`);
                    continue;
                }
                
                const maxRam = ns.getServerMaxRam(host);
                const usedRam = ns.getServerUsedRam(host);
                const availableRam = maxRam - usedRam;
                const scriptRam = ns.getScriptRam(script, 'home');
                const neededRam = scriptRam * threads;
                
                if (neededRam > availableRam) {
                    totalJobsFailed++;
                    if (!failureReasons.has(host)) failureReasons.set(host, []);
                    failureReasons.get(host).push(`RAM insuffisante (besoin ${neededRam.toFixed(2)}GB)`);
                    continue;
                }
                
                if (!ns.fileExists(script, host)) {
                    const scpResult = await ns.scp(script, host, 'home');
                    
                    if (!scpResult) {
                        totalJobsFailed++;
                        if (!failureReasons.has(host)) failureReasons.set(host, []);
                        failureReasons.get(host).push(`Échec SCP de ${script}`);
                        continue;
                    }
                }
                
                const pid = ns.exec(
                    script,
                    host,
                    threads,
                    target,
                    delay,
                    uuid
                );
                
                if (pid === 0) {
                    totalJobsFailed++;
                    if (!failureReasons.has(host)) failureReasons.set(host, []);
                    failureReasons.get(host).push(`Exec failed (PID=0)`);
                } else {
                    totalJobsSuccess++;
                }
            }
            
            // ════════════════════════════════════════════════════
            // RAPPORT TOUTES LES 30 SECONDES
            // ════════════════════════════════════════════════════
            
            if (Date.now() - lastReport > 30000) {
                ns.clearLog();
                
                ns.print(`╔═══════════════════════════════════════════════════╗`);
                ns.print(`║          CONTROLLER REPORT                        ║`);
                ns.print(`╚═══════════════════════════════════════════════════╝`);
                ns.print(``);
                ns.print(`📊 STATISTIQUES:`);
                ns.print(`   Total jobs: ${totalJobsReceived}`);
                ns.print(`   ✅ Succès: ${totalJobsSuccess} (${totalJobsReceived > 0 ? ((totalJobsSuccess / totalJobsReceived) * 100).toFixed(1) : 0}%)`);
                ns.print(`   ❌ Échecs: ${totalJobsFailed} (${totalJobsReceived > 0 ? ((totalJobsFailed / totalJobsReceived) * 100).toFixed(1) : 0}%)`);
                ns.print(``);
                
                if (failureReasons.size > 0) {
                    ns.print(`🚨 TOP 3 ÉCHECS:`);
                    const sorted = Array.from(failureReasons.entries())
                        .map(([host, reasons]) => ({ host, count: reasons.length }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3);
                    
                    for (const { host, count } of sorted) {
                        ns.print(`   ${host}: ${count} échecs`);
                    }
                    ns.print(``);
                }
                
                lastReport = Date.now();
            }
            
        } catch (error) {
            log.error(`Controller error: ${error.message}`);
        }
        
        await ns.sleep(POLL_INTERVAL);
    }
}