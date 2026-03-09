/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Timing Calculator                 ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/timing.js
 * @version     0.5.3
 * @description Calcul précis des timings pour batching synchronisé
 */

import { CONFIG } from "/lib/constants.js";

export class TimingCalculator {
    constructor(ns) {
        this.ns = ns;
    }
    
    /**
     * Calcule les timings pour un batch HWGW synchronisé
     * 
     * Principe : Tous les jobs doivent arriver au MÊME moment
     * - Weaken est le plus lent (base)
     * - Grow est ~80% du temps de weaken
     * - Hack est ~25% du temps de weaken
     * 
     * @param {string} target - Serveur cible
     * @returns {Object} Timings calculés
     */
    calculateBatchTimings(target) {
        const hackTime = this.ns.getHackTime(target);
        const growTime = this.ns.getGrowTime(target);
        const weakenTime = this.ns.getWeakenTime(target);
        
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        
        // Temps de fin souhaité (quand tous les jobs doivent arriver)
        const now = Date.now();
        const endTime = now + weakenTime + buffer;
        
        // Calcul des delays pour synchroniser
        // Weaken1 (après hack) arrive en premier
        const weakenDelay1 = 0;
        
        // Weaken2 (après grow) arrive juste après
        const weakenDelay2 = buffer;
        
        // Grow arrive juste avant weaken2
        const growDelay = endTime - now - growTime - buffer;
        
        // Hack arrive en premier de tous
        const hackDelay = endTime - now - hackTime - (buffer * 3);
        
        return {
            hackTime: hackTime,
            growTime: growTime,
            weakenTime: weakenTime,
            
            hackDelay: Math.max(0, hackDelay),
            weakenDelay1: weakenDelay1,
            growDelay: Math.max(0, growDelay),
            weakenDelay2: weakenDelay2,
            
            totalDuration: weakenTime + (buffer * 4),
            endTime: endTime
        };
    }
    
    /**
     * Calcule si un batch peut être lancé maintenant
     * (vérifie qu'on ne va pas interférer avec un batch en cours)
     */
    canLaunchBatch(target, lastBatchTime) {
        if (!lastBatchTime) return true;
        
        const weakenTime = this.ns.getWeakenTime(target);
        const buffer = CONFIG.HACKING.TIME_BUFFER_MS;
        const batchDuration = weakenTime + (buffer * 4);
        
        const timeSinceLastBatch = Date.now() - lastBatchTime;
        
        // Attendre au moins 1 batch complet avant d'en lancer un autre
        return timeSinceLastBatch >= batchDuration;
    }
}