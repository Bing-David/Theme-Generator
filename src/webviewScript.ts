export function getScript(): string {
  return `(function () {
    const vscode = acquireVsCodeApi();

    let currentPalette = null;
    let catalog = { workbench: [], textMate: [], semantic: [] };
    let editableColors = { workbench: {}, textMate: {}, semantic: {} };
    let autoPreview = true;
    let previewActive = false;
    let regenerateTimer = null;
    let previewTimer = null;
    let globalColorTarget = null;

    const elements = {
      baseColor: document.getElementById("baseColor"),
      baseColorText: document.getElementById("baseColorText"),
      baseColorLocked: document.getElementById("baseColorLocked"),
      editableStrip: document.getElementById("editableStrip"),
      savedList: document.getElementById("savedList"),
      toast: document.getElementById("toast"),
      saturationSlider: document.getElementById("saturationSlider"),
      luminositySlider: document.getElementById("luminositySlider"),
      variationSlider: document.getElementById("variationSlider"),
      syntaxSaturationSlider: document.getElementById("syntaxSaturationSlider"),
      saturationValue: document.getElementById("saturationValue"),
      luminosityValue: document.getElementById("luminosityValue"),
      variationValue: document.getElementById("variationValue"),
      syntaxSaturationValue: document.getElementById("syntaxSaturationValue"),
      resetWarning: document.getElementById("resetWarning"),
      autoPreview: document.getElementById("autoPreview"),
      themeSearch: document.getElementById("themeSearch"),
      paletteInfoSwatch: document.getElementById("paletteInfoSwatch"),
      paletteInfoHex: document.getElementById("paletteInfoHex"),
      paletteInfoHarmony: document.getElementById("paletteInfoHarmony"),
      workbenchGroups: document.getElementById("workbenchGroups"),
      textMateGroups: document.getElementById("textMateGroups"),
      semanticGroups: document.getElementById("semanticGroups"),
      globalColorInput: createGlobalColorInput()
    };

    function createGlobalColorInput() {
      const input = document.createElement("input");
      input.type = "color";
      input.style.display = "none";
      document.body.appendChild(input);
      return input;
    }

    function init() {
      setupTabs();
      setupHarmony();
      setupInputs();
      setupActions();
      setupSearch();
      vscode.postMessage({ command: "initialize" });
    }

    function setupTabs() {
      document.querySelectorAll(".details-tab").forEach((button) => {
        button.addEventListener("click", () => {
          document.querySelectorAll(".details-tab").forEach((tab) => tab.classList.remove("active"));
          document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
          button.classList.add("active");
          const key = button.dataset.tab;
          const target = key === "workbench" ? "tabWorkbench" : key === "textMate" ? "tabTextMate" : "tabSemantic";
          document.getElementById(target).classList.add("active");
        });
      });
    }

    function setupHarmony() {
      document.querySelectorAll(".harmony-option").forEach((option) => {
        option.addEventListener("click", () => {
          document.querySelectorAll(".harmony-option").forEach((item) => item.classList.remove("active"));
          option.classList.add("active");
          queueGenerate();
        });
      });
    }

    function setupInputs() {
      const sliders = [
        ["saturationSlider", "saturationValue", 2],
        ["luminositySlider", "luminosityValue", 2],
        ["variationSlider", "variationValue", 2],
        ["syntaxSaturationSlider", "syntaxSaturationValue", 1]
      ];

      sliders.forEach(([sliderId, valueId, decimals]) => {
        elements[sliderId].addEventListener("input", () => {
          elements[valueId].textContent = Number.parseFloat(elements[sliderId].value).toFixed(decimals);
          if (sliderId === "syntaxSaturationSlider") {
            queueAdjust();
          } else {
            queueAdjust();
          }
        });
      });

      elements.baseColor.addEventListener("input", () => {
        elements.baseColorText.value = elements.baseColor.value;
        vscode.postMessage({
          command: "setBaseColor",
          baseColor: elements.baseColor.value,
          autoPreview
        });
      });

      elements.baseColorText.addEventListener("input", () => {
        const value = elements.baseColorText.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(value)) {
          elements.baseColor.value = value;
          vscode.postMessage({
            command: "setBaseColor",
            baseColor: value,
            autoPreview
          });
        }
      });

      elements.baseColorLocked.addEventListener("change", () => {
        vscode.postMessage({
          command: "setBaseColorLock",
          locked: elements.baseColorLocked.checked
        });
      });

      elements.autoPreview.addEventListener("change", () => {
        autoPreview = elements.autoPreview.checked;
        vscode.postMessage({
          command: "setAutoPreview",
          enabled: autoPreview
        });
        if (autoPreview) {
          queuePreview();
        }
      });
    }

    function setupActions() {
      document.getElementById("btnRandomPalette").addEventListener("click", () => {
        vscode.postMessage({
          command: "randomizePalette",
          autoPreview
        });
      });

      document.getElementById("btnSaveCurrent").addEventListener("click", () => {
        vscode.postMessage({ command: "savePalette" });
      });

      document.getElementById("btnImport").addEventListener("click", () => {
        vscode.postMessage({ command: "importTheme" });
      });

      document.getElementById("btnExport").addEventListener("click", () => {
        if (!currentPalette) return;
        vscode.postMessage({
          command: "exportTheme",
          themeName: currentPalette.name
        });
      });

      document.getElementById("btnClearPreview").addEventListener("click", () => {
        vscode.postMessage({ command: "clearPreview" });
      });
    }

    function setupSearch() {
      elements.themeSearch.addEventListener("input", () => {
        const query = elements.themeSearch.value.toLowerCase().trim();
        document.querySelectorAll(".theme-element").forEach((row) => {
          const haystack = [
            row.dataset.label || "",
            row.dataset.key || "",
            row.dataset.description || ""
          ].join(" ").toLowerCase();
          row.style.display = haystack.includes(query) ? "flex" : "none";
        });

        document.querySelectorAll(".theme-details-group").forEach((group) => {
          const visible = Array.from(group.querySelectorAll(".theme-element")).some((row) => row.style.display !== "none");
          group.style.display = visible ? "block" : "none";
        });
      });
    }

    function getSelectedHarmony() {
      const selected = document.querySelector(".harmony-option.active");
      return selected ? selected.dataset.harmony : "analogous";
    }

    function getSliderState() {
      return {
        saturation: Number.parseFloat(elements.saturationSlider.value),
        luminosity: Number.parseFloat(elements.luminositySlider.value),
        variation: Number.parseFloat(elements.variationSlider.value),
        syntaxSaturation: Number.parseFloat(elements.syntaxSaturationSlider.value)
      };
    }

    function queueGenerate() {
      if (regenerateTimer) clearTimeout(regenerateTimer);
      regenerateTimer = setTimeout(() => {
        const sliders = getSliderState();
        vscode.postMessage({
          command: "generatePalette",
          baseColor: elements.baseColor.value,
          harmony: getSelectedHarmony(),
          autoPreview,
          saturation: sliders.saturation,
          luminosity: sliders.luminosity,
          variation: sliders.variation,
          syntaxSaturation: sliders.syntaxSaturation
        });
      }, 120);
    }

    function queueAdjust() {
      if (regenerateTimer) clearTimeout(regenerateTimer);
      regenerateTimer = setTimeout(() => {
        const sliders = getSliderState();
        vscode.postMessage({
          command: "adjustPalette",
          autoPreview,
          saturation: sliders.saturation,
          luminosity: sliders.luminosity,
          variation: sliders.variation,
          syntaxSaturation: sliders.syntaxSaturation
        });
      }, 120);
    }

    function queuePreview() {
      if (previewTimer) clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        vscode.postMessage({ command: "previewTheme" });
      }, 220);
    }

    function renderSeedStrip() {
      elements.editableStrip.innerHTML = "";
      if (!currentPalette) return;

      currentPalette.seedColors.forEach((color, index) => {
        const node = document.createElement("div");
        node.className = "strip-color";
        node.style.backgroundColor = color.hex;
        node.innerHTML = '<div class="strip-label"><span class="strip-hex">' + color.hex.toUpperCase() + '</span><span class="strip-name">' + (color.name || ("Color " + (index + 1))) + '</span></div>';
        node.addEventListener("click", () => openColorPicker({
          kind: "seed",
          id: String(index),
          current: color.hex,
          callback: (nextColor) => {
            vscode.postMessage({
              command: "updateSeedColor",
              index,
              color: nextColor,
              autoPreview
            });
          }
        }));
        elements.editableStrip.appendChild(node);
      });
    }

    function renderGroups(kind, items, container, values) {
      const groups = items.reduce((accumulator, item) => {
        if (!accumulator[item.category]) {
          accumulator[item.category] = [];
        }
        accumulator[item.category].push(item);
        return accumulator;
      }, {});

      container.innerHTML = "";

      Object.keys(groups).forEach((category) => {
        const wrapper = document.createElement("div");
        wrapper.className = "theme-details-group";
        wrapper.innerHTML = '<div class="theme-details-subtitle">' + category + '</div>';

        groups[category].forEach((item) => {
          const row = document.createElement("div");
          row.className = "theme-element";
          row.dataset.key = item.id;
          row.dataset.label = item.label;
          row.dataset.description = item.description;
          const color = values[item.id] || "#000000";
          row.innerHTML =
            '<div class="theme-color-preview" data-kind="' + kind + '" data-id="' + item.id + '" style="background-color:' + color + '"></div>' +
            '<div class="theme-element-info">' +
            '<div class="theme-element-name">' + item.label + '</div>' +
            '<div class="theme-element-desc">' + item.description + '</div>' +
            '<div class="theme-element-key">' + item.id + '</div>' +
            "</div>" +
            '<div class="theme-element-hex">' + color.toUpperCase().slice(0, 7) + "</div>";

          row.querySelector(".theme-color-preview").addEventListener("click", () => {
            openColorPicker({
              kind,
              id: item.id,
              current: color,
              callback: (nextColor) => {
                const command =
                  kind === "workbench"
                    ? "updateWorkbenchColor"
                    : kind === "textMate"
                      ? "updateTextMateToken"
                      : "updateSemanticToken";
                vscode.postMessage({
                  command,
                  id: item.id,
                  color: nextColor,
                  autoPreview
                });
              }
            });
          });

          wrapper.appendChild(row);
        });

        container.appendChild(wrapper);
      });
    }

    function renderEditor() {
      renderSeedStrip();
      renderGroups("workbench", catalog.workbench, elements.workbenchGroups, editableColors.workbench);
      renderGroups("textMate", catalog.textMate, elements.textMateGroups, editableColors.textMate);
      renderGroups("semantic", catalog.semantic, elements.semanticGroups, editableColors.semantic);
    }

    function openColorPicker(target) {
      globalColorTarget = target;
      elements.globalColorInput.value = normalizeHex(target.current);
      elements.globalColorInput.onchange = () => {
        if (!globalColorTarget) return;
        globalColorTarget.callback(elements.globalColorInput.value);
        globalColorTarget = null;
      };
      elements.globalColorInput.click();
    }

    function syncControlsFromPalette() {
      if (!currentPalette) return;

      const options = currentPalette.options || {};
      elements.baseColor.value = currentPalette.baseColor.hex;
      elements.baseColorText.value = currentPalette.baseColor.hex;
      elements.baseColorLocked.checked = Boolean(currentPalette.baseColorLocked);

      elements.saturationSlider.value = String(options.saturation ?? 0.7);
      elements.luminositySlider.value = String(options.luminosity ?? 0.5);
      elements.variationSlider.value = String(options.variation ?? 0.15);
      elements.syntaxSaturationSlider.value = String(options.syntaxSaturation ?? 1.0);

      elements.saturationValue.textContent = Number.parseFloat(elements.saturationSlider.value).toFixed(2);
      elements.luminosityValue.textContent = Number.parseFloat(elements.luminositySlider.value).toFixed(2);
      elements.variationValue.textContent = Number.parseFloat(elements.variationSlider.value).toFixed(2);
      elements.syntaxSaturationValue.textContent = Number.parseFloat(elements.syntaxSaturationSlider.value).toFixed(1);

      elements.paletteInfoSwatch.style.backgroundColor = currentPalette.baseColor.hex;
      elements.paletteInfoHex.textContent = currentPalette.baseColor.hex.toUpperCase();
      elements.paletteInfoHarmony.textContent = currentPalette.harmony;

      document.querySelectorAll(".harmony-option").forEach((option) => {
        option.classList.toggle("active", option.dataset.harmony === currentPalette.harmony);
      });
    }

    function renderSaved(palettes) {
      elements.savedList.innerHTML = "";
      if (!palettes.length) {
        elements.savedList.innerHTML = '<div class="saved-card-meta">No saved palettes</div>';
        return;
      }

      palettes.forEach((palette) => {
        const card = document.createElement("div");
        card.className = "saved-card";
        card.innerHTML =
          '<div class="saved-card-header"><span class="saved-card-name">' + palette.name + '</span><span class="saved-card-meta">' + palette.harmony + '</span></div>' +
          '<div class="saved-card-strip">' +
          palette.seedColors.map((color) => '<div style="background-color:' + color.hex + '"></div>').join("") +
          "</div>" +
          '<div class="saved-card-actions"><button class="btn btn-sm btn-load">Load</button><button class="btn btn-sm btn-danger btn-delete">Delete</button></div>';
        card.querySelector(".btn-load").addEventListener("click", () => {
          vscode.postMessage({ command: "loadPalette", id: palette.id });
        });
        card.querySelector(".btn-delete").addEventListener("click", () => {
          vscode.postMessage({ command: "deletePalette", id: palette.id });
        });
        elements.savedList.appendChild(card);
      });
    }

    function showToast(message) {
      elements.toast.textContent = message;
      elements.toast.classList.add("show");
      setTimeout(() => elements.toast.classList.remove("show"), 2200);
    }

    function normalizeHex(color) {
      if (!color) return "#000000";
      if (color.startsWith("#")) return color.slice(0, 7);
      const matches = color.match(/\\d+/g);
      if (!matches) return "#000000";
      const [r, g, b] = matches.map(Number);
      return "#" + [r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("");
    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "initializeData":
          catalog = message.data.catalog;
          currentPalette = message.data.palette;
          editableColors = message.editableColors;
          syncControlsFromPalette();
          renderSaved(message.data.savedPalettes);
          renderEditor();
          break;
        case "paletteState":
          currentPalette = message.palette;
          editableColors = message.editableColors;
          syncControlsFromPalette();
          renderEditor();
          break;
        case "savedPalettes":
          renderSaved(message.palettes);
          break;
        case "previewApplied":
          previewActive = true;
          elements.resetWarning.classList.add("show");
          showToast("Preview applied");
          break;
        case "previewCleared":
          previewActive = false;
          elements.resetWarning.classList.remove("show");
          showToast("Preview cleared");
          break;
      }
    });

    init();
  })();`;
}
