import {
  ProductService
} from "../services/ProductService.js";
import {
  ProductCard
} from "./ProductCard.js";
import {
  InventoryManager
} from "../modules/InventoryManager.js";
export class ProductRenderer {
  static render() {
    const container = document.getElementById("productsContainer");
    const allProducts = ProductService.getAll();
    const products = InventoryManager.getFilteredProducts();
    if (!products.length) {
      container.innerHTML = `<div class="empty-state">Nenhum produto cadastrado</div>`;
      return;
    }
    container.innerHTML = products.map((p) => {
      const realIndex = allProducts.findIndex(x => x.id === p.id);
      return ProductCard.render(p, realIndex);
    }).join("");
  }
}
