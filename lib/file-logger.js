/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v1.0 - File Logger (PRODUCTION-GRADE)              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @version     1.0.0
 * @description Logger professionnel avec fichiers persistants
 */

export class FileLogger {
    constructor(ns, component, logLevel = "INFO") {
        this.ns = ns;
        this.component = component;
        this.logLevel = logLevel;
        
        // Niveaux de log (ordre croissant de sévérité)
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        
        // Fichier de log par composant
        this.logFile = `/logs/${component.toLowerCase()}.txt`;
        
        // Créer le dossier logs s'il n'existe pas
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        // NetScript ne peut pas créer de dossiers directement
        // On va juste écrire dans le fichier, le dossier sera créé automatiquement
    }
    
    /**
     * Écrire dans le fichier de log
     */
    write(level, message) {
        // Vérifier si on doit logger ce niveau
        if (this.levels[level] < this.levels[this.logLevel]) {
            return;
        }
        
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [${level}] [${this.component}] ${message}\n`;
        
        try {
            // Lire le fichier existant
            let existingContent = "";
            if (this.ns.fileExists(this.logFile)) {
                existingContent = this.ns.read(this.logFile);
            }
            
            // Ajouter la nouvelle ligne
            const newContent = existingContent + logLine;
            
            // Rotation si trop gros (>10MB = 10,000,000 chars)
            const finalContent = newContent.length > 10000000
                ? this.rotate(newContent)
                : newContent;
            
            // Écrire
            this.ns.write(this.logFile, finalContent, "w");
            
            // Aussi afficher dans le terminal du script
            this.ns.print(`${logLine.trim()}`);
            
        } catch (error) {
            // Fallback - juste afficher
            this.ns.print(`[${level}] ${message}`);
        }
    }
    
    /**
     * Rotation : garder seulement les 5000 dernières lignes
     */
    rotate(content) {
        const lines = content.split('\n');
        const keepLines = 5000;
        
        if (lines.length > keepLines) {
            const rotatedLines = lines.slice(-keepLines);
            return rotatedLines.join('\n');
        }
        
        return content;
    }
    
    debug(message) {
        this.write("DEBUG", message);
    }
    
    info(message) {
        this.write("INFO", message);
    }
    
    warn(message) {
        this.write("WARN", message);
    }
    
    error(message) {
        this.write("ERROR", message);
    }
    
    success(message) {
        this.write("INFO", message);
    }
    
    /**
     * Log structuré (objet JSON)
     */
    logJSON(level, data) {
        const message = JSON.stringify(data, null, 2);
        this.write(level, message);
    }
}
