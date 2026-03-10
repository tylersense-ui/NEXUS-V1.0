/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Orchestrator Phase 4              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/orchestrator.js
 * @version     0.5.3
 * @description Coordinateur central (Phase 4 batching)
 */

import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";
import { Capabilities } from "/lib/capabilities.js";
import { Network } from "/lib/network.js";
import { PortHandler } from "/core/port-handler.js";
import { RamManager } from "/core/ram-manager.js";
import { Batcher } from "/core/batcher.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║                                                           ║");
    ns.print("║   🔥 NEXUS v0.5.3-PROMETHEUS PHASE 4                      ║");
    ns.print("║   'Synchronized Batching - The Real Deal'                ║");
    ns.print("║                                                           ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    const log = new Logger(ns, "ORCHESTRATOR");
    
    try {
        log.info("📋 Initialisation Capabilities...");
        const caps = new Capabilities(ns);
        ns.print("");
        
        log.info("🌐 Initialisation Network...");
        const network = new Network(ns, caps);
        const servers = network.refresh();
        ns.print(`✅ ${servers.length} serveurs détectés`);
        ns.print("");
        
        log.info("📨 Initialisation PortHandler...");
        const portHandler = new PortHandler(ns);
        portHandler.clear(CONFIG.PORTS.COMMANDS);
        ns.print("✅ PortHandler initialisé");
        ns.print("");
        
        log.info("💾 Initialisation RamManager...");
        const ramMgr = new RamManager(ns);
        ns.print("✅ RamManager initialisé");
        ns.print("");
        
        log.info("🔥 Initialisation Batcher Phase 4...");
        const batcher = new Batcher(ns, network, ramMgr, portHandler, caps);
        ns.print("✅ Batcher Phase 4 (synchronized timing)");
        ns.print("");
        
        log.info("🎮 Démarrage Controller...");
        
        if (!ns.fileExists("/hack/controller.js")) {
            log.error("Controller introuvable");
            return;
        }
        
        const controllerPID = ns.run("/hack/controller.js");
        
        if (controllerPID === 0) {
            log.error("Échec démarrage controller");
            return;
        }
        
        ns.print(`✅ Controller démarré (PID: ${controllerPID})`);
        ns.print("");
        
        log.info("📊 Démarrage Dashboard...");
        
        if (!ns.fileExists("/core/dashboard.js")) {
            log.warn("Dashboard introuvable");
        } else {
            const dashboardPID = ns.run("/core/dashboard.js");
            
            if (dashboardPID === 0) {
                log.warn("Échec démarrage dashboard");
            } else {
                ns.print(`✅ Dashboard démarré (PID: ${dashboardPID})`);
                await ns.sleep(1000);
                ns.tail(dashboardPID);
                ns.print("✅ Dashboard auto-tail activé");
            }
        }
        
        ns.print("");
        
        log.info("🖥️  Démarrage Server Manager...");
        
        if (!ns.fileExists("/managers/server-manager.js")) {
            log.warn("Server Manager introuvable");
        } else {
            const serverMgrPID = ns.run("/managers/server-manager.js");
            
            if (serverMgrPID === 0) {
                log.warn("Échec démarrage server manager");
            } else {
                ns.print(`✅ Server Manager démarré (PID: ${serverMgrPID})`);
            }
        }
        
        ns.print("");
        
        const REFRESH_INTERVAL = CONFIG.ORCHESTRATOR.REFRESH_INTERVAL_MS;
        const MIN_TARGETS = CONFIG.ORCHESTRATOR.MIN_TARGETS;
        const MAX_TARGETS = CONFIG.ORCHESTRATOR.MAX_TARGETS;
        const CYCLE_DELAY = CONFIG.ORCHESTRATOR.CYCLE_DELAY_MS;
        
        log.success("✅ NEXUS Phase 4 opérationnel !");
        log.info(`⏱️  Refresh: ${REFRESH_INTERVAL / 1000}s`);
        log.info(`🎯 Targets: ${MIN_TARGETS}-${MAX_TARGETS}`);
        log.info(`🔥 Batching: SYNCHRONIZED (Phase 4)`);
        log.info(`🔧 Prep: ${CONFIG.BATCHER.ENABLE_PREP ? 'ENABLED' : 'DISABLED'}`);
        ns.print("");
        ns.print("═══════════════════════════════════════════════════════════");
        ns.print("🔥 NEXUS v0.5.3-PROMETHEUS PHASE 4 - OPÉRATIONNEL");
        ns.print("═══════════════════════════════════════════════════════════");
        ns.print("");
        
        await ns.sleep(2000);
        
        let lastRefreshTime = Date.now();
        let cycleCount = 0;
        
        while (true) {
            cycleCount++;
            const cycleStart = Date.now();
            
            ns.clearLog();
            ns.print("╔═══════════════════════════════════════════════════════════╗");
            ns.print("║   🔥 NEXUS ORCHESTRATOR v0.5.3-PHASE4                     ║");
            ns.print("╚═══════════════════════════════════════════════════════════╝");
            ns.print("");
            ns.print(`━━━━━━━━━━ CYCLE ${cycleCount} ━━━━━━━━━━`);
            ns.print("");
            
            const timeSinceRefresh = Date.now() - lastRefreshTime;
            
            if (timeSinceRefresh > REFRESH_INTERVAL) {
                try {
                    ns.print("🌐 Refresh réseau...");
                    
                    caps.scan();
                    network.refresh(true);
                    
                    let newCracked = 0;
                    for (const server of servers) {
                        if (!ns.hasRootAccess(server)) {
                            if (network.crack(server)) {
                                newCracked++;
                                ns.print(`🔓 Root: ${server}`);
                            }
                        }
                    }
                    
                    if (newCracked > 0) {
                        ns.print(`✅ ${newCracked} nouveaux serveurs crackés`);
                    }
                    
                    lastRefreshTime = Date.now();
                    ns.print("");
                    
                } catch (error) {
                    ns.print(`❌ Erreur refresh: ${error.message}`);
                }
            }
            
            let targets = [];
            
            try {
                const targetCount = Math.min(
                    Math.max(
                        MIN_TARGETS,
                        Math.floor(caps.hackingLevel / 50)
                    ),
                    MAX_TARGETS
                );
                
                targets = network.getTopTargets(targetCount);
                
                if (targets.length === 0) {
                    ns.print("⚠️  Aucune cible disponible");
                } else {
                    ns.print(`🎯 Cibles (${targets.length}):`);
                    for (const t of targets) {
                        const money = ns.getServerMaxMoney(t);
                        const level = ns.getServerRequiredHackingLevel(t);
                        ns.print(`  • ${t} ($${ns.formatNumber(money)}, lvl ${level})`);
                    }
                }
                ns.print("");
                
            } catch (error) {
                ns.print(`❌ Erreur sélection: ${error.message}`);
                ns.print("");
            }
            
            if (targets.length > 0) {
                for (const target of targets) {
                    try {
                        const result = batcher.dispatchBatch(target, {
                            hackPercent: 0.05,
                            maxThreadsPerJob: 5000
                        });
                        
                        if (result.success) {
                            if (result.prep) {
                                ns.print(`🔧 ${target}: PREP (${result.totalThreads} threads)`);
                            } else {
                                ns.print(`✅ ${target}: BATCH (${result.totalThreads} threads)`);
                            }
                        } else {
                            ns.print(`⏳ ${target}: ${result.error}`);
                        }
                        
                    } catch (error) {
                        ns.print(`❌ Erreur ${target}: ${error.message}`);
                    }
                }
                ns.print("");
            }
            
            const cycleDuration = Date.now() - cycleStart;
            const money = ns.getServerMoneyAvailable("home");
            
            ns.print(`💰 Money: $${ns.formatNumber(money)}`);
            ns.print(`🎯 Level: ${caps.hackingLevel}`);
            ns.print(`⏱️  Cycle: ${cycleDuration}ms`);
            ns.print("");
            
            await ns.sleep(CYCLE_DELAY);
        }
        
    } catch (error) {
        ns.print("");
        ns.print("═══════════════════════════════════════════════════════════");
        ns.print("❌ ORCHESTRATOR CRASHED");
        ns.print(`Erreur: ${error.message}`);
        ns.print(`Stack: ${error.stack}`);
        ns.print("═══════════════════════════════════════════════════════════");
    }
}