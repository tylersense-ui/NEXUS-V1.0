/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: HWGW Controller                                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/hwgw-controller.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Contrôleur HWGW pour UNE cible.
 * Gère le cycle complet : Hack → Weaken → Grow → Weaken
 * Job splitting automatique sur tout le réseau.
 * 
 * @usage
 * run /core/hwgw-controller.js [target]
 * 
 * @args
 * target - Serveur cible
 * 
 * @dependencies
 * - /lib/formulas.js
 * - /workers/hwgw.js
 * 
 * @ram
 * 3.50GB
 */

import { calculateTimings, calculateThreads, isServerReady } from '/lib/formulas.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const target = ns.args[0];
    
    if (!target) {
        ns.print('ERROR: Usage: run /core/hwgw-controller.js [target]');
        return;
    }
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print(`║ HWGW Controller v0.3 - ${target.padEnd(42)}║`);
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const WORKER_SCRIPT = '/workers/hwgw.js';
    const WORKER_RAM = 1.75;
    const DELAY_OFFSET = 200; // ms entre chaque action
    
    while (true) {
        // Phase 1: Préparer le serveur
        if (!isServerReady(ns, target)) {
            ns.print(`[PREP] Preparing ${target}...`);
            await prepareServer(ns, target);
            continue;
        }
        
        // Phase 2: Calculer HWGW
        const timings = calculateTimings(ns, target);
        const threads = calculateThreads(ns, target, 0.1); // Hack 10%
        
        ns.print(`[HWGW] H:${threads.hack} W:${threads.weaken1} G:${threads.grow} W:${threads.weaken2}`);
        
        // Phase 3: Job splitting - Distribuer sur le réseau
        const availableServers = getAvailableServers(ns);
        
        // Launch HACK
        await splitAndLaunch(ns, availableServers, WORKER_SCRIPT, WORKER_RAM, threads.hack, [target, 'hack']);
        await ns.sleep(DELAY_OFFSET);
        
        // Wait for hack to complete
        await ns.sleep(timings.hack);
        
        // Launch WEAKEN1
        await splitAndLaunch(ns, availableServers, WORKER_SCRIPT, WORKER_RAM, threads.weaken1, [target, 'weaken']);
        await ns.sleep(DELAY_OFFSET);
        
        // Wait for weaken to complete
        await ns.sleep(timings.weaken);
        
        // Launch GROW
        await splitAndLaunch(ns, availableServers, WORKER_SCRIPT, WORKER_RAM, threads.grow, [target, 'grow']);
        await ns.sleep(DELAY_OFFSET);
        
        // Wait for grow to complete
        await ns.sleep(timings.grow);
        
        // Launch WEAKEN2
        await splitAndLaunch(ns, availableServers, WORKER_SCRIPT, WORKER_RAM, threads.weaken2, [target, 'weaken']);
        
        // Wait for final weaken
        await ns.sleep(timings.weaken + 1000);
        
        ns.print(`[CYCLE] Complete. Money: ${formatMoney(ns.getServerMoneyAvailable(target))}`);
    }
}

/**
 * Prépare un serveur (weaken + grow jusqu'à optimal)
 */
async function prepareServer(ns, target) {
    const minSec = ns.getServerMinSecurityLevel(target);
    const maxMoney = ns.getServerMaxMoney(target);
    
    while (true) {
        const currentSec = ns.getServerSecurityLevel(target);
        const currentMoney = ns.getServerMoneyAvailable(target);
        
        if (currentSec > minSec + 2) {
            await ns.weaken(target);
        } else if (currentMoney < maxMoney * 0.9) {
            await ns.grow(target);
        } else {
            break;
        }
    }
}

/**
 * Récupère tous les serveurs disponibles pour workers
 */
function getAvailableServers(ns) {
    const servers = [];
    
    // Scan réseau
    const visited = new Set();
    const queue = ['home'];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
        }
        
        if (ns.hasRootAccess(current)) {
            const maxRam = ns.getServerMaxRam(current);
            if (maxRam > 0) {
                // Réserver 4GB sur home pour orchestrator/dashboards
                const reserved = current === 'home' ? 4 : 0;
                const usedRam = ns.getServerUsedRam(current);
                const availableRam = Math.max(0, maxRam - usedRam - reserved);
                
                if (availableRam >= 1.75) {
                    servers.push({
                        hostname: current,
                        ram: availableRam
                    });
                }
            }
        }
    }
    
    // Ajouter serveurs achetés
    const purchased = ns.getPurchasedServers();
    for (const p of purchased) {
        const maxRam = ns.getServerMaxRam(p);
        const usedRam = ns.getServerUsedRam(p);
        const availableRam = maxRam - usedRam;
        
        if (availableRam >= 1.75) {
            servers.push({
                hostname: p,
                ram: availableRam
            });
        }
    }
    
    return servers;
}

/**
 * Split threads sur plusieurs serveurs et lance
 * JOB SPLITTING INTELLIGENT
 */
async function splitAndLaunch(ns, servers, script, scriptRam, totalThreads, args) {
    let remaining = totalThreads;
    
    for (const server of servers) {
        if (remaining <= 0) break;
        
        const maxThreads = Math.floor(server.ram / scriptRam);
        const threads = Math.min(remaining, maxThreads);
        
        if (threads > 0) {
            await ns.scp(script, server.hostname);
            ns.exec(script, server.hostname, threads, ...args);
            remaining -= threads;
        }
    }
    
    if (remaining > 0) {
        ns.print(`⚠️  WARNING: ${remaining} threads could not be allocated`);
    }
}

function formatMoney(m) {
    if (m >= 1e9) return `$${(m/1e9).toFixed(2)}b`;
    if (m >= 1e6) return `$${(m/1e6).toFixed(2)}m`;
    if (m >= 1e3) return `$${(m/1e3).toFixed(2)}k`;
    return `$${m.toFixed(0)}`;
}