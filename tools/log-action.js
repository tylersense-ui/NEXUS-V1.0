/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.1 - Operator Action Logger                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/log-action.js
 * @version     0.11.1
 * @description Logger actions manuelles de l'opérateur
 * 
 * USAGE:
 *   run /tools/log-action.js "Achat NeuroFlux x5 pour $500m"
 *   run /tools/log-action.js "Rejoint faction Daedalus"
 *   run /tools/log-action.js "Reset avec 30 augs"
 */

import { StateManager } from "/lib/state-manager.js";

/** @param {NS} ns */
export async function main(ns) {
    const stateMgr = new StateManager(ns);
    
    if (ns.args.length === 0) {
        ns.tprint("ERROR: Usage: run /tools/log-action.js \"Action description\"");
        return;
    }
    
    const action = ns.args.join(" ");
    
    // Charger historique existant
    let history = stateMgr.load("operator-actions.json");
    if (!history || !Array.isArray(history.actions)) {
        history = {
            actions: []
        };
    }
    
    // Ajouter nouvelle action
    const entry = {
        timestamp: new Date().toISOString(),
        action: action,
        money: ns.getServerMoneyAvailable("home"),
        hackingLevel: ns.getHackingLevel()
    };
    
    history.actions.push(entry);
    
    // Garder seulement les 100 dernières
    if (history.actions.length > 100) {
        history.actions = history.actions.slice(-100);
    }
    
    // Sauvegarder
    await stateMgr.save("operator-actions.json", history);
    
    ns.tprint(`✅ Action logged: ${action}`);
}
