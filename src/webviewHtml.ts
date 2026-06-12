export function getHtml(styles: string, script: string, nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"
/>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Theme Generator</title>
<style>${styles}</style>
</head>
<body>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <div class="header-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
          </svg>
        </div>
        <span class="header-title">Theme Generator</span>
      </div>
      <div class="palette-info-bar">
        <div class="palette-info-left">
          <div class="palette-info-swatch" id="paletteInfoSwatch"></div>
          <span class="palette-info-hex" id="paletteInfoHex">#000000</span>
        </div>
        <div class="palette-info-sep">·</div>
        <div class="palette-info-right">
          <span class="palette-info-label">Harmony</span>
          <span class="palette-info-harmony" id="paletteInfoHarmony">Analogous</span>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="center-panel">
        <div class="palette-display">
          <div class="reset-warning" id="resetWarning">
            <div class="reset-warning-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 21h22L12 2zm0 3l9 16H3L12 5zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"></path>
              </svg>
              Preview theme is active
            </div>
            <button class="btn btn-danger btn-sm" id="btnClearPreview">Clear Preview</button>
          </div>

          <div class="control-group">
            <div class="control-group-title">Harmony Type</div>
            <div class="harmony-grid" id="harmonyGrid">
              <div class="harmony-option active" data-harmony="analogous">Analogous</div>
              <div class="harmony-option" data-harmony="complementary">Complementary</div>
              <div class="harmony-option" data-harmony="triadic">Triadic</div>
              <div class="harmony-option" data-harmony="split-complementary">Split Complementary</div>
              <div class="harmony-option" data-harmony="tetradic">Tetradic</div>
              <div class="harmony-option" data-harmony="monochromatic">Monochromatic</div>
              <div class="harmony-option" data-harmony="square">Square</div>
              <div class="harmony-option" data-harmony="double-complementary">Double Complementary</div>
              <div class="harmony-option" data-harmony="compound">Compound</div>
              <div class="harmony-option" data-harmony="accented-analogous">Accented Analogous</div>
              <div class="harmony-option" data-harmony="neutral">Neutral</div>
              <div class="harmony-option" data-harmony="warm">Warm</div>
              <div class="harmony-option" data-harmony="cool">Cool</div>
              <div class="harmony-option" data-harmony="polychromatic">Polychromatic</div>
              <div class="harmony-option" data-harmony="rainbow">Rainbow</div>
              <div class="harmony-option" data-harmony="duotone">Duotone</div>
              <div class="harmony-option" data-harmony="grayscale">Grayscale</div>
              <div class="harmony-option" data-harmony="near-monochromatic">Near Monochromatic</div>
              <div class="harmony-option" data-harmony="split-triadic">Split Triadic</div>
              <div class="harmony-option" data-harmony="pentadic">Pentadic</div>
              <div class="harmony-option" data-harmony="hexadic">Hexadic</div>
            </div>
          </div>

          <div class="control-group">
            <div class="control-group-title">Base Color</div>
            <div class="color-input-row">
              <input type="color" id="baseColor" value="#4a90d9" />
              <input type="text" id="baseColorText" value="#4a90d9" maxlength="7" placeholder="#4a90d9" />
              <button class="btn btn-icon" id="btnRandomPalette">Random</button>
            </div>
            <div class="action-row base-lock-row">
              <label class="toggle-label">
                <input type="checkbox" id="baseColorLocked" />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="toggle-text">Lock base color</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <div class="control-group-title">Color Properties</div>
            <div class="slider-row">
              <label for="saturationSlider">Saturation</label>
              <input type="range" id="saturationSlider" min="0.2" max="1.2" step="0.05" value="0.7" />
              <span class="slider-val" id="saturationValue">0.70</span>
            </div>
            <div class="slider-row">
              <label for="luminositySlider">Luminosity</label>
              <input type="range" id="luminositySlider" min="0.2" max="0.85" step="0.05" value="0.5" />
              <span class="slider-val" id="luminosityValue">0.50</span>
            </div>
            <div class="slider-row">
              <label for="variationSlider">Variation</label>
              <input type="range" id="variationSlider" min="0.0" max="0.65" step="0.05" value="0.15" />
              <span class="slider-val" id="variationValue">0.15</span>
            </div>
            <div class="slider-row">
              <label for="syntaxSaturationSlider">Syntax</label>
              <input type="range" id="syntaxSaturationSlider" min="0.5" max="1.6" step="0.1" value="1.0" />
              <span class="slider-val" id="syntaxSaturationValue">1.0</span>
            </div>
          </div>

          <div class="control-group">
            <div class="control-group-title">Seed Colors</div>
            <div class="editable-strip" id="editableStrip"></div>
          </div>

          <div class="control-group">
            <div class="action-row">
              <label class="toggle-label">
                <input type="checkbox" id="autoPreview" checked />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="toggle-text">Auto-preview</span>
              </label>
              <div class="action-btns">
                <button class="btn" id="btnSaveCurrent">Save</button>
                <button class="btn" id="btnImport">Import</button>
                <button class="btn btn-primary" id="btnExport">Export</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="control-group">
          <div class="control-group-title">Saved Palettes</div>
          <div id="savedList"></div>
        </div>

        <div class="control-group theme-details-wrapper">
          <div class="control-group-title">Theme Editor</div>
          <div class="details-tabs">
            <button class="details-tab active" data-tab="workbench">UI Colors</button>
            <button class="details-tab" data-tab="textMate">Syntax</button>
            <button class="details-tab" data-tab="semantic">Semantic</button>
          </div>
          <div class="search-box">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" id="themeSearch" placeholder="Search by label or key..." autocomplete="off" />
          </div>
          <div id="tabWorkbench" class="tab-content active">
            <div id="workbenchGroups"></div>
          </div>
          <div id="tabTextMate" class="tab-content">
            <div class="syntax-hint">TextMate token colors for syntax scopes</div>
            <div id="textMateGroups"></div>
          </div>
          <div id="tabSemantic" class="tab-content">
            <div class="syntax-hint">Semantic tokens for modern language highlighting</div>
            <div id="semanticGroups"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script nonce="${nonce}">${script}</script>
</body>
</html>`;
}
