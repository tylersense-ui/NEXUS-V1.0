/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Batcher                           ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.5.0
 * @description Génération jobs HWGW et dispatch via port 4
 */

import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";

export class Batcher {
    constructor(ns, network, ramManager, portHandler, capabilities) {
        this.ns = ns;
        this.network = network;
        this.ramMgr = ramManager;
        this.portHandler = portHandler;
        this.caps = capabilities;
        this.log = new Logger(ns, "BATCHER");
    }
    
    dispatchBatch(target, options = {}) {
        const hackPercent = options.hackPercent || CONFIG.BATCHER.DEFAULT_HACK_PERCENT;
        const maxThreads = options.maxThreadsPerJob || CONFIG.BATCHER.MAX_THREADS_PER_JOB;
        
        try {
            if (CONFIG.BATCHER.ENABLE_PREP && !this.isServerReady(target)) {
                return {
                    success: false,
                    error: "Server not ready (prep needed)"
                };
            }
            
            const threads = this.calculateThreads(target, hackPercent);
            
            if (!threads) {
                return {
                    success: false,
                    error: "Cannot calculate threads"
                };
            }
            
            const jobs = this.generateJobs(target, threads, maxThreads);
            
            if (jobs.length === 0) {
                return {
                    success: false,
                    error: "No jobs generated"
                };
            }
            
            for (const job of jobs) {
                this.portHandler.writeJSON(CONFIG.PORTS.COMMANDS, job);
            }
            
            return {
                success: true,
                totalThreads: threads.total,
                jobsDispatched: jobs.length
            };
            
        } catch (error) {
            this.log.error(`Error dispatching batch: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    isServerReady(target) {
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const currentSec = this.ns.getServerSecurityLevel(target);
        const minSec = this.ns.getServerMinSecurityLevel(target);
        
        const moneyReady = currentMoney > maxMoney * 0.9;
        const securityReady = currentSec < minSec + CONFIG.HACKING.SECURITY_BUFFER;
        
        return moneyReady && securityReady;
    }
    
    calculateThreads(target, hackPercent) {
        try {
            const maxMoney = this.ns.getServerMaxMoney(target);
            const currentMoney = this.ns.getServerMoneyAvailable(target);
            
            const hackThreads = Math.max(1, Math.floor(
                this.ns.hackAnalyzeThreads(target, currentMoney * hackPercent)
            ));
            
            const hackSecIncrease = this.ns.hackAnalyzeSecurity(hackThreads, target);
            const weakenThreads1 = Math.ceil(hackSecIncrease / 0.05);
            
            const moneyAfterHack = currentMoney * (1 - hackPercent);
            const growThreads = Math.max(1, Math.ceil(
                this.ns.growthAnalyze(target, maxMoney / Math.max(1, moneyAfterHack))
            ));
            
            const growSecIncrease = this.ns.growthAnalyzeSecurity(growThreads, target);
            const weakenThreads2 = Math.ceil(growSecIncrease / 0.05);
            
            return {
                hack: hackThreads,
                weaken1: weakenThreads1,
                grow: growThreads,
                weaken2: weakenThreads2,
                total: hackThreads + weakenThreads1 + growThreads + weakenThreads2
            };
            
        } catch (error) {
            this.log.error(`Error calculating threads: ${error.message}`);
            return null;
        }
    }
    
    generateJobs(target, threads, maxThreadsPerJob) {
        const jobs = [];
        const baseDelay = CONFIG.HACKING.TIME_BUFFER_MS;
        
        const jobTypes = [
            { 
                action: 'hack', 
                threads: threads.hack, 
                delay: 0,
                script: CONFIG.WORKERS.HACK
            },
            { 
                action: 'weaken', 
                threads: threads.weaken1, 
                delay: baseDelay,
                script: CONFIG.WORKERS.WEAKEN
            },
            { 
                action: 'grow', 
                threads: threads.grow, 
                delay: baseDelay * 2,
                script: CONFIG.WORKERS.GROW
            },
            { 
                action: 'weaken', 
                threads: threads.weaken2, 
                delay: baseDelay * 3,
                script: CONFIG.WORKERS.WEAKEN
            }
        ];
        
        for (const jobType of jobTypes) {
            if (jobType.threads === 0) continue;
            
            const allocation = this.ramMgr.allocateThreads(
                Math.min(jobType.threads, maxThreadsPerJob)
            );
            
            if (!allocation.success) {
                this.log.warn(`Not enough RAM for ${jobType.action}`);
                continue;
            }
            
            for (const alloc of allocation.allocations) {
                const uuid = this.generateUUID();
                
                jobs.push({
                    type: jobType.action,
                    target: target,
                    threads: alloc.threads,
                    host: alloc.hostname,
                    delay: jobType.delay,
                    uuid: uuid,
                    script: jobType.script
                });
            }
        }
        
        return jobs;
    }
    
    generateUUID() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}