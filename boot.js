/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.0 - Boot (ARCHITECTURE COMPLÈTE)              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.11.0
 * @changes     Lance TOUT : orchestrator + controller + dashboard + managers
 */

import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";
import { CONFIG } from "/lib/constants.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                           ║");
    ns.tprint("║   🔥 NEXUS v0.11.0 - BOOT SEQUENCE                        ║");
    ns.tprint("║   'Batch Messages Architecture'                           ║");
    ns.tprint("║                                                           ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // CLEAN
    // ════════════════════════════════════════════════════
    
    ns.tprint("[CLEAN] Réinitialisation des ports...");
    for (let i = 1; i <= 20; i++) {
        try {
            ns.clearPort(i);
        } catch (e) {
            // Ignore
        }
    }
    ns.tprint("  ✅ Ports 1-20 nettoyés");
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // SCAN
    // ════════════════════════════════════════════════════
    
    ns.tprint("[SCAN] Cartographie du réseau...");
    const caps = new Capabilities(ns);
    const network = new Network(ns, caps);
    const servers = network.refresh();
    ns.tprint(`  ✅ ${servers.length} serveurs détectés`);
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // CRACK
    // ════════════════════════════════════════════════════
    
    ns.tprint("[CRACK] Rootage automatique...");
    let cracked = 0;
    for (const server of servers) {
        if (!ns.hasRootAccess(server)) {
            if (network.crack(server)) {
                cracked++;
            }
        }
    }
    ns.tprint(`  ✅ ${cracked} nouveaux serveurs rootés`);
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // KILL
    // ════════════════════════════════════════════════════
    
    ns.tprint("[KILL] Arrêt des processus...");
    const currentScript = ns.getScriptName();
    let killed = 0;
    
    for (const server of servers) {
        try {
            const procs = ns.ps(server);
            for (const p of procs) {
                if (server === "home" && p.filename === currentScript) continue;
                if (ns.kill(p.pid, server)) killed++;
            }
        } catch (e) {
            // Ignore
        }
    }
    ns.tprint(`  ✅ ${killed} processus arrêtés`);
    ns.tprint("");
    
    await ns.sleep(1000);
    
    // ════════════════════════════════════════════════════
    // CORE SYSTEM
    // ════════════════════════════════════════════════════
    
    ns.tprint("[BOOT] Lancement du système NEXUS...");
    ns.tprint("");
    
    // 1. Controller (écoute PORT 1)
    ns.tprint("  [1/3] Lancement Controller...");
    if (!ns.fileExists("/hack/controller.js")) {
        ns.tprint("    ❌ ERREUR: /hack/controller.js introuvable");
        return;
    }
    
    const controllerPID = ns.run("/hack/controller.js");
    if (controllerPID === 0) {
        ns.tprint("    ❌ ERREUR: Échec lancement controller");
        return;
    }
    ns.tprint(`    ✅ Controller démarré (PID: ${controllerPID})`);
    await ns.sleep(500);
    
    // 2. Orchestrator (génère batches → PORT 1)
    ns.tprint("  [2/3] Lancement Orchestrator...");
    if (!ns.fileExists("/core/orchestrator.js")) {
        ns.tprint("    ❌ ERREUR: /core/orchestrator.js introuvable");
        return;
    }
    
    const orchestratorPID = ns.run("/core/orchestrator.js");
    if (orchestratorPID === 0) {
        ns.tprint("    ❌ ERREUR: Échec lancement orchestrator");
        return;
    }
    ns.tprint(`    ✅ Orchestrator démarré (PID: ${orchestratorPID})`);
    await ns.sleep(500);
    
    // 3. Dashboard (monitoring)
    ns.tprint("  [3/3] Lancement Dashboard...");
    if (ns.fileExists("/core/dashboard.js")) {
        const dashboardPID = ns.run("/core/dashboard.js");
        if (dashboardPID > 0) {
            await ns.sleep(500);
            ns.tail(dashboardPID);
            ns.tprint(`    ✅ Dashboard démarré (PID: ${dashboardPID})`);
        } else {
            ns.tprint("    ⚠️  Dashboard non démarré (RAM insuffisante)");
        }
    } else {
        ns.tprint("    ⚠️  /core/dashboard.js introuvable");
    }
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // MANAGERS (OPTIONNELS)
    // ════════════════════════════════════════════════════
    
    ns.tprint("[MANAGERS] Lancement des managers...");
    ns.tprint("");
    
    // Server Manager (upgrade RAM)
    ns.tprint("  [1/2] Server Manager...");
    if (ns.fileExists("/managers/server-manager.js")) {
        const serverMgrPID = ns.run("/managers/server-manager.js");
        
        if (serverMgrPID > 0) {
            ns.tprint(`    ✅ Server Manager démarré (PID: ${serverMgrPID})`);
        } else {
            ns.tprint("    ⚠️  Server Manager non démarré (RAM insuffisante ou MAX)");
        }
    } else {
        ns.tprint("    ⚠️  /managers/server-manager.js introuvable");
    }
    
    // Stock Manager (bourse)
    ns.tprint("  [2/2] Stock Manager...");
    if (ns.fileExists("/managers/stock-manager.js")) {
        if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
            const stockMgrPID = ns.run("/managers/stock-manager.js");
            
            if (stockMgrPID > 0) {
                ns.tprint(`    ✅ Stock Manager démarré (PID: ${stockMgrPID})`);
            } else {
                ns.tprint("    ⚠️  Stock Manager non démarré (RAM insuffisante)");
            }
        } else {
            ns.tprint("    ⚠️  Pas d'accès bourse (acheter WSE + TIX API)");
        }
    } else {
        ns.tprint("    ⚠️  /managers/stock-manager.js introuvable");
    }
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // DONE
    // ════════════════════════════════════════════════════
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║   ✅ NEXUS v0.11.0 - BOOT COMPLETE                        ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    ns.tprint("📊 ARCHITECTURE:");
    ns.tprint("   Boot → Controller (écoute PORT 1)");
    ns.tprint("        → Orchestrator (génère batches → PORT 1)");
    ns.tprint("        → Dashboard (monitoring)");
    ns.tprint("");
    ns.tprint("🎮 COMMANDES:");
    ns.tprint("   tail /hack/controller.js    (voir jobs exécutés)");
    ns.tprint("   tail /core/orchestrator.js  (voir batches générés)");
    ns.tprint("   tail /core/dashboard.js     (voir stats système)");
    ns.tprint("");
}