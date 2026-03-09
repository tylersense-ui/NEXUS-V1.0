/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - RAM Manager                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/ram-manager.js
 * @version     0.6.0
 * @description Gestion RAM avec getTotalAvailableRam
 */

import { CONFIG } from "/lib/constants.js";

export class RamManager {
    constructor(ns) {
        this.ns = ns;
    }
    
    /**
     * NOUVEAU : Calculer TOUTE la RAM disponible sur le réseau
     */
    getTotalAvailableRam() {
        const servers = this.getAllServers();
        let totalAvailable = 0;
        
        for (const hostname of servers) {
            if (!this.ns.hasRootAccess(hostname)) continue;
            
            const maxRam = this.ns.getServerMaxRam(hostname);
            const usedRam = this.ns.getServerUsedRam(hostname);
            
            let availableRam = maxRam - usedRam;
            
            // Réserver RAM sur home
            if (hostname === 'home') {
                availableRam -= CONFIG.HACKING.RESERVED_HOME_RAM;
            }
            
            if (availableRam > 0) {
                totalAvailable += availableRam;
            }
        }
        
        return totalAvailable;
    }
    
    allocateThreads(totalThreads) {
        if (totalThreads <= 0) {
            return {
                success: false,
                allocations: [],
                error: "Invalid thread count"
            };
        }
        
        const servers = this.getAvailableServers();
        
        if (servers.length === 0) {
            return {
                success: false,
                allocations: [],
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
                    ram: threadsOnServer * 1.75
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
    
    getAvailableServers() {
        const servers = this.getAllServers();
        const available = [];
        
        for (const hostname of servers) {
            if (!this.ns.hasRootAccess(hostname)) continue;
            
            const maxRam = this.ns.getServerMaxRam(hostname);
            const usedRam = this.ns.getServerUsedRam(hostname);
            
            let availableRam = maxRam - usedRam;
            
            if (hostname === 'home') {
                availableRam -= CONFIG.HACKING.RESERVED_HOME_RAM;
            }
            
            if (availableRam >= 1.75) {
                available.push({
                    hostname: hostname,
                    maxRam: maxRam,
                    usedRam: usedRam,
                    availableRam: availableRam,
                    availableThreads: Math.floor(availableRam / 1.75)
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