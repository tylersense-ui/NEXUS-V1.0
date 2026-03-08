/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Utilities                                          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/utils.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Bibliothèque d'utilitaires génériques :
 * - Lecture/écriture des états persistants
 * - Formatage de l'argent
 * - Formatage du temps
 * 
 * @usage
 * import { readState, writeState, formatMoney, formatTime } from '/lib/utils.js'
 * 
 * @ram
 * N/A (library)
 */

/**
 * Lit un fichier d'état
 * @param {NS} ns 
 * @param {string} stateName - Nom de l'état (world, strategy, progress, telemetry)
 * @returns {object|null} État parsé ou null si erreur
 */
export function readState(ns, stateName) {
    try {
        const data = ns.read(`/state/${stateName}-state.txt`);
        return JSON.parse(data);
    } catch {
        return null;
    }
}

/**
 * Écrit un fichier d'état
 * @param {NS} ns 
 * @param {string} stateName - Nom de l'état
 * @param {object} data - Données à écrire
 */
export function writeState(ns, stateName, data) {
    ns.write(`/state/${stateName}-state.txt`, JSON.stringify(data, null, 2), 'w');
}

/**
 * Formate un montant d'argent
 * @param {number} money 
 * @returns {string} Montant formaté (ex: $1.23m)
 */
export function formatMoney(money) {
    if (money >= 1e12) return `$${(money / 1e12).toFixed(2)}t`;
    if (money >= 1e9) return `$${(money / 1e9).toFixed(2)}b`;
    if (money >= 1e6) return `$${(money / 1e6).toFixed(2)}m`;
    if (money >= 1e3) return `$${(money / 1e3).toFixed(2)}k`;
    return `$${money.toFixed(2)}`;
}

/**
 * Formate une durée en millisecondes
 * @param {number} ms 
 * @returns {string} Durée formatée (ex: 2h 30m)
 */
export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}