/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.3-sigma                                 ║
 * ║ Module: Controller Pool                                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/controller-pool.js
 * @version     0.3.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Gère un pool de controllers HWGW.
 * 1 controller = 1 target.
 * Spawne/kill controllers dynamiquement selon les targets.
 * 
 * @usage
 * import { updateControllers } from '/core/controller-pool.js'
 * 
 * @dependencies
 * - /core/hwgw-controller.js
 * 
 * @ram
 * N/A (library)
 */

const CONTROLLER_SCRIPT = '/core/hwgw-controller.js';

/**
 * Met à jour le pool de controllers
 * @param {NS} ns 
 * @param {Array<string>} targets - Liste des targets actifs
 */
export function updateControllers(ns, targets) {
    // Trouver les controllers actuellement actifs
    const runningControllers = ns.ps('home').filter(p => 
        p.filename === CONTROLLER_SCRIPT
    );
    
    const runningTargets = runningControllers.map(p => p.args[0]);
    
    // Tuer les controllers pour targets non désirés
    for (const proc of runningControllers) {
        const target = proc.args[0];
        if (!targets.includes(target)) {
            ns.kill(proc.pid);
            ns.print(`[POOL] Killed controller for ${target}`);
        }
    }
    
    // Spawner nouveaux controllers
    for (const target of targets) {
        if (!runningTargets.includes(target)) {
            ns.exec(CONTROLLER_SCRIPT, 'home', 1, target);
            ns.print(`[POOL] Spawned controller for ${target}`);
        }
    }
}