/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Target Manager                                     ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/target-manager.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Gestionnaire de cibles intelligent :
 * - Rooter automatiquement les serveurs accessibles
 * - Sélectionner la meilleure cible selon le niveau
 * - Mettre à jour la stratégie
 * - Déployer le hack sur home
 * 
 * @usage
 * run /managers/target-manager.js
 * 
 * @dependencies
 * - /lib/utils.js
 * - /hack/basic-hack.js
 * - /state/world-state.txt
 * 
 * @ram
 * 2.95GB
 */

import { readState, writeState } from '/lib/utils.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ Target Manager v0.2                                        ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    while (true) {
        const worldState = readState(ns, 'world');
        if (!worldState) {
            await ns.sleep(5000);
            continue;
        }
        
        const myHackLevel = ns.getHackingLevel();
        
        // Trouver les serveurs accessibles
        const accessible = worldState.servers.filter(s => 
            s.requiredHackLevel <= myHackLevel &&
            s.numOpenPortsRequired === 0 &&
            s.maxMoney > 0
        );
        
        // Rooter les serveurs non rootés
        for (const server of accessible) {
            if (!ns.hasRootAccess(server.hostname)) {
                try {
                    ns.nuke(server.hostname);
                    ns.print(`[ROOT] ${server.hostname} rooté`);
                } catch (e) {
                    // Ignore
                }
            }
        }
        
        // Sélectionner la meilleure cible
        const targets = accessible.filter(s => 
            ns.hasRootAccess(s.hostname) && s.maxMoney > 0
        );
        
        if (targets.length === 0) {
            await ns.sleep(10000);
            continue;
        }
        
        // Trier par argent maximum
        targets.sort((a, b) => b.maxMoney - a.maxMoney);
        const bestTarget = targets[0];
        
        // Mettre à jour la stratégie
        const strategyState = readState(ns, 'strategy') || {};
        strategyState.target = bestTarget.hostname;
        strategyState.lastUpdate = Date.now();
        writeState(ns, 'strategy', strategyState);
        
        // Déployer le hack sur la cible
        if (bestTarget.hostname) {
            ns.scriptKill('/hack/basic-hack.js', 'home');
            
            const threads = Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - 2) / 1.75);
            
            if (threads > 0) {
                ns.exec('/hack/basic-hack.js', 'home', threads, bestTarget.hostname);
                ns.print(`[DEPLOY] ${threads} threads sur ${bestTarget.hostname}`);
            }
        }
        
        await ns.sleep(30000); // Re-évaluation toutes les 30s
    }
}