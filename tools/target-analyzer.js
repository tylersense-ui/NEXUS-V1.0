/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.10.0 - Target Analyzer (PROFIT/S DEBUG)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/target-analyzer.js
 * @version     0.10.0
 * @description Analyser profit/seconde de toutes les cibles
 * 
 * USAGE:
 * run /tools/target-analyzer.js           → Analyse complète
 * run /tools/target-analyzer.js top       → Top 20 seulement
 * run /tools/target-analyzer.js <target>  → Détails cible
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const cmd = ns.args[0];
    
    // ════════════════════════════════════════════════════
    // SCANNER LE RÉSEAU
    // ════════════════════════════════════════════════════
    
    const servers = scanAll(ns);
    const hackingLevel = ns.getHackingLevel();
    
    // ════════════════════════════════════════════════════
    // ANALYSER CHAQUE CIBLE
    // ════════════════════════════════════════════════════
    
    const targets = [];
    
    for (const server of servers) {
        if (server === 'home') continue;
        if (!ns.hasRootAccess(server)) continue;
        
        const reqLevel = ns.getServerRequiredHackingLevel(server);
        const maxMoney = ns.getServerMaxMoney(server);
        
        if (reqLevel > hackingLevel) continue;
        if (maxMoney < 50000000) continue; // Min 50M
        
        const currentMoney = ns.getServerMoneyAvailable(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        const currentSec = ns.getServerSecurityLevel(server);
        const hackTime = ns.getHackTime(server);
        const growTime = ns.getGrowTime(server);
        const weakenTime = ns.getWeakenTime(server);
        const hackChance = ns.hackAnalyzeChance(server);
        
        // Calculer profit/s pour différents hackPercent
        const profits = {};
        
        for (const pct of [0.05, 0.10, 0.15, 0.20, 0.25]) {
            const moneyStolen = maxMoney * pct;
            const expectedProfit = moneyStolen * hackChance;
            const profitPerSecond = expectedProfit / (hackTime / 1000);
            
            profits[`${(pct * 100).toFixed(0)}%`] = profitPerSecond;
        }
        
        targets.push({
            name: server,
            reqLevel,
            maxMoney,
            currentMoney,
            moneyPercent: maxMoney > 0 ? (currentMoney / maxMoney) : 0,
            minSec,
            currentSec,
            secDiff: currentSec - minSec,
            hackTime,
            growTime,
            weakenTime,
            hackChance,
            profits,
            optimalProfit: profits['20%'], // Profit à 20%
            isReady: (currentMoney / maxMoney >= 0.95) && (currentSec - minSec <= 5)
        });
    }
    
    // Trier par profit/s optimal (20%)
    targets.sort((a, b) => b.optimalProfit - a.optimalProfit);
    
    // ════════════════════════════════════════════════════
    // AFFICHAGE
    // ════════════════════════════════════════════════════
    
    if (cmd === 'top') {
        displayTop20(ns, targets);
    } else if (cmd && cmd !== 'top') {
        displayTargetDetails(ns, targets, cmd);
    } else {
        displayFullAnalysis(ns, targets);
    }
}

function displayTop20(ns, targets) {
    ns.clearLog();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🎯 TOP 20 CIBLES PAR PROFIT/S (20% hack)                ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    ns.print('#   CIBLE                ST  PROFIT/S      MAX MONEY    HACK TIME  CHANCE');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (let i = 0; i < Math.min(20, targets.length); i++) {
        const t = targets[i];
        const idx = String(i + 1).padStart(2);
        const name = t.name.padEnd(20);
        const status = t.isReady ? '🟢' : '🔴';
        const profit = `$${ns.formatNumber(t.optimalProfit)}/s`.padStart(13);
        const money = `$${ns.formatNumber(t.maxMoney)}`.padStart(12);
        const time = formatTime(t.hackTime).padStart(10);
        const chance = `${(t.hackChance * 100).toFixed(1)}%`.padStart(6);
        
        ns.print(`${idx}. ${name} ${status}  ${profit}  ${money}  ${time}  ${chance}`);
    }
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    ns.print('COMMANDES:');
    ns.print('  run target-analyzer.js              → Analyse complète');
    ns.print('  run target-analyzer.js <nom>        → Détails cible');
}

function displayFullAnalysis(ns, targets) {
    ns.clearLog();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🔬 ANALYSE COMPLÈTE DES CIBLES                          ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    ns.print(`📊 Total cibles viables: ${targets.length}`);
    ns.print(`🟢 Prêtes: ${targets.filter(t => t.isReady).length}`);
    ns.print(`🔴 En préparation: ${targets.filter(t => !t.isReady).length}`);
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('TOP 10 PAR PROFIT/S');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    ns.print('CIBLE                PROFIT/S@20%   HACK TIME  WEAKEN TIME  CHANCE');
    ns.print('────────────────────────────────────────────────────────────────────');
    
    for (let i = 0; i < Math.min(10, targets.length); i++) {
        const t = targets[i];
        const name = t.name.padEnd(20);
        const profit = `$${ns.formatNumber(t.optimalProfit)}/s`.padStart(14);
        const hackTime = formatTime(t.hackTime).padStart(10);
        const weakenTime = formatTime(t.weakenTime).padStart(12);
        const chance = `${(t.hackChance * 100).toFixed(1)}%`.padStart(6);
        
        ns.print(`${name} ${profit}  ${hackTime}  ${weakenTime}  ${chance}`);
    }
    
    ns.print('────────────────────────────────────────────────────────────────────');
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('COMPARAISON HACKPERCENT (TOP 5)');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    ns.print('CIBLE                5%          10%         15%         20%         25%');
    ns.print('────────────────────────────────────────────────────────────────────────────');
    
    for (let i = 0; i < Math.min(5, targets.length); i++) {
        const t = targets[i];
        const name = t.name.padEnd(20);
        const p5 = `$${ns.formatNumber(t.profits['5%'])}/s`.padStart(11);
        const p10 = `$${ns.formatNumber(t.profits['10%'])}/s`.padStart(11);
        const p15 = `$${ns.formatNumber(t.profits['15%'])}/s`.padStart(11);
        const p20 = `$${ns.formatNumber(t.profits['20%'])}/s`.padStart(11);
        const p25 = `$${ns.formatNumber(t.profits['25%'])}/s`.padStart(11);
        
        ns.print(`${name} ${p5} ${p10} ${p15} ${p20} ${p25}`);
    }
    
    ns.print('────────────────────────────────────────────────────────────────────────────');
    ns.print('');
    
    ns.print('🎯 RECOMMANDATIONS:');
    ns.print('');
    
    const top1 = targets[0];
    const currentRam = getTotalRam(ns);
    
    ns.print(`  1. MEILLEURE CIBLE: ${top1.name}`);
    ns.print(`     Profit@20%: $${ns.formatNumber(top1.optimalProfit)}/s`);
    ns.print('');
    
    let recommendedHackPct = 0.10;
    if (currentRam > 15000) recommendedHackPct = 0.20;
    else if (currentRam > 5000) recommendedHackPct = 0.15;
    else if (currentRam > 1000) recommendedHackPct = 0.10;
    else recommendedHackPct = 0.05;
    
    ns.print(`  2. HACKPERCENT RECOMMANDÉ: ${(recommendedHackPct * 100).toFixed(0)}%`);
    ns.print(`     (basé sur ${ns.formatRam(currentRam)} RAM totale)`);
    ns.print('');
    
    const optimalSpacing = Math.max(200, Math.floor(top1.weakenTime / 50));
    
    ns.print(`  3. SPACING OPTIMAL: ${optimalSpacing}ms`);
    ns.print(`     (basé sur weakenTime ${formatTime(top1.weakenTime)})`);
    ns.print('');
    
    ns.print('COMMANDES:');
    ns.print('  run target-analyzer.js top          → Top 20 seulement');
    ns.print(`  run target-analyzer.js ${top1.name}   → Détails`);
}

function displayTargetDetails(ns, targets, targetName) {
    const target = targets.find(t => t.name === targetName);
    
    if (!target) {
        ns.print(`❌ Cible '${targetName}' introuvable ou non viable`);
        return;
    }
    
    ns.clearLog();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print(`║   🎯 ANALYSE: ${target.name.toUpperCase().padEnd(45)}║`);
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('STATS GÉNÉRALES');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`Niveau requis: ${target.reqLevel}`);
    ns.print(`Max money: $${ns.formatNumber(target.maxMoney)}`);
    ns.print(`Money actuel: $${ns.formatNumber(target.currentMoney)} (${(target.moneyPercent * 100).toFixed(1)}%)`);
    ns.print(`Min security: ${target.minSec.toFixed(2)}`);
    ns.print(`Security actuel: ${target.currentSec.toFixed(2)} (+${target.secDiff.toFixed(2)})`);
    ns.print(`Statut: ${target.isReady ? '🟢 PRÊT' : '🔴 EN PRÉPARATION'}`);
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('TIMINGS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`Hack time: ${formatTime(target.hackTime)}`);
    ns.print(`Grow time: ${formatTime(target.growTime)}`);
    ns.print(`Weaken time: ${formatTime(target.weakenTime)}`);
    ns.print(`Hack chance: ${(target.hackChance * 100).toFixed(2)}%`);
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('PROFIT/SECONDE PAR HACKPERCENT');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [pct, profit] of Object.entries(target.profits)) {
        const pctStr = pct.padEnd(4);
        const profitStr = `$${ns.formatNumber(profit)}/s`.padStart(15);
        ns.print(`  ${pctStr}: ${profitStr}`);
    }
    
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('RECOMMANDATIONS BATCHING');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const optimalSpacing = Math.max(200, Math.floor(target.weakenTime / 50));
    const maxConcurrentBatches = Math.floor(target.weakenTime / optimalSpacing);
    
    ns.print(`Spacing optimal: ${optimalSpacing}ms`);
    ns.print(`Batches concurrents max: ${maxConcurrentBatches}`);
    ns.print('');
    
    const rank = targets.findIndex(t => t.name === targetName) + 1;
    ns.print(`Classement profit/s: #${rank}/${targets.length}`);
}

function scanAll(ns) {
    const visited = new Set();
    const queue = ['home'];
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

function getTotalRam(ns) {
    const servers = scanAll(ns);
    let totalRam = 0;
    
    for (const server of servers) {
        if (ns.hasRootAccess(server)) {
            totalRam += ns.getServerMaxRam(server);
        }
    }
    
    return totalRam;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m${seconds % 60}s`;
    return `${seconds}s`;
}
