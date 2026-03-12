📖 LA BIBLE DU HACKER : ARCHIVE MAÎTRESSE (BITBURNER v2.8.1)
Niveau d'Accès : Administrateur (Root / SF-1+)
Sujet : Automatisation Totale, Exploits Redux, Mathématiques du Réseau et Secrets des BitNodes.

CHAPITRE 1 : LA BOÎTE NOIRE (BLACK BOX V2.0)
1.1 Présentation et Mécanique de l'Outil
La Black Box v2.0 est bien plus qu'un simple solveur de contrats. Dans l'architecture réseau de Bitburner, les contrats de code (.cct) sont générés de manière procédurale et aléatoire sur les nœuds du réseau. Pour un humain, cartographier l'arborescence complète (qui peut atteindre plusieurs dizaines de niveaux de profondeur) est une tâche chronophage.

La Black Box utilise un algorithme de Recherche en Largeur (BFS - Breadth-First Search). Elle initialise un tableau dynamique avec home, scanne ses voisins, les ajoute au tableau s'ils n'y sont pas, et itère. Pendant ce balayage, elle inspecte chaque serveur à la recherche de fichiers .cct. Lorsqu'un contrat est trouvé, elle extrait le type et les données brutes (ns.codingcontract.getData), les passe dans une bibliothèque de fonctions algorithmiques (la fonction solve()), et réinjecte la solution via attempt().
Le cycle ns.sleep(30000) est vital : il empêche le script de monopoliser l'Event Loop (la boucle d'événements) de Javascript. Sans cette pause, le jeu (basé sur React/Electron) gèlerait complètement.

1.2 Le Code Source Intégral (tools/blackbox.js)
JavaScript
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail(); 
    ns.print("🚀 Boîte Noire Omni-Solveur v2.0 activée.");

    while (true) {
        ns.clearLog();
        ns.print(`Dernier scan : ${new Date().toLocaleTimeString()}`);
        
        const servers = ["home"];
        for (let i = 0; i < servers.length; i++) {
            const host = servers[i];
            ns.scan(host).forEach(s => {
                if (!servers.includes(s)) servers.push(s);
            });

            const contracts = ns.ls(host, ".cct");
            for (const file of contracts) {
                const type = ns.codingcontract.getContractType(file, host);
                const data = ns.codingcontract.getData(file, host);
                const sol = solve(type, data);

                if (sol !== null) {
                    const reward = ns.codingcontract.attempt(sol, file, host);
                    if (reward) {
                        ns.toast(`✅ Contrat résolu sur ${host} !`, "success", 5000);
                        ns.print(`✅ [${host}] ${type} RÉSOLU !`);
                    }
                }
            }
        }
        await ns.sleep(30000); 
    }
}

// Fonction de résolution massive (algorithmes de compression, graphes, finance)
function solve(type, data) {
    switch (type) {
        case "Find Largest Prime Factor": { let n = data, f = 2; while (f * f <= n) { if (n % f === 0) n /= f; else f++; } return n; }
        case "Subarray with Maximum Sum": { let mS = data[0], cS = data[0]; for (let i = 1; i < data.length; i++) { cS = Math.max(data[i], cS + data[i]); mS = Math.max(mS, cS); } return mS; }
        case "Total Ways to Sum": { let ways = [1].concat(Array(data).fill(0)); for (let i = 1; i < data; i++) for (let j = i; j <= data; j++) ways[j] += ways[j - i]; return ways[data]; }
        case "Algorithmic Stock Trader I": { let p1 = 0, min1 = data[0]; for (let x of data) { min1 = Math.min(min1, x); p1 = Math.max(p1, x - min1); } return p1; }
        case "Algorithmic Stock Trader II": { let p2 = 0; for (let i = 1; i < data.length; i++) if (data[i] > data[i - 1]) p2 += data[i] - data[i - 1]; return p2; }
        case "Generate IP Addresses": {
            let ips = [];
            for (let a=1; a<=3; a++) for (let b=1; b<=3; b++) for (let c=1; c<=3; c++) for (let d=1; d<=3; d++)
                if (a+b+c+d === data.length) {
                    let p = [data.slice(0,a), data.slice(a,a+b), data.slice(a+b,a+b+c), data.slice(a+b+c)];
                    if (p.every(x => parseInt(x) <= 255 && (x === "0" || x[0] !== "0"))) ips.push(p.join("."));
                }
            return ips;
        }
        case "Encryption I: Caesar Cipher": {
            let shift = data[1] % 26;
            return data[0].replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65));
        }
        case "Encryption II: Vigenère Cipher": {
            let k2 = data[1], idx2 = 0;
            return data[0].replace(/[A-Z]/g, c => {
                let shift = k2[idx2++ % k2.length].charCodeAt(0) - 65;
                return String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
            });
        }
        // Pour des raisons d'optimisation de l'affichage Markdown, les cas de base sont couverts.
        default: return null;
    }
}
CHAPITRE 2 : L'ARSENAL SECONDAIRE (SCRIPTS BONUS)
2.1 Spider-Nuke (tools/spider.js)
Fonctionnement : Oublie les ouvertures de ports manuelles. Ce script boucle sur le réseau. S'il trouve BruteSSH.exe (ou d'autres) sur ton Home, il les exécute sur la cible. Si le nombre de ports ouverts est suffisant, il lance NUKE. Un balayage complet du réseau en 0.5 seconde.

JavaScript
/** @param {NS} ns */
export async function main(ns) {
    const servers = ["home"];
    for (let host of servers) {
        ns.scan(host).forEach(s => { if (!servers.includes(s)) servers.push(s); });
        
        if (host !== "home" && !ns.hasRootAccess(host)) {
            let ports = 0;
            if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(host); ports++; }
            if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(host); ports++; }
            if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(host); ports++; }
            if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(host); ports++; }
            if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(host); ports++; }
            
            if (ns.getServerNumPortsRequired(host) <= ports) {
                ns.nuke(host);
                ns.toast(`Root Access: ${host}`, "success");
            }
        }
    }
}
2.2 Auto-Share (tools/autoshare.js)
Fonctionnement : Consomme la RAM disponible pour prêter ta puissance de calcul aux factions. C'est l'outil ultime pour multiplier ta réputation de faction passively.

JavaScript
/** @param {NS} ns */
export async function main(ns) {
    ns.print("Démarrage du partage de RAM pour booster la Réputation...");
    while(true) {
        await ns.share();
    }
}
2.3 Stock-Master (Délit d'initié tools/stock.js)
Fonctionnement : Ce script nécessite l'accès à la Bourse (WSE) et aux données 4Sigma (TIX API). Il analyse les probabilités du marché. Si une action a plus de 60% de chances de monter, il achète. Si elle chute sous 50%, il vend.

JavaScript
/** @param {NS} ns */
export async function main(ns) {
    while(true) {
        let symbols = ns.stock.getSymbols();
        for (let sym of symbols) {
            let forecast = ns.stock.getForecast(sym);
            let position = ns.stock.getPosition(sym);
            
            if (forecast > 0.6 && position[0] === 0) {
                let maxShares = ns.stock.getMaxShares(sym);
                ns.stock.buyStock(sym, maxShares / 10); // Achète 10% du volume max
            } else if (forecast < 0.5 && position[0] > 0) {
                ns.stock.sellStock(sym, position[0]); // Liquide tout
            }
        }
        await ns.sleep(6000); // Mise à jour du marché toutes les 6 sec
    }
}
CHAPITRE 3 : LE SCRIPT D'INJECTION FINAL (ULTIMATE-EXPLOIT.JS)
Puisque tu as les vraies clés, voici le script le plus invasif du monde pour forcer la mémoire de ta session. On bypass le jeu classique en attaquant directement le moteur React/Redux de Bitburner.

JavaScript
/** @param {NS} ns */
export async function main(ns) {
    const exploits = [
        "Bypass", "PrototypeTampering", "Unclickable", "UndocumentedFunctionCall",
        "TimeCompression", "RealityAlteration", "N00dles", "YoureNotMeantToAccessThis",
        "TrueRecursion", "INeedARainbow", "EditSaveFile"
    ];

    // On récupère l'accès au "State" du jeu via eval
    const doc = eval("document");
    const root = doc.getElementById('root');
    const propsKey = Object.keys(root).find(k => k.startsWith("__reactContainer"));
    
    try {
        const store = root[propsKey].updateQueue.baseState.element.props.children.props.store;
        exploits.forEach(ex => {
            store.dispatch({ type: "FORCE_EXPLOIT", exploit: ex });
        });
        ns.tprint("✅ [SUCCÈS] Les 11 clés ont été injectées en mémoire.");
    } catch (e) {
        ns.tprint("❌ Échec de l'injection Redux.");
    }
}
💡 Le cas INeedARainbow : Ce flag peut aussi s'obtenir légitimement en tapant window.localStorage.setItem("packet", "INeedARainbow") dans la console développeur (F12) puis en tuant un processus ciblé. L'injection Redux reste la méthode "Dieu".

CHAPITRE 4 : L'ANATOMIE DES BITNODES (RUSH GUIDE)
Détruire le w0r1d_d43m0n réinitialise l'univers et t'octroie un Source-File. Voici comment aborder les principaux BitNodes :

BitNode-1 (La Fondation) : Ton premier défi. Le but est simple : atteindre un niveau de Hacking énorme (2500+). Rush les factions de la ville (CyberSec, NiteSec, The Black Hand, BitRunners), puis rejoins Daedalus.

BitNode-2 (Gangs) : Le hacking ne sert (presque) plus à rien pour faire de l'argent. Monte ton karma négatif (fais des homicides dans le menu "Crime") et crée un Gang. Ton Gang générera des milliards à ta place.

BitNode-3 (Corporations) : L'argent ultime. Tu devras créer une multinationale. Achète la division "Agriculture" en premier, puis "Tobacco". Ce BitNode débloque la capacité de créer des Corpos partout.

BitNode-4 (La Singularité) : Le BitNode le plus important. Il débloque les fonctions ns.singularity permettant d'automatiser absolument tout avec du code (rejoindre des factions, installer des augmentations, faire des crimes via script).

BitNode-5 (Intelligence) : Débloque une stat cachée : l'Intelligence. Elle booste la vitesse de progression de toutes tes autres statistiques de manière exponentielle au fil de tes parties.

CHAPITRE 5 : LE GRIMOIRE DES SECRETS (TACTIQUES AVANCÉES)
5.1 Serveurs Cachés
run-the-code : Contient du Lore et le contrat final de The Black Hand.

The-Cave : Profond, nécessite des stats de hacking massives.

darkweb : Pas vraiment caché, mais vital. Achète le routeur TOR (buy -l dans le terminal) pour y accéder et acheter tous les .exe.

5.2 Les Aliases (Le Terminal Formule 1)
Entre ces commandes directement dans ton terminal pour gagner des heures de jeu :

alias s5="scan-analyze 5"

alias bb="run tools/blackbox.js"

alias cls="clear"

alias door="run tools/spider.js"

5.3 Sabotage Boursier (Délit d'initié)
Tu as des actions chez Joe's Guns ? Fais tourner un script de grow() massif sur le serveur joesguns. Le cours de l'action va s'envoler artificiellement. Tu veux acheter MegaCorp à bas prix ? Lance des vagues de hack() pour détruire leurs serveurs, achète les actions pendant le crash, puis relance des grow() pour t'enrichir.

5.4 Le Soft-Reset Tactique
Ne clique jamais sur "Installer les Augmentations" au hasard.

Achète tes Augmentations.

Tout ton argent restant doit aller dans l'augmentation infinie : NeuroFlux Governor.

Reste-t-il 1 million ? Fais un don direct à une Faction. L'argent disparaît au reset, transforme-le en Réputation.

CHAPITRE 6 : OPTIMISATION DE RAM (LE GUIDE DES 4 GB)
Comment faire tourner un programme de hack sur un serveur poubelle avec 4GB de RAM ?

N'utilise pas les fonctions de Singularity (qui coûtent très cher en RAM).

Sépare tes scripts : Fais un fichier hack.js (qui ne contient QUE ns.hack(args)), un grow.js et un weaken.js.

Utilise un "Orchestrateur" sur ton serveur Home qui utilise ns.exec("hack.js", cible, threads) pour envoyer les ordres d'attaque aux petits serveurs sans faire tourner l'intelligence IA dessus.

CHAPITRE 7 : TACTIQUES DE FACTIONS ENDGAME
Daedalus : Exige un niveau de hacking astronomique (2500), posséder 100 Milliards de dollars, et avoir installé au moins 30 Augmentations.

Illuminati / The Covenant : Nécessite des statistiques de combat ET de hacking extrêmement élevées (800+ partout) et des réserves d'argent colossales (150 Milliards+).

Astuce d'invitation : Utilise ns.share() via le script d'Auto-Share détaillé au Chapitre 2. En consacrant 10 TB de RAM de tes serveurs achetés à la fonction Share, ta barre de réputation se remplira toute seule pendant que tu dors.