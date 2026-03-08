/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: Orchestrator                                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /kernel/orchestrator.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Orchestrateur principal du système HWGW.
 * Coordonne la sélection des targets et le pool de controllers.
 * 
 * @usage
 * run /kernel/orchestrator.js
 * 
 * @dependencies
 * - /core/target-selector.js
 * - /core/controller-pool.js
 * 
 * @ram
 * 4.00GB (réservé sur home)
 */

import { selectTargets } from '/core/target-selector.js';
import { updateControllers } from '/core/controller-pool.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Orchestrator v0.3-sigma                              ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const CYCLE_TIME = 30000; // Re-évaluer targets toutes les 30s
    
    while (true) {
        // Sélectionner les meilleurs targets
        const targets = selectTargets(ns);
        
        ns.print(`[TARGETS] Selected ${targets.length} targets:`);
        for (const t of targets) {
            ns.print(`  • ${t}`);
        }
        ns.print('');
        
        // Mettre à jour le pool de controllers
        updateControllers(ns, targets);
        
        // Attendre avant prochaine réévaluation
        await ns.sleep(CYCLE_TIME);
    }
}