/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: Target Selector                                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/target-selector.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Sélection adaptative des meilleures cibles.
 * Système inspiré de KRONOS adapté à l'early/mid game.
 * 
 * @usage
 * import { selectTargets } from '/core/target-selector.js'
 * 
 * @dependencies
 * - /lib/formulas.js
 * 
 * @ram
 * N/A (library)
 */

import { calculateProfit, calculateTargetCount } from '/lib/formulas.js';

/**
 * Scanne et trouve tous les serveurs hackables
 * @param {NS} ns 
 * @returns {Array<string>} Liste des serveurs
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
            if (!visited.has(neighbor)) queue.push(neighbor);
        }
        
        if (current !== 'home') servers.push(current);
    }
    
    return servers;
}

/**
 * Calcule la RAM totale du réseau
 * @param {NS} ns 
 * @returns {number} RAM totale en GB
 */
function getTotalNetworkRAM(ns) {
    const servers = scanNetwork(ns);
    const purchased = ns.getPurchasedServers();
    
    let total = ns.getServerMaxRam('home');
    
    for (const s of servers) {
        if (ns.hasRootAccess(s)) {
            total += ns.getServerMaxRam(s);
        }
    }
    
    for (const p of purchased) {
        total += ns.getServerMaxRam(p);
    }
    
    return total;
}

/**
 * Sélectionne les meilleurs targets
 * @param {NS} ns 
 * @returns {Array<string>} Top targets
 */
export function selectTargets(ns) {
    const servers = scanNetwork(ns);
    const myLevel = ns.getHackingLevel();
    const totalRAM = getTotalNetworkRAM(ns);
    
    // Nombre de targets adaptatif
    const targetCount = calculateTargetCount(ns, totalRAM, myLevel);
    
    // Filtrer les serveurs hackables
    const hackable = servers.filter(s => 
        ns.hasRootAccess(s) &&
        ns.getServerRequiredHackingLevel(s) <= myLevel &&
        ns.getServerMaxMoney(s) > 0
    );
    
    // Calculer profit pour chaque serveur
    const scored = hackable.map(s => ({
        name: s,
        profit: calculateProfit(ns, s),
        maxMoney: ns.getServerMaxMoney(s)
    }));
    
    // Trier par profit décroissant
    scored.sort((a, b) => b.profit - a.profit);
    
    // Retourner top N
    return scored.slice(0, targetCount).map(s => s.name);
}