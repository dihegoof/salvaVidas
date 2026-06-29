import {
  InventoryManager
} from "../modules/InventoryManager.js";
import {
  ProductRenderer
} from "./ProductRenderer.js";
export class SearchBar {
  static register() {
    document
      .getElementById("searchInput")
      .addEventListener("input", (event) => {
        InventoryManager.searchTerm = event.target.value;
        ProductRenderer.render();
      });
  }
}
