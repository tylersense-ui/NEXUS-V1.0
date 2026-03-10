/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.1 - Orchestrator (100% DYNAMIQUE)              ║
 * ╚═══════════════════════════════════════════════════════════╝
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
    ns.print("║   🔥 NEXUS v0.9.1-DYNAMIC (100% AUTO-SCALE)               ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    const log = new Logger(ns, "ORCHESTRATOR");
    
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
        
        log.info("🎮 Démarrage Controller...");
        const controllerPID = ns.run("/hack/controller.js");
        if (controllerPID === 0) {
            log.error("Échec controller");
            return;
        }
        ns.print(`✅ Controller PID: ${controllerPID}`);
        ns.print("");
        
        log.info("📊 Démarrage Dashboard...");
        const dashboardPID = ns.run("/core/dashboard.js");
        if (dashboardPID > 0) {
            await ns.sleep(500);
            ns.tail(dashboardPID);
            ns.print(`✅ Dashboard PID: ${dashboardPID}`);
        }
        ns.print("");
        
        const REFRESH_INTERVAL = CONFIG.ORCHESTRATOR.REFRESH_INTERVAL_MS;
        const MIN_TARGETS = CONFIG.ORCHESTRATOR.MIN_TARGETS;
        const CYCLE_DELAY = CONFIG.ORCHESTRATOR.CYCLE_DELAY_MS;
        
        log.success("✅ NEXUS v0.9.1 opérationnel !");
        ns.print("");
        
        await ns.sleep(2000);
        
        let lastRefreshTime = Date.now();
        let cycleCount = 0;
        
        while (true) {
            cycleCount++;
            const cycleStart = Date.now();
            
            ns.clearLog();
            ns.print("╔═══════════════════════════════════════════════════════════╗");
            ns.print("║   🔥 NEXUS ORCHESTRATOR v0.9.1-DYNAMIC                    ║");
            ns.print("╚═══════════════════════════════════════════════════════════╝");
            ns.print("");
            ns.print(`━━━━━━━━━━ CYCLE ${cycleCount} ━━━━━━━━━━`);
            ns.print("");
            
            let maxTargets = MIN_TARGETS;
            
            if (CONFIG.ORCHESTRATOR.AUTO_SCALE_TARGETS) {
                const totalRam = ramMgr.getTotalAvailableRam();
                const ramPerBatchGB = CONFIG.BATCHER.ESTIMATED_RAM_PER_BATCH_GB;
                const avgWeakenTime = 120000;
                const batchesPerTarget = Math.floor(avgWeakenTime / CYCLE_DELAY);
                
                const maxBatches = Math.floor(totalRam / ramPerBatchGB);
                maxTargets = Math.max(MIN_TARGETS, Math.floor(maxBatches / batchesPerTarget));
                
                const hackableCount = network.getTopTargets(maxTargets * 2).length;
                maxTargets = Math.min(maxTargets, hackableCount);
                
                ns.print(`🎯 AUTO-SCALE: ${maxTargets} cibles (${hackableCount} hackables, ${ns.formatRam(totalRam)} RAM)`);
                ns.print("");
            }
            
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
            
            let targets = [];
            
            try {
                targets = network.getTopTargets(maxTargets);
                
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
                            hackPercent: 0.10,
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