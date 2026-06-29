import {
  InventoryManager
} from "../InventoryManager.js";
import {
  Toast
} from "../toast/Toast.js";
import {
  HistoryService
} from "../../services/HistoryService.js";
export class ExportManager {
  static async export () {
    const products = InventoryManager.getFilteredProducts();
    if (!products.length) {
      Toast.warning("Nenhum item para exportar");
      return;
    }
    let text = "LISTA DE COMPRAS\n\n";
    products.forEach(product => {
      text += `[ ] ${product.name}\n`;
    });
    try {
      await navigator.clipboard.writeText(text);
      await HistoryService.add("exportou lista", `${products.length} itens`);
      Toast.success("Lista copiada");
    } catch {
      Toast.error("Erro ao copiar lista");
    }
  }
}
