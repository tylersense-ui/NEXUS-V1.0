/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Orchestrator                      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/orchestrator.js
 * @version     0.5.0
 * @description Coordinateur central du système NEXUS
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
    
    // Banner
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║                                                           ║");
    ns.print("║   🔥 NEXUS ORCHESTRATOR v0.5-PROMETHEUS                   ║");
    ns.print("║   'Stealing Fire From The Gods'                           ║");
    ns.print("║                                                           ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    const log = new Logger(ns, "ORCHESTRATOR");
    
    // ═══════════════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════════════
    
    try {
        // Capabilities
        log.info("📋 Initialisation Capabilities...");
        const caps = new Capabilities(ns);
        ns.print("");
        
        // Network
        log.info("🌐 Initialisation Network...");
        const network = new Network(ns, caps);
        const servers = network.refresh();
        ns.print(`✅ ${servers.length} serveurs détectés`);
        ns.print("");
        
        // PortHandler
        log.info("📨 Initialisation PortHandler...");
        const portHandler = new PortHandler(ns);
        portHandler.clear(CONFIG.PORTS.COMMANDS);
        ns.print("✅ PortHandler initialisé");
        ns.print("");
        
        // RamManager
        log.info("💾 Initialisation RamManager...");
        const ramMgr = new RamManager(ns);
        ns.print("✅ RamManager initialisé");
        ns.print("");
        
        // Batcher
        log.info("🔥 Initialisation Batcher...");
        const batcher = new Batcher(ns, network, ramMgr, portHandler, caps);
        ns.print("✅ Batcher initialisé");
        ns.print("");
        
        // ═══════════════════════════════════════════════════════════════
        // LANCEMENT CONTROLLER
        // ═══════════════════════════════════════════════════════════════
        
        log.info("🎮 Démarrage Controller...");
        
        if (!ns.fileExists("/hack/controller.js")) {
            log.error("Controller introuvable: /hack/controller.js");
            return;
        }
        
        const controllerPID = ns.run("/hack/controller.js");
        
        if (controllerPID === 0) {
            log.error("Échec démarrage controller");
            return;
        }
        
        ns.print(`✅ Controller démarré (PID: ${controllerPID})`);
        ns.print("");
        
        // ═══════════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════════
        
        const REFRESH_INTERVAL = CONFIG.ORCHESTRATOR.REFRESH_INTERVAL_MS;
        const MIN_TARGETS = CONFIG.ORCHESTRATOR.MIN_TARGETS;
        const MAX_TARGETS = CONFIG.ORCHESTRATOR.MAX_TARGETS;
        const CYCLE_DELAY = CONFIG.ORCHESTRATOR.CYCLE_DELAY_MS;
        
        log.success("✅ Système NEXUS opérationnel !");
        log.info(`⏱️  Refresh: ${REFRESH_INTERVAL / 1000}s`);
        log.info(`🎯 Targets: ${MIN_TARGETS}-${MAX_TARGETS}`);
        ns.print("");
        ns.print("═══════════════════════════════════════════════════════════");
        ns.print("🔥 NEXUS v0.5-PROMETHEUS - OPÉRATIONNEL");
        ns.print("═══════════════════════════════════════════════════════════");
        ns.print("");
        
        await ns.sleep(2000);
        
        // ═══════════════════════════════════════════════════════════════
        // MÉTRIQUES
        // ═══════════════════════════════════════════════════════════════
        
        let lastRefreshTime = Date.now();
        let cycleCount = 0;
        
        // ═══════════════════════════════════════════════════════════════
        // BOUCLE PRINCIPALE
        // ═══════════════════════════════════════════════════════════════
        
        while (true) {
            cycleCount++;
            const cycleStart = Date.now();
            
            ns.clearLog();
            ns.print("╔═══════════════════════════════════════════════════════════╗");
            ns.print("║   🔥 NEXUS ORCHESTRATOR v0.5-PROMETHEUS                   ║");
            ns.print("╚═══════════════════════════════════════════════════════════╝");
            ns.print("");
            ns.print(`━━━━━━━━━━ CYCLE ${cycleCount} ━━━━━━━━━━`);
            ns.print("");
            
            // ═══════════════════════════════════════════════════════════
            // REFRESH RÉSEAU (périodique)
            // ═══════════════════════════════════════════════════════════
            
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
            
            // ═══════════════════════════════════════════════════════════
            // SÉLECTION CIBLES
            // ═══════════════════════════════════════════════════════════
            
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
            
            // ═══════════════════════════════════════════════════════════
            // DISPATCH BATCHS
            // ═══════════════════════════════════════════════════════════
            
            if (targets.length > 0) {
                for (const target of targets) {
                    try {
                        const result = batcher.dispatchBatch(target, {
                            hackPercent: 0.1,
                            maxThreadsPerJob: 5000
                        });
                        
                        if (result.success) {
                            ns.print(`✅ ${target}: ${result.totalThreads} threads`);
                        } else {
                            ns.print(`⚠️  ${target}: ${result.error}`);
                        }
                        
                    } catch (error) {
                        ns.print(`❌ Erreur batch ${target}: ${error.message}`);
                    }
                }
                ns.print("");
            }
            
            // ═══════════════════════════════════════════════════════════
            // STATS
            // ═══════════════════════════════════════════════════════════
            
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