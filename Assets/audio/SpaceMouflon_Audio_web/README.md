# Space Mouflon — Audio Pack v1

Mochi Labs · 35 cues · procedurally synthesized (numpy/scipy) · 44.1 kHz stereo

**Style:** cosmic synthwave — analog pads, detuned saws, gated plucks, sub bass, metallic
bells and gold shimmer. Everything is in **A minor**, so any two cues can overlap without
clashing. Base game 110 BPM, free spins 124 BPM, big-win stingers 120 BPM.

---

## What's in here

```
ogg/    35 × Vorbis q5   ← use these
mp3/    35 × LAME V4     ← fallback only
wav/    35 × 16-bit PCM  ← masters, if you want to edit in a DAW
audio_manifest.json      ← keys, durations, loop flags, bus + gain per cue
SpaceMouflon_Audio.html  ← open in a browser to audition everything
src/                     ← the generators, so you can re-roll any sound
```

## ⚠️ Use OGG for anything that loops

Vorbis is sample-exact: a 17.000 s loop decodes to exactly 17.000 s. LAME adds ~40 ms of
encoder padding to **every** MP3, which puts an audible gap in a loop. The MP3s are there
purely as a fallback for browsers without Vorbis (basically only old Safari). Howler's
`src: ['x.ogg','x.mp3']` fallback order handles this for you — just never ship an MP3 as
the primary source for a `loop: true` cue.

## Levels

Every cue is peak-normalized with headroom, not loudness-maxed, so you mix with bus gains
rather than fighting baked-in levels. Starting point (already in the manifest):

| bus   | gain | why |
|-------|------|-----|
| music | 0.45 | sits under everything |
| sfx   | 0.85 | the game's voice |
| ui    | 0.70 | clicks shouldn't compete with wins |

Per-cue `gain` in the manifest is a second trim on top of the bus.

## The set

**Music (loops)**
`bgm_main` 130.91 s · `bgm_freespin` 69.68 s

`bgm_main` is built as 15 four-bar cycles with real sections: pad intro → drums and bass
enter at 0:35 → full melody at 1:10 → breakdown at 1:45 → loops back. It doesn't feel like
a 4-bar loop on repeat, which matters when a player sits on it for 40 minutes.
`bgm_freespin` is the same key and progression at a higher tempo, so you can hard-cut or
crossfade between them and it stays musical.

**Core spin / reel**
`sfx_btn_spin` · `sfx_btn_general` · `sfx_reel_stop_1..6` · `sfx_symbols_landing`

Six reel-stop variants, each a fraction of a semitone up. Use `sfx_reel_stop_1` for every
reel if you want it simple, or fire `_1.._6` left-to-right for a rising cadence as the
board fills — costs nothing and reads as much more expensive.

**Tumble wins** — `tumble_win_1..5`

Escalating pitch. Index by cascade chain step and clamp at 5. Long cascades are the payoff
moment of a pay-anywhere game; the rising pitch is what makes a 7-chain feel like an event.

**Win levels** — `sfx_winlevel_small` / `standard` / `nice` / `substantial`

**Scatter / free spins**
`sfx_scatter_stop_1..4` · `sfx_scatter_win` · `jng_intro_fs`

The four scatter stops climb in pitch. Play them by scatter count, not reel index — the
4th one is your trigger and it should land loudest. Duck `bgm_main` under `jng_intro_fs`,
then swap to `bgm_freespin`.

**Cosmic Meteor multiplier** — your signature four
`sfx_multiplier_landing` · `sfx_multiplier_combine_a` · `sfx_multiplier_up` · `sfx_multiplier_win`

- `landing` — doppler screech in, impact, ember crackle
- `combine_a` — three bells glide together and merge into one; pitch convergence is the
  "these are summing" cue
- `up` — accelerating ratchet resolving on a bell at **1.03 s**; land the final number there
- `win` — two-stage: impact at **0.85 s**, C-major payoff at **2.0 s**. Time the multiplier
  slamming onto the win total to the first hit and the number finishing its count-up to the
  second.

**Big-win escalation**
`bgm_winlevel_big` / `epic` / `mega` (8.000 s loops) · `sfx_bigwin_coinloop` (17.000 s loop)
· `sfx_youwon_panel`

Loop a stinger + the coin loop under the count-up, escalate tier as the number climbs, then
stop both and fire `sfx_youwon_panel`.

## Wiring it up (web-sdk / Howler)

```ts
import manifest from './audio_manifest.json';

const buses = { music: 0.45, sfx: 0.85, ui: 0.70 };
const sounds = Object.fromEntries(manifest.sounds.map(s => [s.key, new Howl({
  src: [`/audio/${s.ogg}`, `/audio/${s.mp3}`],
  loop: s.loop,
  volume: s.gain * buses[s.bus],
  preload: s.bus === 'music' ? false : true,   // stream the long beds
})]));

const play = (key: string) => sounds[key]?.play();
```

Preload the SFX, lazy-load the two long beds — the whole OGG set is 5 MB, of which
`bgm_main` alone is 2.1 MB.

**Event hooks for the tumble mechanic:**

```
spin pressed        → sfx_btn_spin
each reel settles   → sfx_reel_stop_{reelIndex+1}
board filled        → sfx_symbols_landing
cascade win (n)     → tumble_win_{min(n,5)}
spin resolves       → sfx_winlevel_{tier}
scatter lands (k)   → sfx_scatter_stop_{min(k,4)}
4+ scatters         → sfx_scatter_win → jng_intro_fs → crossfade bgm_freespin
meteor lands        → sfx_multiplier_landing
meteors sum         → sfx_multiplier_combine_a  (+ sfx_multiplier_up on the readout)
multiplier applied  → sfx_multiplier_win
big win count-up    → loop bgm_winlevel_{tier} + sfx_bigwin_coinloop
count-up ends       → stop both → sfx_youwon_panel
```

## Re-rolling a sound

Everything is deterministic (seeded RNG in `src/synth.py`). To change one cue, edit its
block in `src/gen_sfx.py` and re-run — the rest are unaffected.

```bash
cd src && python3 gen_sfx.py        # ~35 s for all SFX
cd src && python3 gen_music.py      # ~7 min for the music
```

Then re-encode:

```bash
for f in wav/*.wav; do b=$(basename "$f" .wav)
  ffmpeg -y -i "$f" -c:a libvorbis -qscale:a 5 "ogg/$b.ogg"
  ffmpeg -y -i "$f" -c:a libmp3lame -qscale:a 4 "mp3/$b.mp3"; done
```

Common knobs: `bright`/`inharm` on `bell()`, `bright`/`decay` on `pluck()`, the `PROG`
chord table at the top of `gen_music.py`, and the `master()` EQ chain if you want the whole
set darker or brighter.

## Honest limitations

This is synthesis, not a scoring session. It's coherent, on-theme, correctly timed and
mix-balanced — good enough to ship an indie title and more than good enough to build and
demo the frontend against. What it isn't: live instruments, a human melody performance, or
the sample-library polish of a Pragmatic/Push release. If Space Mouflon does well, the two
BGMs are the first thing worth paying a composer to replace — the SFX will hold up longer.
