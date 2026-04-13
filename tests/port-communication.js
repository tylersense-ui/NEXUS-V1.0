/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    ns.tprint('╔════════════════════════════════════════╗');
    ns.tprint('║  🧪 TEST PORT COMMUNICATION           ║');
    ns.tprint('╚════════════════════════════════════════╝');
    ns.tprint('');
    
    // Test 1 : Écrire dans PORT 1
    ns.tprint('[TEST 1] Écriture dans PORT 1...');
    
    const testData = {
        type: 'test',
        timestamp: Date.now(),
        message: 'Hello from test script'
    };
    
    ns.writePort(1, JSON.stringify(testData));
    ns.tprint('  ✓ Message écrit dans PORT 1');
    
    await ns.sleep(100);
    
    // Test 2 : Lire depuis PORT 1
    ns.tprint('[TEST 2] Lecture depuis PORT 1...');
    
    const data = ns.readPort(1);
    
    if (data === "NULL PORT DATA") {
        ns.tprint('  ❌ PORT 1 est VIDE');
    } else {
        try {
            const parsed = JSON.parse(data);
            ns.tprint(`  ✓ Message lu : ${parsed.message}`);
        } catch (e) {
            ns.tprint(`  ❌ Erreur parsing : ${e}`);
        }
    }
    
    // Test 3 : Vérifier si controller tourne
    ns.tprint('');
    ns.tprint('[TEST 3] Vérification controller...');
    
    const processes = ns.ps('home');
    const controllerProc = processes.find(p => 
        p.filename.includes('controller.js')
    );
    
    if (controllerProc) {
        ns.tprint(`  ✓ Controller actif (PID ${controllerProc.pid})`);
    } else {
        ns.tprint('  ❌ Controller NON actif');
    }
    
    // Test 4 : Flood test
    ns.tprint('');
    ns.tprint('[TEST 4] Flood test (100 messages)...');
    
    ns.clearPort(2); // Use PORT 2 for this test
    
    for (let i = 0; i < 100; i++) {
        ns.writePort(2, JSON.stringify({ id: i }));
    }
    
    await ns.sleep(100);
    
    let readCount = 0;
    while (ns.peek(2) !== "NULL PORT DATA") {
        ns.readPort(2);
        readCount++;
    }
    
    ns.tprint(`  Messages écrits : 100`);
    ns.tprint(`  Messages lus    : ${readCount}`);
    
    if (readCount < 100) {
        ns.tprint(`  ⚠️  PORT OVERFLOW détecté (${100 - readCount} perdus)`);
    } else {
        ns.tprint(`  ✓ Pas d'overflow`);
    }
    
    ns.tprint('');
    ns.tprint('═══════════════════════════════════════');
    ns.tprint('TEST TERMINÉ');
}