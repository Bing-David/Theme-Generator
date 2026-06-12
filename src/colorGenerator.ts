import { ThemeRoleName } from "./themeCatalog";

// Types

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name?: string;
}

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic"
  | "square"
  | "double-complementary"
  | "compound"
  | "accented-analogous"
  | "neutral"
  | "warm"
  | "cool"
  | "polychromatic"
  | "rainbow"
  | "duotone"
  | "grayscale"
  | "near-monochromatic"
  | "split-triadic"
  | "pentadic"
  | "hexadic";

export type PaletteSource = "generated" | "imported";

export interface PaletteOptions {
  saturation: number;
  luminosity: number;
  variation: number;
  syntaxSaturation: number;
}

export interface ThemeOverrides {
  workbench: Record<string, string>;
  textMate: Record<string, string>;
  semantic: Record<string, string>;
}

export interface DerivedRoles {
  base: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  accent: string;
  accentAlt: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  diffAdded: string;
  diffModified: string;
  diffDeleted: string;
  terminalAnsi: string[];
}

export interface Palette {
  id: string;
  name: string;
  source: PaletteSource;
  harmony: HarmonyType;
  baseColor: ColorInfo;
  seedColors: ColorInfo[];
  colors: ColorInfo[];
  originalSeedColors: ColorInfo[];
  derivedRoles: DerivedRoles;
  options: PaletteOptions;
  baseColorLocked: boolean;
  themeOverrides: ThemeOverrides;
  randomSeed: number;
  createdAt: number;
  filePath?: string;
}

// Constants

const DEFAULT_OPTIONS: PaletteOptions = {
  saturation: 0.7,
  luminosity: 0.5,
  variation: 0.15,
  syntaxSaturation: 1.0,
};

const HARMONY_LABELS: Record<HarmonyType, string[]> = {
  complementary: ["Base", "Complement"],
  analogous: ["Analog Left", "Base", "Analog Right"],
  triadic: ["Base", "Triad B", "Triad C"],
  "split-complementary": ["Base", "Split Left", "Split Right"],
  tetradic: ["Base", "Tetrad B", "Tetrad C", "Tetrad D"],
  monochromatic: ["Deep", "Shade", "Base", "Tint", "Light"],
  square: ["Base", "Square B", "Square C", "Square D"],
  "double-complementary": ["Base A", "Accent A", "Base B", "Accent B"],
  compound: ["Compound Left", "Base", "Compound Right", "Accent"],
  "accented-analogous": ["Analog Left", "Base", "Analog Right", "Accent"],
  neutral: ["Neutral A", "Neutral B", "Base", "Neutral C"],
  warm: ["Warm Red", "Warm Orange", "Warm Gold", "Warm Coral"],
  cool: ["Cool Blue", "Cool Cyan", "Cool Teal", "Cool Violet"],
  polychromatic: ["Poly A", "Poly B", "Poly C", "Poly D", "Poly E"],
  rainbow: ["Red", "Yellow", "Green", "Cyan", "Blue", "Magenta"],
  duotone: ["Base", "Pair", "Base Light", "Pair Light"],
  grayscale: ["Black", "Dark Gray", "Mid Gray", "Light Gray", "White"],
  "near-monochromatic": ["Deep", "Shade", "Base", "Tint", "Light"],
  "split-triadic": ["Base", "Split Triad B", "Split Triad C", "Split Triad D"],
  pentadic: ["Pentad A", "Pentad B", "Pentad C", "Pentad D", "Pentad E"],
  hexadic: ["Hex A", "Hex B", "Hex C", "Hex D", "Hex E", "Hex F"],
};

interface HarmonyProfile {
  seed: number;
  spread: number;
  hueJitter: number;
  familyShift: number;
  saturationBias: number;
  lightnessBias: number;
  intensity: number;
}

// Color math

export function hexToRgb(hex: string): RGB {
  const clean = normalizeHex(hex).slice(1);
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function rgbToHex(rgb: RGB): string {
  const part = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        h = 60 * ((b - r) / delta + 2);
        break;
      default:
        h = 60 * ((r - g) / delta + 4);
        break;
    }
  }

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = Math.max(0, Math.min(100, hsl.s)) / 100;
  const l = Math.max(0, Math.min(100, hsl.l)) / 100;

  if (s === 0) {
    const channel = Math.round(l * 255);
    return { r: channel, g: channel, b: channel };
  }

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace(/^#/, "").trim();
  const expanded =
    clean.length === 3 ? clean.split("").map((part) => `${part}${part}`).join("") : clean;
  const six = expanded.length >= 6 ? expanded.slice(0, 6) : expanded.padEnd(6, "0");
  return `#${six.toLowerCase()}`;
}

export function createColorInfo(hex: string, name?: string): ColorInfo {
  const normalized = normalizeHex(hex);
  const rgb = hexToRgb(normalized);
  const hsl = rgbToHsl(rgb);
  return { hex: normalized, rgb, hsl, name };
}

// Harmony

function rotateHue(hue: number, amount: number): number {
  return (hue + amount + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildColorFromHsl(hsl: HSL, name?: string): ColorInfo {
  return createColorInfo(hslToHex(hsl), name);
}

function hexToSeed(hex: string): number {
  let hash = 2166136261;
  for (const char of hex) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let current = seed >>> 0;
  return () => {
    current = (current + 0x6d2b79f5) >>> 0;
    let temp = Math.imul(current ^ (current >>> 15), current | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random: () => number, min: number, max: number): number {
  return min + (max - min) * random();
}

function createHarmonyProfile(
  baseHex: string,
  harmony: HarmonyType,
  randomSeed: number,
): HarmonyProfile {
  const seed = hexToSeed(baseHex) ^ randomSeed ^ 0x9e3779b9;
  const random = seededRandom(seed);
  const signed = (range: number) => randomBetween(random, -range, range);

  switch (harmony) {
    case "monochromatic":
      return {
        seed,
        spread: 1,
        hueJitter: 0,
        familyShift: 0,
        saturationBias: signed(4),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.2),
      };
    case "grayscale":
      return {
        seed,
        spread: 1,
        hueJitter: 0,
        familyShift: 0,
        saturationBias: 0,
        lightnessBias: signed(10),
        intensity: randomBetween(random, 0.9, 1.15),
      };
    case "complementary":
      return {
        seed,
        spread: randomBetween(random, 0.96, 1.04),
        hueJitter: 2,
        familyShift: signed(2),
        saturationBias: signed(6),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.22),
      };
    case "triadic":
    case "square":
    case "tetradic":
    case "split-complementary":
    case "split-triadic":
    case "pentadic":
    case "hexadic":
      return {
        seed,
        spread: randomBetween(random, 0.94, 1.06),
        hueJitter: 3,
        familyShift: signed(3),
        saturationBias: signed(8),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.25),
      };
    case "analogous":
    case "accented-analogous":
    case "compound":
    case "double-complementary":
    case "polychromatic":
    case "duotone":
      return {
        seed,
        spread: randomBetween(random, 0.9, 1.12),
        hueJitter: 4,
        familyShift: signed(4),
        saturationBias: signed(8),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.3),
      };
    case "warm":
    case "cool":
      return {
        seed,
        spread: randomBetween(random, 0.9, 1.15),
        hueJitter: 4,
        familyShift: signed(10),
        saturationBias: signed(8),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 1, 1.35),
      };
    case "rainbow":
      return {
        seed,
        spread: randomBetween(random, 0.92, 1.08),
        hueJitter: 5,
        familyShift: signed(8),
        saturationBias: signed(6),
        lightnessBias: signed(6),
        intensity: randomBetween(random, 1, 1.3),
      };
    case "neutral":
      return {
        seed,
        spread: randomBetween(random, 0.9, 1.1),
        hueJitter: 4,
        familyShift: signed(4),
        saturationBias: signed(6),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.2),
      };
    default:
      return {
        seed,
        spread: randomBetween(random, 0.85, 1.2),
        hueJitter: randomBetween(random, 2, 8),
        familyShift: signed(6),
        saturationBias: signed(8),
        lightnessBias: signed(8),
        intensity: randomBetween(random, 0.95, 1.4),
      };
  }
}

function getVariationProfile(harmony: HarmonyType): {
  hue: number;
  saturation: number;
  luminosity: number;
} {
  switch (harmony) {
    case "monochromatic":
      return { hue: 0, saturation: 4, luminosity: 4 };
    case "complementary":
      return { hue: 6, saturation: 8, luminosity: 6 };
    case "analogous":
      return { hue: 10, saturation: 10, luminosity: 8 };
    case "split-complementary":
      return { hue: 10, saturation: 10, luminosity: 8 };
    case "triadic":
      return { hue: 12, saturation: 12, luminosity: 10 };
    case "tetradic":
      return { hue: 14, saturation: 12, luminosity: 10 };
    case "square":
      return { hue: 12, saturation: 10, luminosity: 10 };
    case "double-complementary":
      return { hue: 10, saturation: 10, luminosity: 8 };
    case "compound":
      return { hue: 10, saturation: 10, luminosity: 8 };
    case "accented-analogous":
      return { hue: 8, saturation: 9, luminosity: 8 };
    case "neutral":
      return { hue: 5, saturation: 6, luminosity: 8 };
    case "warm":
    case "cool":
      return { hue: 6, saturation: 8, luminosity: 8 };
    case "polychromatic":
      return { hue: 14, saturation: 12, luminosity: 10 };
    case "rainbow":
      return { hue: 8, saturation: 8, luminosity: 8 };
    case "duotone":
      return { hue: 5, saturation: 8, luminosity: 10 };
    case "grayscale":
      return { hue: 0, saturation: 0, luminosity: 4 };
    case "near-monochromatic":
      return { hue: 4, saturation: 6, luminosity: 6 };
    case "split-triadic":
      return { hue: 10, saturation: 12, luminosity: 10 };
    case "pentadic":
      return { hue: 12, saturation: 12, luminosity: 10 };
    case "hexadic":
      return { hue: 12, saturation: 12, luminosity: 10 };
  }
}

function buildHarmonySeeds(base: HSL, harmony: HarmonyType, profile: HarmonyProfile): HSL[] {
  const random = seededRandom(profile.seed ^ 0x85ebca6b);
  const vary = (value: number, amount = profile.hueJitter) =>
    value + randomBetween(random, -amount, amount);
  const familyHue = (anchor: number, amount = profile.hueJitter) =>
    rotateHue(anchor, profile.familyShift + randomBetween(random, -amount, amount));
  const spreadOffset = (value: number) => value * profile.spread;
  const sat = (value: number, min: number, max: number) =>
    clamp(value + profile.saturationBias, min, max);
  const light = (value: number, min: number, max: number) =>
    clamp(value + profile.lightnessBias, min, max);

  switch (harmony) {
    case "complementary":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 4)) },
      ];
    case "analogous":
      return [
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(28), 5)) },
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(28), 5)) },
      ];
    case "triadic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(120), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(240), 6)) },
      ];
    case "split-complementary":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(150), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(210), 6)) },
      ];
    case "tetradic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(60), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(240), 8)) },
      ];
    case "monochromatic":
      return [
        { ...base, s: sat(base.s + 10, 18, 90), l: light(base.l - 24, 10, 82) },
        { ...base, s: sat(base.s + 6, 16, 90), l: light(base.l - 12, 12, 84) },
        { ...base, s: sat(base.s, 10, 88), l: light(base.l, 12, 88) },
        { ...base, s: sat(base.s - 8, 10, 82), l: light(base.l + 12, 18, 92) },
        { ...base, s: sat(base.s - 14, 8, 76), l: light(base.l + 24, 28, 96) },
      ];
    case "square":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(90), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 4)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(270), 6)) },
      ];
    case "double-complementary":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(30), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 4)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(210), 8)) },
      ];
    case "compound":
      return [
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(35), 8)) },
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(35), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 6)) },
      ];
    case "accented-analogous":
      return [
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(25), 6)) },
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(25), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 6)) },
      ];
    case "neutral":
      return [
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(12), 4)), s: sat(base.s - 28, 6, 48) },
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(4), 4)), s: sat(base.s - 18, 8, 54) },
        { ...base, s: sat(base.s - 8, 10, 60) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(10), 4)), s: sat(base.s - 20, 6, 50) },
      ];
    case "warm":
      return [
        { ...base, h: familyHue(8), s: sat(base.s + 8, 42, 92), l: light(base.l, 28, 72) },
        { ...base, h: familyHue(28), s: sat(base.s + 10, 44, 94), l: light(base.l + 2, 30, 74) },
        { ...base, h: familyHue(46), s: sat(base.s + 8, 42, 92), l: light(base.l + 4, 32, 76) },
        { ...base, h: familyHue(18), s: sat(base.s + 6, 38, 88), l: light(base.l + 8, 34, 78) },
      ];
    case "cool":
      return [
        { ...base, h: familyHue(210), s: sat(base.s + 8, 38, 90), l: light(base.l, 26, 72) },
        { ...base, h: familyHue(188), s: sat(base.s + 10, 40, 92), l: light(base.l + 2, 28, 74) },
        { ...base, h: familyHue(164), s: sat(base.s + 4, 34, 82), l: light(base.l + 4, 30, 76) },
        { ...base, h: familyHue(252), s: sat(base.s + 6, 34, 86), l: light(base.l + 6, 32, 78) },
      ];
    case "polychromatic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(45), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(120), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(210), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(300), 8)) },
      ];
    case "rainbow":
      return [
        { ...base, h: familyHue(0), s: sat(82, 66, 92), l: light(base.l, 38, 62) },
        { ...base, h: familyHue(52), s: sat(82, 66, 92), l: light(base.l + 4, 42, 66) },
        { ...base, h: familyHue(120), s: sat(68, 54, 86), l: light(base.l, 36, 60) },
        { ...base, h: familyHue(190), s: sat(72, 58, 88), l: light(base.l + 2, 38, 62) },
        { ...base, h: familyHue(235), s: sat(74, 58, 88), l: light(base.l, 36, 60) },
        { ...base, h: familyHue(300), s: sat(68, 54, 84), l: light(base.l + 2, 38, 62) },
      ];
    case "duotone":
      return [
        { ...base, l: light(base.l - 10, 12, 80) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 10)), l: light(base.l - 6, 14, 82) },
        { ...base, l: light(base.l + 12, 20, 92) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 10)), l: light(base.l + 18, 24, 94) },
      ];
    case "grayscale":
      return [
        { ...base, s: 0, l: light(8, 8, 18) },
        { ...base, s: 0, l: light(24, 18, 34) },
        { ...base, s: 0, l: light(46, 36, 56) },
        { ...base, s: 0, l: light(68, 58, 78) },
        { ...base, s: 0, l: light(90, 80, 96) },
      ];
    case "near-monochromatic":
      return [
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(6), 2)), s: sat(base.s + 8, 18, 90), l: light(base.l - 20, 10, 82) },
        { ...base, h: rotateHue(base.h, vary(-spreadOffset(3), 2)), s: sat(base.s + 4, 14, 88), l: light(base.l - 10, 12, 84) },
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(3), 2)), s: sat(base.s - 6, 10, 82), l: light(base.l + 12, 18, 92) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(6), 2)), s: sat(base.s - 10, 8, 78), l: light(base.l + 24, 24, 96) },
      ];
    case "split-triadic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(110), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(250), 8)) },
      ];
    case "pentadic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(72), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(144), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(216), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(288), 8)) },
      ];
    case "hexadic":
      return [
        { ...base },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(60), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(120), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(180), 6)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(240), 8)) },
        { ...base, h: rotateHue(base.h, vary(spreadOffset(300), 8)) },
      ];
  }
}

function applyOptionsToSeeds(
  seeds: HSL[],
  baseHex: string,
  harmony: HarmonyType,
  options: PaletteOptions,
  randomSeed: number,
  profile: HarmonyProfile,
): HSL[] {
  const variationProfile = getVariationProfile(harmony);
  const variationScale = clamp(options.variation, 0, 0.65);
  const saturationScale = options.saturation / DEFAULT_OPTIONS.saturation;
  const luminosityShift = (options.luminosity - DEFAULT_OPTIONS.luminosity) * 40;
  const seed = hexToSeed(baseHex) ^ randomSeed ^ profile.seed;

  return seeds.map((sourceSeed, index) => {
    const random = seededRandom(seed + index * 137);
    const variationFactor = variationScale * 2 - 0.1;
    const hueOffset =
      harmony === "monochromatic" || harmony === "grayscale"
        ? 0
        : (random() * 2 - 1) * variationProfile.hue * (variationFactor + (profile.intensity - 1) * 0.3);
    const satOffset =
      (random() * 2 - 1) * variationProfile.saturation * (variationFactor + 0.08) + profile.saturationBias * 0.35;
    const lightOffset =
      (random() * 2 - 1) * variationProfile.luminosity * (variationFactor + 0.08) + profile.lightnessBias * 0.25;

    return {
      h: harmony === "monochromatic" || harmony === "grayscale"
        ? seeds[Math.floor(seeds.length / 2)].h
        : rotateHue(sourceSeed.h, hueOffset),
      s:
        harmony === "grayscale"
          ? 0
          : clamp(
            Math.round(sourceSeed.s * saturationScale + satOffset),
            6,
            96,
          ),
      l: clamp(
        Math.round(sourceSeed.l + luminosityShift + lightOffset),
        8,
        96,
      ),
    };
  });
}

// Roles

function adjustLightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: clamp(hsl.l + amount, 4, 98) });
}

function adjustSaturation(hex: string, multiplier: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, s: clamp(Math.round(hsl.s * multiplier), 4, 96) });
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const foreground = getLuminance(foregroundHex);
  const background = getLuminance(backgroundHex);
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastColor(
  backgroundHex: string,
  targetRatio = 4.5,
): string {
  if (getContrastRatio("#ffffff", backgroundHex) >= targetRatio) {
    return "#ffffff";
  }
  if (getContrastRatio("#000000", backgroundHex) >= targetRatio) {
    return "#000000";
  }
  return getLuminance(backgroundHex) > 0.4 ? "#000000" : "#ffffff";
}

export function ensureContrastRatio(
  foregroundHex: string,
  backgroundHex: string,
  targetRatio = 4.5,
): string {
  const normalizedForeground = normalizeHex(foregroundHex);
  const normalizedBackground = normalizeHex(backgroundHex);
  if (getContrastRatio(normalizedForeground, normalizedBackground) >= targetRatio) {
    return normalizedForeground;
  }

  const foregroundHsl = hexToHsl(normalizedForeground);
  const backgroundIsLight = getLuminance(normalizedBackground) > 0.45;
  let best = normalizedForeground;
  let bestRatio = getContrastRatio(best, normalizedBackground);

  for (let index = 0; index <= 18; index += 1) {
    const nextLightness = backgroundIsLight ? 90 - index * 5 : 10 + index * 5;
    const candidate = hslToHex({
      ...foregroundHsl,
      l: clamp(nextLightness, 4, 96),
    });
    const ratio = getContrastRatio(candidate, normalizedBackground);
    if (ratio >= targetRatio) {
      return candidate;
    }
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }

  return best;
}

function createDerivedRoles(seedColors: ColorInfo[], options: PaletteOptions): DerivedRoles {
  const primaryIndex = getPrimarySeedIndex(seedColors.length);
  const baseSeed = seedColors[primaryIndex] ?? seedColors[0];
  const accentSeed = seedColors[0];
  const accentAltSeed = seedColors[1] ?? accentSeed;
  const tertiarySeed = seedColors[2] ?? accentAltSeed;
  const isDark = baseSeed.hsl.l < 55;

  const base = adjustLightness(baseSeed.hex, isDark ? -26 : 28);
  const surface = adjustLightness(baseSeed.hex, isDark ? -18 : 18);
  const surfaceAlt = adjustLightness(baseSeed.hex, isDark ? -10 : 10);
  const surfaceElevated = adjustLightness(baseSeed.hex, isDark ? -4 : 4);
  const accent = ensureContrastRatio(
    adjustSaturation(accentSeed.hex, 1.08),
    base,
    3.1,
  );
  const accentAlt = ensureContrastRatio(
    adjustSaturation(accentAltSeed.hex, 1.04),
    base,
    3.3,
  );
  const accentMuted = `${ensureContrastRatio(accent, base, 3)}55`;
  const textPrimary = getContrastColor(base, 7);
  const textSecondary = ensureContrastRatio(
    adjustLightness(textPrimary, isDark ? -28 : 28),
    base,
    4.5,
  );
  const textMuted = ensureContrastRatio(
    adjustLightness(textSecondary, isDark ? -16 : 16),
    base,
    3,
  );
  const success = ensureContrastRatio(
    adjustSaturation(tertiarySeed.hex, options.syntaxSaturation),
    base,
    3.5,
  );
  const warning = ensureContrastRatio(
    adjustLightness(accentAltSeed.hex, isDark ? 8 : -8),
    base,
    3.5,
  );
  const error = ensureContrastRatio(
    adjustLightness(accentSeed.hex, isDark ? 14 : -14),
    base,
    3.5,
  );
  const info = ensureContrastRatio(
    adjustSaturation(accentAltSeed.hex, 0.85),
    base,
    3,
  );
  const diffAdded = ensureContrastRatio("#73c991", base, 3);
  const diffModified = ensureContrastRatio("#e2c08d", base, 3);
  const diffDeleted = ensureContrastRatio("#f14c4c", base, 3);

  return {
    base,
    surface,
    surfaceAlt,
    surfaceElevated,
    accent,
    accentAlt,
    accentMuted,
    textPrimary,
    textSecondary,
    textMuted,
    success,
    warning,
    error,
    info,
    diffAdded,
    diffModified,
    diffDeleted,
    terminalAnsi: [
      isDark ? "#000000" : "#1f1f1f",
      diffDeleted,
      diffAdded,
      warning,
      ensureContrastRatio(accentAlt, base, 3),
      ensureContrastRatio(accent, base, 3),
      ensureContrastRatio(info, base, 3),
      ensureContrastRatio(textPrimary, base, 3),
      isDark ? "#666666" : "#444444",
      ensureContrastRatio(adjustLightness(diffDeleted, 8), base, 3),
      ensureContrastRatio(adjustLightness(diffAdded, 8), base, 3),
      ensureContrastRatio(adjustLightness(warning, 6), base, 3),
      ensureContrastRatio(adjustLightness(accentAlt, 6), base, 3),
      ensureContrastRatio(adjustLightness(accent, 6), base, 3),
      ensureContrastRatio(adjustLightness(info, 6), base, 3),
      ensureContrastRatio(adjustLightness(textPrimary, isDark ? 0 : -16), base, 3),
    ],
  };
}

function getPrimarySeedIndex(seedCount: number): number {
  if (seedCount <= 2) {
    return 0;
  }
  return Math.floor(seedCount / 2);
}

function createDefaultOverrides(): ThemeOverrides {
  return {
    workbench: {},
    textMate: {},
    semantic: {},
  };
}

function createPaletteName(harmony: HarmonyType): string {
  return harmony
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function buildSeedColorInfos(hslSeeds: HSL[], harmony: HarmonyType): ColorInfo[] {
  const labels = HARMONY_LABELS[harmony];
  return hslSeeds.map((seed, index) => buildColorFromHsl(seed, labels[index] ?? `Color ${index + 1}`));
}

// Public API

export function generatePalette(
  baseHex: string,
  harmony: HarmonyType,
  name?: string,
  options?: Partial<PaletteOptions>,
  source: PaletteSource = "generated",
  baseColorLocked = false,
  randomSeed = Math.floor(Math.random() * 1_000_000_000),
): Palette {
  const mergedOptions: PaletteOptions = { ...DEFAULT_OPTIONS, ...options };
  const baseColor = createColorInfo(baseHex, "Base");
  const harmonyProfile = createHarmonyProfile(baseColor.hex, harmony, randomSeed);
  const originalSeedHsl = buildHarmonySeeds(baseColor.hsl, harmony, harmonyProfile);
  const adjustedSeedHsl = applyOptionsToSeeds(
    originalSeedHsl,
    baseColor.hex,
    harmony,
    mergedOptions,
    randomSeed,
    harmonyProfile,
  );
  const originalSeedColors = buildSeedColorInfos(originalSeedHsl, harmony);
  const seedColors = buildSeedColorInfos(adjustedSeedHsl, harmony);
  const derivedRoles = createDerivedRoles(seedColors, mergedOptions);

  return {
    id: `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name ?? `${createPaletteName(harmony)} Palette`,
    source,
    harmony,
    baseColor,
    seedColors,
    colors: seedColors,
    originalSeedColors,
    derivedRoles,
    options: mergedOptions,
    baseColorLocked,
    themeOverrides: createDefaultOverrides(),
    randomSeed,
    createdAt: Date.now(),
  };
}

export function regeneratePalette(
  palette: Palette,
  updates?: Partial<PaletteOptions>,
): Palette {
  const next = generatePalette(
    palette.baseColor.hex,
    palette.harmony,
    palette.name,
    { ...palette.options, ...updates },
    palette.source,
    palette.baseColorLocked,
    palette.randomSeed,
  );
  return {
    ...next,
    id: palette.id,
    createdAt: palette.createdAt,
    filePath: palette.filePath,
    themeOverrides: {
      workbench: { ...palette.themeOverrides.workbench },
      textMate: { ...palette.themeOverrides.textMate },
      semantic: { ...palette.themeOverrides.semantic },
    },
  };
}

export function applyPaletteAdjustments(
  palette: Palette,
  options: Partial<PaletteOptions>,
): Palette {
  return regeneratePalette(palette, options);
}

export function randomizePalette(palette: Palette): Palette {
  const nextBaseHex = palette.baseColorLocked ? palette.baseColor.hex : randomHex();
  const nextRandomSeed = Math.floor(Math.random() * 1_000_000_000);
  const next = generatePalette(
    nextBaseHex,
    palette.harmony,
    palette.name,
    palette.options,
    palette.source,
    palette.baseColorLocked,
    nextRandomSeed,
  );
  return {
    ...next,
    id: palette.id,
    createdAt: palette.createdAt,
    filePath: palette.filePath,
    themeOverrides: {
      workbench: { ...palette.themeOverrides.workbench },
      textMate: { ...palette.themeOverrides.textMate },
      semantic: { ...palette.themeOverrides.semantic },
    },
  };
}

export function updateBaseColor(
  palette: Palette,
  baseHex: string,
): Palette {
  const next = generatePalette(
    baseHex,
    palette.harmony,
    palette.name,
    palette.options,
    palette.source,
    palette.baseColorLocked,
    palette.randomSeed,
  );
  return {
    ...next,
    id: palette.id,
    createdAt: palette.createdAt,
    filePath: palette.filePath,
    themeOverrides: {
      workbench: { ...palette.themeOverrides.workbench },
      textMate: { ...palette.themeOverrides.textMate },
      semantic: { ...palette.themeOverrides.semantic },
    },
  };
}

export function updateSeedColor(
  palette: Palette,
  index: number,
  hex: string,
): Palette {
  if (index < 0 || index >= palette.seedColors.length) {
    return palette;
  }

  const seedColors = palette.seedColors.map((seed, currentIndex) =>
    currentIndex === index ? createColorInfo(hex, seed.name) : seed,
  );
  const originalSeedColors = palette.originalSeedColors.map((seed, currentIndex) =>
    currentIndex === index ? createColorInfo(hex, seed.name) : seed,
  );
  const primaryIndex = getPrimarySeedIndex(seedColors.length);
  const baseColor =
    index === primaryIndex
      ? createColorInfo(hex, "Base")
      : palette.baseColor;

  return {
    ...palette,
    baseColor,
    seedColors,
    colors: seedColors,
    originalSeedColors,
    derivedRoles: createDerivedRoles(seedColors, palette.options),
  };
}

export function setBaseColorLocked(
  palette: Palette,
  baseColorLocked: boolean,
): Palette {
  return {
    ...palette,
    baseColorLocked,
  };
}

export function setThemeOverride(
  palette: Palette,
  kind: keyof ThemeOverrides,
  id: string,
  color: string,
): Palette {
  return {
    ...palette,
    themeOverrides: {
      ...palette.themeOverrides,
      [kind]: {
        ...palette.themeOverrides[kind],
        [id]: normalizeHex(color),
      },
    },
  };
}

export function clearThemeOverride(
  palette: Palette,
  kind: keyof ThemeOverrides,
  id: string,
): Palette {
  const next = { ...palette.themeOverrides[kind] };
  delete next[id];
  return {
    ...palette,
    themeOverrides: {
      ...palette.themeOverrides,
      [kind]: next,
    },
  };
}

export function createPaletteFromImport(
  input: Partial<Palette> & {
    name: string;
    harmony: HarmonyType;
    baseColor: ColorInfo;
    seedColors: ColorInfo[];
    derivedRoles: DerivedRoles;
    options?: Partial<PaletteOptions>;
  },
): Palette {
  return {
    id: input.id ?? `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    source: input.source ?? "imported",
    harmony: input.harmony,
    baseColor: input.baseColor,
    seedColors: input.seedColors,
    colors: input.seedColors,
    originalSeedColors: input.originalSeedColors ?? input.seedColors,
    derivedRoles: input.derivedRoles,
    options: { ...DEFAULT_OPTIONS, ...input.options },
    baseColorLocked: input.baseColorLocked ?? false,
    themeOverrides: input.themeOverrides ?? createDefaultOverrides(),
    randomSeed: input.randomSeed ?? Math.floor(Math.random() * 1_000_000_000),
    createdAt: input.createdAt ?? Date.now(),
    filePath: input.filePath,
  };
}

export function randomHex(): string {
  return hslToHex({
    h: Math.floor(Math.random() * 360),
    s: Math.floor(randomBetween(Math.random, 48, 86)),
    l: Math.floor(randomBetween(Math.random, 34, 68)),
  });
}

export function detectThemeTypeFromBase(baseHex: string): "dark" | "light" {
  return hexToHsl(baseHex).l < 55 ? "dark" : "light";
}

export function getRoleColor(
  roles: DerivedRoles,
  role: ThemeRoleName,
): string {
  return roles[role];
}
