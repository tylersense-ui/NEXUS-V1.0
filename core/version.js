/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Version Info                                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/version.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Informations de version et changelog du framework NEXUS
 * 
 * @usage
 * run /core/version.js
 * 
 * @ram
 * 1.60GB
 */

export const VERSION = {
    major: 0,
    minor: 2,
    patch: 0,
    tag: 'alpha',
    full: '0.2.0-alpha',
    date: '2026-03-08'
};

export const CHANGELOG = {
    '0.2.0-alpha': [
        'Refonte architecture complète',
        'Headers standardisés sur tous les fichiers',
        'Fusion server-manager + server-buyer',
        'Versioning explicite'
    ],
    '0.1.0-bootstrap': [
        'Première version',
        'Scanner réseau',
        'Hack basique',
        'Monitoring'
    ]
};

/** @param {NS} ns */
export async function main(ns) {
    ns.tprint('');
    ns.tprint('╔═══════════════════════════════════════════════════════════╗');
    ns.tprint(`║ NEXUS Framework v${VERSION.full.padEnd(42)}║`);
    ns.tprint('╚═══════════════════════════════════════════════════════════╝');
    ns.tprint('');
    ns.tprint(`Version: ${VERSION.full}`);
    ns.tprint(`Date: ${VERSION.date}`);
    ns.tprint('');
    ns.tprint('CHANGELOG:');
    for (const [version, changes] of Object.entries(CHANGELOG)) {
        ns.tprint(`\n${version}:`);
        for (const change of changes) {
            ns.tprint(`  • ${change}`);
        }
    }
    ns.tprint('');
}