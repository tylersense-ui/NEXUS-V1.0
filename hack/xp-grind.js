/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: XP Grind                                           ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /hack/xp-grind.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Script optimisé pour farmer de l'XP de hacking.
 * Utilise weaken en boucle sur n00dles (niveau requis: 1).
 * À utiliser en early game pour monter en niveau rapidement.
 * 
 * @usage
 * run /hack/xp-grind.js
 * 
 * @ram
 * 1.75GB
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = 'n00dles'; // Niveau requis: 1
    
    ns.tprint(`[XP GRIND] Démarrage sur ${target}`);
    ns.tprint('[XP GRIND] Farmer XP avec weaken en boucle');
    
    while (true) {
        await ns.weaken(target);
    }
}