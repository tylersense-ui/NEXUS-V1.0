/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("Test écriture dans /logs/...");
    
    try {
        ns.write("/logs/test.log", "HELLO WORLD\n", "w");
        ns.tprint("✅ Fichier écrit !");
        
        if (ns.fileExists("/logs/test.log")) {
            const content = ns.read("/logs/test.log");
            ns.tprint("✅ Fichier lu : " + content);
        } else {
            ns.tprint("❌ Fichier n'existe pas après écriture");
        }
        
    } catch (error) {
        ns.tprint("❌ ERREUR : " + error.message);
    }
}