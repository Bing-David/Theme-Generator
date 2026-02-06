/**
 * Webview HTML Template
 * Main structure and layout for the theme generator UI
 */

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
                TG
            </div>
            <span class="header-title">THEME GENERATOR</span>
        </div>
    </header>

    <div class="main-content">
        <!-- Center Panel - Controles + Paleta -->
        <div class="center-panel">
            <div class="palette-display">
                <div class="reset-warning" id="resetWarning">
                    <div class="reset-warning-text">Theme preview is active</div>
                    <button class="btn btn-danger btn-block" id="btnClearPreview">Clear Preview & Reset</button>
                </div>

                <!-- Base Color -->
                <div class="control-group">
                    <div class="control-group-title">Base Color</div>
                    <div class="color-input-row">
                        <input type="color" id="baseColor" value="#4a90d9" />
                        <input type="text" id="baseColorText" value="#4a90d9" maxlength="7" />
                    </div>
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

                <!-- Color Properties -->
                <div class="control-group">
                    <div class="control-group-title">Color Properties</div>
                    <div class="slider-row">
                        <label for="saturationSlider">Saturation</label>
                        <input type="range" id="saturationSlider" min="0.3" max="1.0" step="0.05" value="0.7" />
                        <span id="saturationValue">0.70</span>
                    </div>
                    <div class="slider-row">
                        <label for="luminositySlider">Luminosity</label>
                        <input type="range" id="luminositySlider" min="0.2" max="0.8" step="0.05" value="0.5" />
                        <span id="luminosityValue">0.50</span>
                    </div>
                    <div class="slider-row">
                        <label for="variationSlider">Variation</label>
                        <input type="range" id="variationSlider" min="0.0" max="0.5" step="0.05" value="0.15" />
                        <span id="variationValue">0.15</span>
                    </div>
                    <div class="slider-row">
                        <label for="syntaxSaturationSlider">Syntax Intensity</label>
                        <input type="range" id="syntaxSaturationSlider" min="0.5" max="1.5" step="0.1" value="1.0" />
                        <span id="syntaxSaturationValue">1.0</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="control-group">
                    <div class="checkbox-row">
                        <label>
                            <input type="checkbox" id="autoPreview" checked />
                            <span>Auto-preview changes</span>
                        </label>
                    </div>
                    <div class="quick-actions">
                        <button class="btn btn-primary" id="btnRandomPalette">
                            Random
                        </button>
                        <button class="btn" id="btnSaveCurrent">
                            Save
                        </button>
                        <button class="btn" id="btnExport">
                            Export
                        </button>
                    </div>
                </div>

                <!-- Editable Color Strip -->
                <div class="editable-strip" id="editableStrip"></div>

                <!-- Full Palette Grid -->
                <div class="palette-full" id="paletteGrid"></div>
            </div>
        </div>

        <!-- Right Panel - Theme Details -->
        <div class="right-panel">
            <div class="control-group">
                <div class="control-group-title">Saved Palettes</div>
                <div id="savedList"></div>
            </div>

            <div class="control-group">
                <div class="control-group-title">Theme Details</div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Editor Colors</div>
                    <div id="editorElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Borders & Lines</div>
                    <div id="bordersElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">UI Components</div>
                    <div id="uiElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Lists & Selection</div>
                    <div id="listsElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Inputs & Buttons</div>
                    <div id="inputsElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Terminal Colors</div>
                    <div id="terminalElements"></div>
                </div>

                <div class="theme-details-group">
                    <div class="theme-details-subtitle">Syntax Highlighting</div>
                    <div id="syntaxElements"></div>
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
