/**
 * Theme Generator Sidebar Panel
 * Provides a tree view with palette management and theme operations.
 */

import * as vscode from 'vscode';
import { Palette, HarmonyType, generatePalette, randomHex } from './colorGenerator';
import { CustomPaletteManager } from './customPalette';
import { mapPaletteToTheme, exportThemeToFile, applyThemePreview, clearThemePreview } from './themeExporter';

interface TreeItem {
    id: string;
    label: string;
    type: 'section' | 'action' | 'palette' | 'color' | 'separator';
    collapsibleState?: vscode.TreeItemCollapsibleState;
    command?: vscode.Command;
    contextValue?: string;
    palette?: Palette;
    colorHex?: string;
    iconPath?: string | vscode.ThemeIcon;
    tooltip?: string;
}

export class ThemeGeneratorProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

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
        this._onDidChangeTreeData.fire();
    }

    private refreshSavedPalettes(): void {
        this.savedPalettes = this.paletteManager.getAll();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label, element.collapsibleState);
        item.id = element.id;
        item.command = element.command;
        item.contextValue = element.contextValue;
        item.tooltip = element.tooltip;

        if (element.iconPath) {
            item.iconPath = element.iconPath;
        }

        // Color preview for palette colors
        if (element.type === 'color' && element.colorHex) {
            item.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('editor.foreground'));
            item.description = element.colorHex;
        }

        return item;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!element) {
            return Promise.resolve(this.getRootItems());
        }

        switch (element.type) {
            case 'section':
                return Promise.resolve(this.getSectionItems(element));
            case 'palette':
                return Promise.resolve(this.getPaletteColors(element));
            default:
                return Promise.resolve([]);
        }
    }

    private getRootItems(): TreeItem[] {
        const items: TreeItem[] = [
            // Quick Actions
            {
                id: 'quick-actions',
                label: 'Quick Actions',
                type: 'section',
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                iconPath: new vscode.ThemeIcon('zap'),
            },
            
            // Current Palette
            {
                id: 'current-palette',
                label: 'Current Palette',
                type: 'section',
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                iconPath: new vscode.ThemeIcon('symbol-color'),
            },

            // Saved Palettes
            {
                id: 'saved-palettes',
                label: 'Saved Palettes',
                type: 'section',
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                iconPath: new vscode.ThemeIcon('library'),
            },
        ];

        return items;
    }

    private getSectionItems(section: TreeItem): TreeItem[] {
        switch (section.id) {
            case 'quick-actions':
                return [
                    {
                        id: 'action-open-panel',
                        label: 'Open Visual Editor',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('layout'),
                        command: {
                            command: 'vsc-theme-generator.openPalette',
                            title: 'Open Visual Editor',
                        },
                        tooltip: 'Open the full visual palette editor',
                    },
                    {
                        id: 'action-generate-random',
                        label: 'Generate Random Palette',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('symbol-color'),
                        command: {
                            command: 'vsc-theme-generator.generateRandom',
                            title: 'Generate Random',
                        },
                        tooltip: 'Generate a random color palette',
                    },
                    {
                        id: 'action-import-theme',
                        label: 'Import Theme',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('file-add'),
                        command: {
                            command: 'vsc-theme-generator.importTheme',
                            title: 'Import Theme',
                        },
                        tooltip: 'Import theme from JSON file',
                    },
                ];

            case 'current-palette':
                if (!this.currentPalette) {
                    return [
                        {
                            id: 'no-current',
                            label: 'No palette generated yet',
                            type: 'action',
                            tooltip: 'Generate a palette to see it here',
                        },
                    ];
                }
                return [
                    {
                        id: 'current-info',
                        label: `${this.currentPalette.name} (${this.currentPalette.harmony})`,
                        type: 'palette',
                        palette: this.currentPalette,
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        contextValue: 'current-palette',
                        tooltip: `${this.currentPalette.colors.length} colors • ${this.currentPalette.harmony}`,
                    },
                    {
                        id: 'current-preview',
                        label: 'Preview Theme',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('eye'),
                        command: {
                            command: 'vsc-theme-generator.previewCurrent',
                            title: 'Preview Theme',
                        },
                        tooltip: 'Apply as VS Code theme preview',
                    },
                    {
                        id: 'current-save',
                        label: 'Save Palette',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('save'),
                        command: {
                            command: 'vsc-theme-generator.saveCurrent',
                            title: 'Save Palette',
                        },
                        tooltip: 'Save to palette collection',
                    },
                    {
                        id: 'current-export',
                        label: 'Export Theme',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('export'),
                        command: {
                            command: 'vsc-theme-generator.exportCurrent',
                            title: 'Export Theme',
                        },
                        tooltip: 'Save as .json theme file',
                    },
                    {
                        id: 'action-clear-preview',
                        label: 'Clear Preview',
                        type: 'action',
                        iconPath: new vscode.ThemeIcon('close'),
                        command: {
                            command: 'vsc-theme-generator.clearPreview',
                            title: 'Clear Preview',
                        },
                        tooltip: 'Remove applied theme preview',
                    },
                ];

            case 'saved-palettes':
                if (this.savedPalettes.length === 0) {
                    return [
                        {
                            id: 'no-saved',
                            label: 'No saved palettes',
                            type: 'action',
                            tooltip: 'Saved palettes will appear here',
                        },
                    ];
                }
                return this.savedPalettes.map(palette => ({
                    id: `saved-${palette.id}`,
                    label: palette.name,
                    type: 'palette',
                    palette,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    contextValue: 'saved-palette',
                    tooltip: `${palette.colors.length} colors • ${palette.harmony} • ${new Date(palette.createdAt).toLocaleDateString()}`,
                }));

            default:
                return [];
        }
    }

    private getPaletteColors(paletteItem: TreeItem): TreeItem[] {
        if (!paletteItem.palette) { return []; }
        
        return paletteItem.palette.colors.map((color, index) => ({
            id: `color-${paletteItem.palette!.id}-${index}`,
            label: color.name || `Color ${index + 1}`,
            type: 'color',
            colorHex: color.hex,
            command: {
                command: 'vsc-theme-generator.copyColor',
                title: 'Copy Color',
                arguments: [color.hex],
            },
            tooltip: `${color.hex} • Click to copy`,
        }));
    }

    setCurrentPalette(palette: Palette): void {
        this.currentPalette = palette;
        this.refresh();
    }

    getCurrentPalette(): Palette | undefined {
        return this.currentPalette;
    }
}

