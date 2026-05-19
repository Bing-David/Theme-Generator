export function getHtml(styles: string, script: string, nonce: string): string {
  return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Theme Generator</title>
<style>
${styles}
</style>
</head>
<body>
<div class="app">

    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <div class="header-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
            </div>
            <span class="header-title">THEME GENERATOR</span>
        </div>
        <div class="palette-info-bar" id="paletteInfoBar">
            <div class="palette-info-left">
                <div class="palette-info-swatch" id="paletteInfoSwatch"></div>
                <span class="palette-info-hex" id="paletteInfoHex">—</span>
            </div>
            <div class="palette-info-sep">·</div>
            <div class="palette-info-right">
                <span class="palette-info-label">Harmony</span>
                <span class="palette-info-harmony" id="paletteInfoHarmony">—</span>
            </div>
        </div>
    </header>

    <div class="main-content">
        <!-- Left Panel - Controls -->
        <div class="center-panel">
            <div class="palette-display">

                <!-- Preview Warning -->
                <div class="reset-warning" id="resetWarning">
                    <div class="reset-warning-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3l9 16H3L12 5zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
                        Theme preview is active
                    </div>
                    <button class="btn btn-danger btn-sm" id="btnClearPreview">✕ Clear Preview</button>
                </div>

                <!-- Harmony Type -->
                <div class="control-group">
                    <div class="control-group-title">Harmony Type</div>
                    <div class="harmony-grid">
                        <div class="harmony-option active" data-harmony="complementary">Complementary</div>
                        <div class="harmony-option" data-harmony="analogous">Analogous</div>
                        <div class="harmony-option" data-harmony="triadic">Triadic</div>
                        <div class="harmony-option" data-harmony="split-complementary">Split Compl.</div>
                        <div class="harmony-option" data-harmony="tetradic">Tetradic</div>
                        <div class="harmony-option" data-harmony="monochromatic">Monochrome</div>
                    </div>
                </div>

                <!-- Base Color -->
                <div class="control-group">
                    <div class="control-group-title">Base Color</div>
                    <div class="color-input-row">
                        <input type="color" id="baseColor" value="#4a90d9" />
                        <input type="text" id="baseColorText" value="#4a90d9" maxlength="7" placeholder="#4a90d9" />
                        <button class="btn btn-icon" id="btnRandomPalette" title="Generate random palette">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Random
                        </button>
                    </div>
                </div>

                <!-- Color Properties -->
                <div class="control-group">
                    <div class="control-group-title">Color Properties</div>
                    <div class="slider-row">
                        <label for="saturationSlider">Saturation</label>
                        <input type="range" id="saturationSlider" min="0.2" max="1.2" step="0.05" value="0.7" />
                        <span class="slider-val" id="saturationValue">0.70</span>
                    </div>
                    <div class="slider-row">
                        <label for="luminositySlider">Luminosity</label>
                        <input type="range" id="luminositySlider" min="0.15" max="0.9" step="0.05" value="0.5" />
                        <span class="slider-val" id="luminosityValue">0.50</span>
                    </div>
                    <div class="slider-row">
                        <label for="variationSlider">Variation</label>
                        <input type="range" id="variationSlider" min="0.0" max="0.65" step="0.05" value="0.15" />
                        <span class="slider-val" id="variationValue">0.15</span>
                    </div>
                    <div class="slider-row">
                        <label for="syntaxSaturationSlider">Syntax</label>
                        <input type="range" id="syntaxSaturationSlider" min="0.5" max="1.5" step="0.1" value="1.0" />
                        <span class="slider-val" id="syntaxSaturationValue">1.0</span>
                    </div>
                </div>

                <!-- Editable Color Strip -->
                <div class="editable-strip" id="editableStrip"></div>

                <!-- Actions -->
                <div class="control-group">
                    <div class="action-row">
                        <label class="toggle-label">
                            <input type="checkbox" id="autoPreview" checked />
                            <span class="toggle-track"><span class="toggle-thumb"></span></span>
                            <span class="toggle-text">Auto-preview</span>
                        </label>
                        <div class="action-btns">
                            <button class="btn" id="btnSaveCurrent" title="Save current palette">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Save
                            </button>
                            <button class="btn" id="btnImport" title="Import theme file">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Import
                            </button>
                            <button class="btn btn-primary" id="btnExport" title="Export theme file">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Right Panel - Details -->
        <div class="right-panel">

            <!-- Saved Palettes -->
            <div class="control-group">
                <div class="control-group-title">Saved Palettes</div>
                <div id="savedList"></div>
            </div>

            <!-- Theme Details Tabs -->
            <div class="control-group theme-details-wrapper">
                <div id="themeDetailsOverlay" class="theme-details-overlay">
                    <div class="theme-details-overlay-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                        <span>Generate or load a palette<br>to see theme details</span>
                    </div>
                </div>

                <div class="control-group-title">Theme Details</div>

                <!-- Tabs -->
                <div class="details-tabs">
                    <button class="details-tab active" data-tab="workbench">UI Colors</button>
                    <button class="details-tab" data-tab="syntax">Syntax Tokens</button>
                </div>

                <!-- Search -->
                <div class="search-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input type="text" id="themeSearch" placeholder="Search properties..." autocomplete="off" />
                </div>

                <!-- Tab: Workbench Colors -->
                <div id="tabWorkbench" class="tab-content active">
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Editor</div>
                        <div id="editorElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Errors &amp; Warnings</div>
                        <div id="errorsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Sidebar</div>
                        <div id="sidebarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Activity Bar</div>
                        <div id="activityBarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Title Bar</div>
                        <div id="titleBarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Status Bar</div>
                        <div id="statusBarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Tabs</div>
                        <div id="tabsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Terminal</div>
                        <div id="terminalElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Panel</div>
                        <div id="panelElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Lists</div>
                        <div id="listsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Widgets</div>
                        <div id="widgetsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Forms</div>
                        <div id="formsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Quick Input</div>
                        <div id="quickInputElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Peek View</div>
                        <div id="peekViewElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Notifications</div>
                        <div id="notificationsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Menu</div>
                        <div id="menuElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Scrollbar</div>
                        <div id="scrollbarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Breadcrumb</div>
                        <div id="breadcrumbElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Diff Editor</div>
                        <div id="diffElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Git Decorations</div>
                        <div id="gitElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Gutter</div>
                        <div id="gutterElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Overview Ruler</div>
                        <div id="overviewRulerElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Badge</div>
                        <div id="badgeElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Debug</div>
                        <div id="debugElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Progress Bar</div>
                        <div id="progressBarElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Symbol Icons</div>
                        <div id="symbolsElements"></div>
                    </div>
                </div>

                <!-- Tab: Syntax Tokens -->
                <div id="tabSyntax" class="tab-content">
                    <div class="syntax-hint">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        Changes apply to <code>editor.tokenColorCustomizations</code>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Core</div>
                        <div id="syntaxCoreElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Functions</div>
                        <div id="syntaxFunctionsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Types &amp; Classes</div>
                        <div id="syntaxTypesElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Variables &amp; Constants</div>
                        <div id="syntaxVarsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Operators &amp; Punctuation</div>
                        <div id="syntaxOpsElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Markup &amp; Web</div>
                        <div id="syntaxMarkupElements"></div>
                    </div>
                    <div class="theme-details-group">
                        <div class="theme-details-subtitle">Decorators &amp; Regex</div>
                        <div id="syntaxSpecialElements"></div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<div class="toast" id="toast"></div>

<script nonce="${nonce}">
${script}
</script>
</body>
</html>`;
}
