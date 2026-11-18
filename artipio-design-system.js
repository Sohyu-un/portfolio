(() => {
  const appearances = {
    Primary: { background: "#006BD6", text: "#FFFFFF", border: "#006BD6" },
    Default: { background: "#E8EDF3", text: "#303842", border: "#E8EDF3" },
    Dark: { background: "#303842", text: "#FFFFFF", border: "#303842" },
    Line: { background: "#FFFFFF", text: "#006BD6", border: "#C5D0DB" },
    Subtle: { background: "#E0F2FF", text: "#006BD6", border: "#E0F2FF" }
  };

  const sizes = {
    Small: { height: 35, fontSize: 16, weight: 500, weightName: "Medium", width: 142 },
    Medium: { height: 45, fontSize: 18, weight: 600, weightName: "SemiBold", width: 320 },
    Large: { height: 48, fontSize: 18, weight: 600, weightName: "SemiBold", width: 343 }
  };

  const selection = { appearance: "Primary", size: "Small" };
  const example = document.querySelector("#ds-button-example");
  const modal = document.querySelector("#ds-modal-copy");
  const summary = document.querySelector("#ds-selection");
  const specifications = document.querySelector("#ds-specifications");
  const controls = document.querySelector(".ds-controls");

  function addOptions(container, group, options) {
    for (const [name, config] of Object.entries(options)) {
      const option = document.createElement("button");
      const detail = document.createElement("span");
      option.type = "button";
      option.className = "ds-option";
      option.dataset.group = group;
      option.dataset.value = name;
      option.append(name);

      if (group === "appearance") {
        detail.className = "ds-swatch";
        detail.setAttribute("aria-hidden", "true");
        detail.style.setProperty("--swatch-background", config.background);
        detail.style.setProperty("--swatch-border", config.border);
        option.prepend(detail);
      } else {
        detail.className = "label secondary";
        detail.textContent = `${config.height}px`;
        option.append(" ", detail);
      }

      container.append(option);
    }
  }

  function render() {
    const appearance = appearances[selection.appearance];
    const size = sizes[selection.size];
    const isSmall = selection.size === "Small";

    example.dataset.size = selection.size;
    example.style.setProperty("--preview-width", `${size.width}px`);
    example.style.setProperty("--button-height", `${size.height}px`);
    example.style.setProperty("--button-font-size", `${size.fontSize}px`);
    example.style.setProperty("--button-font-weight", size.weight);
    example.style.setProperty("--button-background", appearance.background);
    example.style.setProperty("--button-text", appearance.text);
    example.style.setProperty("--button-border", appearance.border);
    modal.hidden = selection.size !== "Medium";
    summary.textContent = `${selection.appearance} / ${selection.size}`;

    const height = document.createElement("span");
    height.textContent = `Height: ${size.height}px`;
    const font = document.createElement("span");
    font.textContent = `Font: ${size.fontSize}px / ${size.weightName}`;
    specifications.replaceChildren(height, font);

    if (isSmall) {
      const touch = document.createElement("span");
      touch.className = "accent";
      touch.textContent = "Touch target: 48px (proposed)";
      specifications.append(touch);
    }

    for (const option of controls.querySelectorAll(".ds-option")) {
      option.setAttribute("aria-pressed", selection[option.dataset.group] === option.dataset.value);
    }
  }

  addOptions(document.querySelector("#ds-appearance-options"), "appearance", appearances);
  addOptions(document.querySelector("#ds-size-options"), "size", sizes);
  controls.addEventListener("click", (event) => {
    const option = event.target.closest(".ds-option");
    if (!option) return;
    selection[option.dataset.group] = option.dataset.value;
    render();
  });

  render();
})();
