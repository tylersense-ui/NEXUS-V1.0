# BN1 Roadmap

## Core Loop (BitNode-1)
1. Hack servers to earn money and hacking XP.
2. Buy RAM on `home` and purchased servers to increase threads.
3. Join factions, gain reputation, buy augmentations.
4. Install augmentations (soft reset), repeat stronger.
5. Unlock Daedalus, buy The Red Pill, hack `w0r1d_d43m0n`.

## Winning Condition (BN1)
- Join Daedalus faction.
- Buy The Red Pill augmentation from Daedalus.
- Install augmentations.
- Reach required hacking level for `w0r1d_d43m0n`.
- Run `hack w0r1d_d43m0n` (manual or scripted).

## Daedalus Gate Reminder
- Common path: high hacking + enough installed augmentations across resets.
- Practical target for this repo: focus hacking factions and repeated augmentation cycles.

## Key Server Progression
- Early: `n00dles` -> `foodnstuff` -> `joesguns` -> `nectar-net` -> `hong-fang-tea`
- Mid: `harakiri-sushi`, `iron-gym`, `sigma-cosmetics`
- Late: `phantasy`, `omega-net`, `the-hub`, `comptek`, `max-hardware`

## Port Programs (Rooting)
| Program | Ports Opened | Typical Unlock |
|---|---:|---|
| `BruteSSH.exe` | 1 | Buy/create (hacking ~50) |
| `FTPCrack.exe` | 2 | Buy/create (hacking ~100) |
| `relaySMTP.exe` | 3 | Buy/create (hacking ~250) |
| `HTTPWorm.exe` | 4 | Buy/create (hacking ~500) |
| `SQLInject.exe` | 5 | Buy/create (hacking ~750) |

## Key Factions (Path to Daedalus)
- `CyberSec` (backdoor `CSEC`)
- `NiteSec` (backdoor `avmnite-02h`)
- `The Black Hand` (backdoor `I.I.I.I`)
- `BitRunners` (backdoor `run4theh111z`)
- `Daedalus` (The Red Pill)

## Script Design Principles
- Keep worker scripts minimal (`hack`, `grow`, `weaken`).
- Keep orchestration on `home`.
- Prefer low-RAM control loops in early game.
- Upgrade to timed HWGW batching when RAM and income are high enough.

## Phase Plan

### Early Game (< 1m money, < 32GB home)
- Use sequential WGH/WGH-like loop on easy targets.
- Root every possible server as openers unlock.
- Deploy workers to all available rooted hosts.
- Primary objective: first 1m and first home RAM upgrades.

### Mid Game (> 1m money, > 64GB home)
- Switch to stronger target selector (money/security/time aware).
- Buy and upgrade purchased servers progressively.
- Start faction grind and augmentation queue planning.

### Late Game (many augs queued, advanced APIs unlocked)
- Move to full autopilot (faction work + aug buying + reset policy).
- Batch HWGW at scale while keeping targets at max money/min security.
- Reset on diminishing returns, then redeploy quickly.

## Operational Notes for This Repo
- Use `tail` logs for clarity over terminal spam.
- Always keep a low-RAM reporting path active in early game.
- Avoid scripts that consume all 8GB `home` at start.
- Prioritize money throughput first, then complexity.
