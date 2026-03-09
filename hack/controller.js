/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Controller DEBUG                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /hack/controller.js
 * @version     0.5.9
 * @description Controller avec MEGA DEBUG
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
    
    log.info(`🎮 Controller démarré (DEBUG MODE)`);
    log.info(`📨 Écoute port ${COMMAND_PORT} | Polling: ${POLL_INTERVAL}ms`);
    
    let totalJobsReceived = 0;
    let totalJobsSuccess = 0;
    let totalJobsFailed = 0;
    let lastReport = Date.now();
    
    const failureReasons = new Map(); // host → [reasons]
    
    while (true) {
        try {
            while (!portHandler.isEmpty(COMMAND_PORT)) {
                const job = portHandler.readJSON(COMMAND_PORT);
                
                if (!job) {
                    log.warn("Job vide ou invalide");
                    continue;
                }
                
                totalJobsReceived++;
                
                const { type, target, threads, host, delay, uuid, script } = job;
                
                // ════════════════════════════════════════════════════
                // DEBUG : AFFICHER LE JOB
                // ════════════════════════════════════════════════════
                
                ns.print(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                ns.print(`📦 JOB #${totalJobsReceived}`);
                ns.print(`   Type: ${type}`);
                ns.print(`   Target: ${target}`);
                ns.print(`   Threads: ${threads}`);
                ns.print(`   Host: ${host}`);
                ns.print(`   Script: ${script}`);
                ns.print(`   UUID: ${uuid}`);
                ns.print(`   Delay: ${delay}ms`);
                
                // ════════════════════════════════════════════════════
                // ÉTAPE 1 : VÉRIFIER HOST EXISTE
                // ════════════════════════════════════════════════════
                
                if (!ns.serverExists(host)) {
                    ns.print(`   ❌ ERREUR: Host '${host}' n'existe pas !`);
                    totalJobsFailed++;
                    continue;
                }
                
                ns.print(`   ✅ Host existe`);
                
                // ════════════════════════════════════════════════════
                // ÉTAPE 2 : VÉRIFIER RAM DISPONIBLE
                // ════════════════════════════════════════════════════
                
                const maxRam = ns.getServerMaxRam(host);
                const usedRam = ns.getServerUsedRam(host);
                const availableRam = maxRam - usedRam;
                const scriptRam = ns.getScriptRam(script, 'home');
                const neededRam = scriptRam * threads;
                
                ns.print(`   📊 RAM:`);
                ns.print(`      Total: ${maxRam.toFixed(2)}GB`);
                ns.print(`      Utilisée: ${usedRam.toFixed(2)}GB`);
                ns.print(`      Disponible: ${availableRam.toFixed(2)}GB`);
                ns.print(`      Besoin: ${neededRam.toFixed(2)}GB (${scriptRam}GB × ${threads})`);
                
                if (neededRam > availableRam) {
                    ns.print(`   ❌ ERREUR: Pas assez de RAM !`);
                    ns.print(`      Manque: ${(neededRam - availableRam).toFixed(2)}GB`);
                    
                    if (!failureReasons.has(host)) failureReasons.set(host, []);
                    failureReasons.get(host).push(`RAM insuffisante (besoin ${neededRam.toFixed(2)}GB)`);
                    
                    totalJobsFailed++;
                    continue;
                }
                
                ns.print(`   ✅ RAM suffisante`);
                
                // ════════════════════════════════════════════════════
                // ÉTAPE 3 : COPIER WORKER
                // ════════════════════════════════════════════════════
                
                if (!ns.fileExists(script, host)) {
                    ns.print(`   📁 Worker absent, copie en cours...`);
                    
                    const scpResult = await ns.scp(script, host, 'home');
                    
                    if (!scpResult) {
                        ns.print(`   ❌ ERREUR: Échec SCP !`);
                        
                        if (!failureReasons.has(host)) failureReasons.set(host, []);
                        failureReasons.get(host).push(`Échec SCP de ${script}`);
                        
                        totalJobsFailed++;
                        continue;
                    }
                    
                    ns.print(`   ✅ Worker copié`);
                } else {
                    ns.print(`   ✅ Worker déjà présent`);
                }
                
                // ════════════════════════════════════════════════════
                // ÉTAPE 4 : EXEC
                // ════════════════════════════════════════════════════
                
                ns.print(`   🚀 Lancement...`);
                
                const pid = ns.exec(
                    script,
                    host,
                    threads,
                    target,
                    delay,
                    uuid
                );
                
                if (pid === 0) {
                    ns.print(`   ❌ ERREUR: Échec exec (PID = 0) !`);
                    
                    if (!failureReasons.has(host)) failureReasons.set(host, []);
                    failureReasons.get(host).push(`Exec failed (PID=0)`);
                    
                    totalJobsFailed++;
                } else {
                    ns.print(`   ✅ SUCCÈS (PID: ${pid})`);
                    totalJobsSuccess++;
                }
                
                ns.print(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                ns.print(``);
            }
            
            // ════════════════════════════════════════════════════
            // RAPPORT TOUTES LES 10 SECONDES
            // ════════════════════════════════════════════════════
            
            if (Date.now() - lastReport > 10000) {
                ns.print(`╔═══════════════════════════════════════════════════╗`);
                ns.print(`║          CONTROLLER DEBUG REPORT                   ║`);
                ns.print(`╚═══════════════════════════════════════════════════╝`);
                ns.print(``);
                ns.print(`📊 STATISTIQUES:`);
                ns.print(`   Total jobs reçus: ${totalJobsReceived}`);
                ns.print(`   ✅ Succès: ${totalJobsSuccess} (${totalJobsReceived > 0 ? ((totalJobsSuccess / totalJobsReceived) * 100).toFixed(1) : 0}%)`);
                ns.print(`   ❌ Échecs: ${totalJobsFailed} (${totalJobsReceived > 0 ? ((totalJobsFailed / totalJobsReceived) * 100).toFixed(1) : 0}%)`);
                ns.print(``);
                
                if (failureReasons.size > 0) {
                    ns.print(`🚨 RAISONS D'ÉCHEC PAR SERVEUR:`);
                    for (const [host, reasons] of failureReasons.entries()) {
                        ns.print(`   ${host}:`);
                        const counts = new Map();
                        for (const reason of reasons) {
                            counts.set(reason, (counts.get(reason) || 0) + 1);
                        }
                        for (const [reason, count] of counts.entries()) {
                            ns.print(`      • ${reason} (×${count})`);
                        }
                    }
                    ns.print(``);
                }
                
                lastReport = Date.now();
            }
            
        } catch (error) {
            log.error(`Controller error: ${error.message}`);
            ns.print(`❌ CRASH: ${error.stack}`);
        }
        
        await ns.sleep(POLL_INTERVAL);
    }
}