/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.12.1-COMPLETE - Telemetry Daemon                 ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     0.12.1-COMPLETE
 * @description Fusion v0.11.1 (features) + v0.12.1 (fixes)
 * 
 * FEATURES v0.11.1:
 * - Network status complet
 * - Performance metrics détaillés
 * - Version tracking
 * - Player stats
 * - Heartbeat system
 * 
 * FIXES v0.12.1:
 * - Safe avg/max functions
 * - Worker success rate basé sur lifetime (pas threads)
 * - Gestion erreurs robuste
 */

import { StateManager } from "/lib/state-manager.js";

const UPDATE_INTERVAL = 30000; // 30s
const MAX_WORKER_LIFETIME_MS = 600000; // 10min (sync worker-manager)

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    const stateMgr = new StateManager(ns);
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║   👁️  NEXUS TELEMETRY DAEMON v0.12.1-COMPLETE            ║");
    ns.print("║   'L'Œil de Claude sur sa partie'                         ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    ns.print(`⏱️  Update interval: ${UPDATE_INTERVAL/1000}s`);
    ns.print("");
    
    let cycle = 0;
    
    // ✅ AJOUT v0.12.1 : Historique pour moyennes
    const history = {
        moneyPerSec: [],
        ramUtilization: [],
        successRate: [],
        timestamps: []
    };
    
    let lastMoney = ns.getServerMoneyAvailable('home');
    let lastTime = Date.now();
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        const now = Date.now();
        
        ns.clearLog();
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║   👁️  TELEMETRY DAEMON v0.12.1-COMPLETE                   ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print(`📊 Cycle: ${cycle}`);
        ns.print(`⏰ Time: ${timestamp}`);
        ns.print("");
        
        try {
            // ══════════════════════════════════════════════════════════════
            // 1️⃣ NETWORK STATUS
            // ══════════════════════════════════════════════════════════════
            
            const networkStatus = collectNetworkStatus(ns);
            await stateMgr.save("network-status.json", networkStatus);
            
            ns.print(`🌐 NETWORK:`);
            ns.print(`   Scanned: ${networkStatus.totalServersScanned}`);
            ns.print(`   Rooted: ${networkStatus.totalServersRooted}`);
            ns.print(`   With scripts: ${networkStatus.totalServersWithScripts}`);
            ns.print(`   Empty: ${networkStatus.totalServersEmpty}`);
            ns.print(`   RAM: ${ns.formatRam(networkStatus.totalRamUsed)} / ${ns.formatRam(networkStatus.totalRamNetwork)}`);
            ns.print("");
            
            // ══════════════════════════════════════════════════════════════
            // 2️⃣ PERFORMANCE METRICS (ENHANCED v0.12.1)
            // ══════════════════════════════════════════════════════════════
            
            const currentMoney = ns.getServerMoneyAvailable('home');
            const deltaTime = (now - lastTime) / 1000;
            const deltaMoney = currentMoney - lastMoney;
            const moneyPerSec = deltaTime > 0 ? deltaMoney / deltaTime : 0;
            
            // Compter threads actifs + workers zombies
            let totalThreads = 0;
            let totalWorkers = 0;
            let zombieWorkers = 0;
            
            const allServers = scanAll(ns);
            for (const server of allServers) {
                const processes = ns.ps(server);
                for (const proc of processes) {
                    totalThreads += proc.threads;
                    
                    if (proc.filename.startsWith('workers/')) {
                        totalWorkers++;
                        
                        // ✅ FIX v0.12.1 : Zombie basé sur lifetime
                        const lifetime = now - proc.onlineRunningTime;
                        if (lifetime > MAX_WORKER_LIFETIME_MS) {
                            zombieWorkers++;
                        }
                    }
                }
            }
            
            const successRate = totalWorkers > 0 ? 1 - (zombieWorkers / totalWorkers) : 1;
            const ramUtilization = networkStatus.totalRamNetwork > 0 
                ? (networkStatus.totalRamUsed / networkStatus.totalRamNetwork) 
                : 0;
            
            // Historique
            if (isFinite(moneyPerSec)) history.moneyPerSec.push(moneyPerSec);
            if (isFinite(ramUtilization)) history.ramUtilization.push(ramUtilization);
            if (isFinite(successRate)) history.successRate.push(successRate);
            history.timestamps.push(now);
            
            if (history.moneyPerSec.length > 100) {
                history.moneyPerSec.shift();
                history.ramUtilization.shift();
                history.successRate.shift();
                history.timestamps.shift();
            }
            
            const perfMetrics = {
                timestamp: timestamp,
                current: {
                    money: currentMoney,
                    moneyPerSec: isFinite(moneyPerSec) ? moneyPerSec : 0,
                    ramUtilization: isFinite(ramUtilization) ? ramUtilization : 0,
                    successRate: isFinite(successRate) ? successRate : 1,
                    totalThreads: totalThreads,
                    totalWorkers: totalWorkers,
                    zombieWorkers: zombieWorkers,
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
            
            await stateMgr.save("performance-metrics.json", perfMetrics);
            
            ns.print(`💰 PERFORMANCE:`);
            ns.print(`   Money: $${ns.formatNumber(currentMoney)}`);
            ns.print(`   Revenue: $${ns.formatNumber(moneyPerSec)}/s (avg: $${ns.formatNumber(perfMetrics.averages.moneyPerSec)}/s)`);
            ns.print(`   Threads: ${ns.formatNumber(totalThreads)}`);
            ns.print(`   Workers: ${totalWorkers} (${zombieWorkers} zombies)`);
            ns.print(`   Success: ${(successRate * 100).toFixed(1)}%`);
            ns.print("");
            
            // ══════════════════════════════════════════════════════════════
            // 3️⃣ PLAYER STATS
            // ══════════════════════════════════════════════════════════════
            
            const playerStats = collectPlayerStats(ns);
            await stateMgr.save("player-stats.json", playerStats);
            
            ns.print(`🎯 PLAYER:`);
            ns.print(`   Hacking: ${playerStats.hackingLevel}`);
            ns.print(`   BitNode: ${playerStats.currentBitNode}`);
            ns.print(`   Purchased servers: ${playerStats.purchasedServers}`);
            ns.print("");
            
            // ══════════════════════════════════════════════════════════════
            // 4️⃣ VERSION TRACKING
            // ══════════════════════════════════════════════════════════════
            
            const versionInfo = collectVersionInfo(ns);
            await stateMgr.save("version-tracking.json", versionInfo);
            
            ns.print(`📦 VERSIONS:`);
            for (const [file, version] of Object.entries(versionInfo.versions)) {
                ns.print(`   ${file.split('/').pop()}: ${version}`);
            }
            ns.print("");
            
            // ══════════════════════════════════════════════════════════════
            // 5️⃣ HEARTBEAT
            // ══════════════════════════════════════════════════════════════
            
            // ✅ v0.12.1 FIX : Use getResetInfo instead of deprecated getTimeSinceLastAug
            const resetInfo = ns.getResetInfo();
            const uptime = Date.now() - (resetInfo.lastAugReset || 0);
            
            await stateMgr.save("daemon-heartbeat.json", {
                timestamp: timestamp,
                cycle: cycle,
                pid: ns.pid,
                uptime: uptime
            });
            
            ns.print(`💓 Heartbeat: Cycle ${cycle}`);
            ns.print(`📊 Samples: ${history.moneyPerSec.length}/100`);
            ns.print(`⏳ Next update in ${UPDATE_INTERVAL/1000}s...`);
            
            // Update pour prochain cycle
            lastMoney = currentMoney;
            lastTime = now;
            
        } catch (error) {
            ns.print(`❌ ERROR: ${error.message}`);
            ns.print(`Stack: ${error.stack}`);
        }
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════════════
// COLLECTION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

function collectNetworkStatus(ns) {
    const allServers = scanAll(ns);
    const serversDetail = [];
    
    let totalRooted = 0;
    let totalWithScripts = 0;
    let totalEmpty = 0;
    let totalRamNetwork = 0;
    let totalRamUsed = 0;
    
    for (const hostname of allServers) {
        const hasRoot = ns.hasRootAccess(hostname);
        const maxRam = ns.getServerMaxRam(hostname);
        const usedRam = ns.getServerUsedRam(hostname);
        const processes = ns.ps(hostname);
        
        if (hasRoot) totalRooted++;
        if (processes.length > 0) totalWithScripts++;
        if (processes.length === 0 && maxRam > 0) totalEmpty++;
        
        totalRamNetwork += maxRam;
        totalRamUsed += usedRam;
        
        serversDetail.push({
            hostname: hostname,
            hasRoot: hasRoot,
            maxRam: maxRam,
            usedRam: usedRam,
            availableRam: maxRam - usedRam,
            processCount: processes.length,
            processes: processes.map(p => ({
                filename: p.filename,
                threads: p.threads,
                args: p.args
            }))
        });
    }
    
    return {
        timestamp: new Date().toISOString(),
        totalServersScanned: allServers.length,
        totalServersRooted: totalRooted,
        totalServersWithScripts: totalWithScripts,
        totalServersEmpty: totalEmpty,
        totalRamNetwork: totalRamNetwork,
        totalRamUsed: totalRamUsed,
        ramUsagePercent: totalRamNetwork > 0 ? (totalRamUsed / totalRamNetwork) * 100 : 0,
        serversDetail: serversDetail
    };
}

function collectPlayerStats(ns) {
    return {
        timestamp: new Date().toISOString(),
        hackingLevel: ns.getHackingLevel(),
        currentBitNode: getCurrentBitNode(ns),
        timeSinceLastAug: ns.getTimeSinceLastAug(),
        homeRamMax: ns.getServerMaxRam("home"),
        homeRamUsed: ns.getServerUsedRam("home"),
        purchasedServers: ns.getPurchasedServers().length
    };
}

function collectVersionInfo(ns) {
    const files = [
        "/boot.js",
        "/core/orchestrator.js",
        "/core/batcher.js",
        "/core/ram-manager.js",
        "/core/dashboard.js",
        "/hack/controller.js",
        "/lib/constants.js"
    ];
    
    const versions = {};
    
    for (const file of files) {
        if (ns.fileExists(file)) {
            try {
                const content = ns.read(file);
                const match = content.match(/v([\d.]+)/);
                versions[file] = match ? match[1] : "unknown";
            } catch (e) {
                versions[file] = "error";
            }
        }
    }
    
    return {
        timestamp: new Date().toISOString(),
        versions: versions
    };
}

function getCurrentBitNode(ns) {
    try {
        if (ns.getOwnedSourceFiles) {
            return "BN-1";
        }
    } catch (e) {
        // Pas Singularity
    }
    return "BN-1";
}

function scanAll(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
        }
        
        servers.push(current);
    }
    
    return servers;
}

// ✅ v0.12.1 SAFE FUNCTIONS
function safeAvg(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function safeMax(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr);
}
