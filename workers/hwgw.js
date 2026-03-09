/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - HWGW Worker                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /workers/hwgw.js
 * @version     0.5.0
 * @description Worker unifié ultra-léger pour H/W/G/W
 * 
 * @ram         1.75GB
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const action = ns.args[1]; // hack | grow | weaken
    const delay = ns.args[2] || 0;
    const uuid = ns.args[3]; // Salt anti-collision
    
    if (!target || !action) {
        return;
    }
    
    // Délai si nécessaire
    if (delay > 0) {
        await ns.sleep(delay);
    }
    
    // Exécution
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
            break;
    }
}