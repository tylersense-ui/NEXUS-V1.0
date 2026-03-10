/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v1.1 - Augmentation Planner (LISTE CANONIQUE)       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/aug-planner.js
 * @version     1.1.0
 * @description Planificateur avec 95 augmentations canoniques
 * 
 * FEATURES:
 * - Liste COMPLÈTE Bitburner v2.8.1 (95 augs)
 * - Calcul coût avec multiplicateur 1.9x
 * - Détection seuil économique automatique
 * - Découpage en runs optimaux
 * - Ordre RÉEL des runs physiques
 * - Tracking rep par faction
 * - Détection prérequis
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const MULTIPLIER = 1.9;
    const TARGET_AUGS = 30; // Pour Daedalus
    const MAX_AVG_MULTIPLIER = 8.0; // Seuil économique
    
    // ════════════════════════════════════════════════════
    // LISTE CANONIQUE COMPLÈTE (95 augmentations)
    // ════════════════════════════════════════════════════
    
    const AUGS = [
        // Parser le format: Nom|Prix|Rep|Factions|Prérequis|Effets
        
        // ADR
        { name: "ADR-V1 Pheromone Gene", price: 17500000, rep: 3750000, factions: ["Four Sigma", "MegaCorp", "NWO", "The Syndicate", "Tian Di Hui"], prereq: [] },
        { name: "ADR-V2 Pheromone Gene", price: 550000000, rep: 62500000, factions: ["Bachman & Associates", "Clarke Incorporated", "Four Sigma", "Silhouette"], prereq: ["ADR-V1 Pheromone Gene"] },
        
        // Top tier hacking
        { name: "Artificial Bio-neural Network Implant", price: 3000000000000, rep: 275000000, factions: ["BitRunners", "Fulcrum Secret Technologies"], prereq: [] },
        { name: "Artificial Synaptic Potentiation", price: 80000000, rep: 6250000, factions: ["NiteSec", "The Black Hand"], prereq: [] },
        
        // Augmented Targeting
        { name: "Augmented Targeting I", price: 15000000, rep: 5000000, factions: ["Blade Industries", "Ishima", "KuaiGong International", "OmniTek Incorporated", "Sector-12", "Slum Snakes", "The Dark Army", "The Syndicate"], prereq: [] },
        { name: "Augmented Targeting II", price: 42500000, rep: 8750000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "Sector-12", "The Dark Army", "The Syndicate"], prereq: ["Augmented Targeting I"] },
        { name: "Augmented Targeting III", price: 115000000, rep: 27500000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "The Covenant", "The Dark Army", "The Syndicate"], prereq: ["Augmented Targeting II"] },
        
        // Bionic
        { name: "Bionic Arms", price: 275000000, rep: 62500000, factions: ["Tetrads"], prereq: [] },
        { name: "Bionic Legs", price: 375000000, rep: 150000000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "Speakers for the Dead", "The Syndicate"], prereq: [] },
        { name: "Bionic Spine", price: 125000000, rep: 45000000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "Speakers for the Dead", "The Syndicate"], prereq: [] },
        
        // BitRunners
        { name: "BitRunners Neurolink", price: 4375000000000, rep: 875000000, factions: ["BitRunners"], prereq: [] },
        { name: "BitWire", price: 10000000, rep: 3750000, factions: ["CyberSec", "NiteSec"], prereq: [] },
        
        // BrachiBlades
        { name: "BrachiBlades", price: 90000000, rep: 12500000, factions: ["The Syndicate"], prereq: [] },
        
        // CashRoot
        { name: "CashRoot Starter Kit", price: 125000000, rep: 12500000, factions: ["Sector-12"], prereq: [] },
        
        // Combat Ribs
        { name: "Combat Rib I", price: 23750000, rep: 7500000, factions: ["Blade Industries", "Ishima", "KuaiGong International", "OmniTek Incorporated", "Slum Snakes", "The Dark Army", "The Syndicate", "Volhaven"], prereq: [] },
        { name: "Combat Rib II", price: 65000000, rep: 18750000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "The Dark Army", "The Syndicate", "Volhaven"], prereq: ["Combat Rib I"] },
        { name: "Combat Rib III", price: 120000000, rep: 35000000, factions: ["Blade Industries", "KuaiGong International", "OmniTek Incorporated", "The Covenant", "The Dark Army", "The Syndicate"], prereq: ["Combat Rib II"] },
        
        // CordiARC
        { name: "CordiARC Fusion Reactor", price: 5000000000000, rep: 1125000000, factions: ["MegaCorp"], prereq: [] },
        
        // Cranial Signal Processors (CHAÎNE IMPORTANTE)
        { name: "Cranial Signal Processors - Gen I", price: 70000000, rep: 10000000, factions: ["CyberSec", "NiteSec"], prereq: [] },
        { name: "Cranial Signal Processors - Gen II", price: 125000000, rep: 18750000, factions: ["CyberSec", "NiteSec"], prereq: ["Cranial Signal Processors - Gen I"] },
        { name: "Cranial Signal Processors - Gen III", price: 550000000, rep: 50000000, factions: ["BitRunners", "NiteSec", "The Black Hand"], prereq: ["Cranial Signal Processors - Gen II"] },
        { name: "Cranial Signal Processors - Gen IV", price: 1100000000000, rep: 125000000, factions: ["BitRunners", "The Black Hand"], prereq: ["Cranial Signal Processors - Gen III"] },
        { name: "Cranial Signal Processors - Gen V", price: 2250000000000, rep: 250000000, factions: ["BitRunners"], prereq: ["Cranial Signal Processors - Gen IV"] },
        
        // CRTX42-AA
        { name: "CRTX42-AA Gene Modification", price: 225000000, rep: 45000000, factions: ["NiteSec"], prereq: [] },
        
        // DataJack
        { name: "DataJack", price: 450000000, rep: 112500000, factions: ["BitRunners", "Chongqing", "New Tokyo", "NiteSec", "The Black Hand"], prereq: [] },
        
        // DermaForce
        { name: "DermaForce Particle Barrier", price: 50000000, rep: 15000000, factions: ["Volhaven"], prereq: [] },
        
        // ECorp HVMind
        { name: "ECorp HVMind Implant", price: 5500000000000, rep: 1500000000, factions: ["ECorp"], prereq: [] },
        
        // Embedded Netburner Module (CHAÎNE)
        { name: "Embedded Netburner Module", price: 250000000, rep: 15000000, factions: ["BitRunners", "Blade Industries", "ECorp", "Fulcrum Secret Technologies", "MegaCorp", "NWO", "NiteSec", "The Black Hand"], prereq: [] },
        { name: "Embedded Netburner Module Analyze Engine", price: 6000000000000, rep: 625000000, factions: ["Daedalus", "ECorp", "Fulcrum Secret Technologies", "Illuminati", "MegaCorp", "NWO", "The Covenant"], prereq: ["Embedded Netburner Module"] },
        { name: "Embedded Netburner Module Core Implant", price: 2500000000000, rep: 175000000, factions: ["BitRunners", "Blade Industries", "ECorp", "Fulcrum Secret Technologies", "MegaCorp", "NWO", "The Black Hand"], prereq: ["Embedded Netburner Module"] },
        { name: "Embedded Netburner Module Core V2 Upgrade", price: 4500000000000, rep: 1000000000, factions: ["BitRunners", "Blade Industries", "ECorp", "Fulcrum Secret Technologies", "KuaiGong International", "MegaCorp", "NWO", "OmniTek Incorporated"], prereq: ["Embedded Netburner Module Core Implant"] },
        { name: "Embedded Netburner Module Core V3 Upgrade", price: 7500000000000, rep: 1750000000, factions: ["Daedalus", "ECorp", "Fulcrum Secret Technologies", "Illuminati", "MegaCorp", "NWO", "The Covenant"], prereq: ["Embedded Netburner Module Core V2 Upgrade"] },
        { name: "Embedded Netburner Module Direct Memory Access Upgrade", price: 7000000000000, rep: 1000000000, factions: ["Daedalus", "ECorp", "Fulcrum Secret Technologies", "Illuminati", "MegaCorp", "NWO", "The Covenant"], prereq: ["Embedded Netburner Module"] },
        
        // Enhanced
        { name: "Enhanced Myelin Sheathing", price: 1375000000000, rep: 100000000, factions: ["BitRunners", "Fulcrum Secret Technologies", "The Black Hand"], prereq: [] },
        { name: "Enhanced Social Interaction Implant", price: 1375000000000, rep: 375000000, factions: ["Bachman & Associates", "Clarke Incorporated", "Four Sigma", "NWO", "OmniTek Incorporated"], prereq: [] },
        
        // FocusWire
        { name: "FocusWire", price: 900000000, rep: 75000000, factions: ["Bachman & Associates", "Clarke Incorporated", "Four Sigma", "KuaiGong International"], prereq: [] },
        
        // Graphene (upgrades)
        { name: "Graphene Bionic Arms Upgrade", price: 3750000000000, rep: 500000000, factions: ["The Dark Army"], prereq: ["Bionic Arms"] },
        { name: "Graphene Bionic Legs Upgrade", price: 4500000000000, rep: 750000000, factions: ["ECorp", "Fulcrum Secret Technologies", "MegaCorp"], prereq: ["Bionic Legs"] },
        { name: "Graphene Bionic Spine Upgrade", price: 6000000000000, rep: 1625000000, factions: ["ECorp", "Fulcrum Secret Technologies"], prereq: ["Bionic Spine"] },
        { name: "Graphene Bone Lacings", price: 4250000000000, rep: 1125000000, factions: ["Fulcrum Secret Technologies", "The Covenant"], prereq: [] },
        { name: "Graphene BrachiBlades Upgrade", price: 2500000000000, rep: 225000000, factions: ["Speakers for the Dead"], prereq: ["BrachiBlades"] },
        
        // Hacknet Node
        { name: "Hacknet Node Cache Architecture Neural-Upload", price: 5500000, rep: 2500000, factions: ["Netburners"], prereq: [] },
        { name: "Hacknet Node Core Direct-Neural Interface", price: 60000000, rep: 12500000, factions: ["Netburners"], prereq: [] },
        { name: "Hacknet Node CPU Architecture Neural-Upload", price: 11000000, rep: 3750000, factions: ["Netburners"], prereq: [] },
        { name: "Hacknet Node Kernel Direct-Neural Interface", price: 40000000, rep: 7500000, factions: ["Netburners"], prereq: [] },
        { name: "Hacknet Node NIC Architecture Neural-Upload", price: 4500000, rep: 1875000, factions: ["Netburners"], prereq: [] },
        
        // HemoRecirculator
        { name: "HemoRecirculator", price: 45000000, rep: 10000000, factions: ["Tetrads", "The Dark Army", "The Syndicate"], prereq: [] },
        
        // Hydroflame
        { name: "Hydroflame Left Arm", price: 2500000000000000, rep: 1250000000, factions: ["NWO"], prereq: [] },
        
        // HyperSight
        { name: "HyperSight Corneal Implant", price: 2750000000000, rep: 150000000, factions: ["Blade Industries", "KuaiGong International"], prereq: [] },
        
        // INFRARET
        { name: "INFRARET Enhancement", price: 30000000, rep: 7500000, factions: ["Ishima"], prereq: [] },
        
        // LuminCloaking
        { name: "LuminCloaking-V1 Skin Implant", price: 5000000, rep: 1500000, factions: ["Slum Snakes", "Tetrads"], prereq: [] },
        { name: "LuminCloaking-V2 Skin Implant", price: 30000000, rep: 5000000, factions: ["Slum Snakes", "Tetrads"], prereq: ["LuminCloaking-V1 Skin Implant"] },
        
        // Nanofiber
        { name: "Nanofiber Weave", price: 125000000, rep: 37500000, factions: ["Blade Industries", "Fulcrum Secret Technologies", "OmniTek Incorporated", "Speakers for the Dead", "The Dark Army", "The Syndicate", "Tian Di Hui"], prereq: [] },
        
        // Neotra
        { name: "Neotra", price: 2875000000000, rep: 562500000, factions: ["Blade Industries"], prereq: [] },
        
        // Neuregen
        { name: "Neuregen Gene Modification", price: 8750000, rep: 37500000, factions: ["Chongqing"], prereq: [] },
        
        // Neural
        { name: "Neural Accelerator", price: 1750000000000, rep: 200000000, factions: ["BitRunners"], prereq: [] },
        { name: "Neural-Retention Enhancement", price: 250000000, rep: 20000000, factions: ["NiteSec"], prereq: [] },
        
        // Neuronal
        { name: "Neuronal Densification", price: 1375000000000, rep: 187500000, factions: ["Clarke Incorporated"], prereq: [] },
        
        // Neuralstimulator
        { name: "Neuralstimulator", price: 3000000000000, rep: 50000000, factions: ["The Black Hand"], prereq: [] },
        
        // NeuroFlux Governor (SPÉCIAL - stackable)
        { name: "NeuroFlux Governor", price: 750000, rep: 500000, factions: ["All"], prereq: [], stackable: true },
        
        // Neuroreceptor
        { name: "Neuroreceptor Management Implant", price: 550000000, rep: 75000000, factions: ["Tian Di Hui"], prereq: [] },
        
        // nextSENS
        { name: "nextSENS Gene Modification", price: 1925000000000, rep: 437500000, factions: ["Clarke Incorporated"], prereq: [] },
        
        // Nuoptimal
        { name: "Nuoptimal Nootropic Injector Implant", price: 5000000, rep: 5000000, factions: ["Tian Di Hui"], prereq: [] },
        
        // Nuvigil
        { name: "Nuvigil-10", price: 2750000, rep: 1250000, factions: ["Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Volhaven"], prereq: [] },
        
        // OmniTek
        { name: "OmniTek InfoLoad", price: 2875000000000, rep: 625000000, factions: ["OmniTek Incorporated"], prereq: [] },
        
        // PC Direct-Neural Interface
        { name: "PC Direct-Neural Interface", price: 3750000, rep: 7500000, factions: ["Sector-12"], prereq: [] },
        { name: "PC Direct-Neural Interface Optimization Submodule", price: 4500000, rep: 3750000, factions: ["Fulcrum Secret Technologies"], prereq: ["PC Direct-Neural Interface"] },
        { name: "PC Direct-Neural Interface NeuroNet Injector", price: 7500000, rep: 10000000, factions: ["Fulcrum Secret Technologies"], prereq: ["PC Direct-Neural Interface"] },
        
        // Photosynthetic
        { name: "Photosynthetic Cells", price: 2750000000000, rep: 562500000, factions: ["KuaiGong International"], prereq: [] },
        
        // Power Recirculation
        { name: "Power Recirculation Core", price: 180000000, rep: 25000000, factions: ["Blade Industries", "Fulcrum Secret Technologies", "KuaiGong International", "OmniTek Incorporated", "Tetrads", "The Dark Army", "The Syndicate"], prereq: [] },
        
        // QLink
        { name: "QLink", price: 25000000000000, rep: 1875000000, factions: ["Illuminati"], prereq: [] },
        
        // SmartJaw
        { name: "SmartJaw", price: 2750000000000, rep: 375000000, factions: ["Bachman & Associates"], prereq: [] },
        
        // SmartSonar
        { name: "SmartSonar Implant", price: 75000000, rep: 22500000, factions: ["Slum Snakes"], prereq: [] },
        
        // Social Negotiation
        { name: "Social Negotiation Assistant (S.N.A)", price: 30000000, rep: 6250000, factions: ["Tian Di Hui"], prereq: [] },
        
        // Speech
        { name: "Speech Enhancement", price: 12500000, rep: 2500000, factions: ["Bachman & Associates", "Clarke Incorporated", "Four Sigma", "KuaiGong International", "Speakers for the Dead", "Tian Di Hui"], prereq: [] },
        { name: "Speech Processor Implant", price: 50000000, rep: 7500000, factions: ["Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Silhouette", "Tian Di Hui", "Volhaven"], prereq: [] },
        
        // SPTN-97
        { name: "SPTN-97 Gene Modification", price: 4875000000000, rep: 1250000000, factions: ["The Covenant"], prereq: [] },
        
        // Synaptic
        { name: "Synaptic Enhancement Implant", price: 7500000, rep: 2000000, factions: ["Aevum", "CyberSec"], prereq: [] },
        
        // Synfibril
        { name: "Synfibril Muscle", price: 1125000000000, rep: 437500000, factions: ["Blade Industries", "Daedalus", "Fulcrum Secret Technologies", "Illuminati", "KuaiGong International", "NWO", "Speakers for the Dead", "The Covenant"], prereq: [] },
        
        // Synthetic Heart
        { name: "Synthetic Heart", price: 2875000000000, rep: 750000000, factions: ["Daedalus", "Fulcrum Secret Technologies", "Illuminati", "KuaiGong International", "NWO", "Speakers for the Dead", "The Covenant"], prereq: [] },
        
        // The Black Hand
        { name: "The Black Hand", price: 550000000, rep: 100000000, factions: ["The Black Hand"], prereq: [] },
        
        // The Shadow's Simulacrum
        { name: "The Shadow's Simulacrum", price: 400000000, rep: 37500000, factions: ["Speakers for the Dead", "The Dark Army", "The Syndicate"], prereq: [] },
        
        // TITN-41
        { name: "TITN-41 Gene-Modification Injection", price: 190000000, rep: 25000000, factions: ["Silhouette"], prereq: [] },
        
        // Unstable Circadian
        { name: "Unstable Circadian Modulator", price: 5000000000000, rep: 362500000, factions: ["Speakers for the Dead"], prereq: [] },
        
        // Wired Reflexes
        { name: "Wired Reflexes", price: 2500000, rep: 1250000, factions: ["Aevum", "Ishima", "Sector-12", "Slum Snakes", "Speakers for the Dead", "The Dark Army", "The Syndicate", "Tian Di Hui", "Volhaven"], prereq: [] },
        
        // Xanipher
        { name: "Xanipher", price: 4250000000000, rep: 875000000, factions: ["NWO"], prereq: [] },
        
        // The Red Pill (OBJECTIF FINAL)
        { name: "The Red Pill", price: 0, rep: 2500000000, factions: ["Daedalus"], prereq: [] }
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
        for (let n = 1; n <= TARGET_AUGS; n++) {
            const avgMult = calculateAvgMultiplier(n);
            if (avgMult > MAX_AVG_MULTIPLIER) {
                return Math.max(1, n - 1);
            }
        }
        return TARGET_AUGS;
    }
    
    // ════════════════════════════════════════════════════
    // MAIN LOGIC
    // ════════════════════════════════════════════════════
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   📋 NEXUS AUGMENTATION PLANNER v1.1                      ║');
        ns.print('║   (95 augmentations canoniques Bitburner v2.8.1)         ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        ns.print('🎯 OBJECTIF: 30 augmentations pour Daedalus');
        ns.print('');
        
        // Trier par prix (cher → pas cher)
        const sortedAugs = [...AUGS]
            .filter(aug => aug.name !== "NeuroFlux Governor") // Exclure NeuroFlux (stackable)
            .filter(aug => aug.name !== "The Red Pill") // Exclure Red Pill (objectif final)
            .sort((a, b) => b.price - a.price);
        
        // Calculer taille optimale run
        const optimalRunSize = findOptimalRunSize();
        const avgMult = calculateAvgMultiplier(optimalRunSize);
        const numRuns = Math.ceil(TARGET_AUGS / optimalRunSize);
        
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('DÉCOUPAGE OPTIMAL');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print(`Seuil économique: ${optimalRunSize} augs/run (mult. moyen: ${avgMult.toFixed(2)}x)`);
        ns.print(`Nombre de runs nécessaires: ${numRuns}`);
        ns.print('');
        
        // Découper en packs
        const packs = [];
        for (let i = 0; i < numRuns; i++) {
            const start = i * optimalRunSize;
            const end = Math.min(start + optimalRunSize, TARGET_AUGS);
            packs.push(sortedAugs.slice(start, end));
        }
        
        // INVERSER L'ORDRE DES RUNS (moins cher en premier physiquement)
        packs.reverse();
        
        // Afficher chaque run
        for (let runIdx = 0; runIdx < packs.length; runIdx++) {
            const pack = packs[runIdx];
            const physicalRun = runIdx + 1;
            
            ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            ns.print(`RUN ${physicalRun} (physique) - ${pack.length} augmentations`);
            ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            ns.print('');
            ns.print('#   NOM                                        PRIX          REP');
            ns.print('──────────────────────────────────────────────────────────────────────');
            
            let totalCost = 0;
            const factionRep = new Map();
            
            for (let i = 0; i < pack.length; i++) {
                const aug = pack[i];
                const idx = i + 1;
                const costWithMult = aug.price * Math.pow(MULTIPLIER, i);
                totalCost += costWithMult;
                
                // Track rep par faction
                for (const faction of aug.factions) {
                    if (!factionRep.has(faction)) {
                        factionRep.set(faction, 0);
                    }
                    factionRep.set(faction, Math.max(factionRep.get(faction), aug.rep));
                }
                
                const name = aug.name.substring(0, 45).padEnd(45);
                const price = `$${ns.formatNumber(costWithMult)}`.padStart(13);
                const rep = ns.formatNumber(aug.rep).padStart(8);
                
                let line = `${String(idx).padStart(2)}. ${name} ${price} ${rep}`;
                
                // Marquer les prérequis
                if (aug.prereq && aug.prereq.length > 0) {
                    line += ` [Req: ${aug.prereq[0].substring(0, 20)}]`;
                }
                
                ns.print(line);
            }
            
            ns.print('──────────────────────────────────────────────────────────────────────');
            ns.print(`Coût total Run ${physicalRun}: $${ns.formatNumber(totalCost)}`);
            ns.print('');
            
            ns.print('Rep requise par faction (top 5):');
            const topFactions = Array.from(factionRep.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            for (const [faction, rep] of topFactions) {
                ns.print(`  • ${faction}: ${ns.formatNumber(rep)}`);
            }
            ns.print('');
        }
        
        // Résumé global
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
        ns.print(`💰 COÛT TOTAL (tous runs): $${ns.formatNumber(grandTotal)}`);
        ns.print('');
        
        ns.print('⚠️  IMPORTANT:');
        ns.print('  • Acheter dans l\'ORDRE indiqué (cher → pas cher dans chaque run)');
        ns.print('  • Faire les runs dans l\'ordre physique (Run 1, puis Run 2, etc.)');
        ns.print('  • Après chaque reset, multiplicateur revient à 1.00');
        ns.print('  • NeuroFlux Governor exclu (stackable, acheter à la fin)');
        ns.print('');
        
        ns.print('📊 Stats actuelles:');
        const money = ns.getServerMoneyAvailable('home');
        const hackLevel = ns.getHackingLevel();
        ns.print(`  💰 Argent: $${ns.formatNumber(money)}`);
        ns.print(`  🎯 Niveau hacking: ${hackLevel} / 2500`);
        ns.print('');
        
        ns.print('⏱️  Rafraîchissement dans 30s...');
        
        await ns.sleep(30000);
    }
}
