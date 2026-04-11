/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.10.2 - RAM Manager (HOTFIX - SCRIPT SIZE)       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/ram-manager.js
 * @version     0.10.2
 * @changes     FIX: Prend en compte la taille RÉELLE du script
 *              Au lieu de 1.75 GB codé en dur
 */

import { CONFIG } from "/lib/constants.js";

export class RamManager {
    constructor(ns) {
        this.ns = ns;
    }
    
    getTotalAvailableRam() {
        const servers = this.getAllServers();
        let totalAvailable = 0;
        
        for (const hostname of servers) {
            if (!this.ns.hasRootAccess(hostname)) continue;
            
            const maxRam = this.ns.getServerMaxRam(hostname);
            const usedRam = this.ns.getServerUsedRam(hostname);
            
            let availableRam = maxRam - usedRam;
            
            if (hostname === 'home') {
                const reserveRam = CONFIG.RAM.RESERVED_HOME_RAM;
                availableRam = Math.max(0, availableRam - reserveRam);
            }
            
            if (availableRam > 0) {
                totalAvailable += availableRam;
            }
        }
        
        return totalAvailable;
    }
    
    /**
     * ✅ v0.10.2 : Accepte maintenant scriptPath pour calculer la taille réelle
     */
    allocateThreads(totalThreads, scriptPath = '/workers/weaken.js') {
        if (totalThreads <= 0) {
            return {
                success: false,
                allocations: [],
                allocated: 0,
                remaining: totalThreads,
                error: "Invalid thread count"
            };
        }
        
        // ✅ Calculer taille réelle du script
        const scriptRam = this.ns.getScriptRam(scriptPath, 'home');
        
        if (scriptRam === 0) {
            return {
                success: false,
                allocations: [],
                allocated: 0,
                remaining: totalThreads,
                error: `Script ${scriptPath} not found or invalid`
            };
        }
        
        const servers = this.getAvailableServers(scriptRam);
        
        if (servers.length === 0) {
            return {
                success: false,
                allocations: [],
                allocated: 0,
                remaining: totalThreads,
                error: "No servers available"
            };
        }
        
        const allocations = [];
        let remainingThreads = totalThreads;
        
        for (const server of servers) {
            if (remainingThreads <= 0) break;
            
            const threadsOnServer = Math.min(remainingThreads, server.availableThreads);
            
            if (threadsOnServer > 0) {
                allocations.push({
                    hostname: server.hostname,
                    threads: threadsOnServer,
                    ram: threadsOnServer * scriptRam  // ✅ RAM réelle
                });
                
                remainingThreads -= threadsOnServer;
            }
        }
        
        return {
            success: remainingThreads === 0,
            allocations: allocations,
            allocated: totalThreads - remainingThreads,
            remaining: remainingThreads
        };
    }
    
    /**
     * ✅ v0.10.2 : Accepte scriptRam en paramètre
     */
    getAvailableServers(scriptRam = 1.75) {
        const servers = this.getAllServers();
        const available = [];
        
        for (const hostname of servers) {
            if (!this.ns.hasRootAccess(hostname)) continue;
            
            const maxRam = this.ns.getServerMaxRam(hostname);
            const usedRam = this.ns.getServerUsedRam(hostname);
            
            let availableRam = maxRam - usedRam;
            
            if (hostname === 'home') {
                const reserveRam = CONFIG.RAM.RESERVED_HOME_RAM;
                availableRam = Math.max(0, availableRam - reserveRam);
            }
            
            // ✅ Utilise scriptRam passé en paramètre
            if (availableRam >= scriptRam) {
                available.push({
                    hostname: hostname,
                    maxRam: maxRam,
                    usedRam: usedRam,
                    availableRam: availableRam,
                    availableThreads: Math.floor(availableRam / scriptRam)
                });
            }
        }
        
        available.sort((a, b) => b.availableRam - a.availableRam);
        
        return available;
    }
    
    getAllServers() {
        const visited = new Set();
        const queue = ["home"];
        const servers = [];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (visited.has(current)) continue;
            visited.add(current);
            
            const neighbors = this.ns.scan(current);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
            
            servers.push(current);
        }
        
        return servers;
    }
}
