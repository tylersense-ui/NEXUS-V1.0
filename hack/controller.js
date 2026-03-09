/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Controller                        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /hack/controller.js
 * @version     0.5.0
 * @description Dispatcher ultra-rapide qui lit port 4
 */

import { CONFIG } from "/lib/constants.js";
import { PortHandler } from "/core/port-handler.js";
import { Logger } from "/lib/logger.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    const log = new Logger(ns, "CONTROLLER");
    const portHandler = new PortHandler(ns);
    
    log.info("🎮 Controller démarré");
    
    const COMMANDS_PORT = CONFIG.PORTS.COMMANDS;
    const POLL_INTERVAL = CONFIG.CONTROLLER.POLL_INTERVAL_MS;
    
    let jobsProcessed = 0;
    let jobsSucceeded = 0;
    let jobsFailed = 0;
    
    log.info(`📨 Écoute port ${COMMANDS_PORT} | Polling: ${POLL_INTERVAL}ms`);
    
    while (true) {
        try {
            while (!portHandler.isEmpty(COMMANDS_PORT)) {
                const job = portHandler.readJSON(COMMANDS_PORT);
                
                if (!job) {
                    log.warn("Job invalide dans port 4");
                    continue;
                }
                
                if (!job.type || !job.host || !job.threads || job.threads < 1) {
                    log.warn(`Job invalide: ${JSON.stringify(job)}`);
                    jobsFailed++;
                    continue;
                }
                
                if (!job.target) {
                    log.warn(`Job sans target: ${JSON.stringify(job)}`);
                    jobsFailed++;
                    continue;
                }
                
                try {
                    await ns.scp(job.script, job.host);
                } catch (e) {
                    log.error(`Erreur scp sur ${job.host}: ${e}`);
                    jobsFailed++;
                    continue;
                }
                
                try {
                    const pid = ns.exec(
                        job.script,
                        job.host,
                        job.threads,
                        job.target,
                        job.delay,
                        job.uuid
                    );
                    
                    if (pid > 0) {
                        jobsSucceeded++;
                        jobsProcessed++;
                    } else {
                        log.warn(`Échec exec sur ${job.host}`);
                        jobsFailed++;
                    }
                    
                } catch (e) {
                    log.error(`Erreur exec: ${e}`);
                    jobsFailed++;
                }
            }
            
            await ns.sleep(POLL_INTERVAL);
            
        } catch (error) {
            log.error(`Erreur controller: ${error.message}`);
            await ns.sleep(1000);
        }
    }
}