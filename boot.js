/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Boot                              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /boot.js
 * @version     0.5.0
 * @description Point d'entrée principal du système NEXUS
 * 
 * @usage
 * run /boot.js
 */

import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";
import { CONFIG } from "/lib/constants.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    // Banner
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                           ║");
    ns.tprint("║   🔥 NEXUS v0.5-PROMETHEUS - BOOT SEQUENCE                ║");
    ns.tprint("║   'The Rebirth'                                           ║");
    ns.tprint("║                                                           ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
    // Nettoyage ports 1-20
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
    
    // Scan réseau
    ns.tprint("[SCAN] Cartographie du réseau...");
    const caps = new Capabilities(ns);
    const network = new Network(ns, caps);
    const servers = network.refresh();
    ns.tprint(`  ✅ ${servers.length} serveurs détectés`);
    ns.tprint("");
    
    // Auto-crack
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
    
    // Kill processus
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
    
    // Lancer orchestrator
    ns.tprint("[BOOT] Lancement de l'orchestrator...");
    
    if (!ns.fileExists("/core/orchestrator.js")) {
        ns.tprint("  ❌ ERREUR: /core/orchestrator.js introuvable");
        ns.tprint("");
        ns.tprint("Déployez d'abord tous les fichiers Phase 1.");
        return;
    }
    
    const pid = ns.run("/core/orchestrator.js");
    
    if (pid === 0) {
        ns.tprint("  ❌ ERREUR: Échec lancement orchestrator");
        ns.tprint("  Vérifiez la RAM disponible sur home");
        return;
    }
    
    ns.tprint(`  ✅ Orchestrator démarré (PID: ${pid})`);
    ns.tprint("");
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║   ✅ NEXUS v0.5-PROMETHEUS - BOOT COMPLETE                ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
}