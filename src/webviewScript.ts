export function getScript(): string {
  return `(function () {
    const vscode = acquireVsCodeApi();
    
    let currentHarmony = 'complementary';
    let currentPalette = null;
    let saturationLevel = 0.7;
    let luminosityLevel = 0.5;
    let variationLevel = 0.15;
    let syntaxSaturation = 1.0;
    let autoPreview = true;
    let isPreviewActive = false;
    
    let debounceTimer = null;
    let regenerateTimer = null;
    
    const elements = {
        baseColor: document.getElementById('baseColor'),
        baseColorText: document.getElementById('baseColorText'),
        editableStrip: document.getElementById('editableStrip'),
        savedList: document.getElementById('savedList'),
        toast: document.getElementById('toast'),
        saturationSlider: document.getElementById('saturationSlider'),
        luminositySlider: document.getElementById('luminositySlider'),
        variationSlider: document.getElementById('variationSlider'),
        syntaxSaturationSlider: document.getElementById('syntaxSaturationSlider'),
        saturationValue: document.getElementById('saturationValue'),
        luminosityValue: document.getElementById('luminosityValue'),
        variationValue: document.getElementById('variationValue'),
        syntaxSaturationValue: document.getElementById('syntaxSaturationValue'),
        resetWarning: document.getElementById('resetWarning'),
        autoPreview: document.getElementById('autoPreview'),
        themeSearch: document.getElementById('themeSearch'),
        paletteInfoSwatch: document.getElementById('paletteInfoSwatch'),
        paletteInfoHex: document.getElementById('paletteInfoHex'),
        paletteInfoHarmony: document.getElementById('paletteInfoHarmony'),
        themeDetailsOverlay: document.getElementById('themeDetailsOverlay'),
        globalColorInput: (function() {
            const input = document.createElement('input');
            input.type = 'color';
            input.style.display = 'none';
            document.body.appendChild(input);
            return input;
        })()
    };

    const themeElements = {
        workbench: {
            editor: [
                { key: 'editor.background', name: 'Background', desc: 'Main background' },
                { key: 'editor.foreground', name: 'Foreground', desc: 'Default text' },
                { key: 'editor.lineHighlightBackground', name: 'Line Highlight', desc: 'Current line' },
                { key: 'editor.selectionBackground', name: 'Selection', desc: 'Selected text' },
                { key: 'editorCursor.foreground', name: 'Cursor', desc: 'Text cursor' },
                { key: 'editorLineNumber.foreground', name: 'Line Numbers', desc: 'Inactive' },
                { key: 'editorLineNumber.activeForeground', name: 'Active Number', desc: 'Current' },
            ],
            errors: [
                { key: 'errorForeground', name: 'Error', desc: 'General error' },
                { key: 'editorError.foreground', name: 'Editor Error', desc: 'Squiggles' },
                { key: 'editorWarning.foreground', name: 'Editor Warning', desc: 'Squiggles' },
                { key: 'editorInfo.foreground', name: 'Editor Info', desc: 'Squiggles' },
            ],
            sidebar: [
                { key: 'sideBar.background', name: 'Background', desc: 'Sidebar BG' },
                { key: 'sideBar.foreground', name: 'Foreground', desc: 'Sidebar text' },
                { key: 'sideBarSectionHeader.background', name: 'Section BG', desc: 'Header BG' },
                { key: 'sideBarTitle.foreground', name: 'Title', desc: 'Sidebar title' },
            ],
            activityBar: [
                { key: 'activityBar.background', name: 'Background', desc: 'Left bar BG' },
                { key: 'activityBar.foreground', name: 'Foreground', desc: 'Active icon' },
                { key: 'activityBar.inactiveForeground', name: 'Inactive Icons', desc: 'Other icons' },
                { key: 'activityBar.activeBorder', name: 'Active Border', desc: 'Active indicator' },
            ],
            titleBar: [
                { key: 'titleBar.activeBackground', name: 'Active BG', desc: 'Window title' },
                { key: 'titleBar.activeForeground', name: 'Active FG', desc: 'Window text' },
            ],
            statusBar: [
                { key: 'statusBar.background', name: 'Background', desc: 'Bottom bar' },
                { key: 'statusBar.foreground', name: 'Foreground', desc: 'Status text' },
                { key: 'statusBar.noFolderBackground', name: 'No Folder BG', desc: 'Empty workspace' },
            ],
            tabs: [
                { key: 'tab.activeBackground', name: 'Active BG', desc: 'Current tab' },
                { key: 'tab.activeForeground', name: 'Active FG', desc: 'Current text' },
                { key: 'tab.inactiveBackground', name: 'Inactive BG', desc: 'Inactive tab' },
                { key: 'editorGroupHeader.tabsBackground', name: 'Header BG', desc: 'Tabs container' },
            ],
            terminal: [
                { key: 'terminal.background', name: 'Background', desc: 'Terminal BG' },
                { key: 'terminal.foreground', name: 'Foreground', desc: 'Terminal text' },
                { key: 'terminal.ansiBlack', name: 'ANSI Black', desc: 'Terminal black' },
                { key: 'terminal.ansiRed', name: 'ANSI Red', desc: 'Terminal red' },
            ],
            panel: [
                { key: 'panel.background', name: 'Background', desc: 'Bottom panel BG' },
                { key: 'panelTitle.activeForeground', name: 'Active Title', desc: 'Panel title' },
            ],
            lists: [
                { key: 'list.activeSelectionBackground', name: 'Active Select', desc: 'List selection' },
                { key: 'list.hoverBackground', name: 'Hover BG', desc: 'List hover' },
                { key: 'list.inactiveSelectionBackground', name: 'Inactive Select', desc: 'Focus loss' },
            ],
            widgets: [
                { key: 'editorWidget.background', name: 'Background', desc: 'Popups & widgets' },
                { key: 'editorSuggestWidget.background', name: 'Suggest BG', desc: 'Intellisense' },
            ],
            forms: [
                { key: 'input.background', name: 'Background', desc: 'Input BG' },
                { key: 'input.foreground', name: 'Foreground', desc: 'Input text' },
                { key: 'button.background', name: 'Btn BG', desc: 'Button background' },
            ],
            quickInput: [
                { key: 'quickInput.background', name: 'Background', desc: 'Cmd palette BG' },
            ],
            peekView: [
                { key: 'peekViewEditor.background', name: 'Background', desc: 'Peek BG' },
            ],
            notifications: [
                { key: 'notifications.background', name: 'Background', desc: 'Toast BG' },
            ],
            menu: [
                { key: 'menu.background', name: 'Background', desc: 'Menu BG' },
            ],
            scrollbar: [
                { key: 'scrollbarSlider.background', name: 'Slider BG', desc: 'Scrollbar' },
            ],
            breadcrumb: [
                { key: 'breadcrumb.background', name: 'Background', desc: 'Path bar BG' },
            ],
            diff: [
                { key: 'diffEditor.insertedTextBackground', name: 'Inserted', desc: 'Git diff' },
                { key: 'diffEditor.removedTextBackground', name: 'Removed', desc: 'Git diff' },
            ],
            git: [
                { key: 'gitDecoration.modifiedResourceForeground', name: 'Modified', desc: 'Git text' },
            ],
            gutter: [
                { key: 'editorGutter.background', name: 'Background', desc: 'Gutter BG' },
            ],
            overviewRuler: [
                { key: 'editorOverviewRuler.border', name: 'Border', desc: 'Ruler border' },
            ],
            badge: [
                { key: 'badge.background', name: 'Background', desc: 'Badge BG' },
            ],
            debug: [
                { key: 'debugToolBar.background', name: 'Toolbar BG', desc: 'Debug bar' },
            ],
            progressBar: [
                { key: 'progressBar.background', name: 'Background', desc: 'Progress bar' },
            ],
            symbols: [
                { key: 'symbolIcon.functionForeground', name: 'Function Icon', desc: 'Outliner' },
            ]
        },
        syntax: {
            core: [
                { key: 'syntax.comment', name: 'Comments', desc: 'Code comments' },
                { key: 'syntax.keyword', name: 'Keywords', desc: 'Control flow' },
                { key: 'syntax.string', name: 'Strings', desc: 'Quoted text' },
                { key: 'syntax.number', name: 'Numbers', desc: 'Numeric values' },
            ],
            functions: [
                { key: 'syntax.function', name: 'Functions', desc: 'Declarations' },
                { key: 'syntax.parameter', name: 'Parameters', desc: 'Function args' },
            ],
            types: [
                { key: 'syntax.class', name: 'Classes/Types', desc: 'Types & classes' },
                { key: 'syntax.namespace', name: 'Namespaces', desc: 'Modules' },
            ],
            vars: [
                { key: 'syntax.variable', name: 'Variables', desc: 'General vars' },
                { key: 'syntax.constant', name: 'Constants', desc: 'Constant vars' },
                { key: 'syntax.property', name: 'Properties', desc: 'Object props' },
            ],
            ops: [
                { key: 'syntax.operator', name: 'Operators', desc: 'Math & logic' },
                { key: 'syntax.punctuation', name: 'Punctuation', desc: 'Brackets & dots' },
            ],
            markup: [
                { key: 'syntax.tag', name: 'Tags', desc: 'HTML/XML tags' },
                { key: 'syntax.attribute', name: 'Attributes', desc: 'HTML attributes' },
            ],
            special: [
                { key: 'syntax.decorator', name: 'Decorators', desc: 'Annotations' },
                { key: 'syntax.regex', name: 'Regex', desc: 'Regular expressions' },
            ]
        }
    };

    function init() {
        setupTabs();
        setupSliders();
        setupHarmony();
        setupColorInputs();
        setupActionButtons();
        renderThemeElements();
        setupSearch();
        vscode.postMessage({ command: 'getSavedPalettes' });
    }

    function setupTabs() {
        document.querySelectorAll('.details-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.details-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab === 'workbench' ? 'tabWorkbench' : 'tabSyntax';
                document.getElementById(target).classList.add('active');
            });
        });
    }

    function setupSliders() {
        const sliders = [
            { el: elements.saturationSlider, val: elements.saturationValue, key: 'saturation' },
            { el: elements.luminositySlider, val: elements.luminosityValue, key: 'luminosity' },
            { el: elements.variationSlider, val: elements.variationValue, key: 'variation' },
            { el: elements.syntaxSaturationSlider, val: elements.syntaxSaturationValue, key: 'syntaxSaturation' }
        ];

        sliders.forEach(s => {
            s.el.addEventListener('input', () => {
                s.val.textContent = parseFloat(s.el.value).toFixed(s.key === 'syntaxSaturation' ? 1 : 2);
                if (s.key === 'syntaxSaturation') {
                    syntaxSaturation = parseFloat(s.el.value);
                    if (autoPreview) autoApplyPreview();
                } else {
                    updateStateFromSliders();
                    regeneratePalette(false);
                }
            });
        });
    }

    function updateStateFromSliders() {
        saturationLevel = parseFloat(elements.saturationSlider.value);
        luminosityLevel = parseFloat(elements.luminositySlider.value);
        variationLevel = parseFloat(elements.variationSlider.value);
    }

    function setupHarmony() {
        document.querySelectorAll('.harmony-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.harmony-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                currentHarmony = opt.dataset.harmony;
                regeneratePalette(true);
            });
        });
    }

    function setupColorInputs() {
        elements.baseColor.addEventListener('input', () => {
            elements.baseColorText.value = elements.baseColor.value;
            regeneratePalette(true);
        });

        elements.baseColorText.addEventListener('input', () => {
            const val = elements.baseColorText.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                elements.baseColor.value = val;
                regeneratePalette(true);
            }
        });
    }

    function setupActionButtons() {
        document.getElementById('btnRandomPalette').addEventListener('click', () => {
            vscode.postMessage({ 
                command: 'random', 
                harmony: currentHarmony,
                saturation: saturationLevel,
                luminosity: luminosityLevel,
                variation: variationLevel,
                syntaxSaturation
            });
        });

        document.getElementById('btnSaveCurrent').addEventListener('click', () => {
            if (currentPalette) {
                vscode.postMessage({ command: 'savePalette', name: currentPalette.name });
            }
        });

        document.getElementById('btnImport').addEventListener('click', () => {
            vscode.postMessage({ command: 'importTheme' });
        });

        document.getElementById('btnExport').addEventListener('click', () => {
            if (currentPalette) {
                vscode.postMessage({ command: 'exportTheme', themeName: currentPalette.name });
            }
        });

        document.getElementById('btnClearPreview').addEventListener('click', () => {
            vscode.postMessage({ command: 'clearPreview' });
            isPreviewActive = false;
            elements.resetWarning.classList.remove('show');
            showToast('Preview cleared');
        });

        elements.autoPreview.addEventListener('change', () => {
            autoPreview = elements.autoPreview.checked;
            if (autoPreview) autoApplyPreview();
        });
    }

    function setupSearch() {
        elements.themeSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.theme-element').forEach(el => {
                const name = el.querySelector('.theme-element-name').textContent.toLowerCase();
                const key = el.dataset.key.toLowerCase();
                const isMatch = name.includes(term) || key.includes(term);
                el.style.display = isMatch ? 'flex' : 'none';
            });
            
            document.querySelectorAll('.theme-details-group').forEach(group => {
                const visible = Array.from(group.querySelectorAll('.theme-element')).some(el => el.style.display !== 'none');
                group.style.display = visible ? 'block' : 'none';
            });
        });
    }

    function regeneratePalette(forceNew = false) {
        if (regenerateTimer) clearTimeout(regenerateTimer);
        regenerateTimer = setTimeout(() => {
            vscode.postMessage({ 
                command: forceNew ? 'generate' : 'adjust', 
                baseColor: elements.baseColor.value, 
                harmony: currentHarmony,
                saturation: saturationLevel,
                luminosity: luminosityLevel,
                variation: variationLevel,
                syntaxSaturation,
                autoPreview
            });
        }, 150);
    }

    function autoApplyPreview() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            vscode.postMessage({ command: 'previewTheme', syntaxSaturation });
            isPreviewActive = true;
            elements.resetWarning.classList.add('show');
        }, 400);
    }

    function syncControlsFromPalette(palette) {
        if (!palette || !palette.options) return;

        saturationLevel = palette.options.saturation ?? saturationLevel;
        luminosityLevel = palette.options.luminosity ?? luminosityLevel;
        variationLevel = palette.options.variation ?? variationLevel;

        elements.saturationSlider.value = String(saturationLevel);
        elements.luminositySlider.value = String(luminosityLevel);
        elements.variationSlider.value = String(variationLevel);

        elements.saturationValue.textContent = saturationLevel.toFixed(2);
        elements.luminosityValue.textContent = luminosityLevel.toFixed(2);
        elements.variationValue.textContent = variationLevel.toFixed(2);
    }

    function renderThemeElements() {
        const mapping = {
            'editorElements': themeElements.workbench.editor,
            'errorsElements': themeElements.workbench.errors,
            'sidebarElements': themeElements.workbench.sidebar,
            'activityBarElements': themeElements.workbench.activityBar,
            'titleBarElements': themeElements.workbench.titleBar,
            'statusBarElements': themeElements.workbench.statusBar,
            'tabsElements': themeElements.workbench.tabs,
            'terminalElements': themeElements.workbench.terminal,
            'panelElements': themeElements.workbench.panel,
            'listsElements': themeElements.workbench.lists,
            'widgetsElements': themeElements.workbench.widgets,
            'formsElements': themeElements.workbench.forms,
            'quickInputElements': themeElements.workbench.quickInput,
            'peekViewElements': themeElements.workbench.peekView,
            'notificationsElements': themeElements.workbench.notifications,
            'menuElements': themeElements.workbench.menu,
            'scrollbarElements': themeElements.workbench.scrollbar,
            'breadcrumbElements': themeElements.workbench.breadcrumb,
            'diffElements': themeElements.workbench.diff,
            'gitElements': themeElements.workbench.git,
            'gutterElements': themeElements.workbench.gutter,
            'overviewRulerElements': themeElements.workbench.overviewRuler,
            'badgeElements': themeElements.workbench.badge,
            'debugElements': themeElements.workbench.debug,
            'progressBarElements': themeElements.workbench.progressBar,
            'symbolsElements': themeElements.workbench.symbols,
            'syntaxCoreElements': themeElements.syntax.core,
            'syntaxFunctionsElements': themeElements.syntax.functions,
            'syntaxTypesElements': themeElements.syntax.types,
            'syntaxVarsElements': themeElements.syntax.vars,
            'syntaxOpsElements': themeElements.syntax.ops,
            'syntaxMarkupElements': themeElements.syntax.markup,
            'syntaxSpecialElements': themeElements.syntax.special
        };

        Object.entries(mapping).forEach(([id, items]) => {
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = '';
            items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'theme-element';
                el.dataset.key = item.key;
                el.innerHTML = \`
                    <div class="theme-color-preview" data-key="\${item.key}"></div>
                    <div class="theme-element-info">
                        <div class="theme-element-name">\${item.name}</div>
                        <div class="theme-element-desc">\${item.desc}</div>
                    </div>
                    <div class="theme-element-hex">#000000</div>
                \`;
                el.querySelector('.theme-color-preview').addEventListener('click', () => openColorPicker(item.key, item.name));
                container.appendChild(el);
            });
        });
    }

    function openColorPicker(key, name) {
        const preview = document.querySelector(\`.theme-color-preview[data-key="\${key}"]\`);
        elements.globalColorInput.value = rgbToHex(preview.style.backgroundColor);
        const handleChange = () => {
            const color = elements.globalColorInput.value;
            preview.style.backgroundColor = color;
            const row = preview.closest('.theme-element');
            if (row) {
                const hexLabel = row.querySelector('.theme-element-hex');
                if (hexLabel) hexLabel.textContent = color.toUpperCase();
            }
            vscode.postMessage({ command: 'updateThemeElement', key, color });
            showToast(\`Updated \${name}\`);
            elements.globalColorInput.removeEventListener('change', handleChange);
        };
        elements.globalColorInput.addEventListener('change', handleChange);
        elements.globalColorInput.click();
    }

    function updatePalette(palette, themeColors, syntaxTokens) {
        currentPalette = palette;
        syncControlsFromPalette(palette);
        elements.paletteInfoSwatch.style.backgroundColor = palette.baseColor.hex;
        elements.paletteInfoHex.textContent = palette.baseColor.hex.toUpperCase();
        elements.paletteInfoHarmony.textContent = palette.harmony;
        elements.themeDetailsOverlay.classList.add('hidden');
        
        elements.editableStrip.innerHTML = '';
        palette.colors.forEach((c, i) => {
            const div = document.createElement('div');
            div.className = 'strip-color';
            div.style.backgroundColor = c.hex;
            div.innerHTML = \`<div class="strip-label"><span class="strip-hex">\${c.hex.toUpperCase()}</span><span class="strip-name">\${c.name}</span></div>\`;
            div.addEventListener('click', () => openColorPickerForStrip(i, c.hex));
            elements.editableStrip.appendChild(div);
        });

        if (themeColors) {
            Object.entries(themeColors).forEach(([key, color]) => {
                const preview = document.querySelector(\`.theme-color-preview[data-key="\${key}"]\`);
                if (preview) {
                    preview.style.backgroundColor = color;
                    const row = preview.closest('.theme-element');
                    if (row) {
                        const hexLabel = row.querySelector('.theme-element-hex');
                        if (hexLabel) hexLabel.textContent = color.toUpperCase().substring(0, 7);
                    }
                }
            });
        }

        if (syntaxTokens) {
            const syntaxMap = {
                'comments': 'comment',
                'keywords': 'keyword',
                'strings': 'string',
                'numbers': 'number',
                'function': 'function',
                'classes': 'class',
                'namespaces': 'namespace',
                'variables': 'variable',
                'constants': 'constant',
                'object': 'property',
                'operators': 'operator',
                'punctuation': 'punctuation',
                'tags': 'tag',
                'attributes': 'attribute',
                'decorators': 'decorator',
                'regular': 'regex'
            };

            syntaxTokens.forEach(token => {
                const namePart = token.name.toLowerCase().split(' ')[0];
                const keySuffix = syntaxMap[namePart] || namePart;
                const syntaxKey = \`syntax.\${keySuffix}\`;
                const preview = document.querySelector(\`.theme-color-preview[data-key="\${syntaxKey}"]\`);
                if (preview && token.settings.foreground) {
                    preview.style.backgroundColor = token.settings.foreground;
                    const row = preview.closest('.theme-element');
                    if (row) {
                        const hexLabel = row.querySelector('.theme-element-hex');
                        if (hexLabel) hexLabel.textContent = token.settings.foreground.toUpperCase();
                    }
                }
            });
        }
        
        if (autoPreview) autoApplyPreview();
    }

    function openColorPickerForStrip(index, hex) {
        elements.globalColorInput.value = hex;
        const handleChange = () => {
            const newColor = elements.globalColorInput.value;
            vscode.postMessage({ command: 'editColor', index, newColor, autoPreview });
            elements.globalColorInput.removeEventListener('change', handleChange);
        };
        elements.globalColorInput.addEventListener('change', handleChange);
        elements.globalColorInput.click();
    }

    function renderSaved(palettes) {
        elements.savedList.innerHTML = '';
        if (!palettes.length) {
            elements.savedList.innerHTML = '<div class="saved-card-meta">No saved palettes</div>';
            return;
        }
        palettes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'saved-card';
            card.innerHTML = \`
                <div class="saved-card-header"><span class="saved-card-name">\${p.name}</span><span class="saved-card-meta">\${p.harmony}</span></div>
                <div class="saved-card-strip">\${p.colors.map(c => \`<div style="background-color: \${c.hex}"></div>\`).join('')}</div>
                <div class="saved-card-actions"><button class="btn btn-sm btn-load">Load</button><button class="btn btn-sm btn-danger btn-delete">Delete</button></div>
            \`;
            card.querySelector('.btn-load').addEventListener('click', () => vscode.postMessage({ command: 'loadPalette', id: p.id }));
            card.querySelector('.btn-delete').addEventListener('click', (e) => { e.stopPropagation(); vscode.postMessage({ command: 'deletePalette', id: p.id }); });
            elements.savedList.appendChild(card);
        });
    }

    function showToast(msg) {
        elements.toast.textContent = msg;
        elements.toast.classList.add('show');
        setTimeout(() => elements.toast.classList.remove('show'), 2500);
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb || '#000000';
        const match = rgb.match(/\\d+/g);
        if (!match) return '#000000';
        const [r, g, b] = match.map(Number);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    window.addEventListener('message', event => {
        const msg = event.data;
        switch (msg.command) {
            case 'updatePalette': updatePalette(msg.palette, msg.themeColors, msg.syntaxTokens); break;
            case 'savedPalettes': renderSaved(msg.palettes); break;
            case 'clearPreview':
                elements.themeDetailsOverlay.classList.remove('hidden');
                elements.resetWarning.classList.remove('show');
                isPreviewActive = false;
                break;
        }
    });

    init();
})();`;
}
