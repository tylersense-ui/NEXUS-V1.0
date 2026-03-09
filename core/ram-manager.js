/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - RAM Manager                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/ram-manager.js
 * @version     0.5.0
 * @description Allocation RAM intelligente avec job splitting
 */

import { CONFIG } from "/lib/constants.js";

export class RamManager {
    constructor(ns) {
        this.ns = ns;
        this.workerRam = 1.75; // RAM worker HWGW
    }
    
    /**
     * Obtient tous les serveurs disponibles avec RAM
     * @returns {Array<Object>} Serveurs avec RAM disponible
     */
    getAvailableServers() {
        const servers = [];
        
        // Scan réseau
        const visited = new Set();
        const queue = ["home"];
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            
            const neighbors = this.ns.scan(current);
            for (const n of neighbors) {
                if (!visited.has(n)) queue.push(n);
            }
            
            if (!this.ns.hasRootAccess(current)) continue;
            
            const maxRam = this.ns.getServerMaxRam(current);
            if (maxRam === 0) continue;
            
            const usedRam = this.ns.getServerUsedRam(current);
            const reserved = current === "home" ? CONFIG.HACKING.RESERVED_HOME_RAM : 0;
            const availableRam = Math.max(0, maxRam - usedRam - reserved);
            
            if (availableRam >= this.workerRam) {
                servers.push({
                    hostname: current,
                    maxRam: maxRam,
                    usedRam: usedRam,
                    availableRam: availableRam,
                    maxThreads: Math.floor(availableRam / this.workerRam)
                });
            }
        }
        
        // Ajouter serveurs achetés
        const purchased = this.ns.getPurchasedServers();
        for (const p of purchased) {
            if (visited.has(p)) continue;
            
            const maxRam = this.ns.getServerMaxRam(p);
            const usedRam = this.ns.getServerUsedRam(p);
            const availableRam = maxRam - usedRam;
            
            if (availableRam >= this.workerRam) {
                servers.push({
                    hostname: p,
                    maxRam: maxRam,
                    usedRam: usedRam,
                    availableRam: availableRam,
                    maxThreads: Math.floor(availableRam / this.workerRam)
                });
            }
        }
        
        // Trier par RAM disponible (décroissant)
        servers.sort((a, b) => b.availableRam - a.availableRam);
        
        return servers;
    }
    
    /**
     * Alloue des threads sur le réseau (job splitting)
     * @param {number} totalThreads - Threads à allouer
     * @returns {Array<Object>} Allocations par serveur
     */
    allocateThreads(totalThreads) {
        const servers = this.getAvailableServers();
        const allocations = [];
        let remaining = totalThreads;
        
        for (const server of servers) {
            if (remaining <= 0) break;
            
            const threads = Math.min(remaining, server.maxThreads);
            
            if (threads > 0) {
                allocations.push({
                    hostname: server.hostname,
                    threads: threads
                });
                
                remaining -= threads;
            }
        }
        
        return {
            allocations: allocations,
            totalAllocated: totalThreads - remaining,
            totalRequested: totalThreads,
            success: remaining === 0
        };
    }
}