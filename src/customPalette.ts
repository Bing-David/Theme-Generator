import * as vscode from "vscode";
import { Palette, ColorInfo, createColorInfo } from "./colorGenerator";

const STORAGE_KEY = "vscThemeGenerator.customPalettes";

export class CustomPaletteManager {
  private palettes: Palette[] = [];

  constructor(private readonly globalState: vscode.Memento) {
    this.load();
  }

  // ── Persistence ────────────────────────────────────────────────────────

  private load(): void {
    const raw = this.globalState.get<string>(STORAGE_KEY);
    if (raw) {
      try {
        this.palettes = JSON.parse(raw);
      } catch {
        this.palettes = [];
      }
    }
  }

  private async save(): Promise<void> {
    await this.globalState.update(STORAGE_KEY, JSON.stringify(this.palettes));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────

  getAll(): Palette[] {
    return [...this.palettes];
  }

  getById(id: string): Palette | undefined {
    return this.palettes.find((p) => p.id === id);
  }

  async add(palette: Palette): Promise<void> {
    this.palettes.push(palette);
    await this.save();
  }

  async update(id: string, updates: Partial<Palette>): Promise<boolean> {
    const idx = this.palettes.findIndex((p) => p.id === id);
    if (idx === -1) {
      return false;
    }
    this.palettes[idx] = { ...this.palettes[idx], ...updates };
    await this.save();
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const before = this.palettes.length;
    this.palettes = this.palettes.filter((p) => p.id !== id);
    if (this.palettes.length !== before) {
      await this.save();
      return true;
    }
    return false;
  }

  async clear(): Promise<void> {
    this.palettes = [];
    await this.save();
  }

  // ── Custom Palette Creation ────────────────────────────────────────────

  createCustomPalette(name: string, hexColors: string[]): Palette {
    const colors: ColorInfo[] = hexColors.map((hex, i) =>
      createColorInfo(hex, `Custom ${i + 1}`),
    );
    const baseColor = colors[0] ?? createColorInfo("#000000", "Base");

    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      baseColor,
      harmony: "complementary",
      colors,
      createdAt: Date.now(),
    };
  }

  async addColorToPalette(paletteId: string, hex: string): Promise<boolean> {
    const palette = this.getById(paletteId);
    if (!palette) {
      return false;
    }
    palette.colors.push(
      createColorInfo(hex, `Custom ${palette.colors.length + 1}`),
    );
    return this.update(paletteId, { colors: palette.colors });
  }

  async removeColorFromPalette(
    paletteId: string,
    colorIndex: number,
  ): Promise<boolean> {
    const palette = this.getById(paletteId);
    if (!palette || colorIndex < 0 || colorIndex >= palette.colors.length) {
      return false;
    }
    palette.colors.splice(colorIndex, 1);
    return this.update(paletteId, { colors: palette.colors });
  }
}
