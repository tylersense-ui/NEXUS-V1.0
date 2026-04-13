/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.2 - Orchestrator (SLOW MODE)                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.11.2
 * @changes     BASE: v0.11.1 (Throttled)
 *              FIX: CYCLE_DELAY 200ms → 5000ms
 *              FIX: Limite à 5 cibles au lieu de 15-20
 *              Évite accumulation RAM progressive
 */

import { CONFIG } from "/lib/constants.js";
import { FileLogger } from "/lib/file-logger.js";
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
    ns.print("║   🔥 NEXUS v0.11.2 - ORCHESTRATOR (SLOW MODE)             ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    const log = new FileLogger(ns, "ORCHESTRATOR", CONFIG.SYSTEM.LOG_LEVEL);
    
    try {
        log.info("📋 Initialisation...");
        const caps = new Capabilities(ns);
        const network = new Network(ns, caps);
        const servers = network.refresh();
        const portHandler = new PortHandler(ns);
        portHandler.clear(CONFIG.PORTS.COMMANDS);
        const ramMgr = new RamManager(ns);
        const batcher = new Batcher(ns, network, ramMgr, portHandler, caps);
        
        ns.print(`✅ ${servers.length} serveurs | RAM Manager | Batcher ready`);
        ns.print("");
        
        const REFRESH_INTERVAL = CONFIG.ORCHESTRATOR.REFRESH_INTERVAL_MS;
        
        // ✅ v0.11.2 : CYCLE_DELAY très long pour éviter accumulation
        const CYCLE_DELAY = 5000;  // 5 secondes au lieu de 200ms
        
        log.info(`✅ NEXUS v0.11.2 opérationnel ! (CYCLE_DELAY: ${CYCLE_DELAY}ms)`);
        ns.print("");
        
        await ns.sleep(2000);
        
        let lastRefreshTime = Date.now();
        let cycleCount = 0;
        let currentTargetIndex = 0;
        
        while (true) {
            cycleCount++;
            const cycleStart = Date.now();
            
            ns.clearLog();
            ns.print("╔═══════════════════════════════════════════════════════════╗");
            ns.print("║   🔥 NEXUS ORCHESTRATOR v0.11.2 (SLOW MODE)              ║");
            ns.print("╚═══════════════════════════════════════════════════════════╝");
            ns.print("");
            ns.print(`━━━━━━━━━━ CYCLE ${cycleCount} ━━━━━━━━━━`);
            ns.print("");
            
            // ════════════════════════════════════════════════════
            // REFRESH RÉSEAU
            // ════════════════════════════════════════════════════
            
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
                            }
                        }
                    }
                    
                    if (newCracked > 0) {
                        ns.print(`✅ ${newCracked} nouveaux serveurs rootés`);
                    }
                    
                    lastRefreshTime = Date.now();
                    ns.print("");
                    
                } catch (error) {
                    ns.print(`❌ Erreur refresh: ${error.message}`);
                }
            }
            
            // ════════════════════════════════════════════════════
            // SÉLECTION CIBLES - ✅ v0.11.2 : LIMITE À 5 CIBLES
            // ════════════════════════════════════════════════════
            
            let allTargets = [];
            
            try {
                // ✅ v0.11.2 : Seulement 5 cibles au lieu de 15-20
                allTargets = network.getTopTargets(5);
                
                if (allTargets.length === 0) {
                    ns.print("⚠️  Aucune cible disponible");
                    ns.print("");
                } else {
                    ns.print(`🎯 Cibles disponibles (${allTargets.length}/5 max):`);
                    for (const t of allTargets) {
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
            
            // ════════════════════════════════════════════════════
            // DISPATCH UN SEUL BATCH (ROUND-ROBIN)
            // ════════════════════════════════════════════════════
            
            if (allTargets.length > 0) {
                const target = allTargets[currentTargetIndex % allTargets.length];
                currentTargetIndex++;
                
                try {
                    const result = batcher.dispatchBatch(target, {
                        hackPercent: 0.05,
                        maxThreadsPerJob: 50000
                    });
                    
                    if (result.success) {
                        if (result.mode.includes('PREP') || result.mode.includes('WEAKEN') || result.mode.includes('GROW')) {
                            ns.print(`🔧 ${target}: ${result.mode} (${result.totalThreads} threads)`);
                        } else {
                            ns.print(`✅ ${target}: ${result.mode} (${result.totalThreads} threads)`);
                        }
                    } else {
                        ns.print(`⏳ ${target}: ${result.error}`);
                    }
                    
                } catch (error) {
                    ns.print(`❌ ${target}: ${error.message}`);
                }
                ns.print("");
            }
            
            // ════════════════════════════════════════════════════
            // STATS
            // ════════════════════════════════════════════════════
            
            const cycleDuration = Date.now() - cycleStart;
            const money = ns.getServerMoneyAvailable("home");
            
            ns.print(`💰 Money: $${ns.formatNumber(money)}`);
            ns.print(`🎯 Level: ${caps.hackingLevel}`);
            ns.print(`⏱️  Cycle: ${cycleDuration}ms`);
            ns.print(`🐌 Delay: ${CYCLE_DELAY}ms (SLOW MODE)`);
            ns.print(`🎯 Targets: ${allTargets.length}/5 max`);
            ns.print(`🔄 Rotation: ${currentTargetIndex}/${allTargets.length}`);
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
