/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Deploy Manager                                     ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/deploy-manager.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Déploie le script de hack sur tous les serveurs rootés.
 * Trouve automatiquement la meilleure cible.
 * Optimise l'utilisation de la RAM.
 * 
 * @usage
 * run /managers/deploy-manager.js
 * 
 * @dependencies
 * - /hack/basic-hack.js
 * 
 * @ram
 * 3.20GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const hackScript = '/hack/basic-hack.js';
    const scriptRam = ns.getScriptRam(hackScript);
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ Deploy Manager v0.2                                        ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Trouver la meilleure cible
    const target = findBestTarget(ns);
    ns.print(`🎯 Cible optimale: ${target}`);
    ns.print('');
    
    // Scanner tous les serveurs rootés
    const servers = scanNetwork(ns).filter(s => ns.hasRootAccess(s));
    
    // Ajouter les serveurs achetés
    const purchased = ns.getPurchasedServers();
    for (const p of purchased) {
        if (!servers.includes(p)) servers.push(p);
    }
    
    let totalThreads = 0;
    let serversUsed = 0;
    
    for (const server of servers) {
        const maxRam = ns.getServerMaxRam(server);
        
        if (maxRam === 0) continue;
        
        const availableRam = maxRam - ns.getServerUsedRam(server);
        const threads = Math.floor(availableRam / scriptRam);
        
        if (threads === 0) continue;
        
        // Copier et lancer le script
        await ns.scp(hackScript, server);
        ns.killall(server);
        ns.exec(hackScript, server, threads, target);
        
        totalThreads += threads;
        serversUsed++;
        ns.print(`✓ ${server}: ${threads} threads`);
    }
    
    ns.print('');
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print(`⚡ ${totalThreads} threads déployés`);
    ns.print(`🖥️  ${serversUsed} serveurs utilisés`);
    ns.print('═══════════════════════════════════════════════════════════');
}

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

function findBestTarget(ns) {
    const servers = scanNetwork(ns);
    const myHackLevel = ns.getHackingLevel();
    
    const viable = servers.filter(s => 
        ns.hasRootAccess(s) &&
        ns.getServerRequiredHackingLevel(s) <= myHackLevel &&
        ns.getServerMaxMoney(s) > 0
    );
    
    if (viable.length === 0) return 'n00dles';
    
    viable.sort((a, b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a));
    return viable[0];
}