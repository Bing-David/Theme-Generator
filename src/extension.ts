import * as vscode from 'vscode';
import { PalettePanel } from './webviewPanel';
import { CustomPaletteManager } from './customPalette';
import { ThemeGeneratorProvider } from './sidebarProvider';
import {
  clearThemePreview,
  applyThemePreview,
  mapPaletteToTheme,
  exportThemeToFile,
  importThemeFromFile,
} from "./themeExporter";
import { generatePalette, randomHex } from "./colorGenerator";

export function activate(context: vscode.ExtensionContext) {
  console.log("VSC Theme Generator is now active!");

  const paletteManager = new CustomPaletteManager(context.globalState);
  const sidebarProvider = new ThemeGeneratorProvider(context, paletteManager);

  vscode.window.createTreeView("themeGeneratorView", {
    treeDataProvider: sidebarProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.openPalette", () => {
      const panel = PalettePanel.createOrShow(
        context.extensionUri,
        paletteManager,
      );
      panel.onPaletteChanged((palette) => {
        sidebarProvider.setCurrentPalette(palette);
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.generateRandom",
      () => {
        const harmonies = [
          "complementary",
          "analogous",
          "triadic",
          "split-complementary",
          "tetradic",
          "monochromatic",
        ] as const;
        const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
        const palette = generatePalette(randomHex(), harmony);
        sidebarProvider.setCurrentPalette(palette);

        if (PalettePanel.currentPanel) {
          PalettePanel.currentPanel.updatePalette(palette);
        } else {
          const panel = PalettePanel.createOrShow(
            context.extensionUri,
            paletteManager,
          );
          panel.onPaletteChanged((p) => {
            sidebarProvider.setCurrentPalette(p);
          });
          setTimeout(() => {
            panel.updatePalette(palette);
          }, 500);
        }

        const harmonyLabels: Record<string, string> = {
          complementary: "Complementary (opposite hues)",
          analogous: "Analogous (adjacent hues ±30°)",
          triadic: "Triadic (3 equidistant hues)",
          "split-complementary": " Split-Complementary (opposite ±30°)",
          tetradic: " Tetradic (4 equidistant hues)",
          monochromatic: "🔳 Monochromatic (same hue, varied lightness)",
        };

        vscode.window.showInformationMessage(
          `${harmonyLabels[harmony]} — ${palette.colors.length} colors`,
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.clearPreview",
      async () => {
        await clearThemePreview();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.previewCurrent",
      async () => {
        const palette = sidebarProvider.getCurrentPalette();
        if (palette) {
          const theme = mapPaletteToTheme(palette);
          await applyThemePreview(theme);
          if (PalettePanel.currentPanel) {
            PalettePanel.currentPanel.updatePalette(palette);
          }

          vscode.window.showInformationMessage("Theme preview applied");
        } else {
          vscode.window.showWarningMessage("No palette available to preview");
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.exportCurrent",
      async () => {
        const palette = sidebarProvider.getCurrentPalette();
        if (palette) {
          const themeName = await vscode.window.showInputBox({
            prompt: "Enter theme name",
            value: `${palette.name} Theme`,
          });
          if (themeName) {
            const theme = mapPaletteToTheme(palette, themeName);
            await exportThemeToFile(theme);
          }
        } else {
          vscode.window.showWarningMessage("No palette available to export");
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.importTheme",
      async () => {
        const palette = await importThemeFromFile();
        if (palette) {
          sidebarProvider.setCurrentPalette(palette);

          if (PalettePanel.currentPanel) {
            PalettePanel.currentPanel.updatePalette(palette);
          } else {
            const panel = PalettePanel.createOrShow(
              context.extensionUri,
              paletteManager,
            );
            panel.onPaletteChanged((p) => {
              sidebarProvider.setCurrentPalette(p);
            });
            setTimeout(() => {
              panel.updatePalette(palette);
            }, 500);
          }

          vscode.window.showInformationMessage(
            `Imported theme: ${palette.name}`,
          );
        }
      },
    ),
  );

  // Save current palette
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.saveCurrent",
      async () => {
        const palette = sidebarProvider.getCurrentPalette();
        if (palette) {
          const name = await vscode.window.showInputBox({
            prompt: "Enter palette name",
            value: palette.name,
          });
          if (name) {
            palette.name = name;
            await paletteManager.add(palette);
            sidebarProvider.refresh();
            vscode.window.showInformationMessage(`Saved "${name}" palette`);
          }
        } else {
          vscode.window.showWarningMessage("No palette available to save");
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.copyColor",
      async (hex: string) => {
        await vscode.env.clipboard.writeText(hex);
        vscode.window.showInformationMessage(`Copied ${hex} to clipboard`);
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.loadPalette",
      (item: any) => {
        if (item.palette) {
          sidebarProvider.setCurrentPalette(item.palette);
          vscode.window.showInformationMessage(
            `Loaded "${item.palette.name}" palette`,
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsc-theme-generator.deletePalette",
      async (item: any) => {
        if (item.palette) {
          const confirm = await vscode.window.showWarningMessage(
            `Delete "${item.palette.name}" palette?`,
            "Delete",
            "Cancel",
          );
          if (confirm === "Delete") {
            await paletteManager.remove(item.palette.id);
            sidebarProvider.refresh();
            vscode.window.showInformationMessage(
              `Deleted "${item.palette.name}" palette`,
            );
          }
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.refreshView", () => {
      sidebarProvider.refresh();
    }),
  );

  const initialHarmony = "complementary";
  const initialPalette = generatePalette(randomHex(), initialHarmony);
  sidebarProvider.setCurrentPalette(initialPalette);
}

export function deactivate() {}
