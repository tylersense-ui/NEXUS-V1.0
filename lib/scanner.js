/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Network Scanner                                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/scanner.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Scanne le réseau complet et sauvegarde l'état du monde.
 * Utilise un BFS pour découvrir tous les serveurs.
 * Collecte les informations : RAM, argent, sécurité, niveau requis.
 * 
 * @usage
 * run /lib/scanner.js
 * 
 * @ram
 * 2.50GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    const servers = scanNetwork(ns);
    
    // Sauvegarder l'état
    const worldState = {
        version: '0.2.0',
        lastScan: Date.now(),
        servers: servers,
        rooted: servers.filter(s => ns.hasRootAccess(s.hostname))
    };
    
    ns.write('/state/world-state.txt', JSON.stringify(worldState, null, 2), 'w');
    
    ns.tprint(`[SCAN] ${servers.length} serveurs découverts`);
    ns.tprint(`[SCAN] ${worldState.rooted.length} serveurs rootés`);
}

/**
 * Scanne le réseau complet avec BFS
 * @param {NS} ns 
 * @returns {Array} Liste des serveurs avec leurs infos
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
        
        if (current === 'home') continue;
        
        const server = {
            hostname: current,
            hasRoot: ns.hasRootAccess(current),
            requiredHackLevel: ns.getServerRequiredHackingLevel(current),
            numOpenPortsRequired: ns.getServerNumPortsRequired(current),
            maxMoney: ns.getServerMaxMoney(current),
            minSecurityLevel: ns.getServerMinSecurityLevel(current),
            maxRam: ns.getServerMaxRam(current)
        };
        
        servers.push(server);
    }
    
    return servers;
}

export { scanNetwork };