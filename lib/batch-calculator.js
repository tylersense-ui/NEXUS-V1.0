/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.8.0 - Batch Calculator (FORMULAS FIXED)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { CONFIG } from "/lib/constants.js";

export class BatchCalculator {
    constructor(ns) {
        this.ns = ns;
        this.hasFormulas = ns.fileExists("Formulas.exe");
    }
    
    /**
     * Calculer un batch HWGW optimal avec Formulas
     */
    calculateHWGW(target, hackPercent = 0.10) {
        if (!this.hasFormulas) {
            return this.calculateHWGWFallback(target, hackPercent);
        }
        
        const server = this.ns.getServer(target);
        const player = this.ns.getPlayer();
        
        // Forcer serveur à l'état optimal
        server.hackDifficulty = server.minDifficulty;
        server.moneyAvailable = server.moneyMax;
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS HACK
        // ════════════════════════════════════════════════════
        
        const hackPercentPerThread = this.ns.formulas.hacking.hackPercent(server, player);
        const hackThreads = Math.max(1, Math.floor(hackPercent / hackPercentPerThread));
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS WEAKEN1
        // ════════════════════════════════════════════════════
        
        const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS GROW (SIMPLIFIÉ)
        // ════════════════════════════════════════════════════
        
        const moneyAfterHack = server.moneyMax * (1 - hackPercent);
        const growMultiplier = server.moneyMax / Math.max(1, moneyAfterHack);
        
        // Utiliser growthAnalyze (plus fiable)
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, growMultiplier)
        ));
        
        // ════════════════════════════════════════════════════
        // CALCUL THREADS WEAKEN2
        // ════════════════════════════════════════════════════
        
        const growSecIncrease = this.ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
        
        // ════════════════════════════════════════════════════
        // CALCUL TIMINGS PRÉCIS AVEC FORMULAS
        // ════════════════════════════════════════════════════
        
        const hackTime = this.ns.formulas.hacking.hackTime(server, player);
        const growTime = this.ns.formulas.hacking.growTime(server, player);
        const weakenTime = this.ns.formulas.hacking.weakenTime(server, player);
        
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        
        // Tous les jobs doivent finir dans l'ordre : H → W1 → G → W2
        const endTime = Date.now() + weakenTime + (buffer * 4);
        
        const hackDelay = endTime - Date.now() - hackTime - (buffer * 3);
        const weaken1Delay = endTime - Date.now() - weakenTime - (buffer * 2);
        const growDelay = endTime - Date.now() - growTime - buffer;
        const weaken2Delay = 0;
        
        return {
            hackThreads: hackThreads,
            weakenThreads1: weakenThreads1,
            growThreads: growThreads,
            weakenThreads2: weakenThreads2,
            
            hackDelay: Math.max(0, hackDelay),
            weaken1Delay: Math.max(0, weaken1Delay),
            growDelay: Math.max(0, growDelay),
            weaken2Delay: weaken2Delay,
            
            hackTime: hackTime,
            growTime: growTime,
            weakenTime: weakenTime,
            
            totalTime: weakenTime + (buffer * 4),
            hackChance: this.ns.formulas.hacking.hackChance(server, player)
        };
    }
    
    /**
     * Fallback sans Formulas
     */
    calculateHWGWFallback(target, hackPercent) {
        const maxMoney = this.ns.getServerMaxMoney(target);
        
        const hackThreads = Math.max(1, Math.floor(
            this.ns.hackAnalyzeThreads(target, maxMoney * hackPercent)
        ));
        
        const hackSec = this.ns.hackAnalyzeSecurity(hackThreads, target);
        const weakenThreads1 = Math.ceil(hackSec / 0.05);
        
        const moneyAfterHack = maxMoney * (1 - hackPercent);
        const growThreads = Math.max(1, Math.ceil(
            this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
        ));
        
        const growSec = this.ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads2 = Math.ceil(growSec / 0.05);
        
        const hackTime = this.ns.getHackTime(target);
        const growTime = this.ns.getGrowTime(target);
        const weakenTime = this.ns.getWeakenTime(target);
        
        return {
            hackThreads,
            weakenThreads1,
            growThreads,
            weakenThreads2,
            hackDelay: 0,
            weaken1Delay: 50,
            growDelay: 100,
            weaken2Delay: 150,
            hackTime,
            growTime,
            weakenTime,
            totalTime: weakenTime + 200,
            hackChance: this.ns.hackAnalyzeChance(target)
        };
    }
    
    /**
     * Calculer le score d'une cible ($/sec/RAM)
     */
    calculateTargetScore(target) {
        if (!this.hasFormulas) {
            const maxMoney = this.ns.getServerMaxMoney(target);
            return maxMoney;
        }
        
        const server = this.ns.getServer(target);
        const player = this.ns.getPlayer();
        
        server.hackDifficulty = server.minDifficulty;
        server.moneyAvailable = server.moneyMax;
        
        const hackPercent = this.ns.formulas.hacking.hackPercent(server, player);
        const hackTime = this.ns.formulas.hacking.hackTime(server, player);
        const hackChance = this.ns.formulas.hacking.hackChance(server, player);
        
        if (hackChance === 0 || server.moneyMax === 0) {
            return 0;
        }
        
        const moneyPerHack = server.moneyMax * hackPercent;
        const moneyPerSecond = (moneyPerHack / hackTime) * 1000;
        
        return moneyPerSecond * hackChance;
    }
}