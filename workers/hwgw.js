/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: HWGW Worker                                        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /workers/hwgw.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Worker unifié pour HWGW.
 * Ultra-light (1.75GB) pour maximiser les threads.
 * 
 * @usage
 * run /workers/hwgw.js [target] [action]
 * 
 * @args
 * target - Serveur cible
 * action - hack | grow | weaken
 * 
 * @ram
 * 1.75GB
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const action = ns.args[1]; // hack | grow | weaken
    
    if (!target || !action) {
        ns.tprint('ERROR: Usage: run /workers/hwgw.js [target] [action]');
        return;
    }
    
    switch (action) {
        case 'hack':
            await ns.hack(target);
            break;
        case 'grow':
            await ns.grow(target);
            break;
        case 'weaken':
            await ns.weaken(target);
            break;
        default:
            ns.tprint(`ERROR: Invalid action: ${action}`);
    }
}