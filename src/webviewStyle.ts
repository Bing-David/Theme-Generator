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
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
    height: 100vh;
}

.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    gap: 0;
}

.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 56px;
    flex-shrink: 0;
    z-index: 10;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 380px;
    flex: 1;
    overflow: hidden;
    gap: 0;
}

.center-panel {
    flex: 1;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.right-panel {
    background: var(--bg-secondary);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    padding: 16px;
}

.control-group {
    margin-bottom: 20px;
}

.control-group-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
}

.theme-details-group {
    margin-bottom: 16px;
}

.theme-details-subtitle {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    opacity: 0.8;
}

.color-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.checkbox-row {
    margin-top: 8px;
    margin-bottom: 16px;
}

.checkbox-row label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-primary);
    cursor: pointer;
}

.checkbox-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.palette-display {
    padding: 24px;
    overflow-y: auto;
}

.editable-strip {
    display: flex;
    height: 90px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
    border: 2px solid transparent;
    transition: border-color var(--transition);
}

.editable-strip:hover {
    border-color: var(--border-active);
}

.strip-color {
    flex: 1;
    position: relative;
    cursor: pointer;
    transition: all var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
}

.strip-color:hover {
    transform: scale(1.05);
    z-index: 2;
    box-shadow: 0 0 0 2px var(--accent);
}

.strip-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px;
    opacity: 0;
    transition: opacity var(--transition);
    pointer-events: none;
    text-align: center;
    width: 100%;
}

.strip-color:hover .strip-label {
    opacity: 1;
}

.strip-hex {
    display: block;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    white-space: nowrap;
}

.strip-name {
    display: block;
    font-size: 7px;
    opacity: 0.75;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
}

.theme-element {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
}

.theme-element:last-child {
    border-bottom: none;
}

.theme-color-preview {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border);
    cursor: pointer;
    transition: transform var(--transition);
    flex-shrink: 0;
}

.theme-color-preview:hover {
    transform: scale(1.15);
    border-color: var(--accent);
}

.theme-element-info {
    flex: 1;
}

.theme-element-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
}

.theme-element-desc {
    font-size: 10px;
    color: var(--text-secondary);
}

.quick-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.reset-warning {
    background: var(--bg-tertiary);
    border: 1px solid var(--warning);
    border-radius: var(--radius-md);
    padding: 12px;
    margin-bottom: 16px;
    display: none;
}

.reset-warning.show {
    display: block;
}

.reset-warning-text {
    font-size: 11px;
    color: var(--warning);
    margin-bottom: 8px;
}

@media (max-width: 1100px) {
    .main-content {
        grid-template-columns: 1fr 300px;
    }
}

@media (max-width: 800px) {
    .main-content {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
    }
    
    .right-panel {
        border-left: none;
        border-top: 1px solid var(--border);
        max-height: 300px;
    }
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-logo {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--accent);
}

.header-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.header-actions {
    display: flex;
    gap: 6px;
}

input[type="color"] {
    -webkit-appearance: none;
    width: 40px;
    height: 36px;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
    padding: 2px;
}

input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
}

input[type="text"], select {
    flex: 1;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    font-size: 12px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    transition: border-color var(--transition);
}

input[type="text"]:focus, select:focus {
    outline: none;
    border-color: var(--accent);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transition: all var(--transition);
    white-space: nowrap;
}

.btn:hover {
    background: var(--bg-hover);
    border-color: var(--text-muted);
}

.btn-primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
}

.btn-primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
}

.btn-success {
    background: var(--success);
    border-color: var(--success);
    color: #fff;
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
    width: 34px;
    height: 34px;
    padding: 0;
    font-size: 16px;
}

.btn-block {
    width: 100%;
}

.palette-strip {
    display: flex;
    border-radius: var(--radius-md);
    overflow: hidden;
    height: 52px;
    box-shadow: var(--shadow);
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color var(--transition);
}

.palette-strip:hover {
    border-color: var(--border-active);
}

.palette-strip-color {
    flex: 1;
    position: relative;
    transition: flex var(--transition);
}

.palette-strip-color:hover {
    flex: 1.5;
}

.palette-strip-color .tooltip {
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 10px;
    font-family: monospace;
    padding: 3px 8px;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition);
    white-space: nowrap;
    z-index: 20;
    border: 1px solid var(--border);
}

.palette-strip-color:hover .tooltip {
    opacity: 1;
}

.center {
    background: var(--bg-primary);
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}


.saved-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color var(--transition);
    cursor: pointer;
}

.saved-card:hover {
    border-color: var(--accent);
}

.saved-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.saved-card-name {
    font-size: 12px;
    font-weight: 600;
}

.saved-card-meta {
    font-size: 10px;
    color: var(--text-muted);
}

.saved-card-path {
    font-size: 9px;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 6px;
    opacity: 0.6;
    margin-top: -2px;
}

.saved-card-strip {
    display: flex;
    height: 28px;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.saved-card-strip div {
    flex: 1;
}

.saved-card-actions {
    display: flex;
    gap: 4px;
}

.saved-card-actions .btn {
    padding: 4px 8px;
    font-size: 10px;
}

.custom-colors-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.custom-chip {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border);
    cursor: pointer;
    position: relative;
    transition: transform var(--transition);
}

.custom-chip:hover {
    transform: scale(1.1);
}

.custom-chip .remove-chip {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 14px;
    height: 14px;
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: 50%;
    font-size: 8px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.custom-chip:hover .remove-chip {
    display: flex;
}

.harmony-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
}

.harmony-option {
    padding: 8px;
    font-size: 11px;
    text-align: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition);
    color: var(--text-secondary);
}

.harmony-option:hover {
    border-color: var(--text-muted);
    color: var(--text-primary);
}

.harmony-option.active {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(88, 166, 255, 0.08);
}

.slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.slider-row label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 70px;
}

.slider-row input[type="range"] {
    flex: 1;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    outline: none;
    border: none;
    cursor: pointer;
}

.slider-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
}

.slider-row span {
    font-size: 10px;
    font-family: monospace;
    color: var(--text-muted);
    min-width: 24px;
    text-align: center;
}

.color-mode-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    margin-bottom: 8px;
}

.color-mode-row label {
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 40px;
}

.mode-toggle {
    display: flex;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border);
}

.mode-btn {
    padding: 6px 12px;
    font-size: 10px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition);
}

.mode-btn:hover {
    color: var(--text-primary);
}

.mode-btn.active {
    background: var(--accent);
    color: #fff;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 10px 20px;
    border-radius: var(--radius-md);
    font-size: 12px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    transition: transform 0.3s ease;
    z-index: 100;
}

.toast.show {
    transform: translateX(-50%) translateY(0);
}

/* Palette Info Bar */
.palette-info-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    height: 36px;
    flex-shrink: 0;
    gap: 12px;
}
.palette-info-left {
    display: flex;
    align-items: center;
    gap: 8px;
}
.palette-info-right {
    display: flex;
    align-items: center;
    gap: 6px;
}
.palette-info-swatch {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid var(--border);
    transition: background var(--transition);
    flex-shrink: 0;
}
.palette-info-hex {
    font-size: 11px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
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
    text-transform: capitalize;
}

/* Rich toast for random events */
.toast-rich {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 10px 16px;
    border-radius: var(--radius-md);
    font-size: 12px;
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    box-shadow: var(--shadow-lg);
    transition: transform 0.3s ease;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 200px;
}
.toast-rich.show { transform: translateX(-50%) translateY(0); }
.toast-rich-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid var(--border);
    flex-shrink: 0;
}
.toast-rich-content { display: flex; flex-direction: column; gap: 2px; }
.toast-rich-title { font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.toast-rich-sub { font-size: 10px; color: var(--text-secondary); text-transform: capitalize; }

/* Random button shimmer */
#btnRandomPalette { position: relative; overflow: hidden; }
#btnRandomPalette::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transition: left 0.4s ease;
}
#btnRandomPalette:hover::before { left: 100%; }

/* Theme Details disabled overlay */
.theme-details-wrapper {
    position: relative;
    overflow: hidden;
}

.theme-details-overlay {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--bg-primary) 85%, transparent);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.25s ease;
    border-radius: var(--radius-md);
}

.theme-details-overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.theme-details-overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
    padding: 16px;
}

.theme-details-overlay-icon {
    font-size: 24px;
    display: block;
    margin-bottom: 4px;
    opacity: 0.6;
}

/* Random button harmony-changed indicator */
@keyframes harmonyPulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent); }
    50%       { box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 0%, transparent); }
}

#btnRandomPalette.harmony-changed {
    animation: harmonyPulse 1.4s ease-in-out infinite;
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
}

/* Search Box */
.search-box {
    position: relative;
    margin-bottom: 12px;
    margin-top: 8px;
}

.search-box input {
    width: 100%;
    padding: 8px 12px;
    padding-right: 32px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
    transition: border-color var(--transition);
}

.search-box input::placeholder {
    color: var(--text-muted);
}

.search-box input:focus {
    border-color: var(--accent);
}

.search-box .search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 12px;
    pointer-events: none;
    opacity: 0.6;
}
    `;
}
