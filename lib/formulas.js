/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: Formulas & Calculations                            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/formulas.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Calculs de timing HWGW, threads nécessaires, profitabilité.
 * Formules critiques pour le batch scheduling.
 * 
 * @usage
 * import { calculateHWGW, calculateThreads } from '/lib/formulas.js'
 * 
 * @ram
 * N/A (library)
 */

/**
 * Calcule les timings HWGW pour une cible
 * @param {NS} ns 
 * @param {string} target 
 * @returns {object} Timings en ms
 */
export function calculateTimings(ns, target) {
    return {
        hack: ns.getHackTime(target),
        grow: ns.getGrowTime(target),
        weaken: ns.getWeakenTime(target)
    };
}

/**
 * Calcule les threads nécessaires pour HWGW
 * @param {NS} ns 
 * @param {string} target 
 * @param {number} hackPercent - Pourcentage à hack (0.1 = 10%)
 * @returns {object} Threads pour H/W/G/W
 */
export function calculateThreads(ns, target, hackPercent = 0.1) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentSec = ns.getServerSecurityLevel(target);
    
    // Threads hack
    const hackThreads = Math.max(1, Math.floor(
        ns.hackAnalyzeThreads(target, currentMoney * hackPercent)
    ));
    
    // Security increase from hack
    const hackSecIncrease = ns.hackAnalyzeSecurity(hackThreads, target);
    
    // Threads pour weaken après hack
    const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
    
    // Argent perdu après hack
    const moneyAfterHack = currentMoney * (1 - hackPercent);
    
    // Threads grow pour restaurer
    const growThreads = Math.max(1, Math.ceil(
        ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
    ));
    
    // Security increase from grow
    const growSecIncrease = ns.growthAnalyzeSecurity(growThreads, target);
    
    // Threads pour weaken après grow
    const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
    
    return {
        hack: hackThreads,
        weaken1: weakenThreads1,
        grow: growThreads,
        weaken2: weakenThreads2,
        total: hackThreads + weakenThreads1 + growThreads + weakenThreads2
    };
}

/**
 * Calcule la profitabilité d'une cible
 * @param {NS} ns 
 * @param {string} target 
 * @returns {number} Profit estimé par seconde
 */
export function calculateProfit(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const hackTime = ns.getHackTime(target);
    const weakenTime = ns.getWeakenTime(target);
    
    // Cycle HWGW complet
    const cycleTime = weakenTime + 500; // Buffer de 500ms
    
    // Profit par cycle (10% du max)
    const profitPerCycle = maxMoney * 0.1;
    
    // Profit par seconde
    return profitPerCycle / (cycleTime / 1000);
}

/**
 * Calcule combien de targets on peut gérer
 * @param {NS} ns 
 * @param {number} totalRAM - RAM totale réseau en GB
 * @param {number} hackingLevel 
 * @returns {number} Nombre de targets
 */
export function calculateTargetCount(ns, totalRAM, hackingLevel) {
    // Inspiré du système adaptatif KRONOS
    const byLevel = Math.floor(hackingLevel / 50);
    const byRAM = Math.floor(totalRAM / 100); // 1 target par 100GB
    
    const targetCount = Math.min(byLevel, byRAM);
    
    // Min 1, Max 10 pour l'early/mid game
    return Math.max(1, Math.min(10, targetCount));
}

/**
 * Vérifie si le serveur est prêt pour HWGW
 * @param {NS} ns 
 * @param {string} target 
 * @returns {boolean}
 */
export function isServerReady(ns, target) {
    const currentMoney = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);
    const currentSec = ns.getServerSecurityLevel(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    
    // Prêt si argent > 90% et sécurité proche du min
    return (currentMoney > maxMoney * 0.9) && (currentSec < minSec + 3);
}