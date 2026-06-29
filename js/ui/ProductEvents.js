import {
  ProductService
} from "../services/ProductService.js";
import {
  ProductRenderer
} from "./ProductRenderer.js";
import {
  ProductModal
} from "./ProductModal.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class ProductEvents {
  static register() {
    document.addEventListener("click", async (event) => {
      if (event.target.classList.contains("increase-btn")) {
        const index = Number(event.target.dataset.index);
        const product = ProductService.getAll()[index];
        if (!product) return;
        try {
          await ProductService.increase(index);
          await HistoryService.add("aumentou quantidade de", product.name);
          await ProductRenderer.render();
          Toast.success(`${product.name} aumentado`);
        } catch {
          Toast.error("Erro ao aumentar quantidade");
        }
        return;
      }
      if (event.target.classList.contains("decrease-btn")) {
        const index = Number(event.target.dataset.index);
        const product = ProductService.getAll()[index];
        if (!product) return;
        try {
          await ProductService.decrease(index);
          await HistoryService.add("diminuiu quantidade de", product.name);
          await ProductRenderer.render();
          Toast.success(`${product.name} diminuído`);
        } catch {
          Toast.error("Erro ao diminuir quantidade");
        }
        return;
      }
      if (event.target.classList.contains("delete-btn")) {
        const index = Number(event.target.dataset.index);
        const product = ProductService.getAll()[index];
        if (!product) return;
        if (!confirm("Deseja excluir este produto?")) return;
        try {
          await HistoryService.add("excluiu produto", product.name);
          await ProductService.remove(index);
          ProductModal.clear();
          await ProductRenderer.render();
          Toast.success(`${product.name} excluído`);
        } catch {
          Toast.error("Erro ao excluir produto");
        }
        return;
      }
      const infoBtn = event.target.closest(".stock-info-btn");
      if (infoBtn) {
        event.stopPropagation();
        const index = Number(infoBtn.dataset.index);
        const product = ProductService.getAll()[index];
        if (product) Toast.info(ProductEvents._outOfStockMsg(product));
        return;
      }
      const card = event.target.closest(".open-product");
      if (card) {
        ProductModal.openEdit(Number(card.dataset.index));
        return;
      }
    });
  }
  static _outOfStockMsg(product) {
    if (!product.outOfStockSince) return "Produto em estoque";
    const diff = Date.now() - new Date(product.outOfStockSince);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(diff / 2592000000);
    const years = Math.floor(diff / 31536000000);
    if (minutes < 60) return "Em falta há poucos minutos";
    if (hours < 24) return `Em falta há ${hours}h`;
    if (days < 30) return `Em falta há ${days} dia(s)`;
    if (months < 12) return `Em falta há ${months} mês(es)`;
    return `Em falta há ${years} ano(s)`;
  }
}
