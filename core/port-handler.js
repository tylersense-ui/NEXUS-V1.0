/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Port Handler                      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/port-handler.js
 * @version     0.5.0
 * @description Abstraction des ports NetScript
 */

export class PortHandler {
    constructor(ns) {
        this.ns = ns;
    }
    
    /**
     * Écrit un objet JSON dans un port
     */
    writeJSON(portNum, data) {
        try {
            this.ns.writePort(portNum, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Lit un objet JSON depuis un port
     */
    readJSON(portNum) {
        try {
            const data = this.ns.readPort(portNum);
            if (data === "NULL PORT DATA") return null;
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Vérifie si un port est vide
     */
    isEmpty(portNum) {
        return this.ns.peek(portNum) === "NULL PORT DATA";
    }
    
    /**
     * Vide un port
     */
    clear(portNum) {
        this.ns.clearPort(portNum);
    }
    
    /**
     * Lit tout le contenu d'un port (drainage)
     */
    drainJSON(portNum) {
        const items = [];
        while (!this.isEmpty(portNum)) {
            const item = this.readJSON(portNum);
            if (item) items.push(item);
        }
        return items;
    }
}