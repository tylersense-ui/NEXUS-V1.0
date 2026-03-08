/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Capabilities                      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/capabilities.js
 * @version     0.5.0
 * @description Détection des capacités du joueur
 */

export class Capabilities {
    constructor(ns) {
        this.ns = ns;
        this.scan();
    }
    
    scan() {
        this.hasFormulas = this.ns.fileExists("Formulas.exe");
        this.hasSingularity = this.checkSingularity();
        
        // Outils de port
        this.tools = {
            brutessh: this.ns.fileExists("BruteSSH.exe"),
            ftpcrack: this.ns.fileExists("FTPCrack.exe"),
            relaysmtp: this.ns.fileExists("relaySMTP.exe"),
            httpworm: this.ns.fileExists("HTTPWorm.exe"),
            sqlinject: this.ns.fileExists("SQLInject.exe")
        };
        
        this.portCount = Object.values(this.tools).filter(x => x).length;
        
        // Stats joueur
        this.hackingLevel = this.ns.getHackingLevel();
        this.money = this.ns.getServerMoneyAvailable("home");
        this.homeRam = this.ns.getServerMaxRam("home");
    }
    
    checkSingularity() {
        try {
            this.ns.singularity.getOwnedAugmentations();
            return true;
        } catch {
            return false;
        }
    }
    
    printReport(toTerminal = false) {
        const print = toTerminal ? this.ns.tprint.bind(this.ns) : this.ns.print.bind(this.ns);
        
        print("═══════════════════════════════════════════════════════════");
        print("CAPACITÉS SYSTÈME");
        print("═══════════════════════════════════════════════════════════");
        print(`Formulas.exe: ${this.hasFormulas ? "✓" : "✗"}`);
        print(`Singularity API: ${this.hasSingularity ? "✓" : "✗"}`);
        print(`Outils de port: ${this.portCount}/5`);
        if (this.tools.brutessh) print("  ✓ BruteSSH.exe");
        if (this.tools.ftpcrack) print("  ✓ FTPCrack.exe");
        if (this.tools.relaysmtp) print("  ✓ relaySMTP.exe");
        if (this.tools.httpworm) print("  ✓ HTTPWorm.exe");
        if (this.tools.sqlinject) print("  ✓ SQLInject.exe");
        print("");
        print(`Hacking Level: ${this.hackingLevel}`);
        print(`Money: $${this.ns.formatNumber(this.money)}`);
        print(`Home RAM: ${this.ns.formatRam(this.homeRam)}`);
        print("═══════════════════════════════════════════════════════════");
    }
}