/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v1.1 - Aug Speedrun Planner (30 AUGS DAEDALUS)      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/aug-speedrun.js
 * @version     1.1.0
 * @description 30 augs minimum pour Daedalus (speedrun optimal)
 * 
 * CHANGEMENTS v1.1 :
 * - ❌ RETIRÉ : PC Direct-Neural Interface (fausse faction)
 * - ✅ AJOUTÉ : Neurotrainer I (CyberSec)
 * - ✅ AJOUTÉ : Neurotrainer II (NiteSec)
 * 
 * USAGE:
 * run /tools/aug-speedrun.js                 → Voir tous les runs
 * run /tools/aug-speedrun.js 1               → Détails Run 1
 * run /tools/aug-speedrun.js next            → Prochain run suggéré
 * run /tools/aug-speedrun.js mark <nom>      → Marquer comme acheté
 * run /tools/aug-speedrun.js unmark <nom>    → Démarquer
 * run /tools/aug-speedrun.js reset           → Reset tracking
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    const TRACKING_FILE = '/state/augs-speedrun.txt';
    const cmd = ns.args[0];
    const augName = ns.args.slice(1).join(' ');
    
    // Créer fichier tracking si inexistant
    if (!ns.fileExists(TRACKING_FILE)) {
        ns.write(TRACKING_FILE, JSON.stringify({ purchased: [] }), 'w');
    }
    
    // Lire tracking
    let tracking = { purchased: [] };
    try {
        const data = ns.read(TRACKING_FILE);
        tracking = JSON.parse(data);
    } catch (e) {
        tracking = { purchased: [] };
    }
    
    // ════════════════════════════════════════════════════
    // COMMANDES TRACKING
    // ════════════════════════════════════════════════════
    
    if (cmd === 'mark' && augName) {
        if (!tracking.purchased.includes(augName)) {
            tracking.purchased.push(augName);
            ns.write(TRACKING_FILE, JSON.stringify(tracking, null, 2), 'w');
            ns.tprint(`✅ Marqué: ${augName}`);
        } else {
            ns.tprint(`⚠️  Déjà marqué: ${augName}`);
        }
        return;
    }
    
    if (cmd === 'unmark' && augName) {
        tracking.purchased = tracking.purchased.filter(a => a !== augName);
        ns.write(TRACKING_FILE, JSON.stringify(tracking, null, 2), 'w');
        ns.tprint(`❌ Démarqué: ${augName}`);
        return;
    }
    
    if (cmd === 'reset') {
        ns.write(TRACKING_FILE, JSON.stringify({ purchased: [] }, null, 2), 'w');
        ns.tprint('🔄 Tracking reset');
        return;
    }
    
    ns.tail();
    
    const MULTIPLIER = 1.9;
    
    // ════════════════════════════════════════════════════
    // 30 AUGMENTATIONS SPEEDRUN (ordre optimal)
    // ════════════════════════════════════════════════════
    
    const SPEEDRUN_AUGS = [
        // ─────────────────────────────────────────────────
        // FACTIONS HACKING (22 augs) - OBLIGATOIRES
        // ─────────────────────────────────────────────────
        
        // Tier S (les plus chères)
        { name: "Artificial Bio-neural Network Implant", price: 3000000000000, rep: 275000000, faction: "BitRunners" },
        { name: "BitRunners Neurolink", price: 4375000000000, rep: 875000000, faction: "BitRunners" },
        { name: "Neuralstimulator", price: 3000000000000, rep: 50000000, faction: "The Black Hand" },
        { name: "Embedded Netburner Module Core V2 Upgrade", price: 4500000000000, rep: 1000000000, faction: "BitRunners" },
        { name: "Cranial Signal Processors - Gen V", price: 2250000000000, rep: 250000000, faction: "BitRunners" },
        { name: "Embedded Netburner Module Core Implant", price: 2500000000000, rep: 175000000, faction: "BitRunners" },
        { name: "Neural Accelerator", price: 1750000000000, rep: 200000000, faction: "BitRunners" },
        { name: "Enhanced Myelin Sheathing", price: 1375000000000, rep: 100000000, faction: "BitRunners" },
        { name: "Cranial Signal Processors - Gen IV", price: 1100000000000, rep: 125000000, faction: "BitRunners" },
        
        // Tier A
        { name: "The Black Hand", price: 550000000, rep: 100000000, faction: "The Black Hand" },
        { name: "Cranial Signal Processors - Gen III", price: 550000000, rep: 50000000, faction: "The Black Hand" },
        { name: "DataJack", price: 450000000, rep: 112500000, faction: "BitRunners" },
        { name: "Embedded Netburner Module", price: 250000000, rep: 15000000, faction: "BitRunners" },
        { name: "Neural-Retention Enhancement", price: 250000000, rep: 20000000, faction: "NiteSec" },
        { name: "CRTX42-AA Gene Modification", price: 225000000, rep: 45000000, faction: "NiteSec" },
        { name: "Cranial Signal Processors - Gen II", price: 125000000, rep: 18750000, faction: "NiteSec" },
        { name: "Artificial Synaptic Potentiation", price: 80000000, rep: 6250000, faction: "NiteSec" },
        { name: "Neurotrainer II", price: 45000000, rep: 10000000, faction: "NiteSec" },
        { name: "Cranial Signal Processors - Gen I", price: 70000000, rep: 10000000, faction: "CyberSec" },
        { name: "Neurotrainer I", price: 4000000, rep: 1000000, faction: "CyberSec" },
        { name: "BitWire", price: 10000000, rep: 3750000, faction: "CyberSec" },
        { name: "Synaptic Enhancement Implant", price: 7500000, rep: 2000000, faction: "CyberSec" },
        
        // ─────────────────────────────────────────────────
        // FACTIONS FACILES (8 augs) - SPEEDRUN
        // ─────────────────────────────────────────────────
        
        // Netburners (5 augs - facile avec hacknet)
        { name: "Hacknet Node Core Direct-Neural Interface", price: 60000000, rep: 12500000, faction: "Netburners" },
        { name: "Hacknet Node Kernel Direct-Neural Interface", price: 40000000, rep: 7500000, faction: "Netburners" },
        { name: "Hacknet Node CPU Architecture Neural-Upload", price: 11000000, rep: 3750000, faction: "Netburners" },
        { name: "Hacknet Node Cache Architecture Neural-Upload", price: 5500000, rep: 2500000, faction: "Netburners" },
        { name: "Hacknet Node NIC Architecture Neural-Upload", price: 4500000, rep: 1875000, faction: "Netburners" },
        
        // Tian Di Hui (2 augs - early city faction)
        { name: "Social Negotiation Assistant (S.N.A)", price: 30000000, rep: 6250000, faction: "Tian Di Hui" },
        { name: "Speech Enhancement", price: 12500000, rep: 2500000, faction: "Tian Di Hui" },
        
        // Aevum (1 aug)
        { name: "Wired Reflexes", price: 2500000, rep: 1250000, faction: "Aevum" }
    ];
    
    // ════════════════════════════════════════════════════
    // DÉCOUPAGE : 3 runs de 10 augs
    // ════════════════════════════════════════════════════
    
    const purchased = tracking.purchased || [];
    const remaining = SPEEDRUN_AUGS.filter(a => !purchased.includes(a.name));
    
    // Trier par prix décroissant (cher → pas cher)
    remaining.sort((a, b) => b.price - a.price);
    
    const runSize = 10;
    const packs = [];
    
    for (let i = 0; i < remaining.length; i += runSize) {
        packs.push(remaining.slice(i, i + runSize));
    }
    
    // ════════════════════════════════════════════════════
    // AFFICHAGE
    // ════════════════════════════════════════════════════
    
    if (!cmd || cmd === "all") {
        displayOverview(ns, packs, purchased, remaining);
    } else if (cmd === "next") {
        suggestNextRun(ns, packs, tracking);
    } else {
        const runNum = parseInt(cmd);
        if (runNum >= 1 && runNum <= packs.length) {
            displayRunDetails(ns, packs, runNum - 1, tracking);
        } else {
            ns.tprint(`❌ Run ${runNum} invalide (1-${packs.length})`);
        }
    }
}

function displayOverview(ns, packs, purchased, remaining) {
    ns.clearLog();
    
    const MULTIPLIER = 1.9;
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🏃 NEXUS SPEEDRUN PLANNER v1.1                          ║');
    ns.print('║   30 augmentations pour Daedalus (optimisé)              ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    ns.print(`✅ Achetées: ${purchased.length} / 30`);
    ns.print(`⏳ Restantes: ${remaining.length}`);
    ns.print('');
    
    ns.print('🎯 OBJECTIF: 30 augs minimum + $100B + 2500 hacking');
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('DÉCOUPAGE OPTIMAL');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`Nombre de runs: ${packs.length} (10 augs/run)`);
    ns.print('');
    
    ns.print('RUN  AUGS  COÛT           TOP 3 AUGS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let grandTotal = 0;
    
    for (let runIdx = 0; runIdx < packs.length; runIdx++) {
        const pack = packs[runIdx];
        if (!pack || pack.length === 0) continue;
        
        let totalCost = 0;
        for (let i = 0; i < pack.length; i++) {
            totalCost += pack[i].price * Math.pow(MULTIPLIER, i);
        }
        grandTotal += totalCost;
        
        const top3 = pack.slice(0, 3).map(a => a.name.substring(0, 20)).join(', ');
        const runStr = String(runIdx + 1).padStart(3);
        const augsStr = String(pack.length).padStart(4);
        const costStr = `$${ns.formatNumber(totalCost)}`.padStart(14);
        
        ns.print(`${runStr}  ${augsStr}  ${costStr}  ${top3}`);
    }
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    ns.print('');
    ns.print('📋 ROADMAP FACTIONS:');
    ns.print('  1. CyberSec (backdoor CSEC) - 4 augs');
    ns.print('  2. NiteSec (backdoor avmnite-02h) - +6 augs');
    ns.print('  3. The Black Hand (backdoor I.I.I.I) - +3 augs');
    ns.print('  4. BitRunners (backdoor run4theh111z) - +9 augs');
    ns.print('  5. Netburners (hacknet nodes) - +5 augs');
    ns.print('  6. Tian Di Hui (early city) - +2 augs');
    ns.print('  7. Aevum (city) - +1 aug');
    ns.print('  → TOTAL: 30 augs → Daedalus');
    ns.print('');
    
    ns.print('COMMANDES:');
    ns.print('  run aug-speedrun.js 1          → Détails Run 1');
    ns.print('  run aug-speedrun.js next       → Prochain run suggéré');
    ns.print('  run aug-speedrun.js mark <nom> → Marquer comme acheté');
    ns.print('  run aug-speedrun.js reset      → Reset tracking');
}

function suggestNextRun(ns, packs, tracking) {
    const money = ns.getServerMoneyAvailable('home');
    const MULTIPLIER = 1.9;
    let nextRun = 1;
    
    for (let runIdx = 0; runIdx < packs.length; runIdx++) {
        const pack = packs[runIdx];
        if (!pack || pack.length === 0) continue;
        
        let totalCost = 0;
        for (let i = 0; i < pack.length; i++) {
            totalCost += pack[i].price * Math.pow(MULTIPLIER, i);
        }
        
        if (money >= totalCost * 1.5) {
            nextRun = runIdx + 2;
        }
    }
    
    if (nextRun > packs.length) nextRun = packs.length;
    
    displayRunDetails(ns, packs, nextRun - 1, tracking);
}

function displayRunDetails(ns, packs, runIdx, tracking) {
    const pack = packs[runIdx];
    if (!pack || pack.length === 0) {
        ns.print('❌ Run vide');
        return;
    }
    
    const physicalRun = runIdx + 1;
    const MULTIPLIER = 1.9;
    
    ns.clearLog();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print(`║   RUN ${physicalRun} (physique) - ${pack.length} augmentations                     ║`);
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    let totalCost = 0;
    const purchased = tracking.purchased || [];
    const repByFaction = new Map();
    
    for (let i = 0; i < pack.length; i++) {
        totalCost += pack[i].price * Math.pow(MULTIPLIER, i);
        
        const faction = pack[i].faction;
        if (!repByFaction.has(faction)) {
            repByFaction.set(faction, 0);
        }
        repByFaction.set(faction, Math.max(repByFaction.get(faction), pack[i].rep));
    }
    
    ns.print(`💰 Coût total: $${ns.formatNumber(totalCost)}`);
    ns.print('');
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('ORDRE D\'ACHAT (CHER → PAS CHER)');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('#   ST  NOM                                   FACTION              PRIX         REP');
    ns.print('─────────────────────────────────────────────────────────────────────────────────');
    
    for (let i = 0; i < pack.length; i++) {
        const aug = pack[i];
        const idx = String(i + 1).padStart(2);
        const status = purchased.includes(aug.name) ? '✅' : '⏳';
        const name = aug.name.substring(0, 42).padEnd(42);
        const faction = aug.faction.substring(0, 20).padEnd(20);
        const costWithMult = aug.price * Math.pow(MULTIPLIER, i);
        const cost = `$${ns.formatNumber(costWithMult)}`.padStart(13);
        const rep = ns.formatNumber(aug.rep).padStart(8);
        
        ns.print(`${idx}. ${status}  ${name} ${faction} ${cost}  ${rep}`);
    }
    
    ns.print('─────────────────────────────────────────────────────────────────────────────────');
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('REP REQUISE PAR FACTION');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sortedFactions = Array.from(repByFaction.entries())
        .sort((a, b) => b[1] - a[1]);
    
    for (const [faction, rep] of sortedFactions) {
        ns.print(`  • ${faction}: ${ns.formatNumber(rep)}`);
    }
    
    ns.print('');
    ns.print('COMMANDES:');
    ns.print('  run aug-speedrun.js mark <nom>     → Marquer comme acheté');
    ns.print('  run aug-speedrun.js unmark <nom>   → Démarquer');
    ns.print('');
    ns.print('⚠️  IMPORTANT: Acheter dans l\'ordre exact (multiplicateur 1.9x)');
}
