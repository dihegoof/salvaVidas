import {
  ProductService
} from "../../services/ProductService.js";
import {
  ProductRenderer
} from "../../ui/ProductRenderer.js";
import {
  HistoryService
} from "../../services/HistoryService.js";
import {
  AuthService
} from "../../services/AuthService.js";
import {
  FinanceModal
} from "../../ui/FinanceModal.js";
import {
  FinanceUtils
} from "../../utils/FinanceUtils.js";
import {
  ImportManager
} from "./ImportManager.js";
export class MissingProductsModal {
  static products = [];
  static open(products) {
    this.products = products;
    const container = document.getElementById("missingProductsList");
    container.innerHTML = "";
    products.forEach((product, index) => {
      container.innerHTML += `
<div class="missing-product">
  <div class="missing-product-header">
    <input type="checkbox" checked class="missing-check" data-index="${index}">
    <span>${product.name}</span>
  </div>
  <select class="missing-category" data-index="${index}">
    <option>Perecível</option>
    <option>Não perecível</option>
    <option>Limpeza</option>
    <option>Bebidas</option>
  </select>
</div>`;
    });
    this.updateCounter();
    document.querySelectorAll(".missing-check").forEach(cb => {
      cb.addEventListener("change", () => this.updateCounter());
    });
    document.getElementById("missingProductsModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("missingProductsModal").classList.add("hidden");
  }
  static updateCounter() {
    const selected = document.querySelectorAll(".missing-check:checked").length;
    document.getElementById("selectedCounter").textContent = `${selected} item(ns) selecionado(s)`;
  }
  static async createSelected() {
    const checks = document.querySelectorAll(".missing-check");
    const selects = document.querySelectorAll(".missing-category");
    const user = await AuthService.getUser();
    for (let index = 0; index < this.products.length; index++) {
      if (!checks[index].checked) continue;
      const product = this.products[index];
      await ProductService.add({
        user_id: user?.id ?? null,
        name: product.name,
        category: selects[index].value,
        quantity: product.quantity,
        is_essential: false,
        is_new: true,
        image_url: "./assets/images/default-product.png",
      });
      await HistoryService.add("criou", product.name);
    }
    await ProductRenderer.render();
    this.close();
    await ProductRenderer.render();
    this.close();
    FinanceModal.open();
    document.getElementById(
        "financeDescription"
      ).value =
      "Compra de Mercado";
    document.getElementById(
        "financeValue"
      ).value =
      FinanceUtils.formatCurrency(
        ImportManager.pendingPurchaseTotal
      );
    document.getElementById(
        "financeCategory"
      ).value =
      "Mercado";
    document.getElementById(
        "financeType"
      ).value =
      "expense";
  }
}
