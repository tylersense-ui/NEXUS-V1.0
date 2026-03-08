/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Global Kill                                        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/global-kill.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Tue TOUS les scripts sur TOUS les serveurs du réseau.
 * Scanne le réseau complet et exécute killall partout.
 * Utile pour nettoyer avant un redéploiement.
 * 
 * @usage
 * run /tools/global-kill.js
 * 
 * @ram
 * 2.50GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Global Kill v0.2                                     ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    ns.print('⚠️  ARRÊT DE TOUS LES SCRIPTS SUR TOUS LES SERVEURS');
    ns.print('');
    
    // Scanner le réseau
    const servers = scanNetwork(ns);
    
    // Ajouter home
    servers.push('home');
    
    // Ajouter les serveurs achetés
    const purchased = ns.getPurchasedServers();
    for (const p of purchased) {
        if (!servers.includes(p)) {
            servers.push(p);
        }
    }
    
    let killed = 0;
    let skipped = 0;
    
    for (const server of servers) {
        // Vérifier les processus en cours
        const processes = ns.ps(server);
        
        if (processes.length > 0) {
            ns.killall(server);
            ns.print(`✓ KILLED: ${server} (${processes.length} processus)`);
            killed++;
        } else {
            skipped++;
        }
    }
    
    ns.print('');
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print(`✓ Serveurs nettoyés: ${killed}`);
    ns.print(`  Serveurs vides: ${skipped}`);
    ns.print(`  TOTAL: ${servers.length} serveurs scannés`);
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print('');
    ns.print('Tous les scripts ont été arrêtés.');
}

/**
 * Scanne le réseau complet
 * @param {NS} ns 
 * @returns {Array<string>} Liste des hostnames
 */
function scanNetwork(ns) {
    const visited = new Set();
    const servers = [];
    const queue = ['home'];
    
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
        
        if (current !== 'home') {
            servers.push(current);
        }
    }
    
    return servers;
}