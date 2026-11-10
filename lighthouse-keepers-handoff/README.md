# Lighthouse Keepers

A two-player cooperative EEG neurofeedback game for children with ADHD and a parent (CS 399, Fall 2026).

## What's in this folder

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Instructions Claude reads automatically when it works in this repo |
| `docs/design-document.md` | The team's design document |
| `docs/design-system.md` | Art direction and UI rules |
| `design-system/tokens.json` | All colours (7 palettes), fonts, spacing and art scale — the source of truth |
| `design-system/tokens.css` | The same values as CSS variables, for HTML screens |
| `design-system/palettes.ts` | The same colours as TypeScript, for Phaser |
| `design-system/reference/index.html` | Open in a browser to see every mockup in every palette |
| `design-system/reference/lk-kit.js` | Prototype pixel-art renderer the mockups use |

The live design system is also on Claude (private until shared): https://claude.ai/artifact/NvQSpR1v9tnfcuAfaGmVFH

## Viewing the mockups

Most browsers block a page that loads files from your disk. Run a tiny server from the repo root:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/design-system/reference/ and use the Palette menu at the top.
