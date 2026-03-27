/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM MATH LIBRARY - NS API v0.3.0                 ║
 * ║         "Precise calculations using Bitburner NS API"             ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/tylersense-ui/-P.H.A.N.T.O.M.-framework  ║
 * ║ RAM Cost: ~0.40 GB (Uses NS API analyze functions)                ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import * as mathNS from "/lib/math-ns.js";                      ║
 * ║   const hackPercent = mathNS.hackPercent(ns, target);             ║
 * ║   const growThreads = mathNS.growThreads(ns, target, 2);          ║
 * ║                                                                    ║
 * ║ PRECISION: Uses official NS API for accurate calculations         ║
 * ║ COST: Each analyze function costs 0.05-1.00GB RAM                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ RAM COSTS:                                                         ║
 * ║   ns.hackAnalyze()       : 1.00 GB                                 ║
 * ║   ns.growthAnalyze()     : 1.00 GB                                 ║
 * ║   ns.getHackTime()       : 0.05 GB                                 ║
 * ║   ns.getGrowTime()       : 0.05 GB                                 ║
 * ║   ns.getWeakenTime()     : 0.05 GB                                 ║
 * ║   ns.hackAnalyzeChance() : 1.00 GB                                 ║
 * ║   TOTAL ESTIMATE         : ~0.40 GB if all used                    ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.3.0 (2026-03-17) - NS API wrapper creation                   ║
 * ║     • Precise timing via ns.getHackTime/GrowTime/WeakenTime       ║
 * ║     • Precise hack percent via ns.hackAnalyze                     ║
 * ║     • Precise grow threads via ns.growthAnalyze                   ║
 * ║     • All calculations use official Bitburner NS API              ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

// ============================================
// HACK FORMULAS (NS API - Precise)
// ============================================

/**
 * Get PRECISE hack percent using NS API
 * 
 * @param {NS} ns - Netscript object
 * @param {string} target - Target server hostname
 * @returns {number} Exact percent stolen per thread (0.0 to 1.0)
 * RAM Cost: 1.00 GB (ns.hackAnalyze)
 */
export function hackPercent(ns, target) {
    return ns.hackAnalyze(target);
}

/**
 * Calculate threads needed to hack a specific amount (precise)
 * 
 * @param {NS} ns
 * @param {string} target
 * @param {number} targetMoney - Amount of money to steal
 * @returns {number} Threads needed
 * RAM Cost: 1.10 GB (hackPercent + getServerMaxMoney)
 */
export function hackThreads(ns, target, targetMoney) {
    const percentPerThread = hackPercent(ns, target);
    const maxMoney = ns.getServerMaxMoney(target);
    const moneyPerThread = maxMoney * percentPerThread;
    
    if (moneyPerThread <= 0) return Infinity;
    
    return Math.ceil(targetMoney / moneyPerThread);
}

/**
 * Get hack success chance
 * 
 * @param {NS} ns
 * @param {string} target
 * @returns {number} Success chance (0.0 to 1.0)
 * RAM Cost: 1.00 GB (ns.hackAnalyzeChance)
 */
export function hackChance(ns, target) {
    return ns.hackAnalyzeChance(target);
}

/**
 * Calculate security increase from hack
 * 
 * @param {NS} ns
 * @param {number} threads
 * @param {string} target
 * @returns {number} Security increase
 * RAM Cost: 1.00 GB (ns.hackAnalyzeSecurity)
 */
export function hackSecurity(ns, threads, target) {
    return ns.hackAnalyzeSecurity(threads, target);
}

// ============================================
// GROW FORMULAS (NS API - Precise)
// ============================================

/**
 * Calculate PRECISE grow threads using NS API
 * 
 * @param {NS} ns
 * @param {string} target
 * @param {number} growthMultiplier - How much to multiply money by (e.g., 2 = double)
 * @returns {number} Exact threads needed
 * RAM Cost: 1.00 GB (ns.growthAnalyze)
 */
export function growThreads(ns, target, growthMultiplier) {
    return Math.ceil(ns.growthAnalyze(target, growthMultiplier));
}

/**
 * Calculate grow threads to go from current money to target money
 * 
 * @param {NS} ns
 * @param {string} target
 * @param {number} currentMoney
 * @param {number} targetMoney
 * @returns {number} Threads needed
 * RAM Cost: 1.10 GB (growthAnalyze + getServerMoneyAvailable)
 */
export function growThreadsToTarget(ns, target, currentMoney, targetMoney) {
    if (currentMoney >= targetMoney) return 0;
    if (currentMoney <= 0) currentMoney = 1;
    
    const growthMultiplier = targetMoney / currentMoney;
    return growThreads(ns, target, growthMultiplier);
}

/**
 * Calculate security increase from grow
 * 
 * @param {NS} ns
 * @param {number} threads
 * @param {string} target
 * @returns {number} Security increase
 * RAM Cost: 1.00 GB (ns.growthAnalyzeSecurity)
 */
export function growSecurity(ns, threads, target) {
    return ns.growthAnalyzeSecurity(threads, target);
}

// ============================================
// WEAKEN FORMULAS
// ============================================

/**
 * Calculate weaken threads needed to reduce security
 * 
 * @param {number} securityIncrease - Amount of security to reduce
 * @returns {number} Threads needed
 * RAM Cost: 0 GB (pure math)
 */
export function weakenThreads(securityIncrease) {
    const WEAKEN_AMOUNT = 0.05; // Each weaken thread reduces 0.05 security
    return Math.ceil(securityIncrease / WEAKEN_AMOUNT);
}

// ============================================
// TIMING FORMULAS (NS API - Precise)
// ============================================

/**
 * Get PRECISE weaken time from NS API
 * 
 * @param {NS} ns
 * @param {string} target
 * @returns {number} Exact time in milliseconds
 * RAM Cost: 0.05 GB (ns.getWeakenTime)
 */
export function weakenTime(ns, target) {
    return ns.getWeakenTime(target);
}

/**
 * Get PRECISE grow time from NS API
 * 
 * @param {NS} ns
 * @param {string} target
 * @returns {number} Exact time in milliseconds
 * RAM Cost: 0.05 GB (ns.getGrowTime)
 */
export function growTime(ns, target) {
    return ns.getGrowTime(target);
}

/**
 * Get PRECISE hack time from NS API
 * 
 * @param {NS} ns
 * @param {string} target
 * @returns {number} Exact time in milliseconds
 * RAM Cost: 0.05 GB (ns.getHackTime)
 */
export function hackTime(ns, target) {
    return ns.getHackTime(target);
}

// ============================================
// BATCH PLANNING (NS API - Precise)
// ============================================

/**
 * Calculate complete HWGW batch plan using NS API
 * Returns threads needed for each operation with precise calculations
 * 
 * @param {NS} ns
 * @param {string} target - Target server hostname
 * @param {number} hackPercentDesired - Desired hack percent (0.0 to 1.0)
 * @returns {object} Batch plan with precise threads and timing
 * RAM Cost: ~2.30 GB (all analyze + timing functions)
 */
export function calculateHWGWBatch(ns, target, hackPercentDesired = 0.10) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    
    // Calculate hack threads (precise)
    const moneyToSteal = maxMoney * hackPercentDesired;
    const hackThreadsNeeded = hackThreads(ns, target, moneyToSteal);
    
    // Calculate security from hack
    const hackSecIncrease = hackSecurity(ns, hackThreadsNeeded, target);
    
    // Calculate money after hack
    const moneyAfterHack = currentMoney - moneyToSteal;
    
    // Calculate grow threads to restore (precise)
    const growThreadsNeeded = growThreadsToTarget(ns, target, moneyAfterHack, maxMoney);
    
    // Calculate security from grow
    const growSecIncrease = growSecurity(ns, growThreadsNeeded, target);
    
    // Calculate total security increase
    const totalSecurity = hackSecIncrease + growSecIncrease;
    
    // Calculate weaken threads
    const weakenThreadsNeeded = weakenThreads(totalSecurity);
    
    return {
        hack: hackThreadsNeeded,
        grow: growThreadsNeeded,
        weaken: weakenThreadsNeeded,
        totalThreads: hackThreadsNeeded + growThreadsNeeded + weakenThreadsNeeded,
        hackPercent: hackPercentDesired,
        timing: {
            weaken: weakenTime(ns, target),
            grow: growTime(ns, target),
            hack: hackTime(ns, target)
        },
        chance: hackChance(ns, target)
    };
}
