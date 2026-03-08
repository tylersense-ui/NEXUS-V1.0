/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('=== NEXUS v0.1-bootstrap ===');
    ns.print('Initialisation du framework...');
    
    // Créer l'architecture des dossiers
    const dirs = [
        '/core', '/lib', '/hack', '/managers', 
        '/tools', '/monitor', '/state'
    ];
    
    ns.print('\n[SETUP] Architecture initialisée');
    
    // Initialiser les fichiers d'état
    const initialState = {
        worldState: {
            version: '0.1',
            lastScan: 0,
            servers: [],
            rooted: []
        },
        strategyState: {
            phase: 'bootstrap',
            target: null,
            mode: 'early-game'
        },
        progressState: {
            bitnode: 1,
            money: 0,
            hackLevel: 1,
            startTime: Date.now()
        },
        telemetryState: {
            totalIncome: 0,
            hackSuccess: 0,
            hackFail: 0
        }
    };
    
    ns.write('/state/world-state.txt', JSON.stringify(initialState.worldState, null, 2), 'w');
    ns.write('/state/strategy-state.txt', JSON.stringify(initialState.strategyState, null, 2), 'w');
    ns.write('/state/progress-state.txt', JSON.stringify(initialState.progressState, null, 2), 'w');
    ns.write('/state/telemetry-state.txt', JSON.stringify(initialState.telemetryState, null, 2), 'w');
    
    ns.print('[SETUP] États initialisés');
    
    // Lancer le scan initial
    ns.print('\n[SCAN] Analyse du réseau...');
    await ns.sleep(500);
    ns.run('/lib/scanner.js');
    await ns.sleep(2000);
    
    // Lancer le gestionnaire de cibles
    ns.print('[DEPLOY] Démarrage du gestionnaire de cibles...');
    await ns.sleep(500);
    ns.run('/managers/target-manager.js');
    await ns.sleep(2000);
    
    // Lancer le monitoring
    ns.print('[MONITOR] Activation du monitoring...');
    await ns.sleep(500);
    ns.run('/monitor/status.js');
    
    ns.print('\n=== NEXUS OPÉRATIONNEL ===');
    ns.print('Framework initialisé avec succès');
    ns.print('Monitoring actif');
}