import * as vscode from "vscode";
import { Palette } from "./colorGenerator";
import { CustomPaletteManager } from "./customPalette";

interface TreeItemModel {
  id: string;
  label: string;
  kind: "section" | "action" | "palette" | "color";
  collapsibleState?: vscode.TreeItemCollapsibleState;
  palette?: Palette;
  colorHex?: string;
  command?: vscode.Command;
  contextValue?: string;
  tooltip?: string;
  iconPath?: vscode.ThemeIcon;
}

export class ThemeGeneratorProvider implements vscode.TreeDataProvider<TreeItemModel> {
  private readonly eventEmitter = new vscode.EventEmitter<TreeItemModel | undefined | void>();
  readonly onDidChangeTreeData = this.eventEmitter.event;

  private currentPalette: Palette | undefined;
  private savedPalettes: Palette[] = [];

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly paletteManager: CustomPaletteManager,
  ) {
    this.refreshSavedPalettes();
  }

  refresh(): void {
    this.refreshSavedPalettes();
    this.eventEmitter.fire();
  }

  setCurrentPalette(palette: Palette): void {
    this.currentPalette = palette;
    this.refresh();
  }

  getCurrentPalette(): Palette | undefined {
    return this.currentPalette;
  }

  getTreeItem(element: TreeItemModel): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, element.collapsibleState);
    item.id = element.id;
    item.command = element.command;
    item.contextValue = element.contextValue;
    item.tooltip = element.tooltip;
    item.iconPath = element.iconPath;
    if (element.kind === "color" && element.colorHex) {
      item.description = element.colorHex;
      item.iconPath = new vscode.ThemeIcon("circle-filled");
    }
    return item;
  }

  getChildren(element?: TreeItemModel): Thenable<TreeItemModel[]> {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }

    switch (element.kind) {
      case "section":
        return Promise.resolve(this.getSectionItems(element.id));
      case "palette":
        return Promise.resolve(this.getPaletteChildren(element.palette));
      default:
        return Promise.resolve([]);
    }
  }

  private refreshSavedPalettes(): void {
    this.savedPalettes = this.paletteManager.getAll();
  }

  private getRootItems(): TreeItemModel[] {
    return [
      {
        id: "quick-actions",
        label: "Quick Actions",
        kind: "section",
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        iconPath: new vscode.ThemeIcon("zap"),
      },
      {
        id: "current-palette",
        label: "Current Palette",
        kind: "section",
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        iconPath: new vscode.ThemeIcon("symbol-color"),
      },
      {
        id: "saved-palettes",
        label: "Saved Palettes",
        kind: "section",
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        iconPath: new vscode.ThemeIcon("library"),
      },
    ];
  }

  private getSectionItems(sectionId: string): TreeItemModel[] {
    switch (sectionId) {
      case "quick-actions":
        return [
          this.createAction(
            "open-editor",
            "Open Visual Editor",
            "layout",
            "vsc-theme-generator.openPalette",
          ),
          this.createAction(
            "random-palette",
            "Generate Random Palette",
            "refresh",
            "vsc-theme-generator.generateRandom",
          ),
          this.createAction(
            "import-theme",
            "Import Theme",
            "file-add",
            "vsc-theme-generator.importTheme",
          ),
        ];
      case "current-palette":
        if (!this.currentPalette) {
          return [
            {
              id: "current-empty",
              label: "No palette generated yet",
              kind: "action",
              tooltip: "Generate a palette to see it here",
            },
          ];
        }
        return [
          {
            id: "current-palette-node",
            label: `${this.currentPalette.name} (${this.currentPalette.harmony})`,
            kind: "palette",
            palette: this.currentPalette,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "current-palette",
            tooltip: `${this.currentPalette.seedColors.length} colors`,
          },
          this.createAction("preview-theme", "Preview Theme", "eye", "vsc-theme-generator.previewCurrent"),
          this.createAction("clear-preview", "Clear Preview", "close", "vsc-theme-generator.clearPreview"),
          this.createAction("save-palette", "Save Palette", "save", "vsc-theme-generator.saveCurrent"),
          this.createAction("export-theme", "Export Theme", "export", "vsc-theme-generator.exportCurrent"),
        ];
      case "saved-palettes":
        if (!this.savedPalettes.length) {
          return [
            {
              id: "saved-empty",
              label: "No saved palettes",
              kind: "action",
              tooltip: "Saved palettes will appear here",
            },
          ];
        }
        return this.savedPalettes.map((palette) => ({
          id: `saved-${palette.id}`,
          label: palette.name,
          kind: "palette",
          palette,
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          contextValue: "saved-palette",
          tooltip: `${palette.harmony} • ${palette.seedColors.length} colors`,
        }));
      default:
        return [];
    }
  }

  private getPaletteChildren(palette?: Palette): TreeItemModel[] {
    if (!palette) {
      return [];
    }

    return palette.seedColors.map((color, index) => ({
      id: `color-${palette.id}-${index}`,
      label: color.name ?? `Color ${index + 1}`,
      kind: "color",
      colorHex: color.hex,
      tooltip: `${color.hex} • Click to copy`,
      command: {
        command: "vsc-theme-generator.copyColor",
        title: "Copy Color",
        arguments: [color.hex],
      },
    }));
  }

  private createAction(
    id: string,
    label: string,
    icon: string,
    command: string,
  ): TreeItemModel {
    return {
      id,
      label,
      kind: "action",
      iconPath: new vscode.ThemeIcon(icon),
      command: {
        command,
        title: label,
      },
      tooltip: label,
    };
  }
}
