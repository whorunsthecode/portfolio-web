# Walled City — Shop Street Extension (design spec)

**Date:** 2026-05-01
**Branch target:** `reel` (deploys to hongkong1985.vercel.app)
**Status:** Approved by user across 5 sections — ready for implementation plan

## 1. Goal

Extend the Kowloon Walled City alley with a 25m shop-lined section that ends at a fruit-stall dead end. Three detailed shops (士多, 強記冰室, 生果檔) plus the existing Salon become the player's interactable touchpoints in the world. The new section feels claustrophobic, mazelike, and slightly disorienting — true to KWC.

## 2. World geometry

Coordinates are in WalledCity-local space (group is offset by `WORLD_X = 100` in world space).

### 2.1 Alley extension

- **Current alley:** x ∈ [−0.8, +0.8], z ∈ [−5, +4.8] (~10m). Stays as-is.
- **Extension:** new section from z=−5 down to z=−30 (~25m). Total alley length becomes ~35m.
- **Dogleg at z=−14:** alley jogs west by 2m over a 2m transition (z=−14 to z=−16). After the dogleg, the alley axis runs along x=−2 instead of x=0. From the entrance you cannot see past the dogleg; from the dead end you cannot see the entrance.

| Segment | z range | center x | width |
|---|---|---|---|
| Entrance straight | +4.8 to −14 | 0 | 1.6m |
| Dogleg transition | −14 to −16 | bends 0 → −2 | 1.6m |
| Deep straight | −16 to −30 | −2 | 1.6m |

### 2.2 Stairwell to rooftop (preserved)

- The existing axial stairwell (z=−11 to −5) is **rotated 90°** to become a perpendicular branch off the entrance segment.
- New stairwell footprint: x ∈ [−6, −0.8], z ∈ [−9, −8] (1m wide × 5.2m long, ramps up to y=5).
- Visually tucked — narrow opening, no light spill, easy to miss. Player wandering looking for the rooftop has to find it.
- `Rooftop.tsx` and `PlaneFlyover.tsx` are unchanged. Rooftop deck position above stays the same.

### 2.3 Side corridors (existing + new)

Existing 3 corridors stay (`SideCorridors.CORRIDORS`):
- z=−2.5 left (laundry knot)
- z=+1.5 right (lit window)
- z=−0.4 right (Salon doorway shim)

Two new corridors added along the extension:
- **z=−12 right — false-path** that bends out of sight before dead-ending. Player sees it curving into darkness. Walks in, finds it blocked. ~2m deep with a bend at 1.5m.
- **z=−25 left — vertical-sign alcove** with a hanging wood "九龍城寨業主聯誼會" sign. Shallow (1m deep).

### 2.4 Lighting along the new run

- **Entrance segment + dogleg:** lit similarly to existing alley — uneven warm-bulb pools, fluorescent flicker, ~5–8m visibility forward at any time.
- **Past the dogleg (z=−16 onward):** noticeably dimmer. More dead/flickering fluorescent tubes than live ones. By z=−25 it's just edges of glow from 強記冰室 plus ambient bleed.
- **Dead end (z=−28 to −30):** darkest. Fruit stall reads mostly as silhouette with rim lighting from a distant alley bulb.

### 2.5 Navigation bounds (FirstPersonControls)

- Main alley: split into 2 rectangles for the dogleg (entrance segment z=+4.8 to −14 at x=0±0.8; deep segment z=−16 to −30 at x=−2±0.8) plus the small dogleg transition rectangle.
- 強記冰室 walk-in: x ∈ [+0.9, +2.9], z ∈ [−18, −22], y ∈ [0, 2.8]
- Salon zones: unchanged
- Stairwell: rotated bounds reflecting perpendicular ramp
- New side corridors: standard CORRIDOR_BOUNDS pattern
- Rooftop bound: unchanged
- 生果檔: NO interior bound (player walks past at street level)

## 3. The three detailed shops

### 3.1 士多 (Sundry Shop) — left side, z=−5 to −8

**File:** `src/worlds/WalledCity/Sundry.tsx` (~700 lines)

**Style:** street-facing, look-only. Player stops at the gate, looks in, can't enter. The HUD glow + tooltip handles "look here."

**Frontage:**
- Iron rolling gate, half-pulled, revealing the shop interior 0.5m back from the alley wall
- Single hanging bulb under the eave, swaying barely-perceptibly
- White lace-fringe trim along the counter front
- 2 worn wooden chairs on the alley floor outside the gate, with empty teacups on a small wooden crate between them (the sit-and-chat spot)

**Interior** (1.5m wide × 2m deep × 2.8m ceiling):
- 4 layers of shelves on the back wall (per spec, denser than original — floor-to-ceiling per references):
  - Bottom: glass jars of bulk candy/dried fruit (instanced clones, lit from inside)
  - Lower-middle: cans (午餐肉, 鷹嘜煉奶, 雙喜豆豉鯪魚 textures, ~6 unique designs instanced)
  - Upper-middle: cigarette stacks (Marlboro red/white, 555 gold/blue) — instanced row of small white boxes
  - Top: tall round red biscuit tins as visual repetition
- Counter (left wall) with red abacus, black rotary phone
- Small ice-box / fridge with **bottle opener tied on string** (per reference)
- Glass-bottle sodas inside fridge (Coke, Vitasoy, Cream Soda) — emissive cool glow

**Person figure:** 1 shopkeeper standing behind the counter (style: reuses TramPassengers character meshes via ShopFigures.tsx)

### 3.2 強記冰室 (Keung Kee Bing Sutt) — right side, z=−18 to −22

**Files (split for sanity):** `src/worlds/WalledCity/BingSutt/{index, Frontage, Counter, Booths, Decor}.tsx` (~1,800 lines total)

**Style:** walk-in. The cinematic centerpiece of the new run.

**Frontage:**
- Green steel-framed shopfront with sliding glass doors (one open)
- Calligraphic menu papers plastered on the glass (red over carbon paper)
- Vertical "**強記冰室**" sign hanging perpendicular over the doorway, calligraphic gold-on-red
- "歡迎光臨" red banner inside above the entrance

**Interior** (2m wide × 4m deep × 2.8m ceiling):
- **Floor:** small mosaic tile, blue/cyan/cream busy pattern (per reference imagery)
- **Booths:** 1 set of green vinyl booths along the left wall, wood frames, brown tape patches, stacked menus on table
- **Octagonal table** (1) in the center with red metal-frame stools (wood seats)
- **Wall menus:** vertical red paper strips floor-to-ceiling above the counter, ~10 dishes per strip — single texture, not individual planes
- **Counter** (right wall, back): marble-faced with metal trim, glass display case for pastries (蛋撻, 菠蘿油, 雞尾包 — instanced clones with subtle position jitter), espresso/coffee setup
- **2-blade ceiling fan**, slow rotation (animated)
- **Wall-mounted vintage radio** (replaces the CRT TV from the spec — space too tight for TV)
- **Framed Chinese ink-landscape painting** on the wall
- **Lattice screen partition** between booth and table sections
- **Kitchen** behind a curtain at the back — not walkable; glimpses of stove flame + escaping steam through the curtain gap (particle hint, no audio in v1)
- **Paused wall clock** stuck at 3:15

**Lighting:** warm yellow ceiling pendants over the table + booth, fridge case glows cool, kitchen leaks orange flame light through the curtain gap.

**Person figures:** 2 customers — 1 seated in the booth, 1 at the octagonal table. Style reused from TramPassengers via ShopFigures.tsx. One has unfinished tea + half-eaten siu yuk over rice in front of them (the recent-evidence cue on top of the figures themselves).

### 3.3 生果檔 (Fruit Stall) — dead-end, z=−28 to −30

**File:** `src/worlds/WalledCity/FruitStall.tsx` (~500 lines)

**Style:** street-only, blocks the alley dead end (1.5m wide, fully blocking). Player can't go further — must turn around.

**Setup:**
- Hand-painted wooden sign overhead: "**生果**" in red, paint cracked, "果" character half-faded — hangs from a rusted bar tied with hemp rope
- **Stacked wooden crates** (instanced): apples, oranges, pears — some crates show fruit with brown spots
- **Bamboo baskets** (instanced) at lower level: bananas (black-spotted), papaya, watermelon halves
- **Cardboard boxes** on the ground: durian, mangosteen — partially open
- **Fruit spilled onto the road** in front: lychees, longan with leafy stems still attached
- **Wet glistening floor** beneath — darker patch + thin transparent overlay for sheen, fruit residue in muddy green-brown
- **Owner's empty red plastic stool** behind the stall, knocked slightly askew (the still-warm cue)
- **Old hand-scale** with metal pan + rope hanging from a wood bar
- **Red-white-blue striped plastic bag** (紅白藍) hanging on a hook
- **Particle effect:** ~20 tiny dark fruit-fly specks orbiting the rotting fruit, slow random drift

**Lighting:** no dedicated source. Pure ambient bleed from the alley behind. Reads mostly as silhouette with rim lighting from the nearest alley bulb (z≈−22).

**No person figure.** The empty-stool cue stays.

## 4. Continuous KWC frontage along the extension

No new shop-frontage components. The walls between/around the 3 shops are continuous KWC apartment frontage built by extending existing components.

**Components extended along the new 25m run:**
- `AlleyShell` — refactored to handle 3 segments (entrance straight, dogleg transition, deep straight). Generates floor + ceiling + walls per segment.
- `ApartmentFacades` — new procedural slots along the new walls (windows with bars, AC units, hanging laundry, shutter panels). Skip slots where shops occupy walls.
- `PipeWeb` — extends overhead the full new length, density bumped 1.5× past the dogleg (per maze brief).
- `MailSlots` — sprinkle along the new wall segments where apartments stack above.
- `DentistSigns` — 2–3 more iconic light-up signs along the new run, including past the dogleg.
- `PosterLayers` — torn poster layers continue, with 1–2 dense clusters near the side-corridor entrances.
- `FluorescentTubes` — uneven scatter along the new run; past the dogleg, more dead/flickering than live.
- `Clutter` — extends with bagged trash, broken stools, stacked crates against walls between shops.

**New small components:**
- `AlleyDogleg` (~80 lines) — the 2m transition shell at z=−14 to −16
- 2 new entries in `SideCorridors.CORRIDORS` (z=−12 right false-path, z=−25 left vertical-sign alcove)
- `ShopFigures.tsx` (~300 lines) — wraps reused TramPassengers character meshes in seated/standing poses for the 3 shop figures

## 5. HUD affordance system

**File:** `src/worlds/WalledCity/InteractableHUD.tsx` (~250 lines), mounted alongside the WalledCity world.

### 5.1 Interactables

Four hard-coded entries:

| id | name (中) | name (Eng) | kind | center pos (local) |
|---|---|---|---|---|
| `salon` | 理髮室 | Salon | walk-in | existing salon doorway |
| `bing-sutt` | 強記冰室 | Keung Kee Café | walk-in | (+1.9, 1.4, −20) |
| `sundry` | 士多 | Sundry Shop | look-only | (−0.9, 1.4, −6.5) |
| `fruit-stall` | 生果檔 | Fruit Stall | look-only | (−2, 1.0, −29) |

### 5.2 Diegetic glow

- Each interactable has a soft warm point light (`#ffb060`) at the doorway/frontage center, disabled by default.
- Each frame, distance from camera is checked. Within **3.5m**, the light fades up over ~250ms; beyond, fades down.
- **Maximum 2 active lights at a time** (the closest two) — prevents the deep alley from lighting up everything.
- Peak intensity 1.2, distance 3m. Subtle augment to existing shop lighting.

### 5.3 Spatial tooltip

- DOM overlay positioned over the canvas (matches existing HUD pattern in `src/HUD.tsx`).
- Pinned in screen-space at the bottom-center.
- **Visible when:** closest interactable is within 3.5m AND camera-forward · interactable-facing-normal > 0.6 (~50° cone) AND has been facing it for >0.4s (debounce).
- **Style:** thin frosted-dark pill. Larger type for 中文 name; smaller below for English name; kind hint ("Enter ▸" for walk-in, "View ▸" for look-only).
- Fades in/out over 200ms.
- Period-light styling — deliberately NOT "PRESS E"-style.

### 5.4 Accessibility + mobile

- `prefers-reduced-motion`: skip fade, snap on/off (existing app respects this).
- Mobile: glow works as-is. Tooltip stays. No new touch interaction — walk-in is via existing WASD/joystick movement.

### 5.5 What "interaction" means

- **Walk-in (Salon, 冰室):** nothing extra — player walks through the doorway. Glow + tooltip is wayfinding only.
- **Look-only (士多, 生果檔):** nothing extra — player stops, looks, tooltip appears, that's the moment. No camera lock, no zoom, no popup.

## 6. Touchpoints to existing code

### 6.1 Files that change

- `src/worlds/WalledCity/index.tsx` — mount new components; rewrite `BOUNDS` (split alley into 2 rectangles for dogleg, add 冰室 walk-in zone, add new corridor bounds, rotate stairwell bound); add 2 new entries in `CORRIDORS`.
- `src/worlds/WalledCity/AlleyShell.tsx` — refactor to build 3 alley segments instead of 1.
- `src/worlds/WalledCity/Stairwell.tsx` — rotate 90°. `stairFloor()` ramps along X axis instead of Z.
- `src/worlds/WalledCity/PipeWeb.tsx`, `FluorescentTubes.tsx`, `MailSlots.tsx`, `DentistSigns.tsx`, `PosterLayers.tsx`, `ApartmentFacades.tsx`, `Clutter.tsx` — each extends scatter range to z=−30 (most already procedural, small edits).
- `src/worlds/WalledCity/SideCorridors.tsx` — append 2 new CORRIDOR defs.

### 6.2 Files that don't change

- `Salon.tsx` — untouched (just gets a new HUD entry pointing at it).
- `Rooftop.tsx`, `PlaneFlyover.tsx` — untouched (rooftop preserved).
- `WorldManager`, `App`, `store`, top-level `HUD`, `Scene`, tram cabin, traffic, landmarks — untouched. Feature is contained inside the WalledCity world.
- `TramPassengers.tsx` — not changed, but its character mesh definitions are imported by `ShopFigures.tsx` for visual consistency.

### 6.3 New files

- `src/worlds/WalledCity/Sundry.tsx` (~700 lines)
- `src/worlds/WalledCity/BingSutt/{index, Frontage, Counter, Booths, Decor}.tsx` (~1,800 lines total)
- `src/worlds/WalledCity/FruitStall.tsx` (~500 lines)
- `src/worlds/WalledCity/AlleyDogleg.tsx` (~80 lines)
- `src/worlds/WalledCity/InteractableHUD.tsx` (~250 lines)
- `src/worlds/WalledCity/ShopFigures.tsx` (~300 lines)

### 6.4 Conventions

- **InstancedMesh from line 1** for repeated props (cans, bottles, fruit boxes, pastries, glass jars). Per the instancing memory.
- No new dependencies, no env changes, no Vercel project changes.
- Ships via push to `reel` branch — auto-deploys to hongkong1985.vercel.app (per the topology established in `project_vercel_deploy_topology.md`).

## 7. Performance

- Mesh count bump: alley extension ~2.5× current. Net new draw calls dominated by 冰室 interior + apartment-frontage extensions.
- All repeated props instanced.
- Mobile: existing shadow/postprocessing disabling (commit `56681f5`) applies — no extra cost from this feature.
- Tram-scroll-coupling memory: this is pure WalledCity interior, doesn't touch tram-anchored visuals. No scroll-speed implications.

## 8. Estimated total

~2,500 new lines of code total across all new + modified files.

## 9. Out of scope for this spec

- The 9 placeholder shop facades (燒味店, 魚蛋工場, 豆腐坊, 棉紡廠, 麵廠 etc.) originally listed in the user's spec table. Cut to fit the tightened 25m geometry. Walls between/around the 3 detailed shops are continuous KWC apartment frontage instead.
- Audio (kitchen sizzle, fruit-fly buzz, alley ambient) — visual-first build; audio can be a later pass.
- Camera-zoom-in moment when tooltip fires for look-only shops — explicitly declined in Section 4.
- Any hongkong1982 repo cleanup — orphaned but harmless.
