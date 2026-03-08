/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Logger                            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/logger.js
 * @version     0.5.0
 * @description Système de logs centralisé avec niveaux
 */

import { CONFIG } from '/lib/constants.js';

export class Logger {
    constructor(ns, module) {
        this.ns = ns;
        this.module = module;
        this.logLevel = CONFIG.SYSTEM.LOG_LEVEL || "INFO";
        this.debugEnabled = this.logLevel === "DEBUG";
        
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
    }
    
    log(level, message) {
        if (this.levels[level] >= this.levels[this.logLevel]) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] [${this.module}] [${level}]`;
            this.ns.print(`${prefix} ${message}`);
        }
    }
    
    debug(message) {
        this.log("DEBUG", `🔍 ${message}`);
    }
    
    info(message) {
        this.log("INFO", `ℹ️  ${message}`);
    }
    
    warn(message) {
        this.log("WARN", `⚠️  ${message}`);
    }
    
    error(message) {
        this.log("ERROR", `❌ ${message}`);
    }
    
    success(message) {
        this.log("INFO", `✅ ${message}`);
    }
}