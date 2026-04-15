# Audio assets

Phase 7 — 8 ambient loops and 1 UI chime. Drop compressed files into
this folder. The app already references them at the paths below; the
`AudioManager` will pick them up automatically on the next reload.

All filenames are hard-coded in `src/audio/AudioManager.tsx` and
`src/audio/playDingDing.ts`. Do **not** rename without updating both
files.

## Files expected

| Filename                 | Slot             | Description                                    |
| ------------------------ | ---------------- | ---------------------------------------------- |
| `tram_seated.mp3`        | Tram interior    | Wooden HK tram rolling on tracks, subtle clatter, no engine |
| `tram_ding.mp3`          | GO button chime  | Two quick tram bell rings, ~0.8s total         |
| `museum.mp3`             | The Museum       | Gallery hush — large-room reverb, faint footsteps, no speech |
| `christmas_village.mp3`  | Christmas Village| Soft winter wind + snow muffle (no sleigh bells) |
| `dreamery.mp3`           | The Dreamery     | Drifty ambient pad, no melody, no rhythm       |
| `aquarium.mp3`           | The Aquarium     | Pond water + evening crickets, calm not babbling |
| `gym.mp3`                | The Gym          | Fluorescent hum + fan room tone                |
| `terminus.mp3`           | The Terminus     | Quiet dusk HK street, distant traffic          |

## Format & budget

- **Format**: MP3 (OGG also fine — Howler handles both)
- **Length**: 30–60s for ambients, ~0.8s for the ding
- **Size per file**: < 200KB ambients, < 50KB ding
- **Total budget**: < 1.5MB across all 8 files
- **Compression recipe** (Audacity): mono, 22050 Hz, 64 kbps MP3 for
  ambients, 96 kbps for the ding

## Sourcing checklist (all CC0 / royalty-free)

Work through these on your phone. Listen to 30s before downloading —
reject anything with voices, recognizable melody, or sudden peaks.
Start with the easy slots to build momentum and save `dreamery` for
last (or generate it via Suno if nothing fits).

### Mixkit — https://mixkit.co/free-sound-effects/
No account, CC0, one-click MP3 download. Recommended search pages:

- **tram_seated** → https://mixkit.co/free-sound-effects/train/
  — pick an "interior" or "inside carriage" loop
- **tram_ding** → https://mixkit.co/free-sound-effects/bell/
  — search for "bell ring" or "trolley"; if you only find a single
  ring, use Audacity to paste-twice with a 200ms gap
- **museum** → https://mixkit.co/free-sound-effects/ambience/
  — search "large hall" or "room tone"
- **christmas_village** → https://mixkit.co/free-sound-effects/wind/
  — any "soft wind" or "winter breeze" loop (avoid "howling wind")
- **aquarium** → https://mixkit.co/free-sound-effects/water/
  + https://mixkit.co/free-sound-effects/nature/ — layer a calm water
  loop with a crickets loop in Audacity if you want both
- **gym** → https://mixkit.co/free-sound-effects/ambience/
  — search "fan" or "hum"
- **terminus** → https://mixkit.co/free-sound-effects/city/
  — "distant traffic" or "quiet street night"

### Pixabay — https://pixabay.com/sound-effects/
No attribution required, free account optional. Good fallback for
slots Mixkit doesn't cover well. Direct searches:

- **dreamery** → https://pixabay.com/sound-effects/search/ambient%20pad/
  — filter by 30s–1min, avoid anything tagged "meditation"

### Freesound — https://freesound.org/
Filter by "license: Creative Commons 0" on every search. Richer
catalog than Mixkit but requires an account.

### Dreamery fallback (if nothing fits after 15 min)

Generate one at https://suno.com/ (free tier, no login for short
clips). Prompt: *"ambient soft pad slow drift no melody calm dreamy
60 seconds mono"*. Export, trim the tails in Audacity, and drop as
`dreamery.mp3`.

## Graceful degradation

The `AudioManager` won't crash if any of these files are missing —
Howler logs a load error to the console and the slot plays silence.
You can ship the code path first and fill in files in any order.

## Sandbox note

The repo was wired up from a sandboxed agent session that could only
reach `github.com` / `raw.githubusercontent.com`. Mixkit, Pixabay, and
Freesound CDNs all 403'd, so no files were auto-downloaded — this
README is the compromise. Everything above is licensed for
commercial use without attribution when sourced from the links given.
