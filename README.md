![Theme Generator](https://github.com/user-attachments/assets/7a4845e1-f96e-4e1e-ba98-4f968fa5a8ba)

# VSC Theme Generator

Generate, customize, preview, import, and export Visual Studio Code color themes from an interactive palette editor.

## Overview

VSC Theme Generator is a VS Code extension focused on fast theme creation with visual controls. It combines harmony-based palette generation, live theme preview, manual UI/token editing, and round-trip import/export so you can keep refining a theme over time.

## Features

### Palette generation

- Generate palettes from a base color using these harmony modes:
  - Complementary
  - Analogous
  - Triadic
  - Split-complementary
  - Tetradic
  - Monochromatic
- Generate a random palette with one click

### Color controls

- Adjust `Saturation`, `Luminosity`, and `Variation`
- Adjust `Syntax` intensity for token colors independently from the base palette
- Keep palette controls synchronized with generated palettes

### Visual editor

- Live webview-based palette editor
- Editable palette strip for direct color changes
- Theme Details panel for manual UI color overrides
- Syntax Tokens panel for token-level color adjustments
- Search inside theme properties

### Preview and persistence

- Apply the current theme as a live VS Code preview
- Clear preview at any time
- Save palettes inside VS Code for later reuse
- Load and delete saved palettes from the activity bar view

### Import and export

- Export themes as standard VS Code `.json` color theme files
- Import previously exported themes back into the editor
- Preserve palette metadata on export for improved round-trip editing

## How It Works

1. Open the palette generator.
2. Pick a harmony mode or generate a random palette.
3. Refine the palette with the color property sliders.
4. Edit individual UI colors or syntax token colors if needed.
5. Preview the result in VS Code.
6. Save the palette or export it as a theme file.

## Commands

The extension contributes these commands:

- `Theme Generator: Open Palette Generator`
- `Theme Generator: Generate Random Palette`
- `Theme Generator: Preview Current Theme`
- `Theme Generator: Clear Theme Preview`
- `Theme Generator: Export Current Theme`
- `Theme Generator: Save Current Palette`
- `Theme Generator: Load Palette`
- `Theme Generator: Delete Palette`
- `Theme Generator: Refresh`

## Sidebar View

The extension adds a `Theme Generator` view container in the VS Code activity bar. From there you can:

- Open the full palette editor
- Generate a random palette
- Import a theme
- Preview or clear the current theme
- Access saved palettes

## Development

### Requirements

- VS Code `^1.85.0`
- Node.js 20+
- npm | Caution, another package manager is recommended

### Install dependencies

```bash
npm install
```

### Type check

```bash
npm run check-types
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run compile
```

### Production package build

```bash
vsce package
npm run package
```

### Watch mode

```bash
npm run watch
```

### Run the extension

Press `F5` in VS Code to launch an Extension Development Host.

## Project Structure

```text
Theme-Generator/
├── src/
│   ├── extension.ts
│   ├── colorGenerator.ts
│   ├── customPalette.ts
│   ├── sidebarProvider.ts
│   ├── themeExporter.ts
│   ├── webviewHtml.ts
│   ├── webviewPanel.ts
│   ├── webviewScript.ts
│   └── webviewStyle.ts
├── media/
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- Themes exported from the current extension version preserve palette metadata for better re-import behavior.
- Older theme files that do not include embedded palette metadata may import approximately rather than perfectly.
- Manual color overrides in Theme Details are included in exported themes.

## Publishing

If you want to package the extension manually:

```bash
npm install -g vsce
vsce package
```

## Contributing

Issues and pull requests are welcome. If you want to contribute:

1. Open an issue describing the bug or improvement.
2. Create a branch with your changes.
3. Submit a pull request with a clear summary.

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE).

## Author

Jeiler David  
GitHub: [@Bing-David](https://github.com/Bing-David)
