/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Bootstrap                                          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/bootstrap.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Initialise le framework NEXUS complet.
 * Crée l'architecture des dossiers, initialise les états,
 * lance les managers et le monitoring.
 * 
 * @usage
 * run /core/bootstrap.js
 * 
 * @dependencies
 * - /lib/scanner.js
 * - /managers/target-manager.js
 * - /monitor/status.js
 * 
 * @ram
 * 2.40GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Framework v0.2-alpha                                 ║');
    ns.print('║ Bootstrap Sequence                                         ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    ns.print('[INIT] Initialisation du framework...');
    ns.print('');
    
    // Initialiser les fichiers d'état
    const initialState = {
        worldState: {
            version: '0.2.0',
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
    
    ns.print('[✓] États initialisés');
    
    // Lancer le scan initial
    ns.print('[SCAN] Analyse du réseau...');
    await ns.sleep(500);
    ns.run('/lib/scanner.js');
    await ns.sleep(2000);
    
    // Lancer le gestionnaire de cibles
    ns.print('[DEPLOY] Gestionnaire de cibles...');
    await ns.sleep(500);
    ns.run('/managers/target-manager.js');
    await ns.sleep(2000);
    
    // Lancer le monitoring
    ns.print('[MONITOR] Activation du monitoring...');
    await ns.sleep(500);
    ns.run('/monitor/status.js');
    
    ns.print('');
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS OPÉRATIONNEL                                         ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    ns.print('Framework initialisé avec succès');
    ns.print('Monitoring actif');
}