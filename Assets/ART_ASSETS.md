# Space Mouflon — Art Assets (Phase 5)

**Provider:** Mochi Labs · **Style:** neon-vector, faceted, deep-space + gold rim-light · **Treatment:** A (slim gold-rim)
All source art is SVG (resolution-independent). PNGs are transparent exports for the frontend.

## Tree
```
symbols/
  gems/{svg,png}      gem_amber gem_crimson gem_teal gem_blue gem_violet   (512px)
  heroes/{svg,png}    hero_mouflon hero_helmet hero_planet hero_rocket     (512px)
  special/{svg,png}   scatter_wormhole  meteor_multiplier                  (512px)
backgrounds/
  landscape/{svg,png} bg_base  bg_freespins                               (1920x1080)
  portrait/{svg,png}  bg_base_portrait  bg_freespins_portrait              (1080x1920)
ui/
  screens/{svg,png}   screen_landscape  screen_portrait   (assembled reference mockups)
  elements/{svg,png}  btn_spin btn_minus btn_plus plate_value plate_name
                        pill_on pill_off frame_reels icon_menu icon_sound
                        icon_auto icon_bolt icon_info        (2x PNG exports)
```

## Symbol → math ID mapping (confirm against games/space_mouflon config)
| Art file            | Role                    | Suggested ID |
|---------------------|-------------------------|--------------|
| hero_mouflon        | high-pay 1 (top)        | H1           |
| hero_helmet         | high-pay 2              | H2           |
| hero_planet         | high-pay 3              | H3           |
| hero_rocket         | high-pay 4              | H4           |
| gem_amber           | low-pay 1               | L1           |
| gem_crimson         | low-pay 2               | L2           |
| gem_teal            | low-pay 3               | L3           |
| gem_blue            | low-pay 4               | L4           |
| gem_violet          | low-pay 5               | L5           |
| scatter_wormhole    | scatter (free spins)    | S            |
| meteor_multiplier   | multiplier (FS only)    | M            |

## Notes for Phase 6 (frontend)
- **Meteor value is drawn live.** `meteor_multiplier` ships with an EMPTY gold badge — render the 2x–100x number as text centered on the badge; never bake it into the art.
- **Symbols** are square, centered, with a consistent safe-area — drop straight onto reel cells; re-export at your atlas size from the SVG.
- **Backgrounds**: swap base ↔ freespins on bonus enter/exit. Reel area is kept calm; safe to seat the frame over it.
- **UI elements** are the branded pieces (frame, spin, nameplate, icons). Steppers/pills/labels can be built in-engine using the tokens below so they scale crisply.

## Style tokens
- Deep space `#0b0a2e`  ·  panel `#141152` / `#181447`
- Nebula violet `#7c3aed`  ·  magenta `#ec4899`
- Horn gold `#f6c445`  (gradient `#ffe9a3 → #f6c445 → #b8860b`)
- Gems: amber `#f59e0b` · crimson `#e11d48` · teal `#14b8a6` · blue `#3b82f6` · violet `#8b5cf6`
- Rim-light `#fff2c2`  ·  glowing eye/portal core `#bff1ff`
