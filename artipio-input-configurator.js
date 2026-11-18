(() => {
  const section = document.querySelector("#ds-input");
  const example = section.querySelector(".ds-input-example");
  const input = example.querySelector("input");
  const sendIcon = example.querySelector(".ds-input-send");
  const clearButton = example.querySelector(".ds-input-clear");
  const clearIcon = clearButton.querySelector("img");
  const measure = example.querySelector(".ds-input-measure");
  const unit = example.querySelector(".ds-input-unit");
  const summary = section.querySelector("[data-input-summary]");
  const specs = section.querySelector("[data-input-specs]");
  const options = section.querySelector("[data-input-options]");
  const shapeButtons = section.querySelectorAll("[data-input-shape]");
  const iconPath = "assets/artipio/input/";

  const modes = {
    Box: ["Standard", "With Icon"],
    Line: ["Account", "Quantity"]
  };

  const fields = {
    Standard: { label: "Standard input", placeholder: "Enter information" },
    "With Icon": { label: "Input with send icon", placeholder: "Enter your message" },
    Account: { label: "Account number", placeholder: "Enter your account number" },
    Quantity: { label: "Quantity in shares", placeholder: "Enter Quantity" }
  };

  let shape = "Box";
  let mode = modes[shape][0];

  function getState(focused, filled) {
    switch (mode) {
      case "With Icon":
        return focused ? "active/icon" : "default/icon";
      case "Quantity":
        if (focused) return filled ? "count_active_filled" : "count_active";
        return filled ? "count_filled" : "count_default";
      case "Standard":
        if (focused) return filled ? "active/Filled" : "cursor_active";
        return filled ? "filled" : "default";
      case "Account":
        if (focused) return "active";
        return filled ? "filled" : "default";
    }
  }

  function setIcon(image, name, focused) {
    const src = iconPath + name + (focused ? "-active.svg" : "-default.svg");
    if (image.getAttribute("src") !== src) image.src = src;
  }

  function updatePreview() {
    const focused = document.activeElement === input;
    const filled = input.value !== "";
    const quantity = mode === "Quantity";
    const icon = mode === "With Icon";
    const account = mode === "Account";
    const state = getState(focused, filled);
    const displayState = focused ? "Active" : filled && !icon ? "Filled" : "Default";
    const label = shape + " / " + (quantity ? "Quantity / " : "") + displayState;

    example.dataset.state = state;
    example.toggleAttribute("data-focused", focused);
    example.toggleAttribute("data-filled", filled);
    if (summary.textContent !== label) summary.textContent = label;

    setIcon(sendIcon, "send", icon && focused);
    setIcon(clearIcon, "clear", account && focused);
    clearButton.setAttribute("aria-disabled", String(!filled));
    clearButton.tabIndex = filled ? 0 : -1;

    if (quantity) {
      const shareLabel = /^0*1$/.test(input.value) ? "Share" : "Shares";
      unit.hidden = !filled;
      unit.textContent = shareLabel;
      measure.textContent = input.value;
    }

    const labels = shape === "Box"
      ? ["Height: 58px", "Font: 16px / Medium", "Radius: 8px"]
      : [quantity ? "Font: 30px / " + (filled ? "SemiBold" : "Medium") : "Font: 18px / SemiBold", "Underline: 2px"];
    if (specs.textContent !== labels.join("")) {
      specs.replaceChildren(...labels.map((labelText) => {
        const detail = document.createElement("span");
        detail.textContent = labelText;
        return detail;
      }));
    }
  }

  function selectMode(nextMode) {
    mode = nextMode;
    input.blur();
    input.value = "";
    input.placeholder = fields[mode].placeholder;
    input.setAttribute("aria-label", fields[mode].label);
    input.inputMode = shape === "Line" ? "numeric" : "text";
    example.dataset.mode = mode;
    sendIcon.hidden = mode !== "With Icon";
    clearButton.hidden = mode !== "Account";
    unit.hidden = true;
    for (const button of options.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.textContent === mode));
    }
    updatePreview();
  }

  function selectShape(nextShape) {
    shape = nextShape;
    for (const button of shapeButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.inputShape === shape));
    }

    options.replaceChildren(...modes[shape].map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ds-option";
      button.textContent = name;
      button.addEventListener("click", () => {
        if (mode !== name) selectMode(name);
      });
      return button;
    }));
    selectMode(modes[shape][0]);
  }

  for (const button of shapeButtons) {
    button.addEventListener("click", () => {
      if (shape !== button.dataset.inputShape) selectShape(button.dataset.inputShape);
    });
  }

  input.addEventListener("focus", updatePreview);
  input.addEventListener("blur", () => queueMicrotask(updatePreview));
  input.addEventListener("input", () => {
    if (mode === "Quantity") {
      const original = input.value;
      const digits = original.replace(/[^0-9]/g, "");
      if (digits !== original) {
        const offset = original.slice(0, input.selectionStart).replace(/[^0-9]/g, "").length;
        input.value = digits;
        input.setSelectionRange(offset, offset);
      }
    }
    updatePreview();
  });

  clearButton.addEventListener("pointerdown", (event) => {
    if (document.activeElement === input) event.preventDefault();
  });
  clearButton.addEventListener("click", () => {
    if (!input.value) return;
    input.value = "";
    if (document.activeElement === clearButton) input.focus();
    updatePreview();
  });

  selectShape(shape);
})();
