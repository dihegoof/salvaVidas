import {
  StorageHelper
} from "../utils/StorageHelper.js";
import {
  ProductModal
} from "../ui/ProductModal.js";
import {
  ProductEvents
} from "../ui/ProductEvents.js";
import {
  SearchBar
} from "../ui/SearchBar.js";
import {
  FilterManager
} from "../modules/FilterManager.js";
import {
  ProductRenderer
} from "../ui/ProductRenderer.js";
import {
  ProductService
} from "../services/ProductService.js";
import {
  NavigationManager
} from "../modules/navigation/NavigationManager.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  HistoryRenderer
} from "../ui/history/HistoryRenderer.js";
import {
  ExportManager
} from "../modules/export/ExportManager.js";
import {
  ImportManager
} from "../modules/import/ImportManager.js";
import {
  MissingProductsModal
} from "../modules/import/MissingProductsModal.js";
import {
  Toast
} from "../modules/toast/Toast.js";
import {
  LoadingManager
} from "../modules/LoadingManager.js";
import {
  AdminPanel
} from "../admin/AdminPanel.js";
import {
  FinanceRenderer
} from "../ui/FinanceRenderer.js";
import {
  FinanceService
} from "../services/FinanceService.js";
import {
  DebtService
} from "../services/DebtService.js";
import {
  FinanceModal
} from "../ui/FinanceModal.js";
import {
  FinanceEvents
} from "../ui/FinanceEvents.js";
import {
  FinanceFilterRenderer
} from "../ui/FinanceFilterRenderer.js";
import {
  DebtRenderer
} from "../ui/DebtRenderer.js";
import {
  FinanceUtils
} from "../utils/FinanceUtils.js";
import {
  AuthService
} from "../services/AuthService.js";
import {
  RealtimeService
} from "../services/RealtimeService.js";
import {
  PurchaseImportModal
} from "../ui/PurchaseImportModal.js";
import {
  ReceiptParserService
} from "../services/ReceiptParserService.js";
import {
  ReceiptOCRService
} from "../services/ReceiptOCRService.js";
import {
  ReceiptAIService
} from "../services/ReceiptAIService.js";
import {
  WardrobeModal
} from "../ui/wardrobe/WardrobeModal.js";
import {
  WardrobeSupabaseService
} from "../services/WardrobeSupabaseService.js";
import {
  WardrobeManager
} from "../modules/wardrobe/WardrobeManager.js";
import {
  WardrobeScreenManager
} from "../modules/wardrobe/WardrobeScreenManager.js";
import {
  WardrobeRenderer
} from "../ui/wardrobe/WardrobeRenderer.js";
import {
  WardrobeItemLooksModal
} from "../ui/wardrobe/WardrobeItemLooksModal.js";
export class App {
  static async init() {
    LoadingManager.show("Iniciando...");
    try {
      const user = await AuthService.getUser();
      const profile = await AuthService.getProfile();
      const displayName = profile?.name || StorageHelper.getUserName() || "Usuário";
      StorageHelper.saveUserName(displayName);
      AdminPanel.init();
      LoadingManager.show("Carregando dados...");
      await Promise.all([
        ProductService.loadAll(),
        FinanceService.loadAll(),
        DebtService.loadAll(),
        HistoryService.loadAll(),
      ]);
      ProductEvents.register();
      SearchBar.register();
      FilterManager.register();
      ProductRenderer.render();
      NavigationManager.register();
      await FinanceFilterRenderer.render();
      await FinanceRenderer.render();
      await FinanceEvents.register();
      DebtRenderer.render();
      FinanceUtils.registerCurrencyMask("financeValue");
      FinanceUtils.registerCurrencyMask("cardLimit");
      FinanceUtils.registerCurrencyMask("debtValue");
      FinanceUtils.registerCurrencyMask("editDebtValue");
      FinanceUtils.registerCurrencyMask("editCardLimit");
      RealtimeService.subscribe("products", (payload) => {
        ProductService.applyRealtimeEvent(payload);
        ProductRenderer.render();
      });
      RealtimeService.subscribe("finances", (payload) => {
        FinanceService.applyRealtimeEvent(payload);
        FinanceRenderer.render();
      });
      RealtimeService.subscribe("debts", (payload) => {
        DebtService.applyRealtimeEvent(payload);
        DebtRenderer.render();
      });
      RealtimeService.subscribe("history", (payload) => {
        HistoryService.applyRealtimeEvent(payload);
        if (!document.getElementById("historyScreen").classList.contains("hidden")) {
          HistoryRenderer.render();
        }
      });

      RealtimeService.subscribe("wardrobe_items", (payload) => {
        const ev = payload.eventType;
        const item = payload.new || payload.old;
        if (!item) return;
        const norm = r => WardrobeSupabaseService._normalize(r);
        if (ev === "INSERT") {
          if (!WardrobeManager.getById(item.id)) {
            WardrobeManager._items.unshift(norm(item));
          }
        } else if (ev === "UPDATE") {
          const idx = WardrobeManager._items.findIndex(i => i.id === item.id);
          if (idx !== -1) WardrobeManager._items[idx] = norm(item);
        } else if (ev === "DELETE") {
          WardrobeManager._items = WardrobeManager._items.filter(i => i.id !== item.id);
        }
        const armario = document.getElementById("wardrobeArmario");
        if (armario && !armario.classList.contains("hidden")) WardrobeRenderer.renderArmario();
        const stats = document.getElementById("wardrobeStats");
        if (stats && !stats.classList.contains("hidden")) WardrobeRenderer.renderStats();
      });

      RealtimeService.subscribe("wardrobe_looks", (payload) => {
        const ev = payload.eventType;
        const look = payload.new || payload.old;
        if (!look) return;
        if (ev === "INSERT") {
          if (!WardrobeManager._looks.find(l => l.id === look.id)) {
            WardrobeManager._looks.unshift(look);
          }
        } else if (ev === "DELETE") {
          WardrobeManager._looks = WardrobeManager._looks.filter(l => l.id !== look.id);
        }
      });
      this._bindButtons();
      this.openApp(displayName);
    } catch (err) {
      console.error("Erro ao iniciar app:", err);
      Toast.error("Erro ao carregar o app");
    } finally {
      LoadingManager.forceHide();
    }
  }
  static _bindButtons() {
    document.getElementById("addProductBtn")?.addEventListener("click", () => {
      ProductModal.open();
      ProductModal.clear();
    });
    document.getElementById("cancelProductBtn")?.addEventListener("click", () => ProductModal.close());
    document.getElementById("saveProductBtn")?.addEventListener("click", () => ProductModal.save());
    document.getElementById("deleteProductBtn")?.addEventListener("click", async () => {
      const confirmed = confirm("Deseja excluir este produto?");
      if (!confirmed) return;
      try {
        const p = ProductService.getAll()[ProductService.editingIndex];
        await ProductService.remove(ProductService.editingIndex);
        if (p) await HistoryService.add("excluiu produto", p.name);
        ProductRenderer.render();
        ProductModal.clear();
        ProductModal.close();
        Toast.success("Produto excluído");
      } catch {
        Toast.error("Erro ao excluir produto");
      }
    });
    document.getElementById("clearHistoryBtn")?.addEventListener("click", async () => {
      if (!confirm("Deseja apagar todo o histórico?")) return;
      LoadingManager.show("Limpando histórico...");
      try {
        await HistoryService.clear();
        HistoryRenderer.render();
        Toast.success("Histórico limpo");
      } catch (err) {
        console.error("clearHistory error:", err);
        Toast.error("Erro ao limpar histórico");
      } finally {
        LoadingManager.hide();
      }
    });
    document.getElementById("exportListBtn")?.addEventListener("click", () => ExportManager.export());
    document.getElementById("importListBtn")?.addEventListener("click", () => PurchaseImportModal.open());
    document.getElementById("cancelPurchaseImportBtn")?.addEventListener("click", () => PurchaseImportModal.close());
    document.getElementById("importFileInput")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) ImportManager.importFile(file);
    });
    document.getElementById("ignoreMissingBtn")?.addEventListener("click", () => MissingProductsModal.close());
    document.getElementById("createMissingBtn")?.addEventListener("click", () => MissingProductsModal.createSelected());
    document.getElementById("addFinanceBtn")?.addEventListener("click", () => FinanceModal.open());
    document.getElementById("cancelFinanceBtn")?.addEventListener("click", () => FinanceModal.close());
    document.getElementById("saveFinanceBtn")?.addEventListener("click", () => FinanceModal.save());
    document.getElementById("wmCancelBtn")?.addEventListener("click", () => WardrobeModal.close());
    document.getElementById("wmSaveBtn")?.addEventListener("click", () => WardrobeModal.save());
    document.getElementById("wmDeleteBtn")?.addEventListener("click", () => WardrobeModal.remove());
    document.getElementById("wmLooksBtn")?.addEventListener("click", () => WardrobeItemLooksModal.open(WardrobeModal._editingId));
    document.getElementById("wmAnalyzeBtn")?.addEventListener("click", () => WardrobeModal.analyze());
    document.getElementById("wmImageFile")?.addEventListener("change", (e) => WardrobeModal.onImageChange(e.target.files[0]));
    document.getElementById("processPurchaseBtn")?.addEventListener("click", async () => {
      const btn = document.getElementById("processPurchaseBtn");
      btn.disabled = true;
      btn.textContent = "Carregando...";
      try {
        let text = document.getElementById("receiptText").value.trim();
        const file = document.getElementById("receiptImage").files[0];
        if (!text && !file) {
          Toast.warning("Cole uma nota ou selecione uma foto");
          return;
        }
        if (!text && file) text = await ReceiptOCRService.extractText(file);
        if (!text) {
          Toast.error("Não foi possível ler a nota");
          return;
        }
        const receiptData = await ReceiptAIService.parse(text);
        if (!receiptData) {
          Toast.error("Erro ao interpretar nota");
          return;
        }
        if (!receiptData.items.length) {
          Toast.error("Nenhum produto identificado na nota");
          return;
        }
        btn.textContent = "Importando...";
        const importResult = await ImportManager.importReceipt(receiptData);
        PurchaseImportModal.close();
        document.getElementById("receiptText").value = "";
        document.getElementById("receiptImage").value = "";
        if (!importResult.hasMissingProducts) {
          FinanceModal.open();
          document.getElementById("financeDescription").value = "Compra de Mercado";
          document.getElementById("financeValue").value = FinanceUtils.formatCurrency(importResult.total);
          document.getElementById("financeCategory").value = "Mercado";
          document.getElementById("financeType").value = "expense";
        }
      } catch (err) {
        console.error(err);
        Toast.error("Erro ao processar nota");
      } finally {
        btn.disabled = false;
        btn.textContent = "Processar Compra";
      }
    });
    document.getElementById("productImage")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const preview = document.getElementById("productImagePreview");
      if (!preview) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
  static openApp(name) {
    document.getElementById("appScreen")?.classList.remove("hidden");
    document.getElementById("authScreen")?.classList.add("hidden");
    const el = document.getElementById("welcomeText");
    if (el) el.textContent = "Olá, " + name.split(" ")[0];
  }
}
