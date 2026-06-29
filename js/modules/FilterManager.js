import {
  InventoryManager
} from "./InventoryManager.js";
import {
  ProductRenderer
} from "../ui/ProductRenderer.js";
export class FilterManager {
  static register() {
    const buttons = document.querySelectorAll(".filter-btn");
    const activate = (button) => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      ProductRenderer.render();
    };
    document.getElementById("allFilter").addEventListener("click", (event) => {
      FilterManager.currentMode++;
      if (FilterManager.currentMode >= FilterManager.modes.length) {
        FilterManager.currentMode = 0;
      }
      const mode = FilterManager.modes[FilterManager.currentMode];
      InventoryManager.filter = mode;
      const labels = {
        all: "Todos",
        buy: "Comprar",
        asc: "A → Z",
        desc: "Z → A",
      };
      event.target.textContent = labels[mode];
      activate(event.target);
    });
    document
      .getElementById("essentialFilter")
      .addEventListener("click", (event) => {
        InventoryManager.filter = "essential";
        activate(event.target);
      });
    document
      .getElementById("nonEssentialFilter")
      .addEventListener("click", (event) => {
        InventoryManager.filter = "nonEssential";
        activate(event.target);
      });
  }
  static modes = ["all", "buy", "asc", "desc"];
  static currentMode = 0;
}
