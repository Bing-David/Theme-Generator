import * as vscode from 'vscode';
import { Palette, HarmonyType, generatePalette, randomHex } from './colorGenerator';
import { CustomPaletteManager } from './customPalette';
import {
  mapPaletteToTheme,
  exportThemeToFile,
  applyThemePreview,
  clearThemePreview,
  importThemeFromFile,
} from "./themeExporter";
import { getStyles } from "./webviewStyle";
import { getHtml } from "./webviewHtml";
import { getScript } from "./webviewScript";

export class PalettePanel {
  public static currentPanel: PalettePanel | undefined;
  private static readonly viewType = "vscThemeGenerator.paletteView";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly paletteManager: CustomPaletteManager;
  private disposables: vscode.Disposable[] = [];

  private currentPalette: Palette | undefined;
  private onPaletteChangedCallback: ((palette: Palette) => void) | undefined;

  public static createOrShow(
    extensionUri: vscode.Uri,
    paletteManager: CustomPaletteManager,
  ): PalettePanel {
    const column = vscode.ViewColumn.One;

    if (PalettePanel.currentPanel) {
      PalettePanel.currentPanel.panel.reveal(column);
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

    PalettePanel.currentPanel = new PalettePanel(
      panel,
      extensionUri,
      paletteManager,
    );
    return PalettePanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    paletteManager: CustomPaletteManager,
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.paletteManager = paletteManager;

    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (msg) => this.handleMessage(msg),
      null,
      this.disposables,
    );
  }

  private async handleMessage(msg: any): Promise<void> {
    switch (msg.command) {
      case "generate":
        this.generateAndSend(
          msg.baseColor,
          msg.harmony,
          msg.contrastLevel,
          msg.saturation,
          msg.luminosity,
          msg.variation,
          msg.syntaxSaturation,
        );
        break;
      case "random":
        this.generateAndSend(
          randomHex(),
          msg.harmony ?? "complementary",
          msg.contrastLevel,
          msg.saturation,
          msg.luminosity,
          msg.variation,
          msg.syntaxSaturation,
        );
        break;
      case "editColor":
        if (this.currentPalette && msg.index >= 0) {
          this.currentPalette.colors[msg.index].hex = msg.newColor;
          this.currentPalette.colors[msg.index].name = `Color ${msg.index + 1}`;
          this.panel.webview.postMessage({
            command: "updatePalette",
            palette: this.currentPalette,
          });

          if (msg.autoPreview) {
            const theme = mapPaletteToTheme(this.currentPalette);
            await applyThemePreview(theme);
          }
        }
        break;
      case "savePalette":
        if (this.currentPalette) {
          const name = msg.name || this.currentPalette.name;
          this.currentPalette.name = name;
          await this.paletteManager.add({ ...this.currentPalette });
          this.sendSavedPalettes();
        }
        break;
      case "deletePalette":
        await this.paletteManager.remove(msg.id);
        this.sendSavedPalettes();
        break;
      case "loadPalette": {
        const palette = this.paletteManager.getById(msg.id);
        if (palette) {
          this.currentPalette = palette;
          this.panel.webview.postMessage({ command: "updatePalette", palette });
        }
        break;
      }
      case "exportTheme":
        if (this.currentPalette) {
          const theme = mapPaletteToTheme(this.currentPalette, msg.themeName);
          await exportThemeToFile(theme);
        }
        break;
      case "importTheme": {
        const palette = await importThemeFromFile();
        if (palette) {
          this.currentPalette = palette;
          this.panel.webview.postMessage({ command: "updatePalette", palette });
          this.notifyPaletteChanged();
        }
        break;
      }
      case "previewTheme":
        if (this.currentPalette) {
          const theme = mapPaletteToTheme(
            this.currentPalette,
            undefined,
            msg.syntaxSaturation,
          );
          await applyThemePreview(theme);
        }
        break;
      case "clearPreview":
        await clearThemePreview();
        break;
      case "resetTheme":
        await clearThemePreview();
        await vscode.commands.executeCommand("workbench.action.reloadWindow");
        break;
      case "saveCustomPalette": {
        const custom = this.paletteManager.createCustomPalette(
          msg.name,
          msg.colors,
        );
        await this.paletteManager.add(custom);
        this.currentPalette = custom;
        this.panel.webview.postMessage({
          command: "updatePalette",
          palette: custom,
        });
        this.sendSavedPalettes();
        break;
      }
      case "getSavedPalettes":
        this.sendSavedPalettes();
        break;
      case "updateThemeElement":
        if (this.currentPalette && msg.key && msg.color) {
          const theme = mapPaletteToTheme(this.currentPalette);
          if (theme.colors) {
            theme.colors[msg.key] = msg.color;
          }
          await applyThemePreview(theme);
          this.panel.webview.postMessage({
            command: "themeElementUpdated",
            key: msg.key,
            color: msg.color,
          });
        }
        break;
    }
  }

  private generateAndSend(
    baseColor: string,
    harmony: HarmonyType,
    contrastLevel: number = 0.7,
    saturation?: number,
    luminosity?: number,
    variation?: number,
    syntaxSaturation?: number,
  ): void {
    this.currentPalette = generatePalette(baseColor, harmony, undefined, {
      saturation,
      luminosity,
      variation,
    });
    this.panel.webview.postMessage({
      command: "updatePalette",
      palette: this.currentPalette,
      contrastLevel,
      syntaxSaturation,
    });
    this.notifyPaletteChanged();
  }

  private sendSavedPalettes(): void {
    this.panel.webview.postMessage({
      command: "savedPalettes",
      palettes: this.paletteManager.getAll(),
    });
  }

  public dispose(): void {
    PalettePanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }

  public updatePalette(palette: Palette): void {
    this.currentPalette = palette;
    this.panel.webview.postMessage({
      command: "updatePalette",
      palette: this.currentPalette,
    });
  }

  public onPaletteChanged(callback: (palette: Palette) => void): void {
    this.onPaletteChangedCallback = callback;
  }

  private notifyPaletteChanged(): void {
    if (this.currentPalette && this.onPaletteChangedCallback) {
      this.onPaletteChangedCallback(this.currentPalette);
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    const styles = getStyles();
    const script = getScript();
    return getHtml(styles, script, nonce);
  }
}

function getNonce(): string {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

