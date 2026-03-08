/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Network                           ║
 * ╚═══════════════════════════════════════════════════════════╗
 * 
 * @file        /lib/network.js
 * @version     0.5.0
 * @description Scan réseau unifié + crack automatique
 */

import { CONFIG } from '/lib/constants.js';
import { Logger } from '/lib/logger.js';

export class Network {
    constructor(ns, capabilities) {
        this.ns = ns;
        this.caps = capabilities;
        this.log = new Logger(ns, "NETWORK");
        this.servers = [];
    }
    
    /**
     * Scan complet du réseau (BFS)
     * @param {boolean} force - Forcer un nouveau scan
     * @returns {Array<string>} Liste des hostnames
     */
    refresh(force = false) {
        if (this.servers.length > 0 && !force) {
            return this.servers;
        }
        
        const visited = new Set();
        const queue = ["home"];
        const servers = [];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (visited.has(current)) continue;
            visited.add(current);
            
            try {
                const neighbors = this.ns.scan(current);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
                
                servers.push(current);
            } catch (e) {
                this.log.error(`Erreur scan ${current}: ${e}`);
            }
        }
        
        this.servers = servers;
        this.log.info(`${servers.length} serveurs scannés`);
        
        return servers;
    }
    
    /**
     * Crack un serveur (ouvre ports + nuke)
     * @param {string} hostname
     * @returns {boolean} Succès
     */
    crack(hostname) {
        if (this.ns.hasRootAccess(hostname)) {
            return true;
        }
        
        const reqLevel = this.ns.getServerRequiredHackingLevel(hostname);
        const reqPorts = this.ns.getServerNumPortsRequired(hostname);
        
        if (reqLevel > this.caps.hackingLevel) {
            return false;
        }
        
        if (reqPorts > this.caps.portCount) {
            return false;
        }
        
        try {
            if (reqPorts >= 1 && this.caps.tools.brutessh) this.ns.brutessh(hostname);
            if (reqPorts >= 2 && this.caps.tools.ftpcrack) this.ns.ftpcrack(hostname);
            if (reqPorts >= 3 && this.caps.tools.relaysmtp) this.ns.relaysmtp(hostname);
            if (reqPorts >= 4 && this.caps.tools.httpworm) this.ns.httpworm(hostname);
            if (reqPorts >= 5 && this.caps.tools.sqlinject) this.ns.sqlinject(hostname);
            
            this.ns.nuke(hostname);
            return true;
        } catch (e) {
            this.log.error(`Erreur crack ${hostname}: ${e}`);
            return false;
        }
    }
    
    /**
     * Sélectionne les meilleures cibles
     * @param {number} count - Nombre de cibles
     * @returns {Array<string>} Top targets
     */
    getTopTargets(count = 3) {
        const viable = this.servers.filter(s => {
            if (!this.ns.hasRootAccess(s)) return false;
            if (s === "home") return false;
            
            const reqLevel = this.ns.getServerRequiredHackingLevel(s);
            const maxMoney = this.ns.getServerMaxMoney(s);
            
            if (reqLevel > this.caps.hackingLevel) return false;
            if (maxMoney < CONFIG.HACKING.MIN_TARGET_MONEY) return false;
            
            return true;
        });
        
        // Trier par profitabilité (maxMoney / hackTime)
        viable.sort((a, b) => {
            const profitA = this.ns.getServerMaxMoney(a) / (this.ns.getHackTime(a) || 1);
            const profitB = this.ns.getServerMaxMoney(b) / (this.ns.getHackTime(b) || 1);
            return profitB - profitA;
        });
        
        return viable.slice(0, count);
    }
}