/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v1.0 - Aug Speedrun Planner (30 AUGS DAEDALUS)      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/aug-speedrun.js
 * @version     1.0.0
 * @description 30 augs minimum pour Daedalus (speedrun optimal)
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const MULTIPLIER = 1.9;
    const MAX_AVG_MULTIPLIER = 8.0;
    
    // ════════════════════════════════════════════════════
    // 30 AUGMENTATIONS SPEEDRUN (ordre optimal)
    // ════════════════════════════════════════════════════
    
    const SPEEDRUN_AUGS = [
        // ─────────────────────────────────────────────────
        // FACTIONS HACKING (20 augs) - OBLIGATOIRES
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
        { name: "Cranial Signal Processors - Gen I", price: 70000000, rep: 10000000, faction: "CyberSec" },
        { name: "BitWire", price: 10000000, rep: 3750000, faction: "CyberSec" },
        { name: "Synaptic Enhancement Implant", price: 7500000, rep: 2000000, faction: "CyberSec" },
        
        // ─────────────────────────────────────────────────
        // FACTIONS FACILES (10 augs) - SPEEDRUN
        // ─────────────────────────────────────────────────
        
        // Netburners (5 augs - facile avec hacknet)
        { name: "Hacknet Node Core Direct-Neural Interface", price: 60000000, rep: 12500000, faction: "Netburners" },
        { name: "Hacknet Node Kernel Direct-Neural Interface", price: 40000000, rep: 7500000, faction: "Netburners" },
        { name: "Hacknet Node CPU Architecture Neural-Upload", price: 11000000, rep: 3750000, faction: "Netburners" },
        { name: "Hacknet Node Cache Architecture Neural-Upload", price: 5500000, rep: 2500000, faction: "Netburners" },
        { name: "Hacknet Node NIC Architecture Neural-Upload", price: 4500000, rep: 1875000, faction: "Netburners" },
        
        // Tian Di Hui (3 augs - early city faction)
        { name: "Social Negotiation Assistant (S.N.A)", price: 30000000, rep: 6250000, faction: "Tian Di Hui" },
        { name: "Speech Enhancement", price: 12500000, rep: 2500000, faction: "Tian Di Hui" },
        { name: "Nuoptimal Nootropic Injector Implant", price: 5000000, rep: 5000000, faction: "Tian Di Hui" },
        
        // City factions (2 augs)
        { name: "PC Direct-Neural Interface", price: 3750000, rep: 7500000, faction: "Sector-12" },
        { name: "Wired Reflexes", price: 2500000, rep: 1250000, faction: "Aevum" }
    ];
    
    // ════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ════════════════════════════════════════════════════
    
    function calculateTotalCost(basePrice, numAugs) {
        return basePrice * (Math.pow(MULTIPLIER, numAugs) - 1) / 0.9;
    }
    
    function calculateAvgMultiplier(numAugs) {
        const totalCost = calculateTotalCost(1, numAugs);
        return totalCost / numAugs;
    }
    
    function findOptimalRunSize() {
        for (let n = 1; n <= 30; n++) {
            const avgMult = calculateAvgMultiplier(n);
            if (avgMult > MAX_AVG_MULTIPLIER) {
                return Math.max(1, n - 1);
            }
        }
        return 30;
    }
    
    // ════════════════════════════════════════════════════
    // MAIN LOGIC
    // ════════════════════════════════════════════════════
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   🏃 NEXUS SPEEDRUN PLANNER v1.0                          ║');
        ns.print('║   30 augmentations pour Daedalus (optimisé)              ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        ns.print('🎯 OBJECTIF: 30 augs minimum + $100B + 2500 hacking');
        ns.print('');
        
        // Trier par prix (cher → pas cher)
        const sorted = [...SPEEDRUN_AUGS].sort((a, b) => b.price - a.price);
        
        // Calculer découpage optimal
        const optimalRunSize = findOptimalRunSize();
        const avgMult = calculateAvgMultiplier(optimalRunSize);
        const numRuns = Math.ceil(30 / optimalRunSize);
        
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('DÉCOUPAGE OPTIMAL');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print(`Seuil économique: ${optimalRunSize} augs/run (mult. moyen: ${avgMult.toFixed(2)}x)`);
        ns.print(`Nombre de runs: ${numRuns}`);
        ns.print('');
        
        // Découper en packs
        const packs = [];
        for (let i = 0; i < numRuns; i++) {
            const start = i * optimalRunSize;
            const end = Math.min(start + optimalRunSize, 30);
            packs.push(sorted.slice(start, end));
        }
        
        // INVERSER (moins cher d'abord)
        packs.reverse();
        
        // Afficher chaque run
        for (let runIdx = 0; runIdx < packs.length; runIdx++) {
            const pack = packs[runIdx];
            const physicalRun = runIdx + 1;
            
            ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            ns.print(`RUN ${physicalRun} (physique) - ${pack.length} augmentations`);
            ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            ns.print('');
            ns.print('#   NOM                                        FACTION          PRIX          REP');
            ns.print('─────────────────────────────────────────────────────────────────────────────────────');
            
            let totalCost = 0;
            const factionRep = new Map();
            
            for (let i = 0; i < pack.length; i++) {
                const aug = pack[i];
                const idx = i + 1;
                const costWithMult = aug.price * Math.pow(MULTIPLIER, i);
                totalCost += costWithMult;
                
                if (!factionRep.has(aug.faction)) {
                    factionRep.set(aug.faction, 0);
                }
                factionRep.set(aug.faction, Math.max(factionRep.get(aug.faction), aug.rep));
                
                const name = aug.name.substring(0, 45).padEnd(45);
                const faction = aug.faction.substring(0, 15).padEnd(15);
                const price = `$${ns.formatNumber(costWithMult)}`.padStart(13);
                const rep = ns.formatNumber(aug.rep).padStart(8);
                
                ns.print(`${String(idx).padStart(2)}. ${name} ${faction} ${price} ${rep}`);
            }
            
            ns.print('─────────────────────────────────────────────────────────────────────────────────────');
            ns.print(`Coût total Run ${physicalRun}: $${ns.formatNumber(totalCost)}`);
            ns.print('');
            
            ns.print('Rep requise par faction:');
            for (const [faction, rep] of Array.from(factionRep.entries()).sort((a, b) => b[1] - a[1])) {
                ns.print(`  • ${faction}: ${ns.formatNumber(rep)}`);
            }
            ns.print('');
        }
        
        // Résumé
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('RÉSUMÉ GLOBAL');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        let grandTotal = 0;
        for (let runIdx = 0; runIdx < packs.length; runIdx++) {
            const pack = packs[runIdx];
            let runCost = 0;
            for (let i = 0; i < pack.length; i++) {
                runCost += pack[i].price * Math.pow(MULTIPLIER, i);
            }
            grandTotal += runCost;
            ns.print(`Run ${runIdx + 1}: $${ns.formatNumber(runCost)}`);
        }
        
        ns.print('');
        ns.print(`💰 COÛT TOTAL: $${ns.formatNumber(grandTotal)}`);
        ns.print('');
        
        ns.print('📋 ROADMAP FACTIONS:');
        ns.print('  1. CyberSec (backdoor CSEC) - 4 augs');
        ns.print('  2. NiteSec (backdoor avmnite-02h) - +5 augs');
        ns.print('  3. The Black Hand (backdoor I.I.I.I) - +6 augs');
        ns.print('  4. BitRunners (backdoor run4theh111z) - +5 augs');
        ns.print('  5. Netburners (hacknet nodes) - +5 augs');
        ns.print('  6. Tian Di Hui (early city) - +3 augs');
        ns.print('  7. Sector-12 + Aevum (cities) - +2 augs');
        ns.print('  → TOTAL: 30 augs → Daedalus');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        const hackLevel = ns.getHackingLevel();
        
        ns.print('📊 Progression actuelle:');
        ns.print(`  💰 Argent: $${ns.formatNumber(money)} / $${ns.formatNumber(grandTotal + 100000000000)}`);
        ns.print(`  🎯 Hacking: ${hackLevel} / 2500`);
        ns.print('');
        
        ns.print('⏱️  Rafraîchissement dans 30s...');
        
        await ns.sleep(30000);
    }
}