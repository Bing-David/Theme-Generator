import * as vscode from "vscode";
import {
  Palette,
  createColorInfo,
  createPaletteFromImport,
  detectThemeTypeFromBase,
  generatePalette,
} from "./colorGenerator";

const STORAGE_KEY = "vscThemeGenerator.customPalettes";

export class CustomPaletteManager {
  private palettes: Palette[] = [];

  constructor(private readonly globalState: vscode.Memento) {
    this.load();
  }

  // Persistence

  private load(): void {
    const raw = this.globalState.get<string>(STORAGE_KEY);
    if (!raw) {
      this.palettes = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      this.palettes = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.palettes = [];
    }
  }

  private async save(): Promise<void> {
    await this.globalState.update(STORAGE_KEY, JSON.stringify(this.palettes));
  }

  // CRUD

  getAll(): Palette[] {
    return [...this.palettes];
  }

  getById(id: string): Palette | undefined {
    return this.palettes.find((palette) => palette.id === id);
  }

  async add(palette: Palette): Promise<void> {
    const index = this.palettes.findIndex((item) => item.id === palette.id);
    if (index >= 0) {
      this.palettes[index] = palette;
    } else {
      this.palettes.push(palette);
    }
    await this.save();
  }

  async remove(id: string): Promise<boolean> {
    const previousLength = this.palettes.length;
    this.palettes = this.palettes.filter((palette) => palette.id !== id);
    if (this.palettes.length === previousLength) {
      return false;
    }
    await this.save();
    return true;
  }

  async clear(): Promise<void> {
    this.palettes = [];
    await this.save();
  }

  // Utilities

  createCustomPalette(name: string, hexColors: string[]): Palette {
    const colors = hexColors.map((hex, index) =>
      createColorInfo(hex, `Custom ${index + 1}`),
    );
    const baseColor =
      colors[Math.floor(colors.length / 2)] ??
      createColorInfo("#161616", "Base");
    return createPaletteFromImport({
      name,
      harmony:
        detectThemeTypeFromBase(baseColor.hex) === "dark"
          ? "analogous"
          : "complementary",
      baseColor,
      seedColors: colors,
      derivedRoles: generatePalette(baseColor.hex, "analogous").derivedRoles,
    });
  }
}
