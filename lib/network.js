/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.10.0 - Network (TRI PAR PROFIT/S)                ║
 * ╚═══════════════════════════════════════════════════════════╝
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
    
    crack(hostname) {
        if (this.ns.hasRootAccess(hostname)) {
            return true;
        }
        
        const reqPorts = this.ns.getServerNumPortsRequired(hostname);
        
        // ✅ CORRECTIF v0.8.4 : PAS de check niveau pour NUKE
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
     * ✅ NOUVEAU v0.10.0 : Calculer profit/seconde pour tri
     */
    calculateProfitPerSecond(target, hackPercent = 0.10) {
        try {
            const maxMoney = this.ns.getServerMaxMoney(target);
            const hackTime = this.ns.getHackTime(target);
            const hackChance = this.ns.hackAnalyzeChance(target);
            
            if (maxMoney === 0 || hackTime === 0) {
                return 0;
            }
            
            // Profit/s = (argent volé × chance) / temps
            const moneyStolen = maxMoney * hackPercent;
            const expectedProfit = moneyStolen * hackChance;
            const profitPerSecond = expectedProfit / (hackTime / 1000);
            
            return profitPerSecond;
            
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * ✅ NOUVEAU v0.10.0 : Tri par PROFIT/SECONDE
     */
    getTopTargets(count = 3) {
        const viable = this.servers.filter(s => {
            if (!this.ns.hasRootAccess(s)) return false;
            if (s === "home") return false;
            
            const reqLevel = this.ns.getServerRequiredHackingLevel(s);
            const maxMoney = this.ns.getServerMaxMoney(s);
            
            // Check niveau SEULEMENT pour hack
            if (reqLevel > this.caps.hackingLevel) return false;
            if (maxMoney < CONFIG.HACKING.MIN_TARGET_MONEY) return false;
            
            return true;
        });
        
        // ✅ TRI PAR PROFIT/SECONDE au lieu de maxMoney
        const targetsWithProfit = viable.map(target => ({
            name: target,
            profitPerSecond: this.calculateProfitPerSecond(target),
            maxMoney: this.ns.getServerMaxMoney(target),
            hackTime: this.ns.getHackTime(target),
            hackChance: this.ns.hackAnalyzeChance(target)
        }));
        
        targetsWithProfit.sort((a, b) => b.profitPerSecond - a.profitPerSecond);
        
        return targetsWithProfit.slice(0, count).map(t => t.name);
    }
    
    /**
     * ✅ NOUVEAU v0.10.0 : Obtenir métriques détaillées pour une cible
     */
    getTargetMetrics(target) {
        try {
            const maxMoney = this.ns.getServerMaxMoney(target);
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            const minSec = this.ns.getServerMinSecurityLevel(target);
            const currentSec = this.ns.getServerSecurityLevel(target);
            const hackTime = this.ns.getHackTime(target);
            const hackChance = this.ns.hackAnalyzeChance(target);
            const reqLevel = this.ns.getServerRequiredHackingLevel(target);
            
            const profitPerSecond = this.calculateProfitPerSecond(target);
            
            return {
                name: target,
                maxMoney,
                currentMoney,
                moneyPercent: maxMoney > 0 ? (currentMoney / maxMoney) : 0,
                minSec,
                currentSec,
                secDiff: currentSec - minSec,
                hackTime,
                hackChance,
                reqLevel,
                profitPerSecond,
                isReady: (currentMoney / maxMoney >= 0.95) && (currentSec - minSec <= 5)
            };
        } catch (e) {
            return null;
        }
    }
}
