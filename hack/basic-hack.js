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