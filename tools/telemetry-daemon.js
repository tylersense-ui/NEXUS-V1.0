/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.1 - Telemetry Daemon (L'ŒIL DE CLAUDE)       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/telemetry-daemon.js
 * @version     0.11.1
 * @description Daemon permanent qui log TOUT pour diagnostic
 * 
 * FEATURES:
 * - Survie au global-kill (exception PID)
 * - Log ultra détaillé network, performance, player, versions
 * - Update toutes les 30s
 * - Sauvegarde JSON structuré dans /state/
 */

import { StateManager } from "/lib/state-manager.js";

const UPDATE_INTERVAL = 30000; // 30s
const TELEMETRY_PID_FLAG = "TELEMETRY_DAEMON_PROTECTED";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    const stateMgr = new StateManager(ns);
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║   👁️  NEXUS TELEMETRY DAEMON v0.11.1                      ║");
    ns.print("║   'L'Œil de Claude sur sa partie'                         ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    ns.print("🔒 Protection: Exception global-kill activée");
    ns.print(`⏱️  Update interval: ${UPDATE_INTERVAL/1000}s`);
    ns.print("");
    
    let cycle = 0;
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        ns.clearLog();
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║   👁️  TELEMETRY DAEMON                                    ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print(`📊 Cycle: ${cycle}`);
        ns.print(`⏰ Time: ${timestamp}`);
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 1️⃣ NETWORK STATUS (LE PLUS CRITIQUE - DIAGNOSTIQUER 26/69)
        // ══════════════════════════════════════════════════════════════
        
        const networkStatus = collectNetworkStatus(ns);
        await stateMgr.save("network-status.json", networkStatus);
        
        ns.print(`🌐 Network: ${networkStatus.totalServersScanned} scanned`);
        ns.print(`   Rooted: ${networkStatus.totalServersRooted}`);
        ns.print(`   ⚠️  With scripts: ${networkStatus.totalServersWithScripts}`);
        ns.print(`   ⚠️  Empty: ${networkStatus.totalServersEmpty}`);
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 2️⃣ PERFORMANCE METRICS
        // ══════════════════════════════════════════════════════════════
        
        const perfMetrics = collectPerformanceMetrics(ns);
        await stateMgr.save("performance-metrics.json", perfMetrics);
        
        ns.print(`⚡ Threads total: ${ns.formatNumber(perfMetrics.totalThreads || 0)}`);
        ns.print(`💰 Money: $${ns.formatNumber(perfMetrics.currentMoney || 0)}`);
        ns.print(`📈 Revenue: $${ns.formatNumber(perfMetrics.revenuePerSecond || 0)}/s`);
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 3️⃣ PLAYER STATS
        // ══════════════════════════════════════════════════════════════
        
        const playerStats = collectPlayerStats(ns);
        await stateMgr.save("player-stats.json", playerStats);
        
        ns.print(`🎯 Hacking: ${playerStats.hackingLevel}`);
        ns.print(`📡 BitNode: ${playerStats.currentBitNode}`);
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 4️⃣ VERSION TRACKING
        // ══════════════════════════════════════════════════════════════
        
        const versionInfo = collectVersionInfo(ns);
        await stateMgr.save("version-tracking.json", versionInfo);
        
        ns.print(`📦 Versions actives:`);
        for (const [file, version] of Object.entries(versionInfo.versions)) {
            ns.print(`   ${file}: ${version}`);
        }
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 5️⃣ BATCHER STATS (si disponible via port)
        // ══════════════════════════════════════════════════════════════
        
        const batcherStats = collectBatcherStats(ns);
        if (batcherStats) {
            await stateMgr.save("batcher-stats.json", batcherStats);
            ns.print(`🎯 Targets: ${batcherStats.totalTargets}`);
            ns.print(`✅ Success rate: ${(batcherStats.successRate * 100).toFixed(1)}%`);
        }
        ns.print("");
        
        // ══════════════════════════════════════════════════════════════
        // 6️⃣ HEARTBEAT
        // ══════════════════════════════════════════════════════════════
        
        await stateMgr.save("daemon-heartbeat.json", {
            timestamp: timestamp,
            cycle: cycle,
            pid: ns.pid,
            uptime: ns.getTimeSinceLastAug()
        });
        
        ns.print(`💓 Heartbeat saved (cycle ${cycle})`);
        ns.print(`⏳ Next update in ${UPDATE_INTERVAL/1000}s...`);
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════════════
// COLLECTION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

function collectNetworkStatus(ns) {
    // Scan complet BFS
    const visited = new Set();
    const queue = ["home"];
    const allServers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
        
        allServers.push(current);
    }
    
    // Analyser chaque serveur
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

function collectPerformanceMetrics(ns) {
    // Compter threads actifs
    const allServers = scanAll(ns);
    let totalThreads = 0;
    
    for (const server of allServers) {
        const processes = ns.ps(server);
        for (const proc of processes) {
            totalThreads += proc.threads;
        }
    }
    
    // ✅ FIX v0.11.1-HOTFIX : getScriptIncome peut retourner undefined
    let revenuePerSecond = 0;
    try {
        const income = ns.getScriptIncome();
        if (income && Array.isArray(income) && income.length > 0) {
            revenuePerSecond = income[0] || 0;
        }
    } catch (e) {
        // getScriptIncome n'existe pas ou erreur
        revenuePerSecond = 0;
    }
    
    return {
        timestamp: new Date().toISOString(),
        currentMoney: ns.getServerMoneyAvailable("home"),
        revenuePerSecond: revenuePerSecond,
        totalThreads: totalThreads,
        hackingLevel: ns.getHackingLevel()
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
    // Lire versions depuis les fichiers (commentaires header)
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
            // Lire première ligne pour version
            const content = ns.read(file);
            const match = content.match(/v([\d.]+)/);
            versions[file] = match ? match[1] : "unknown";
        }
    }
    
    return {
        timestamp: new Date().toISOString(),
        versions: versions
    };
}

function collectBatcherStats(ns) {
    // Lire depuis port si batcher envoie stats
    // Pour l'instant, retourner null (à implémenter plus tard)
    return null;
}

function getCurrentBitNode(ns) {
    // BitNode actuel (BN-1 par défaut)
    try {
        // Si Singularity API disponible
        if (ns.getOwnedSourceFiles) {
            const sf = ns.getOwnedSourceFiles();
            // Détecter BN actuel (basique)
            return "BN-1"; // Placeholder
        }
    } catch (e) {
        // Pas Singularity
    }
    
    return "BN-1"; // Default
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
