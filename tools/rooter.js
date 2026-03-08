/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Mass Rooter                                        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/rooter.js
 * @version     0.2.1
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Rooter massif de tous les serveurs accessibles.
 * Détecte automatiquement les outils disponibles (BruteSSH, FTPCrack, etc).
 * Tente de rooter tous les serveurs compatibles.
 * 
 * @usage
 * run /tools/rooter.js
 * 
 * @ram
 * 3.00GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Mass Rooter v0.2.1                                   ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Vérifier les outils disponibles
    const tools = {
        brutessh: ns.fileExists('BruteSSH.exe'),
        ftpcrack: ns.fileExists('FTPCrack.exe'),
        relaysmtp: ns.fileExists('relaySMTP.exe'),
        httpworm: ns.fileExists('HTTPWorm.exe'),
        sqlinject: ns.fileExists('SQLInject.exe')
    };
    
    const portsAvailable = Object.values(tools).filter(x => x).length;
    
    ns.print(`🔧 Outils disponibles: ${portsAvailable}/5`);
    if (tools.brutessh) ns.print('  ✓ BruteSSH.exe');
    if (tools.ftpcrack) ns.print('  ✓ FTPCrack.exe');
    if (tools.relaysmtp) ns.print('  ✓ relaySMTP.exe');
    if (tools.httpworm) ns.print('  ✓ HTTPWorm.exe');
    if (tools.sqlinject) ns.print('  ✓ SQLInject.exe');
    ns.print('');
    
    // Scanner le réseau
    const servers = scanNetwork(ns);
    const myHackLevel = ns.getHackingLevel();
    
    ns.print(`📊 Niveau de hacking: ${myHackLevel}`);
    ns.print(`🌐 Serveurs trouvés: ${servers.length}`);
    ns.print('');
    
    let rooted = 0;
    let alreadyRooted = 0;
    let cannotRoot = 0;
    
    for (const server of servers) {
        if (ns.hasRootAccess(server)) {
            alreadyRooted++;
            continue;
        }
        
        const reqHack = ns.getServerRequiredHackingLevel(server);
        const reqPorts = ns.getServerNumPortsRequired(server);
        
        // Vérifier si on peut rooter
        if (reqHack > myHackLevel) {
            cannotRoot++;
            continue;
        }
        
        if (reqPorts > portsAvailable) {
            cannotRoot++;
            continue;
        }
        
        // Ouvrir les ports
        try {
            if (reqPorts >= 1 && tools.brutessh) ns.brutessh(server);
            if (reqPorts >= 2 && tools.ftpcrack) ns.ftpcrack(server);
            if (reqPorts >= 3 && tools.relaysmtp) ns.relaysmtp(server);
            if (reqPorts >= 4 && tools.httpworm) ns.httpworm(server);
            if (reqPorts >= 5 && tools.sqlinject) ns.sqlinject(server);
            
            ns.nuke(server);
            ns.print(`✓ ROOT: ${server}`);
            rooted++;
        } catch (e) {
            ns.print(`✗ FAIL: ${server}`);
            cannotRoot++;
        }
    }
    
    ns.print('');
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print(`✓ Nouveaux roots: ${rooted}`);
    ns.print(`  Déjà rootés: ${alreadyRooted}`);
    ns.print(`  Impossibles: ${cannotRoot}`);
    ns.print(`  TOTAL: ${rooted + alreadyRooted} serveurs rootés`);
    ns.print('═══════════════════════════════════════════════════════════');
}

/**
 * Scanne le réseau complet
 * @param {NS} ns 
 * @returns {Array<string>} Liste des hostnames
 */
function scanNetwork(ns) {
    const visited = new Set();
    const servers = [];
    const queue = ['home'];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
        
        if (current !== 'home') {
            servers.push(current);
        }
    }
    
    return servers;
}