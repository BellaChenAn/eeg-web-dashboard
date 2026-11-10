# CLAUDE.md — Lighthouse Keepers

This repo is **Lighthouse Keepers**, a CS 399 team project (Tarunvir Randhawa, Juliann Zhu, Mane Muradyan, Bella Chen, Fall 2026). It is a two-player cooperative EEG neurofeedback game for children with ADHD (aged about 7–12) and a parent. The child (the **Keeper**) wears a consumer EEG headset, and their sustained attention powers a lighthouse beam that cuts through fog. The parent (the **Harbour Pilot**) draws routes that guide boats home through the lit water. Neither player can win alone, and there is no losing state.

Read these before writing code:

1. `docs/design-document.md`: the full design document. It explains what the game is, why it works this way, the session structure and the EEG rules.
2. `docs/design-system.md`: the art direction and UI rules, including the colour, feedback, interface and copy rules.
3. `design-system/tokens.json`: the source of truth for every colour, font, spacing and art-scale value.
4. `design-system/reference/`: a working prototype of the pixel art in plain JS and canvas. Open `reference/index.html` in a browser to see every screen in every palette.

## Stack (from the design doc)

- **Game:** Phaser 3 + TypeScript web app.
- **Bridge:** a Node.js process that reads the EEG headset and sends attention and signal-quality values to the game and to the parent's settings screen over WebSockets.
- **Simulator:** a keyboard simulator replaces the headset during development, so the game must run without hardware.
- **Timeline:** six weeks. The Storm Ship and decorations are optional if time runs short.

If the repo doesn't have a project scaffold yet, use Vite + TypeScript + Phaser 3, with the bridge in its own `bridge/` folder. Confirm with the team before adding other major dependencies.

## Core game loop

The Keeper holds attention → the beam widens → the Pilot draws a route → the boat moves through lit water. Boats wait in darkness and never sink. Rocks are hidden and appear only under a **steady beam**, which means attention held above the threshold for the full hold time. **Three steady beams trigger a flare** that lights the whole bay. Score = passengers rescued, compared only with the family's own past sessions.

**A session is one night, about 12 minutes:**
1. Lamp Lighting (~1 min): the headset connects and the lamp frost clears as the signal improves.
2. Calm Waters (~1 min): no boats. The beam responds and a guide shows an upright, calm posture.
3. Three Tides (3 × ~3 min, short rests between): boats, routes and hidden rocks.
4. Storm Ship (end of tide 3): a big ship in thick fog. Its channel is found only with a steady beam.
5. Dawn (~1 min): the fog lifts, the remaining boats are towed in, the team summary appears, and the child spends rewards on decorations.

## Non-negotiable rules

These come from the design doc and the research behind it (Antle et al.'s strong concepts). Don't trade them away for convenience.

- **The beam never goes fully dark.** Below the threshold it narrows to a lamp glow (`lamp`).
- **Smooth the attention signal and ease beam changes over about 1 second.** Consumer EEG is noisy, and sharp reactions feel unfair.
- **No numeric attention score on the child's screen.** Numbers appear only on the parent's settings screen.
- **No losing state and no failure colours.** Poor signal shows as frost on the lamp glass (`frost`), never red.
- **No flashing or strobing.** The flare is a slow bloom.
- **The Keeper has no input during rounds** (brain-free input). All routing is the Pilot's.
- **Report team results only**, e.g. "Together you brought 14 passengers home."
- **The parent adjusts settings between rounds**, never mid-round. Settings: threshold, hold time, live attention graph, signal quality.
- **Copy:** calm, short, physical and encouraging ("Sit tall and keep your eyes on the light."). Never "Focus!". Sentence case, no emoji.
- **Text is at least 16px** in game.

## Art rules (summary — full version in `docs/design-system.md`)

- Draw at **240 × 135 art pixels** and scale by integers only (4× = 960×540, 8× = 1920×1080). In Phaser: `pixelArt: true`, `roundPixels: true`, and a game size of 240×135 with `Scale.FIT` or integer zoom.
- **Use colours only from `design-system/palettes.ts`** (generated from tokens.json). Never hard-code hex values in game code.
- The beam (`beam`, `beam-core`) is always the brightest thing on screen.
- Blend with 4×4 ordered (Bayer) dithering, not alpha gradients. Give sprites 1px `outline` borders.
- HUD goes in the corners only: tide progress top-left, steady-beam pips top-right, boats home bottom-left, guide bubble bottom-right. The centre belongs to the beam.
- The parent screens are **not** pixel art. Use the Atkinson Hyperlegible `parent-*` text styles on `surface-raised` cards.
- Fonts (Google Fonts): **Pixelify Sans** for game text, **Atkinson Hyperlegible** for parent screens.

## Using the design-system files

- `design-system/tokens.json` is the source of truth. If it changes, regenerate `tokens.css` and `palettes.ts`, or edit them to match. Never let them drift.
- `design-system/palettes.ts` exports `PALETTES[themeId]` (hex strings, camelCase roles such as `seaDeep` and `beamCore`), `toHex()` for Phaser's `0xRRGGBB`, `DEFAULT_THEME` and `ART`.
- `design-system/tokens.css` provides CSS variables for HTML parts (the parent settings screen and any DOM overlays). Switch palettes with `<html data-theme="sea-glass">`.
- `design-system/reference/lk-kit.js` is **prototype reference, not production code**. Port its ideas to TypeScript:
  - `SPRITES`, `HATS` and `BODY` are sprite pixel maps as strings, where each character is a colour role (see `MAP` in the file). Port them to textures generated at boot, e.g. draw each to a `CanvasTexture` from the active palette, so a palette swap only needs a texture regeneration.
  - `harbour()` renders the whole scene per pixel: sky, sea, fog noise, beam cone, island, lighthouse, rocks, boats and route. For Phaser, split it into layers. Precompute the fog noise field once per tide, draw the beam as its own layer each frame from the smoothed attention value, and keep the sprites as Phaser game objects.
  - `lighthouse()` and `island()` contain the procedural drawing for the three lighthouse styles.
  - The beam formula is in `lit()`: the cone half-angle is `0.035 + 0.3 × attention` radians and its length is `(0.32 + 0.78 × attention) × width`. The cone fades in between attention 0.08 and 0.25, so below that only the glow shows.

## Open design decisions (the team hasn't chosen yet)

Build with the defaults below. Keep each choice a config value so it can change later. Don't silently pick a different default, and ask the user when a choice matters.

| Decision | Options | Default until decided |
| --- | --- | --- |
| Palette | `harbour-night`, `sea-glass`, `slate-lantern`, `deep-fjord`, `dusk-harbour`, `foggy-dawn`, `storm-ink` | `harbour-night` (keep `storm-ink` as an optional high-contrast setting) |
| Fog style | banded, dithered, puffy | banded (calmest) |
| Lighthouse | classic striped, stubby, stone + cottage | classic striped |
| Art resolution | 160×90, 240×135, 320×180 | 240×135 |

## Suggested build order (minimum version first)

1. Scaffold Phaser + TS at 240×135 with integer scaling. Load the palette from `palettes.ts`.
2. Attention input interface: a keyboard simulator (for example, hold Space to raise attention) and a WebSocket client. Both feed one smoothed `attention` value (0–1) plus `signalQuality`.
3. Scene: sky, sea, fog and the beam cone driven by `attention`. Glow-only below the threshold; the steady-beam timer, then the flare after three steady beams.
4. Boats: spawning at the fog edge, waiting in darkness, moving along the Pilot's drawn route only through lit water, and docking.
5. The Pilot's route drawing (mouse or touch) and the passenger counter.
6. Session flow: Lamp Lighting → Calm Waters → three Tides with rests → Dawn summary.
7. Parent settings screen (HTML/DOM is fine): live graph, threshold, hold time and signal quality, applied at the next rest.
8. Node EEG bridge.
9. Optional: Storm Ship, hidden-rock chart, decorations shop and Keeper avatar choice between rounds.
