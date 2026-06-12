import * as assert from "assert";
import {
  generatePalette,
  hexToHsl,
  randomizePalette,
  setBaseColorLocked,
} from "../colorGenerator";
import {
  convertThemeToPalette,
  getEditableThemeColorState,
  mapPaletteToTheme,
} from "../themeExporter";

function hueDistance(left: number, right: number): number {
  const difference = Math.abs(left - right) % 360;
  return Math.min(difference, 360 - difference);
}

function assertNear(actual: number, expected: number, tolerance: number, message: string): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}. Actual: ${actual}, expected: ${expected} ±${tolerance}`,
  );
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

suite("Theme Generator", () => {
  test("monochromatic palette keeps a single hue family", () => {
    const palette = generatePalette("#4a90d9", "monochromatic");
    const hues = palette.seedColors.map((color) => color.hsl.h);
    const baseHue = hues[Math.floor(hues.length / 2)];

    hues.forEach((hue) => {
      const difference = hueDistance(hue, baseHue);
      assert.ok(difference <= 2, `Expected hue ${hue} to stay near ${baseHue}`);
    });
  });

  test("harmony count stays stable", () => {
    assert.strictEqual(generatePalette("#4a90d9", "complementary").seedColors.length, 2);
    assert.strictEqual(generatePalette("#4a90d9", "analogous").seedColors.length, 3);
    assert.strictEqual(generatePalette("#4a90d9", "triadic").seedColors.length, 3);
    assert.strictEqual(generatePalette("#4a90d9", "split-complementary").seedColors.length, 3);
    assert.strictEqual(generatePalette("#4a90d9", "tetradic").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "monochromatic").seedColors.length, 5);
    assert.strictEqual(generatePalette("#4a90d9", "square").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "double-complementary").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "compound").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "accented-analogous").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "neutral").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "warm").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "cool").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "polychromatic").seedColors.length, 5);
    assert.strictEqual(generatePalette("#4a90d9", "rainbow").seedColors.length, 6);
    assert.strictEqual(generatePalette("#4a90d9", "duotone").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "grayscale").seedColors.length, 5);
    assert.strictEqual(generatePalette("#4a90d9", "near-monochromatic").seedColors.length, 5);
    assert.strictEqual(generatePalette("#4a90d9", "split-triadic").seedColors.length, 4);
    assert.strictEqual(generatePalette("#4a90d9", "pentadic").seedColors.length, 5);
    assert.strictEqual(generatePalette("#4a90d9", "hexadic").seedColors.length, 6);
  });

  test("grayscale palette removes chroma", () => {
    const palette = generatePalette("#4a90d9", "grayscale");
    palette.seedColors.forEach((color) => {
      assert.strictEqual(color.hsl.s, 0);
    });
  });

  test("near-monochromatic palette stays close in hue", () => {
    const palette = generatePalette("#4a90d9", "near-monochromatic", undefined, undefined, "generated", false, 0);
    const baseHue = palette.seedColors[Math.floor(palette.seedColors.length / 2)].hsl.h;
    palette.seedColors.forEach((color) => {
      const difference = hueDistance(color.hsl.h, baseHue);
      assert.ok(difference <= 8, `Expected hue ${color.hsl.h} to stay near ${baseHue}`);
    });
  });

  test("complementary palette keeps opposite hue anchors", () => {
    const palette = generatePalette("#4a90d9", "complementary", undefined, undefined, "generated", false, 0);
    const [base, complement] = palette.originalSeedColors;

    assertNear(hueDistance(base.hsl.h, complement.hsl.h), 180, 12, "Complementary harmony drifted");
  });

  test("triadic palette keeps near 120 degree spacing", () => {
    const palette = generatePalette("#4a90d9", "triadic", undefined, undefined, "generated", false, 0);
    const baseHue = palette.originalSeedColors[0].hsl.h;
    const offsets = palette.originalSeedColors
      .slice(1)
      .map((color) => (color.hsl.h - baseHue + 360) % 360)
      .sort((left, right) => left - right);

    assertNear(offsets[0], 120, 16, "Triadic second hue drifted");
    assertNear(offsets[1], 240, 16, "Triadic third hue drifted");
  });

  test("square palette keeps quarter wheel spacing", () => {
    const palette = generatePalette("#4a90d9", "square", undefined, undefined, "generated", false, 0);
    const baseHue = palette.originalSeedColors[0].hsl.h;
    const offsets = palette.originalSeedColors
      .slice(1)
      .map((color) => (color.hsl.h - baseHue + 360) % 360)
      .sort((left, right) => left - right);

    assertNear(offsets[0], 90, 14, "Square second hue drifted");
    assertNear(offsets[1], 180, 12, "Square third hue drifted");
    assertNear(offsets[2], 270, 14, "Square fourth hue drifted");
  });

  test("warm palette stays inside a warm hue family", () => {
    const palette = generatePalette("#4a90d9", "warm");
    const warmAnchors = [8, 18, 28, 46];

    palette.originalSeedColors.forEach((color) => {
      const nearestAnchor = Math.min(...warmAnchors.map((anchor) => hueDistance(color.hsl.h, anchor)));
      assert.ok(nearestAnchor <= 14, `Warm hue ${color.hsl.h} escaped warm anchors`);
    });
  });

  test("cool palette stays inside a cool hue family", () => {
    const palette = generatePalette("#4a90d9", "cool");
    const coolAnchors = [164, 188, 210, 252];

    palette.originalSeedColors.forEach((color) => {
      const nearestAnchor = Math.min(...coolAnchors.map((anchor) => hueDistance(color.hsl.h, anchor)));
      assert.ok(nearestAnchor <= 14, `Cool hue ${color.hsl.h} escaped cool anchors`);
    });
  });

  test("neutral palette reduces average saturation against analogous", () => {
    const neutral = generatePalette("#4a90d9", "neutral");
    const analogous = generatePalette("#4a90d9", "analogous");

    assert.ok(
      average(neutral.seedColors.map((color) => color.hsl.s)) <
        average(analogous.seedColors.map((color) => color.hsl.s)),
      "Neutral harmony should desaturate more than analogous",
    );
  });

  test("random respects base color lock", () => {
    const palette = generatePalette("#4a90d9", "analogous");
    const locked = randomizePalette(setBaseColorLocked(palette, true));
    const unlocked = randomizePalette(setBaseColorLocked(palette, false));

    assert.strictEqual(locked.baseColor.hex, palette.baseColor.hex);
    assert.notDeepStrictEqual(
      locked.seedColors.map((color) => color.hex),
      palette.seedColors.map((color) => color.hex),
    );
    assert.notStrictEqual(unlocked.baseColor.hex, palette.baseColor.hex);
  });

  test("generated palettes start with base color unlocked", () => {
    const palette = generatePalette("#4a90d9", "analogous");

    assert.strictEqual(palette.baseColorLocked, false);
  });

  test("locked randomization still produces diverse seed structures", () => {
    const palette = setBaseColorLocked(generatePalette("#4a90d9", "triadic"), true);
    const signatures = new Set(
      Array.from({ length: 6 }, () =>
        randomizePalette(palette).seedColors.map((color) => color.hex).join("|"),
      ),
    );

    assert.ok(signatures.size >= 3, `Expected more variation, got ${signatures.size} unique results`);
  });

  test("theme mapping includes workbench, textmate and semantic colors", () => {
    const palette = generatePalette("#4a90d9", "triadic");
    const theme = mapPaletteToTheme(palette);
    const editable = getEditableThemeColorState(theme);

    assert.ok(theme.colors["editor.background"]);
    assert.ok(theme.colors["activityBar.background"]);
    assert.ok(theme.tokenColors.length > 10);
    assert.ok(theme.semanticHighlighting);
    assert.ok(theme.semanticTokenColors["class"]);
    assert.ok(editable.workbench["editor.background"]);
    assert.ok(editable.textMate["keyword"]);
    assert.ok(editable.semantic["class"]);
  });

  test("convertThemeToPalette restores exported palette metadata", () => {
    const palette = generatePalette("#4a90d9", "split-complementary");
    const theme = mapPaletteToTheme(palette);
    const imported = convertThemeToPalette({
      ...theme,
      _palette: palette,
    });

    assert.strictEqual(imported.harmony, palette.harmony);
    assert.strictEqual(imported.baseColor.hex, palette.baseColor.hex);
    assert.strictEqual(imported.seedColors.length, palette.seedColors.length);
  });

  test("convertThemeToPalette reconstructs external themes", () => {
    const imported = convertThemeToPalette({
      name: "External Theme",
      type: "dark",
      colors: {
        "editor.background": "#101418",
        "activityBar.background": "#18212c",
        "statusBar.background": "#224466",
        "button.background": "#4a90d9",
        "focusBorder": "#7dcfff",
      },
      tokenColors: [
        {
          name: "keyword",
          scope: ["keyword"],
          settings: { foreground: "#ff7ab6" },
        },
      ],
      semanticHighlighting: true,
      semanticTokenColors: {
        class: "#7dcfff",
      },
    });

    assert.strictEqual(imported.source, "imported");
    assert.ok(imported.seedColors.length >= 1);
    assert.ok(imported.themeOverrides.textMate.keyword);
    assert.ok(imported.themeOverrides.semantic.class);
  });
});
