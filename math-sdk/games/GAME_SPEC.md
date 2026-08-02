# Space Mouflon — Game Design & Math Spec

Provider: Mochi Labs (mochi-labs)
Platform: Stake Engine (Carrot RGS) · single-player real-money slot
Status: Phase 2 (Design & math spec) — ✅ COMPLETE. Ready for Phase 3 (math model build).
Last updated: 2026-08-01

Legend: ✅ locked · 🔲 derived in tuning (Phase 4)

## Concept
- ✅ Mechanic: Tumble (cascade) + pay-anywhere win evaluation (Sweet Bonanza–style). Winning symbols are removed, remaining symbols fall, new symbols drop in from above, and wins re-evaluate. A single spin can chain multiple cascades until no new win lands.
- ✅ Theme / vibe: Space Mouflon — a cosmic wild ram (big glowing curved horns) drifting through deep space. Palette: deep space blues/violets, starfield, glowing gold/horn accents, nebula tones.
- ✅ Title (working): Space Mouflon

## Board
- ✅ Grid: 6 columns × 5 rows (30 tiles), fixed height.
- ✅ Win rule: pay-anywhere — 8+ of a kind anywhere on the grid pays (position-independent).
- ✅ Count tiers: 8–9 / 10–11 / 12+ (12+ = 12–30). Higher counts pay more per the paytable.

## Symbol set ✅ locked (11 symbols)

Low-pays (5) — board filler, color-coded cosmic gems (value order high→low):
1. Amber gem
2. Crimson gem
3. Teal gem
4. Blue gem
5. Violet gem

(Glowing, faceted, instantly distinguishable; designed to make cascades pop with color. Colour→value assignment is cosmetic and can be re-skinned freely.)

High-pays (4) — thematic heroes:
- Golden Mouflon — ram with glowing curved horns. Top symbol + face of the game.
- Astronaut Helmet — mirrored visor reflecting a nebula.
- Ringed Planet — Saturn-like world in-palette.
- Rocket — sleek retro cruiser.

Scatter (1):
- Wormhole Portal — swirling blue-violet vortex. 4+ anywhere triggers Free Spins, and pays on its own (see paytable). Visually distinct from every pay symbol so the trigger is never ambiguous.

Multiplier symbol (1) — Free Spins only:
- Cosmic Meteor — stamped with a value. During Free Spins these land, their values sum, and the total multiplies the entire cascade sequence for that spin.

Mouflon role: ✅ Top-pay hero and the Wormhole is the separate scatter — mascot appears constantly as the biggest regular symbol, while the bonus trigger stays a clean, distinct symbol.

## Paytable ✅ locked

Character: proven Sweet Bonanza shape — big hero-to-gem spread (~42:1 at the 12+ tier) for high volatility. Gems are cascade fuel; heroes are the events. All values are × total bet. No base-game wild.

| Symbol | 8–9 | 10–11 | 12+ |
|---|---|---|---|
| Golden Mouflon (top) | 10 | 25 | 50 |
| Astronaut Helmet | 3 | 10 | 25 |
| Ringed Planet | 2 | 5 | 15 |
| Rocket | 1.5 | 3 | 12 |
| Amber gem | 0.8 | 1.5 | 2.5 |
| Crimson gem | 0.6 | 1.2 | 2 |
| Teal gem | 0.5 | 1 | 1.8 |
| Blue gem | 0.4 | 0.8 | 1.5 |
| Violet gem | 0.25 | 0.6 | 1.2 |

Wormhole scatter self-pay (pays anywhere, on top of triggering Free Spins):

| Scatters | 4 | 5 | 6+ |
|---|---|---|---|
| Pays (× bet) | 4 | 10 | 100 |

SDK note: implement via pay_group with ranges (8,9), (10,11), (12,30) per symbol, then convert_range_table() to expand into self.paytable.

## Features ✅ locked
- ✅ Free Spins trigger — 4+ Wormhole scatters, scaling with scatter count:
  4 scatters → 10 spins · 5 → 12 · 6+ → 15
- ✅ Retrigger (during Free Spins) — scaling with scatter count:
  3 scatters → +5 · 4 → +8 · 5+ → +10
- ✅ Cosmic Meteor multipliers (Free Spins only) — values {2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100}×. Meteors on the board sum, then the total multiplies the full cascade payout for that spin.
- 🔲 Landing frequency + value weighting: tuned in Phase 4 (small values common, big rare).
- ✅ Bet modes (3) — each tuned to the same target RTP:
  - Base game — standard spin.
  - Ante-bet ("Double Chance") — +25% stake (1.25× total bet), ~2× scatter frequency.
  - Bonus Buy — instant Free Spins trigger, price ~100× bet (🔲 exact price set in Phase 4).
- ✅ No base-game wilds — deliberate; wilds spike win frequency and flatten volatility on a pay-anywhere board.

## Math targets ✅ locked
- ✅ Target RTP: 96.5% (all three bet modes tuned to the same figure).
- ✅ Volatility: High — natural fit; RTP concentrated in the bonus (roughly base ~30% / bonus ~66% + scatter-pay sliver), low base-game hit rate.
- ✅ Max-win cap: 20,000× — a round's total win is truncated at this ceiling.
- 🔲 Hit rate: derived during tuning (Phase 4).

## Build mapping (reference for Phase 3+)
- Math SDK base sample: the pay-anywhere / "scatter-pays" sample (games/0_0_scatter) plus the SDK's tumble calculation module — starting point for Phase 3.
- Frontend SDK base app: the matching pay-anywhere sample app (e.g. apps/scatter) — starting point for Phase 6.
- Outcome books, lookup tables and configs generate into games/<id>/library/publish_files/ for upload to the ACP at publish time (Phase 8).

## Decision log

Phase 2 — COMPLETE (locked 2026-08-01):
- Concept: tumble + pay-anywhere · theme Space Mouflon · title Space Mouflon
- Board: 6×5, pay 8+ anywhere, tiers 8–9 / 10–11 / 12+
- Symbols: full slate (5 gems, 4 heroes, Wormhole scatter, Cosmic Meteor)
- Paytable: baseline Sweet Bonanza shape (table above) + scatter self-pay 4/5/6+ = 4×/10×/100×
- Features: scaling FS trigger + scaling retrigger · meteors 2–100× (summed) · 3 bet modes (base / ante-bet / bonus buy) · no wilds
- Math targets: RTP 96.5% · High volatility · max win 20,000×

Next → Phase 3 (math model build): fork the scatter-pays sample, implement board / symbols / paytable, pay-anywhere + tumble win evaluation, Free Spins with summed meteors, the three bet modes, then run simulations. Tuning to the exact 96.5% RTP / High volatility / 20,000× cap is Phase 4.
