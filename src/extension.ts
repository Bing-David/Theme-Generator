import * as vscode from 'vscode';
import { PalettePanel } from './webviewPanel';
import { CustomPaletteManager } from './customPalette';
import { ThemeGeneratorProvider } from './sidebarProvider';
import { clearThemePreview, applyThemePreview, mapPaletteToTheme, exportThemeToFile } from './themeExporter';
import { generatePalette, randomHex } from './colorGenerator';

export function activate(context: vscode.ExtensionContext) {
	console.log('VSC Theme Generator is now active!');

	const paletteManager = new CustomPaletteManager(context.globalState);
	const sidebarProvider = new ThemeGeneratorProvider(context, paletteManager);

	// Register the sidebar view
	vscode.window.createTreeView('themeGeneratorView', {
		treeDataProvider: sidebarProvider,
		showCollapseAll: true,
	});

	// Open the palette panel
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.openPalette', () => {
			const panel = PalettePanel.createOrShow(context.extensionUri, paletteManager);
			// Sincronizar: cuando el webview genera una paleta, actualizar el sidebar
			panel.onPaletteChanged((palette) => {
				sidebarProvider.setCurrentPalette(palette);
			});
		})
	);

	// Generate a random palette
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.generateRandom', () => {
			const harmonies = ['complementary', 'analogous', 'triadic', 'split-complementary', 'tetradic', 'monochromatic'] as const;
			const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
			const palette = generatePalette(randomHex(), harmony);
			sidebarProvider.setCurrentPalette(palette);
			
			// Si el webview está abierto, enviar la paleta allí
			if (PalettePanel.currentPanel) {
				PalettePanel.currentPanel.updatePalette(palette);
			} else {
				// Si no está abierto, abrirlo y enviar la paleta
				const panel = PalettePanel.createOrShow(context.extensionUri, paletteManager);
				panel.onPaletteChanged((p) => {
					sidebarProvider.setCurrentPalette(p);
				});
				// Enviar paleta después de un pequeño delay para que el webview esté listo
				setTimeout(() => {
					panel.updatePalette(palette);
				}, 500);
			}
			
			const harmonyLabels: Record<string, string> = {
				'complementary': '🎨 Complementary (opposite hues)',
				'analogous': '🌈 Analogous (adjacent hues ±30°)',
				'triadic': '🔺 Triadic (3 equidistant hues)',
				'split-complementary': '✂️ Split-Complementary (opposite ±30°)',
				'tetradic': '💎 Tetradic (4 equidistant hues)',
				'monochromatic': '🔳 Monochromatic (same hue, varied lightness)'
			};
			
			vscode.window.showInformationMessage(`${harmonyLabels[harmony]} — ${palette.colors.length} colors`);
		})
	);

	// Clear any applied theme preview
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.clearPreview', async () => {
			await clearThemePreview();
		})
	);

	// Preview current palette as theme
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.previewCurrent', async () => {
			const palette = sidebarProvider.getCurrentPalette();
			if (palette) {
				const theme = mapPaletteToTheme(palette);
				await applyThemePreview(theme);
				
				// También actualizar el webview si está abierto
				if (PalettePanel.currentPanel) {
					PalettePanel.currentPanel.updatePalette(palette);
				}
				
				vscode.window.showInformationMessage('Theme preview applied');
			} else {
				vscode.window.showWarningMessage('No palette available to preview');
			}
		})
	);

	// Export current palette as theme
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.exportCurrent', async () => {
			const palette = sidebarProvider.getCurrentPalette();
			if (palette) {
				const themeName = await vscode.window.showInputBox({
					prompt: 'Enter theme name',
					value: `${palette.name} Theme`,
				});
				if (themeName) {
					const theme = mapPaletteToTheme(palette, themeName);
					await exportThemeToFile(theme);
				}
			} else {
				vscode.window.showWarningMessage('No palette available to export');
			}
		})
	);

	// Save current palette
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.saveCurrent', async () => {
			const palette = sidebarProvider.getCurrentPalette();
			if (palette) {
				const name = await vscode.window.showInputBox({
					prompt: 'Enter palette name',
					value: palette.name,
				});
				if (name) {
					palette.name = name;
					await paletteManager.add(palette);
					sidebarProvider.refresh();
					vscode.window.showInformationMessage(`Saved "${name}" palette`);
				}
			} else {
				vscode.window.showWarningMessage('No palette available to save');
			}
		})
	);

	// Copy color to clipboard
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.copyColor', async (hex: string) => {
			await vscode.env.clipboard.writeText(hex);
			vscode.window.showInformationMessage(`Copied ${hex} to clipboard`);
		})
	);

	// Load saved palette
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.loadPalette', (item: any) => {
			if (item.palette) {
				sidebarProvider.setCurrentPalette(item.palette);
				vscode.window.showInformationMessage(`Loaded "${item.palette.name}" palette`);
			}
		})
	);

	// Delete saved palette
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.deletePalette', async (item: any) => {
			if (item.palette) {
				const confirm = await vscode.window.showWarningMessage(
					`Delete "${item.palette.name}" palette?`,
					'Delete',
					'Cancel'
				);
				if (confirm === 'Delete') {
					await paletteManager.remove(item.palette.id);
					sidebarProvider.refresh();
					vscode.window.showInformationMessage(`Deleted "${item.palette.name}" palette`);
				}
			}
		})
	);

	// Refresh sidebar view
	context.subscriptions.push(
		vscode.commands.registerCommand('vsc-theme-generator.refreshView', () => {
			sidebarProvider.refresh();
		})
	);

	// Generate initial random palette
	const initialHarmony = 'complementary';
	const initialPalette = generatePalette(randomHex(), initialHarmony);
	sidebarProvider.setCurrentPalette(initialPalette);
}

export function deactivate() {}
