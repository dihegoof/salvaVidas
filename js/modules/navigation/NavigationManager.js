import {
  HistoryRenderer
} from "../../ui/history/HistoryRenderer.js";
import {
  WardrobeScreenManager
} from "../wardrobe/WardrobeScreenManager.js";
export class NavigationManager {
  static _ALL_SCREENS = [
    "inventoryScreen",
    "historyScreen",
    "financeScreen",
    "wardrobeScreen",
  ];
  static show(screenId) {
    this._ALL_SCREENS.forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });
    document.getElementById(screenId)?.classList.remove("hidden");
  }
  static register() {
    const inventoryTab = document.getElementById("inventoryTab");
    const historyTab = document.getElementById("historyTab");
    const financeTab = document.getElementById("financeTab");
    const wardrobeTab = document.getElementById("wardrobeTab");
    const allTabs = [inventoryTab, historyTab, financeTab, wardrobeTab].filter(Boolean);
    const activate = (tab) => {
      allTabs.forEach(t => t?.classList.remove("active"));
      tab?.classList.add("active");
    };
    inventoryTab?.addEventListener("click", () => {
      activate(inventoryTab);
      this.show("inventoryScreen");
    });
    historyTab?.addEventListener("click", () => {
      activate(historyTab);
      this.show("historyScreen");
      HistoryRenderer.render();
    });
    financeTab?.addEventListener("click", () => {
      activate(financeTab);
      this.show("financeScreen");
    });
    wardrobeTab?.addEventListener("click", () => {
      activate(wardrobeTab);
      this.show("wardrobeScreen");
      WardrobeScreenManager.open();
    });
  }
}
