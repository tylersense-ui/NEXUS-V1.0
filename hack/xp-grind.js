/** @param {NS} ns */
export async function main(ns) {
    const target = 'n00dles'; // Niveau requis: 1
    
    ns.tprint(`[XP GRIND] Démarrage sur ${target} pour farmer l'XP`);
    
    while (true) {
        await ns.weaken(target);
    }
}