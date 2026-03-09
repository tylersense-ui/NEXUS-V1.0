/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Grow Worker                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /workers/grow.js
 * @version     0.5.0
 * @ram         1.75GB
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const delay = ns.args[1] || 0;
    const uuid = ns.args[2];
    
    if (delay > 0) await ns.sleep(delay);
    await ns.grow(target);
}