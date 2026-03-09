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

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    // Banner
    ns.tprint("");
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                           ║");
    ns.tprint("║   🔥 NEXUS ORCHESTRATOR v0.5-PROMETHEUS                   ║");
    ns.tprint("║   'Stealing Fire From The Gods'                           ║");
    ns.tprint("║                                                           ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
    const log = new Logger(ns, "ORCHESTRATOR");
    
    // ═══════════════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════════════
    
    try {
        // Capabilities
        log.info("📋 Initialisation Capabilities...");
        const caps = new Capabilities(ns);
        caps.printReport(true);
        ns.tprint("");
        
        // Network
        log.info("🌐 Initialisation Network...");
        const network = new Network(ns, caps);
        const servers = network.refresh();
        ns.tprint(`✅ ${servers.length} serveurs détectés`);
        ns.tprint("");
        
        // PortHandler
        log.info("📨 Initialisation PortHandler...");
        const portHandler = new PortHandler(ns);
        portHandler.clear(CONFIG.PORTS.COMMANDS);
        ns.tprint("✅ PortHandler initialisé");
        ns.tprint("");
        
        // ═══════════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════════
        
        const REFRESH_INTERVAL = CONFIG.ORCHESTRATOR.REFRESH_INTERVAL_MS;
        const MIN_TARGETS = CONFIG.ORCHESTRATOR.MIN_TARGETS;
        const MAX_TARGETS = CONFIG.ORCHESTRATOR.MAX_TARGETS;
        const CYCLE_DELAY = CONFIG.ORCHESTRATOR.CYCLE_DELAY_MS;
        
        log.success("✅ Système NEXUS initialisé !");
        log.info(`⏱️  Refresh interval: ${REFRESH_INTERVAL / 1000}s`);
        log.info(`🎯 Targets: ${MIN_TARGETS}-${MAX_TARGETS}`);
        ns.tprint("");
        ns.tprint("═══════════════════════════════════════════════════════════");
        ns.tprint("🔥 NEXUS v0.5-PROMETHEUS - OPÉRATIONNEL");
        ns.tprint("═══════════════════════════════════════════════════════════");
        ns.tprint("");
        
        // ═══════════════════════════════════════════════════════════════
        // MÉTRIQUES
        // ═══════════════════════════════════════════════════════════════
        
        let lastRefreshTime = Date.now();
        let cycleCount = 0;
        
        // ═══════════════════════════════════════════════════════════════
        // BOUCLE PRINCIPALE
        // ═══════════════════════════════════════════════════════════════
        
        log.info("🔄 Démarrage de la boucle principale...");
        ns.tprint("");
        
        while (true) {
            cycleCount++;
            const cycleStart = Date.now();
            
            log.info(`━━━━━━━━━━ CYCLE ${cycleCount} ━━━━━━━━━━`);
            
            // ═══════════════════════════════════════════════════════════
            // REFRESH RÉSEAU (périodique)
            // ═══════════════════════════════════════════════════════════
            
            const timeSinceRefresh = Date.now() - lastRefreshTime;
            
            if (timeSinceRefresh > REFRESH_INTERVAL) {
                try {
                    log.info("🌐 Refresh réseau...");
                    
                    // Re-scan capabilities (nouveau niveau, nouveaux outils)
                    caps.scan();
                    
                    // Refresh network
                    network.refresh(true);
                    
                    // Auto-crack nouveaux serveurs
                    let newCracked = 0;
                    for (const server of servers) {
                        if (!ns.hasRootAccess(server)) {
                            if (network.crack(server)) {
                                newCracked++;
                                log.success(`🔓 Root: ${server}`);
                            }
                        }
                    }
                    
                    if (newCracked > 0) {
                        log.success(`✅ ${newCracked} nouveaux serveurs crackés`);
                    }
                    
                    lastRefreshTime = Date.now();
                    
                } catch (error) {
                    log.error(`Erreur refresh: ${error.message}`);
                }
            }
            
            // ═══════════════════════════════════════════════════════════
            // SÉLECTION CIBLES
            // ═══════════════════════════════════════════════════════════
            
            let targets = [];
            
            try {
                // Calcul dynamique du nombre de cibles
                const targetCount = Math.min(
                    Math.max(
                        MIN_TARGETS,
                        Math.floor(caps.hackingLevel / 50)
                    ),
                    MAX_TARGETS
                );
                
                targets = network.getTopTargets(targetCount);
                
                if (targets.length === 0) {
                    log.warn("⚠️  Aucune cible disponible");
                } else {
                    log.info(`🎯 Cibles sélectionnées (${targets.length}):`);
                    for (const t of targets) {
                        const money = ns.getServerMaxMoney(t);
                        const level = ns.getServerRequiredHackingLevel(t);
                        log.info(`  • ${t} ($${ns.formatNumber(money)}, lvl ${level})`);
                    }
                }
                
            } catch (error) {
                log.error(`Erreur sélection cibles: ${error.message}`);
            }
            
            // ═══════════════════════════════════════════════════════════
            // PLACEHOLDER: HACKING (Phase 2)
            // ═══════════════════════════════════════════════════════════
            
            if (targets.length > 0) {
                log.info("💤 Phase 2 non implémentée (batcher + controller)");
                log.info("   Le système attend Phase 2 pour hacker...");
            }
            
            // ═══════════════════════════════════════════════════════════
            // STATS CYCLE
            // ═══════════════════════════════════════════════════════════
            
            const cycleDuration = Date.now() - cycleStart;
            const money = ns.getServerMoneyAvailable("home");
            const level = caps.hackingLevel;
            
            log.info(`💰 Money: $${ns.formatNumber(money)} | 🎯 Level: ${level}`);
            log.info(`⏱️  Cycle duration: ${cycleDuration}ms`);
            log.info("");
            
            // Attendre avant prochain cycle
            await ns.sleep(CYCLE_DELAY);
        }
        
    } catch (error) {
        log.error(`ERREUR CRITIQUE: ${error.message}`);
        log.error(`Stack: ${error.stack}`);
        
        ns.tprint("═══════════════════════════════════════════════════════════");
        ns.tprint("❌ ORCHESTRATOR CRASHED");
        ns.tprint(`Erreur: ${error.message}`);
        ns.tprint("═══════════════════════════════════════════════════════════");
    }
}