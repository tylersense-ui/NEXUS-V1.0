/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v1.3 - Aug Planner (91 AUGS + TRACKING)             ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/aug-planner.js
 * @version     1.3.0
 * @description Planificateur complet avec tracking manuel
 * 
 * USAGE:
 * run aug-planner.js                  → Vue d'ensemble
 * run aug-planner.js mark BitWire     → Marquer comme acheté
 * run aug-planner.js unmark BitWire   → Démarquer
 * run aug-planner.js reset            → Reset tracking
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    const TRACKING_FILE = '/state/augs-purchased.txt';
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
    // COMMANDES
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
    
    // ════════════════════════════════════════════════════
    // TAIL VIEW
    // ════════════════════════════════════════════════════
    
    ns.tail();
    
    const MULTIPLIER = 1.9;
    
    // Liste complète des 91 augs (triées par prix décroissant)
    const ALL_AUGS = [
        { name: "Hydroflame Left Arm", price: 2500000000000000, rep: 1250000000 },
        { name: "QLink", price: 25000000000000, rep: 1875000000 },
        { name: "Embedded Netburner Module Core V3 Upgrade", price: 7500000000000, rep: 1750000000 },
        { name: "Embedded Netburner Module Direct Memory Access Upgrade", price: 7000000000000, rep: 1000000000 },
        { name: "Graphene Bionic Spine Upgrade", price: 6000000000000, rep: 1625000000 },
        { name: "Embedded Netburner Module Analyze Engine", price: 6000000000000, rep: 625000000 },
        { name: "ECorp HVMind Implant", price: 5500000000000, rep: 1500000000 },
        { name: "Unstable Circadian Modulator", price: 5000000000000, rep: 362500000 },
        { name: "CordiARC Fusion Reactor", price: 5000000000000, rep: 1125000000 },
        { name: "SPTN-97 Gene Modification", price: 4875000000000, rep: 1250000000 },
        { name: "Embedded Netburner Module Core V2 Upgrade", price: 4500000000000, rep: 1000000000 },
        { name: "Graphene Bionic Legs Upgrade", price: 4500000000000, rep: 750000000 },
        { name: "BitRunners Neurolink", price: 4375000000000, rep: 875000000 },
        { name: "Graphene Bone Lacings", price: 4250000000000, rep: 1125000000 },
        { name: "Xanipher", price: 4250000000000, rep: 875000000 },
        { name: "Graphene Bionic Arms Upgrade", price: 3750000000000, rep: 500000000 },
        { name: "Artificial Bio-neural Network Implant", price: 3000000000000, rep: 275000000 },
        { name: "Neuralstimulator", price: 3000000000000, rep: 50000000 },
        { name: "Neotra", price: 2875000000000, rep: 562500000 },
        { name: "Synthetic Heart", price: 2875000000000, rep: 750000000 },
        { name: "OmniTek InfoLoad", price: 2875000000000, rep: 625000000 },
        { name: "SmartJaw", price: 2750000000000, rep: 375000000 },
        { name: "HyperSight Corneal Implant", price: 2750000000000, rep: 150000000 },
        { name: "Photosynthetic Cells", price: 2750000000000, rep: 562500000 },
        { name: "Embedded Netburner Module Core Implant", price: 2500000000000, rep: 175000000 },
        { name: "Graphene BrachiBlades Upgrade", price: 2500000000000, rep: 225000000 },
        { name: "Cranial Signal Processors - Gen V", price: 2250000000000, rep: 250000000 },
        { name: "nextSENS Gene Modification", price: 1925000000000, rep: 437500000 },
        { name: "Neural Accelerator", price: 1750000000000, rep: 200000000 },
        { name: "Enhanced Myelin Sheathing", price: 1375000000000, rep: 100000000 },
        { name: "Enhanced Social Interaction Implant", price: 1375000000000, rep: 375000000 },
        { name: "Neuronal Densification", price: 1375000000000, rep: 187500000 },
        { name: "Synfibril Muscle", price: 1125000000000, rep: 437500000 },
        { name: "Cranial Signal Processors - Gen IV", price: 1100000000000, rep: 125000000 },
        { name: "FocusWire", price: 900000000, rep: 75000000 },
        { name: "ADR-V2 Pheromone Gene", price: 550000000, rep: 62500000 },
        { name: "Cranial Signal Processors - Gen III", price: 550000000, rep: 50000000 },
        { name: "Neuroreceptor Management Implant", price: 550000000, rep: 75000000 },
        { name: "The Black Hand", price: 550000000, rep: 100000000 },
        { name: "DataJack", price: 450000000, rep: 112500000 },
        { name: "The Shadow's Simulacrum", price: 400000000, rep: 37500000 },
        { name: "Bionic Legs", price: 375000000, rep: 150000000 },
        { name: "Bionic Arms", price: 275000000, rep: 62500000 },
        { name: "Embedded Netburner Module", price: 250000000, rep: 15000000 },
        { name: "Neural-Retention Enhancement", price: 250000000, rep: 20000000 },
        { name: "CRTX42-AA Gene Modification", price: 225000000, rep: 45000000 },
        { name: "TITN-41 Gene-Modification Injection", price: 190000000, rep: 25000000 },
        { name: "Power Recirculation Core", price: 180000000, rep: 25000000 },
        { name: "Nanofiber Weave", price: 125000000, rep: 37500000 },
        { name: "Cranial Signal Processors - Gen II", price: 125000000, rep: 18750000 },
        { name: "Bionic Spine", price: 125000000, rep: 45000000 },
        { name: "CashRoot Starter Kit", price: 125000000, rep: 12500000 },
        { name: "Combat Rib III", price: 120000000, rep: 35000000 },
        { name: "Augmented Targeting III", price: 115000000, rep: 27500000 },
        { name: "BrachiBlades", price: 90000000, rep: 12500000 },
        { name: "Artificial Synaptic Potentiation", price: 80000000, rep: 6250000 },
        { name: "SmartSonar Implant", price: 75000000, rep: 22500000 },
        { name: "Cranial Signal Processors - Gen I", price: 70000000, rep: 10000000 },
        { name: "Combat Rib II", price: 65000000, rep: 18750000 },
        { name: "Hacknet Node Core Direct-Neural Interface", price: 60000000, rep: 12500000 },
        { name: "Speech Processor Implant", price: 50000000, rep: 7500000 },
        { name: "DermaForce Particle Barrier", price: 50000000, rep: 15000000 },
        { name: "HemoRecirculator", price: 45000000, rep: 10000000 },
        { name: "Augmented Targeting II", price: 42500000, rep: 8750000 },
        { name: "Hacknet Node Kernel Direct-Neural Interface", price: 40000000, rep: 7500000 },
        { name: "INFRARET Enhancement", price: 30000000, rep: 7500000 },
        { name: "LuminCloaking-V2 Skin Implant", price: 30000000, rep: 5000000 },
        { name: "Social Negotiation Assistant (S.N.A)", price: 30000000, rep: 6250000 },
        { name: "Combat Rib I", price: 23750000, rep: 7500000 },
        { name: "ADR-V1 Pheromone Gene", price: 17500000, rep: 3750000 },
        { name: "Augmented Targeting I", price: 15000000, rep: 5000000 },
        { name: "Speech Enhancement", price: 12500000, rep: 2500000 },
        { name: "Hacknet Node CPU Architecture Neural-Upload", price: 11000000, rep: 3750000 },
        { name: "BitWire", price: 10000000, rep: 3750000 },
        { name: "Neuregen Gene Modification", price: 8750000, rep: 37500000 },
        { name: "Synaptic Enhancement Implant", price: 7500000, rep: 2000000 },
        { name: "PC Direct-Neural Interface NeuroNet Injector", price: 7500000, rep: 10000000 },
        { name: "Hacknet Node Cache Architecture Neural-Upload", price: 5500000, rep: 2500000 },
        { name: "LuminCloaking-V1 Skin Implant", price: 5000000, rep: 1500000 },
        { name: "Nuoptimal Nootropic Injector Implant", price: 5000000, rep: 5000000 },
        { name: "Hacknet Node NIC Architecture Neural-Upload", price: 4500000, rep: 1875000 },
        { name: "PC Direct-Neural Interface Optimization Submodule", price: 4500000, rep: 3750000 },
        { name: "PC Direct-Neural Interface", price: 3750000, rep: 7500000 },
        { name: "Nuvigil-10", price: 2750000, rep: 1250000 },
        { name: "Wired Reflexes", price: 2500000, rep: 1250000 }
    ];
    
    // ════════════════════════════════════════════════════
    // MAIN DISPLAY
    // ════════════════════════════════════════════════════
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   📋 AUG PLANNER v1.3 (91 AUGS + TRACKING)                ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const purchased = tracking.purchased || [];
        const remaining = ALL_AUGS.filter(a => !purchased.includes(a.name));
        
        ns.print(`✅ Achetées: ${purchased.length}`);
        ns.print(`⏳ Restantes: ${remaining.length} / 91`);
        ns.print('');
        
        // Découpage : 1 run de 11 + 9 runs de 10
        const packs = [];
        packs.push(remaining.slice(0, 11)); // Run 1 = 11 augs
        for (let i = 1; i < 10; i++) {
            const start = 11 + (i - 1) * 10;
            const end = start + 10;
            packs.push(remaining.slice(start, Math.min(end, remaining.length)));
        }
        
        // Afficher sommaire
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
        ns.print(`💰 COÛT TOTAL: $${ns.formatNumber(grandTotal)}`);
        ns.print('');
        
        ns.print('COMMANDES:');
        ns.print('  run aug-planner.js mark <nom>      → Marquer comme acheté');
        ns.print('  run aug-planner.js unmark <nom>    → Démarquer');
        ns.print('  run aug-planner.js reset           → Reset tracking');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        const percent = grandTotal > 0 ? (money / grandTotal) * 100 : 0;
        ns.print(`💰 Argent: $${ns.formatNumber(money)} (${percent.toFixed(1)}%)`);
        ns.print('');
        ns.print('⏱️  Rafraîchissement dans 30s...');
        
        await ns.sleep(30000);
    }
}
