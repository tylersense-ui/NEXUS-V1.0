# NS API Reference (BN1 Focus)

## Always Available
```js
ns.hack(target)
ns.grow(target)
ns.weaken(target)

ns.getServerMaxMoney(host)
ns.getServerMoneyAvailable(host)
ns.getServerMinSecurityLevel(host)
ns.getServerSecurityLevel(host)
ns.getServerMaxRam(host)
ns.getServerUsedRam(host)
ns.getServerRequiredHackingLevel(host)
ns.getServerNumPortsRequired(host)

ns.getHackingLevel()
ns.scan(host)
ns.nuke(host)
ns.brutessh(host)
ns.ftpcrack(host)
ns.relaysmtp(host)
ns.httpworm(host)
ns.sqlinject(host)
ns.hasRootAccess(host)

ns.exec(script, host, threads, ...args)
ns.scp(files, host, source)
ns.ps(host)
ns.kill(pid)

ns.sleep(ms)
ns.print(msg)
ns.tprint(msg)
ns.args
ns.getHostname()

ns.getPurchasedServers()
ns.purchaseServer(name, ram)
ns.upgradePurchasedServer(host, ram)

ns.getPlayer()
ns.fileExists(file, host)
ns.wget(url, filename)
```

## Singularity API (Not BN1 default)
Requires BN4 or Source-File 4 access.

```js
ns.singularity.applyToCompany(company, field)
ns.singularity.workForCompany(company)
ns.singularity.joinFaction(faction)
ns.singularity.workForFaction(faction, workType)
ns.singularity.purchaseAugmentation(faction, aug)
ns.singularity.installAugmentations(callback)
ns.singularity.createProgram(program)
ns.singularity.getDarkwebPrograms()
ns.singularity.purchaseTor()
```

## Hacknet API
```js
ns.hacknet.numNodes()
ns.hacknet.purchaseNode()
ns.hacknet.upgradeLevel(i, n)
ns.hacknet.upgradeRam(i, n)
ns.hacknet.upgradeCore(i, n)
ns.hacknet.getNodeStats(i)
ns.hacknet.getLevelUpgradeCost(i, n)
ns.hacknet.getPurchaseNodeCost()
```

## Runtime Error Notes
- RAM exceeded: too many threads or controller too heavy. Reduce thread count or split load.
- Cannot be hacked yet: target hack requirement is above current hacking level.
- `TypeError: X is not a function`: wrong namespace or typo.
- Script crashed on async calls: missing `await` on timed NS calls (`hack/grow/weaken`).

## Async Rule
All timed NS calls must be awaited:

```js
await ns.hack(target)
await ns.grow(target)
await ns.weaken(target)
```

## Practical Guardrails
- Prefer one low-RAM orchestrator + tiny worker scripts.
- Never assume Singularity APIs are available in BN1 no-SF.
- Validate script RAM with `mem <script>` before deployment.
- Use `tail` for logs during debugging.
