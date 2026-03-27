/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ Test Dynamic hackPercent v0.12.3                          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Simule comment hackPercent varie selon la RAM totale disponible.
 * Compare v0.12.2 (5% fixe) vs v0.12.3 (5-15% adaptatif).
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║  🧪 TEST DYNAMIC HACKPERCENT v0.12.3                     ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Simuler différents niveaux de RAM
    const ramLevels = [
        { label: 'Early game',   ram: 1000 },     // 1 TB
        { label: 'Mid game',     ram: 10000 },    // 10 TB
        { label: 'Late game',    ram: 25000 },    // 25 TB
        { label: 'Very late',    ram: 60000 },    // 60 TB
        { label: 'End game',     ram: 120000 },   // 120 TB
        { label: 'Ultra late',   ram: 250000 }    // 250 TB
    ];
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('📊 SIMULATION HACKPERCENT vs RAM TOTALE');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    
    ns.print('Stage          RAM         v0.12.2 (fixe)  v0.12.3 (adaptatif)  Gain');
    ns.print('──────────────────────────────────────────────────────────────────');
    
    for (const level of ramLevels) {
        const v0122 = 5; // Toujours 5% en v0.12.2
        const v0123 = calculateOptimalHackPercent(level.ram);
        const gain = v0123 - v0122;
        const gainStr = gain > 0 ? `+${gain.toFixed(1)}%` : `${gain.toFixed(1)}%`;
        
        ns.print(`${level.label.padEnd(14)} ${ns.formatNumber(level.ram)}GB${' '.repeat(8-ns.formatNumber(level.ram).length)} ${v0122.toFixed(1)}%            ${v0123.toFixed(1)}%                ${gainStr}`);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('💡 LOGIQUE v0.12.3');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    ns.print('RAM < 20TB      → hackPercent = 5%   (conservative)');
    ns.print('RAM 20-50TB     → hackPercent = 8%   (moderate)');
    ns.print('RAM 50-100TB    → hackPercent = 10%  (aggressive)');
    ns.print('RAM 100-200TB   → hackPercent = 12%  (very aggressive)');
    ns.print('RAM > 200TB     → hackPercent = 15%  (ultra aggressive)');
    ns.print('');
    ns.print('Raison : Plus de RAM = peut gérer plus de threads');
    ns.print('         → Peut voler plus par batch sans saturer');
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('🎯 IMPACT ATTENDU');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    
    // Calculer impact pour la RAM actuelle
    const currentRam = getTotalRam(ns);
    const currentHackPercent = calculateOptimalHackPercent(currentRam);
    const baseHackPercent = 5;
    const theoreticalGain = ((currentHackPercent / baseHackPercent) - 1) * 100;
    
    ns.print(`Votre RAM actuelle : ${ns.formatNumber(currentRam)}GB`);
    ns.print(`hackPercent v0.12.2 : ${baseHackPercent.toFixed(1)}%`);
    ns.print(`hackPercent v0.12.3 : ${currentHackPercent.toFixed(1)}%`);
    ns.print('');
    ns.print(`Gain théorique : +${theoreticalGain.toFixed(1)}%`);
    ns.print('');
    
    if (theoreticalGain > 50) {
        ns.print('✅ ÉNORME GAIN ATTENDU !');
        ns.print('   v0.12.3 devrait augmenter revenus de +50%+');
    } else if (theoreticalGain > 20) {
        ns.print('✅ BON GAIN ATTENDU');
        ns.print('   v0.12.3 devrait augmenter revenus de +20-50%');
    } else if (theoreticalGain > 0) {
        ns.print('✅ GAIN MODÉRÉ ATTENDU');
        ns.print('   v0.12.3 devrait augmenter revenus de +10-20%');
    } else {
        ns.print('⚠️  PAS DE GAIN');
        ns.print('   Vous êtes en early game, hackPercent reste 5%');
        ns.print('   Attendez plus de RAM pour voir les bénéfices');
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('📋 PROCHAINES ÉTAPES');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    ns.print('1. Déployer v0.12.3 (batcher.js + math-ns.js)');
    ns.print('2. Observer hackPercent dans les logs');
    ns.print('3. Mesurer revenus vs baseline v0.12.2');
    ns.print('4. Valider gain après 7 jours');
    ns.print('');
}

/**
 * Réplique la logique de calculateOptimalHackPercent() du batcher
 */
function calculateOptimalHackPercent(totalRamGB) {
    let hackPercent = 5;
    
    if (totalRamGB > 20000) {
        hackPercent = 8;
    }
    if (totalRamGB > 50000) {
        hackPercent = 10;
    }
    if (totalRamGB > 100000) {
        hackPercent = 12;
    }
    if (totalRamGB > 200000) {
        hackPercent = 15;
    }
    
    return Math.max(5, Math.min(15, hackPercent));
}

/**
 * Calculer RAM totale (home + purchased servers)
 */
function getTotalRam(ns) {
    let total = ns.getServerMaxRam('home');
    
    const purchased = ns.getPurchasedServers();
    for (const server of purchased) {
        total += ns.getServerMaxRam(server);
    }
    
    return total;
}
