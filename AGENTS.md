# Theme Generator Extension - AI Context Document

## Project Overview
VS Code extension for generating, customizing, and exporting color themes with harmonic color palette generation.

## Architecture

### Core Modules

#### extension.ts
- Entry point: activates extension
- Registers commands: openPalette, generateRandom, previewCurrent, exportCurrent, saveCurrent
- Manages extension lifecycle and context

#### webviewPanel.ts
- Creates and manages webview panel
- Handles two-way messaging between webview and extension
- Manages webview state and disposal

#### sidebarProvider.ts
- Provides TreeView for sidebar
- Displays saved palettes list
- Manages palette selection and deletion

#### colorGenerator.ts
- Core color theory implementation
- Generates harmonic palettes based on color wheel mathematics
- Harmony types: complementary, analogous, triadic, split-complementary, tetradic, monochromatic
- Color manipulation: HSL conversion, saturation, luminosity, variation

#### customPalette.ts
- Manages custom palette persistence
- CRUD operations for saved palettes
- Storage in VS Code global state

#### themeExporter.ts
- Exports theme to VS Code theme JSON format
- Imports theme from JSON files and converts to palette
- Maps generated colors to VS Code token scopes
- Generates workbench color definitions
- Converts themes back to editable palettes

### UI Components (Webview)

#### webviewHtml.ts
- Main HTML structure
- Three-column layout: center panel (controls), right panel (details)
- Header with branding
- Control groups: base color, harmony type, color properties, actions

#### webviewStyle.ts
- Complete CSS styling
- Dark theme interface
- Grid layouts for harmony options
- Color swatch components
- Responsive design elements

#### webviewScript.ts
- Client-side JavaScript logic
- DOM manipulation and event handling
- VS Code API messaging
- Real-time color updates
- Auto-preview functionality

## Data Flow

### Color Generation Flow
1. User selects base color + harmony type
2. colorGenerator.ts calculates harmonic colors using HSL color space
3. Applies saturation, luminosity, variation parameters
4. Generates complete palette (editor colors, UI colors, syntax colors)
5. Updates webview display

### Theme Application Flow
1. User clicks "Preview" or auto-preview enabled
2. webviewScript sends palette data to extension
3. themeExporter.ts converts to VS Code theme format
4. Updates workbench.colorCustomizations configuration
5. Theme applied immediately

### Persistence Flow
1. User clicks "Save"
2. customPalette.ts stores palette in global state
3. sidebarProvider updates TreeView
4. Palette available for future sessions

### Import Flow
1. User clicks "Import"
2. System opens file picker dialog
3. User selects VS Code theme JSON file
4. themeExporter.ts reads and validates theme structure
5. Extracts key colors from theme (accent, status bar, etc.)
6. Analyzes color relationships to detect harmony type
7. Converts theme colors to palette format
8. Palette loaded into generator for editing
9. All generator controls update with imported values

### Export Flow
1. User clicks "Export"
2. themeExporter.ts generates complete theme JSON
3. User selects save location
4. Theme file written to disk
5. Ready for package.json contribution

## Key Features

### Color Theory Implementation
- HSL color space for intuitive manipulation
- Mathematical harmony calculations
- Variation generation for color families
- Saturation and luminosity control

### Theme Mapping
- Editor background, foreground, selection
- Sidebar, activity bar, status bar
- Input fields, buttons, dropdowns
- Terminal ANSI colors
- Syntax highlighting tokens

### User Controls
- Base color picker with hex input
- 6 harmony type options
- 4 adjustable sliders (saturation, luminosity, variation, syntax intensity)
- Auto-preview toggle
- Quick actions: Random, Save, Import, Export

### Visual Feedback
- Editable color strip (main palette)
- Full palette grid (all variations)
- Color details panel (mapped elements)
- Toast notifications
- Preview warning banner

## File Structure
```
src/
├── extension.ts              // Main entry point
├── webviewPanel.ts           // Webview management
├── sidebarProvider.ts        // Sidebar tree view
├── colorGenerator.ts         // Color theory logic
├── customPalette.ts          // Palette persistence
├── themeExporter.ts          // Theme export logic
├── webviewHtml.ts            // UI template
├── webviewStyle.ts           // UI styles
└── webviewScript.ts          // Client-side logic
```

## Configuration Storage
- Custom palettes: VS Code global state
- Active theme: workbench.colorCustomizations
- Extension settings: contributes.configuration

## VS Code API Usage
- window.createWebviewPanel
- window.registerTreeDataProvider
- workspace.getConfiguration
- workspace.fs.writeFile
- ExtensionContext.globalState

## Color Palette Structure
```typescript
{
  baseColor: string,           // Hex color
  harmonyType: string,         // Harmony algorithm
  saturation: number,          // 0.3-1.0
  luminosity: number,          // 0.2-0.8
  variation: number,           // 0.0-0.5
  syntaxSaturation: number,    // 0.5-1.5
  colors: {
    editor: {...},             // Editor colors
    ui: {...},                 // Workbench colors
    syntax: {...},             // Token colors
    terminal: [...]            // ANSI colors
  }
}
```

## Theme Import/Export Functions

### Import Functions (themeExporter.ts)
- **importThemeFromFile()**: Opens file picker and reads theme JSON
- **convertThemeToPalette(themeData)**: Converts VS Code theme to palette format
- **extractKeyColorsFromTheme(colors)**: Extracts main colors from theme workbench colors
- **detectHarmonyType(colors)**: Analyzes color relationships to determine harmony type
- **detectTypeFromColors(colors)**: Determines if theme is dark or light
- **isValidHex(color)**: Validates hex color format
- **normalizeHex(color)**: Removes alpha channel and ensures # prefix
- **isGrayscale(hex)**: Filters out grayscale colors during extraction

### Color Extraction Priority
1. statusBar.background (primary accent)
2. activityBar.activeBorder
3. focusBorder
4. button.background
5. editor.selectionBackground
6. Terminal ANSI colors
7. Fallback: scans all theme colors

### Harmony Detection Logic
- **Monochromatic**: All colors within 30° hue difference
- **Complementary**: Colors opposite on wheel (~180°)
- **Triadic**: Colors 120° apart
- **Tetradic**: Colors 90° or 180° apart
- **Analogous**: Colors within 60° range
- **Split-complementary**: Default for mixed schemes

### Export Functions
- **exportThemeToFile(theme)**: Saves theme as JSON file
- **mapPaletteToTheme(palette)**: Converts palette to VS Code theme format


## Message Protocol (Webview ↔ Extension)
- updatePalette: Send generated palette to extension
- previewTheme: Apply theme preview
- exportTheme: Trigger theme export
- importTheme: Open file picker and import theme JSON
- savePalette: Save current palette
- loadPalette: Load saved palette
- deletePalette: Remove saved palette
- randomPalette: Generate random base color

## Extension Points
- Commands in package.json
- Views in activitybar
- Configuration contributions
- File system operations

## Dependencies
- VS Code Extension API
- No external runtime dependencies
- Pure TypeScript/JavaScript implementation