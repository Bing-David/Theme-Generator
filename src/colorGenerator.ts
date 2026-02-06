/**
 * Color Generator Module
 * Handles color conversions (HSL/RGB/HEX) and palette generation algorithms.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface RGB {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

export interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

export interface ColorInfo {
    hex: string;
    rgb: RGB;
    hsl: HSL;
    name?: string;
}

export type HarmonyType =
    | 'complementary'
    | 'analogous'
    | 'triadic'
    | 'split-complementary'
    | 'tetradic'
    | 'monochromatic';

export interface Palette {
    id: string;
    name: string;
    baseColor: ColorInfo;
    harmony: HarmonyType;
    colors: ColorInfo[];
    createdAt: number;
}

// ── Conversions ────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
    const clean = hex.replace(/^#/, '');
    const fullHex =
        clean.length === 3
            ? clean.split('').map(c => c + c).join('')
            : clean;
    const num = parseInt(fullHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

export function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
        let tt = t;
        if (tt < 0) { tt += 1; }
        if (tt > 1) { tt -= 1; }
        if (tt < 1 / 6) { return p + (q - p) * 6 * tt; }
        if (tt < 1 / 2) { return q; }
        if (tt < 2 / 3) { return p + (q - p) * (2 / 3 - tt) * 6; }
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

export function hexToHsl(hex: string): HSL {
    return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
    return rgbToHex(hslToRgb(hsl));
}

// ── Color Info Builder ─────────────────────────────────────────────────────

export function createColorInfo(hex: string, name?: string): ColorInfo {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    return { hex: hex.toLowerCase(), rgb, hsl, name };
}

function colorFromHsl(hsl: HSL, name?: string): ColorInfo {
    const hex = hslToHex(hsl);
    const rgb = hexToRgb(hex);
    return { hex, rgb, hsl: { ...hsl }, name };
}

// ── Harmony Algorithms ─────────────────────────────────────────────────────

function rotateHue(h: number, degrees: number): number {
    return ((h + degrees) % 360 + 360) % 360;
}

function generateComplementary(base: HSL): HSL[] {
    return [
        { ...base },
        { ...base, h: rotateHue(base.h, 180) },
    ];
}

function generateAnalogous(base: HSL): HSL[] {
    return [
        { ...base, h: rotateHue(base.h, -30) },
        { ...base },
        { ...base, h: rotateHue(base.h, 30) },
    ];
}

function generateTriadic(base: HSL): HSL[] {
    return [
        { ...base },
        { ...base, h: rotateHue(base.h, 120) },
        { ...base, h: rotateHue(base.h, 240) },
    ];
}

function generateSplitComplementary(base: HSL): HSL[] {
    return [
        { ...base },
        { ...base, h: rotateHue(base.h, 150) },
        { ...base, h: rotateHue(base.h, 210) },
    ];
}

function generateTetradic(base: HSL): HSL[] {
    return [
        { ...base },
        { ...base, h: rotateHue(base.h, 90) },
        { ...base, h: rotateHue(base.h, 180) },
        { ...base, h: rotateHue(base.h, 270) },
    ];
}

function generateMonochromatic(base: HSL): HSL[] {
    return [
        { ...base, l: Math.max(base.l - 30, 10) },
        { ...base, l: Math.max(base.l - 15, 10) },
        { ...base },
        { ...base, l: Math.min(base.l + 15, 95) },
        { ...base, l: Math.min(base.l + 30, 95) },
    ];
}

// ── Public API ─────────────────────────────────────────────────────────────

const HARMONY_LABELS: Record<HarmonyType, string[]> = {
    'complementary': ['Primary Color', 'Opposite Hue'],
    'analogous': ['Adjacent -30°', 'Primary Color', 'Adjacent +30°'],
    'triadic': ['Primary Color', 'Triangle 120°', 'Triangle 240°'],
    'split-complementary': ['Primary Color', 'Split Left 150°', 'Split Right 210°'],
    'tetradic': ['Primary Color', 'Square 90°', 'Opposite 180°', 'Square 270°'],
    'monochromatic': ['Much Darker', 'Darker Shade', 'Primary Color', 'Lighter Tint', 'Much Lighter'],
};

const HARMONY_GENERATORS: Record<HarmonyType, (base: HSL) => HSL[]> = {
    'complementary': generateComplementary,
    'analogous': generateAnalogous,
    'triadic': generateTriadic,
    'split-complementary': generateSplitComplementary,
    'tetradic': generateTetradic,
    'monochromatic': generateMonochromatic,
};

export function generatePalette(
    baseHex: string,
    harmony: HarmonyType,
    name?: string,
    options?: {
        saturation?: number;
        luminosity?: number;
        variation?: number;
    }
): Palette {
    const baseHsl = hexToHsl(baseHex);
    const generator = HARMONY_GENERATORS[harmony];
    const labels = HARMONY_LABELS[harmony];
    const hslColors = generator(baseHsl);

    // Aplicar ajustes opcionales
    const adjustedColors = hslColors.map(hsl => {
        let adjusted = { ...hsl };
        
        if (options?.saturation !== undefined) {
            adjusted.s = Math.round(adjusted.s * options.saturation);
        }
        
        if (options?.luminosity !== undefined) {
            adjusted.l = Math.round(adjusted.l * options.luminosity / 0.5);
            adjusted.l = Math.max(10, Math.min(90, adjusted.l));
        }
        
        if (options?.variation !== undefined && options.variation > 0) {
            const variance = options.variation * 100;
            adjusted.h = rotateHue(adjusted.h, Math.random() * variance * 2 - variance);
            adjusted.s = Math.max(0, Math.min(100, adjusted.s + (Math.random() * variance * 2 - variance)));
            adjusted.l = Math.max(10, Math.min(90, adjusted.l + (Math.random() * variance * 0.5 - variance * 0.25)));
        }
        
        return adjusted;
    });

    const colors = adjustedColors.map((hsl, i) =>
        colorFromHsl(hsl, labels[i] ?? `Color ${i + 1}`)
    );

    return {
        id: `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name ?? `${harmony} palette`,
        baseColor: createColorInfo(baseHex, 'Base'),
        harmony,
        colors,
        createdAt: Date.now(),
    };
}

export function randomHex(): string {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `#${hex}`;
}

// ── WCAG 2.1 Contrast Functions ───────────────────────────────────────────

function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        const normalized = val / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastColor(
  bgHex: string,
  targetRatio: number = 4.5,
): string {
  if (getContrastRatio(bgHex, "#ffffff") >= targetRatio) {
    return "#ffffff";
  }
  if (getContrastRatio(bgHex, "#000000") >= targetRatio) {
    return "#000000";
  }
  const bgLum = getLuminance(bgHex);
  return bgLum > 0.5 ? "#000000" : "#ffffff";
}

export function ensureContrastRatio(
    foregroundHex: string,
    backgroundHex: string,
    targetRatio: number = 4.5,
    preferBrighter: boolean = true
): string {
    const currentRatio = getContrastRatio(foregroundHex, backgroundHex);
    if (currentRatio >= targetRatio) {
        return foregroundHex;
    }

    const hsl = hexToHsl(foregroundHex);
    const bgLuminance = getLuminance(backgroundHex);
    
    // Ajustar luminosidad para alcanzar el contraste objetivo
    let bestColor = foregroundHex;
    let bestRatio = currentRatio;
    
    // Intentar hacer más claro u oscuro
    const direction = preferBrighter ? 1 : -1;
    const startL = bgLuminance > 0.5 ? 10 : 90;
    
    for (let l = startL; l >= 10 && l <= 90; l += direction * 5) {
        const testHex = hslToHex({ ...hsl, l });
        const ratio = getContrastRatio(testHex, backgroundHex);
        if (ratio >= targetRatio) {
            return testHex;
        }
        if (ratio > bestRatio) {
            bestRatio = ratio;
            bestColor = testHex;
        }
    }
    
    return bestColor;
}
