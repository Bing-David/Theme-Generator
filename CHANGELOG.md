# Change Log

All notable changes to the "vsc-theme-generator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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
