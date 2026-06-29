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
  MissingProductsModal
} from "./MissingProductsModal.js";
import {
  Toast
} from "../toast/Toast.js";
import {
  LoadingManager
} from "../LoadingManager.js";
export class ImportManager {
  static pendingPurchaseTotal = 0;
  static async importFile(file) {
    LoadingManager.show("Importando produtos...");
    try {
      const content = await file.text();
      const lines = content.split("\n").filter(l => l.trim());
      const notFound = [];
      for (const line of lines) {
        const parts = line.split(";");
        if (parts.length < 2) continue;
        const name = parts[0].trim();
        const quantity = Number(parts[1]);
        const product = ProductService.getAll().find(item =>
          item.name.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
          name.toLowerCase().trim().includes(item.name.toLowerCase().trim())
        );
        if (!product) {
          notFound.push({
            name,
            quantity
          });
          continue;
        }
        await ProductService.update(product.id, {
          quantity: product.quantity + quantity
        });
      }
      await ProductRenderer.render();
      await HistoryService.add("importou arquivo", `${lines.length} linhas`);
      if (notFound.length > 0) {
        MissingProductsModal.open(notFound);
      } else {
        Toast.success("Produtos importados");
      }
    } catch {
      Toast.error("Erro ao importar arquivo");
    } finally {
      LoadingManager.hide();
    }
  }
  static async importReceipt(data) {
    LoadingManager.show("Importando nota...");
    try {
      const notFound = [];
      for (const item of data.items) {
        const product = ProductService.getAll().find(existing =>
          existing.name.toLowerCase().trim().includes(item.name.toLowerCase().trim()) ||
          item.name.toLowerCase().trim().includes(existing.name.toLowerCase().trim())
        );
        if (!product) {
          notFound.push({
            name: item.name,
            quantity: item.quantity
          });
          continue;
        }
        await ProductService.update(product.id, {
          quantity: product.quantity + item.quantity
        });
      }
      await ProductRenderer.render();
      await HistoryService.add("importou nota fiscal", `${data.items.length} itens`);
      if (notFound.length > 0) MissingProductsModal.open(notFound);
      ImportManager.pendingPurchaseTotal = data.total;
      return {
        total: data.total,
        hasMissingProducts: notFound.length > 0
      };
    } finally {
      LoadingManager.hide();
    }
  }
}
