/**
 * Webview Script
 * All client-side logic for the theme generator interface
 * Handles state, event listeners, and rendering
 */

export function getScript(): string {
    return `(function () {
    const vscode = acquireVsCodeApi();
    let currentHarmony = 'complementary';
    let currentPalette = null;
    let contrastLevel = 0.7;
    let saturationLevel = 0.7;
    let luminosityLevel = 0.5;
    let variationLevel = 0.15;
    let syntaxSaturation = 1.0;
    let colorMode = 'vibrant';
    let editingIndex = -1;
    let isPreviewActive = false;
    let autoPreview = true;
    let debounceTimer = null;
    let regenerateTimer = null;

    // Elements
    const baseColor = document.getElementById('baseColor');
    const baseColorText = document.getElementById('baseColorText');
    const editableStrip = document.getElementById('editableStrip');
    const paletteGrid = document.getElementById('paletteGrid');
    const savedList = document.getElementById('savedList');
    const toast = document.getElementById('toast');
    const saturationSlider = document.getElementById('saturationSlider');
    const luminositySlider = document.getElementById('luminositySlider');
    const variationSlider = document.getElementById('variationSlider');
    const syntaxSaturationSlider = document.getElementById('syntaxSaturationSlider');
    const saturationValue = document.getElementById('saturationValue');
    const luminosityValue = document.getElementById('luminosityValue');
    const variationValue = document.getElementById('variationValue');
    const syntaxSaturationValue = document.getElementById('syntaxSaturationValue');
    const resetWarning = document.getElementById('resetWarning');
    const autoPreviewCheckbox = document.getElementById('autoPreview');

    // Theme elements for detailed editing
    const themeElements = {
        editor: [
            { key: 'editor.background', name: 'Editor Background', desc: 'Main editor area' },
            { key: 'editor.foreground', name: 'Editor Text', desc: 'Default text color' },
            { key: 'editor.lineHighlightBackground', name: 'Current Line', desc: 'Active line highlight' },
            { key: 'editor.selectionBackground', name: 'Selection', desc: 'Selected text background' },
            { key: 'editor.findMatchBackground', name: 'Find Match', desc: 'Search result highlight' },
            { key: 'editorCursor.foreground', name: 'Cursor', desc: 'Text cursor color' },
            { key: 'editorLineNumber.foreground', name: 'Line Numbers', desc: 'Inactive line numbers' },
            { key: 'editorLineNumber.activeForeground', name: 'Active Line Number', desc: 'Current line number' },
            { key: 'editorIndentGuide.background', name: 'Indent Guides', desc: 'Indentation lines' },
            { key: 'editorIndentGuide.activeBackground', name: 'Active Indent', desc: 'Current indent line' },
            { key: 'editorRuler.foreground', name: 'Rulers', desc: 'Vertical ruler lines' },
            { key: 'editorWhitespace.foreground', name: 'Whitespace', desc: 'Space/tab dots' },
        ],
        borders: [
            { key: 'focusBorder', name: 'Focus Border', desc: 'Focused element outline' },
            { key: 'panel.border', name: 'Panel Border', desc: 'Panel separator line' },
            { key: 'sideBar.border', name: 'Sidebar Border', desc: 'Sidebar separator' },
            { key: 'editorGroup.border', name: 'Editor Group Border', desc: 'Split editor divider' },
            { key: 'tab.border', name: 'Tab Border', desc: 'Tab separator' },
            { key: 'titleBar.border', name: 'Title Bar Border', desc: 'Title bar bottom line' },
        ],
        ui: [
            { key: 'activityBar.background', name: 'Activity Bar BG', desc: 'Left sidebar background' },
            { key: 'activityBar.foreground', name: 'Activity Bar Icons', desc: 'Icon colors' },
            { key: 'activityBar.activeBorder', name: 'Activity Active', desc: 'Active icon indicator' },
            { key: 'sideBar.background', name: 'Sidebar BG', desc: 'File explorer background' },
            { key: 'sideBar.foreground', name: 'Sidebar Text', desc: 'File/folder names' },
            { key: 'sideBarSectionHeader.background', name: 'Section Headers', desc: 'Collapsible headers' },
            { key: 'statusBar.background', name: 'Status Bar BG', desc: 'Bottom bar background' },
            { key: 'statusBar.foreground', name: 'Status Bar Text', desc: 'Status bar text' },
            { key: 'titleBar.activeBackground', name: 'Title Bar BG', desc: 'Window title background' },
            { key: 'titleBar.activeForeground', name: 'Title Bar Text', desc: 'Window title text' },
            { key: 'panel.background', name: 'Panel BG', desc: 'Terminal/output background' },
            { key: 'tab.activeBackground', name: 'Active Tab BG', desc: 'Current tab background' },
            { key: 'tab.activeForeground', name: 'Active Tab Text', desc: 'Current tab text' },
            { key: 'tab.inactiveBackground', name: 'Inactive Tab BG', desc: 'Inactive tab background' },
            { key: 'tab.activeBorder', name: 'Tab Active Border', desc: 'Active tab indicator' },
        ],
        lists: [
            { key: 'list.activeSelectionBackground', name: 'Selection BG', desc: 'Selected item background' },
            { key: 'list.activeSelectionForeground', name: 'Selection Text', desc: 'Selected item text' },
            { key: 'list.hoverBackground', name: 'Hover BG', desc: 'Hovered item background' },
            { key: 'list.focusBackground', name: 'Focus BG', desc: 'Focused item background' },
            { key: 'list.inactiveSelectionBackground', name: 'Inactive Selection', desc: 'Unfocused selection' },
        ],
        inputs: [
            { key: 'input.background', name: 'Input BG', desc: 'Text input background' },
            { key: 'input.foreground', name: 'Input Text', desc: 'Text input color' },
            { key: 'input.border', name: 'Input Border', desc: 'Input field border' },
            { key: 'dropdown.background', name: 'Dropdown BG', desc: 'Select background' },
            { key: 'dropdown.foreground', name: 'Dropdown Text', desc: 'Select text' },
            { key: 'button.background', name: 'Button BG', desc: 'Primary button' },
            { key: 'button.foreground', name: 'Button Text', desc: 'Button text color' },
        ],
        terminal: [
            { key: 'terminal.background', name: 'Terminal BG', desc: 'Terminal background' },
            { key: 'terminal.foreground', name: 'Terminal Text', desc: 'Terminal text' },
            { key: 'terminal.ansiBlack', name: 'ANSI Black', desc: 'Black color' },
            { key: 'terminal.ansiRed', name: 'ANSI Red', desc: 'Red color' },
            { key: 'terminal.ansiGreen', name: 'ANSI Green', desc: 'Green color' },
            { key: 'terminal.ansiYellow', name: 'ANSI Yellow', desc: 'Yellow color' },
            { key: 'terminal.ansiBlue', name: 'ANSI Blue', desc: 'Blue color' },
            { key: 'terminal.ansiMagenta', name: 'ANSI Magenta', desc: 'Magenta color' },
            { key: 'terminal.ansiCyan', name: 'ANSI Cyan', desc: 'Cyan color' },
            { key: 'terminal.ansiWhite', name: 'ANSI White', desc: 'White color' },
        ],
        syntax: [
            { key: 'entity.name.function', name: 'Functions', desc: 'Function names' },
            { key: 'keyword.control', name: 'Keywords', desc: 'if, for, while, etc.' },
            { key: 'string.quoted', name: 'Strings', desc: 'Text in quotes' },
            { key: 'constant.numeric', name: 'Numbers', desc: 'Numeric literals' },
            { key: 'comment.line', name: 'Comments', desc: 'Code comments' },
        ]
    };

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    saturationSlider.addEventListener('input', () => {
        saturationLevel = parseFloat(saturationSlider.value);
        saturationValue.textContent = saturationLevel.toFixed(2);
        if (currentPalette) {
            regeneratePalette();
        }
    });

    luminositySlider.addEventListener('input', () => {
        luminosityLevel = parseFloat(luminositySlider.value);
        luminosityValue.textContent = luminosityLevel.toFixed(2);
        if (currentPalette) {
            regeneratePalette();
        }
    });

    variationSlider.addEventListener('input', () => {
        variationLevel = parseFloat(variationSlider.value);
        variationValue.textContent = variationLevel.toFixed(2);
        if (currentPalette) {
            regeneratePalette();
        }
    });

    syntaxSaturationSlider.addEventListener('input', () => {
        syntaxSaturation = parseFloat(syntaxSaturationSlider.value);
        syntaxSaturationValue.textContent = syntaxSaturation.toFixed(1);
        if (autoPreview && currentPalette) {
            autoApplyPreview();
        }
    });

    autoPreviewCheckbox.addEventListener('change', () => {
        autoPreview = autoPreviewCheckbox.checked;
        if (autoPreview && currentPalette) {
            autoApplyPreview();
        }
    });

    function regeneratePalette() {
        if (currentPalette) {
            if (regenerateTimer) {
                clearTimeout(regenerateTimer);
            }
            regenerateTimer = setTimeout(() => {
                vscode.postMessage({ 
                    command: 'generate', 
                    baseColor: baseColor.value, 
                    harmony: currentHarmony, 
                    contrastLevel,
                    saturation: saturationLevel,
                    luminosity: luminosityLevel,
                    variation: variationLevel,
                    syntaxSaturation
                });
                regenerateTimer = null;
            }, 200);
        }
    }

    function autoApplyPreview() {
        if (currentPalette && autoPreview) {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                vscode.postMessage({ 
                    command: 'previewTheme',
                    syntaxSaturation
                });
                isPreviewActive = true;
                resetWarning.classList.add('show');
                debounceTimer = null;
            }, 150);
        }
    }

    // Harmony selection
    document.querySelectorAll('.harmony-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.harmony-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentHarmony = opt.dataset.harmony;
            if (autoPreview) regeneratePalette();
        });
    });


    // Base color changes
    baseColor.addEventListener('input', () => {
        baseColorText.value = baseColor.value;
        if (autoPreview && currentPalette) {
            regeneratePalette();
        }
    });

    baseColorText.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(baseColorText.value)) {
            baseColor.value = baseColorText.value;
            if (autoPreview && currentPalette) {
                regeneratePalette();
            }
        }
    });

    // Button handlers
    document.getElementById('btnClearPreview').addEventListener('click', () => {
        vscode.postMessage({ command: 'clearPreview' });
        isPreviewActive = false;
        resetWarning.classList.remove('show');
        showToast('Theme reset to default');
    });
    
    document.getElementById('btnExport').addEventListener('click', () => {
        if (!currentPalette) return;
        vscode.postMessage({ command: 'exportTheme', themeName: currentPalette.name + ' Theme' });
    });

    document.getElementById('btnSaveCurrent').addEventListener('click', () => {
        if (!currentPalette) return;
        vscode.postMessage({ command: 'savePalette', name: currentPalette.name });
        showToast('Palette saved');
    });

    document.getElementById('btnRandomPalette').addEventListener('click', () => {
        vscode.postMessage({ 
            command: 'random', 
            harmony: currentHarmony, 
            contrastLevel,
            saturation: saturationLevel,
            luminosity: luminosityLevel,
            variation: variationLevel,
            syntaxSaturation
        });
    });

    // Initialize theme details
    initThemeDetails();

    function initThemeDetails() {
        const containers = {
            editorElements: themeElements.editor,
            bordersElements: themeElements.borders,
            uiElements: themeElements.ui,
            listsElements: themeElements.lists,
            inputsElements: themeElements.inputs,
            terminalElements: themeElements.terminal,
            syntaxElements: themeElements.syntax
        };

        Object.entries(containers).forEach(([containerId, elements]) => {
            const container = document.getElementById(containerId);
            elements.forEach(element => {
                const div = document.createElement('div');
                div.className = 'theme-element';
                div.innerHTML =
                    '<div class="theme-color-preview" style="background:#4a90d9" data-key="' + element.key + '"></div>' +
                    '<div class="theme-element-info">' +
                        '<div class="theme-element-name">' + element.name + '</div>' +
                        '<div class="theme-element-desc">' + element.desc + '</div>' +
                    '</div>';
                
                const colorPreview = div.querySelector('.theme-color-preview');
                colorPreview.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = rgbToHex(colorPreview.style.backgroundColor) || '#4a90d9';
                    input.addEventListener('change', () => {
                        colorPreview.style.background = input.value;
                        if (autoPreview && currentPalette) {
                            vscode.postMessage({ command: 'updateThemeElement', key: element.key, color: input.value });
                        }
                        showToast('Updated ' + element.name);
                    });
                    input.click();
                });
                
                container.appendChild(div);
            });
        });
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
        const parts = rgb.match(/\\d+/g);
        if (!parts || parts.length < 3) return '#4a90d9';
        return '#' + parts.slice(0, 3).map(n => {
            const hex = parseInt(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function updateThemeDetailsFromPalette(palette) {
        if (!palette || !palette.colors) return;
        
        const base = palette.colors[0]?.hex || '#1e1e1e';
        const accent = palette.colors[1]?.hex || '#007acc';
        const secondary = palette.colors[2]?.hex || '#4ec9b0';
        const tertiary = palette.colors[3]?.hex || '#ce9178';
        
        const colorMap = {
            'editor.background': base,
            'editor.foreground': getContrastColor(base, 0.8),
            'editor.lineHighlightBackground': adjustBrightness(base, 5),
            'editor.selectionBackground': accent + '44',
            'editor.findMatchBackground': accent + '66',
            'editorCursor.foreground': accent,
            'editorLineNumber.foreground': adjustBrightness(getContrastColor(base, 0.8), -30),
            'editorLineNumber.activeForeground': getContrastColor(base, 0.8),
            'editorIndentGuide.background': adjustBrightness(base, 15),
            'editorIndentGuide.activeBackground': adjustBrightness(base, 25),
            'editorRuler.foreground': adjustBrightness(base, 15),
            'editorWhitespace.foreground': adjustBrightness(base, 10),
            'focusBorder': accent,
            'panel.border': adjustBrightness(base, 10),
            'sideBar.border': adjustBrightness(base, 10),
            'editorGroup.border': adjustBrightness(base, 10),
            'tab.border': adjustBrightness(base, 10),
            'titleBar.border': adjustBrightness(base, 10),
            'activityBar.background': adjustBrightness(base, -10),
            'activityBar.foreground': getContrastColor(adjustBrightness(base, -10), 0.8),
            'activityBar.activeBorder': accent,
            'sideBar.background': adjustBrightness(base, -5),
            'sideBar.foreground': getContrastColor(adjustBrightness(base, -5), 0.8),
            'sideBarSectionHeader.background': adjustBrightness(base, 3),
            'statusBar.background': accent,
            'statusBar.foreground': getContrastColor(accent, 0.8),
            'titleBar.activeBackground': adjustBrightness(base, -8),
            'titleBar.activeForeground': getContrastColor(adjustBrightness(base, -8), 0.8),
            'panel.background': base,
            'tab.activeBackground': base,
            'tab.activeForeground': getContrastColor(base, 0.8),
            'tab.inactiveBackground': adjustBrightness(base, -5),
            'tab.activeBorder': accent,
            'list.activeSelectionBackground': accent + '44',
            'list.activeSelectionForeground': getContrastColor(base, 0.8),
            'list.hoverBackground': adjustBrightness(base, 5),
            'list.focusBackground': accent + '33',
            'list.inactiveSelectionBackground': accent + '22',
            'input.background': adjustBrightness(base, 5),
            'input.foreground': getContrastColor(base, 0.8),
            'input.border': accent + '66',
            'dropdown.background': adjustBrightness(base, 8),
            'dropdown.foreground': getContrastColor(base, 0.8),
            'button.background': accent,
            'button.foreground': getContrastColor(accent, 0.8),
            'terminal.background': base,
            'terminal.foreground': getContrastColor(base, 0.8),
            'terminal.ansiBlack': '#000000',
            'terminal.ansiRed': '#cd3131',
            'terminal.ansiGreen': '#0dbc79',
            'terminal.ansiYellow': '#e5e510',
            'terminal.ansiBlue': '#2472c8',
            'terminal.ansiMagenta': '#bc3fbc',
            'terminal.ansiCyan': '#11a8cd',
            'terminal.ansiWhite': '#e5e5e5',
            'entity.name.function': accent,
            'keyword.control': secondary,
            'string.quoted': tertiary,
            'constant.numeric': tertiary,
            'comment.line': adjustBrightness(getContrastColor(base, 0.8), -30)
        };

        Object.keys(colorMap).forEach(key => {
            const preview = document.querySelector('[data-key="' + key + '"]');
            if (preview) {
                preview.style.background = colorMap[key];
            }
        });
    }

    function renderPalette(palette) {
        currentPalette = palette;
        const colors = palette.colors;

        baseColor.value = palette.baseColor.hex;
        baseColorText.value = palette.baseColor.hex;

        editableStrip.innerHTML = '';
        colors.forEach((c, index) => {
            const div = document.createElement('div');
            div.className = 'strip-color';
            div.style.background = c.hex;
            div.innerHTML = '<span class="strip-color-info">' + c.hex + '</span>';
            div.addEventListener('click', () => editStripColor(index, c.hex));
            editableStrip.appendChild(div);
        });

        paletteGrid.innerHTML = '';
        colors.forEach((c, index) => {
            const contrast = getContrastColor(c.hex, contrastLevel);
            const card = document.createElement('div');
            card.className = 'color-card editable';
            card.innerHTML =
                '<div class="color-swatch" style="background:' + c.hex + '">' +
                    '<span class="copy-hint" style="color:' + contrast + '">Click to copy</span>' +
                '</div>' +
                '<div class="color-meta">' +
                    '<div class="hex">' + c.hex + '</div>' +
                    '<div class="name" style="color:' + adjustOpacity(contrast, 0.7) + '">' + (c.name || 'Color ' + (index + 1)) + '</div>' +
                '</div>';
            
            const colorSwatch = card.querySelector('.color-swatch');
            
            // Copy on click in the swatch
            colorSwatch.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(c.hex).catch(() => {});
                showToast('Copied ' + c.hex);
            });
            
            // Edit on click in the meta area or anywhere else on card
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!e.target.closest('.copy-hint')) {
                    editColor(index, c.hex);
                }
            });
            
            paletteGrid.appendChild(card);
        });

        updateThemeDetailsFromPalette(palette);

        if (autoPreview) {
            autoApplyPreview();
        }
    }

    function luminance(hex) {
        const r = parseInt(hex.slice(1,3),16)/255;
        const g = parseInt(hex.slice(3,5),16)/255;
        const b = parseInt(hex.slice(5,7),16)/255;
        const rLin = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gLin = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bLin = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    }

    function contrastRatio(color1, color2) {
        const l1 = luminance(color1);
        const l2 = luminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function getContrastColor(bgColor, level = contrastLevel) {
        const bgLum = luminance(bgColor);
        const targetRatio = level === 'aa' ? 4.5 : level === 'aaa' ? 7 : level * 10;
        let textColor = '#ffffff';
        if (contrastRatio(bgColor, textColor) >= targetRatio) {
            return textColor;
        }
        textColor = '#000000';
        if (contrastRatio(bgColor, textColor) >= targetRatio) {
            return textColor;
        }
        if (bgLum > 0.5) {
            const lightness = Math.max(0.05, 1 - (targetRatio * (bgLum + 0.05) - 0.05));
            return hslToHex(0, 0, Math.min(0.95, lightness));
        } else {
            const lightness = Math.min(0.95, (targetRatio * (bgLum + 0.05) - 0.05));
            return hslToHex(0, 0, Math.max(0.05, lightness));
        }
    }

    function hslToHex(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;
        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    function editColor(index, currentColor) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentColor;
        input.addEventListener('change', (e) => {
            vscode.postMessage({ command: 'editColor', index, newColor: e.target.value, autoPreview });
        });
        input.click();
    }

    function adjustBrightness(hex, amount) {
        let r = parseInt(hex.slice(1,3),16);
        let g = parseInt(hex.slice(3,5),16);
        let b = parseInt(hex.slice(5,7),16);
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    }

    function adjustOpacity(hex, opacity) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    }

    function renderSaved(palettes) {
        savedList.innerHTML = '';
        if (!palettes || palettes.length === 0) {
            savedList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">No saved palettes yet</div>';
            return;
        }
        palettes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'saved-card';
            let strip = '';
            p.colors.forEach(cl => {
                strip += '<div style="background:' + cl.hex + '"></div>';
            });
            card.innerHTML =
                '<div class="saved-card-header">' +
                    '<span class="saved-card-name">' + p.name + '</span>' +
                    '<span class="saved-card-meta">' + p.harmony + '</span>' +
                '</div>' +
                '<div class="saved-card-strip">' + strip + '</div>' +
                '<div class="saved-card-actions">' +
                    '<button class="btn load-btn">Load</button>' +
                    '<button class="btn btn-danger del-btn">Delete</button>' +
                '</div>';
            card.querySelector('.load-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                vscode.postMessage({ command: 'loadPalette', id: p.id });
                showToast('Loaded: ' + p.name);
            });
            card.querySelector('.del-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                vscode.postMessage({ command: 'deletePalette', id: p.id });
                showToast('Deleted: ' + p.name);
            });
            savedList.appendChild(card);
        });
    }

    window.addEventListener('message', e => {
        const msg = e.data;
        switch (msg.command) {
            case 'updatePalette':
                renderPalette(msg.palette);
                break;
            case 'savedPalettes':
                renderSaved(msg.palettes);
                break;
        }
    });

    vscode.postMessage({ command: 'getSavedPalettes' });

    function editStripColor(index, currentColor) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentColor;
        input.addEventListener('change', () => {
            vscode.postMessage({ command: 'editColor', index, newColor: input.value, autoPreview });
            showToast('Updated color ' + (index + 1));
        });
        input.click();
    }
})();`;
}
