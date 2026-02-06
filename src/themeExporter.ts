import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  Palette,
  HarmonyType,
  getContrastColor,
  hexToHsl,
  hslToHex,
  hexToRgb,
  rgbToHsl,
  ensureContrastRatio,
} from "./colorGenerator";

// ── Types ──────────────────────────────────────────────────────────────────

export type ThemeType = "dark" | "light";

export interface ThemeDefinition {
  name: string;
  type: ThemeType;
  colors: Record<string, string>;
  tokenColors: TokenColor[];
}

export interface TokenColor {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function detectThemeType(palette: Palette): ThemeType {
  const baseL = hexToHsl(palette.baseColor.hex).l;
  return baseL < 50 ? "dark" : "light";
}

function adjustBrightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const newL = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex({ ...hsl, l: newL });
}

function adjustSaturation(hex: string, multiplier: number): string {
  const hsl = hexToHsl(hex);
  const newS = Math.max(0, Math.min(100, hsl.s * multiplier));
  return hslToHex({ ...hsl, s: newS });
}

// ── Mapper: Palette → VS Code Theme ────────────────────────────────────────

export function mapPaletteToTheme(
  palette: Palette,
  themeName?: string,
  syntaxSaturation: number = 1.0,
): ThemeDefinition {
  const colors = palette.colors.map((c) => c.hex);
  const type = detectThemeType(palette);

  // Pick colors from palette (pad with base if fewer)
  const pick = (i: number) => colors[i % colors.length];
  const base = pick(0);
  const accent = pick(1);
  const secondary = pick(2) ?? accent;
  const tertiary = pick(3) ?? secondary;

  const bg =
    type === "dark" ? adjustBrightness(base, -20) : adjustBrightness(base, 20);
  const editorBg =
    type === "dark" ? adjustBrightness(base, -25) : adjustBrightness(base, 25);
  const sidebarBg =
    type === "dark" ? adjustBrightness(base, -30) : adjustBrightness(base, 30);
  const activityBarBg =
    type === "dark" ? adjustBrightness(base, -35) : adjustBrightness(base, 35);

  // Garantizar contraste WCAG AA (4.5:1) para texto normal
  const fg = getContrastColor(editorBg, 4.5);
  const sidebarFg = getContrastColor(sidebarBg, 4.5);
  const activityBarFg = getContrastColor(activityBarBg, 4.5);

  // Ajustar colores de acento con contraste garantizado
  const accentContrast = ensureContrastRatio(accent, editorBg, 3.0);
  const secondaryContrast = ensureContrastRatio(secondary, editorBg, 4.5);
  const tertiaryContrast = ensureContrastRatio(tertiary, editorBg, 4.5);

  // Aplicar saturación adicional a colores de sintaxis
  const accentSyntax = ensureContrastRatio(
    adjustSaturation(accent, syntaxSaturation),
    editorBg,
    3.0,
  );
  const secondarySyntax = ensureContrastRatio(
    adjustSaturation(secondary, syntaxSaturation),
    editorBg,
    4.5,
  );
  const tertiarySyntax = ensureContrastRatio(
    adjustSaturation(tertiary, syntaxSaturation),
    editorBg,
    4.5,
  );

  const workbenchColors: Record<string, string> = {
    // Editor
    "editor.background": editorBg,
    "editor.foreground": fg,
    "editor.lineHighlightBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 5 : -5,
    ),
    "editor.selectionBackground": accentContrast + "44",
    "editor.wordHighlightBackground": accentContrast + "22",
    "editorCursor.foreground": accentContrast,
    "editorWhitespace.foreground": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "editorLineNumber.foreground": adjustBrightness(
      fg,
      type === "dark" ? -30 : 30,
    ),
    "editorLineNumber.activeForeground": fg,

    // Sidebar
    "sideBar.background": sidebarBg,
    "sideBar.foreground": sidebarFg,
    "sideBarTitle.foreground": ensureContrastRatio(accent, sidebarBg, 4.5),

    // Activity Bar
    "activityBar.background": activityBarBg,
    "activityBar.foreground": activityBarFg,
    "activityBar.activeBorder": accentContrast,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": getContrastColor(accent, 4.5),

    // Title Bar
    "titleBar.activeBackground": activityBarBg,
    "titleBar.activeForeground": activityBarFg,
    "titleBar.inactiveBackground": adjustBrightness(
      activityBarBg,
      type === "dark" ? -5 : 5,
    ),
    "titleBar.inactiveForeground": activityBarFg + "99",

    // Status Bar
    "statusBar.background": accent,
    "statusBar.foreground": getContrastColor(accent, 4.5),
    "statusBar.debuggingBackground": secondary,
    "statusBar.debuggingForeground": getContrastColor(secondary, 4.5),
    "statusBar.noFolderBackground": adjustBrightness(base, -10),
    "statusBar.noFolderForeground": getContrastColor(
      adjustBrightness(base, -10),
      4.5,
    ),

    // Tabs
    "tab.activeBackground": editorBg,
    "tab.activeForeground": fg,
    "tab.inactiveBackground": sidebarBg,
    "tab.inactiveForeground": sidebarFg + "88",
    "tab.activeBorder": accentContrast,

    // Terminal
    "terminal.background": editorBg,
    "terminal.foreground": fg,
    "terminalCursor.foreground": accentContrast,

    // Input
    "input.background": adjustBrightness(editorBg, type === "dark" ? 5 : -5),
    "input.foreground": fg,
    "input.border": accentContrast + "66",
    focusBorder: accentContrast,

    // Button
    "button.background": accent,
    "button.foreground": getContrastColor(accent, 4.5),
    "button.hoverBackground": adjustBrightness(
      accent,
      type === "dark" ? 10 : -10,
    ),

    // Lists
    "list.activeSelectionBackground": accentContrast + "44",
    "list.activeSelectionForeground": fg,
    "list.hoverBackground": adjustBrightness(
      sidebarBg,
      type === "dark" ? 5 : -5,
    ),
    "list.hoverForeground": sidebarFg,
    "list.inactiveSelectionBackground": accentContrast + "22",
    "list.inactiveSelectionForeground": fg,
    "list.focusBackground": accentContrast + "33",
    "list.focusForeground": fg,

    // Dropdown
    "dropdown.background": adjustBrightness(editorBg, type === "dark" ? 8 : -8),
    "dropdown.foreground": fg,
    "dropdown.border": accentContrast + "66",
    "dropdown.listBackground": adjustBrightness(
      sidebarBg,
      type === "dark" ? 5 : -5,
    ),

    // Checkbox
    "checkbox.background": adjustBrightness(editorBg, type === "dark" ? 8 : -8),
    "checkbox.foreground": fg,
    "checkbox.border": accentContrast + "66",

    // Input Validation
    "inputValidation.errorBackground": type === "dark" ? "#5a1d1d" : "#f2dede",
    "inputValidation.errorBorder": "#be1100",
    "inputValidation.warningBackground":
      type === "dark" ? "#5b5418" : "#f6f5d2",
    "inputValidation.warningBorder": "#b89500",
    "inputValidation.infoBackground": type === "dark" ? "#1e3a5f" : "#d6ecf2",
    "inputValidation.infoBorder": "#4ba3ce",

    // Panel (Terminal, Output, Problems, Debug Console)
    "panel.background": editorBg,
    "panel.border": adjustBrightness(editorBg, type === "dark" ? 10 : -10),
    "panelTitle.activeBorder": accentContrast,
    "panelTitle.activeForeground": fg,
    "panelTitle.inactiveForeground": adjustBrightness(
      fg,
      type === "dark" ? -30 : 30,
    ),

    // Terminal ANSI Colors
    "terminal.ansiBlack": type === "dark" ? "#000000" : "#000000",
    "terminal.ansiRed": ensureContrastRatio("#cd3131", editorBg, 3.0),
    "terminal.ansiGreen": ensureContrastRatio("#0dbc79", editorBg, 3.0),
    "terminal.ansiYellow": ensureContrastRatio("#e5e510", editorBg, 3.0),
    "terminal.ansiBlue": ensureContrastRatio("#2472c8", editorBg, 3.0),
    "terminal.ansiMagenta": ensureContrastRatio("#bc3fbc", editorBg, 3.0),
    "terminal.ansiCyan": ensureContrastRatio("#11a8cd", editorBg, 3.0),
    "terminal.ansiWhite": type === "dark" ? "#e5e5e5" : "#555555",
    "terminal.ansiBrightBlack": type === "dark" ? "#666666" : "#666666",
    "terminal.ansiBrightRed": ensureContrastRatio("#f14c4c", editorBg, 3.0),
    "terminal.ansiBrightGreen": ensureContrastRatio("#23d18b", editorBg, 3.0),
    "terminal.ansiBrightYellow": ensureContrastRatio("#f5f543", editorBg, 3.0),
    "terminal.ansiBrightBlue": ensureContrastRatio("#3b8eea", editorBg, 3.0),
    "terminal.ansiBrightMagenta": ensureContrastRatio("#d670d6", editorBg, 3.0),
    "terminal.ansiBrightCyan": ensureContrastRatio("#29b8db", editorBg, 3.0),
    "terminal.ansiBrightWhite": type === "dark" ? "#e5e5e5" : "#a5a5a5",
    "terminal.selectionBackground": accentContrast + "44",

    // Badge
    "badge.background": accent,
    "badge.foreground": getContrastColor(accent, 4.5),

    // Scrollbar
    "scrollbar.shadow": type === "dark" ? "#00000088" : "#00000044",
    "scrollbarSlider.background":
      adjustBrightness(editorBg, type === "dark" ? 20 : -20) + "44",
    "scrollbarSlider.hoverBackground":
      adjustBrightness(editorBg, type === "dark" ? 25 : -25) + "66",
    "scrollbarSlider.activeBackground":
      adjustBrightness(editorBg, type === "dark" ? 30 : -30) + "88",

    // Breadcrumbs
    "breadcrumb.foreground": adjustBrightness(fg, type === "dark" ? -20 : 20),
    "breadcrumb.focusForeground": fg,
    "breadcrumb.activeSelectionForeground": accentContrast,
    "breadcrumbPicker.background": sidebarBg,

    // Editor Widget
    "editorWidget.background": sidebarBg,
    "editorWidget.foreground": sidebarFg,
    "editorWidget.border": accentContrast + "66",
    "editorSuggestWidget.background": sidebarBg,
    "editorSuggestWidget.foreground": sidebarFg,
    "editorSuggestWidget.selectedBackground": accentContrast + "44",
    "editorSuggestWidget.highlightForeground": accentContrast,
    "editorHoverWidget.background": sidebarBg,
    "editorHoverWidget.foreground": sidebarFg,
    "editorHoverWidget.border": accentContrast + "44",

    // Peek View
    "peekView.border": accentContrast,
    "peekViewEditor.background": adjustBrightness(
      editorBg,
      type === "dark" ? -5 : 5,
    ),
    "peekViewResult.background": sidebarBg,
    "peekViewResult.selectionBackground": accentContrast + "44",
    "peekViewTitle.background": activityBarBg,
    "peekViewTitleLabel.foreground": activityBarFg,

    // Notifications
    "notificationCenter.border": accentContrast + "66",
    "notificationCenterHeader.background": activityBarBg,
    "notificationCenterHeader.foreground": activityBarFg,
    "notifications.background": sidebarBg,
    "notifications.foreground": sidebarFg,
    "notifications.border": accentContrast + "66",
    "notificationLink.foreground": accentContrast,

    // Menu
    "menu.background": sidebarBg,
    "menu.foreground": sidebarFg,
    "menu.selectionBackground": accentContrast + "44",
    "menu.selectionForeground": fg,
    "menu.separatorBackground": adjustBrightness(
      sidebarBg,
      type === "dark" ? 10 : -10,
    ),

    // Settings Editor
    "settings.headerForeground": fg,
    "settings.modifiedItemIndicator": accentContrast,
    "settings.dropdownBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 8 : -8,
    ),
    "settings.dropdownForeground": fg,
    "settings.dropdownBorder": accentContrast + "66",
    "settings.dropdownListBorder": accentContrast + "66",
    "settings.checkboxBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 8 : -8,
    ),
    "settings.checkboxForeground": fg,
    "settings.checkboxBorder": accentContrast + "66",
    "settings.textInputBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 5 : -5,
    ),
    "settings.textInputForeground": fg,
    "settings.textInputBorder": accentContrast + "66",
    "settings.numberInputBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 5 : -5,
    ),
    "settings.numberInputForeground": fg,
    "settings.numberInputBorder": accentContrast + "66",

    // Git Decorations
    "gitDecoration.addedResourceForeground": ensureContrastRatio(
      "#81b88b",
      sidebarBg,
      3.0,
    ),
    "gitDecoration.modifiedResourceForeground": ensureContrastRatio(
      "#e2c08d",
      sidebarBg,
      3.0,
    ),
    "gitDecoration.deletedResourceForeground": ensureContrastRatio(
      "#c74e39",
      sidebarBg,
      3.0,
    ),
    "gitDecoration.untrackedResourceForeground": ensureContrastRatio(
      "#73c991",
      sidebarBg,
      3.0,
    ),
    "gitDecoration.ignoredResourceForeground": adjustBrightness(
      sidebarFg,
      type === "dark" ? -30 : 30,
    ),
    "gitDecoration.conflictingResourceForeground": ensureContrastRatio(
      "#e4676b",
      sidebarBg,
      3.0,
    ),

    // Diff Editor
    "diffEditor.insertedTextBackground":
      type === "dark" ? "#9bb95533" : "#9bb95544",
    "diffEditor.removedTextBackground":
      type === "dark" ? "#ff000033" : "#ff000044",
    "diffEditor.border": adjustBrightness(editorBg, type === "dark" ? 10 : -10),

    // Merge Conflicts
    "merge.currentHeaderBackground": type === "dark" ? "#367366" : "#c2e0c6",
    "merge.currentContentBackground":
      type === "dark" ? "#36736633" : "#c2e0c666",
    "merge.incomingHeaderBackground": type === "dark" ? "#395f8f" : "#b3d7f9",
    "merge.incomingContentBackground":
      type === "dark" ? "#395f8f33" : "#b3d7f966",

    // Progress Bar
    "progressBar.background": accentContrast,

    // Editor Gutter
    "editorGutter.background": editorBg,
    "editorGutter.modifiedBackground": ensureContrastRatio(
      "#e2c08d",
      editorBg,
      3.0,
    ),
    "editorGutter.addedBackground": ensureContrastRatio(
      "#81b88b",
      editorBg,
      3.0,
    ),
    "editorGutter.deletedBackground": ensureContrastRatio(
      "#c74e39",
      editorBg,
      3.0,
    ),

    // Quick Input (Command Palette)
    "quickInput.background": sidebarBg,
    "quickInput.foreground": sidebarFg,
    "quickInputList.focusBackground": accentContrast + "44",
    "quickInputList.focusForeground": fg,

    // Extension Badge
    "extensionBadge.remoteBackground": accent,
    "extensionBadge.remoteForeground": getContrastColor(accent, 4.5),

    // Debug
    "debugToolBar.background": activityBarBg,
    "debugToolBar.border": accentContrast + "44",

    // Tree View (Listas de acordeón)
    "sideBarSectionHeader.background": adjustBrightness(
      sidebarBg,
      type === "dark" ? 8 : -8,
    ),
    "sideBarSectionHeader.foreground": sidebarFg,
    "sideBarSectionHeader.border": adjustBrightness(
      sidebarBg,
      type === "dark" ? 15 : -15,
    ),

    // List Filter Widget
    "listFilterWidget.background": adjustBrightness(
      sidebarBg,
      type === "dark" ? 15 : -15,
    ),
    "listFilterWidget.outline": accentContrast,
    "listFilterWidget.noMatchesOutline": ensureContrastRatio(
      "#c74e39",
      sidebarBg,
      3.0,
    ),

    // Tree Indent Guides
    "tree.indentGuidesStroke": adjustBrightness(
      sidebarBg,
      type === "dark" ? 20 : -20,
    ),

    // Extension Button
    "extensionButton.prominentBackground": accent,
    "extensionButton.prominentForeground": getContrastColor(accent, 4.5),
    "extensionButton.prominentHoverBackground": adjustBrightness(
      accent,
      type === "dark" ? 10 : -10,
    ),

    // Welcome Page
    "welcomePage.background": editorBg,
    "welcomePage.buttonBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "welcomePage.buttonHoverBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 15 : -15,
    ),
    "walkThrough.embeddedEditorBackground": adjustBrightness(
      editorBg,
      type === "dark" ? -5 : 5,
    ),

    // Symbol Icons
    "symbolIcon.arrayForeground": tertiaryContrast,
    "symbolIcon.booleanForeground": tertiaryContrast,
    "symbolIcon.classForeground": secondaryContrast,
    "symbolIcon.colorForeground": tertiaryContrast,
    "symbolIcon.constantForeground": tertiaryContrast,
    "symbolIcon.constructorForeground": accentContrast,
    "symbolIcon.enumeratorForeground": secondaryContrast,
    "symbolIcon.enumeratorMemberForeground": tertiaryContrast,
    "symbolIcon.eventForeground": secondaryContrast,
    "symbolIcon.fieldForeground": tertiaryContrast,
    "symbolIcon.fileForeground": sidebarFg,
    "symbolIcon.folderForeground": sidebarFg,
    "symbolIcon.functionForeground": accentContrast,
    "symbolIcon.interfaceForeground": secondaryContrast,
    "symbolIcon.keyForeground": tertiaryContrast,
    "symbolIcon.keywordForeground": accentContrast,
    "symbolIcon.methodForeground": accentContrast,
    "symbolIcon.moduleForeground": secondaryContrast,
    "symbolIcon.namespaceForeground": secondaryContrast,
    "symbolIcon.nullForeground": tertiaryContrast,
    "symbolIcon.numberForeground": tertiaryContrast,
    "symbolIcon.objectForeground": secondaryContrast,
    "symbolIcon.operatorForeground": accentContrast,
    "symbolIcon.packageForeground": secondaryContrast,
    "symbolIcon.propertyForeground": tertiaryContrast,
    "symbolIcon.referenceForeground": tertiaryContrast,
    "symbolIcon.snippetForeground": fg,
    "symbolIcon.stringForeground": secondaryContrast,
    "symbolIcon.structForeground": secondaryContrast,
    "symbolIcon.textForeground": fg,
    "symbolIcon.typeParameterForeground": secondaryContrast,
    "symbolIcon.unitForeground": tertiaryContrast,
    "symbolIcon.variableForeground": tertiaryContrast,

    // Editor Error/Warning/Info Squiggles
    "editorError.foreground": ensureContrastRatio("#f48771", editorBg, 3.0),
    "editorError.border": type === "dark" ? "#ffffff00" : "#00000000",
    "editorWarning.foreground": ensureContrastRatio("#cca700", editorBg, 3.0),
    "editorWarning.border": type === "dark" ? "#ffffff00" : "#00000000",
    "editorInfo.foreground": ensureContrastRatio("#75beff", editorBg, 3.0),
    "editorInfo.border": type === "dark" ? "#ffffff00" : "#00000000",
    "editorHint.foreground": adjustBrightness(fg, type === "dark" ? -20 : 20),

    // Editor Bracket Matching
    "editorBracketMatch.background": accentContrast + "22",
    "editorBracketMatch.border": accentContrast,

    // Editor Overview Ruler
    "editorOverviewRuler.border": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "editorOverviewRuler.currentContentForeground": ensureContrastRatio(
      "#367366",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.incomingContentForeground": ensureContrastRatio(
      "#395f8f",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.findMatchForeground": accentContrast + "88",
    "editorOverviewRuler.rangeHighlightForeground": accentContrast + "66",
    "editorOverviewRuler.selectionHighlightForeground": accentContrast + "44",
    "editorOverviewRuler.wordHighlightForeground": accentContrast + "44",
    "editorOverviewRuler.wordHighlightStrongForeground": accentContrast + "66",
    "editorOverviewRuler.modifiedForeground": ensureContrastRatio(
      "#e2c08d",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.addedForeground": ensureContrastRatio(
      "#81b88b",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.deletedForeground": ensureContrastRatio(
      "#c74e39",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.errorForeground": ensureContrastRatio(
      "#f48771",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.warningForeground": ensureContrastRatio(
      "#cca700",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.infoForeground": ensureContrastRatio(
      "#75beff",
      editorBg,
      2.0,
    ),
    "editorOverviewRuler.bracketMatchForeground": accentContrast + "88",

    // Editor Indentation Guides
    "editorIndentGuide.background": adjustBrightness(
      editorBg,
      type === "dark" ? 15 : -15,
    ),
    "editorIndentGuide.activeBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 25 : -25,
    ),

    // Editor Rulers
    "editorRuler.foreground": adjustBrightness(
      editorBg,
      type === "dark" ? 15 : -15,
    ),

    // Editor Code Lens
    "editorCodeLens.foreground": adjustBrightness(
      fg,
      type === "dark" ? -30 : 30,
    ),

    // Editor Link
    "editorLink.activeForeground": accentContrast,

    // Editor Range Highlight
    "editor.rangeHighlightBackground": accentContrast + "11",
    "editor.rangeHighlightBorder": type === "dark" ? "#ffffff00" : "#00000000",

    // Editor Selection Highlight
    "editor.selectionHighlightBackground": accentContrast + "22",
    "editor.selectionHighlightBorder":
      type === "dark" ? "#ffffff00" : "#00000000",

    // Editor Word Highlight
    "editor.wordHighlightStrongBackground": accentContrast + "33",
    "editor.wordHighlightStrongBorder":
      type === "dark" ? "#ffffff00" : "#00000000",

    // Editor Find Match
    "editor.findMatchBackground": accentContrast + "66",
    "editor.findMatchHighlightBackground": accentContrast + "33",
    "editor.findMatchBorder": accentContrast,
    "editor.findMatchHighlightBorder":
      type === "dark" ? "#ffffff00" : "#00000000",
    "editor.findRangeHighlightBackground": accentContrast + "22",
    "editor.findRangeHighlightBorder":
      type === "dark" ? "#ffffff00" : "#00000000",

    // Editor Find Widget
    "editorWidget.resizeBorder": accentContrast,
    "editorFindWidget.background": sidebarBg,
    "editorFindWidget.border": accentContrast + "66",

    // Minimap
    "minimap.findMatchHighlight": accentContrast + "88",
    "minimap.selectionHighlight": accentContrast + "66",
    "minimap.errorHighlight":
      ensureContrastRatio("#f48771", editorBg, 2.0) + "88",
    "minimap.warningHighlight":
      ensureContrastRatio("#cca700", editorBg, 2.0) + "88",
    "minimapSlider.background":
      adjustBrightness(editorBg, type === "dark" ? 20 : -20) + "44",
    "minimapSlider.hoverBackground":
      adjustBrightness(editorBg, type === "dark" ? 25 : -25) + "66",
    "minimapSlider.activeBackground":
      adjustBrightness(editorBg, type === "dark" ? 30 : -30) + "88",
    "minimapGutter.addedBackground": ensureContrastRatio(
      "#81b88b",
      editorBg,
      2.0,
    ),
    "minimapGutter.modifiedBackground": ensureContrastRatio(
      "#e2c08d",
      editorBg,
      2.0,
    ),
    "minimapGutter.deletedBackground": ensureContrastRatio(
      "#c74e39",
      editorBg,
      2.0,
    ),

    // Editor Markers (Breakpoints, etc)
    "editorMarkerNavigation.background": sidebarBg,
    "editorMarkerNavigationError.background": ensureContrastRatio(
      "#f48771",
      sidebarBg,
      3.0,
    ),
    "editorMarkerNavigationWarning.background": ensureContrastRatio(
      "#cca700",
      sidebarBg,
      3.0,
    ),
    "editorMarkerNavigationInfo.background": ensureContrastRatio(
      "#75beff",
      sidebarBg,
      3.0,
    ),

    // Inlay Hints
    "editorInlayHint.background":
      adjustBrightness(editorBg, type === "dark" ? 10 : -10) + "cc",
    "editorInlayHint.foreground": adjustBrightness(
      fg,
      type === "dark" ? -20 : 20,
    ),
    "editorInlayHint.typeBackground":
      adjustBrightness(editorBg, type === "dark" ? 10 : -10) + "cc",
    "editorInlayHint.typeForeground": adjustBrightness(
      fg,
      type === "dark" ? -20 : 20,
    ),
    "editorInlayHint.parameterBackground":
      adjustBrightness(editorBg, type === "dark" ? 10 : -10) + "cc",
    "editorInlayHint.parameterForeground": adjustBrightness(
      fg,
      type === "dark" ? -20 : 20,
    ),

    // Ghost Text (Suggestions)
    "editorGhostText.foreground": adjustBrightness(
      fg,
      type === "dark" ? -40 : 40,
    ),
    "editorGhostText.border": type === "dark" ? "#ffffff00" : "#00000000",

    // Sticky Scroll
    "editorStickyScroll.background": editorBg,
    "editorStickyScrollHover.background": adjustBrightness(
      editorBg,
      type === "dark" ? 5 : -5,
    ),

    // Search Editor
    "searchEditor.findMatchBackground": accentContrast + "44",
    "searchEditor.findMatchBorder": accentContrast + "88",
    "searchEditor.textInputBorder": accentContrast + "66",

    // Chart Colors (Testing, Performance, etc)
    "charts.foreground": fg,
    "charts.lines": adjustBrightness(editorBg, type === "dark" ? 20 : -20),
    "charts.red": ensureContrastRatio("#f48771", editorBg, 3.0),
    "charts.blue": ensureContrastRatio("#75beff", editorBg, 3.0),
    "charts.yellow": ensureContrastRatio("#cca700", editorBg, 3.0),
    "charts.orange": ensureContrastRatio("#d18616", editorBg, 3.0),
    "charts.green": ensureContrastRatio("#89d185", editorBg, 3.0),
    "charts.purple": ensureContrastRatio("#b180d7", editorBg, 3.0),

    // Testing
    "testing.iconFailed": ensureContrastRatio("#f48771", sidebarBg, 3.0),
    "testing.iconErrored": ensureContrastRatio("#f48771", sidebarBg, 3.0),
    "testing.iconPassed": ensureContrastRatio("#89d185", sidebarBg, 3.0),
    "testing.runAction": accentContrast,
    "testing.iconQueued": ensureContrastRatio("#cca700", sidebarBg, 3.0),
    "testing.iconUnset": adjustBrightness(
      sidebarFg,
      type === "dark" ? -20 : 20,
    ),
    "testing.iconSkipped": adjustBrightness(
      sidebarFg,
      type === "dark" ? -20 : 20,
    ),

    // Problems Panel
    "problemsErrorIcon.foreground": ensureContrastRatio(
      "#f48771",
      sidebarBg,
      3.0,
    ),
    "problemsWarningIcon.foreground": ensureContrastRatio(
      "#cca700",
      sidebarBg,
      3.0,
    ),
    "problemsInfoIcon.foreground": ensureContrastRatio(
      "#75beff",
      sidebarBg,
      3.0,
    ),

    // Status Bar Items
    "statusBarItem.activeBackground": adjustBrightness(
      accent,
      type === "dark" ? -15 : 15,
    ),
    "statusBarItem.hoverBackground": adjustBrightness(
      accent,
      type === "dark" ? -10 : 10,
    ),
    "statusBarItem.prominentBackground": secondary,
    "statusBarItem.prominentForeground": getContrastColor(secondary, 4.5),
    "statusBarItem.prominentHoverBackground": adjustBrightness(
      secondary,
      type === "dark" ? 10 : -10,
    ),
    "statusBarItem.remoteBackground": accent,
    "statusBarItem.remoteForeground": getContrastColor(accent, 4.5),
    "statusBarItem.errorBackground": ensureContrastRatio(
      "#c74e39",
      editorBg,
      3.0,
    ),
    "statusBarItem.errorForeground": getContrastColor("#c74e39", 4.5),
    "statusBarItem.warningBackground": ensureContrastRatio(
      "#cca700",
      editorBg,
      3.0,
    ),
    "statusBarItem.warningForeground": getContrastColor("#cca700", 4.5),

    // Tab Additional
    "tab.border": adjustBrightness(editorBg, type === "dark" ? 10 : -10),
    "tab.unfocusedActiveBorder": accentContrast + "88",
    "tab.unfocusedActiveBackground": editorBg,
    "tab.unfocusedActiveForeground": adjustBrightness(
      fg,
      type === "dark" ? -20 : 20,
    ),
    "tab.unfocusedInactiveBackground": sidebarBg,
    "tab.unfocusedInactiveForeground": sidebarFg + "88",
    "tab.hoverBackground": adjustBrightness(editorBg, type === "dark" ? 5 : -5),
    "tab.hoverBorder": accentContrast + "66",
    "tab.lastPinnedBorder": adjustBrightness(
      sidebarBg,
      type === "dark" ? 15 : -15,
    ),

    // Editor Group
    "editorGroup.border": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "editorGroup.dropBackground": accentContrast + "22",
    "editorGroupHeader.tabsBackground": sidebarBg,
    "editorGroupHeader.noTabsBackground": editorBg,
    "editorGroupHeader.border": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),

    // Side by Side Editor
    "sideBySideEditor.horizontalBorder": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "sideBySideEditor.verticalBorder": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),

    // Interactive Editor (Notebooks)
    "interactive.activeCodeBorder": accentContrast,
    "interactive.inactiveCodeBorder": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),

    // Notebook
    "notebook.cellBorderColor": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "notebook.focusedCellBorder": accentContrast,
    "notebook.cellStatusBarItemHoverBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "notebook.cellInsertionIndicator": accentContrast,
    "notebook.cellToolbarSeparator": adjustBrightness(
      editorBg,
      type === "dark" ? 15 : -15,
    ),
    "notebook.selectedCellBackground": adjustBrightness(
      editorBg,
      type === "dark" ? 5 : -5,
    ),
    "notebookStatusSuccessIcon.foreground": ensureContrastRatio(
      "#89d185",
      editorBg,
      3.0,
    ),
    "notebookStatusErrorIcon.foreground": ensureContrastRatio(
      "#f48771",
      editorBg,
      3.0,
    ),
    "notebookStatusRunningIcon.foreground": accentContrast,

    // Keybinding Label
    "keybindingLabel.background": adjustBrightness(
      editorBg,
      type === "dark" ? 10 : -10,
    ),
    "keybindingLabel.foreground": fg,
    "keybindingLabel.border": adjustBrightness(
      editorBg,
      type === "dark" ? 20 : -20,
    ),
    "keybindingLabel.bottomBorder": adjustBrightness(
      editorBg,
      type === "dark" ? 25 : -25,
    ),
  };

  // Colores de sintaxis con contraste garantizado
  const commentColor =
    type === "dark"
      ? ensureContrastRatio(adjustBrightness(fg, -30), editorBg, 3.0, false)
      : ensureContrastRatio(adjustBrightness(fg, 30), editorBg, 3.0, false);

  const tokenColors: TokenColor[] = [
    {
      name: "Comments",
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: commentColor, fontStyle: "italic" },
    },
    {
      name: "Keywords",
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: accentSyntax },
    },
    {
      name: "Strings",
      scope: ["string", "string.quoted"],
      settings: { foreground: secondarySyntax },
    },
    {
      name: "Numbers",
      scope: ["constant.numeric"],
      settings: { foreground: tertiarySyntax },
    },
    {
      name: "Functions",
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: accentSyntax },
    },
    {
      name: "Classes & Types",
      scope: ["entity.name.type", "entity.name.class", "support.type"],
      settings: { foreground: secondarySyntax },
    },
    {
      name: "Variables",
      scope: ["variable", "variable.other"],
      settings: { foreground: fg },
    },
    {
      name: "Constants",
      scope: ["constant", "variable.other.constant"],
      settings: { foreground: tertiarySyntax },
    },
    {
      name: "Operators",
      scope: ["keyword.operator"],
      settings: {
        foreground: ensureContrastRatio(accentSyntax, editorBg, 3.0),
      },
    },
    {
      name: "Tags (HTML/XML)",
      scope: ["entity.name.tag"],
      settings: { foreground: accentSyntax },
    },
    {
      name: "Attributes",
      scope: ["entity.other.attribute-name"],
      settings: { foreground: secondarySyntax, fontStyle: "italic" },
    },
    {
      name: "CSS Properties",
      scope: ["support.type.property-name.css"],
      settings: { foreground: secondarySyntax },
    },
  ];

  const themeDefinition: any = {
    name: themeName ?? `${palette.name} Theme`,
    type,
    colors: workbenchColors,
    tokenColors,
  };

  // Store original palette for perfect round-trip import/export
  themeDefinition._sourcePalette = palette;

  return themeDefinition;
}

// ── Export to file ──────────────────────────────────────────────────────────

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
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "",
        `${defaultName}-color-theme.json`,
      ),
    ),
    filters: { "VS Code Theme": ["json"] },
    title: "Export Theme File",
  });

  if (!uri) {
    return undefined;
  }

  const themeJson: any = {
    name: theme.name,
    type: theme.type,
    colors: theme.colors,
    tokenColors: theme.tokenColors,
  };

  // Include original palette data for perfect round-trip import/export
  if ((theme as any)._sourcePalette) {
    themeJson._palette = (theme as any)._sourcePalette;
  }

  fs.writeFileSync(uri.fsPath, JSON.stringify(themeJson, null, 2), "utf-8");
  vscode.window.showInformationMessage(
    `Theme exported: ${path.basename(uri.fsPath)}`,
  );
  return uri.fsPath;
}

// ── Apply as preview ───────────────────────────────────────────────────────

export async function applyThemePreview(theme: ThemeDefinition): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  await config.update(
    "workbench.colorCustomizations",
    theme.colors,
    vscode.ConfigurationTarget.Global,
  );
  await config.update(
    "editor.tokenColorCustomizations",
    { textMateRules: theme.tokenColors },
    vscode.ConfigurationTarget.Global,
  );
  vscode.window.showInformationMessage(`Theme preview applied: ${theme.name}`);
}

export async function clearThemePreview(): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  await config.update(
    "workbench.colorCustomizations",
    undefined,
    vscode.ConfigurationTarget.Global,
  );
  await config.update(
    "editor.tokenColorCustomizations",
    undefined,
    vscode.ConfigurationTarget.Global,
  );
  vscode.window.showInformationMessage("Theme preview cleared.");
}

// ── Import from file ────────────────────────────────────────────────────────

export async function importThemeFromFile(): Promise<Palette | undefined> {
  const uri = await vscode.window.showOpenDialog({
    filters: { "VS Code Theme": ["json"] },
    title: "Import Theme File",
    canSelectMany: false,
    openLabel: "Import",
  });

  if (!uri || uri.length === 0) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(uri[0].fsPath, "utf-8");
    const themeData = JSON.parse(content);

    // Validate theme structure
    if (!themeData.colors && !themeData.tokenColors) {
      throw new Error("Invalid theme file: missing colors or tokenColors");
    }

    const palette = convertThemeToPalette(themeData);
    vscode.window.showInformationMessage(`Theme imported: ${palette.name}`);
    return palette;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(`Failed to import theme: ${message}`);
    return undefined;
  }
}

/**
 * Convert a VS Code theme definition back to a Palette
 */
export function convertThemeToPalette(themeData: any): Palette {
  // If the theme was exported from this extension, it will have the original palette
  if (themeData._palette) {
    return {
      ...themeData._palette,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: themeData.name || themeData._palette.name,
    };
  }

  // Otherwise, try to reconstruct the palette from theme colors
  const colors = themeData.colors || {};
  const name = themeData.name || "Imported Theme";
  const type = themeData.type || detectTypeFromColors(colors);

  // Extract key colors from the theme
  const extractedColors = extractKeyColorsFromTheme(colors);

  // Determine harmony type based on color relationships
  const harmony = detectHarmonyType(extractedColors);

  // Convert to ColorInfo format
  const colorInfos = extractedColors.map((hex, index) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    return {
      hex,
      rgb,
      hsl,
      name: `Color ${index + 1}`,
    };
  });

  const baseColor = colorInfos[0];

  return {
    id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    baseColor,
    harmony,
    colors: colorInfos,
    createdAt: Date.now(),
  };
}

/**
 * Detect theme type from colors
 */
function detectTypeFromColors(colors: Record<string, string>): ThemeType {
  const editorBg = colors["editor.background"] || "#1e1e1e";
  const hsl = hexToHsl(editorBg);
  return hsl.l < 50 ? "dark" : "light";
}

/**
 * Extract key colors from theme to build palette
 */
function extractKeyColorsFromTheme(colors: Record<string, string>): string[] {
  const extracted: string[] = [];
  const seen = new Set<string>();

  // Priority order for color extraction
  const priorityKeys = [
    "statusBar.background",
    "activityBar.activeBorder",
    "focusBorder",
    "button.background",
    "editor.selectionBackground",
    "list.activeSelectionBackground",
    "editorCursor.foreground",
    "sideBarTitle.foreground",
    "activityBarBadge.background",
    "terminal.ansiBlue",
    "terminal.ansiCyan",
    "terminal.ansiGreen",
    "terminal.ansiMagenta",
    "terminal.ansiYellow",
  ];

  // Extract colors from priority keys
  for (const key of priorityKeys) {
    const color = colors[key];
    if (color && isValidHex(color)) {
      const normalized = normalizeHex(color);
      if (!seen.has(normalized) && !isGrayscale(normalized)) {
        extracted.push(normalized);
        seen.add(normalized);
        if (extracted.length >= 6) break;
      }
    }
  }

  // If we don't have enough colors, scan all colors
  if (extracted.length < 4) {
    for (const [key, color] of Object.entries(colors)) {
      if (color && isValidHex(color)) {
        const normalized = normalizeHex(color);
        if (!seen.has(normalized) && !isGrayscale(normalized)) {
          extracted.push(normalized);
          seen.add(normalized);
          if (extracted.length >= 6) break;
        }
      }
    }
  }

  // Ensure we have at least one color
  if (extracted.length === 0) {
    extracted.push("#4a90d9"); // Default fallback
  }

  return extracted;
}

/**
 * Detect harmony type from color relationships
 */
function detectHarmonyType(colors: string[]): HarmonyType {
  if (colors.length < 2) {
    return "monochromatic";
  }

  const hues = colors.map((hex) => hexToHsl(hex).h);
  const hueDiffs = [];

  // Calculate hue differences
  for (let i = 1; i < hues.length; i++) {
    let diff = Math.abs(hues[i] - hues[0]);
    if (diff > 180) diff = 360 - diff;
    hueDiffs.push(diff);
  }

  // Check for monochromatic (all similar hues)
  const allSimilar = hueDiffs.every((diff) => diff < 30);
  if (allSimilar) {
    return "monochromatic";
  }

  // Check for complementary (opposite hues ~180°)
  const hasComplement = hueDiffs.some((diff) => Math.abs(diff - 180) < 30);
  if (hasComplement && colors.length <= 3) {
    return "complementary";
  }

  // Check for triadic (120° apart)
  const hasTriadic = hueDiffs.some(
    (diff) => Math.abs(diff - 120) < 30 || Math.abs(diff - 240) < 30,
  );
  if (hasTriadic) {
    return "triadic";
  }

  // Check for tetradic (90° or 180° relationships)
  const hasTetradic = hueDiffs.some(
    (diff) => Math.abs(diff - 90) < 30 || Math.abs(diff - 180) < 30,
  );
  if (hasTetradic && colors.length >= 4) {
    return "tetradic";
  }

  // Check for analogous (adjacent colors 30°)
  const hasAnalogous = hueDiffs.every((diff) => diff < 60);
  if (hasAnalogous) {
    return "analogous";
  }

  return "split-complementary";
}

/**
 * Validate hex color format
 */
function isValidHex(color: string): boolean {
  return /^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);
}

/**
 * Normalize hex color (remove alpha, ensure # prefix)
 */
function normalizeHex(color: string): string {
  let hex = color.replace(/^#/, "");
  if (hex.length === 8) {
    hex = hex.substring(0, 6); // Remove alpha
  }
  return `#${hex.toLowerCase()}`;
}

/**
 * Check if color is grayscale
 */
function isGrayscale(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max - min < 15; // Threshold for grayscale detection
}
