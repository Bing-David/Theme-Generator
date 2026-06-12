import * as vscode from "vscode";
import { PalettePanel } from "./webviewPanel";
import { CustomPaletteManager } from "./customPalette";
import { generatePalette, randomHex, randomizePalette } from "./colorGenerator";
import { ThemeGeneratorProvider } from "./sidebarProvider";
import {
  applyThemePreview,
  clearThemePreview,
  exportThemeToFile,
  importThemeFromFile,
  initializeThemePreview,
  mapPaletteToTheme,
} from "./themeExporter";

export function activate(context: vscode.ExtensionContext): void {
  initializeThemePreview(context.extensionPath);

  const paletteManager = new CustomPaletteManager(context.globalState);
  const sidebarProvider = new ThemeGeneratorProvider(context, paletteManager);
  let currentPalette = generatePalette(randomHex(), "analogous");

  const setCurrentPalette = (
    palette: typeof currentPalette,
    options?: { previewInPanel?: boolean },
  ): void => {
    currentPalette = palette;
    sidebarProvider.setCurrentPalette(palette);
    PalettePanel.currentPanel?.setPalette(palette, options?.previewInPanel ?? false);
  };

  vscode.window.createTreeView("themeGeneratorView", {
    treeDataProvider: sidebarProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.openPalette", () => {
      const panel = PalettePanel.createOrShow(
        context.extensionUri,
        paletteManager,
        currentPalette,
      );
      panel.onPaletteChanged((palette) => {
        setCurrentPalette(palette);
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.generateRandom", () => {
      setCurrentPalette(randomizePalette(currentPalette), { previewInPanel: true });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.clearPreview", async () => {
      await clearThemePreview();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.previewCurrent", async () => {
      await applyThemePreview(mapPaletteToTheme(currentPalette));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.exportCurrent", async () => {
      const themeName = await vscode.window.showInputBox({
        prompt: "Enter theme name",
        value: `${currentPalette.name} Theme`,
      });
      if (!themeName) {
        return;
      }
      await exportThemeToFile(mapPaletteToTheme(currentPalette, themeName));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.importTheme", async () => {
      const palette = await importThemeFromFile();
      if (!palette) {
        return;
      }
      setCurrentPalette(palette, { previewInPanel: true });
      await paletteManager.add(palette);
      sidebarProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.saveCurrent", async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Enter palette name",
        value: currentPalette.name,
      });
      if (!name) {
        return;
      }
      currentPalette = { ...currentPalette, name };
      await paletteManager.add(currentPalette);
      sidebarProvider.refresh();
      setCurrentPalette(currentPalette);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.copyColor", async (hex: string) => {
      await vscode.env.clipboard.writeText(hex);
      vscode.window.showInformationMessage(`Copied ${hex} to clipboard`);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.loadPalette", (item: any) => {
      if (item?.palette) {
        setCurrentPalette(item.palette, { previewInPanel: true });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.deletePalette", async (item: any) => {
      if (!item?.palette) {
        return;
      }
      const confirmed = await vscode.window.showWarningMessage(
        `Delete "${item.palette.name}" palette?`,
        "Delete",
        "Cancel",
      );
      if (confirmed !== "Delete") {
        return;
      }
      await paletteManager.remove(item.palette.id);
      await clearThemePreview();
      sidebarProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsc-theme-generator.refreshView", () => {
      sidebarProvider.refresh();
    }),
  );

  setCurrentPalette(currentPalette);
}

export function deactivate(): void {}
