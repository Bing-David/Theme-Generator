import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  Palette,
  HarmonyType,
  createColorInfo,
  createPaletteFromImport,
  detectThemeTypeFromBase,
  ensureContrastRatio,
  generatePalette,
  getContrastColor,
  getRoleColor,
  hexToHsl,
  normalizeHex,
} from "./colorGenerator";
import {
  EditableThemeItem,
  SEMANTIC_EDITABLE_ITEMS,
  TEXTMATE_EDITABLE_ITEMS,
  WORKBENCH_EDITABLE_ITEMS,
} from "./themeCatalog";

// Types

export interface TokenColorRule {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
}

export interface ThemeDefinition {
  name: string;
  type: "dark" | "light";
  colors: Record<string, string>;
  tokenColors: TokenColorRule[];
  semanticHighlighting: boolean;
  semanticTokenColors: Record<string, string>;
  _sourcePalette?: Palette;
}

export interface EditableThemeColorState {
  workbench: Record<string, string>;
  textMate: Record<string, string>;
  semantic: Record<string, string>;
}

// Preview

const PREVIEW_THEME_LABEL = "Theme Generator Preview";
const PREVIEW_THEME_FILE = "theme-generator-preview-color-theme.json";
const DEFAULT_DARK_THEME = "VS Code Dark";
const DEFAULT_LIGHT_THEME = "VS Code Light";

let previewExtensionPath: string | undefined;
let previousColorTheme: string | undefined;
let previousPreviewThemeType: ThemeDefinition["type"] = "dark";

export function initializeThemePreview(extensionPath: string): void {
  previewExtensionPath = extensionPath;
}

function getPreviewThemePath(): string {
  if (!previewExtensionPath) {
    throw new Error("Preview theme path not initialized");
  }
  return path.join(previewExtensionPath, "themes", PREVIEW_THEME_FILE);
}

// Helpers

function withAlpha(hex: string, alpha: string): string {
  return `${normalizeHex(hex)}${alpha}`;
}

function tone(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const next = { ...hsl, l: Math.max(2, Math.min(98, hsl.l + amount)) };
  return normalizeHex(
    `#${requireColorHex(next)}`,
  );
}

function saturate(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const next = { ...hsl, s: Math.max(4, Math.min(98, hsl.s + amount)) };
  return normalizeHex(
    `#${requireColorHex(next)}`,
  );
}

function requireColorHex(hsl: { h: number; s: number; l: number }): string {
  const hue = ((hsl.h % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(100, hsl.s)) / 100;
  const lightness = Math.max(0, Math.min(100, hsl.l)) / 100;

  if (saturation === 0) {
    const channel = Math.round(lightness * 255)
      .toString(16)
      .padStart(2, "0");
    return `${channel}${channel}${channel}`;
  }

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

function getWorkbenchBaseColors(palette: Palette): Record<string, string> {
  const roles = palette.derivedRoles;
  const type = detectThemeTypeFromBase(palette.baseColor.hex);
  const isDark = type === "dark";
  const accentText = getContrastColor(roles.accent, 4.5);
  const accentAltText = getContrastColor(roles.accentAlt, 4.5);

  return {
    foreground: roles.textPrimary,
    disabledForeground: roles.textMuted,
    focusBorder: roles.accent,
    errorForeground: roles.error,
    "icon.foreground": roles.textSecondary,

    "window.activeBorder": roles.accentMuted.slice(0, 7),
    "window.inactiveBorder": roles.surfaceAlt,

    "titleBar.activeBackground": roles.surfaceAlt,
    "titleBar.activeForeground": roles.textPrimary,
    "titleBar.inactiveBackground": roles.surface,
    "titleBar.inactiveForeground": roles.textSecondary,
    "titleBar.border": roles.surfaceElevated,

    "activityBar.background": roles.surfaceAlt,
    "activityBar.foreground": roles.textPrimary,
    "activityBar.inactiveForeground": roles.textMuted,
    "activityBar.border": roles.surfaceElevated,
    "activityBar.activeBorder": roles.accent,
    "activityBar.activeBackground": roles.surfaceAlt,
    "activityBarBadge.background": roles.accent,
    "activityBarBadge.foreground": accentText,

    "sideBar.background": roles.surface,
    "sideBar.foreground": roles.textSecondary,
    "sideBar.border": roles.surfaceElevated,
    "sideBarTitle.foreground": roles.textPrimary,
    "sideBarSectionHeader.background": roles.surfaceElevated,
    "sideBarSectionHeader.foreground": roles.textSecondary,
    "sideBarSectionHeader.border": roles.surfaceAlt,

    "statusBar.background": roles.accent,
    "statusBar.foreground": accentText,
    "statusBar.border": roles.surfaceAlt,
    "statusBar.debuggingBackground": roles.warning,
    "statusBar.debuggingForeground": getContrastColor(roles.warning, 4.5),
    "statusBar.noFolderBackground": roles.accentAlt,
    "statusBar.noFolderForeground": accentAltText,
    "statusBarItem.hoverBackground": withAlpha(roles.textPrimary, "18"),
    "statusBarItem.prominentBackground": withAlpha(roles.textPrimary, "14"),
    "statusBarItem.prominentForeground": accentText,

    "editorGroup.background": roles.base,
    "editorGroup.border": roles.surfaceAlt,
    "editorGroupHeader.tabsBackground": roles.surface,
    "editorGroupHeader.tabsBorder": roles.surfaceElevated,
    "tab.activeBackground": roles.base,
    "tab.activeForeground": roles.textPrimary,
    "tab.activeBorder": roles.accent,
    "tab.activeBorderTop": roles.accent,
    "tab.inactiveBackground": roles.surface,
    "tab.inactiveForeground": roles.textMuted,
    "tab.hoverBackground": roles.surfaceElevated,
    "tab.hoverForeground": roles.textPrimary,
    "tab.border": roles.surfaceAlt,
    "tab.unfocusedActiveForeground": roles.textSecondary,
    "tab.unfocusedInactiveForeground": roles.textMuted,

    "editor.background": roles.base,
    "editor.foreground": roles.textPrimary,
    "editor.lineHighlightBackground": roles.surfaceElevated,
    "editor.selectionBackground": withAlpha(roles.accent, "44"),
    "editor.selectionForeground": roles.textPrimary,
    "editor.inactiveSelectionBackground": withAlpha(roles.accentAlt, "2f"),
    "editor.wordHighlightBackground": withAlpha(roles.accentAlt, "22"),
    "editor.wordHighlightStrongBackground": withAlpha(roles.accent, "33"),
    "editor.findMatchBackground": withAlpha(roles.warning, "70"),
    "editor.findMatchHighlightBackground": withAlpha(roles.warning, "32"),
    "editor.hoverHighlightBackground": withAlpha(roles.accentAlt, "20"),
    "editor.rangeHighlightBackground": withAlpha(roles.surfaceElevated, "aa"),
    "editorCursor.foreground": roles.accent,
    "editorWhitespace.foreground": roles.textMuted,
    "editorIndentGuide.background1": withAlpha(roles.textMuted, "55"),
    "editorIndentGuide.activeBackground1": withAlpha(roles.textSecondary, "88"),
    "editorLineNumber.foreground": roles.textMuted,
    "editorLineNumber.activeForeground": roles.textPrimary,
    "editorRuler.foreground": withAlpha(roles.textMuted, "44"),
    "editorLink.activeForeground": roles.accent,

    "editorGutter.background": roles.base,
    "editorGutter.modifiedBackground": roles.diffModified,
    "editorGutter.addedBackground": roles.diffAdded,
    "editorGutter.deletedBackground": roles.diffDeleted,

    "editorOverviewRuler.border": roles.surfaceAlt,
    "editorBracketMatch.background": withAlpha(roles.accentAlt, "20"),
    "editorBracketMatch.border": roles.accent,
    "editorBracketHighlight.foreground1": roles.accent,
    "editorBracketHighlight.foreground2": roles.accentAlt,
    "editorBracketHighlight.foreground3": roles.warning,
    "editorBracketHighlight.foreground4": roles.info,
    "editorBracketHighlight.foreground5": roles.success,
    "editorBracketHighlight.foreground6": roles.error,
    "editorBracketHighlight.unexpectedBracket.foreground": roles.error,

    "list.activeSelectionBackground": withAlpha(roles.accent, "38"),
    "list.activeSelectionForeground": roles.textPrimary,
    "list.inactiveSelectionBackground": withAlpha(roles.accentAlt, "2a"),
    "list.inactiveSelectionForeground": roles.textSecondary,
    "list.hoverBackground": roles.surfaceElevated,
    "list.hoverForeground": roles.textPrimary,
    "list.focusBackground": withAlpha(roles.accent, "40"),
    "list.focusForeground": roles.textPrimary,
    "list.highlightForeground": roles.accent,
    "list.errorForeground": roles.error,
    "list.warningForeground": roles.warning,
    "tree.indentGuidesStroke": withAlpha(roles.textMuted, "66"),
    "tree.tableColumnsBorder": roles.surfaceAlt,
    "tree.tableOddRowsBackground": withAlpha(roles.surfaceElevated, "88"),

    "input.background": roles.surfaceElevated,
    "input.foreground": roles.textPrimary,
    "input.border": roles.surfaceAlt,
    "input.placeholderForeground": roles.textMuted,
    "inputOption.activeBackground": withAlpha(roles.accent, "22"),
    "inputOption.activeBorder": roles.accent,
    "inputOption.activeForeground": roles.textPrimary,
    "button.background": roles.accent,
    "button.foreground": accentText,
    "button.border": roles.surfaceAlt,
    "button.hoverBackground": saturate(tone(roles.accent, isDark ? 6 : -6), 6),
    "button.secondaryBackground": roles.surfaceAlt,
    "button.secondaryForeground": roles.textPrimary,
    "button.secondaryHoverBackground": roles.surfaceElevated,
    "dropdown.background": roles.surfaceElevated,
    "dropdown.foreground": roles.textPrimary,
    "dropdown.border": roles.surfaceAlt,
    "dropdown.listBackground": roles.surface,
    "checkbox.background": roles.surfaceElevated,
    "checkbox.foreground": roles.textPrimary,
    "checkbox.border": roles.surfaceAlt,
    "radio.activeBackground": withAlpha(roles.accent, "22"),
    "radio.activeForeground": roles.textPrimary,
    "radio.activeBorder": roles.accent,
    "radio.inactiveForeground": roles.textMuted,

    "quickInput.background": roles.surface,
    "quickInput.foreground": roles.textPrimary,
    "quickInputList.focusBackground": withAlpha(roles.accent, "30"),
    "quickInputList.focusForeground": roles.textPrimary,
    "quickInputTitle.background": roles.surfaceElevated,
    "pickerGroup.border": roles.surfaceAlt,
    "pickerGroup.foreground": roles.accentAlt,

    "commandCenter.background": roles.surfaceElevated,
    "commandCenter.foreground": roles.textPrimary,
    "commandCenter.border": roles.surfaceAlt,
    "commandCenter.activeBackground": roles.surfaceAlt,

    "panel.background": roles.base,
    "panel.border": roles.surfaceAlt,
    "panelTitle.activeBorder": roles.accent,
    "panelTitle.activeForeground": roles.textPrimary,
    "panelTitle.inactiveForeground": roles.textMuted,
    "panelInput.border": roles.surfaceAlt,

    "terminal.background": roles.base,
    "terminal.foreground": roles.textPrimary,
    "terminalCursor.foreground": roles.accent,
    "terminal.selectionBackground": withAlpha(roles.accent, "44"),
    "terminal.border": roles.surfaceAlt,
    "terminal.ansiBlack": roles.terminalAnsi[0],
    "terminal.ansiRed": roles.terminalAnsi[1],
    "terminal.ansiGreen": roles.terminalAnsi[2],
    "terminal.ansiYellow": roles.terminalAnsi[3],
    "terminal.ansiBlue": roles.terminalAnsi[4],
    "terminal.ansiMagenta": roles.terminalAnsi[5],
    "terminal.ansiCyan": roles.terminalAnsi[6],
    "terminal.ansiWhite": roles.terminalAnsi[7],
    "terminal.ansiBrightBlack": roles.terminalAnsi[8],
    "terminal.ansiBrightRed": roles.terminalAnsi[9],
    "terminal.ansiBrightGreen": roles.terminalAnsi[10],
    "terminal.ansiBrightYellow": roles.terminalAnsi[11],
    "terminal.ansiBrightBlue": roles.terminalAnsi[12],
    "terminal.ansiBrightMagenta": roles.terminalAnsi[13],
    "terminal.ansiBrightCyan": roles.terminalAnsi[14],
    "terminal.ansiBrightWhite": roles.terminalAnsi[15],

    "notifications.background": roles.surface,
    "notifications.foreground": roles.textPrimary,
    "notifications.border": roles.surfaceAlt,
    "notificationCenterHeader.background": roles.surfaceAlt,
    "notificationCenterHeader.foreground": roles.textPrimary,
    "notificationLink.foreground": roles.accent,

    "menu.background": roles.surface,
    "menu.foreground": roles.textPrimary,
    "menu.selectionBackground": withAlpha(roles.accent, "38"),
    "menu.selectionForeground": roles.textPrimary,
    "menu.separatorBackground": roles.surfaceAlt,

    "scrollbar.shadow": withAlpha("#000000", isDark ? "88" : "33"),
    "scrollbarSlider.background": withAlpha(roles.textMuted, "45"),
    "scrollbarSlider.hoverBackground": withAlpha(roles.textSecondary, "55"),
    "scrollbarSlider.activeBackground": withAlpha(roles.textPrimary, "66"),

    "breadcrumb.foreground": roles.textSecondary,
    "breadcrumb.focusForeground": roles.textPrimary,
    "breadcrumb.activeSelectionForeground": roles.accent,
    "breadcrumbPicker.background": roles.surface,

    "editorWidget.background": roles.surface,
    "editorWidget.foreground": roles.textPrimary,
    "editorWidget.border": roles.surfaceAlt,
    "editorSuggestWidget.background": roles.surface,
    "editorSuggestWidget.foreground": roles.textPrimary,
    "editorSuggestWidget.selectedBackground": withAlpha(roles.accent, "30"),
    "editorSuggestWidget.highlightForeground": roles.accent,
    "editorHoverWidget.background": roles.surface,
    "editorHoverWidget.foreground": roles.textPrimary,
    "editorHoverWidget.border": roles.surfaceAlt,

    "peekView.border": roles.accent,
    "peekViewEditor.background": roles.base,
    "peekViewResult.background": roles.surface,
    "peekViewResult.selectionBackground": withAlpha(roles.accent, "30"),
    "peekViewTitle.background": roles.surfaceAlt,
    "peekViewTitleLabel.foreground": roles.textPrimary,

    "diffEditor.insertedTextBackground": withAlpha(roles.diffAdded, "33"),
    "diffEditor.removedTextBackground": withAlpha(roles.diffDeleted, "33"),
    "diffEditor.border": roles.surfaceAlt,

    "merge.currentHeaderBackground": withAlpha(roles.diffAdded, "44"),
    "merge.currentContentBackground": withAlpha(roles.diffAdded, "24"),
    "merge.incomingHeaderBackground": withAlpha(roles.info, "44"),
    "merge.incomingContentBackground": withAlpha(roles.info, "24"),

    "gitDecoration.addedResourceForeground": roles.diffAdded,
    "gitDecoration.modifiedResourceForeground": roles.diffModified,
    "gitDecoration.deletedResourceForeground": roles.diffDeleted,
    "gitDecoration.untrackedResourceForeground": roles.diffAdded,
    "gitDecoration.ignoredResourceForeground": roles.textMuted,
    "gitDecoration.conflictingResourceForeground": roles.warning,

    "symbolIcon.arrayForeground": roles.info,
    "symbolIcon.booleanForeground": roles.info,
    "symbolIcon.classForeground": roles.accentAlt,
    "symbolIcon.colorForeground": roles.info,
    "symbolIcon.constantForeground": roles.warning,
    "symbolIcon.constructorForeground": roles.accent,
    "symbolIcon.enumeratorForeground": roles.warning,
    "symbolIcon.enumeratorMemberForeground": roles.warning,
    "symbolIcon.eventForeground": roles.info,
    "symbolIcon.fieldForeground": roles.textSecondary,
    "symbolIcon.fileForeground": roles.textSecondary,
    "symbolIcon.folderForeground": roles.textSecondary,
    "symbolIcon.functionForeground": roles.accent,
    "symbolIcon.interfaceForeground": roles.accentAlt,
    "symbolIcon.keyForeground": roles.info,
    "symbolIcon.keywordForeground": roles.accent,
    "symbolIcon.methodForeground": roles.accent,
    "symbolIcon.moduleForeground": roles.info,
    "symbolIcon.namespaceForeground": roles.info,
    "symbolIcon.nullForeground": roles.warning,
    "symbolIcon.numberForeground": roles.warning,
    "symbolIcon.objectForeground": roles.textSecondary,
    "symbolIcon.operatorForeground": roles.accent,
    "symbolIcon.packageForeground": roles.info,
    "symbolIcon.propertyForeground": roles.textSecondary,
    "symbolIcon.referenceForeground": roles.info,
    "symbolIcon.snippetForeground": roles.textPrimary,
    "symbolIcon.stringForeground": roles.success,
    "symbolIcon.structForeground": roles.accentAlt,
    "symbolIcon.textForeground": roles.textPrimary,
    "symbolIcon.typeParameterForeground": roles.info,
    "symbolIcon.unitForeground": roles.warning,
    "symbolIcon.variableForeground": roles.textSecondary,

    "settings.headerForeground": roles.textPrimary,
    "settings.modifiedItemIndicator": roles.accent,
    "settings.dropdownBackground": roles.surfaceElevated,
    "settings.dropdownForeground": roles.textPrimary,
    "settings.dropdownBorder": roles.surfaceAlt,
    "settings.dropdownListBorder": roles.surfaceAlt,
    "settings.textInputBackground": roles.surfaceElevated,
    "settings.textInputForeground": roles.textPrimary,
    "settings.textInputBorder": roles.surfaceAlt,
    "settings.numberInputBackground": roles.surfaceElevated,
    "settings.numberInputForeground": roles.textPrimary,
    "settings.numberInputBorder": roles.surfaceAlt,
    "settings.checkboxBackground": roles.surfaceElevated,
    "settings.checkboxForeground": roles.textPrimary,
    "settings.checkboxBorder": roles.surfaceAlt,

    "welcomePage.background": roles.base,
    "welcomePage.buttonBackground": roles.surfaceAlt,
    "welcomePage.buttonHoverBackground": roles.surfaceElevated,
    "walkThrough.embeddedEditorBackground": roles.surface,

    "badge.background": roles.accent,
    "badge.foreground": accentText,
    "progressBar.background": roles.accent,

    "editorError.foreground": roles.error,
    "editorError.border": withAlpha(roles.error, "00"),
    "editorWarning.foreground": roles.warning,
    "editorWarning.border": withAlpha(roles.warning, "00"),
    "editorInfo.foreground": roles.info,
    "editorInfo.border": withAlpha(roles.info, "00"),
    "editorHint.foreground": roles.textMuted,
    "inputValidation.errorBackground": withAlpha(roles.error, "18"),
    "inputValidation.errorBorder": roles.error,
    "inputValidation.warningBackground": withAlpha(roles.warning, "18"),
    "inputValidation.warningBorder": roles.warning,
    "inputValidation.infoBackground": withAlpha(roles.info, "18"),
    "inputValidation.infoBorder": roles.info,
  };
}

function getTextMateRules(palette: Palette): TokenColorRule[] {
  const roles = palette.derivedRoles;
  return TEXTMATE_EDITABLE_ITEMS.map((item) => ({
    name: item.id,
    scope: item.scopes ?? item.id,
    settings: {
      foreground:
        palette.themeOverrides.textMate[item.id] ??
        ensureContrastRatio(getRoleColor(roles, item.defaultRole), roles.base, 3),
      fontStyle: item.id === "comment" || item.id === "parameter" || item.id === "decorator"
        ? "italic"
        : undefined,
    },
  }));
}

function getSemanticTokenColors(palette: Palette): Record<string, string> {
  const roles = palette.derivedRoles;
  const colors: Record<string, string> = {};

  for (const item of SEMANTIC_EDITABLE_ITEMS) {
    colors[item.semanticSelector ?? item.id] =
      palette.themeOverrides.semantic[item.id] ??
      ensureContrastRatio(getRoleColor(roles, item.defaultRole), roles.base, 3);
  }

  return colors;
}

function applyWorkbenchOverrides(
  colors: Record<string, string>,
  palette: Palette,
): Record<string, string> {
  return {
    ...colors,
    ...palette.themeOverrides.workbench,
  };
}

// Public API

export function mapPaletteToTheme(
  palette: Palette,
  themeName?: string,
): ThemeDefinition {
  const colors = applyWorkbenchOverrides(getWorkbenchBaseColors(palette), palette);
  const tokenColors = getTextMateRules(palette);
  const semanticTokenColors = getSemanticTokenColors(palette);

  return {
    name: themeName ?? `${palette.name} Theme`,
    type: detectThemeTypeFromBase(palette.baseColor.hex),
    colors,
    tokenColors,
    semanticHighlighting: true,
    semanticTokenColors,
    _sourcePalette: palette,
  };
}

export function getEditableThemeColorState(
  theme: ThemeDefinition,
): EditableThemeColorState {
  const textMate: Record<string, string> = {};
  const semantic: Record<string, string> = {};

  for (const item of TEXTMATE_EDITABLE_ITEMS) {
    const token = theme.tokenColors.find((rule) => rule.name === item.id);
    textMate[item.id] = token?.settings.foreground ?? "#000000";
  }

  for (const item of SEMANTIC_EDITABLE_ITEMS) {
    semantic[item.id] = theme.semanticTokenColors[item.semanticSelector ?? item.id] ?? "#000000";
  }

  return {
    workbench: WORKBENCH_EDITABLE_ITEMS.reduce<Record<string, string>>((accumulator, item) => {
      accumulator[item.id] = theme.colors[item.id] ?? "#000000";
      return accumulator;
    }, {}),
    textMate,
    semantic,
  };
}

export async function exportThemeToFile(
  theme: ThemeDefinition,
): Promise<string | undefined> {
  const defaultName = theme.name
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(
      path.join(
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd(),
        `${defaultName}-color-theme.json`,
      ),
    ),
    filters: { "VS Code Theme": ["json"] },
    title: "Export Theme File",
  });

  if (!uri) {
    return undefined;
  }

  const themeJson = {
    name: theme.name,
    type: theme.type,
    colors: theme.colors,
    tokenColors: theme.tokenColors,
    semanticHighlighting: theme.semanticHighlighting,
    semanticTokenColors: theme.semanticTokenColors,
    _palette: theme._sourcePalette,
  };

  fs.writeFileSync(uri.fsPath, JSON.stringify(themeJson, null, 2), "utf8");
  vscode.window.showInformationMessage(`Theme exported: ${uri.fsPath}`);
  return uri.fsPath;
}

export async function applyThemePreview(theme: ThemeDefinition): Promise<void> {
  const previewPath = getPreviewThemePath();
  fs.mkdirSync(path.dirname(previewPath), { recursive: true });
  fs.writeFileSync(
    previewPath,
    JSON.stringify(
      {
        name: PREVIEW_THEME_LABEL,
        type: theme.type,
        colors: theme.colors,
        tokenColors: theme.tokenColors,
        semanticHighlighting: theme.semanticHighlighting,
        semanticTokenColors: theme.semanticTokenColors,
      },
      null,
      2,
    ),
    "utf8",
  );

  const configuration = vscode.workspace.getConfiguration();
  const activeTheme = configuration.get<string>("workbench.colorTheme");
  if (!previousColorTheme && activeTheme !== PREVIEW_THEME_LABEL) {
    previousColorTheme = activeTheme;
  }
  previousPreviewThemeType = theme.type;
  await configuration.update(
    "workbench.colorTheme",
    PREVIEW_THEME_LABEL,
    vscode.ConfigurationTarget.Global,
  );
}

export async function clearThemePreview(): Promise<void> {
  const configuration = vscode.workspace.getConfiguration();
  const fallbackTheme =
    previousPreviewThemeType === "light" ? DEFAULT_LIGHT_THEME : DEFAULT_DARK_THEME;
  const nextTheme =
    previousColorTheme && previousColorTheme !== PREVIEW_THEME_LABEL
      ? previousColorTheme
      : fallbackTheme;
  await configuration.update(
    "workbench.colorTheme",
    nextTheme,
    vscode.ConfigurationTarget.Global,
  );
  previousColorTheme = undefined;
}

export async function importThemeFromFile(): Promise<Palette | undefined> {
  const selection = await vscode.window.showOpenDialog({
    filters: { "VS Code Theme": ["json"] },
    title: "Import Theme File",
    canSelectMany: false,
    openLabel: "Import",
  });

  if (!selection?.length) {
    return undefined;
  }

  try {
    const filePath = selection[0].fsPath;
    const raw = fs.readFileSync(filePath, "utf8");
    const themeData = JSON.parse(raw);
    const palette = convertThemeToPalette(themeData, filePath);
    return {
      ...palette,
      filePath,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(`Failed to import theme: ${message}`);
    return undefined;
  }
}

export function convertThemeToPalette(themeData: any, filePath?: string): Palette {
  if (themeData?._palette) {
    return {
      ...themeData._palette,
      id: themeData._palette.id ?? `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: "imported",
      filePath,
    } satisfies Palette;
  }

  const name = themeData?.name || "Imported Theme";
  const colors = typeof themeData?.colors === "object" && themeData.colors ? themeData.colors : {};
  const tokenColors = Array.isArray(themeData?.tokenColors) ? themeData.tokenColors : [];
  const semanticTokenColors =
    typeof themeData?.semanticTokenColors === "object" && themeData.semanticTokenColors
      ? themeData.semanticTokenColors
      : {};

  const extracted = extractImportedSeedColors(colors);
  const harmony = detectHarmonyType(extracted);
  const baseColor = createColorInfo(
    extracted[getImportedPrimaryIndex(extracted.length)] ?? extracted[0] ?? "#4a90d9",
    "Base",
  );
  const regenerated = generatePalette(
    baseColor.hex,
    harmony,
    name,
    undefined,
    "imported",
    true,
  );
  const themeOverrides = {
    workbench: collectWorkbenchOverrides(colors, regenerated),
    textMate: collectTextMateOverrides(tokenColors, regenerated),
    semantic: collectSemanticOverrides(semanticTokenColors, regenerated),
  };

  return {
    ...regenerated,
    id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    filePath,
    themeOverrides,
  };
}

function extractImportedSeedColors(colors: Record<string, string>): string[] {
  const keys = [
    "editor.background",
    "activityBar.background",
    "statusBar.background",
    "button.background",
    "focusBorder",
    "terminal.ansiBlue",
    "terminal.ansiGreen",
    "terminal.ansiMagenta",
    "terminal.ansiYellow",
    "editor.selectionBackground",
  ];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const key of keys) {
    const color = colors[key];
    if (typeof color !== "string") {
      continue;
    }
    const normalized = normalizeHex(color);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  if (result.length === 0) {
    result.push("#4a90d9");
  }

  return result.slice(0, 5);
}

function getImportedPrimaryIndex(length: number): number {
  return length <= 2 ? 0 : Math.floor(length / 2);
}

function detectHarmonyType(colors: string[]): HarmonyType {
  if (colors.length <= 1) {
    return "monochromatic";
  }

  const hues = colors.map((color) => hexToHsl(color).h);
  const differences = hues.slice(1).map((hue) => {
    const raw = Math.abs(hue - hues[0]);
    return raw > 180 ? 360 - raw : raw;
  });

  if (differences.every((value) => value < 22)) {
    return "monochromatic";
  }
  if (differences.some((value) => Math.abs(value - 180) < 22) && colors.length <= 2) {
    return "complementary";
  }
  if (differences.some((value) => Math.abs(value - 120) < 22)) {
    return "triadic";
  }
  if (colors.length >= 4 && differences.some((value) => Math.abs(value - 90) < 18)) {
    return "tetradic";
  }
  if (differences.every((value) => value < 52)) {
    return "analogous";
  }
  return "split-complementary";
}

function collectWorkbenchOverrides(
  importedColors: Record<string, string>,
  regenerated: Palette,
): Record<string, string> {
  const generated = mapPaletteToTheme({ ...regenerated, themeOverrides: { workbench: {}, textMate: {}, semantic: {} } }).colors;
  return WORKBENCH_EDITABLE_ITEMS.reduce<Record<string, string>>((accumulator, item) => {
    const imported = importedColors[item.id];
    if (typeof imported === "string" && normalizeHex(imported) !== normalizeHex(generated[item.id] ?? imported)) {
      accumulator[item.id] = normalizeHex(imported);
    }
    return accumulator;
  }, {});
}

function collectTextMateOverrides(
  importedTokenColors: any[],
  regenerated: Palette,
): Record<string, string> {
  const generatedRules = mapPaletteToTheme({ ...regenerated, themeOverrides: { workbench: {}, textMate: {}, semantic: {} } }).tokenColors;
  return TEXTMATE_EDITABLE_ITEMS.reduce<Record<string, string>>((accumulator, item) => {
    const imported = findTokenColor(importedTokenColors, item);
    const generated = generatedRules.find((rule) => rule.name === item.id)?.settings.foreground;
    if (imported && generated && normalizeHex(imported) !== normalizeHex(generated)) {
      accumulator[item.id] = normalizeHex(imported);
    }
    return accumulator;
  }, {});
}

function findTokenColor(importedTokenColors: any[], item: EditableThemeItem): string | undefined {
  for (const rule of importedTokenColors) {
    const scopes = Array.isArray(rule?.scope) ? rule.scope : [rule?.scope];
    if (!scopes.length) {
      continue;
    }
    if (scopes.some((scope: string) => item.scopes?.includes(scope))) {
      if (typeof rule?.settings?.foreground === "string") {
        return normalizeHex(rule.settings.foreground);
      }
    }
  }
  return undefined;
}

function collectSemanticOverrides(
  importedSemanticTokenColors: Record<string, string>,
  regenerated: Palette,
): Record<string, string> {
  const generated = mapPaletteToTheme({ ...regenerated, themeOverrides: { workbench: {}, textMate: {}, semantic: {} } }).semanticTokenColors;
  return SEMANTIC_EDITABLE_ITEMS.reduce<Record<string, string>>((accumulator, item) => {
    const selector = item.semanticSelector ?? item.id;
    const imported = importedSemanticTokenColors[selector];
    const current = generated[selector];
    if (typeof imported === "string" && current && normalizeHex(imported) !== normalizeHex(current)) {
      accumulator[item.id] = normalizeHex(imported);
    }
    return accumulator;
  }, {});
}
