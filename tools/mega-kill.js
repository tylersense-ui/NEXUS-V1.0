/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ MEGA KILL v1.0 - Tue TOUT et nettoie TOUT                ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║   💀 MEGA KILL v1.0 - NETTOYAGE COMPLET                   ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // ÉTAPE 1 : SCAN TOUS LES SERVEURS
    // ════════════════════════════════════════════════════════
    
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
        
        servers.push(current);
    }
    
    ns.print(`🌐 ${servers.length} serveurs trouvés`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // ÉTAPE 2 : KILLALL PARTOUT
    // ════════════════════════════════════════════════════════
    
    ns.print("💀 Arrêt de TOUS les processus...");
    
    let totalKilled = 0;
    
    for (const server of servers) {
        if (!ns.hasRootAccess(server)) continue;
        
        const processes = ns.ps(server);
        
        for (const proc of processes) {
            // Ne PAS tuer ce script lui-même
            if (proc.filename === ns.getScriptName() && server === "home") {
                continue;
            }
            
            try {
                ns.kill(proc.pid);
                totalKilled++;
            } catch (e) {
                // Ignore les erreurs
            }
        }
    }
    
    ns.print(`✅ ${totalKilled} processus tués`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // ÉTAPE 3 : VIDER TOUS LES PORTS
    // ════════════════════════════════════════════════════════
    
    ns.print("🧹 Nettoyage des ports 1-20...");
    
    for (let i = 1; i <= 20; i++) {
        ns.clearPort(i);
    }
    
    ns.print("✅ Ports nettoyés");
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // ÉTAPE 4 : ATTENDRE QUE LA RAM SE LIBÈRE
    // ════════════════════════════════════════════════════════
    
    ns.print("⏳ Attente libération RAM (5 secondes)...");
    await ns.sleep(5000);
    
    // Vérifier la RAM
    let totalMaxRam = 0;
    let totalUsedRam = 0;
    
    for (const server of servers) {
        if (!ns.hasRootAccess(server)) continue;
        
        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        
        totalMaxRam += maxRam;
        totalUsedRam += usedRam;
    }
    
    const totalAvailableRam = totalMaxRam - totalUsedRam;
    const utilizationPercent = (totalUsedRam / totalMaxRam) * 100;
    
    ns.print("");
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print("📊 ÉTAT FINAL");
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print(`  Total Max RAM:       ${ns.formatRam(totalMaxRam)}`);
    ns.print(`  Total Used RAM:      ${ns.formatRam(totalUsedRam)}`);
    ns.print(`  Total Available RAM: ${ns.formatRam(totalAvailableRam)}`);
    ns.print(`  Utilisation:         ${utilizationPercent.toFixed(1)}%`);
    ns.print("");
    
    if (utilizationPercent < 1) {
        ns.print("✅ RAM LIBÉRÉE ! Système prêt pour redémarrage.");
        ns.print("");
        ns.print("🚀 PROCHAINE ÉTAPE:");
        ns.print("   run boot.js");
    } else {
        ns.print("⚠️  RAM encore utilisée. Causes possibles:");
        ns.print("   1. Processus en cours de terminaison (attendre 10s)");
        ns.print("   2. RAM fantôme (Ctrl+R pour reload navigateur)");
        ns.print("   3. Bug Bitburner (redémarrer le jeu)");
    }
    
    ns.print("");
    ns.print("═══════════════════════════════════════════════════════════");
}