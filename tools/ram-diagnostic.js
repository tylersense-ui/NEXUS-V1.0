/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ RAM DIAGNOSTIC v1.0 - Trouve le problème de RAM          ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║   🔍 RAM DIAGNOSTIC v1.0                                  ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // SCAN TOUS LES SERVEURS
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
    
    ns.print(`📊 ${servers.length} serveurs trouvés`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // CATÉGORISER ET ANALYSER
    // ════════════════════════════════════════════════════════
    
    const homeServers = [];
    const purchasedServers = [];
    const worldServers = [];
    
    let totalMaxRam = 0;
    let totalUsedRam = 0;
    let totalAvailableRam = 0;
    
    for (const hostname of servers) {
        if (!ns.hasRootAccess(hostname)) continue;
        
        const maxRam = ns.getServerMaxRam(hostname);
        const usedRam = ns.getServerUsedRam(hostname);
        const availableRam = maxRam - usedRam;
        
        const info = {
            hostname,
            maxRam,
            usedRam,
            availableRam,
            processes: ns.ps(hostname).length
        };
        
        totalMaxRam += maxRam;
        totalUsedRam += usedRam;
        totalAvailableRam += availableRam;
        
        if (hostname === 'home') {
            homeServers.push(info);
        } else if (hostname.startsWith('nexus-')) {
            purchasedServers.push(info);
        } else {
            worldServers.push(info);
        }
    }
    
    // ════════════════════════════════════════════════════════
    // AFFICHAGE HOME
    // ════════════════════════════════════════════════════════
    
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print("🏠 HOME SERVER");
    ns.print("═══════════════════════════════════════════════════════════");
    
    for (const info of homeServers) {
        ns.print(`${info.hostname}:`);
        ns.print(`  Max RAM:       ${ns.formatRam(info.maxRam)}`);
        ns.print(`  Used RAM:      ${ns.formatRam(info.usedRam)}`);
        ns.print(`  Available RAM: ${ns.formatRam(info.availableRam)}`);
        ns.print(`  Processes:     ${info.processes}`);
        
        // Lister les processus
        const processes = ns.ps(info.hostname);
        if (processes.length > 0) {
            ns.print(`  Running:`);
            for (const proc of processes) {
                const ram = ns.getScriptRam(proc.filename, info.hostname);
                ns.print(`    - ${proc.filename} (${proc.threads}t, ${ns.formatRam(ram * proc.threads)})`);
            }
        }
    }
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // AFFICHAGE PURCHASED SERVERS
    // ════════════════════════════════════════════════════════
    
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print(`📦 PURCHASED SERVERS (${purchasedServers.length})`);
    ns.print("═══════════════════════════════════════════════════════════");
    
    // Grouper par état
    const serversWithProcesses = purchasedServers.filter(s => s.processes > 0);
    const serversWithUsedRam = purchasedServers.filter(s => s.usedRam > 0 && s.processes === 0);
    const serversEmpty = purchasedServers.filter(s => s.usedRam === 0 && s.processes === 0);
    
    if (serversWithProcesses.length > 0) {
        ns.print(`⚠️  ${serversWithProcesses.length} serveurs avec processus actifs:`);
        for (const info of serversWithProcesses.slice(0, 5)) {
            ns.print(`  ${info.hostname}: ${info.processes} processus, ${ns.formatRam(info.usedRam)} / ${ns.formatRam(info.maxRam)}`);
        }
        if (serversWithProcesses.length > 5) {
            ns.print(`  ... et ${serversWithProcesses.length - 5} autres`);
        }
        ns.print("");
    }
    
    if (serversWithUsedRam.length > 0) {
        ns.print(`🚨 ${serversWithUsedRam.length} serveurs avec RAM utilisée MAIS AUCUN PROCESSUS (BUG!) :`);
        for (const info of serversWithUsedRam.slice(0, 5)) {
            ns.print(`  ${info.hostname}: ${ns.formatRam(info.usedRam)} / ${ns.formatRam(info.maxRam)} (${info.processes} processus)`);
        }
        if (serversWithUsedRam.length > 5) {
            ns.print(`  ... et ${serversWithUsedRam.length - 5} autres`);
        }
        ns.print("");
    }
    
    if (serversEmpty.length > 0) {
        ns.print(`✅ ${serversEmpty.length} serveurs vides (OK)`);
        ns.print("");
    }
    
    // Statistiques purchased
    const purchasedMaxRam = purchasedServers.reduce((sum, s) => sum + s.maxRam, 0);
    const purchasedUsedRam = purchasedServers.reduce((sum, s) => sum + s.usedRam, 0);
    const purchasedAvailableRam = purchasedServers.reduce((sum, s) => sum + s.availableRam, 0);
    
    ns.print(`  Total Max:       ${ns.formatRam(purchasedMaxRam)}`);
    ns.print(`  Total Used:      ${ns.formatRam(purchasedUsedRam)}`);
    ns.print(`  Total Available: ${ns.formatRam(purchasedAvailableRam)}`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // AFFICHAGE WORLD SERVERS (résumé)
    // ════════════════════════════════════════════════════════
    
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print(`🌍 WORLD SERVERS (${worldServers.length})`);
    ns.print("═══════════════════════════════════════════════════════════");
    
    const worldMaxRam = worldServers.reduce((sum, s) => sum + s.maxRam, 0);
    const worldUsedRam = worldServers.reduce((sum, s) => sum + s.usedRam, 0);
    const worldAvailableRam = worldServers.reduce((sum, s) => sum + s.availableRam, 0);
    
    ns.print(`  Total Max:       ${ns.formatRam(worldMaxRam)}`);
    ns.print(`  Total Used:      ${ns.formatRam(worldUsedRam)}`);
    ns.print(`  Total Available: ${ns.formatRam(worldAvailableRam)}`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // RÉSUMÉ GLOBAL
    // ════════════════════════════════════════════════════════
    
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print("📊 RÉSUMÉ GLOBAL");
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print(`  Total Max RAM:       ${ns.formatRam(totalMaxRam)}`);
    ns.print(`  Total Used RAM:      ${ns.formatRam(totalUsedRam)}`);
    ns.print(`  Total Available RAM: ${ns.formatRam(totalAvailableRam)}`);
    ns.print(`  Utilisation:         ${((totalUsedRam / totalMaxRam) * 100).toFixed(1)}%`);
    ns.print("");
    
    // ════════════════════════════════════════════════════════
    // DIAGNOSTIC
    // ════════════════════════════════════════════════════════
    
    ns.print("═══════════════════════════════════════════════════════════");
    ns.print("🔍 DIAGNOSTIC");
    ns.print("═══════════════════════════════════════════════════════════");
    
    if (serversWithUsedRam.length > 0) {
        ns.print(`🚨 PROBLÈME DÉTECTÉ:`);
        ns.print(`   ${serversWithUsedRam.length} serveurs ont de la RAM utilisée`);
        ns.print(`   mais AUCUN processus actif !`);
        ns.print(``);
        ns.print(`   Ceci est un BUG de Bitburner ou un état inconsistant.`);
        ns.print(`   RAM bloquée : ${ns.formatRam(serversWithUsedRam.reduce((sum, s) => sum + s.usedRam, 0))}`);
        ns.print(``);
        ns.print(`   SOLUTIONS:`);
        ns.print(`   1. Redémarrer le jeu (Ctrl+R dans navigateur)`);
        ns.print(`   2. Vendre et racheter les serveurs affectés`);
        ns.print(`   3. Attendre 1-2 minutes (parfois ça se règle)`);
    } else if (totalUsedRam < totalMaxRam * 0.01) {
        ns.print(`✅ RAM saine - ${ns.formatRam(totalAvailableRam)} disponible`);
    } else {
        ns.print(`⚠️  RAM utilisée normale : ${((totalUsedRam / totalMaxRam) * 100).toFixed(1)}%`);
    }
    
    ns.print("");
    ns.print("═══════════════════════════════════════════════════════════");
}