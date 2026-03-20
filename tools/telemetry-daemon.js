/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.12.1 - Telemetry Daemon (SUCCESS FIXED)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.12.1
 * @changes     Fix calcul success rate (lifetime only)
 */

import { StateManager } from "/lib/state-manager.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const state = new StateManager(ns);
    const COLLECT_INTERVAL_MS = 10000;
    const MAX_WORKER_LIFETIME_MS = 600000;  // ✅ Sync avec worker-manager
    
    ns.print('📊 Telemetry Daemon v0.12.1 démarré');
    ns.print(`⏱️  Collection interval: ${COLLECT_INTERVAL_MS/1000}s`);
    ns.print('');
    
    let lastMoney = ns.getServerMoneyAvailable('home');
    let lastTime = Date.now();
    
    const history = {
        moneyPerSec: [],
        ramUtilization: [],
        successRate: [],
        timestamps: []
    };
    
    while (true) {
        try {
            const now = Date.now();
            const currentMoney = ns.getServerMoneyAvailable('home');
            
            // ════════════════════════════════════════════════════
            // CALCUL REVENUS
            // ════════════════════════════════════════════════════
            
            const deltaTime = (now - lastTime) / 1000;
            const deltaMoney = currentMoney - lastMoney;
            const moneyPerSec = deltaTime > 0 ? deltaMoney / deltaTime : 0;
            
            // ════════════════════════════════════════════════════
            // RAM UTILIZATION
            // ════════════════════════════════════════════════════
            
            const servers = getAllServers(ns);
            let totalRam = 0;
            let usedRam = 0;
            
            for (const server of servers) {
                if (!ns.hasRootAccess(server)) continue;
                totalRam += ns.getServerMaxRam(server);
                usedRam += ns.getServerUsedRam(server);
            }
            
            const ramUtilization = totalRam > 0 ? (usedRam / totalRam) : 0;
            
            // ════════════════════════════════════════════════════
            // WORKER SUCCESS RATE (FIX: lifetime only)
            // ════════════════════════════════════════════════════
            
            let totalWorkers = 0;
            let zombieWorkers = 0;
            
            for (const server of servers) {
                const procs = ns.ps(server);
                for (const proc of procs) {
                    if (proc.filename.startsWith('workers/')) {
                        totalWorkers++;
                        
                        // ✅ FIX : Zombie = lifetime trop long SEULEMENT
                        const lifetime = now - proc.onlineRunningTime;
                        if (lifetime > MAX_WORKER_LIFETIME_MS) {
                            zombieWorkers++;
                        }
                    }
                }
            }
            
            const successRate = totalWorkers > 0 ? 1 - (zombieWorkers / totalWorkers) : 1;
            
            // ════════════════════════════════════════════════════
            // SAVE METRICS
            // ════════════════════════════════════════════════════
            
            if (isFinite(moneyPerSec)) {
                history.moneyPerSec.push(moneyPerSec);
            }
            if (isFinite(ramUtilization)) {
                history.ramUtilization.push(ramUtilization);
            }
            if (isFinite(successRate)) {
                history.successRate.push(successRate);
            }
            history.timestamps.push(now);
            
            if (history.moneyPerSec.length > 100) {
                history.moneyPerSec.shift();
                history.ramUtilization.shift();
                history.successRate.shift();
                history.timestamps.shift();
            }
            
            const metrics = {
                timestamp: new Date().toISOString(),
                current: {
                    moneyPerSec: isFinite(moneyPerSec) ? moneyPerSec : 0,
                    ramUtilization: isFinite(ramUtilization) ? ramUtilization : 0,
                    successRate: isFinite(successRate) ? successRate : 1,
                    totalMoney: currentMoney,
                    hackingLevel: ns.getHackingLevel()
                },
                averages: {
                    moneyPerSec: safeAvg(history.moneyPerSec),
                    ramUtilization: safeAvg(history.ramUtilization),
                    successRate: safeAvg(history.successRate)
                },
                max: {
                    moneyPerSec: safeMax(history.moneyPerSec),
                    ramUtilization: safeMax(history.ramUtilization)
                },
                history: history
            };
            
            await state.save('performance-metrics.json', metrics);
            
            // ════════════════════════════════════════════════════
            // DISPLAY
            // ════════════════════════════════════════════════════
            
            ns.clearLog();
            
            ns.print(`╔═══════════════════════════════════════════════════╗`);
            ns.print(`║          TELEMETRY DAEMON v0.12.1                ║`);
            ns.print(`╚═══════════════════════════════════════════════════╝`);
            ns.print(``);
            ns.print(`💰 REVENUS:`);
            ns.print(`   Current : $${ns.formatNumber(metrics.current.moneyPerSec)}/s`);
            ns.print(`   Average : $${ns.formatNumber(metrics.averages.moneyPerSec)}/s`);
            ns.print(`   Max     : $${ns.formatNumber(metrics.max.moneyPerSec)}/s`);
            ns.print(``);
            ns.print(`💾 RAM:`);
            ns.print(`   Utilization: ${(ramUtilization * 100).toFixed(1)}%`);
            ns.print(`   Total      : ${ns.formatRam(totalRam)}`);
            ns.print(`   Used       : ${ns.formatRam(usedRam)}`);
            ns.print(``);
            ns.print(`🎯 WORKERS:`);
            ns.print(`   Total   : ${totalWorkers}`);
            ns.print(`   Zombies : ${zombieWorkers} (lifetime >10min)`);
            ns.print(`   Success : ${(successRate * 100).toFixed(1)}%`);
            ns.print(``);
            ns.print(`📊 SAMPLES: ${history.moneyPerSec.length}/100`);
            ns.print(``);
            
            lastMoney = currentMoney;
            lastTime = now;
            
        } catch (error) {
            ns.print(`❌ ERROR: ${error.message}`);
        }
        
        await ns.sleep(COLLECT_INTERVAL_MS);
    }
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ['home'];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}

function safeAvg(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function safeMax(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr);
}