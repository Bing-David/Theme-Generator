import * as vscode from "vscode";
import {
  Palette,
  HarmonyType,
  applyPaletteAdjustments,
  generatePalette,
  randomizePalette,
  setBaseColorLocked,
  setThemeOverride,
  updateBaseColor,
  updateSeedColor,
} from "./colorGenerator";
import { CustomPaletteManager } from "./customPalette";
import {
  applyThemePreview,
  clearThemePreview,
  exportThemeToFile,
  getEditableThemeColorState,
  importThemeFromFile,
  mapPaletteToTheme,
} from "./themeExporter";
import {
  SEMANTIC_EDITABLE_ITEMS,
  TEXTMATE_EDITABLE_ITEMS,
  WORKBENCH_EDITABLE_ITEMS,
} from "./themeCatalog";
import { getHtml } from "./webviewHtml";
import { getScript } from "./webviewScript";
import { getStyles } from "./webviewStyle";

interface PanelInitData {
  palette: Palette;
  savedPalettes: Palette[];
  catalog: {
    workbench: typeof WORKBENCH_EDITABLE_ITEMS;
    textMate: typeof TEXTMATE_EDITABLE_ITEMS;
    semantic: typeof SEMANTIC_EDITABLE_ITEMS;
  };
}

export class PalettePanel {
  public static currentPanel: PalettePanel | undefined;
  private static readonly viewType = "vscThemeGenerator.paletteView";

  private readonly panel: vscode.WebviewPanel;
  private readonly paletteManager: CustomPaletteManager;
  private disposables: vscode.Disposable[] = [];
  private currentPalette: Palette;
  private autoPreviewEnabled = true;
  private onPaletteChangedCallback: ((palette: Palette) => void) | undefined;

  public static createOrShow(
    extensionUri: vscode.Uri,
    paletteManager: CustomPaletteManager,
    palette: Palette,
  ): PalettePanel {
    const column = vscode.ViewColumn.One;

    if (PalettePanel.currentPanel) {
      PalettePanel.currentPanel.panel.reveal(column);
      PalettePanel.currentPanel.setPalette(palette, false);
      return PalettePanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      PalettePanel.viewType,
      "Theme Generator",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      },
    );

    PalettePanel.currentPanel = new PalettePanel(panel, paletteManager, palette);
    return PalettePanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    paletteManager: CustomPaletteManager,
    palette: Palette,
  ) {
    this.panel = panel;
    this.paletteManager = paletteManager;
    this.currentPalette = palette;

    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (message) => void this.handleMessage(message),
      null,
      this.disposables,
    );
  }

  // Messaging

  private async handleMessage(message: any): Promise<void> {
    switch (message.command) {
      case "initialize":
        this.sendInitializationData();
        return;
      case "generatePalette":
        this.currentPalette = generatePalette(
          message.baseColor,
          message.harmony as HarmonyType,
          this.currentPalette.name,
          {
            saturation: message.saturation,
            luminosity: message.luminosity,
            variation: message.variation,
            syntaxSaturation: message.syntaxSaturation,
          },
          this.currentPalette.source,
          this.currentPalette.baseColorLocked,
        );
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "adjustPalette":
        this.currentPalette = applyPaletteAdjustments(this.currentPalette, {
          saturation: message.saturation,
          luminosity: message.luminosity,
          variation: message.variation,
          syntaxSaturation: message.syntaxSaturation,
        });
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "randomizePalette":
        this.currentPalette = randomizePalette(this.currentPalette);
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "setBaseColor":
        this.currentPalette = updateBaseColor(this.currentPalette, message.baseColor);
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "setBaseColorLock":
        this.currentPalette = setBaseColorLocked(this.currentPalette, Boolean(message.locked));
        this.notifyPaletteChanged();
        this.sendPaletteState();
        return;
      case "setAutoPreview":
        this.autoPreviewEnabled = Boolean(message.enabled);
        if (this.autoPreviewEnabled) {
          await this.previewCurrentPalette();
        }
        return;
      case "updateSeedColor":
        this.currentPalette = updateSeedColor(this.currentPalette, message.index, message.color);
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "updateWorkbenchColor":
        this.currentPalette = setThemeOverride(
          this.currentPalette,
          "workbench",
          message.id,
          message.color,
        );
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "updateTextMateToken":
        this.currentPalette = setThemeOverride(
          this.currentPalette,
          "textMate",
          message.id,
          message.color,
        );
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "updateSemanticToken":
        this.currentPalette = setThemeOverride(
          this.currentPalette,
          "semantic",
          message.id,
          message.color,
        );
        this.notifyPaletteChanged();
        this.sendPaletteState();
        if (message.autoPreview) {
          await this.previewCurrentPalette();
        }
        return;
      case "previewTheme":
        await this.previewCurrentPalette();
        return;
      case "clearPreview":
        await clearThemePreview();
        this.panel.webview.postMessage({ command: "previewCleared" });
        return;
      case "savePalette":
        await this.saveCurrentPalette();
        return;
      case "deletePalette":
        await this.paletteManager.remove(message.id);
        await clearThemePreview();
        this.sendSavedPalettes();
        this.panel.webview.postMessage({ command: "previewCleared" });
        return;
      case "loadPalette": {
        const palette = this.paletteManager.getById(message.id);
        if (palette) {
          this.currentPalette = palette;
          this.notifyPaletteChanged();
          this.sendPaletteState();
          if (this.autoPreviewEnabled) {
            await this.previewCurrentPalette();
          }
        }
        return;
      }
      case "exportTheme":
        await exportThemeToFile(mapPaletteToTheme(this.currentPalette, message.themeName));
        return;
      case "importTheme": {
        const imported = await importThemeFromFile();
        if (imported) {
          this.currentPalette = imported;
          await this.paletteManager.add(imported);
          this.notifyPaletteChanged();
          this.sendSavedPalettes();
          this.sendPaletteState();
          if (this.autoPreviewEnabled) {
            await this.previewCurrentPalette();
          }
        }
        return;
      }
      default:
        return;
    }
  }

  // Public

  public dispose(): void {
    PalettePanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
  }

  public onPaletteChanged(callback: (palette: Palette) => void): void {
    this.onPaletteChangedCallback = callback;
  }

  public setPalette(palette: Palette, preview = false): void {
    this.currentPalette = palette;
    this.sendPaletteState();
    if (preview && this.autoPreviewEnabled) {
      void this.previewCurrentPalette();
    }
  }

  // State

  private notifyPaletteChanged(): void {
    this.onPaletteChangedCallback?.(this.currentPalette);
  }

  private sendInitializationData(): void {
    const initData: PanelInitData = {
      palette: this.currentPalette,
      savedPalettes: this.paletteManager.getAll(),
      catalog: {
        workbench: WORKBENCH_EDITABLE_ITEMS,
        textMate: TEXTMATE_EDITABLE_ITEMS,
        semantic: SEMANTIC_EDITABLE_ITEMS,
      },
    };

    this.panel.webview.postMessage({
      command: "initializeData",
      data: initData,
      editableColors: getEditableThemeColorState(mapPaletteToTheme(this.currentPalette)),
    });
  }

  private sendPaletteState(): void {
    const theme = mapPaletteToTheme(this.currentPalette);
    this.panel.webview.postMessage({
      command: "paletteState",
      palette: this.currentPalette,
      editableColors: getEditableThemeColorState(theme),
    });
  }

  private sendSavedPalettes(): void {
    this.panel.webview.postMessage({
      command: "savedPalettes",
      palettes: this.paletteManager.getAll(),
    });
  }

  private async previewCurrentPalette(): Promise<void> {
    await applyThemePreview(mapPaletteToTheme(this.currentPalette));
    this.panel.webview.postMessage({ command: "previewApplied" });
  }

  private async saveCurrentPalette(): Promise<void> {
    const name = await vscode.window.showInputBox({
      prompt: "Enter a name for your palette",
      value: this.currentPalette.name,
      placeHolder: "My Theme",
    });

    if (!name) {
      return;
    }

    this.currentPalette = {
      ...this.currentPalette,
      name,
    };

    await this.paletteManager.add(this.currentPalette);
    this.notifyPaletteChanged();
    this.sendSavedPalettes();
    this.sendPaletteState();
  }

  private getHtml(): string {
    const nonce = getNonce();
    return getHtml(getStyles(), getScript(), nonce);
  }
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return value;
}
