// Lighthouse Keepers palettes — generated from tokens.json. Edit tokens.json, not this file.

export const THEME_IDS = ['harbour-night', 'sea-glass', 'slate-lantern', 'deep-fjord', 'dusk-harbour', 'foggy-dawn', 'storm-ink'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_NAMES: Record<ThemeId, string> = {
  'harbour-night': 'Harbour Night',
  'sea-glass': 'Sea Glass',
  'slate-lantern': 'Slate & Lantern',
  'deep-fjord': 'Deep Fjord',
  'dusk-harbour': 'Dusk Harbour',
  'foggy-dawn': 'Foggy Dawn',
  'storm-ink': 'Storm Ink',
};

/** Colour roles. See docs/design-system.md for what each one is for. */
export interface Palette {
  /** Top of the night sky (dithered toward `sky` at the horizon). Mostly hidden under fog during play. */
  skyDeep: string;
  /** Night sky at the horizon line. */
  sky: string;
  /** Sea at the bottom of the screen, furthest from the horizon. */
  seaDeep: string;
  /** Main sea colour just below the horizon; the water boats sail on. */
  sea: string;
  /** Wave ripples in open water. */
  seaLight: string;
  /** Wave crests near the horizon, foam around rocks and the island, storm rain. */
  crest: string;
  /** Thin fog. Laid over sea and sky with a 4×4 ordered dither, cleared by the beam. */
  fog: string;
  /** Thick fog banks (the Storm Ship's fog). Lighter than `fog` on night palettes, darker on Foggy Dawn. */
  fogThick: string;
  /** The lighthouse beam and the lit water under it. Must stay the lightest warm (or, on Deep Fjord, coolest) colour in the scene: it IS the feedback. */
  beam: string;
  /** Centre of the lamp and the brightest pixels of a steady beam or flare. */
  beamCore: string;
  /** The lamp at rest (the minimum glow — never dark), boat lanterns, lit windows. */
  lamp: string;
  /** Shadow side of hidden rocks and island stones. */
  rock: string;
  /** Lit side of rocks; stone lighthouse masonry. */
  rockLight: string;
  /** Island soil and cliff face. */
  land: string;
  /** Island grass top; seaweed accents. */
  grass: string;
  /** Lighthouse tower paint, cottage walls, cabin walls on boats. */
  tower: string;
  /** Lighthouse stripes, roofs of cottages, the crab, bunting. The scene's one accent colour. */
  stripe: string;
  /** Lighthouse roof cap, gallery railing, doors; also the Keeper's trousers. */
  roof: string;
  /** Wooden boat hulls, dock planks. */
  hull: string;
  /** Hull shadow line, dock posts, boots. */
  hullDark: string;
  /** Sails, gulls, the captain cap crown. */
  sail: string;
  /** Stars in clear sky (Calm Waters and Dawn show more of them). */
  star: string;
  /** Frost pixels on the lamp glass when the headset signal is poor. Never used for failure. */
  frost: string;
  /** 1-pixel sprite outlines and pixel-panel borders on light grounds. */
  outline: string;
  /** Text and icons on `surface` and `surface-raised`. */
  ink: string;
  /** Secondary text on `surface` and `surface-raised`. */
  inkMuted: string;
  /** Background of menus, the Dawn summary and the parent settings screen. */
  surface: string;
  /** Pixel panels, dialogue bubbles, cards on `surface`. */
  surfaceRaised: string;
  /** Notched pixel-panel borders and dividers (decorative, not text). */
  border: string;
  /** Primary button fill (Start the night, Next tide). */
  accent: string;
  /** Text on `accent`. */
  onAccent: string;
  /** Boat arrived home, passengers-rescued tallies. Always paired with a word or icon. */
  success: string;
  /** The Pilot's drawn route (dashed) and the Pilot's highlight. Chosen to stand apart from `beam` and `sea`. */
  route: string;
  /** Keeper avatar skin option 1 (same in every palette). */
  skin1: string;
  /** Keeper avatar skin option 2. */
  skin2: string;
  /** Keeper avatar skin option 3. */
  skin3: string;
  /** Keeper avatar skin option 4. */
  skin4: string;
}

export const PALETTES: Record<ThemeId, Palette> = {
  'harbour-night': {
    skyDeep: '#141c2e',
    sky: '#24324f',
    seaDeep: '#16243a',
    sea: '#22405c',
    seaLight: '#3b6585',
    crest: '#7fa3ba',
    fog: '#6c7d94',
    fogThick: '#a3b1c4',
    beam: '#f2d48a',
    beamCore: '#fff6dc',
    lamp: '#e0a85a',
    rock: '#323845',
    rockLight: '#566072',
    land: '#2c3838',
    grass: '#4f6a57',
    tower: '#e8e4da',
    stripe: '#b5584a',
    roof: '#2b3247',
    hull: '#8a5a3c',
    hullDark: '#5e3d2b',
    sail: '#e6dfcf',
    star: '#c9d4e6',
    frost: '#d6ecf7',
    outline: '#0c1220',
    ink: '#eef1f5',
    inkMuted: '#a9b6c8',
    surface: '#141d31',
    surfaceRaised: '#1f2b45',
    border: '#52668a',
    accent: '#f2d48a',
    onAccent: '#1a2236',
    success: '#94c9ad',
    route: '#8fd3e8',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'sea-glass': {
    skyDeep: '#1a2b31',
    sky: '#2b464c',
    seaDeep: '#1c3a3a',
    sea: '#2c5653',
    seaLight: '#4c7a74',
    crest: '#93b8ad',
    fog: '#6f8a86',
    fogThick: '#a9c0ba',
    beam: '#f0e2b0',
    beamCore: '#fffaea',
    lamp: '#d9b46a',
    rock: '#344240',
    rockLight: '#5a6b66',
    land: '#2f4238',
    grass: '#5b7a5c',
    tower: '#ece6d6',
    stripe: '#c27c5e',
    roof: '#22353a',
    hull: '#9a6a48',
    hullDark: '#6a4632',
    sail: '#efe7d4',
    star: '#d6e6df',
    frost: '#e2f4ef',
    outline: '#0e1b1e',
    ink: '#f1f4ef',
    inkMuted: '#a9c0b9',
    surface: '#172a2f',
    surfaceRaised: '#22393f',
    border: '#56807f',
    accent: '#f0e2b0',
    onAccent: '#1a2b31',
    success: '#b9dba0',
    route: '#f2c49e',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'slate-lantern': {
    skyDeep: '#1b1e25',
    sky: '#2b303a',
    seaDeep: '#232931',
    sea: '#323b48',
    seaLight: '#4b5667',
    crest: '#8a95a5',
    fog: '#5f6877',
    fogThick: '#929aa7',
    beam: '#e9c46a',
    beamCore: '#fbedc4',
    lamp: '#d99a4e',
    rock: '#2a2d34',
    rockLight: '#4a5059',
    land: '#2c3230',
    grass: '#4b5550',
    tower: '#d9d7d1',
    stripe: '#3e4859',
    roof: '#202329',
    hull: '#6e5d4e',
    hullDark: '#4a3e35',
    sail: '#d1ccc2',
    star: '#b9c1cd',
    frost: '#dbe5ef',
    outline: '#0f1115',
    ink: '#eceef0',
    inkMuted: '#a6acb6',
    surface: '#1d2027',
    surfaceRaised: '#292d36',
    border: '#5a6271',
    accent: '#e9c46a',
    onAccent: '#1b1e25',
    success: '#a0c6a8',
    route: '#8fbbe0',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'deep-fjord': {
    skyDeep: '#0e1923',
    sky: '#182c3b',
    seaDeep: '#10212d',
    sea: '#1b3949',
    seaLight: '#2e5a6c',
    crest: '#6e9ba9',
    fog: '#46606d',
    fogThick: '#7590a0',
    beam: '#d4eef7',
    beamCore: '#ffffff',
    lamp: '#a6dbea',
    rock: '#232e37',
    rockLight: '#3c4b57',
    land: '#1b2c2b',
    grass: '#2f4b45',
    tower: '#c9d7de',
    stripe: '#3f6d89',
    roof: '#132130',
    hull: '#56656f',
    hullDark: '#38444d',
    sail: '#cbd8de',
    star: '#e4f1f5',
    frost: '#ffffff',
    outline: '#070e14',
    ink: '#e6f0f3',
    inkMuted: '#93acb6',
    surface: '#11202c',
    surfaceRaised: '#1a3040',
    border: '#41657a',
    accent: '#a6dbea',
    onAccent: '#0e1923',
    success: '#a9d9ba',
    route: '#f0cf8e',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'dusk-harbour': {
    skyDeep: '#222940',
    sky: '#3a4562',
    seaDeep: '#26334d',
    sea: '#38496a',
    seaLight: '#56698e',
    crest: '#a0b2cd',
    fog: '#727b96',
    fogThick: '#a9b0c4',
    beam: '#f7d8bb',
    beamCore: '#fff5ec',
    lamp: '#e89f84',
    rock: '#363949',
    rockLight: '#5a5e72',
    land: '#353c4a',
    grass: '#5a6a72',
    tower: '#ede5dd',
    stripe: '#c97b6e',
    roof: '#272d43',
    hull: '#8e6b5b',
    hullDark: '#5f4840',
    sail: '#efe6dd',
    star: '#ebe2ea',
    frost: '#e8f0fa',
    outline: '#121625',
    ink: '#f4f1f2',
    inkMuted: '#b3b9c9',
    surface: '#20283d',
    surfaceRaised: '#2d3651',
    border: '#626f92',
    accent: '#f7d8bb',
    onAccent: '#222940',
    success: '#acd3b7',
    route: '#a6dcec',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'foggy-dawn': {
    skyDeep: '#a9b6ca',
    sky: '#cbd5e2',
    seaDeep: '#6f88a6',
    sea: '#8aa3bf',
    seaLight: '#a9bdd3',
    crest: '#e1e9f2',
    fog: '#66738a',
    fogThick: '#4f5b70',
    beam: '#fff0c2',
    beamCore: '#ffffff',
    lamp: '#efa972',
    rock: '#4a5263',
    rockLight: '#6c7588',
    land: '#6b7c76',
    grass: '#8ea18c',
    tower: '#f7f3ea',
    stripe: '#5f7fae',
    roof: '#3d4861',
    hull: '#8a6650',
    hullDark: '#5f4536',
    sail: '#fbf7ee',
    star: '#ffffff',
    frost: '#ffffff',
    outline: '#2a3142',
    ink: '#1d2536',
    inkMuted: '#4a566b',
    surface: '#e4e9f1',
    surfaceRaised: '#f5f7fa',
    border: '#7f8ca2',
    accent: '#38527e',
    onAccent: '#ffffff',
    success: '#356f55',
    route: '#1f2a44',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
  'storm-ink': {
    skyDeep: '#070c17',
    sky: '#101a2e',
    seaDeep: '#0b1626',
    sea: '#173050',
    seaLight: '#2a4f7c',
    crest: '#9bbbe0',
    fog: '#55657e',
    fogThick: '#8d9db5',
    beam: '#ffe08a',
    beamCore: '#ffffff',
    lamp: '#ffb64a',
    rock: '#181b22',
    rockLight: '#454d5c',
    land: '#1a2420',
    grass: '#3d5a45',
    tower: '#ffffff',
    stripe: '#d9533d',
    roof: '#0a101c',
    hull: '#a9683a',
    hullDark: '#6a3e22',
    sail: '#ffffff',
    star: '#ffffff',
    frost: '#e8f6ff',
    outline: '#000000',
    ink: '#ffffff',
    inkMuted: '#d0d8e4',
    surface: '#080e1a',
    surfaceRaised: '#142038',
    border: '#9aaecb',
    accent: '#ffe08a',
    onAccent: '#080e1a',
    success: '#9fe3b8',
    route: '#7fd4ff',
    skin1: '#f4d3b8',
    skin2: '#d9a77c',
    skin3: '#a8704a',
    skin4: '#6e4630',
  },
};

/** '#22405c' -> 0x22405c, for Phaser fillStyle / setTint. */
export const toHex = (c: string): number => parseInt(c.replace('#', ''), 16);

export const DEFAULT_THEME: ThemeId = 'harbour-night';

export const ART = { width: 240, height: 135, scale: 4 } as const;
