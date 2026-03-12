/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.1 - State Manager (PERSISTENCE API)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/state-manager.js
 * @version     0.11.1
 * @description API unifiée pour lire/écrire état persistant
 */

export class StateManager {
    constructor(ns) {
        this.ns = ns;
        this.stateDir = "/state";
    }
    
    /**
     * Sauvegarder données dans /state/
     * @param {string} filename - Nom du fichier (ex: "telemetry-realtime.json")
     * @param {any} data - Données à sauvegarder (sera JSON.stringify si object)
     * @returns {boolean} Succès
     */
    async save(filename, data) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            
            // Convertir en string si nécessaire
            let content;
            if (typeof data === 'string') {
                content = data;
            } else {
                content = JSON.stringify(data, null, 2);
            }
            
            // Écrire le fichier
            await this.ns.write(filepath, content, "w");
            
            return true;
        } catch (error) {
            this.ns.print(`ERROR StateManager.save(${filename}): ${error}`);
            return false;
        }
    }
    
    /**
     * Charger données depuis /state/
     * @param {string} filename - Nom du fichier
     * @param {boolean} parseJSON - Parser en JSON ? (default: true)
     * @returns {any|null} Données ou null si erreur
     */
    load(filename, parseJSON = true) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            
            // Vérifier existence
            if (!this.ns.fileExists(filepath)) {
                return null;
            }
            
            // Lire le fichier
            const content = this.ns.read(filepath);
            
            if (!content || content === "") {
                return null;
            }
            
            // Parser JSON si demandé
            if (parseJSON) {
                try {
                    return JSON.parse(content);
                } catch (e) {
                    this.ns.print(`WARN StateManager.load(${filename}): JSON parse failed`);
                    return content; // Retourner string brute
                }
            }
            
            return content;
        } catch (error) {
            this.ns.print(`ERROR StateManager.load(${filename}): ${error}`);
            return null;
        }
    }
    
    /**
     * Vérifier existence fichier
     * @param {string} filename - Nom du fichier
     * @returns {boolean}
     */
    exists(filename) {
        const filepath = `${this.stateDir}/${filename}`;
        return this.ns.fileExists(filepath);
    }
    
    /**
     * Supprimer fichier
     * @param {string} filename - Nom du fichier
     * @returns {boolean}
     */
    delete(filename) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            return this.ns.rm(filepath);
        } catch (error) {
            this.ns.print(`ERROR StateManager.delete(${filename}): ${error}`);
            return false;
        }
    }
    
    /**
     * Lister tous les fichiers /state/
     * @returns {Array<string>} Liste des fichiers
     */
    list() {
        try {
            return this.ns.ls("home", this.stateDir);
        } catch (error) {
            this.ns.print(`ERROR StateManager.list(): ${error}`);
            return [];
        }
    }
    
    /**
     * Nettoyer vieux fichiers (age > maxAge ms)
     * @param {number} maxAge - Age maximum en ms
     * @returns {number} Nombre de fichiers supprimés
     */
    cleanup(maxAge = 86400000) { // Default: 24h
        try {
            const files = this.list();
            let deleted = 0;
            const now = Date.now();
            
            for (const file of files) {
                // Charger pour vérifier timestamp
                const data = this.load(file);
                
                if (data && data.timestamp) {
                    const fileTime = new Date(data.timestamp).getTime();
                    const age = now - fileTime;
                    
                    if (age > maxAge) {
                        if (this.delete(file)) {
                            deleted++;
                        }
                    }
                }
            }
            
            return deleted;
        } catch (error) {
            this.ns.print(`ERROR StateManager.cleanup(): ${error}`);
            return 0;
        }
    }
    
    /**
     * Append à un fichier log (.txt)
     * @param {string} filename - Nom du fichier log
     * @param {string} message - Message à ajouter
     * @returns {boolean}
     */
    async append(filename, message) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] ${message}\n`;
            
            await this.ns.write(filepath, line, "a");
            return true;
        } catch (error) {
            this.ns.print(`ERROR StateManager.append(${filename}): ${error}`);
            return false;
        }
    }
}
