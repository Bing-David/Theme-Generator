export function getStyles(): string {
  return `
:root {
    --bg-primary: #0d1117;
    --bg-secondary: #161b22;
    --bg-tertiary: #1c2333;
    --bg-card: #21283b;
    --bg-hover: #2a3346;
    --border: #30363d;
    --border-active: #58a6ff;
    --text-primary: #e6edf3;
    --text-secondary: #8b949e;
    --text-muted: #484f58;
    --accent: #58a6ff;
    --accent-hover: #79c0ff;
    --success: #3fb950;
    --warning: #d29922;
    --danger: #f85149;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --shadow: 0 2px 8px rgba(0,0,0,0.3);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
    --transition: 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
    height: 100vh;
    font-size: 13px;
    line-height: 1.5;
}

.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 48px;
    flex-shrink: 0;
    gap: 16px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.header-logo {
    color: var(--accent);
    display: flex;
    align-items: center;
}

.header-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-primary);
    text-transform: uppercase;
}

/* ── Palette Info Bar (in header) ────────────────────────────────────── */
.palette-info-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    flex: 1;
    max-width: 340px;
}

.palette-info-left {
    display: flex;
    align-items: center;
    gap: 7px;
}

.palette-info-sep {
    color: var(--text-muted);
    font-size: 10px;
}

.palette-info-right {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
}

.palette-info-swatch {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid var(--border);
    transition: background var(--transition);
    flex-shrink: 0;
}

.palette-info-hex {
    font-size: 11px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    color: var(--text-primary);
    letter-spacing: 0.5px;
}

.palette-info-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.palette-info-harmony {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
}

/* ── Layout ──────────────────────────────────────────────────────────── */
.main-content {
    display: grid;
    grid-template-columns: 1fr 340px;
    flex: 1;
    overflow: hidden;
}

.center-panel {
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.right-panel {
    background: var(--bg-secondary);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    padding: 14px;
}

.palette-display {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* ── Control Groups ──────────────────────────────────────────────────── */
.control-group {
    margin-bottom: 18px;
}

.control-group-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: var(--text-muted);
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border);
}

/* ── Harmony Grid ────────────────────────────────────────────────────── */
.harmony-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
}

.harmony-option {
    padding: 7px 6px;
    font-size: 9px;
    font-weight: 500;
    text-align: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition);
    color: var(--text-secondary);
    user-select: none;
}

.harmony-option:hover {
    border-color: var(--text-muted);
    color: var(--text-primary);
    background: var(--bg-hover);
}

.harmony-option.active {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(88, 166, 255, 0.1);
    font-weight: 600;
}

/* ── Color Input ─────────────────────────────────────────────────────── */
.color-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

input[type="color"] {
    -webkit-appearance: none;
    width: 38px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
    padding: 2px;
    flex-shrink: 0;
    transition: border-color var(--transition);
}

input[type="color"]:hover { border-color: var(--border-active); }
input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
input[type="color"]::-webkit-color-swatch { border: none; border-radius: 3px; }

input[type="text"], select {
    flex: 1;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 7px 10px;
    font-size: 12px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    transition: border-color var(--transition);
    outline: none;
}

input[type="text"]:focus, select:focus {
    border-color: var(--accent);
    background: var(--bg-card);
}

/* ── Sliders ─────────────────────────────────────────────────────────── */
.slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.slider-row label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 64px;
}

.slider-row input[type="range"] {
    flex: 1;
    height: 3px;
    background: var(--bg-hover);
    border-radius: 2px;
    outline: none;
    border: none;
    cursor: pointer;
    -webkit-appearance: none;
    accent-color: var(--accent);
}

.slider-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--bg-primary);
    box-shadow: 0 0 0 1px var(--accent);
    transition: transform var(--transition);
}

.slider-row input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

.slider-val {
    font-size: 10px;
    font-family: monospace;
    color: var(--text-muted);
    min-width: 28px;
    text-align: right;
}

/* ── Color Strip ─────────────────────────────────────────────────────── */
.editable-strip {
    display: flex;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow);
    margin-bottom: 18px;
    border: 1px solid transparent;
    transition: border-color var(--transition), box-shadow var(--transition);
    flex-shrink: 0;
}

.editable-strip:hover {
    border-color: var(--border-active);
    box-shadow: 0 0 0 1px var(--accent)33, var(--shadow);
}

.strip-color {
    flex: 1;
    position: relative;
    cursor: pointer;
    transition: flex var(--transition);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
}

.strip-color:hover {
    flex: 1.5;
}

.strip-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--transition);
    pointer-events: none;
    text-align: center;
    width: 100%;
    padding: 0 4px;
}

.strip-color:hover .strip-label {
    opacity: 1;
}

.strip-hex {
    display: block;
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    white-space: nowrap;
    letter-spacing: 0.3px;
}

.strip-name {
    display: block;
    font-size: 7px;
    opacity: 0.7;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
}

/* ── Action Row ──────────────────────────────────────────────────────── */
.action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.base-lock-row {
    margin-top: 10px;
    justify-content: flex-start;
}

.action-btns {
    display: flex;
    gap: 6px;
}

/* ── Toggle Switch ───────────────────────────────────────────────────── */
.toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.toggle-label input[type="checkbox"] {
    display: none;
}

.toggle-track {
    width: 32px;
    height: 18px;
    background: var(--bg-hover);
    border-radius: 9px;
    border: 1px solid var(--border);
    position: relative;
    transition: background var(--transition), border-color var(--transition);
}

.toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: var(--text-muted);
    border-radius: 50%;
    transition: transform var(--transition), background var(--transition);
}

.toggle-label input:checked ~ .toggle-track {
    background: rgba(88,166,255,0.2);
    border-color: var(--accent);
}

.toggle-label input:checked ~ .toggle-track .toggle-thumb {
    transform: translateX(14px);
    background: var(--accent);
}

.toggle-text {
    font-size: 11px;
    color: var(--text-secondary);
}

/* ── Buttons ─────────────────────────────────────────────────────────── */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transition: all var(--transition);
    white-space: nowrap;
    outline: none;
    user-select: none;
}

.btn:hover {
    background: var(--bg-hover);
    border-color: var(--text-muted);
}

.btn:active { transform: scale(0.97); }

.btn-primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #0d1117;
    font-weight: 600;
}

.btn-primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
}

.btn-success {
    background: var(--success);
    border-color: var(--success);
    color: #0d1117;
}

.btn-danger {
    background: transparent;
    border-color: var(--danger);
    color: var(--danger);
}

.btn-danger:hover {
    background: var(--danger);
    color: #fff;
}

.btn-icon {
    padding: 6px 10px;
}

.btn-sm {
    padding: 4px 9px;
    font-size: 10px;
}

.btn-block { width: 100%; }

/* ── Reset Warning ───────────────────────────────────────────────────── */
.reset-warning {
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: rgba(210, 153, 34, 0.08);
    border: 1px solid rgba(210, 153, 34, 0.4);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    margin-bottom: 14px;
}

.reset-warning.show { display: flex; }

.reset-warning-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--warning);
}

/* ── Saved Palettes ──────────────────────────────────────────────────── */
.saved-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    transition: border-color var(--transition);
    margin-bottom: 8px;
}

.saved-card:hover { border-color: var(--accent); }

.saved-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.saved-card-name { font-size: 12px; font-weight: 600; }
.saved-card-meta { font-size: 10px; color: var(--text-muted); }

.saved-card-path {
    font-size: 9px;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.6;
}

.saved-card-strip {
    display: flex;
    height: 24px;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.saved-card-strip div { flex: 1; }

.saved-card-actions {
    display: flex;
    gap: 4px;
}

.saved-card-actions .btn {
    padding: 3px 8px;
    font-size: 10px;
    flex: 1;
}

/* ── Details Tabs ────────────────────────────────────────────────────── */
.details-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 10px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    padding: 3px;
    border: 1px solid var(--border);
}

.details-tab {
    flex: 1;
    padding: 5px 8px;
    font-size: 11px;
    font-weight: 500;
    background: transparent;
    border: none;
    border-radius: 5px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition);
    outline: none;
}

.details-tab:hover { color: var(--text-primary); }

.details-tab.active {
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: var(--shadow);
}

.tab-content { display: none; }
.tab-content.active { display: block; }

/* ── Search Box ──────────────────────────────────────────────────────── */
.search-box {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    margin-bottom: 12px;
    transition: border-color var(--transition);
}

.search-box:focus-within { border-color: var(--accent); }

.search-box svg { color: var(--text-muted); flex-shrink: 0; }

.search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 11px;
    outline: none;
    padding: 0;
    font-family: inherit;
}

.search-box input::placeholder { color: var(--text-muted); }

/* ── Theme Details ───────────────────────────────────────────────────── */
.theme-details-wrapper {
    position: relative;
}

.theme-details-overlay {
    position: absolute;
    inset: 0;
    background: rgba(13,17,23,0.85);
    backdrop-filter: blur(2px);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    transition: opacity var(--transition);
}

.theme-details-overlay.hidden { display: none; }

.theme-details-overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
    padding: 24px;
}

.theme-details-group {
    margin-bottom: 14px;
}

.theme-details-subtitle {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    margin-bottom: 6px;
    padding: 3px 0;
}

/* ── Theme Element Row ───────────────────────────────────────────────── */
.theme-element {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(48,54,61,0.5);
}

.theme-element:last-child { border-bottom: none; }

.theme-color-preview {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border);
    cursor: pointer;
    transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
    flex-shrink: 0;
    position: relative;
}

.theme-color-preview:hover {
    transform: scale(1.15);
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(88,166,255,0.25);
}

.theme-element-info { flex: 1; min-width: 0; }

.theme-element-name {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.theme-element-desc {
    font-size: 10px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.theme-element-key {
    font-size: 9px;
    color: var(--accent);
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.85;
}

.theme-element-hex {
    font-size: 9px;
    font-family: monospace;
    color: var(--text-muted);
    flex-shrink: 0;
    letter-spacing: 0.3px;
    min-width: 46px;
    text-align: right;
}

/* ── Syntax Hint ─────────────────────────────────────────────────────── */
.syntax-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    background: rgba(88, 166, 255, 0.06);
    border: 1px solid rgba(88, 166, 255, 0.18);
    border-radius: var(--radius-sm);
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 12px;
}

.syntax-hint code {
    font-family: monospace;
    color: var(--accent);
    font-size: 9px;
}

/* ── Scrollbar ───────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ── Toast ───────────────────────────────────────────────────────────── */
.toast {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-size: 11px;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    box-shadow: var(--shadow-lg);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    z-index: 100;
    white-space: nowrap;
    pointer-events: none;
}

.toast.show { transform: translateX(-50%) translateY(0); }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .main-content { grid-template-columns: 1fr 280px; }
    .palette-info-bar { display: none; }
}

@media (max-width: 680px) {
    .main-content {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 300px;
    }
    .right-panel {
        border-left: none;
        border-top: 1px solid var(--border);
    }
}
`;
}
