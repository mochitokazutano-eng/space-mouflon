# Space Mouflon

#### Summary:

* A 6-reel, 5-row pay-anywhere tumbling (cascading) game.
* 9 paying symbols total (4 high, 5 low) + Wormhole Portal scatter (self-pays too).
* No wilds anywhere in the game (deliberate design choice, see GAME_SPEC.md).
* Cosmic Meteor ("M") is a Free-Spins-only multiplier symbol, no paytable entry of its own.

Symbol payouts are grouped by cluster-size tiers (8-9), (10-11), (12-30).
Wormhole scatter self-pay tiers: (4-4), (5-5), (6-30).

#### Basegame:

Minimum of 4 Wormhole scatters needed for Free Spins trigger, scaling with count:
  4 -> 10 spins, 5 -> 12 spins, 6+ -> 15 spins

#### Freegame rules

Retrigger requires a minimum of 3 Wormhole scatters, scaling with count:
  3 -> +5 spins, 4 -> +8 spins, 5+ -> +10 spins

Cosmic Meteor symbols only appear in Free Spins. They carry no per-symbol
multiplier increment (unlike the original scatter-pays sample's "global
multiplier" mechanic, which this game does not use). Instead, once a spin's
whole cascade sequence finishes with no further wins, all Cosmic Meteor
values currently sitting on the board are summed and that sum multiplies the
spin's entire accumulated cascade win (see `set_end_tumble_event` in
game_executables.py, using `get_board_multipliers()`).

#### Bet modes

* base   - standard spin, cost 1.0x.
* ante   - "Double Chance", cost 1.25x, ~2x scatter frequency (uses the ANTE0 reelstrip).
* bonus  - Bonus Buy, cost ~100x, instantly forces a Free Spins trigger.

#### Notes

Due to the potential for symbols to tumble into the active board area, there
is no upper limit enforced on the number of freegame spins beyond the
scaling-retrigger table in game_config.py. Reel weightings (BR0/ANTE0/FR0/WCAP)
and Cosmic Meteor value weights (`GameConfig.mult_values`) are Phase 3
placeholders -- exact tuning to 96.5% RTP / high volatility / 20,000x cap is
Phase 4 work via the Rust optimization program.

#### Event descriptions

"winInfo" summarises winning combinations, including symbol positions and pay info [passed for every tumble event].
"boardMultiplierInfo" reports the Cosmic Meteor positions/values and the sum applied to that spin's cascade win (Free Spins only).
"setWin" is the result for one whole reveal-to-next-reveal cycle (i.e. one full cascade sequence for one spin).
"setTotalWin" is the cumulative win for a round. In the base game this equals setWin; in Free Spins it increases across spins.
