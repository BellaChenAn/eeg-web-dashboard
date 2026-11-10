# Lighthouse Keepers — design system

> Source of truth for colours and type: `design-system/tokens.json`. Visual reference: open `design-system/reference/index.html` in a browser.

Lighthouse Keepers is a two-player cooperative neurofeedback game for children with ADHD (about 7–12) and a parent. The child (the Keeper) wears an EEG headset; their sustained attention powers a lighthouse beam that cuts through fog. The parent (the Harbour Pilot) draws routes to guide boats home through the lit water. This system is the game's look: muted, blue-led pixel art in which **the beam is always the brightest thing on screen**.

## Palettes

Every palette is a theme of this system and uses the same token names, so any screen can switch palette without code changes. The team picks one to ship; keep `storm-ink` as an optional accessibility setting.

| Theme | Character | Use when |
| --- | --- | --- |
| `harbour-night` | Deep navy sea, muted-amber beam, red-and-white tower | The default: warm light against cool water is the clearest attention metaphor. |
| `sea-glass` | Teal and sage, terracotta stripe | You want the calmest, least "night-time" feel. |
| `slate-lantern` | Near-grey slate with one gold lantern | You want minimal colour noise so the beam is the only colour that moves. |
| `deep-fjord` | All blue, cool moonlight beam, warm sand routes | You want blue hues end to end. The Pilot's routes become the warm accent. |
| `dusk-harbour` | Dusty periwinkle-blue, peach-coral lamp | You want a softer, storybook mood. |
| `foggy-dawn` | Light: pale sky, slate fog that darkens as it thickens | Bright rooms or daytime play. Fog is darker than the sea here, not lighter. |
| `storm-ink` | Inky night, white tower, bright beam, strongest contrast | Low-vision players, glare, or projectors. |

## Visual foundations

### The scene
- Draw the scene at **240 × 135 art pixels** (`art-width`, `art-height`) and upscale by whole numbers only (`art-scale` = 4 at 960 px wide, 8 at 1080p). Turn image smoothing off; set `image-rendering: pixelated`.
- Light comes from the lamp. Shade every sprite with its lit side toward the lighthouse.
- Outline sprites with 1 px of `outline`. Do not outline fog, water or the beam.
- Layers, back to front: sky (`sky-deep` → `sky`), sea (`sea` → `sea-deep`, ripples `sea-light`, crests `crest`), fog (`fog`, `fog-thick`), beam (`beam`, `beam-core`), island and lighthouse, rocks, boats, the Pilot's route (`route`), HUD.
- Blend between two colours with a 4×4 ordered (Bayer) dither, never with alpha or gradients. Mixed colours are allowed only as fixed steps (38% and 70% toward `beam` for lit water).

### Feedback rules (from the design document)
- The beam widens above threshold and narrows to a lamp glow below it. **It never goes dark**: the resting lamp is `lamp`, not black.
- Beam changes ease over about one second; never snap.
- A steady beam (held for the hold time) brightens its core to `beam-core`, adds three sparkles, and reveals rocks. Three steady beams trigger a flare: tint the whole bay 32% toward `beam` and thin the fog, as a slow bloom. **No flashing or strobing.**
- Poor headset signal is frost (`frost`) on the lamp glass. It is never shown as red or as failure.
- Boats outside the light fade 60% toward `fog` and show one `lamp` lantern pixel. Nothing sinks; there is no losing colour.
- Do not show a numeric attention score on the child's screen.

### Colour rules
- `beam` must be the lightest warm colour in a scene (on `deep-fjord`, the lightest cool colour). Never reuse `beam` for decoration other than the Dawn sun and sea stars.
- `stripe` is the single accent. `route` belongs to the Pilot only.
- `success` always comes with a word or an icon ("▲ 3 more than last night").
- Colours that must be told apart (lit water vs. fog, route vs. sea) differ in lightness, not hue alone. Text pairs (`ink`, `ink-muted` on `surface`, `surface-raised`; `on-accent` on `accent`) meet 4.5:1 in every theme.

### Fog
Use the **banded** fog style by default (flat horizontal banks with a lighter top edge) — it is the calmest for players with ADHD. Dithered and puffy fog are alternatives; see `design-system/reference/previews/FogStyles.html`.

### Interface
- Child-facing UI: notched pixel panels (`.lk-panel`), pixel buttons (`.lk-btn`), corners `radius-none`, borders `space-1` (one art pixel at 4×). Text in `game-heading`, `game-label`, `game-small` — never below 16 px.
- Keep the HUD to the four corners: tide progress (top-left), steady-beam pips (top-right), boats home (bottom-left), guide bubble (bottom-right, only when needed). Leave the centre for the beam.
- Parent screens are not pixel art: `parent-heading`, `parent-body`, `parent-caption` on `surface-raised` cards with `radius-md`.
- Focus ring: a solid `space-1` outline in `ink`, offset `space-2`.

## Content fundamentals
- Speak to the child as a teammate: "Together you brought 14 passengers home." Report team results only, compared with the family's own last night.
- Guide lines are short, calm and physical: "Sit tall and keep your eyes on the light." Never "Focus!" or "Pay attention."
- Parent copy is plain and practical: "Changes apply at the next rest, so the Keeper isn't interrupted." Offer encouraging phrases to say aloud.
- Sentence case. No emoji.

## Iconography
All icons are pixel sprites from `design-system/reference/lk-kit.js` (`LK.SPRITES`): boats, rocks, decorations, sea stars. Draw new ones on the same grid with `outline` edges and palette tokens only. No icon font; no emoji.

## Using the kit
`design-system/reference/lk-kit.js` defines `window.LK`: `LK.harbour(canvas, options)` draws the scene (`attention` 0–1, `steady`, `flare`, `frost`, `phase` of `lighting` | `calm` | `tide` | `storm` | `dawn`, `fog` of `bands` | `dither` | `clouds`, `lighthouse` of `classic` | `stubby` | `stone`); `LK.drawSprite`, `LK.avatar`, `LK.lighthouse` draw single sprites; `LK.pal(themeId)` returns a palette's colours. In Phaser, port the same sprite strings to a texture atlas and keep the palette as data.
