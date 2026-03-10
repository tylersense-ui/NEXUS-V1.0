/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.1 - Boot (TOUS LES MANAGERS)                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";
import { CONFIG } from "/lib/constants.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                           ║");
    ns.tprint("║   🔥 NEXUS v0.9.1-DYNAMIC - BOOT SEQUENCE                 ║");
    ns.tprint("║   'Optimisation Phase'                                    ║");
    ns.tprint("║                                                           ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
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
    
    ns.tprint("[SCAN] Cartographie du réseau...");
    const caps = new Capabilities(ns);
    const network = new Network(ns, caps);
    const servers = network.refresh();
    ns.tprint(`  ✅ ${servers.length} serveurs détectés`);
    ns.tprint("");
    
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
    // LANCEMENT ORCHESTRATOR (batching)
    // ════════════════════════════════════════════════════
    
    ns.tprint("[BOOT] Lancement de l'orchestrator...");
    
    if (!ns.fileExists("/core/orchestrator.js")) {
        ns.tprint("  ❌ ERREUR: /core/orchestrator.js introuvable");
        ns.tprint("");
        return;
    }
    
    const orchestratorPID = ns.run("/core/orchestrator.js");
    
    if (orchestratorPID === 0) {
        ns.tprint("  ❌ ERREUR: Échec lancement orchestrator");
        ns.tprint("  Vérifiez la RAM disponible sur home");
        return;
    }
    
    ns.tprint(`  ✅ Orchestrator démarré (PID: ${orchestratorPID})`);
    ns.tprint("");
    
    await ns.sleep(500);
    
    // ════════════════════════════════════════════════════
    // LANCEMENT SERVER MANAGER (upgrade RAM)
    // ════════════════════════════════════════════════════
    
    ns.tprint("[BOOT] Lancement du server manager...");
    
    if (ns.fileExists("/managers/server-manager.js")) {
        const serverMgrPID = ns.run("/managers/server-manager.js");
        
        if (serverMgrPID > 0) {
            ns.tprint(`  ✅ Server Manager démarré (PID: ${serverMgrPID})`);
        } else {
            ns.tprint("  ⚠️  Server Manager non démarré (RAM insuffisante ou déjà MAX)");
        }
    } else {
        ns.tprint("  ⚠️  /managers/server-manager.js introuvable");
    }
    ns.tprint("");
    
    await ns.sleep(500);
    
    // ════════════════════════════════════════════════════
    // LANCEMENT STOCK MANAGER (bourse)
    // ════════════════════════════════════════════════════
    
    ns.tprint("[BOOT] Lancement du stock manager...");
    
    if (ns.fileExists("/managers/stock-manager.js")) {
        // Vérifier si on a accès bourse
        if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
            const stockMgrPID = ns.run("/managers/stock-manager.js");
            
            if (stockMgrPID > 0) {
                ns.tprint(`  ✅ Stock Manager démarré (PID: ${stockMgrPID})`);
            } else {
                ns.tprint("  ⚠️  Stock Manager non démarré (RAM insuffisante)");
            }
        } else {
            ns.tprint("  ⚠️  Pas d'accès bourse (acheter WSE + TIX API)");
        }
    } else {
        ns.tprint("  ⚠️  /managers/stock-manager.js introuvable");
    }
    ns.tprint("");
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║   ✅ NEXUS v0.9.1-DYNAMIC - BOOT COMPLETE                 ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
}