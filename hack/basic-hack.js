/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Basic Hack                                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /hack/basic-hack.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Script de hack basique avec boucle simple :
 * 1. Weaken si sécurité trop haute
 * 2. Grow si argent trop bas
 * 3. Hack sinon
 * 
 * @usage
 * run /hack/basic-hack.js [target]
 * 
 * @args
 * target - Serveur cible (défaut: n00dles)
 * 
 * @ram
 * 1.75GB
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] || 'n00dles';
    
    while (true) {
        // Weaken si nécessaire
        const currentSec = ns.getServerSecurityLevel(target);
        const minSec = ns.getServerMinSecurityLevel(target);
        
        if (currentSec > minSec + 5) {
            await ns.weaken(target);
            continue;
        }
        
        // Grow si nécessaire
        const currentMoney = ns.getServerMoneyAvailable(target);
        const maxMoney = ns.getServerMaxMoney(target);
        
        if (currentMoney < maxMoney * 0.75) {
            await ns.grow(target);
            continue;
        }
        
        // Hack
        await ns.hack(target);
    }
}