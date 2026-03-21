/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ Test EV/s v0.12.2 - Comparaison avec v0.12.1             ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Compare le tri profit/s (hackTime) vs EV/s (weakenTime)
 * pour valider que v0.12.2 sélectionne de meilleures cibles.
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║  🧪 TEST EV/s v0.12.2 vs v0.12.1                         ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Scan réseau
    const servers = scanAll(ns);
    const hackingLevel = ns.getHackingLevel();
    
    // Filter viable targets
    const viable = servers.filter(s => {
        if (!ns.hasRootAccess(s)) return false;
        if (s === 'home') return false;
        
        const reqLevel = ns.getServerRequiredHackingLevel(s);
        const maxMoney = ns.getServerMaxMoney(s);
        
        if (reqLevel > hackingLevel) return false;
        if (maxMoney < 1000000) return false;
        
        return true;
    });
    
    ns.print(`📊 Serveurs viables: ${viable.length}`);
    ns.print('');
    
    // Calculate both metrics for each target
    const targets = viable.map(target => {
        const maxMoney = ns.getServerMaxMoney(target);
        const hackTime = ns.getHackTime(target);
        const weakenTime = ns.getWeakenTime(target);
        const hackChance = ns.hackAnalyzeChance(target);
        
        // v0.12.1 : Profit/s avec hackTime
        const profitPerSec = (maxMoney * 0.10 * hackChance) / (hackTime / 1000);
        
        // v0.12.2 : EV/s avec weakenTime
        const evPerSec = (maxMoney * 0.05 * hackChance) / (weakenTime / 1000);
        
        return {
            name: target,
            maxMoney,
            hackTime,
            weakenTime,
            hackChance,
            profitPerSec,  // v0.12.1
            evPerSec       // v0.12.2
        };
    });
    
    // Sort by profit/s (v0.12.1)
    const sortedByProfit = [...targets].sort((a, b) => b.profitPerSec - a.profitPerSec);
    
    // Sort by EV/s (v0.12.2)
    const sortedByEV = [...targets].sort((a, b) => b.evPerSec - a.evPerSec);
    
    // Display top 10 for each
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('🔵 v0.12.1 - TOP 10 PAR PROFIT/S (hackTime)');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (let i = 0; i < Math.min(10, sortedByProfit.length); i++) {
        const t = sortedByProfit[i];
        const profitStr = `$${ns.formatNumber(t.profitPerSec)}/s`;
        const moneyStr = `$${ns.formatNumber(t.maxMoney)}`;
        ns.print(`${(i+1).toString().padStart(2)}. ${t.name.padEnd(20)} ${profitStr.padStart(15)} (max: ${moneyStr})`);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('🟢 v0.12.2 - TOP 10 PAR EV/s (weakenTime)');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (let i = 0; i < Math.min(10, sortedByEV.length); i++) {
        const t = sortedByEV[i];
        const evStr = `$${ns.formatNumber(t.evPerSec)}/s`;
        const moneyStr = `$${ns.formatNumber(t.maxMoney)}`;
        ns.print(`${(i+1).toString().padStart(2)}. ${t.name.padEnd(20)} ${evStr.padStart(15)} (max: ${moneyStr})`);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('📊 COMPARAISON CIBLE #1');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const top1Profit = sortedByProfit[0];
    const top1EV = sortedByEV[0];
    
    ns.print(`v0.12.1 : ${top1Profit.name}`);
    ns.print(`   Profit/s: $${ns.formatNumber(top1Profit.profitPerSec)}/s`);
    ns.print(`   Max money: $${ns.formatNumber(top1Profit.maxMoney)}`);
    ns.print(`   Hack time: ${(top1Profit.hackTime / 1000).toFixed(1)}s`);
    ns.print(`   Weaken time: ${(top1Profit.weakenTime / 1000).toFixed(1)}s`);
    ns.print('');
    
    ns.print(`v0.12.2 : ${top1EV.name}`);
    ns.print(`   EV/s: $${ns.formatNumber(top1EV.evPerSec)}/s`);
    ns.print(`   Max money: $${ns.formatNumber(top1EV.maxMoney)}`);
    ns.print(`   Hack time: ${(top1EV.hackTime / 1000).toFixed(1)}s`);
    ns.print(`   Weaken time: ${(top1EV.weakenTime / 1000).toFixed(1)}s`);
    ns.print('');
    
    // Analysis
    if (top1Profit.name === top1EV.name) {
        ns.print('✅ MÊME CIBLE : Aucun changement attendu');
    } else {
        ns.print('🔄 CIBLE DIFFÉRENTE : Changement attendu !');
        ns.print(`   → Migration de ${top1Profit.name} vers ${top1EV.name}`);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('💡 ANALYSE');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    ns.print('EV/s (v0.12.2) utilise weakenTime qui est plus précis car :');
    ns.print('- weakenTime = durée totale du batch HWGW');
    ns.print('- hackTime ne représente que la phase hack');
    ns.print('- Le throughput réel dépend du cycle complet');
    ns.print('');
    ns.print('Résultat attendu : Meilleure sélection de cibles');
    ns.print('               → +20-40% revenus');
    ns.print('');
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
