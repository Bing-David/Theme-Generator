# Change Log

All notable changes to the "vsc-theme-generator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.3.0]

### Added

- Added a real temporary preview theme flow so generated themes are applied as a selectable VS Code theme instead of stacking color customizations over the current theme.
- Added a broader harmony catalog with new palette modes including `square`, `double-complementary`, `compound`, `accented-analogous`, `neutral`, `warm`, `cool`, `polychromatic`, `rainbow`, `duotone`, `grayscale`, `near-monochromatic`, `split-triadic`, `pentadic`, and `hexadic`.
- Added semantic token generation and editing support so modern syntax highlighting is not limited to TextMate token rules.
- Added curated editing catalogs for `UI Colors`, `Syntax`, and `Semantic` sections in the visual editor.
- Added stronger automated validation for harmony geometry, randomization behavior, import/export round-trips, and theme mapping coverage.

### Changed

- Refactored the extension around a cleaner palette model with generated roles, explicit workbench/textmate/semantic overrides, and a unified theme mapping pipeline.
- Reworked palette generation so `Random` now changes both the base color and the internal harmony profile, producing less repetitive results while preserving logical color relationships.
- Changed `Lock base color` to be disabled by default.
- Reworked import/export so exported themes preserve palette metadata and imported themes restore into the current editor model more consistently.
- Updated the webview/editor protocol so preview, import, load, randomization, and manual edits all use the same state flow.
- Improved theme application coverage across editor, tabs, sidebar, terminal, command palette, notifications, symbols, and syntax mappings.

### Fixed

- Fixed preview clearing so it restores the previous active theme or a VS Code default theme instead of leaving preview artifacts behind.
- Fixed imported or loaded themes requiring a manual `Auto-preview` toggle before being applied.
- Fixed palette deletion so removing a saved theme also clears the active preview instead of leaving the deleted theme visually applied.
- Fixed grayscale generation so automatic adjustments no longer reintroduce chroma.
- Fixed saved palette persistence and panel synchronization issues that caused state drift between the extension host, sidebar, and webview.

## [0.2.5]

### Changed

- Improved palette adjustment consistency so `Color Properties` no longer feel like a random regeneration after the first change.
- Expanded the slider ranges for `Saturation`, `Luminosity`, and `Variation` to allow a wider editing range.
- Added better webview control synchronization so loaded or regenerated palettes reflect the current slider state more accurately.

### Fixed

- Improved palette option persistence so generated palettes reuse their adjustment settings more reliably during later edits.
- Fixed the TypeScript project configuration by explicitly including Node.js and VS Code types in `tsconfig.json`.

### Added

- Restored the `Syntax` control in `Color Properties` so syntax token saturation can be tuned independently again.

### Documentation

- Rewrote and updated the `README` in English to match the current extension behavior, scripts, and feature set.

## [0.2.4]

- Fixed critical bug where deleting a theme could remove all saved themes.
- Fixed Internals bugs in the user flow.
- Added persistence for manual edits in "Theme Details". Now your custom tweaks are saved!
- Improved Import/Export fidelity: imported themes now preserve all original colors as overrides.
- Added ability to name themes when saving.
- Export notification now shows the full file path.
- Ui improvements and optimizations.

## [0.2.3]

- Initial release features and improvements.
